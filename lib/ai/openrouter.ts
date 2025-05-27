// Lazy-load OpenRouter client to avoid build issues
let _openrouter: any | null = null

export function getOpenRouter(): any {
  if (!_openrouter) {
    // Dynamic import to avoid build-time initialization
    const OpenAI = require('openai')
    _openrouter = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || '',
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://charityprep.com",
        "X-Title": "Charity Prep - AI-Powered Compliance",
      },
    })
  }
  return _openrouter
}

// Export a getter for backward compatibility
export const openrouter = {
  get chat() {
    return getOpenRouter().chat
  },
  get completions() {
    return getOpenRouter().completions
  }
}

// Default model configuration
export const AI_MODELS = {
  FAST: 'google/gemini-2.0-flash-exp:free',
  VISION: 'google/gemini-2.0-flash-exp:free', // Same model supports vision
  CHAT: 'google/gemini-2.0-flash-exp:free',
} as const

// Rate limiting configuration
export const RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 30,
  MAX_TOKENS_PER_REQUEST: 4000,
  RETRY_DELAY_MS: 1000,
  MAX_RETRIES: 3,
}

// Error handling wrapper
export async function callOpenRouter<T>(
  fn: () => Promise<T>,
  options?: {
    retries?: number
    retryDelay?: number
  }
): Promise<T> {
  const maxRetries = options?.retries ?? RATE_LIMITS.MAX_RETRIES
  const retryDelay = options?.retryDelay ?? RATE_LIMITS.RETRY_DELAY_MS
  
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on non-retryable errors
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Invalid API key')) {
          throw new Error('Invalid OpenRouter API key. Please check your configuration.')
        }
        if (error.message.includes('402') || error.message.includes('insufficient')) {
          throw new Error('OpenRouter credit limit reached. Please check your account.')
        }
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
      }
    }
  }
  
  throw lastError || new Error('OpenRouter call failed after retries')
}

// Helper to ensure API key is available
export function ensureApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set')
  }
  return apiKey
}