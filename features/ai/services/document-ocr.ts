import { openrouter, AI_MODELS, callOpenRouter } from '@/lib/ai/openrouter'
import { EXTRACTION_PROMPTS, CONFIDENCE_THRESHOLDS } from '@/lib/ai/prompts'
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
    // Get appropriate prompt based on document type
    const prompt = getOCRPrompt(documentType)
    
    if (!prompt) {
      return {
        success: false,
        confidence: 0,
        error: 'Unknown document type',
        requires_review: true
      }
    }

    // Call AI with vision capabilities
    const response = await callOpenRouter(async () => {
      return await openrouter.chat.completions.create({
        model: AI_MODELS.VISION,
        messages: [
          {
            role: 'system',
            content: 'You are an OCR specialist that extracts structured data from documents. Return valid JSON only.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1000
      })
    })

    const extractedText = response.choices[0]?.message?.content
    if (!extractedText) {
      throw new Error('No response from AI')
    }

    const extracted = JSON.parse(extractedText)
    
    // Validate and parse based on type
    let validatedData: any
    let confidence = extracted.confidence || 0

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

// Get OCR prompt based on document type
function getOCRPrompt(documentType: string): string | null {
  switch (documentType) {
    case 'dbs_certificate':
      return EXTRACTION_PROMPTS.DBS_CERTIFICATE
    case 'receipt':
    case 'expense':
      return EXTRACTION_PROMPTS.RECEIPT
    case 'donation_letter':
      return EXTRACTION_PROMPTS.EMAIL_DONATION
    case 'bank_statement':
      return `Extract transaction information from this bank statement:

Look for:
- Account holder name
- Account number (partially masked is fine)
- Statement period (from and to dates)
- Opening balance
- Closing balance
- List of transactions with:
  - Date
  - Description
  - Amount (debit/credit)
  - Balance

Return as JSON with these fields:
{
  "account_holder": "string",
  "account_number": "string (masked)",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "opening_balance": number,
  "closing_balance": number,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "type": "debit" | "credit",
      "balance": number
    }
  ],
  "confidence": 0.0-1.0
}`
    default:
      return `Extract all text and structured data from this document.

Identify:
1. Document type
2. Key information fields
3. Dates, amounts, names, reference numbers

Return as JSON with extracted fields and confidence scores.`
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