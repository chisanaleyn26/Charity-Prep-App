import { 
  BaseIntegration, 
  IntegrationConfig, 
  IntegrationAuthConfig, 
  IntegrationCapabilities,
  SyncResult,
  SyncOptions,
  WebhookEvent,
  AuthenticationError,
  SyncError
} from '../base-integration'
import crypto from 'crypto'

interface WebhookConfig {
  endpoints: {
    incoming: string // Where we receive webhooks
    outgoing?: string // Where we send webhooks
  }
  authentication: {
    type: 'signature' | 'token' | 'basic' | 'none'
    secret?: string
    token?: string
    username?: string
    password?: string
  }
  events: {
    subscribe: string[] // Events we want to receive
    send: string[] // Events we send out
  }
  retries: {
    maxAttempts: number
    backoffMs: number
  }
  timeout: number
}

interface OutgoingWebhook {
  id: string
  url: string
  event: string
  data: any
  timestamp: Date
  attempts: number
  lastAttempt?: Date
  nextAttempt?: Date
  success: boolean
  error?: string
}

export class WebhookIntegration extends BaseIntegration {
  private webhookConfig: WebhookConfig

  constructor(config: IntegrationConfig, authConfig: IntegrationAuthConfig) {
    super(config, authConfig, {
      sync: true,
      webhook: true,
      realtime: true,
      bidirectional: true,
      bulkOperations: false,
      fieldMapping: true
    })

    this.webhookConfig = config.settings.webhook || {
      endpoints: { incoming: '' },
      authentication: { type: 'none' },
      events: { subscribe: [], send: [] },
      retries: { maxAttempts: 3, backoffMs: 1000 },
      timeout: 30000
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      if (this.webhookConfig.authentication.type === 'none') {
        return true
      }

      // Test authentication by making a test request if outgoing endpoint exists
      if (this.webhookConfig.endpoints.outgoing) {
        const response = await this.makeAuthenticatedRequest(
          this.webhookConfig.endpoints.outgoing,
          {
            method: 'POST',
            body: JSON.stringify({
              event: 'test',
              data: { message: 'Authentication test' },
              timestamp: new Date().toISOString()
            }),
            timeout: this.webhookConfig.timeout
          }
        )

        return response.ok
      }

      return true
    } catch (error) {
      this.log('error', 'Webhook authentication failed', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    return this.authenticate()
  }

  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      this.log('info', 'Starting webhook sync', options)

      // For webhook integrations, sync means verifying endpoints and processing queued webhooks
      const incomingValid = await this.validateIncomingEndpoint()
      const outgoingValid = this.webhookConfig.endpoints.outgoing ? 
        await this.validateOutgoingEndpoint() : true

      // Process any queued outgoing webhooks
      const queuedWebhooks = await this.getQueuedWebhooks()
      let processed = 0
      let errors: any[] = []

      for (const webhook of queuedWebhooks) {
        try {
          await this.sendWebhook(webhook)
          processed++
        } catch (error) {
          errors.push({
            record: webhook,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      return {
        success: incomingValid && outgoingValid,
        recordsProcessed: processed,
        recordsCreated: 0,
        recordsUpdated: processed,
        recordsSkipped: errors.length,
        errors,
        metadata: {
          incomingEndpoint: incomingValid,
          outgoingEndpoint: outgoingValid,
          queuedWebhooks: queuedWebhooks.length
        }
      }

    } catch (error) {
      this.log('error', 'Webhook sync failed', error)
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        errors: [{
          record: {},
          error: error instanceof Error ? error.message : 'Unknown error'
        }]
      }
    }
  }

  async processWebhook(event: WebhookEvent): Promise<void> {
    try {
      this.log('info', 'Processing incoming webhook', { 
        type: event.type, 
        source: event.source 
      })

      // Verify webhook signature if required
      if (this.webhookConfig.authentication.type === 'signature' && event.signature) {
        if (!this.verifySignature(event.data, event.signature)) {
          throw new Error('Invalid webhook signature')
        }
      }

      // Check if we're subscribed to this event type
      if (!this.webhookConfig.events.subscribe.includes(event.type)) {
        this.log('warn', 'Received unsubscribed event type', { type: event.type })
        return
      }

      // Process the webhook based on event type
      await this.handleWebhookEvent(event)

      // Store webhook for audit trail
      await this.storeIncomingWebhook(event)

    } catch (error) {
      this.log('error', 'Failed to process webhook', error)
      throw error
    }
  }

  async sendWebhook(webhook: OutgoingWebhook): Promise<boolean> {
    try {
      if (!this.webhookConfig.endpoints.outgoing) {
        throw new Error('No outgoing webhook endpoint configured')
      }

      const payload = {
        id: webhook.id,
        event: webhook.event,
        data: webhook.data,
        timestamp: webhook.timestamp.toISOString()
      }

      const response = await this.makeAuthenticatedRequest(
        webhook.url || this.webhookConfig.endpoints.outgoing,
        {
          method: 'POST',
          body: JSON.stringify(payload),
          timeout: this.webhookConfig.timeout
        }
      )

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`)
      }

      // Update webhook status
      await this.updateWebhookStatus(webhook.id, true)
      
      this.log('info', 'Webhook sent successfully', { 
        id: webhook.id, 
        event: webhook.event 
      })

      return true

    } catch (error) {
      // Update webhook status and schedule retry
      await this.updateWebhookStatus(webhook.id, false, error instanceof Error ? error.message : 'Unknown error')
      await this.scheduleWebhookRetry(webhook)
      
      this.log('error', 'Failed to send webhook', error)
      throw error
    }
  }

  async queueWebhook(event: string, data: any, url?: string): Promise<string> {
    const webhook: OutgoingWebhook = {
      id: crypto.randomUUID(),
      url: url || this.webhookConfig.endpoints.outgoing || '',
      event,
      data,
      timestamp: new Date(),
      attempts: 0,
      success: false
    }

    // Store webhook in queue
    await this.storeOutgoingWebhook(webhook)
    
    this.log('info', 'Webhook queued', { id: webhook.id, event })

    // Try to send immediately
    try {
      await this.sendWebhook(webhook)
    } catch (error) {
      // Will be retried later
      this.log('warn', 'Immediate webhook send failed, will retry', error)
    }

    return webhook.id
  }

  private async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case 'transaction.created':
        await this.handleTransactionCreated(event.data)
        break
      
      case 'transaction.updated':
        await this.handleTransactionUpdated(event.data)
        break

      case 'account.updated':
        await this.handleAccountUpdated(event.data)
        break

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data)
        break

      default:
        this.log('warn', 'Unhandled webhook event type', { type: event.type })
    }
  }

  private async handleTransactionCreated(data: any): Promise<void> {
    // Handle new transaction from accounting software
    this.log('info', 'Processing new transaction', data)
    
    // Map accounting software transaction to our format
    const transaction = {
      external_id: data.id,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      date: data.date,
      category: data.category,
      account: data.account,
      source: 'webhook',
      raw_data: data
    }

    // Store transaction (would normally save to database)
    this.log('info', 'Transaction processed', transaction)
  }

  private async handleTransactionUpdated(data: any): Promise<void> {
    this.log('info', 'Processing updated transaction', data)
    // Handle transaction updates
  }

  private async handleAccountUpdated(data: any): Promise<void> {
    this.log('info', 'Processing account update', data)
    // Handle account updates
  }

  private async handleInvoicePaid(data: any): Promise<void> {
    this.log('info', 'Processing paid invoice', data)
    // Handle invoice payments
  }

  private verifySignature(payload: any, signature: string): boolean {
    if (!this.webhookConfig.authentication.secret) {
      return false
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookConfig.authentication.secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  private async validateIncomingEndpoint(): Promise<boolean> {
    // In a real implementation, this would check if the incoming endpoint is accessible
    return !!this.webhookConfig.endpoints.incoming
  }

  private async validateOutgoingEndpoint(): Promise<boolean> {
    if (!this.webhookConfig.endpoints.outgoing) {
      return true // Optional endpoint
    }

    try {
      const response = await fetch(this.webhookConfig.endpoints.outgoing, {
        method: 'HEAD',
        timeout: 5000
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  private async getQueuedWebhooks(): Promise<OutgoingWebhook[]> {
    // In a real implementation, this would fetch from database
    // For now, return empty array
    return []
  }

  private async storeOutgoingWebhook(webhook: OutgoingWebhook): Promise<void> {
    // Store webhook in database queue
    this.log('info', 'Storing outgoing webhook', { id: webhook.id })
  }

  private async storeIncomingWebhook(event: WebhookEvent): Promise<void> {
    // Store incoming webhook for audit trail
    this.log('info', 'Storing incoming webhook', { id: event.id, type: event.type })
  }

  private async updateWebhookStatus(id: string, success: boolean, error?: string): Promise<void> {
    // Update webhook status in database
    this.log('info', 'Updating webhook status', { id, success, error })
  }

  private async scheduleWebhookRetry(webhook: OutgoingWebhook): Promise<void> {
    if (webhook.attempts >= this.webhookConfig.retries.maxAttempts) {
      this.log('error', 'Webhook max retries exceeded', { id: webhook.id })
      return
    }

    const delay = this.webhookConfig.retries.backoffMs * Math.pow(2, webhook.attempts)
    const nextAttempt = new Date(Date.now() + delay)

    this.log('info', 'Scheduling webhook retry', { 
      id: webhook.id, 
      attempt: webhook.attempts + 1,
      nextAttempt 
    })

    // In a real implementation, this would schedule the retry
    // Could use a job queue like Bull or similar
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    switch (this.webhookConfig.authentication.type) {
      case 'token':
        if (this.webhookConfig.authentication.token) {
          headers['Authorization'] = `Bearer ${this.webhookConfig.authentication.token}`
        }
        break

      case 'basic':
        if (this.webhookConfig.authentication.username && this.webhookConfig.authentication.password) {
          const credentials = Buffer.from(
            `${this.webhookConfig.authentication.username}:${this.webhookConfig.authentication.password}`
          ).toString('base64')
          headers['Authorization'] = `Basic ${credentials}`
        }
        break

      case 'signature':
        // Signature is added per request, not as a header
        break
    }

    return headers
  }

  // Webhook-specific utility methods
  async subscribeToEvents(events: string[]): Promise<void> {
    this.webhookConfig.events.subscribe = [...new Set([...this.webhookConfig.events.subscribe, ...events])]
    await this.updateConfig({ settings: { ...this.config.settings, webhook: this.webhookConfig } })
  }

  async unsubscribeFromEvents(events: string[]): Promise<void> {
    this.webhookConfig.events.subscribe = this.webhookConfig.events.subscribe.filter(e => !events.includes(e))
    await this.updateConfig({ settings: { ...this.config.settings, webhook: this.webhookConfig } })
  }

  getSubscribedEvents(): string[] {
    return [...this.webhookConfig.events.subscribe]
  }

  async retryFailedWebhooks(): Promise<void> {
    const failedWebhooks = await this.getQueuedWebhooks()
    
    for (const webhook of failedWebhooks) {
      if (!webhook.success && webhook.attempts < this.webhookConfig.retries.maxAttempts) {
        try {
          await this.sendWebhook(webhook)
        } catch (error) {
          this.log('warn', 'Retry failed for webhook', { id: webhook.id, error })
        }
      }
    }
  }
}