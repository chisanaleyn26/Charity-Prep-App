// AI Service Configuration

export const AI_CONFIG = {
  // OpenRouter configuration
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'google/gemini-2.0-flash-exp:free', // Fast and cost-effective
    maxTokens: 4096,
    temperature: 0.3, // Lower for more consistent outputs
  },
  
  // GPT-4 Vision for OCR
  vision: {
    model: 'openai/gpt-4-vision-preview',
    maxTokens: 4096,
    temperature: 0.2, // Very low for accurate extraction
  },
  
  // Embeddings configuration
  embeddings: {
    model: 'openai/text-embedding-3-small',
    dimensions: 1536,
  },
  
  // Rate limiting
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
  },
  
  // Prompts
  prompts: {
    csvMapper: `You are a CSV column mapping expert. Map the CSV headers to the database schema fields.
Return ONLY a JSON object with mappings, no explanation.
Example: {"CSV Header": "schema_field"}`,
    
    documentExtractor: `Extract all relevant information from this document image.
Focus on extracting structured data that matches our compliance records.
Return data in JSON format.`,
    
    complianceQA: `You are a UK charity compliance expert. Answer questions based on:
1. Current UK charity regulations
2. The user's organization data
3. Best practices for compliance

Be specific and cite regulations where relevant.`,
    
    narrativeGenerator: `Generate a professional narrative for a charity board report.
Use formal language appropriate for trustees.
Focus on compliance status and key metrics.`,
  }
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalCost: number
  }
}