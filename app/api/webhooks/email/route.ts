import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processIncomingEmail } from '@/features/ai/services/email-processor'

// Email webhook endpoint - receives forwarded emails
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming email data
    const contentType = request.headers.get('content-type') || ''
    
    let emailData: any
    
    if (contentType.includes('application/json')) {
      emailData = await request.json()
    } else if (contentType.includes('multipart/form-data')) {
      // Handle form data (attachments)
      const formData = await request.formData()
      emailData = {
        from: formData.get('from')?.toString() || '',
        to: formData.get('to')?.toString() || '',
        subject: formData.get('subject')?.toString() || '',
        text: formData.get('text')?.toString() || '',
        html: formData.get('html')?.toString() || '',
        attachments: []
      }
      
      // Process attachments
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('attachment') && value instanceof File) {
          const buffer = await value.arrayBuffer()
          emailData.attachments.push({
            filename: value.name,
            content: Buffer.from(buffer).toString('base64'),
            contentType: value.type,
            size: value.size
          })
        }
      }
    } else {
      // Try to parse as text/plain
      const text = await request.text()
      emailData = parseEmailText(text)
    }
    
    // Extract organization ID from recipient email
    // Format: org-{organizationId}@inbox.charityprep.com
    const toEmail = emailData.to || emailData.recipient || ''
    const orgMatch = toEmail.match(/org-([a-zA-Z0-9-]+)@/)
    
    if (!orgMatch) {
      return NextResponse.json(
        { error: 'Invalid recipient format' },
        { status: 400 }
      )
    }
    
    const organizationId = orgMatch[1]
    
    // Verify organization exists
    const supabase = await createClient()
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', organizationId)
      .single()
      
    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }
    
    // Process the email
    const result = await processIncomingEmail({
      organizationId,
      from: emailData.from || emailData.sender || '',
      to: toEmail,
      subject: emailData.subject || '',
      textContent: emailData.text || emailData.plain || '',
      htmlContent: emailData.html || '',
      attachments: emailData.attachments || [],
      receivedAt: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Email processed successfully',
      taskId: result.taskId
    })
    
  } catch (error) {
    console.error('Email webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    )
  }
}

// Simple email text parser for plain text emails
function parseEmailText(text: string): any {
  const lines = text.split('\n')
  const email: any = {
    headers: {},
    text: ''
  }
  
  let inBody = false
  let bodyLines: string[] = []
  
  for (const line of lines) {
    if (!inBody && line.trim() === '') {
      inBody = true
      continue
    }
    
    if (!inBody) {
      const match = line.match(/^([^:]+):\s*(.+)$/)
      if (match) {
        const [, key, value] = match
        const normalizedKey = key.toLowerCase().replace(/-/g, '_')
        
        switch (normalizedKey) {
          case 'from':
            email.from = value.trim()
            break
          case 'to':
            email.to = value.trim()
            break
          case 'subject':
            email.subject = value.trim()
            break
          default:
            email.headers[normalizedKey] = value.trim()
        }
      }
    } else {
      bodyLines.push(line)
    }
  }
  
  email.text = bodyLines.join('\n').trim()
  return email
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Email webhook is active',
    acceptedFormats: ['application/json', 'multipart/form-data', 'text/plain']
  })
}