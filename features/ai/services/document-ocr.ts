import { CONFIDENCE_THRESHOLDS } from '@/lib/ai/prompts'
import type { 
  ExtractionResult,
  DBSExtraction,
  ReceiptExtraction,
  DBSExtractionSchema,
  ReceiptExtractionSchema
} from '../types/extraction'

export async function extractFromImage(
  imageUrl: string,
  documentType: string
): Promise<ExtractionResult> {
  try {
    // Call our secure API endpoint
    const response = await fetch('/api/ai/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        documentType
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'OCR extraction failed')
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Extraction failed')
    }

    const extracted = result.data
    const confidence = result.confidence || 0
    
    // Validate and parse based on type
    let validatedData: any

    switch (documentType) {
      case 'dbs_certificate':
        validatedData = DBSExtractionSchema.parse(extracted)
        break
      case 'receipt':
      case 'expense':
        validatedData = ReceiptExtractionSchema.parse(extracted)
        break
      default:
        validatedData = extracted
    }

    // Include field-level confidence if available
    const fields = Object.entries(validatedData).map(([key, value]) => ({
      field_name: key,
      value,
      confidence: extracted[`${key}_confidence`] || confidence,
      location: extracted[`${key}_location`]
    }))

    return {
      success: true,
      data: validatedData,
      confidence,
      fields,
      requires_review: confidence < CONFIDENCE_THRESHOLDS.HIGH
    }

  } catch (error) {
    console.error('OCR extraction error:', error)
    return {
      success: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Extraction failed',
      requires_review: true
    }
  }
}


// Extract from multiple pages
export async function extractFromMultipleImages(
  imageUrls: string[],
  documentType: string
): Promise<ExtractionResult[]> {
  const results = await Promise.all(
    imageUrls.map(url => extractFromImage(url, documentType))
  )
  
  return results
}

// Merge extraction results from multiple pages
export function mergeExtractionResults(
  results: ExtractionResult[]
): ExtractionResult {
  if (results.length === 0) {
    return {
      success: false,
      confidence: 0,
      error: 'No results to merge',
      requires_review: true
    }
  }
  
  if (results.length === 1) {
    return results[0]
  }
  
  // Combine data from multiple pages
  const mergedData: any = {}
  const allFields: any[] = []
  let totalConfidence = 0
  let successCount = 0
  
  for (const result of results) {
    if (result.success && result.data) {
      successCount++
      totalConfidence += result.confidence
      
      // Merge data fields
      Object.assign(mergedData, result.data)
      
      // Collect all fields
      if (result.fields) {
        allFields.push(...result.fields)
      }
    }
  }
  
  if (successCount === 0) {
    return {
      success: false,
      confidence: 0,
      error: 'All extractions failed',
      requires_review: true
    }
  }
  
  const avgConfidence = totalConfidence / successCount
  
  return {
    success: true,
    data: mergedData,
    confidence: avgConfidence,
    fields: allFields,
    requires_review: avgConfidence < CONFIDENCE_THRESHOLDS.HIGH
  }
}

// Validate extracted data
export function validateExtraction(
  data: any,
  documentType: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  switch (documentType) {
    case 'dbs_certificate':
      if (!data.person_name) errors.push('Missing person name')
      if (!data.dbs_certificate_number) errors.push('Missing DBS number')
      if (data.dbs_certificate_number && !/^\d{12}$/.test(data.dbs_certificate_number)) {
        errors.push('DBS number must be 12 digits')
      }
      if (!data.issue_date) errors.push('Missing issue date')
      break
      
    case 'receipt':
    case 'expense':
      if (!data.vendor_name) errors.push('Missing vendor name')
      if (!data.amount || data.amount <= 0) errors.push('Invalid amount')
      if (!data.transaction_date) errors.push('Missing transaction date')
      break
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}