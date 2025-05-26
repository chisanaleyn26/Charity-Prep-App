'use server'

import { AIService } from './service'
import { extractReceipt, extractDBSCertificate } from './ocr-extraction'
import { createClient } from '@/lib/supabase/server'

export interface EmailData {
  from: string
  to: string
  subject: string
  textContent: string
  htmlContent?: string
  attachments: Array<{
    filename: string
    contentType: string
    content: string // base64
  }>
  receivedAt: string
}

export interface ProcessedEmail {
  type: 'safeguarding' | 'overseas' | 'income' | 'unknown'
  confidence: number
  extractedData: Record<string, any>
  suggestedActions: string[]
  attachmentResults?: Array<{
    filename: string
    extracted: any
  }>
}

/**
 * Process incoming email and extract compliance data
 */
export async function processComplianceEmail(
  email: EmailData,
  organizationId: string
): Promise<{ data?: ProcessedEmail; error?: string }> {
  const ai = AIService.getInstance()
  
  // First, analyze the email content to determine type
  const classificationPrompt = `Analyze this email and determine what type of compliance data it contains:

From: ${email.from}
Subject: ${email.subject}
Content: ${email.textContent.slice(0, 1000)}

Classify as one of:
- safeguarding: DBS checks, training certificates, safeguarding documents
- overseas: International transfers, overseas activities, partner communications
- income: Donations, receipts, gift aid declarations, fundraising
- unknown: Cannot determine or not compliance-related

Also extract any relevant data mentioned in the email.

Return JSON:
{
  "type": "classification",
  "confidence": 0.0-1.0,
  "extractedData": {
    // any structured data found
  },
  "reason": "why this classification"
}`

  const classificationResponse = await ai.complete<any>(classificationPrompt, {
    jsonMode: true,
    temperature: 0.2
  })
  
  if (!classificationResponse.success || !classificationResponse.data) {
    return { error: 'Failed to classify email' }
  }
  
  const classification = classificationResponse.data
  const processedEmail: ProcessedEmail = {
    type: classification.type || 'unknown',
    confidence: classification.confidence || 0.5,
    extractedData: classification.extractedData || {},
    suggestedActions: []
  }
  
  // Process attachments if any
  if (email.attachments.length > 0) {
    processedEmail.attachmentResults = []
    
    for (const attachment of email.attachments) {
      // Only process images and PDFs
      if (attachment.contentType.startsWith('image/')) {
        let extracted: any = null
        
        // Use appropriate extractor based on email type
        if (processedEmail.type === 'safeguarding') {
          const result = await extractDBSCertificate(attachment.content)
          extracted = result.data
        } else if (processedEmail.type === 'income' || processedEmail.type === 'overseas') {
          const result = await extractReceipt(attachment.content)
          extracted = result.data
        }
        
        if (extracted) {
          processedEmail.attachmentResults.push({
            filename: attachment.filename,
            extracted
          })
        }
      }
    }
  }
  
  // Generate suggested actions
  processedEmail.suggestedActions = generateSuggestedActions(processedEmail)
  
  // Store in processing queue
  await storeInProcessingQueue(email, processedEmail, organizationId)
  
  return { data: processedEmail }
}

/**
 * Generate suggested actions based on extracted data
 */
function generateSuggestedActions(processed: ProcessedEmail): string[] {
  const actions: string[] = []
  
  switch (processed.type) {
    case 'safeguarding':
      if (processed.attachmentResults?.some(a => a.extracted?.certificateNumber)) {
        actions.push('Create new DBS record from extracted certificate')
      }
      if (processed.extractedData.expiryMentioned) {
        actions.push('Update DBS expiry date')
      }
      break
      
    case 'income':
      if (processed.extractedData.amount || processed.attachmentResults?.some(a => a.extracted?.amount)) {
        actions.push('Record donation in income tracker')
      }
      if (processed.extractedData.giftAidMentioned) {
        actions.push('Process Gift Aid claim')
      }
      break
      
    case 'overseas':
      if (processed.extractedData.transferMentioned) {
        actions.push('Record overseas transfer')
      }
      if (processed.extractedData.partnerMentioned) {
        actions.push('Update partner information')
      }
      break
  }
  
  if (actions.length === 0 && processed.confidence > 0.7) {
    actions.push(`Review and file under ${processed.type} records`)
  }
  
  return actions
}

/**
 * Store email in processing queue for user review
 */
async function storeInProcessingQueue(
  email: EmailData,
  processed: ProcessedEmail,
  organizationId: string
) {
  const supabase = await createClient()
  
  // This would store in a processing queue table
  // For now, we'll create a notification
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase
      .from('notifications')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        type: 'email_processed',
        title: `Email processed: ${email.subject}`,
        message: `Classified as ${processed.type} with ${Math.round(processed.confidence * 100)}% confidence. ${processed.suggestedActions.length} suggested actions.`,
        severity: 'info',
        link: `/import/email/${email.from}/${new Date(email.receivedAt).getTime()}`
      })
  }
}

/**
 * Parse email webhook payload (example for common providers)
 */
export function parseEmailWebhook(provider: string, payload: any): EmailData | null {
  switch (provider) {
    case 'sendgrid':
      return {
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        textContent: payload.text || payload.plain,
        htmlContent: payload.html,
        attachments: payload.attachments?.map((a: any) => ({
          filename: a.filename,
          contentType: a.type,
          content: a.content
        })) || [],
        receivedAt: new Date().toISOString()
      }
      
    case 'mailgun':
      return {
        from: payload.sender,
        to: payload.recipient,
        subject: payload.subject,
        textContent: payload['body-plain'],
        htmlContent: payload['body-html'],
        attachments: [], // Would need to fetch separately
        receivedAt: new Date(payload.timestamp * 1000).toISOString()
      }
      
    default:
      return null
  }
}