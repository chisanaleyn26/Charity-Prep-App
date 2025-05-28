/**
 * NextJS 15 Caching Utilities
 * Provides caching functions with proper typing and configuration
 */

import { unstable_cache } from 'next/cache'

/**
 * Generic cache wrapper for creating cached functions
 * Preserves function typing while adding caching
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options?: {
    revalidate?: number
    tags?: string[]
  }
): T {
  return unstable_cache(fn, keyParts, options) as T
}

/**
 * Default cache configurations
 */
export const CACHE_CONFIG = {
  // Short-lived caches (5 minutes)
  SHORT: {
    revalidate: 300,
  },
  // Medium-lived caches (1 hour)
  MEDIUM: {
    revalidate: 3600,
  },
  // Long-lived caches (24 hours)
  LONG: {
    revalidate: 86400,
  },
  // Real-time data (1 minute)
  REALTIME: {
    revalidate: 60,
  },
} as const

/**
 * Common cache tags for invalidation
 */
export const CACHE_TAGS = {
  // Organization-level tags
  organization: (id: string) => [`organization`, `org-${id}`],
  organizationAll: (id: string) => [`org-${id}`],
  
  // Compliance module tags
  compliance: (orgId: string) => [`compliance`, `org-${orgId}-compliance`],
  safeguarding: (orgId: string) => [`safeguarding`, `org-${orgId}-safeguarding`],
  overseas: (orgId: string) => [`overseas`, `org-${orgId}-overseas`],
  fundraising: (orgId: string) => [`fundraising`, `org-${orgId}-fundraising`],
  
  // Document tags
  documents: (orgId: string) => [`documents`, `org-${orgId}-documents`],
  
  // Report tags
  reports: (orgId: string) => [`reports`, `org-${orgId}-reports`],
  annualReturn: (orgId: string) => [`annual-return`, `org-${orgId}-annual-return`],
  boardPack: (orgId: string) => [`board-pack`, `org-${orgId}-board-pack`],
  
  // User tags
  user: (userId: string) => [`user`, `user-${userId}`],
  userOrgs: (userId: string) => [`user-orgs`, `user-${userId}-orgs`],
} as const

/**
 * Helper to generate cache key from function name and args
 */
export function generateCacheKey(functionName: string, ...args: any[]): string[] {
  return [functionName, ...args.map(arg => JSON.stringify(arg))]
}