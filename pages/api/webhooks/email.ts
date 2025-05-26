import { NextApiRequest, NextApiResponse } from 'next'
import { aiProcessEmailWebhook } from '@/lib/api/ai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify webhook authenticity (provider-specific)
  const provider = req.headers['x-email-provider'] as string || 'sendgrid'
  
  // In production, verify webhook signature here
  // For SendGrid: verify req.headers['x-twilio-email-event-webhook-signature']
  // For Mailgun: verify req.headers['x-mailgun-signature']

  try {
    const result = await aiProcessEmailWebhook(provider, req.body)
    
    if ('error' in result) {
      return res.status(400).json({ error: result.error })
    }

    res.status(200).json({ 
      success: true,
      processed: result.data 
    })
  } catch (error) {
    console.error('Email webhook error:', error)
    res.status(500).json({ 
      error: 'Failed to process email' 
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Support attachments
    },
  },
}