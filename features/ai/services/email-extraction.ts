import { openrouter, AI_MODELS, callOpenRouter } from '@/lib/ai/openrouter'
import { EXTRACTION_PROMPTS, CONFIDENCE_THRESHOLDS } from '@/lib/ai/prompts'
import type { IncomingEmail } from './email-processor'
import type { 
  ExtractionResult,
  DBSExtraction,
  DonationExtraction,
  ReceiptExtraction,
  OverseasTransferExtraction,
  DBSExtractionSchema,
  DonationExtractionSchema,
  ReceiptExtractionSchema,
  OverseasTransferExtractionSchema
} from '../types/extraction'

export async function extractFromEmail(
  email: IncomingEmail,
  emailType: string
): Promise<ExtractionResult> {
  try {
    // Combine email content for extraction
    const emailContent = `
Subject: ${email.subject}

From: ${email.from}

Content:
${email.textContent}

${email.htmlContent ? 'HTML Content: ' + stripHtml(email.htmlContent) : ''}
`

    // Get appropriate prompt based on email type
    const prompt = getExtractionPrompt(emailType)
    
    if (!prompt) {
      return {
        success: false,
        confidence: 0,
        error: 'Unknown email type',
        requires_review: true
      }
    }

    // Call AI for extraction
    const response = await callOpenRouter(async () => {
      return await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
        messages: [
          {
            role: 'system',
            content: 'You are a data extraction specialist. Extract structured data from emails accurately. Return valid JSON only.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nEmail Content:\n${emailContent}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for consistent extraction
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

    switch (emailType) {
      case 'dbs_certificate':
        validatedData = DBSExtractionSchema.parse(extracted)
        break
      case 'donation':
        validatedData = DonationExtractionSchema.parse(extracted)
        break
      case 'expense':
        validatedData = ReceiptExtractionSchema.parse(extracted)
        break
      case 'overseas_transfer':
        validatedData = OverseasTransferExtractionSchema.parse(extracted)
        break
      default:
        validatedData = extracted
    }

    return {
      success: true,
      data: validatedData,
      confidence,
      requires_review: confidence < CONFIDENCE_THRESHOLDS.HIGH
    }

  } catch (error) {
    console.error('Email extraction error:', error)
    return {
      success: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Extraction failed',
      requires_review: true
    }
  }
}

// Get the appropriate extraction prompt
function getExtractionPrompt(emailType: string): string | null {
  switch (emailType) {
    case 'dbs_certificate':
      return EXTRACTION_PROMPTS.DBS_CERTIFICATE
    case 'donation':
      return EXTRACTION_PROMPTS.EMAIL_DONATION
    case 'expense':
      return EXTRACTION_PROMPTS.RECEIPT
    case 'overseas_transfer':
      return EXTRACTION_PROMPTS.OVERSEAS_TRANSFER
    default:
      return null
  }
}

// Strip HTML tags for text extraction
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract data from email with attachments
export async function extractFromEmailWithAttachments(
  email: IncomingEmail,
  attachmentUrls: string[]
): Promise<ExtractionResult[]> {
  const results: ExtractionResult[] = []
  
  // First extract from email body
  const emailType = detectEmailTypeFromContent(email)
  const emailExtraction = await extractFromEmail(email, emailType)
  results.push(emailExtraction)
  
  // Then process each attachment
  for (const url of attachmentUrls) {
    try {
      const attachmentResult = await extractFromAttachment(url, email)
      results.push(attachmentResult)
    } catch (error) {
      console.error('Attachment extraction error:', error)
    }
  }
  
  return results
}

// Extract from attachment (placeholder - would integrate with document OCR)
async function extractFromAttachment(
  attachmentUrl: string,
  email: IncomingEmail
): Promise<ExtractionResult> {
  // This would call the document OCR service
  // For now, return a placeholder
  return {
    success: false,
    confidence: 0,
    error: 'Attachment processing not yet implemented',
    requires_review: true
  }
}

// Detect email type from content
function detectEmailTypeFromContent(email: IncomingEmail): string {
  const content = (email.subject + ' ' + email.textContent).toLowerCase()
  
  if (content.includes('dbs') || content.includes('disclosure')) {
    return 'dbs_certificate'
  }
  if (content.includes('donation') || content.includes('gift')) {
    return 'donation'
  }
  if (content.includes('receipt') || content.includes('expense')) {
    return 'expense'
  }
  if (content.includes('transfer') || content.includes('overseas')) {
    return 'overseas_transfer'
  }
  
  return 'unknown'
}

// Process email extraction results
export async function processExtractionResults(
  results: ExtractionResult[],
  organizationId: string
): Promise<{
  processed: number
  failed: number
  requiresReview: number
}> {
  let processed = 0
  let failed = 0
  let requiresReview = 0
  
  for (const result of results) {
    if (!result.success) {
      failed++
      continue
    }
    
    if (result.requires_review) {
      requiresReview++
    } else {
      processed++
    }
    
    // Here we would save the extracted data to the appropriate tables
    // This is handled by the import review UI
  }
  
  return { processed, failed, requiresReview }
}