import { 
  BaseIntegration, 
  IntegrationConfig, 
  IntegrationAuthConfig, 
  IntegrationCapabilities,
  SyncResult,
  SyncOptions,
  AuthenticationError,
  SyncError
} from '../base-integration'

interface SlackMessage {
  channel: string
  text?: string
  blocks?: any[]
  attachments?: any[]
  thread_ts?: string
  username?: string
  icon_emoji?: string
  icon_url?: string
}

interface SlackNotificationConfig {
  channels: {
    general?: string
    compliance?: string
    alerts?: string
    reports?: string
  }
  templates: {
    compliance_alert: string
    subscription_update: string
    report_ready: string
    deadline_reminder: string
  }
  mentions: {
    urgent: string[]
    compliance: string[]
  }
}

export class SlackIntegration extends BaseIntegration {
  private readonly baseUrl = 'https://slack.com/api'
  private botToken: string
  private notificationConfig: SlackNotificationConfig

  constructor(config: IntegrationConfig, authConfig: IntegrationAuthConfig) {
    super(config, authConfig, {
      sync: false,
      webhook: true,
      realtime: true,
      bidirectional: false,
      bulkOperations: false,
      fieldMapping: false
    })

    this.botToken = config.credentials.botToken
    this.notificationConfig = config.settings.notifications || {
      channels: {},
      templates: {},
      mentions: { urgent: [], compliance: [] }
    }

    if (!this.botToken) {
      throw new AuthenticationError('Slack bot token is required')
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/auth.test`)
      const data = await response.json()
      
      if (!data.ok) {
        throw new AuthenticationError(`Slack auth failed: ${data.error}`)
      }

      this.log('info', 'Slack authentication successful', { 
        team: data.team, 
        user: data.user,
        bot_id: data.bot_id 
      })

      return true
    } catch (error) {
      this.log('error', 'Slack authentication failed', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!await this.authenticate()) {
        return false
      }

      // Test by sending a test message to the general channel
      const testChannel = this.notificationConfig.channels.general || 'general'
      
      await this.sendMessage({
        channel: testChannel,
        text: '🧪 Test message from Charity Prep - integration is working!'
      })

      return true
    } catch (error) {
      this.log('error', 'Slack connection test failed', error)
      return false
    }
  }

  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    // Slack doesn't really have a traditional sync operation
    // Instead, we'll test the connection and return a minimal result
    try {
      const success = await this.testConnection()
      
      return {
        success,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        errors: success ? [] : [{ record: {}, error: 'Connection test failed' }]
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        errors: [{ record: {}, error: error instanceof Error ? error.message : 'Unknown error' }]
      }
    }
  }

  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Failed to send message: ${data.error}`)
      }

      this.log('info', 'Message sent successfully', { channel: message.channel, ts: data.ts })
      return true

    } catch (error) {
      this.log('error', 'Failed to send Slack message', error)
      throw new SyncError('Failed to send Slack message')
    }
  }

  async sendComplianceAlert(type: 'urgent' | 'warning' | 'info', message: string, details?: any): Promise<void> {
    const channel = this.notificationConfig.channels.compliance || this.notificationConfig.channels.general || 'general'
    
    const colors = {
      urgent: '#FF0000',
      warning: '#FFA500', 
      info: '#0066CC'
    }

    const icons = {
      urgent: '🚨',
      warning: '⚠️',
      info: 'ℹ️'
    }

    const mentions = type === 'urgent' ? this.notificationConfig.mentions.urgent : this.notificationConfig.mentions.compliance

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${icons[type]} Compliance ${type.charAt(0).toUpperCase() + type.slice(1)}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]

    if (details) {
      blocks.push({
        type: 'section',
        fields: Object.entries(details).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}:*\n${value}`
        }))
      })
    }

    if (mentions.length > 0) {
      blocks.push({
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `cc: ${mentions.map(user => `<@${user}>`).join(' ')}`
        }]
      })
    }

    await this.sendMessage({
      channel,
      blocks,
      username: 'Charity Prep',
      icon_emoji: ':classical_building:'
    })
  }

  async sendSubscriptionNotification(type: 'upgraded' | 'downgraded' | 'canceled' | 'payment_failed', details: any): Promise<void> {
    const channel = this.notificationConfig.channels.general || 'general'
    
    const messages = {
      upgraded: '🎉 Subscription upgraded successfully!',
      downgraded: '📉 Subscription plan changed',
      canceled: '❌ Subscription canceled',
      payment_failed: '💳 Payment failed - action required'
    }

    const colors = {
      upgraded: '#00FF00',
      downgraded: '#FFA500',
      canceled: '#FF0000',
      payment_failed: '#FF0000'
    }

    await this.sendMessage({
      channel,
      attachments: [{
        color: colors[type],
        title: messages[type],
        fields: [
          { title: 'Plan', value: details.plan || 'N/A', short: true },
          { title: 'Amount', value: details.amount || 'N/A', short: true },
          { title: 'Organization', value: details.organizationName || 'N/A', short: true },
          { title: 'Date', value: new Date().toLocaleDateString(), short: true }
        ],
        footer: 'Charity Prep Billing',
        ts: Math.floor(Date.now() / 1000)
      }],
      username: 'Charity Prep',
      icon_emoji: ':moneybag:'
    })
  }

  async sendReportNotification(reportType: string, reportUrl: string, organizationName: string): Promise<void> {
    const channel = this.notificationConfig.channels.reports || this.notificationConfig.channels.general || 'general'
    
    await this.sendMessage({
      channel,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Report Ready'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `A new *${reportType}* report has been generated for *${organizationName}*`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Report'
              },
              url: reportUrl,
              style: 'primary'
            }
          ]
        }
      ],
      username: 'Charity Prep',
      icon_emoji: ':bar_chart:'
    })
  }

  async sendDeadlineReminder(deadline: string, description: string, daysUntil: number): Promise<void> {
    const channel = this.notificationConfig.channels.compliance || this.notificationConfig.channels.general || 'general'
    
    const urgency = daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'warning' : 'info'
    const icon = daysUntil <= 3 ? '🚨' : daysUntil <= 7 ? '⚠️' : '📅'
    
    await this.sendMessage({
      channel,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${icon} Compliance Deadline Reminder`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${description}*\n\nDeadline: ${deadline}\nDays remaining: ${daysUntil}`
          }
        }
      ],
      username: 'Charity Prep',
      icon_emoji: ':calendar:'
    })

    if (urgency === 'urgent') {
      const mentions = this.notificationConfig.mentions.urgent
      if (mentions.length > 0) {
        await this.sendMessage({
          channel,
          text: `Urgent deadline reminder: ${mentions.map(user => `<@${user}>`).join(' ')}`
        })
      }
    }
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    return {
      'Authorization': `Bearer ${this.botToken}`,
      'Content-Type': 'application/json'
    }
  }

  // Slack-specific utility methods
  async getChannels(): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/conversations.list?types=public_channel,private_channel`)
      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Failed to get channels: ${data.error}`)
      }

      return data.channels
    } catch (error) {
      this.log('error', 'Failed to get Slack channels', error)
      return []
    }
  }

  async getUsers(): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/users.list`)
      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Failed to get users: ${data.error}`)
      }

      return data.members
    } catch (error) {
      this.log('error', 'Failed to get Slack users', error)
      return []
    }
  }

  async createChannel(name: string, isPrivate = false): Promise<string | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/conversations.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          is_private: isPrivate
        })
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Failed to create channel: ${data.error}`)
      }

      return data.channel.id
    } catch (error) {
      this.log('error', 'Failed to create Slack channel', error)
      return null
    }
  }
}