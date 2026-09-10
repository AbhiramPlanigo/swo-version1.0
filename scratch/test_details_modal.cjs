const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push('[PAGE ERROR] ' + err.message);
  });

  await page.goto('http://localhost:3000/#events', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Finding Details button on Events page...');
  const detailsBtn = page.locator('button:has-text("Details")').first();
  if (await detailsBtn.isVisible()) {
    console.log('Clicking Details button...');
    await detailsBtn.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: 'scratch/verified_details_modal.png' });
    console.log('Screenshot saved to scratch/verified_details_modal.png');
  } else {
    console.log('Details button not found on #events, trying homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const homeDetailsBtn = page.locator('button:has-text("Details")').first();
    await homeDetailsBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scratch/verified_details_modal.png' });
  }

  console.log('Page/Console Errors during click:', consoleErrors);
  await browser.close();
})();
