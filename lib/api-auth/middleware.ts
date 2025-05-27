import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { checkFeatureAccess } from '@/features/subscription/services/subscription-service'
import { z } from 'zod'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface ApiContext {
  organizationId: string
  userId?: string
  apiKey?: string
  subscription?: {
    tier: string
    status: string
  }
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// Default rate limits by subscription tier
const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  ESSENTIALS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500
  },
  PREMIUM: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 2000
  },
  PUBLIC: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50
  }
}

export async function authenticateApiRequest(request: NextRequest): Promise<ApiContext | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return null
  }

  // Check for Bearer token (API key)
  if (authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7)
    return await authenticateApiKey(apiKey)
  }

  // Check for Basic auth (legacy)
  if (authHeader.startsWith('Basic ')) {
    const credentials = Buffer.from(authHeader.substring(6), 'base64').toString()
    const [username, password] = credentials.split(':')
    return await authenticateBasicAuth(username, password)
  }

  return null
}

async function authenticateApiKey(apiKey: string): Promise<ApiContext | null> {
  try {
    const supabase = createServerClient()
    
    // Get API key from database
    const keyHash = await hashApiKey(apiKey)
    const { data: keyData, error } = await supabase
      .from('api_keys')
      .select(`
        *,
        organizations:organization_id (
          id,
          name,
          subscriptions:subscriptions (
            tier,
            status
          )
        )
      `)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (error || !keyData) {
      return null
    }

    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return null
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: keyData.usage_count + 1
      })
      .eq('id', keyData.id)

    const organization = keyData.organizations as any
    const subscription = organization?.subscriptions?.[0]

    return {
      organizationId: keyData.organization_id,
      apiKey: apiKey,
      subscription: subscription ? {
        tier: subscription.tier,
        status: subscription.status
      } : undefined
    }

  } catch (error) {
    console.error('API key authentication error:', error)
    return null
  }
}

async function authenticateBasicAuth(username: string, password: string): Promise<ApiContext | null> {
  try {
    const supabase = createServerClient()
    
    // For basic auth, username should be organization ID and password should be API key
    const apiContext = await authenticateApiKey(password)
    
    if (apiContext && apiContext.organizationId === username) {
      return apiContext
    }

    return null

  } catch (error) {
    console.error('Basic auth error:', error)
    return null
  }
}

export function applyRateLimit(
  request: NextRequest,
  context: ApiContext | null,
  customConfig?: RateLimitConfig
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const clientId = context?.organizationId || getClientIP(request)
  const tier = context?.subscription?.tier || 'PUBLIC'
  
  const config = customConfig || DEFAULT_RATE_LIMITS[tier] || DEFAULT_RATE_LIMITS.PUBLIC
  const now = Date.now()
  const windowStart = Math.floor(now / config.windowMs) * config.windowMs
  const resetTime = windowStart + config.windowMs
  
  const key = `${clientId}:${windowStart}`
  const current = rateLimitStore.get(key)
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime })
    
    // Clean up expired entries
    for (const [storeKey, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(storeKey)
      }
    }
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime
    }
  }
  
  if (current.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime
    }
  }
  
  current.count++
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - current.count,
    resetTime
  }
}

export async function requireFeatureAccess(
  context: ApiContext,
  feature: string
): Promise<boolean> {
  try {
    const access = await checkFeatureAccess(context.organizationId, feature)
    return access.allowed
  } catch (error) {
    console.error('Feature access check error:', error)
    return false
  }
}

export function createApiResponse(
  data: any,
  status = 200,
  headers: Record<string, string> = {}
): NextResponse {
  const response = {
    success: status >= 200 && status < 300,
    data: status >= 200 && status < 300 ? data : undefined,
    error: status >= 400 ? data : undefined,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': 'v1',
      ...headers
    }
  })
}

export function createErrorResponse(
  message: string,
  code?: string,
  status = 400,
  details?: any
): NextResponse {
  return createApiResponse({
    message,
    code,
    details
  }, status)
}

export function createRateLimitResponse(rateLimitInfo: {
  limit: number
  remaining: number
  resetTime: number
}): NextResponse {
  return createApiResponse({
    message: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED'
  }, 429, {
    'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
    'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
    'X-RateLimit-Reset': rateLimitInfo.resetTime.toString()
  })
}

// Validation helpers
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Invalid request data' }
  }
}

// Utility functions
async function hashApiKey(apiKey: string): string {
  // Use Web Crypto API for edge runtime compatibility
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const connectionRemoteAddress = request.headers.get('x-vercel-forwarded-for')
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIP) {
    return xRealIP
  }
  
  if (connectionRemoteAddress) {
    return connectionRemoteAddress
  }
  
  return 'unknown'
}

// API wrapper for endpoint handlers
export function withApiAuth(
  handler: (request: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requiredFeature?: string
    rateLimit?: RateLimitConfig
  } = {}
) {
  return async function wrappedHandler(request: NextRequest): Promise<NextResponse> {
    try {
      // Authenticate request
      const context = await authenticateApiRequest(request)
      
      if (options.requireAuth && !context) {
        return createErrorResponse(
          'Authentication required',
          'AUTHENTICATION_REQUIRED',
          401
        )
      }

      // Apply rate limiting
      const rateLimitInfo = applyRateLimit(request, context, options.rateLimit)
      
      if (!rateLimitInfo.success) {
        return createRateLimitResponse(rateLimitInfo)
      }

      // Check feature access
      if (context && options.requiredFeature) {
        const hasAccess = await requireFeatureAccess(context, options.requiredFeature)
        if (!hasAccess) {
          return createErrorResponse(
            'Feature access denied',
            'FEATURE_ACCESS_DENIED',
            403
          )
        }
      }

      // Call the actual handler
      const response = await handler(request, context!)
      
      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString())
      
      return response

    } catch (error) {
      console.error('API handler error:', error)
      return createErrorResponse(
        'Internal server error',
        'INTERNAL_ERROR',
        500
      )
    }
  }
}