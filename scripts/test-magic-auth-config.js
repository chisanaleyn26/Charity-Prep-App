// Test script to verify magic auth configuration
console.log('🔍 Testing Magic Auth Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('REPLIT_DOMAINS:', process.env.REPLIT_DOMAINS);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_AUTO_LOGIN:', process.env.NEXT_PUBLIC_AUTO_LOGIN);
console.log('');

// Test the callback URL construction
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const callbackUrl = `${siteUrl}/api/auth/callback`;
console.log('🔗 Magic Link Callback URL:', callbackUrl);
console.log('');

// Verify URL format
try {
  const url = new URL(callbackUrl);
  console.log('✅ Callback URL is valid');
  console.log('   Protocol:', url.protocol);
  console.log('   Host:', url.host);
  console.log('   Path:', url.pathname);
} catch (error) {
  console.log('❌ Callback URL is invalid:', error.message);
}
console.log('');

// Test if the URL matches expected Replit format
const expectedUrl = 'https://19f5a34c-019d-4867-967d-73f478342e62-00-hrbhe62bmaqs.pike.replit.dev';
if (siteUrl === expectedUrl) {
  console.log('✅ Site URL matches expected Replit URL');
} else {
  console.log('⚠️  Site URL mismatch:');
  console.log('   Expected:', expectedUrl);
  console.log('   Actual:  ', siteUrl);
}
console.log('');

// Test dev server access
const fetch = require('node:fetch');

async function testEndpoints() {
  console.log('🌐 Testing Endpoints...');
  
  const endpoints = [
    'http://localhost:3000/login',
    'http://localhost:3000/api/auth/callback',
    'http://localhost:3000/api/dev-auto-login'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'HEAD' });
      console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`   ${endpoint}: ERROR - ${error.message}`);
    }
  }
}

testEndpoints().then(() => {
  console.log('\n🎉 Magic auth configuration test complete!');
}).catch(error => {
  console.error('\n❌ Test failed:', error.message);
});