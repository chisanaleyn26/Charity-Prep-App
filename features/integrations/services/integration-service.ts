import { createServerClient } from '@/lib/supabase/server'
import { 
  IntegrationRegistry,
  BaseIntegration,
  IntegrationConfig,
  IntegrationAuthConfig,
  IntegrationCapabilities,
  SyncResult,
  SyncOptions,
  WebhookEvent
} from '@/lib/integrations/base-integration'
import { CharityCommissionIntegration } from '@/lib/integrations/providers/charity-commission'
import { SlackIntegration } from '@/lib/integrations/providers/slack'
import { WebhookIntegration } from '@/lib/integrations/providers/webhook'
import { z } from 'zod'

// Register all available integrations
IntegrationRegistry.register('charity-commission', CharityCommissionIntegration)
IntegrationRegistry.register('slack', SlackIntegration)
IntegrationRegistry.register('webhook', WebhookIntegration)

export interface IntegrationSetupData {
  name: string
  category: 'accounting' | 'communication' | 'calendar' | 'regulatory' | 'payment' | 'storage'
  provider: string
  settings: Record<string, any>
  credentials: Record<string, string>
  enabled?: boolean
}

export class IntegrationService {
  private supabase = createServerClient()

  // Get all integrations for an organization
  async getIntegrations(organizationId: string): Promise<IntegrationConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(this.mapDatabaseToConfig)
    } catch (error) {
      console.error('Error fetching integrations:', error)
      return []
    }
  }

  // Get a specific integration
  async getIntegration(organizationId: string, integrationId: string): Promise<IntegrationConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('id', integrationId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return this.mapDatabaseToConfig(data)
    } catch (error) {
      console.error('Error fetching integration:', error)
      return null
    }
  }

  // Create a new integration
  async createIntegration(organizationId: string, setupData: IntegrationSetupData): Promise<IntegrationConfig> {
    try {
      const integrationData = {
        organization_id: organizationId,
        name: setupData.name,
        category: setupData.category,
        provider: setupData.provider,
        settings: setupData.settings,
        credentials: setupData.credentials, // In production, encrypt these
        enabled: setupData.enabled ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('integrations')
        .insert(integrationData)
        .select()
        .single()

      if (error) throw error

      const config = this.mapDatabaseToConfig(data)

      // Test the integration connection
      try {
        const instance = await this.createIntegrationInstance(config)
        if (instance) {
          const connectionTest = await instance.testConnection()
          if (!connectionTest) {
            console.warn('Integration created but connection test failed')
          }
        }
      } catch (error) {
        console.warn('Integration created but failed to test connection:', error)
      }

      return config
    } catch (error) {
      console.error('Error creating integration:', error)
      throw error
    }
  }

  // Update an integration
  async updateIntegration(
    organizationId: string,
    integrationId: string,
    updates: Partial<IntegrationSetupData>
  ): Promise<IntegrationConfig | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('integrations')
        .update(updateData)
        .eq('organization_id', organizationId)
        .eq('id', integrationId)
        .select()
        .single()

      if (error) throw error

      return this.mapDatabaseToConfig(data)
    } catch (error) {
      console.error('Error updating integration:', error)
      return null
    }
  }

  // Delete an integration
  async deleteIntegration(organizationId: string, integrationId: string): Promise<boolean> {
    try {
      // First disconnect the integration
      const integration = await this.getIntegration(organizationId, integrationId)
      if (integration) {
        const instance = await this.createIntegrationInstance(integration)
        if (instance) {
          await instance.disconnect()
        }
      }

      const { error } = await this.supabase
        .from('integrations')
        .delete()
        .eq('organization_id', organizationId)
        .eq('id', integrationId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error deleting integration:', error)
      return false
    }
  }

  // Sync a specific integration
  async syncIntegration(
    organizationId: string,
    integrationId: string,
    options?: SyncOptions
  ): Promise<SyncResult> {
    try {
      const config = await this.getIntegration(organizationId, integrationId)
      if (!config) {
        throw new Error('Integration not found')
      }

      if (!config.enabled) {
        throw new Error('Integration is disabled')
      }

      const instance = await this.createIntegrationInstance(config)
      if (!instance) {
        throw new Error('Failed to create integration instance')
      }

      const result = await instance.sync(options)

      // Update last sync time
      await this.supabase
        .from('integrations')
        .update({
          last_sync: new Date().toISOString(),
          last_sync_status: result.success ? 'success' : 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId)

      // Log sync result
      await this.logSyncResult(integrationId, result)

      return result
    } catch (error) {
      console.error('Error syncing integration:', error)
      
      // Log failed sync
      await this.supabase
        .from('integrations')
        .update({
          last_sync: new Date().toISOString(),
          last_sync_status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId)

      throw error
    }
  }

  // Sync all enabled integrations for an organization
  async syncAllIntegrations(organizationId: string, options?: SyncOptions): Promise<SyncResult[]> {
    const integrations = await this.getIntegrations(organizationId)
    const enabledIntegrations = integrations.filter(i => i.enabled)

    const results: SyncResult[] = []

    for (const integration of enabledIntegrations) {
      try {
        const result = await this.syncIntegration(organizationId, integration.id, options)
        results.push(result)
      } catch (error) {
        console.error(`Failed to sync integration ${integration.name}:`, error)
        results.push({
          success: false,
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          errors: [{
            record: { integration: integration.name },
            error: error instanceof Error ? error.message : 'Unknown error'
          }]
        })
      }
    }

    return results
  }

  // Process incoming webhook
  async processWebhook(
    organizationId: string,
    integrationId: string,
    event: WebhookEvent
  ): Promise<void> {
    try {
      const config = await this.getIntegration(organizationId, integrationId)
      if (!config) {
        throw new Error('Integration not found')
      }

      if (!config.enabled) {
        throw new Error('Integration is disabled')
      }

      const instance = await this.createIntegrationInstance(config)
      if (!instance) {
        throw new Error('Failed to create integration instance')
      }

      await instance.processWebhook(event)

      // Log webhook processing
      await this.logWebhookEvent(integrationId, event, true)

    } catch (error) {
      console.error('Error processing webhook:', error)
      
      // Log failed webhook
      await this.logWebhookEvent(integrationId, event, false, error instanceof Error ? error.message : 'Unknown error')
      
      throw error
    }
  }

  // Test integration connection
  async testIntegration(organizationId: string, integrationId: string): Promise<boolean> {
    try {
      const config = await this.getIntegration(organizationId, integrationId)
      if (!config) {
        return false
      }

      const instance = await this.createIntegrationInstance(config)
      if (!instance) {
        return false
      }

      return await instance.testConnection()
    } catch (error) {
      console.error('Error testing integration:', error)
      return false
    }
  }

  // Get available integration providers
  getAvailableProviders(): Array<{
    id: string
    name: string
    category: string
    description: string
    capabilities: IntegrationCapabilities
  }> {
    return [
      {
        id: 'charity-commission',
        name: 'Charity Commission',
        category: 'regulatory',
        description: 'Sync charity information from the UK Charity Commission',
        capabilities: {
          sync: true,
          webhook: false,
          realtime: false,
          bidirectional: false,
          bulkOperations: true,
          fieldMapping: true
        }
      },
      {
        id: 'slack',
        name: 'Slack',
        category: 'communication',
        description: 'Send notifications and alerts to Slack channels',
        capabilities: {
          sync: false,
          webhook: true,
          realtime: true,
          bidirectional: false,
          bulkOperations: false,
          fieldMapping: false
        }
      },
      {
        id: 'webhook',
        name: 'Generic Webhook',
        category: 'accounting',
        description: 'Connect to any system that supports webhooks',
        capabilities: {
          sync: true,
          webhook: true,
          realtime: true,
          bidirectional: true,
          bulkOperations: false,
          fieldMapping: true
        }
      }
    ]
  }

  // Get integration sync history
  async getSyncHistory(
    organizationId: string,
    integrationId: string,
    limit = 50
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('integration_sync_logs')
        .select('*')
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching sync history:', error)
      return []
    }
  }

  // Private helper methods
  private async createIntegrationInstance(config: IntegrationConfig): Promise<BaseIntegration | null> {
    const authConfig: IntegrationAuthConfig = {
      type: config.settings.authType || 'api_key',
      authUrl: config.settings.authUrl,
      tokenUrl: config.settings.tokenUrl,
      scopes: config.settings.scopes,
      clientId: config.settings.clientId,
      clientSecret: config.settings.clientSecret,
      redirectUri: config.settings.redirectUri
    }

    const capabilities = this.getProviderCapabilities(config.settings.provider)

    return await IntegrationRegistry.createInstance(
      config.settings.provider,
      config,
      authConfig,
      capabilities
    )
  }

  private getProviderCapabilities(provider: string): IntegrationCapabilities {
    const providers = this.getAvailableProviders()
    const providerInfo = providers.find(p => p.id === provider)
    
    return providerInfo?.capabilities || {
      sync: false,
      webhook: false,
      realtime: false,
      bidirectional: false,
      bulkOperations: false,
      fieldMapping: false
    }
  }

  private mapDatabaseToConfig(data: any): IntegrationConfig {
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      category: data.category,
      enabled: data.enabled,
      settings: {
        ...data.settings,
        provider: data.provider
      },
      credentials: data.credentials,
      webhookUrl: data.webhook_url,
      lastSync: data.last_sync ? new Date(data.last_sync) : undefined,
      syncFrequency: data.sync_frequency
    }
  }

  private async logSyncResult(integrationId: string, result: SyncResult): Promise<void> {
    try {
      await this.supabase
        .from('integration_sync_logs')
        .insert({
          integration_id: integrationId,
          success: result.success,
          records_processed: result.recordsProcessed,
          records_created: result.recordsCreated,
          records_updated: result.recordsUpdated,
          records_skipped: result.recordsSkipped,
          errors: result.errors,
          metadata: result.metadata,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging sync result:', error)
    }
  }

  private async logWebhookEvent(
    integrationId: string,
    event: WebhookEvent,
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('integration_webhook_logs')
        .insert({
          integration_id: integrationId,
          event_id: event.id,
          event_type: event.type,
          event_source: event.source,
          success,
          error,
          data: event.data,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging webhook event:', error)
    }
  }
}

// Singleton instance
const integrationService = new IntegrationService()
export default integrationService

// Convenience functions
export const getIntegrations = (orgId: string) => integrationService.getIntegrations(orgId)
export const createIntegration = (orgId: string, data: IntegrationSetupData) => integrationService.createIntegration(orgId, data)
export const syncIntegration = (orgId: string, integrationId: string, options?: SyncOptions) => integrationService.syncIntegration(orgId, integrationId, options)
export const processWebhook = (orgId: string, integrationId: string, event: WebhookEvent) => integrationService.processWebhook(orgId, integrationId, event)