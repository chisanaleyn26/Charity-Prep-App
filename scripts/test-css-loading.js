const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Testing CSS loading...');
    
    // Start the dev server
    console.log('Starting Next.js dev server...');
    const { spawn } = require('child_process');
    const devServer = spawn('npm', ['run', 'dev'], { 
      cwd: '/home/runner/workspace',
      env: { ...process.env, PORT: '3002' }
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Navigate to the CSS test page
    console.log('Navigating to CSS test page...');
    await page.goto('http://localhost:3002/css-test-fixed', { waitUntil: 'networkidle' });

    // Wait for the page to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check if CSS is loading
    console.log('Checking CSS loading...');
    
    // Get computed styles
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize
      };
    });
    
    console.log('Body styles:', bodyStyles);

    // Check if primary color is working
    const primaryButton = await page.$('button:has-text("Primary Button")');
    if (primaryButton) {
      const buttonStyles = await page.evaluate((btn) => {
        const styles = window.getComputedStyle(btn);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          padding: styles.padding,
          borderRadius: styles.borderRadius
        };
      }, primaryButton);
      
      console.log('Primary button styles:', buttonStyles);
    }

    // Check if cards are styled
    const card = await page.$('.bg-card');
    if (card) {
      const cardStyles = await page.evaluate((cardEl) => {
        const styles = window.getComputedStyle(cardEl);
        return {
          backgroundColor: styles.backgroundColor,
          border: styles.border,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow
        };
      }, card);
      
      console.log('Card styles:', cardStyles);
    }

    // Check CSS custom properties
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      return {
        '--background': styles.getPropertyValue('--background'),
        '--foreground': styles.getPropertyValue('--foreground'),
        '--primary': styles.getPropertyValue('--primary'),
        '--secondary': styles.getPropertyValue('--secondary')
      };
    });
    
    console.log('CSS Variables:', cssVars);

    // Check if Tailwind classes are applied
    const tailwindTest = await page.evaluate(() => {
      // Create a test element with Tailwind classes
      const testEl = document.createElement('div');
      testEl.className = 'bg-red-500 text-white p-4 rounded-lg';
      document.body.appendChild(testEl);
      
      const styles = window.getComputedStyle(testEl);
      const result = {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        padding: styles.padding,
        borderRadius: styles.borderRadius
      };
      
      document.body.removeChild(testEl);
      return result;
    });
    
    console.log('Tailwind test styles:', tailwindTest);

    // Take a screenshot
    await page.screenshot({ path: '/home/runner/workspace/css-test-screenshot.png', fullPage: true });
    console.log('Screenshot saved to css-test-screenshot.png');

    // Check console for CSS errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('CSS')) {
        consoleMessages.push(msg.text());
      }
    });

    if (consoleMessages.length > 0) {
      console.error('CSS Console Errors:', consoleMessages);
    } else {
      console.log('✅ No CSS console errors found');
    }

    console.log('\nCSS Loading Test Results:');
    console.log('- Page loads successfully');
    console.log('- Body has styles:', !!bodyStyles.backgroundColor);
    console.log('- CSS variables available:', Object.values(cssVars).some(v => v.trim() !== ''));
    console.log('- Tailwind classes working:', tailwindTest.backgroundColor !== 'rgba(0, 0, 0, 0)');

    // Kill the dev server
    devServer.kill();

  } catch (error) {
    console.error('CSS test failed:', error);
  } finally {
    await browser.close();
  }
})();