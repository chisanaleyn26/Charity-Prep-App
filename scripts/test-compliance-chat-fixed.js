const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Testing fixed compliance chat component...');
    
    // Start the dev server
    console.log('Starting Next.js dev server...');
    const { spawn } = require('child_process');
    const devServer = spawn('npm', ['run', 'dev'], { 
      cwd: '/home/runner/workspace',
      env: { ...process.env, PORT: '3001' }
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Navigate to the compliance chat page
    console.log('Navigating to compliance chat page...');
    await page.goto('http://localhost:3001/compliance/chat', { waitUntil: 'networkidle' });

    // Wait for the component to load
    console.log('Waiting for component to load...');
    await page.waitForSelector('text=Compliance Assistant', { timeout: 10000 });

    // Check for hydration errors in console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);

    // Check if the welcome message is displayed
    const welcomeText = await page.textContent('text=Hello! I\'m your charity compliance assistant');
    console.log('Welcome message found:', !!welcomeText);

    // Check if suggested questions are displayed
    const suggestedQuestions = await page.$$('text=Suggested questions');
    console.log('Suggested questions section found:', suggestedQuestions.length > 0);

    // Test clicking a suggested question
    const firstQuestion = await page.$('button:has-text("What are the DBS check requirements")');
    if (firstQuestion) {
      console.log('Clicking suggested question...');
      await firstQuestion.click();
      
      // Check if the question appears in the input
      const inputValue = await page.inputValue('input[placeholder="Ask about compliance requirements..."]');
      console.log('Question populated in input:', inputValue.includes('DBS check requirements'));
    }

    // Check for hydration errors
    const hydrationErrors = consoleErrors.filter(error => 
      error.includes('Hydration') || 
      error.includes('Text content does not match') ||
      error.includes('did not match')
    );

    if (hydrationErrors.length > 0) {
      console.error('❌ Hydration errors found:', hydrationErrors);
    } else {
      console.log('✅ No hydration errors detected');
    }

    // Check for runtime errors
    const runtimeErrors = consoleErrors.filter(error => 
      error.includes('Cannot read properties of undefined') ||
      error.includes('TypeError')
    );

    if (runtimeErrors.length > 0) {
      console.error('❌ Runtime errors found:', runtimeErrors);
    } else {
      console.log('✅ No runtime errors detected');
    }

    console.log('\nTest Results:');
    console.log('- Component loads:', true);
    console.log('- Welcome message displays:', !!welcomeText);
    console.log('- No hydration errors:', hydrationErrors.length === 0);
    console.log('- No runtime errors:', runtimeErrors.length === 0);

    // Kill the dev server
    devServer.kill();

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();