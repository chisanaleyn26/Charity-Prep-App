'use server'

import { createClient } from '@/lib/supabase/server'
import { createAITask } from './task-queue'
import { extractFromEmail } from './email-extraction'
import type { AITaskType } from '../types/extraction'

export interface IncomingEmail {
  organizationId: string
  from: string
  to: string
  subject: string
  textContent: string
  htmlContent?: string
  attachments: EmailAttachment[]
  receivedAt: string
}

export interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  contentType: string
  size: number
}

export interface EmailProcessingResult {
  success: boolean
  taskId: string
  message: string
  extractedData?: any
}

export async function processIncomingEmail(
  email: IncomingEmail
): Promise<EmailProcessingResult> {
  const supabase = await createClient()
  
  try {
    // Store the raw email first
    const { data: storedEmail, error: storeError } = await supabase
      .from('email_imports')
      .insert({
        organization_id: email.organizationId,
        from_address: email.from,
        to_address: email.to,
        subject: email.subject,
        text_content: email.textContent,
        html_content: email.htmlContent,
        attachment_count: email.attachments.length,
        received_at: email.receivedAt,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
      
    if (storeError) {
      console.error('Failed to store email:', storeError)
      throw new Error('Failed to store email')
    }
    
    // Determine email type based on subject and content
    const emailType = detectEmailType(email)
    
    // Store attachments
    const attachmentUrls = await storeAttachments(
      email.organizationId,
      storedEmail.id,
      email.attachments
    )
    
    // Create AI task for extraction
    const aiTask = await createAITask(
      'email_extraction',
      {
        emailId: storedEmail.id,
        emailType,
        subject: email.subject,
        textContent: email.textContent,
        htmlContent: email.htmlContent,
        attachmentUrls
      },
      {
        organizationId: email.organizationId,
        source: 'email_webhook'
      }
    )
    
    // Process immediately if it's a simple extraction
    if (emailType !== 'complex' && email.attachments.length === 0) {
      const extractionResult = await extractFromEmail(email, emailType)
      
      if (extractionResult.success) {
        // Update the email import status
        await supabase
          .from('email_imports')
          .update({
            status: 'processed',
            extracted_data: extractionResult.data,
            processed_at: new Date().toISOString()
          })
          .eq('id', storedEmail.id)
          
        return {
          success: true,
          taskId: aiTask.id,
          message: 'Email processed successfully',
          extractedData: extractionResult.data
        }
      }
    }
    
    return {
      success: true,
      taskId: aiTask.id,
      message: 'Email queued for processing'
    }
    
  } catch (error) {
    console.error('Email processing error:', error)
    return {
      success: false,
      taskId: '',
      message: 'Failed to process email'
    }
  }
}

// Detect the type of email based on content
function detectEmailType(email: IncomingEmail): string {
  const subject = email.subject.toLowerCase()
  const content = (email.textContent + ' ' + email.subject).toLowerCase()
  
  // DBS Certificate patterns
  if (
    content.includes('dbs') || 
    content.includes('disclosure and barring') ||
    content.includes('criminal record check')
  ) {
    return 'dbs_certificate'
  }
  
  // Donation patterns
  if (
    subject.includes('donation') ||
    subject.includes('gift') ||
    content.includes('thank you for your donation') ||
    content.includes('receipt for your donation')
  ) {
    return 'donation'
  }
  
  // Expense/Receipt patterns
  if (
    subject.includes('receipt') ||
    subject.includes('invoice') ||
    subject.includes('expense') ||
    content.includes('payment confirmation')
  ) {
    return 'expense'
  }
  
  // Overseas transfer patterns
  if (
    content.includes('international transfer') ||
    content.includes('wire transfer') ||
    content.includes('swift') ||
    content.includes('overseas payment')
  ) {
    return 'overseas_transfer'
  }
  
  // Bank statement patterns
  if (
    subject.includes('statement') ||
    subject.includes('account summary') ||
    content.includes('opening balance') ||
    content.includes('closing balance')
  ) {
    return 'bank_statement'
  }
  
  return 'complex' // Requires manual review
}

// Store email attachments
async function storeAttachments(
  organizationId: string,
  emailId: string,
  attachments: EmailAttachment[]
): Promise<string[]> {
  if (attachments.length === 0) return []
  
  const supabase = await createClient()
  const urls: string[] = []
  
  for (const attachment of attachments) {
    try {
      // Decode base64 content
      const buffer = Buffer.from(attachment.content, 'base64')
      
      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${organizationId}/emails/${emailId}/${timestamp}-${attachment.filename}`
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filename, buffer, {
          contentType: attachment.contentType,
          upsert: false
        })
        
      if (error) {
        console.error('Failed to upload attachment:', error)
        continue
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filename)
        
      urls.push(publicUrl)
      
      // Store attachment metadata
      await supabase
        .from('email_attachments')
        .insert({
          email_id: emailId,
          filename: attachment.filename,
          content_type: attachment.contentType,
          size: attachment.size,
          storage_path: filename,
          public_url: publicUrl,
          created_at: new Date().toISOString()
        })
        
    } catch (error) {
      console.error('Error storing attachment:', error)
    }
  }
  
  return urls
}

// Get pending email imports
export async function getPendingEmailImports(
  organizationId?: string
): Promise<any[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('email_imports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    
  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching pending imports:', error)
    return []
  }
  
  return data || []
}

// Mark email as reviewed
export async function markEmailReviewed(
  emailId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('email_imports')
    .update({
      status: status === 'approved' ? 'completed' : 'rejected',
      review_notes: notes,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', emailId)
}