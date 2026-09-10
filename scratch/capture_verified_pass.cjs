const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/events', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Sign in
  const loginBtn = page.locator('button:has-text("Sign In"), button:has-text("Student Login")').first();
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await page.waitForTimeout(1000);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Click on event card Register button
  const regBtn = page.locator('button:has-text("Register Now"), button:has-text("Register")').first();
  if (await regBtn.isVisible()) {
    await regBtn.click();
    await page.waitForTimeout(1200);

    const checkbox = page.locator('input[type="checkbox"]');
    if (await checkbox.isVisible()) await checkbox.check();

    const confirmBtn = page.locator('button:has-text("Confirm & Generate Pass")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(2000);

      const passEl = page.locator('#booking-qr-pass');
      if (await passEl.isVisible()) {
        await passEl.screenshot({ path: 'scratch/verified_pass_element.png' });
        console.log('SUCCESS: Saved pass element to scratch/verified_pass_element.png');
      }
    }
  }

  await browser.close();
})();
