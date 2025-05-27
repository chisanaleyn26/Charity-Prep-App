/**
 * Application Configuration
 * Centralized config for feature flags and environment settings
 */

export const appConfig = {
  // Feature flags
  features: {
    /**
     * Mock mode for development
     * Set to false for production or when Supabase auth is fully configured
     */
    mockMode: process.env.NEXT_PUBLIC_MOCK_MODE === 'true',
    
    /**
     * AI features enabled
     * Requires OpenRouter API key
     */
    aiEnabled: !!process.env.OPENROUTER_API_KEY,
    
    /**
     * Email processing enabled
     * Requires email provider webhook setup
     */
    emailProcessingEnabled: process.env.NODE_ENV === 'production',
    
    /**
     * Real-time features enabled
     */
    realtime: true,
    
    /**
     * Analytics and monitoring
     */
    analyticsEnabled: process.env.NODE_ENV === 'production',
  },
  
  // Mock data for development
  mockData: {
    organization: {
      id: 'mock-org-123',
      name: 'Example Charity Foundation',
      charity_number: '1234567',
      year_end: '03-31',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      address_line1: null,
      address_line2: null,
      charity_type: null,
      city: null,
      country: 'UK',
      postcode: null,
      email: null,
      phone: null,
      website: null,
      income_band: null,
      financial_year_end: null,
      registration_date: null,
      status: 'active' as const,
      settings: null,
      subscription_tier: null,
      subscription_status: null
    },
    user: {
      id: 'mock-user-123',
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      role: 'admin'
    }
  },
  
  // Environment settings
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  }
}

export type AppConfig = typeof appConfig