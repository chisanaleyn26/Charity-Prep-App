/**
 * Rate Limiting Infrastructure
 * 
 * Provides configurable rate limiting for API endpoints to prevent abuse.
 * Uses in-memory storage for development, can be replaced with Redis/Upstash for production.
 */

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  keyPrefix?: string    // Prefix for the rate limit key
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean     // Don't count failed requests
  message?: string      // Custom error message
}

// Default configurations for different endpoint types
export const RateLimitConfigs = {
  // Auth endpoints - strict limits
  auth: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      message: 'Too many login attempts. Please try again later.'
    },
    signout: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      message: 'Too many signout requests.'
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      message: 'Too many password reset attempts. Please try again later.'
    }
  },
  
  // Billing endpoints - medium limits
  billing: {
    createCheckout: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 3,
      message: 'Too many checkout attempts. Please wait before trying again.'
    },
    updateSubscription: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
      message: 'Too many subscription update attempts.'
    }
  },
  
  // API endpoints - generous limits
  api: {
    general: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      message: 'Too many requests. Please slow down.'
    },
    search: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      message: 'Too many search requests. Please wait before searching again.'
    },
    export: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 5,
      message: 'Too many export requests. Please wait before exporting again.'
    }
  },
  
  // AI endpoints - expensive operations
  ai: {
    chat: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      message: 'Too many AI requests. Please wait before trying again.'
    },
    report: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 3,
      message: 'Too many AI report generations. Please wait before generating another report.'
    }
  }
}

// In-memory storage for rate limiting (replace with Redis in production)
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map()
  
  increment(key: string, windowMs: number): number {
    const now = Date.now()
    const resetTime = now + windowMs
    
    const current = this.store.get(key)
    
    if (!current || now > current.resetTime) {
      // Start new window
      this.store.set(key, { count: 1, resetTime })
      return 1
    }
    
    // Increment existing window
    current.count++
    this.store.set(key, current)
    return current.count
  }
  
  reset(key: string): void {
    this.store.delete(key)
  }
  
  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Global store instance
const rateLimitStore = new RateLimitStore()

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000)
}

/**
 * Get identifier for rate limiting
 * Uses IP address, falls back to user ID if available
 */
export async function getRateLimitKey(keyPrefix: string = 'rl'): Promise<string> {
  const headersList = headers()
  
  // Try to get IP address from various headers
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const cfConnectingIp = headersList.get('cf-connecting-ip')
  
  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // You could also include user ID if authenticated
  // const { data: { user } } = await supabase.auth.getUser()
  // if (user) return `${keyPrefix}:user:${user.id}`
  
  return `${keyPrefix}:ip:${ip}`
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(config: RateLimitConfig) {
  const key = await getRateLimitKey(config.keyPrefix)
  const count = rateLimitStore.increment(key, config.windowMs)
  
  if (count > config.maxRequests) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message || 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(config.windowMs / 1000)
        }
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(config.windowMs / 1000)),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': String(Math.max(0, config.maxRequests - count)),
          'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString()
        }
      }
    )
  }
  
  return null // Continue with request
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request) => {
    const rateLimitResponse = await rateLimit(config)
    if (rateLimitResponse) return rateLimitResponse
    
    return handler(request)
  }
}

/**
 * Reset rate limit for a specific key (useful for testing or admin override)
 */
export async function resetRateLimit(keyPrefix: string = 'rl') {
  const key = await getRateLimitKey(keyPrefix)
  rateLimitStore.reset(key)
}