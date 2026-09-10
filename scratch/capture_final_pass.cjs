const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Sign in as Rahul
  const signInBtn = page.locator('button:has-text("Sign In"), button:has-text("Student Login")').first();
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
    await page.waitForTimeout(1000);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Open user profile menu
  const userMenuBtn = page.locator('button:has-text("Rahul")').first();
  if (await userMenuBtn.isVisible()) {
    await userMenuBtn.click();
    await page.waitForTimeout(800);
    const myRegsOption = page.locator('button:has-text("Registrations"), a:has-text("Registrations")').first();
    if (await myRegsOption.isVisible()) {
      await myRegsOption.click();
      await page.waitForTimeout(1500);
    }
  }

  // Find View QR Pass button
  const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await viewPassBtn.isVisible()) {
    await viewPassBtn.click();
    await page.waitForTimeout(1500);

    const passEl = page.locator('#active-ticket-pass');
    if (await passEl.isVisible()) {
      await passEl.screenshot({ path: 'scratch/final_verified_pass.png' });
      console.log('SUCCESS: Saved final verified pass to scratch/final_verified_pass.png');
    }
  } else {
    console.log('Taking screenshot of current view...');
    await page.screenshot({ path: 'scratch/current_view_state.png' });
  }

  await browser.close();
})();
