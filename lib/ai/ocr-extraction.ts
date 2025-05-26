'use server'

import { AIService } from './service'
import { AI_CONFIG } from './config'

export interface ExtractedData {
  documentType: 'dbs_certificate' | 'receipt' | 'donation_letter' | 'unknown'
  confidence: number
  extractedFields: Record<string, any>
  rawText?: string
}

/**
 * Extract data from document images using GPT-4 Vision
 */
export async function extractDocumentData(
  imageBase64: string,
  documentHint?: string
): Promise<{ data?: ExtractedData; error?: string }> {
  const ai = AIService.getInstance()
  
  const prompt = `Extract all relevant information from this document image.
${documentHint ? `Document type hint: ${documentHint}` : ''}

For DBS certificates, extract:
- Person's name
- Certificate number
- Issue date
- Certificate type (Basic/Standard/Enhanced)
- Any visible expiry information

For receipts/invoices, extract:
- Amount
- Date
- Vendor/recipient
- Description
- Currency
- Reference numbers

For donation letters, extract:
- Donor name
- Amount
- Date
- Purpose/restrictions
- Gift Aid declaration

Return a JSON object with:
{
  "documentType": "detected type",
  "confidence": 0.0-1.0,
  "extractedFields": {
    // relevant fields based on document type
  },
  "rawText": "any additional text found"
}`

  const response = await ai.processImage(imageBase64, prompt)
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to extract document data' }
  }
  
  // Validate and normalize the response
  const extracted = response.data as ExtractedData
  
  // Ensure confidence is between 0 and 1
  if (extracted.confidence) {
    extracted.confidence = Math.max(0, Math.min(1, extracted.confidence))
  } else {
    extracted.confidence = 0.5 // Default medium confidence
  }
  
  return { data: extracted }
}

/**
 * Extract specific fields from a DBS certificate
 */
export async function extractDBSCertificate(
  imageBase64: string
): Promise<{ 
  data?: {
    personName?: string
    certificateNumber?: string
    issueDate?: string
    checkType?: string
    confidence: number
  }
  error?: string 
}> {
  const result = await extractDocumentData(imageBase64, 'DBS Certificate')
  
  if (!result.data) {
    return { error: result.error }
  }
  
  const fields = result.data.extractedFields
  
  return {
    data: {
      personName: fields.personName || fields.name || fields.fullName,
      certificateNumber: fields.certificateNumber || fields.dbsNumber || fields.number,
      issueDate: fields.issueDate || fields.dateIssued || fields.date,
      checkType: normalizeDBSCheckType(fields.checkType || fields.level || fields.type),
      confidence: result.data.confidence
    }
  }
}

/**
 * Extract receipt/invoice data
 */
export async function extractReceipt(
  imageBase64: string
): Promise<{
  data?: {
    amount?: number
    currency?: string
    date?: string
    vendor?: string
    description?: string
    reference?: string
    confidence: number
  }
  error?: string
}> {
  const result = await extractDocumentData(imageBase64, 'Receipt or Invoice')
  
  if (!result.data) {
    return { error: result.error }
  }
  
  const fields = result.data.extractedFields
  
  // Try to parse amount
  let amount: number | undefined
  const amountStr = fields.amount || fields.total || fields.grandTotal
  if (amountStr) {
    amount = parseFloat(String(amountStr).replace(/[£$€,]/g, ''))
  }
  
  return {
    data: {
      amount,
      currency: fields.currency || detectCurrency(amountStr),
      date: fields.date || fields.invoiceDate || fields.receiptDate,
      vendor: fields.vendor || fields.from || fields.recipient,
      description: fields.description || fields.purpose || fields.items,
      reference: fields.reference || fields.invoiceNumber || fields.receiptNumber,
      confidence: result.data.confidence
    }
  }
}

/**
 * Batch process multiple images
 */
export async function batchExtractDocuments(
  images: Array<{ id: string; base64: string; hint?: string }>
): Promise<Array<{ id: string; result: { data?: ExtractedData; error?: string } }>> {
  const results = await Promise.all(
    images.map(async (image) => ({
      id: image.id,
      result: await extractDocumentData(image.base64, image.hint)
    }))
  )
  
  return results
}

/**
 * Helper functions
 */
function normalizeDBSCheckType(type?: string): string | undefined {
  if (!type) return undefined
  
  const normalized = type.toLowerCase().trim()
  
  if (normalized.includes('basic')) return 'basic'
  if (normalized.includes('standard')) return 'standard'
  if (normalized.includes('enhanced') && normalized.includes('barred')) return 'enhanced_barred'
  if (normalized.includes('enhanced')) return 'enhanced'
  
  return type // Return original if no match
}

function detectCurrency(amountStr?: string): string {
  if (!amountStr) return 'GBP'
  
  if (amountStr.includes('£')) return 'GBP'
  if (amountStr.includes('$')) return 'USD'
  if (amountStr.includes('€')) return 'EUR'
  
  return 'GBP' // Default to GBP for UK charity
}