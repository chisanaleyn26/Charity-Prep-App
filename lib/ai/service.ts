import { AI_CONFIG, AIResponse } from './config'

/**
 * Base AI service for OpenRouter API calls
 */
export class AIService {
  private static instance: AIService
  private requestCount = 0
  private lastReset = Date.now()

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Make a completion request to OpenRouter
   */
  async complete<T = any>(
    prompt: string,
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      systemPrompt?: string
      jsonMode?: boolean
    } = {}
  ): Promise<AIResponse<T>> {
    try {
      // Rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        }
      }

      const model = options.model || AI_CONFIG.openRouter.model
      const temperature = options.temperature ?? AI_CONFIG.openRouter.temperature
      const maxTokens = options.maxTokens || AI_CONFIG.openRouter.maxTokens

      const messages = []
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const response = await fetch(`${AI_CONFIG.openRouter.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openRouter.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://charityprep.uk',
          'X-Title': 'Charity Prep'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(options.jsonMode && { response_format: { type: 'json_object' } })
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenRouter API error: ${error}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      // Parse JSON if expected
      let parsedContent = content
      if (options.jsonMode) {
        try {
          parsedContent = JSON.parse(content)
        } catch (e) {
          console.error('Failed to parse AI JSON response:', e)
          return {
            success: false,
            error: 'Invalid JSON response from AI'
          }
        }
      }

      return {
        success: true,
        data: parsedContent,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalCost: this.calculateCost(
            data.usage?.prompt_tokens || 0,
            data.usage?.completion_tokens || 0,
            model
          )
        }
      }
    } catch (error) {
      console.error('AI completion error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI service error'
      }
    }
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string): Promise<AIResponse<number[]>> {
    try {
      const response = await fetch(`${AI_CONFIG.openRouter.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openRouter.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.embeddings.model,
          input: text
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Embeddings API error: ${error}`)
      }

      const data = await response.json()
      const embedding = data.data[0]?.embedding

      return {
        success: true,
        data: embedding,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: 0,
          totalCost: this.calculateEmbeddingCost(data.usage?.prompt_tokens || 0)
        }
      }
    } catch (error) {
      console.error('Embedding error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Embedding service error'
      }
    }
  }

  /**
   * Process image with GPT-4 Vision
   */
  async processImage(
    imageBase64: string,
    prompt: string
  ): Promise<AIResponse<any>> {
    try {
      const response = await fetch(`${AI_CONFIG.openRouter.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openRouter.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.vision.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { 
                  type: 'image_url', 
                  image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
                }
              ]
            }
          ],
          temperature: AI_CONFIG.vision.temperature,
          max_tokens: AI_CONFIG.vision.maxTokens,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Vision API error: ${error}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      let parsedContent
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        return {
          success: false,
          error: 'Failed to parse vision response'
        }
      }

      return {
        success: true,
        data: parsedContent,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalCost: this.calculateCost(
            data.usage?.prompt_tokens || 0,
            data.usage?.completion_tokens || 0,
            AI_CONFIG.vision.model
          )
        }
      }
    } catch (error) {
      console.error('Vision processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Vision service error'
      }
    }
  }

  private checkRateLimit(): boolean {
    const now = Date.now()
    const minuteElapsed = now - this.lastReset >= 60000

    if (minuteElapsed) {
      this.requestCount = 0
      this.lastReset = now
    }

    if (this.requestCount >= AI_CONFIG.rateLimits.requestsPerMinute) {
      return false
    }

    this.requestCount++
    return true
  }

  private calculateCost(promptTokens: number, completionTokens: number, model: string): number {
    // Rough cost estimates per 1M tokens
    const costs: Record<string, { prompt: number; completion: number }> = {
      'google/gemini-2.0-flash-exp:free': { prompt: 0, completion: 0 },
      'openai/gpt-4-vision-preview': { prompt: 10, completion: 30 },
      'openai/gpt-4': { prompt: 30, completion: 60 },
      'openai/gpt-3.5-turbo': { prompt: 0.5, completion: 1.5 }
    }

    const modelCosts = costs[model] || { prompt: 1, completion: 2 }
    
    return (
      (promptTokens / 1_000_000) * modelCosts.prompt +
      (completionTokens / 1_000_000) * modelCosts.completion
    )
  }

  private calculateEmbeddingCost(tokens: number): number {
    // $0.13 per 1M tokens for text-embedding-3-small
    return (tokens / 1_000_000) * 0.13
  }
}