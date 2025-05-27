#!/usr/bin/env node

/**
 * Test script for dev auto-login
 * Run with: node scripts/test-dev-login.js
 */

const https = require('https');
const http = require('http');

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const isHttps = baseUrl.startsWith('https');
const protocol = isHttps ? https : http;

console.log('🧪 Testing dev auto-login...');
console.log(`📍 Base URL: ${baseUrl}`);

// Test the auto-login endpoint
const testAutoLogin = () => {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/dev-auto-login', baseUrl);
    
    console.log(`\n🔗 Testing: ${url.toString()}`);
    
    protocol.get(url.toString(), (res) => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📍 Location: ${res.headers.location || 'No redirect'}`);
      
      // Check cookies
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        console.log('🍪 Cookies set:');
        cookies.forEach(cookie => {
          const name = cookie.split('=')[0];
          console.log(`  - ${name}`);
        });
      }
      
      if (res.statusCode === 307 || res.statusCode === 302) {
        console.log('✅ Auto-login redirect working!');
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('❌ Auto-login returned 404 - check environment variables');
        resolve(false);
      } else {
        console.log('⚠️  Unexpected status code');
        resolve(false);
      }
    }).on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
  });
};

// Test the logout endpoint
const testLogout = () => {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/dev-logout', baseUrl);
    
    console.log(`\n🔗 Testing: ${url.toString()}`);
    
    protocol.get(url.toString(), (res) => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📍 Location: ${res.headers.location || 'No redirect'}`);
      
      if (res.statusCode === 307 || res.statusCode === 302) {
        console.log('✅ Logout redirect working!');
        resolve(true);
      } else {
        console.log('⚠️  Unexpected status code');
        resolve(false);
      }
    }).on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
  });
};

// Run tests
const runTests = async () => {
  console.log('\n🚀 Starting tests...\n');
  
  try {
    await testAutoLogin();
    await testLogout();
    
    console.log('\n✨ All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit /dashboard in your browser');
    console.log('2. You should be automatically logged in');
    console.log('3. Look for the dev toolbar at bottom-right');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
};

// Check environment
console.log('\n🔍 Environment check:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`NEXT_PUBLIC_AUTO_LOGIN: ${process.env.NEXT_PUBLIC_AUTO_LOGIN || 'not set'}`);

if (process.env.NODE_ENV === 'production') {
  console.log('\n⚠️  Warning: NODE_ENV is production - dev login won\'t work!');
}

runTests();