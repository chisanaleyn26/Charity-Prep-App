/**
 * Application Configuration
 * Centralized config for feature flags and environment settings
 */

export const appConfig = {
  // Feature flags
  features: {
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
  
  // Environment settings
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  }
}

export type AppConfig = typeof appConfig