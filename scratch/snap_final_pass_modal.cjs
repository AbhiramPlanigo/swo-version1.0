const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Sign in as Rahul
  const signInBtn = page.locator('button:has-text("Sign In"), button:has-text("Student Login")').first();
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
    await page.waitForTimeout(600);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Open profile menu
  const profileBtn = page.locator('button:has-text("Rahul")').first();
  if (await profileBtn.isVisible()) {
    await profileBtn.click();
    await page.waitForTimeout(500);
    const passesOption = page.locator('button:has-text("My Passes & QR Tickets")').first();
    if (await passesOption.isVisible()) {
      await passesOption.click();
      await page.waitForTimeout(1000);
    }
  }

  // Click View QR Pass button
  const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await viewPassBtn.isVisible()) {
    await viewPassBtn.click();
    await page.waitForTimeout(1200);

    const passEl = page.locator('#active-ticket-pass');
    if (await passEl.isVisible()) {
      await passEl.screenshot({ path: 'scratch/final_verified_pass_modal.png' });
      console.log('SUCCESS: Saved pass modal to scratch/final_verified_pass_modal.png');
    }
  }

  await browser.close();
})();
