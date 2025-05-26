'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { FILE_UPLOAD } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

// Document schemas
const uploadDocumentSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['dbs_certificate', 'receipt', 'agreement', 'report', 'other']),
  linkedRecordType: z.enum(['safeguarding', 'overseas', 'income']).optional(),
  linkedRecordId: z.string().uuid().optional(),
})

const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['dbs_certificate', 'receipt', 'agreement', 'report', 'other']).optional(),
})

export type UploadDocument = z.infer<typeof uploadDocumentSchema>
export type UpdateDocument = z.infer<typeof updateDocumentSchema>

interface DocumentRecord {
  id: string
  organization_id: string
  name: string
  type: string
  size: number
  mime_type: string
  storage_path: string
  linked_record_type?: string
  linked_record_id?: string
  uploaded_by: string
  created_at: string
}

/**
 * Upload a document to storage
 */
export async function uploadDocument(
  organizationId: string,
  file: File,
  metadata: UploadDocument
): Promise<{ data?: DocumentRecord; error?: string }> {
  try {
    // Validate file
    if (file.size > FILE_UPLOAD.maxSize) {
      return { error: `File size exceeds ${FILE_UPLOAD.maxSize / 1024 / 1024}MB limit` }
    }

    if (!FILE_UPLOAD.allowedTypes.includes(file.type)) {
      return { error: 'File type not allowed' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${organizationId}/${timestamp}_${safeName}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload file' }
    }

    // Create database record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        organization_id: organizationId,
        name: metadata.name,
        type: metadata.type,
        size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        linked_record_type: metadata.linkedRecordType,
        linked_record_id: metadata.linkedRecordId,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      // Clean up storage if database insert fails
      await supabase.storage.from('documents').remove([storagePath])
      return { error: 'Failed to save document record' }
    }

    // Update linked record if provided
    if (metadata.linkedRecordType && metadata.linkedRecordId) {
      await linkDocumentToRecord(
        metadata.linkedRecordType,
        metadata.linkedRecordId,
        document.id
      )
    }

    revalidatePath('/documents')
    return { data: document }
  } catch (error) {
    console.error('Document upload error:', error)
    return { error: 'Failed to upload document' }
  }
}

/**
 * Get documents for an organization
 */
export async function getDocuments(
  organizationId: string,
  filters?: {
    type?: string
    linkedRecordType?: string
    linkedRecordId?: string
    search?: string
    page?: number
    pageSize?: number
  }
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('documents')
    .select('*, uploaded_by_user:users!uploaded_by(*)', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.linkedRecordType) {
    query = query.eq('linked_record_type', filters.linkedRecordType)
  }

  if (filters?.linkedRecordId) {
    query = query.eq('linked_record_id', filters.linkedRecordId)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  // Apply pagination
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

/**
 * Get a signed URL for document download
 */
export async function getDocumentUrl(documentId: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  // Get document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('storage_path, organization_id')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    return { error: 'Document not found' }
  }

  // Verify user has access to this organization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', document.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { error: 'Access denied' }
  }

  // Generate signed URL (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.storage_path, 3600)

  if (error) {
    return { error: 'Failed to generate download URL' }
  }

  return { url: data.signedUrl }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  data: UpdateDocument
): Promise<{ data?: DocumentRecord; error?: string }> {
  const validatedFields = updateDocumentSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid document data' }
  }

  const supabase = await createClient()

  const { data: document, error } = await supabase
    .from('documents')
    .update(validatedFields.data)
    .eq('id', documentId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/documents')
  return { data: document }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  // Get document to find storage path
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', documentId)
    .single()

  if (docError) {
    return { error: 'Document not found' }
  }

  // Soft delete from database
  const { error: deleteError } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  // Remove from storage
  await supabase.storage
    .from('documents')
    .remove([document.storage_path])

  revalidatePath('/documents')
  return { success: true }
}

/**
 * Link a document to a compliance record
 */
async function linkDocumentToRecord(
  recordType: string,
  recordId: string,
  documentId: string
) {
  const supabase = await createClient()

  // Update the appropriate record with the document ID
  switch (recordType) {
    case 'safeguarding':
      await supabase
        .from('safeguarding_records')
        .update({ certificate_document_id: documentId })
        .eq('id', recordId)
      break
    
    case 'overseas':
      await supabase
        .from('overseas_activities')
        .update({ receipt_document_id: documentId })
        .eq('id', recordId)
      break
    
    case 'income':
      await supabase
        .from('income_records')
        .update({ receipt_document_id: documentId })
        .eq('id', recordId)
      break
  }
}

/**
 * Get storage usage for an organization
 */
export async function getStorageUsage(organizationId: string): Promise<{
  used: number
  limit: number
  percentage: number
}> {
  const supabase = await createClient()

  // Get all documents for the organization
  const { data: documents } = await supabase
    .from('documents')
    .select('size')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  const used = documents?.reduce((sum, doc) => sum + (doc.size || 0), 0) || 0

  // Get subscription tier to determine limit
  const { data: org } = await supabase
    .from('organizations')
    .select('subscription:subscriptions(tier)')
    .eq('id', organizationId)
    .single()

  const tier = org?.subscription?.tier || 'essentials'
  const limit = tier === 'premium' ? 50 * 1024 * 1024 * 1024 : 
                tier === 'standard' ? 5 * 1024 * 1024 * 1024 : 
                1024 * 1024 * 1024

  return {
    used,
    limit,
    percentage: Math.round((used / limit) * 100)
  }
}