import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase/server'
import { tryModelsWithFallback, AI_MODELS } from '@/lib/ai/retry-utils'

// Schema for request validation
const OCRRequestSchema = z.object({
  imageUrl: z.string().url(),
  documentType: z.string(),
})

// Initialize OpenAI client on the server side only
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'CharityPrep',
  }
})


export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const { imageUrl, documentType } = OCRRequestSchema.parse(body)

    // Get prompt based on document type
    const prompt = getOCRPrompt(documentType)

    // Call OpenAI/OpenRouter API with fallback models
    const response = await tryModelsWithFallback(
      AI_MODELS.VISION,
      async (model) => {
        return await openai.chat.completions.create({
          model,
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
      },
      2000 // Wait longer between vision models
    )

    const extractedText = response.choices[0]?.message?.content
    if (!extractedText) {
      throw new Error('No response from AI')
    }

    const extracted = JSON.parse(extractedText)

    return NextResponse.json({
      success: true,
      data: extracted,
      confidence: extracted.confidence || 0.8
    })

  } catch (error) {
    console.error('OCR API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'OCR extraction failed' },
      { status: 500 }
    )
  }
}

function getOCRPrompt(documentType: string): string {
  switch (documentType) {
    case 'dbs_certificate':
      return `Extract information from this DBS certificate:
        - Person name
        - DBS certificate number (12 digits)
        - Issue date (format: YYYY-MM-DD)
        - Type (basic/standard/enhanced)
        - Status
        - Any disclosed information
        
        Return as JSON with confidence score (0.0-1.0)`
        
    case 'receipt':
      return `Extract receipt information:
        - Vendor/merchant name
        - Transaction date (YYYY-MM-DD)
        - Total amount (numeric)
        - Currency
        - Items (if visible)
        - Payment method
        
        Return as JSON with confidence score`
        
    default:
      return `Extract all text and structured data from this document.
        Identify key information fields, dates, amounts, names, reference numbers.
        Return as JSON with extracted fields and confidence scores.`
  }
}