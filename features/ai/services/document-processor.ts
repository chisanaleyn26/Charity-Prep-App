'use server'

import { createClient } from '@/lib/supabase/server'
import { createAITask } from './task-queue'
import type { DocumentProcessingRequest, DocumentProcessingResult } from '../types/extraction'

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', ...SUPPORTED_IMAGE_TYPES]

export async function processDocument(
  file: File,
  documentType?: string
): Promise<DocumentProcessingResult> {
  const supabase = await createClient()
  
  // Validate file type
  if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      request_id: '',
      status: 'failed',
      extractions: [],
      processing_time_ms: 0,
      error: `Unsupported file type: ${file.type}`
    }
  }
  
  try {
    // Upload file to storage
    const timestamp = Date.now()
    const fileName = `temp/${timestamp}-${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })
      
    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)
      
    // Create processing request
    const request: DocumentProcessingRequest = {
      id: crypto.randomUUID(),
      file_url: publicUrl,
      file_type: getFileType(file.type),
      document_type: documentType as any,
      metadata: {
        original_name: file.name,
        size: file.size,
        mime_type: file.type
      }
    }
    
    // Create AI task
    const aiTask = await createAITask('document_ocr', {
      request,
      storage_path: fileName
    })
    
    // For images, we can process immediately
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      // Process with OCR service
      const result = await processImageOCR(request)
      
      // Clean up temp file
      await supabase.storage
        .from('documents')
        .remove([fileName])
        
      return result
    }
    
    // For PDFs, return pending status
    return {
      request_id: request.id,
      status: 'success',
      extractions: [{
        success: false,
        confidence: 0,
        error: 'PDF processing queued',
        requires_review: true
      }],
      processing_time_ms: 0
    }
    
  } catch (error) {
    console.error('Document processing error:', error)
    return {
      request_id: '',
      status: 'failed',
      extractions: [],
      processing_time_ms: 0,
      error: error instanceof Error ? error.message : 'Processing failed'
    }
  }
}

// Process image with OCR
async function processImageOCR(
  request: DocumentProcessingRequest
): Promise<DocumentProcessingResult> {
  const startTime = Date.now()
  
  try {
    // Import OCR service dynamically to avoid circular dependencies
    const { extractFromImage } = await import('./ocr-service')
    
    const extraction = await extractFromImage(
      request.file_url,
      request.document_type || 'other'
    )
    
    return {
      request_id: request.id,
      status: extraction.success ? 'success' : 'partial',
      extractions: [extraction],
      processing_time_ms: Date.now() - startTime
    }
    
  } catch (error) {
    return {
      request_id: request.id,
      status: 'failed',
      extractions: [],
      processing_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'OCR failed'
    }
  }
}

// Convert PDF to images for OCR
export async function convertPDFToImages(
  pdfUrl: string
): Promise<string[]> {
  // In a real implementation, this would:
  // 1. Use a PDF processing library (pdf.js, pdfjs-dist)
  // 2. Extract each page as an image
  // 3. Upload images to storage
  // 4. Return URLs for processing
  
  // For now, return empty array
  return []
}

// Get file type category
function getFileType(mimeType: string): 'pdf' | 'image' | 'email' | 'csv' {
  if (mimeType === 'application/pdf') return 'pdf'
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return 'image'
  if (mimeType.includes('text/csv')) return 'csv'
  return 'image' // default
}

// Process multiple documents
export async function processDocumentBatch(
  files: File[]
): Promise<DocumentProcessingResult[]> {
  const results = await Promise.all(
    files.map(file => processDocument(file))
  )
  
  return results
}

// Get document processing status
export async function getDocumentStatus(
  requestId: string
): Promise<DocumentProcessingResult | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ai_tasks')
    .select('*')
    .eq('input_data->>request_id', requestId)
    .single()
    
  if (error || !data) {
    return null
  }
  
  if (data.status === 'completed' && data.output_data) {
    return data.output_data as DocumentProcessingResult
  }
  
  return {
    request_id: requestId,
    status: data.status === 'failed' ? 'failed' : 'success',
    extractions: [],
    processing_time_ms: 0,
    error: data.error_message
  }
}