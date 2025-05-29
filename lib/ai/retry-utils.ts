/**
 * Retry function with exponential backoff for AI API calls
 * Handles rate limiting (429 errors) gracefully
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      // Check if it's a rate limit error (429)
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate')) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        console.log(`Rate limited, waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        // For non-rate-limit errors, throw immediately
        throw error
      }
    }
  }
  
  throw lastError
}

/**
 * Model configurations for different AI tasks
 */
export const AI_MODELS = {
  // Chat/text models (ordered by preference)
  CHAT: [
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-1.5-flash:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free'
  ],
  
  // Vision models for OCR/image analysis
  VISION: [
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-1.5-flash:free',
    'google/gemini-1.5-pro:free'
  ],
  
  // High-quality models (may have costs)
  PREMIUM: [
    'google/gemini-2.0-flash-exp',
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o'
  ]
}

/**
 * Try multiple models with fallback support
 */
export async function tryModelsWithFallback<T>(
  models: string[],
  createRequest: (model: string) => Promise<T>,
  delayBetweenModels: number = 1000
): Promise<T> {
  let lastError = null
  
  for (const model of models) {
    try {
      return await retryWithBackoff(async () => {
        return await createRequest(model)
      }, 3)
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message)
      lastError = error
      
      // Wait before trying next model for rate limits
      if (error.status === 429 || error.message?.includes('429')) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenModels))
      }
    }
  }
  
  throw lastError || new Error('All models failed')
}

/**
 * Check if an error is recoverable (rate limit vs permanent failure)
 */
export function isRecoverableError(error: any): boolean {
  if (!error) return false
  
  // Rate limit errors are recoverable
  if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate')) {
    return true
  }
  
  // Server errors might be temporary
  if (error.status >= 500 && error.status < 600) {
    return true
  }
  
  // Network errors might be temporary
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true
  }
  
  return false
}