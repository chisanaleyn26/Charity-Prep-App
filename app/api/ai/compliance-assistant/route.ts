/**
 * AI Compliance Assistant API Route
 * Handles chat requests with advanced error handling, rate limiting, and caching
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDevSession } from '@/lib/dev/dev-auth'
import { getAIResponse } from '@/features/ai/services/ai-assistant'
import { 
  getOrCreateConversation, 
  addMessage, 
  getConversationMessages,
  updateConversation 
} from '@/features/ai/services/chat-storage'
import type { 
  ChatRequest, 
  ChatResponse, 
  ChatContext, 
  ChatMessage 
} from '@/features/ai/types/chat'
import { randomUUID } from 'crypto'

/**
 * POST /api/ai/compliance-assistant
 * Send a message to the AI compliance assistant
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Parse and validate request
    const body: ChatRequest = await req.json()
    const { message, conversation_id, context, use_cache = true } = body
    
    // Input validation
    if (!message?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT',
            message: 'Message is required' 
          } 
        },
        { status: 400 }
      )
    }
    
    if (message.length > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MESSAGE_TOO_LONG',
            message: 'Message must be 1000 characters or less' 
          } 
        },
        { status: 400 }
      )
    }
    
    // Authentication - check both dev session and Supabase auth
    let userId: string
    let organizationId: string
    
    const devSession = await getDevSession()
    if (devSession) {
      userId = devSession.user_id
      organizationId = devSession.organization_id
    } else {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED',
              message: 'Authentication required' 
            } 
          },
          { status: 401 }
        )
      }
      
      // Get user's organization membership
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()
      
      if (membershipError || !membership) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'NO_ORGANIZATION',
              message: 'User must belong to an organization' 
            } 
          },
          { status: 403 }
        )
      }
      
      userId = user.id
      organizationId = membership.organization_id
    }
    
    // Get or create conversation
    let conversationId: string
    if (conversation_id) {
      conversationId = conversation_id
    } else {
      const conversation = await getOrCreateConversation(userId, organizationId)
      conversationId = conversation.id
    }
    
    // Build enhanced context with organization data
    const supabase = createClient()
    let enhancedContext: ChatContext = {
      organization_id: organizationId,
      ...context
    }
    
    try {
      // Get organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('name, charity_number, income_band')
        .eq('id', organizationId)
        .single()
      
      if (org) {
        enhancedContext = {
          ...enhancedContext,
          organization_name: org.name,
          charity_number: org.charity_number,
          income_band: org.income_band
        }
      }
      
      // Get compliance context
      const [safeguardingData, overseasData, fundraisingData] = await Promise.all([
        supabase
          .from('safeguarding_records')
          .select('works_with_children, works_with_vulnerable_adults')
          .eq('organization_id', organizationId)
          .limit(1),
        supabase
          .from('overseas_activities')
          .select('id')
          .eq('organization_id', organizationId)
          .limit(1),
        supabase
          .from('fundraising_records')
          .select('id')
          .eq('organization_id', organizationId)
          .limit(1)
      ])
      
      enhancedContext = {
        ...enhancedContext,
        works_with_children: safeguardingData.data?.[0]?.works_with_children || false,
        works_with_vulnerable_adults: safeguardingData.data?.[0]?.works_with_vulnerable_adults || false,
        has_overseas_activities: (overseasData.data?.length || 0) > 0,
        is_fundraising_charity: (fundraisingData.data?.length || 0) > 0
      }
    } catch (contextError) {
      console.warn('Failed to load full context, using partial:', contextError)
    }
    
    // Save user message
    const userMessage = await addMessage(
      conversationId,
      'user',
      message.trim(),
      {
        user_agent: req.headers.get('user-agent') || undefined,
        session_id: req.headers.get('x-session-id') || undefined
      }
    )
    
    // Get conversation history for context
    const history = await getConversationMessages(conversationId, 10)
    
    // Get AI response
    const aiResult = await getAIResponse(
      message.trim(),
      enhancedContext,
      history.slice(-6), // Last 6 messages for context
      userId
    )
    
    // Save AI response
    const assistantMessage = await addMessage(
      conversationId,
      'assistant',
      aiResult.content,
      aiResult.metadata
    )
    
    // Update conversation title if this is the first user message
    const messageCount = history.length + 1 // +1 for the message we just added
    if (messageCount === 2) { // Welcome message + first user message
      const title = message.length > 50 
        ? message.substring(0, 47) + '...'
        : message
      
      await updateConversation(conversationId, { title })
    }
    
    // Prepare response
    const response: ChatResponse = {
      success: true,
      message: assistantMessage,
      conversation_id: conversationId,
      cached: aiResult.cached,
      metadata: {
        response_time_ms: Date.now() - startTime,
        tokens_used: aiResult.metadata.tokens_used || 0,
        cache_hit: aiResult.cached
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Compliance assistant API error:', error)
    
    // Handle specific error types
    if (error && typeof error === 'object' && 'type' in error) {
      const chatError = error as any
      
      const statusCode = 
        chatError.type === 'RATE_LIMITED' ? 429 :
        chatError.type === 'UNAUTHORIZED' ? 401 :
        chatError.type === 'VALIDATION_ERROR' ? 400 :
        500
      
      const response: ChatResponse = {
        success: false,
        error: {
          code: chatError.type,
          message: chatError.message,
          retry_after: chatError.retry_after
        }
      }
      
      return NextResponse.json(response, { status: statusCode })
    }
    
    // Generic error handling
    let errorMessage = 'An unexpected error occurred. Please try again.'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'AI service is experiencing high demand. Please wait a moment and try again.'
        statusCode = 429
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
        errorMessage = 'Authentication error. Please log in again.'
        statusCode = 401
      }
    }
    
    const response: ChatResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    }
    
    return NextResponse.json(response, { status: statusCode })
  }
}

/**
 * GET /api/ai/compliance-assistant?conversation_id=xxx
 * Get conversation history
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversation_id')
    
    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_CONVERSATION_ID',
            message: 'conversation_id parameter is required' 
          } 
        },
        { status: 400 }
      )
    }
    
    // Authentication
    let userId: string
    
    const devSession = await getDevSession()
    if (devSession) {
      userId = devSession.user_id
    } else {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED',
              message: 'Authentication required' 
            } 
          },
          { status: 401 }
        )
      }
      
      userId = user.id
    }
    
    // Get conversation messages
    const messages = await getConversationMessages(conversationId, 100)
    
    return NextResponse.json({
      success: true,
      messages,
      conversation_id: conversationId
    })
    
  } catch (error) {
    console.error('Get conversation API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Failed to get conversation history' 
        } 
      },
      { status: 500 }
    )
  }
}