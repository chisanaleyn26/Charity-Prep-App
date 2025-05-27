import { z } from 'zod'

// Base interfaces for all integrations
export interface IntegrationConfig {
  id: string
  name: string
  description: string
  category: 'accounting' | 'communication' | 'calendar' | 'regulatory' | 'payment' | 'storage'
  enabled: boolean
  settings: Record<string, any>
  credentials: Record<string, string>
  webhookUrl?: string
  lastSync?: Date
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly'
}

export interface IntegrationAuthConfig {
  type: 'oauth2' | 'api_key' | 'basic' | 'custom'
  authUrl?: string
  tokenUrl?: string
  scopes?: string[]
  clientId?: string
  clientSecret?: string
  redirectUri?: string
}

export interface IntegrationCapabilities {
  sync: boolean
  webhook: boolean
  realtime: boolean
  bidirectional: boolean
  bulkOperations: boolean
  fieldMapping: boolean
}

export interface SyncResult {
  success: boolean
  recordsProcessed: number
  recordsCreated: number
  recordsUpdated: number
  recordsSkipped: number
  errors: Array<{
    record: any
    error: string
    code?: string
  }>
  nextSyncToken?: string
  metadata?: Record<string, any>
}

export interface WebhookEvent {
  id: string
  source: string
  type: string
  data: any
  timestamp: Date
  signature?: string
}

// Base class for all integrations
export abstract class BaseIntegration {
  protected config: IntegrationConfig
  protected authConfig: IntegrationAuthConfig
  protected capabilities: IntegrationCapabilities

  constructor(
    config: IntegrationConfig,
    authConfig: IntegrationAuthConfig,
    capabilities: IntegrationCapabilities
  ) {
    this.config = config
    this.authConfig = authConfig
    this.capabilities = capabilities
  }

  // Abstract methods that must be implemented by each integration
  abstract authenticate(): Promise<boolean>
  abstract testConnection(): Promise<boolean>
  abstract sync(options?: SyncOptions): Promise<SyncResult>
  
  // Optional methods that can be overridden
  async processWebhook(event: WebhookEvent): Promise<void> {
    if (!this.capabilities.webhook) {
      throw new Error('Webhook processing not supported')
    }
    // Default implementation - override in subclasses
  }

  async disconnect(): Promise<void> {
    // Default implementation - override if needed
  }

  // Utility methods
  getConfig(): IntegrationConfig {
    return { ...this.config }
  }

  getCapabilities(): IntegrationCapabilities {
    return { ...this.capabilities }
  }

  isEnabled(): boolean {
    return this.config.enabled
  }

  async updateConfig(updates: Partial<IntegrationConfig>): Promise<void> {
    this.config = { ...this.config, ...updates }
    // Save to database here
  }

  protected async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = await this.getAuthHeaders()
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    switch (this.authConfig.type) {
      case 'api_key':
        return {
          'Authorization': `Bearer ${this.config.credentials.apiKey}`,
        }
      case 'basic':
        const credentials = Buffer.from(
          `${this.config.credentials.username}:${this.config.credentials.password}`
        ).toString('base64')
        return {
          'Authorization': `Basic ${credentials}`,
        }
      case 'oauth2':
        return {
          'Authorization': `Bearer ${this.config.credentials.accessToken}`,
        }
      default:
        return {}
    }
  }

  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    console[level](`[${this.config.name}] ${message}`, data)
    // In production, send to proper logging service
  }
}

// Integration options
export interface SyncOptions {
  dryRun?: boolean
  limit?: number
  offset?: number
  since?: Date
  filters?: Record<string, any>
  syncToken?: string
}

// Field mapping for data transformation
export interface FieldMapping {
  source: string
  target: string
  transform?: (value: any) => any
  required?: boolean
  defaultValue?: any
}

export interface DataMapping {
  entity: string
  fields: FieldMapping[]
  conditions?: Array<{
    field: string
    operator: 'equals' | 'contains' | 'greater' | 'less'
    value: any
  }>
}

// Integration registry
export class IntegrationRegistry {
  private static integrations = new Map<string, typeof BaseIntegration>()
  private static instances = new Map<string, BaseIntegration>()

  static register(id: string, integrationClass: typeof BaseIntegration) {
    this.integrations.set(id, integrationClass)
  }

  static async createInstance(
    id: string,
    config: IntegrationConfig,
    authConfig: IntegrationAuthConfig,
    capabilities: IntegrationCapabilities
  ): Promise<BaseIntegration | null> {
    const IntegrationClass = this.integrations.get(id)
    if (!IntegrationClass) {
      return null
    }

    const instance = new IntegrationClass(config, authConfig, capabilities)
    this.instances.set(`${config.id}-${id}`, instance)
    return instance
  }

  static getInstance(configId: string, integrationId: string): BaseIntegration | null {
    return this.instances.get(`${configId}-${integrationId}`) || null
  }

  static getAvailableIntegrations(): string[] {
    return Array.from(this.integrations.keys())
  }

  static removeInstance(configId: string, integrationId: string): void {
    this.instances.delete(`${configId}-${integrationId}`)
  }
}

// Validation schemas
export const IntegrationConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  category: z.enum(['accounting', 'communication', 'calendar', 'regulatory', 'payment', 'storage']),
  enabled: z.boolean(),
  settings: z.record(z.any()),
  credentials: z.record(z.string()),
  webhookUrl: z.string().url().optional(),
  lastSync: z.date().optional(),
  syncFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly', 'monthly']).optional(),
})

export const SyncOptionsSchema = z.object({
  dryRun: z.boolean().optional(),
  limit: z.number().positive().optional(),
  offset: z.number().nonnegative().optional(),
  since: z.date().optional(),
  filters: z.record(z.any()).optional(),
  syncToken: z.string().optional(),
})

// Error types
export class IntegrationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public integrationId?: string,
    public data?: any
  ) {
    super(message)
    this.name = 'IntegrationError'
  }
}

export class AuthenticationError extends IntegrationError {
  constructor(message: string, integrationId?: string) {
    super(message, 'AUTHENTICATION_ERROR', integrationId)
    this.name = 'AuthenticationError'
  }
}

export class SyncError extends IntegrationError {
  constructor(message: string, integrationId?: string, data?: any) {
    super(message, 'SYNC_ERROR', integrationId, data)
    this.name = 'SyncError'
  }
}

export class RateLimitError extends IntegrationError {
  constructor(message: string, retryAfter?: number, integrationId?: string) {
    super(message, 'RATE_LIMIT_ERROR', integrationId, { retryAfter })
    this.name = 'RateLimitError'
  }
}