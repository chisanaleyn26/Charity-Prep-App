#!/usr/bin/env node

// Simple API-only test script that doesn't require Playwright
const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEV_MODE = process.env.NODE_ENV !== 'production';

// Test questions
const TEST_QUESTIONS = [
  "What are DBS check requirements?",
  "When is our annual return due?",
  "Do we need to register with the Fundraising Regulator?"
];

// Parse URL
const url = new URL(BASE_URL);
const client = url.protocol === 'https:' ? https : http;

// Test results
const results = {
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    avgResponseTime: 0
  }
};

function makeRequest(path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path,
      method,
      headers
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

async function testAPIEndpoint() {
  console.log('\n🔍 Testing Compliance Chat API...\n');
  
  // Create auth cookie for dev mode
  let cookieHeader = '';
  if (DEV_MODE) {
    const devSession = {
      access_token: 'dev-token-dev-admin-001',
      user: {
        id: 'dev-admin-001',
        email: 'admin@charitytest.org',
        user_metadata: {
          full_name: 'Test User (admin)',
          organization_id: 'dev-org-001',
          role: 'admin'
        }
      },
      expires_at: Date.now() + 24 * 60 * 60 * 1000
    };
    cookieHeader = `dev-auth-session=${encodeURIComponent(JSON.stringify(devSession))}`;
  }
  
  for (const question of TEST_QUESTIONS) {
    console.log(`📤 Sending: "${question}"`);
    const startTime = Date.now();
    
    try {
      const body = JSON.stringify({
        question,
        context: {
          organizationType: 'Registered Charity',
          workWithChildren: true,
          workWithVulnerableAdults: false,
          hasOverseasActivities: false
        },
        history: []
      });
      
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      };
      
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }
      
      const response = await makeRequest('/api/ai/compliance-chat', 'POST', headers, body);
      const duration = Date.now() - startTime;
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = JSON.parse(response.body);
      
      // Validate response structure
      if (data.error) {
        throw new Error(data.error);
      }
      
      const hasValidResponse = 
        data.id && 
        data.role === 'assistant' && 
        data.content && 
        data.content.length > 50 && 
        data.timestamp;
      
      // Check for relevant content
      let hasRelevantContent = false;
      const content = data.content.toLowerCase();
      
      if (question.includes('DBS')) {
        hasRelevantContent = content.includes('dbs') || content.includes('disclosure') || content.includes('check');
      } else if (question.includes('annual return')) {
        hasRelevantContent = content.includes('annual return') || content.includes('10 months') || content.includes('financial year');
      } else if (question.includes('Fundraising Regulator')) {
        hasRelevantContent = content.includes('fundraising') || content.includes('regulator') || content.includes('100,000');
      }
      
      if (hasValidResponse && hasRelevantContent) {
        console.log(`✅ Response received (${duration}ms)`);
        console.log(`  ├─ ID: ${data.id.substring(0, 8)}...`);
        console.log(`  ├─ Content length: ${data.content.length} chars`);
        console.log(`  ├─ Has sources: ${data.sources ? 'Yes' : 'No'}`);
        console.log(`  └─ Relevant content: Yes`);
        
        // Print first 200 chars of response
        console.log(`  └─ Preview: "${data.content.substring(0, 200)}..."`);
        
        results.tests.push({
          question,
          success: true,
          duration,
          responseLength: data.content.length,
          hasSources: !!data.sources,
          error: null
        });
      } else {
        throw new Error('Invalid or irrelevant response');
      }
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      results.tests.push({
        question,
        success: false,
        duration: Date.now() - startTime,
        responseLength: 0,
        hasSources: false,
        error: error.message
      });
    }
    
    console.log(''); // Empty line between tests
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 API TEST SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const passedTests = results.tests.filter(t => t.success).length;
  const totalTests = results.tests.length;
  const avgResponseTime = results.tests.reduce((sum, t) => sum + t.duration, 0) / totalTests || 0;
  
  console.log(`📈 Overall Statistics:`);
  console.log(`  ├─ Total Tests: ${totalTests}`);
  console.log(`  ├─ Passed: ${passedTests}`);
  console.log(`  ├─ Failed: ${totalTests - passedTests}`);
  console.log(`  ├─ Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log(`  └─ Avg Response Time: ${Math.round(avgResponseTime)}ms`);
  
  // Response time analysis
  const responseTimes = results.tests.map(t => t.duration);
  const minTime = Math.min(...responseTimes);
  const maxTime = Math.max(...responseTimes);
  
  console.log(`\n⏱️  Response Time Analysis:`);
  console.log(`  ├─ Fastest: ${minTime}ms`);
  console.log(`  ├─ Slowest: ${maxTime}ms`);
  console.log(`  └─ Average: ${Math.round(avgResponseTime)}ms`);
  
  // Individual test results
  console.log('\n📝 Individual Test Results:');
  results.tests.forEach((test, index) => {
    console.log(`\n  ${index + 1}. "${test.question}"`);
    console.log(`     ├─ Status: ${test.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`     ├─ Response Time: ${test.duration}ms`);
    if (test.success) {
      console.log(`     ├─ Response Length: ${test.responseLength} chars`);
      console.log(`     └─ Has Sources: ${test.hasSources ? 'Yes' : 'No'}`);
    } else {
      console.log(`     └─ Error: ${test.error}`);
    }
  });
  
  // Overall result
  const allPassed = passedTests === totalTests;
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(60) + '\n');
  
  // Update summary
  results.summary = {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    avgResponseTime: Math.round(avgResponseTime)
  };
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Compliance Chat API Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔧 Dev Mode: ${DEV_MODE ? 'Enabled' : 'Disabled'}`);
  console.log(`📅 Date: ${new Date().toISOString()}`);
  
  try {
    await testAPIEndpoint();
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  }
  
  printSummary();
}

// Run tests
runTests().catch(console.error);