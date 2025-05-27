const http = require('http');
const fs = require('fs');

console.log('🎭 Testing Compliance Chat UI Components\n');

// Read cookie
let cookie = '';
try {
  const cookieData = fs.readFileSync('/tmp/cookies.txt', 'utf8');
  const match = cookieData.match(/dev-auth-session\s+([^\s]+)/);
  if (match) {
    cookie = `dev-auth-session=${match[1]}`;
  }
} catch (error) {
  console.log('⚠️  No dev session cookie found');
}

// Test the page loads and contains expected UI elements
const pageTest = new Promise((resolve, reject) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/compliance/chat',
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const results = {
        statusCode: res.statusCode,
        hasComplianceAssistant: data.includes('Compliance Assistant'),
        hasWelcomeMessage: data.includes('Hello! I\'m your charity compliance assistant'),
        hasSuggestedQuestions: data.includes('Suggested questions:'),
        hasInputField: data.includes('Ask about compliance requirements...'),
        hasQuickActions: data.includes('Quick Actions'),
        hasComplianceAlerts: data.includes('Compliance Alerts'),
        pageLength: data.length
      };
      resolve(results);
    });
  });

  req.on('error', reject);
  req.end();
});

// Test different UI states
async function runTests() {
  console.log('📋 UI Component Tests:\n');
  
  try {
    const results = await pageTest;
    
    console.log(`✅ Page Status: ${results.statusCode === 200 ? 'OK' : 'FAILED'} (${results.statusCode})`);
    console.log(`${results.hasComplianceAssistant ? '✅' : '❌'} Compliance Assistant title present`);
    console.log(`${results.hasWelcomeMessage ? '✅' : '❌'} Welcome message displayed`);
    console.log(`${results.hasSuggestedQuestions ? '✅' : '❌'} Suggested questions section`);
    console.log(`${results.hasInputField ? '✅' : '❌'} Input field for questions`);
    console.log(`${results.hasQuickActions ? '✅' : '❌'} Quick Actions sidebar`);
    console.log(`${results.hasComplianceAlerts ? '✅' : '❌'} Compliance Alerts section`);
    console.log(`📏 Page size: ${(results.pageLength / 1024).toFixed(1)}KB`);
    
    const passedTests = Object.entries(results)
      .filter(([key, value]) => key !== 'statusCode' && key !== 'pageLength')
      .filter(([key, value]) => value === true).length;
    
    const totalTests = 6;
    const successRate = (passedTests / totalTests * 100).toFixed(0);
    
    console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
    
    if (passedTests === totalTests) {
      console.log('\n✅ All UI components are present and working!');
    } else {
      console.log('\n⚠️  Some UI components are missing or not rendering correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();