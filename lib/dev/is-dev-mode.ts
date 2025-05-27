/**
 * Check if the app is running in dev mode with auto-login enabled
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_AUTO_LOGIN === 'true'
}

/**
 * Get mock organization data for dev mode
 */
export function getMockOrganization() {
  return {
    id: 'dev-org-001',
    name: 'Test Charity Foundation',
    charity_number: 'DEV123456',
    website: 'https://charitytest.org',
    email: 'admin@charitytest.org',
    phone: '+44 20 1234 5678',
    address_line1: '123 Test Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom',
    financial_year_end: '2024-03-31',
    charity_type: 'CIO',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    income_band: 'medium' as const,
    logo_url: null,
    primary_color: '#6366f1',
    settings: {},
    reminder_days_before: 30,
    primary_email: 'admin@charitytest.org',
    address_line2: null,
    status: 'active' as const,
    registration_date: null,
    subscription_tier: 'standard' as const,
    subscription_status: 'active' as const,
    deleted_at: null
  }
}

/**
 * Get mock user data for dev mode
 */
export function getMockUser() {
  return {
    id: 'dev-user-123',
    email: 'dev@charityprep.uk',
    full_name: 'Dev Admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: null,
    phone: null,
    email_notifications: true,
    sms_notifications: false,
    weekly_digest: true,
    last_login_at: new Date().toISOString()
  }
}