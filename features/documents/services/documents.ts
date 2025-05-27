'use server'

import { createClient, getCurrentUserOrganization } from '@/lib/supabase/server'
import type { 
  Document, 
  DocumentStats, 
  CreateDocumentInput, 
  UpdateDocumentInput,
  DocumentFilters 
} from '../types/documents'

export async function getDocuments(filters?: DocumentFilters): Promise<Document[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.document_type && filters.document_type !== 'all') {
    query = query.eq('document_type', filters.document_type)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(`file_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.expired) {
    query = query.lt('expires_at', new Date().toISOString())
  }

  if (filters?.expires_within_days) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + filters.expires_within_days)
    query = query
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', futureDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching documents:', error)
    throw new Error('Failed to fetch documents')
  }

  return data || []
}

export async function getDocument(id: string): Promise<Document | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching document:', error)
    return null
  }

  return data
}

export async function getDocumentStats(): Promise<DocumentStats> {
  const supabase = await createClient()
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select('document_type, file_size, expires_at, category')

  if (error) {
    console.error('Error fetching document stats:', error)
    return {
      totalDocuments: 0,
      expiringSoon: 0,
      totalSizeBytes: 0,
      categoriesCount: 0,
      documentsByType: {}
    }
  }

  const totalDocuments = documents?.length || 0
  const totalSizeBytes = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0
  
  // Count documents expiring in next 30 days
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  const expiringSoon = documents?.filter(doc => 
    doc.expires_at && 
    new Date(doc.expires_at) <= thirtyDaysFromNow &&
    new Date(doc.expires_at) > new Date()
  ).length || 0

  // Count unique categories
  const categories = new Set(documents?.map(doc => doc.category).filter(Boolean))
  const categoriesCount = categories.size

  // Count by type
  const documentsByType = documents?.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    totalDocuments,
    expiringSoon,
    totalSizeBytes,
    categoriesCount,
    documentsByType
  }
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const supabase = await createClient()
  
  // Get current user's organization
  const { organizationId } = await getCurrentUserOrganization()
  
  const insertData = {
    organization_id: organizationId,
    file_name: input.file_name,
    file_size: input.file_size,
    mime_type: input.mime_type,
    storage_path: input.storage_path,
    document_type: input.document_type,
    category: input.category || null,
    description: input.description || null,
    tags: input.tags || null,
    expires_at: input.expires_at || null,
    is_public: input.is_public ?? false,
    metadata: input.metadata || null,
    extracted_data: input.extracted_data || null
  }
  
  const { data, error } = await supabase
    .from('documents')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw new Error('Failed to create document record')
  }

  return data
}

export async function updateDocument(input: UpdateDocumentInput): Promise<Document> {
  const supabase = await createClient()
  
  const { id, ...updates } = input
  
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating document:', error)
    throw new Error('Failed to update document')
  }

  return data
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = await createClient()
  
  // First get the document to get the storage path
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError || !document) {
    throw new Error('Document not found')
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([document.storage_path])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // Continue with database deletion even if storage deletion fails
  }

  // Delete from database
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting document:', error)
    throw new Error('Failed to delete document')
  }
}

export async function getDocumentDownloadUrl(storagePath: string): Promise<string> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry

  if (error) {
    console.error('Error creating download URL:', error)
    throw new Error('Failed to create download URL')
  }

  return data.signedUrl
}