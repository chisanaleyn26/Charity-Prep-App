/**
 * Development Authentication Helper
 * Provides mock authentication for development/testing
 */

export interface DevSession {
  user_id: string
  organization_id: string
  email: string
}

/**
 * Get development session for testing
 * Returns null in production, mock session in development
 */
export async function getDevSession(): Promise<DevSession | null> {
  // Only enable in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  // Check if dev mode is explicitly enabled
  if (process.env.NEXT_PUBLIC_MOCK_MODE !== 'true') {
    return null
  }
  
  // Return mock session for development
  return {
    user_id: 'dev-user-12345',
    organization_id: 'dev-org-67890', 
    email: 'dev@example.com'
  }
}