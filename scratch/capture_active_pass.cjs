const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  console.log('Navigating to registrations...');
  await page.goto('http://localhost:3000/registrations', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Sign in as Rahul
  const signInBtn = page.locator('button:has-text("Sign In with @christuniversity.in"), button:has-text("Sign In")').first();
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
    await page.waitForTimeout(1000);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Click View QR Pass
  const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await viewPassBtn.isVisible()) {
    console.log('Clicking View QR Pass...');
    await viewPassBtn.click();
    await page.waitForTimeout(1500);

    const passEl = page.locator('#active-ticket-pass');
    if (await passEl.isVisible()) {
      await passEl.screenshot({ path: 'scratch/latest_pass_render.png' });
      console.log('SUCCESS: Saved pass to scratch/latest_pass_render.png');
    }
  } else {
    console.log('Could not find View QR Pass button. Capturing view...');
    await page.screenshot({ path: 'scratch/registrations_page.png' });
  }

  await browser.close();
})();
