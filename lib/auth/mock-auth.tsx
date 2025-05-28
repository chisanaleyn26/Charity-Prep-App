'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'

// Mock user data
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

// Mock organization data
const mockOrganization = {
  id: 'mock-org-123',
  name: 'Example Charity Foundation',
  charity_number: '1234567',
  year_end: '03-31',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

interface MockAuthContextType {
  user: User
  organization: typeof mockOrganization
  signOut: () => Promise<void>
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const signOut = async () => {
    // In mock mode, just refresh the page
    window.location.href = '/'
  }

  return (
    <MockAuthContext.Provider value={{ user: mockUser, organization: mockOrganization, signOut }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider')
  }
  return context
}