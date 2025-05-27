'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Development-only authentication bypass
// This creates a proper cookie-based session that works with server components

export interface DevUser {
  id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  orgName: string
  orgId: string
}

const DEV_USERS: DevUser[] = [
  {
    id: 'dev-admin-001',
    email: 'admin@charitytest.org',
    role: 'admin',
    orgName: 'Test Charity Foundation',
    orgId: 'dev-org-001'
  },
  {
    id: 'dev-member-001', 
    email: 'member@charitytest.org',
    role: 'member',
    orgName: 'Test Charity Foundation',
    orgId: 'dev-org-001'
  },
  {
    id: 'dev-viewer-001',
    email: 'viewer@charitytest.org', 
    role: 'viewer',
    orgName: 'Test Charity Foundation',
    orgId: 'dev-org-001'
  }
]

export async function devLogin(userId: string) {
  'use server'
  
  const user = DEV_USERS.find(u => u.id === userId)
  if (!user) {
    throw new Error('Invalid dev user')
  }

  // Create a dev session cookie that mimics Supabase auth
  const devSession = {
    access_token: `dev-token-${user.id}`,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: `Test User (${user.role})`,
        organization_id: user.orgId,
        role: user.role
      }
    },
    expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }

  // Set cookie that can be read by server components
  const cookieStore = await cookies()
  cookieStore.set('dev-auth-session', JSON.stringify(devSession), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 // 24 hours
  })

  // Redirect to dashboard
  redirect('/dashboard')
}

export async function getDevSession() {
  'use server'
  
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('dev-auth-session')
  
  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    
    // Check if session is still valid
    if (session.expires_at < Date.now()) {
      cookieStore.delete('dev-auth-session')
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function clearDevSession() {
  'use server'
  
  const cookieStore = await cookies()
  cookieStore.delete('dev-auth-session')
}

// Helper to check if we're in dev mode with a dev session
export async function isDevAuthenticated() {
  'use server'
  
  const session = await getDevSession()
  return !!session
}

// Create a mock organization for development
export async function createMockOrganization(devSession: any) {
  'use server'
  
  return {
    id: devSession.user.user_metadata.organization_id,
    name: 'Test Charity Foundation',
    charity_number: '1234567',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      theme: 'light',
      notifications: true
    }
  }
}