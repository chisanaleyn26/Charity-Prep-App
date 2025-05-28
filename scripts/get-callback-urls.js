#!/usr/bin/env node

/**
 * Script to get all possible callback URLs for Supabase configuration
 * Run with: node scripts/get-callback-urls.js
 */

function getAllCallbackUrls() {
  const urls = []
  
  // Current environment
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    urls.push(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`)
  }
  
  // Replit environments
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    urls.push(`https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co/api/auth/callback`)
    urls.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/callback`)
  }
  
  if (process.env.REPLIT_DEV_DOMAIN) {
    urls.push(`https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/callback`)
  }
  
  // Common localhost
  urls.push('http://localhost:3000/api/auth/callback')
  
  // Try to detect current domain from various sources
  const currentHost = process.env.VERCEL_URL || 
                     process.env.NEXT_PUBLIC_VERCEL_URL ||
                     process.env.HOST ||
                     'localhost:3000'
                     
  if (currentHost && !currentHost.includes('localhost')) {
    const protocol = currentHost.includes('localhost') ? 'http' : 'https'
    urls.push(`${protocol}://${currentHost}/api/auth/callback`)
  }
  
  // Remove duplicates
  return [...new Set(urls)]
}

console.log('🔐 Callback URLs to add to Supabase Auth Settings:')
console.log('=' * 50)

const urls = getAllCallbackUrls()
urls.forEach((url, i) => {
  console.log(`${i + 1}. ${url}`)
})

console.log('\n📝 Instructions:')
console.log('1. Go to your Supabase project: https://supabase.com/dashboard/project/rovdrincpttusrppftai')
console.log('2. Navigate to Authentication → URL Configuration')
console.log('3. Add ALL of the above URLs to "Redirect URLs"')
console.log('4. Save the settings')
console.log('\n⚠️  Make sure your current domain URL is in the list!')