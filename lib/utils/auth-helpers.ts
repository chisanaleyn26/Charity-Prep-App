/**
 * Auth Helper Utilities
 * Handles dynamic callback URLs for different environments
 */

/**
 * Gets the correct callback URL for authentication
 * Handles Replit's dynamic domains and local development
 */
export function getAuthCallbackUrl(request?: Request): string {
  // If we have a request object, use its URL as the base
  if (request) {
    const url = new URL(request.url)
    return `${url.protocol}//${url.host}/api/auth/callback`
  }

  // Check if we're in a Replit environment
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    // Try to get the current domain from various sources
    
    // 1. Check for REPLIT_DEV_DOMAIN (newer Replit deployments)
    if (process.env.REPLIT_DEV_DOMAIN) {
      return `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/callback`
    }
    
    // 2. Check for explicit NEXT_PUBLIC_SITE_URL
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
    }
    
    // 3. Fallback to constructed Replit URL
    const replitUrl = `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co`
    return `${replitUrl}/api/auth/callback`
  }

  // Use configured site URL or fallback to localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${siteUrl}/api/auth/callback`
}

/**
 * Gets all possible callback URLs for Supabase configuration
 * This helps with configuring multiple redirect URLs in Supabase
 */
export function getAllPossibleCallbackUrls(): string[] {
  const urls: string[] = []

  // Add configured URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    urls.push(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`)
  }

  // Add Replit variations
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    // Modern Replit URL format
    urls.push(`https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co/api/auth/callback`)
    
    // Legacy Replit URL format
    urls.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/callback`)
    
    // Development domain if available
    if (process.env.REPLIT_DEV_DOMAIN) {
      urls.push(`https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/callback`)
    }
  }

  // Add localhost for development
  urls.push('http://localhost:3000/api/auth/callback')

  // Remove duplicates
  return [...new Set(urls)]
}

/**
 * Validates if a URL is in the allowed redirect list
 */
export function isValidRedirectUrl(url: string, allowedUrls: string[]): boolean {
  try {
    const testUrl = new URL(url)
    return allowedUrls.some(allowed => {
      const allowedUrl = new URL(allowed)
      return testUrl.hostname === allowedUrl.hostname && 
             testUrl.pathname === allowedUrl.pathname
    })
  } catch {
    return false
  }
}