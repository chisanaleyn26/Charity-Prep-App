const http = require('http');
const fs = require('fs');

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

// Test API directly
const testAPI = () => {
  const postData = JSON.stringify({
    question: "What are DBS checks?",
    context: {},
    history: []
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai/compliance-chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookie
    }
  };

  console.log('📡 Testing API directly...\n');

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.error) {
          console.log('❌ API Error:', response.error);
        } else {
          console.log('✅ API Response received');
          console.log('Content preview:', response.content ? response.content.substring(0, 100) + '...' : 'No content');
        }
      } catch (e) {
        console.log('❌ Failed to parse response:', e.message);
        console.log('Raw response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(postData);
  req.end();
};

// Test page content
const testPage = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/compliance/chat',
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  };

  console.log('\n📄 Testing page content...\n');

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Check if it's still showing loading state
      const hasLoading = data.includes('Loading...');
      const hasSkeletons = data.includes('animate-pulse');
      const hasActualChat = data.includes('Ask about compliance requirements');
      const hasError = data.includes('error') || data.includes('Error');
      
      console.log(`Page has loading state: ${hasLoading ? '✅' : '❌'}`);
      console.log(`Page has skeletons: ${hasSkeletons ? '✅' : '❌'}`);
      console.log(`Page has chat UI: ${hasActualChat ? '✅' : '❌'}`);
      console.log(`Page has errors: ${hasError ? '⚠️ Yes' : '✅ No'}`);
      
      if (hasError) {
        // Extract error messages
        const errorMatch = data.match(/error[^>]*>([^<]+)/gi);
        if (errorMatch) {
          console.log('\nError details:', errorMatch.slice(0, 3).join('\n'));
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.end();
};

// Run tests
testAPI();
setTimeout(testPage, 1000);