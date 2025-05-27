#!/usr/bin/env node

/**
 * Supabase Auth Setup Helper for Replit
 * This script helps configure Magic Link authentication for Replit environments
 */

console.log('🔐 Supabase Auth Configuration Helper\n');
console.log('This script will help you configure Magic Link authentication for Replit.\n');

// Display current environment
console.log('📍 Current Environment:');
console.log('   NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || '(not set)');
console.log('   REPL_SLUG:', process.env.REPL_SLUG || '(not set)');
console.log('   REPL_OWNER:', process.env.REPL_OWNER || '(not set)');
console.log('   REPLIT_DEV_DOMAIN:', process.env.REPLIT_DEV_DOMAIN || '(not set)');
console.log('');

// Generate all possible callback URLs
function getAllPossibleCallbackUrls() {
  const urls = [];

  // Add configured URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    urls.push(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`);
  }

  // Add Replit variations
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    // Modern Replit URL format
    urls.push(`https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co/api/auth/callback`);
    
    // Legacy Replit URL format
    urls.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/callback`);
    
    // Development domain if available
    if (process.env.REPLIT_DEV_DOMAIN) {
      urls.push(`https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/callback`);
    }
  }

  // Add localhost for development
  urls.push('http://localhost:3000/api/auth/callback');

  // Remove duplicates
  return [...new Set(urls)];
}

const callbackUrls = getAllPossibleCallbackUrls();

console.log('🔗 Required Redirect URLs for Supabase:');
console.log('   Add ALL of these URLs to your Supabase project settings:\n');

callbackUrls.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url}`);
});

console.log('\n📋 Setup Instructions:');
console.log('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/url-configuration');
console.log('   2. In the "Redirect URLs" section, add ALL the URLs listed above');
console.log('   3. Make sure to include the Replit preview URL (the long one with hashes)');
console.log('   4. Save your changes');
console.log('');

console.log('🌐 Your Replit URLs:');
console.log('   Preview URL: https://19f5a34c-019d-4867-967d-73f478342e62-00-hrbhe62bmaqs.pike.replit.dev');
console.log('   Published URL: Will be available after deployment\n');

console.log('⚠️  Important Notes:');
console.log('   - Replit uses different URLs for preview vs published apps');
console.log('   - The preview URL changes if you fork or recreate the Repl');
console.log('   - Always add new URLs to Supabase when they change');
console.log('   - Magic links sent to email will only work if the callback URL is whitelisted\n');

// Test current configuration
console.log('🧪 Testing Current Configuration...\n');

async function testAuth() {
  try {
    // Simulate getAuthCallbackUrl logic
    let currentCallbackUrl;
    
    // Check if we're in a Replit environment
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      // Try to get the current domain from various sources
      if (process.env.REPLIT_DEV_DOMAIN) {
        currentCallbackUrl = `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/callback`;
      } else if (process.env.NEXT_PUBLIC_SITE_URL) {
        currentCallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;
      } else {
        currentCallbackUrl = `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co/api/auth/callback`;
      }
    } else {
      // Use configured site URL or fallback to localhost
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      currentCallbackUrl = `${siteUrl}/api/auth/callback`;
    }
    
    console.log('✅ Current callback URL:', currentCallbackUrl);
    
    // Check if it's in the allowed list
    if (callbackUrls.includes(currentCallbackUrl)) {
      console.log('✅ This URL is in the allowed list');
    } else {
      console.log('⚠️  This URL is NOT in the allowed list - add it to Supabase!');
    }
  } catch (error) {
    console.log('❌ Error testing configuration:', error.message);
  }
}

testAuth().then(() => {
  console.log('\n✨ Configuration check complete!');
  console.log('   If you\'re still having issues, make sure:');
  console.log('   1. Your Supabase project has email auth enabled');
  console.log('   2. You\'ve added ALL the redirect URLs above');
  console.log('   3. You\'re using the correct URL when accessing your app');
}).catch(console.error);