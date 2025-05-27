const puppeteer = require('puppeteer');

async function testReportsPage() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Go to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    // Click the dev bypass button for admin user
    console.log('2. Using dev bypass to login as admin...');
    await page.waitForSelector('button:has-text("admin@charitytest.org")', { timeout: 5000 });
    await page.click('button:has-text("admin@charitytest.org")');
    
    // Wait for navigation to dashboard
    console.log('3. Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Now try to access reports page
    console.log('4. Navigating to reports page...');
    await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle0' });
    
    // Check if we're on the reports page
    const url = page.url();
    const title = await page.title();
    const h1 = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
    
    console.log('\nResults:');
    console.log('- Current URL:', url);
    console.log('- Page Title:', title);
    console.log('- H1 Content:', h1);
    
    // Check for report cards
    const reportCards = await page.$$('.grid > div').catch(() => []);
    console.log('- Number of report cards found:', reportCards.length);
    
    if (url.includes('/reports') && !url.includes('/login')) {
      console.log('\n✅ Reports page is accessible and working!');
    } else {
      console.log('\n❌ Failed to access reports page - redirected to:', url);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testReportsPage();