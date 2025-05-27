#!/usr/bin/env node

const { chromium } = require('playwright');
const fetch = require('node-fetch');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEV_MODE = process.env.NODE_ENV !== 'production';

// Test questions
const TEST_QUESTIONS = [
  "What are DBS check requirements?",
  "When is our annual return due?",
  "Do we need to register with the Fundraising Regulator?"
];

// Test results
const results = {
  pageLoad: { success: false, duration: 0, error: null },
  apiTests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    avgResponseTime: 0
  }
};

async function testPageLoad() {
  console.log('\n🔍 Testing Compliance Chat Page Load...\n');
  const startTime = Date.now();
  
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    // Set dev auth cookie if in dev mode
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
      
      await context.addCookies([{
        name: 'dev-auth-session',
        value: JSON.stringify(devSession),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      }]);
    }
    
    const page = await context.newPage();
    
    // Navigate to compliance chat page
    console.log(`📄 Loading ${BASE_URL}/compliance/chat`);
    await page.goto(`${BASE_URL}/compliance/chat`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to be fully loaded
    await page.waitForSelector('text="Compliance Assistant"', { timeout: 10000 });
    
    // Check for key elements
    const elements = {
      title: await page.locator('text="Compliance Assistant"').count(),
      description: await page.locator('text="Ask questions about charity compliance and regulations"').count(),
      input: await page.locator('input[placeholder*="compliance"]').count(),
      sendButton: await page.locator('button[type="submit"]').count()
    };
    
    const duration = Date.now() - startTime;
    
    // Validate all elements are present
    const allElementsPresent = Object.values(elements).every(count => count > 0);
    
    if (allElementsPresent) {
      console.log('✅ Page loaded successfully');
      console.log(`  ├─ Title: ${elements.title > 0 ? '✓' : '✗'}`);
      console.log(`  ├─ Description: ${elements.description > 0 ? '✓' : '✗'}`);
      console.log(`  ├─ Input field: ${elements.input > 0 ? '✓' : '✗'}`);
      console.log(`  └─ Send button: ${elements.sendButton > 0 ? '✓' : '✗'}`);
      results.pageLoad = { success: true, duration, error: null };
    } else {
      throw new Error('Missing required page elements');
    }
    
    await browser.close();
  } catch (error) {
    console.error('❌ Page load test failed:', error.message);
    results.pageLoad = { 
      success: false, 
      duration: Date.now() - startTime, 
      error: error.message 
    };
  }
}

async function testAPIEndpoint() {
  console.log('\n🔍 Testing Compliance Chat API...\n');
  
  // Create auth headers
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (DEV_MODE) {
    // In dev mode, we rely on the server-side dev auth check
    headers['X-Dev-Mode'] = 'true';
  }
  
  for (const question of TEST_QUESTIONS) {
    console.log(`📤 Sending: "${question}"`);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}/api/ai/compliance-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question,
          context: {
            organizationType: 'Registered Charity',
            workWithChildren: true,
            workWithVulnerableAdults: false,
            hasOverseasActivities: false
          },
          history: []
        })
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
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
      
      // Check for relevant content based on question
      let hasRelevantContent = false;
      const content = data.content.toLowerCase();
      
      if (question.includes('DBS')) {
        hasRelevantContent = content.includes('dbs') || content.includes('disclosure') || content.includes('check');
      } else if (question.includes('annual return')) {
        hasRelevantContent = content.includes('annual return') || content.includes('10 months') || content.includes('financial year');
      } else if (question.includes('Fundraising Regulator')) {
        hasRelevantContent = content.includes('fundraising') || content.includes('regulator') || content.includes('£100,000');
      }
      
      if (hasValidResponse && hasRelevantContent) {
        console.log(`✅ Response received (${duration}ms)`);
        console.log(`  ├─ ID: ${data.id.substring(0, 8)}...`);
        console.log(`  ├─ Content length: ${data.content.length} chars`);
        console.log(`  ├─ Has sources: ${data.sources ? 'Yes' : 'No'}`);
        console.log(`  └─ Relevant content: Yes`);
        
        results.apiTests.push({
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
      results.apiTests.push({
        question,
        success: false,
        duration: Date.now() - startTime,
        responseLength: 0,
        hasSources: false,
        error: error.message
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  // Page load results
  console.log('🌐 Page Load Test:');
  console.log(`  ├─ Status: ${results.pageLoad.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  ├─ Duration: ${results.pageLoad.duration}ms`);
  if (results.pageLoad.error) {
    console.log(`  └─ Error: ${results.pageLoad.error}`);
  } else {
    console.log(`  └─ All elements loaded correctly`);
  }
  
  // API test results
  console.log('\n🔌 API Tests:');
  const passedTests = results.apiTests.filter(t => t.success).length;
  const totalTests = results.apiTests.length;
  const avgResponseTime = results.apiTests.reduce((sum, t) => sum + t.duration, 0) / totalTests || 0;
  
  console.log(`  ├─ Total: ${totalTests}`);
  console.log(`  ├─ Passed: ${passedTests}`);
  console.log(`  ├─ Failed: ${totalTests - passedTests}`);
  console.log(`  └─ Avg Response Time: ${Math.round(avgResponseTime)}ms`);
  
  // Individual test results
  console.log('\n📝 Individual Test Results:');
  results.apiTests.forEach((test, index) => {
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
  const allPassed = results.pageLoad.success && passedTests === totalTests;
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(60) + '\n');
  
  // Update summary
  results.summary = {
    total: totalTests + 1,
    passed: (results.pageLoad.success ? 1 : 0) + passedTests,
    failed: (results.pageLoad.success ? 0 : 1) + (totalTests - passedTests),
    avgResponseTime: Math.round(avgResponseTime)
  };
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Compliance Chat E2E Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔧 Dev Mode: ${DEV_MODE ? 'Enabled' : 'Disabled'}`);
  
  try {
    // Check if required dependencies are installed
    try {
      require('playwright');
      require('node-fetch');
    } catch (error) {
      console.error('\n❌ Missing dependencies. Please run:');
      console.error('   npm install playwright node-fetch\n');
      process.exit(1);
    }
    
    // Run tests
    await testPageLoad();
    await testAPIEndpoint();
    
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  }
  
  // Print summary
  printSummary();
}

// Run tests
runTests().catch(console.error);