'use server'

import { User } from '@supabase/supabase-js'

// Enable mock mode through environment variable or hardcoded for now
const MOCK_MODE = true

// Mock user matching the client-side mock
const mockUser: User = {
  id: 'mock-user-123',
  email: 'john.doe@charity.org',
  app_metadata: {},
  user_metadata: {
    full_name: 'John Doe'
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  confirmation_sent_at: new Date().toISOString(),
  recovery_sent_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  phone: null,
  confirmed_at: new Date().toISOString(),
  email_change_sent_at: new Date().toISOString(),
  new_email: null,
  invited_at: new Date().toISOString(),
  action_link: null,
  phone_confirmed_at: null,
  phone_change_sent_at: null,
  new_phone: null,
  reauthentication_sent_at: null,
  is_anonymous: false,
  factors: null
}

export async function requireAuthMock() {
  if (MOCK_MODE) {
    return mockUser
  }
  // Fall back to real auth
  const { requireAuth } = await import('./utils')
  return requireAuth()
}

export async function requireOrgAccessMock(organizationId: string, minRole?: 'viewer' | 'member' | 'admin') {
  if (MOCK_MODE) {
    // Always return admin role in mock mode
    return 'admin'
  }
  // Fall back to real auth
  const { requireOrgAccess } = await import('./utils')
  return requireOrgAccess(organizationId, minRole)
}