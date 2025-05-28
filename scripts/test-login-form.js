#!/usr/bin/env node

const http = require('http');

// Test the login form submission
async function testLoginForm() {
  console.log('Testing login form...\n');
  
  try {
    // Test 1: GET login page
    console.log('1. Testing GET /login...');
    const getResponse = await makeRequest('GET', '/login');
    console.log(`   Status: ${getResponse.statusCode}`);
    console.log(`   Response includes form: ${getResponse.body.includes('form') ? '✓' : '✗'}`);
    console.log(`   Tailwind styles loaded: ${getResponse.body.includes('bg-gray-50') ? '✓' : '✗'}\n`);
    
    // Test 2: Check if server actions are working
    console.log('2. Testing server environment...');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}`);
    console.log(`   URL value: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'N/A'}\n`);
    
    // Check if the form elements are present
    console.log('3. Checking form elements...');
    const hasEmailInput = getResponse.body.includes('type="email"');
    const hasContinueButton = getResponse.body.includes('Continue');
    const hasForm = getResponse.body.includes('<form');
    
    console.log(`   Email input present: ${hasEmailInput ? '✓' : '✗'}`);
    console.log(`   Continue button present: ${hasContinueButton ? '✓' : '✗'}`);
    console.log(`   Form tag present: ${hasForm ? '✓' : '✗'}\n`);
    
    // Check CSS classes
    console.log('4. Checking Tailwind CSS...');
    const tailwindClasses = ['min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-50'];
    tailwindClasses.forEach(cls => {
      console.log(`   Class "${cls}": ${getResponse.body.includes(cls) ? '✓' : '✗'}`);
    });
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html,application/xhtml+xml'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run tests
testLoginForm();