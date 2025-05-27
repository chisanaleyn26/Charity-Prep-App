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

interface CharityData {
  charity_number: string
  name: string
  status: string
  registration_date: string
  removal_date?: string
  charity_type: string
  latest_income?: number
  latest_expenditure?: number
  contact: {
    email?: string
    phone?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      postcode?: string
      country?: string
    }
  }
  activities: string[]
  purposes: string[]
  trustees: Array<{
    name: string
    appointment_date: string
    removal_date?: string
  }>
  subsidiaries?: Array<{
    number: string
    name: string
  }>
}

export class CharityCommissionIntegration extends BaseIntegration {
  private readonly baseUrl = 'https://api.charitycommission.gov.uk/register/api'
  private apiKey: string

  constructor(config: IntegrationConfig, authConfig: IntegrationAuthConfig) {
    super(config, authConfig, {
      sync: true,
      webhook: false,
      realtime: false,
      bidirectional: false,
      bulkOperations: true,
      fieldMapping: true
    })

    this.apiKey = config.credentials.apiKey
    if (!this.apiKey) {
      throw new AuthenticationError('Charity Commission API key is required')
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      // Test the API key with a simple request
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/charity-search?take=1`
      )
      
      if (response.status === 401) {
        throw new AuthenticationError('Invalid API key')
      }

      return response.ok
    } catch (error) {
      this.log('error', 'Authentication failed', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    return this.authenticate()
  }

  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      this.log('info', 'Starting Charity Commission sync', options)

      if (!await this.authenticate()) {
        throw new AuthenticationError('Authentication failed')
      }

      const charityNumber = this.config.settings.charityNumber
      if (!charityNumber) {
        throw new SyncError('Charity number not configured')
      }

      // Fetch charity data
      const charityData = await this.fetchCharityData(charityNumber)
      
      if (!charityData) {
        return {
          success: false,
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          errors: [{
            record: { charity_number: charityNumber },
            error: 'Charity not found'
          }]
        }
      }

      // Update organization data
      const updateResult = await this.updateOrganizationData(charityData)

      return {
        success: true,
        recordsProcessed: 1,
        recordsCreated: 0,
        recordsUpdated: updateResult ? 1 : 0,
        recordsSkipped: updateResult ? 0 : 1,
        errors: [],
        metadata: {
          charityNumber,
          lastIncome: charityData.latest_income,
          status: charityData.status
        }
      }

    } catch (error) {
      this.log('error', 'Sync failed', error)
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

  private async fetchCharityData(charityNumber: string): Promise<CharityData | null> {
    try {
      // Get basic charity information
      const basicResponse = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/charity-search?registered_charity_number=${charityNumber}`
      )

      if (!basicResponse.ok) {
        if (basicResponse.status === 404) {
          return null
        }
        throw new Error(`API request failed: ${basicResponse.status}`)
      }

      const basicData = await basicResponse.json()
      
      if (!basicData || basicData.length === 0) {
        return null
      }

      const charity = basicData[0]

      // Get detailed information
      const [detailResponse, trusteesResponse, subsidiariesResponse] = await Promise.all([
        this.makeAuthenticatedRequest(`${this.baseUrl}/charity/${charityNumber}`),
        this.makeAuthenticatedRequest(`${this.baseUrl}/charity/${charityNumber}/trustees`),
        this.makeAuthenticatedRequest(`${this.baseUrl}/charity/${charityNumber}/subsidiary-or-group-details`)
      ])

      const detail = detailResponse.ok ? await detailResponse.json() : {}
      const trustees = trusteesResponse.ok ? await trusteesResponse.json() : []
      const subsidiaries = subsidiariesResponse.ok ? await subsidiariesResponse.json() : []

      return {
        charity_number: charity.registered_charity_number,
        name: charity.charity_name,
        status: charity.charity_status,
        registration_date: charity.date_of_registration,
        removal_date: charity.date_of_removal,
        charity_type: charity.charity_type,
        latest_income: detail.latest_income,
        latest_expenditure: detail.latest_expenditure,
        contact: {
          email: detail.charity_contact_email,
          phone: detail.charity_contact_phone,
          address: detail.charity_contact_address ? {
            line1: detail.charity_contact_address.address_line_1,
            line2: detail.charity_contact_address.address_line_2,
            city: detail.charity_contact_address.locality,
            postcode: detail.charity_contact_address.postal_code,
            country: detail.charity_contact_address.country
          } : undefined
        },
        activities: detail.charity_activities || [],
        purposes: detail.charity_purposes || [],
        trustees: (trustees || []).map((trustee: any) => ({
          name: trustee.trustee_name,
          appointment_date: trustee.trustee_date_of_appointment,
          removal_date: trustee.trustee_date_of_cessation
        })),
        subsidiaries: (subsidiaries || []).map((sub: any) => ({
          number: sub.subsidiary_or_group_registered_charity_number,
          name: sub.subsidiary_or_group_charity_name
        }))
      }

    } catch (error) {
      this.log('error', 'Failed to fetch charity data', error)
      throw new SyncError('Failed to fetch charity data from Charity Commission')
    }
  }

  private async updateOrganizationData(charityData: CharityData): Promise<boolean> {
    try {
      // This would normally update the organization in the database
      // For now, we'll just log what would be updated
      
      const updates = {
        name: charityData.name,
        charity_number: charityData.charity_number,
        charity_status: charityData.status,
        registration_date: charityData.registration_date,
        latest_income: charityData.latest_income,
        latest_expenditure: charityData.latest_expenditure,
        contact_email: charityData.contact.email,
        contact_phone: charityData.contact.phone,
        address: charityData.contact.address,
        activities: charityData.activities,
        purposes: charityData.purposes,
        last_commission_sync: new Date().toISOString()
      }

      this.log('info', 'Would update organization with Charity Commission data', updates)

      // Here you would actually update the database:
      // await supabase.from('organizations').update(updates).eq('id', this.config.organizationId)

      return true

    } catch (error) {
      this.log('error', 'Failed to update organization data', error)
      return false
    }
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    return {
      'Ocp-Apim-Subscription-Key': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  // Additional methods specific to Charity Commission
  async searchCharities(query: string, limit = 10): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/charity-search?charity_name=${encodeURIComponent(query)}&take=${limit}`
      )

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      this.log('error', 'Charity search failed', error)
      throw new SyncError('Failed to search charities')
    }
  }

  async validateCharityNumber(charityNumber: string): Promise<boolean> {
    try {
      const charityData = await this.fetchCharityData(charityNumber)
      return charityData !== null
    } catch (error) {
      return false
    }
  }

  async getCharityFinancials(charityNumber: string): Promise<any> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/charity/${charityNumber}/accounts`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      this.log('error', 'Failed to fetch charity financials', error)
      throw new SyncError('Failed to fetch charity financials')
    }
  }
}