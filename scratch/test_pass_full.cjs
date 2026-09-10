const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  page.on('dialog', async dialog => {
    console.log('ALERT DIALOG:', dialog.type(), dialog.message());
    await dialog.dismiss();
  });

  await page.goto('http://localhost:3000/events', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Sign in as student via quick demo account
  const loginBtn = page.locator('button:has-text("Sign In"), button:has-text("Student Login")').first();
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await page.waitForTimeout(1000);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      console.log('Clicking Quick Auth Rahul Sharma...');
      await rahulBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Click on first event Register button
  const regBtn = page.locator('button:has-text("Register Now"), button:has-text("Register")').first();
  if (await regBtn.isVisible()) {
    console.log('Clicking Register Now on event card...');
    await regBtn.click();
    await page.waitForTimeout(1200);

    // Agree to guidelines if present
    const checkbox = page.locator('input[type="checkbox"]');
    if (await checkbox.isVisible()) {
      await checkbox.check();
    }

    const confirmBtn = page.locator('button:has-text("Confirm & Generate Pass")');
    if (await confirmBtn.isVisible()) {
      console.log('Clicking Confirm & Generate Pass...');
      await confirmBtn.click();
      await page.waitForTimeout(2000);

      // Save screenshot of pass modal
      await page.screenshot({ path: 'scratch/pass_modal_screenshot.png' });
      console.log('Screenshot of pass modal saved!');

      // Click Download Pass (JPEG)
      console.log('Attempting to click Download Pass (JPEG)...');
      const dlBtn = page.locator('button:has-text("Download Pass (JPEG)")');
      await dlBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  await browser.close();
})();
