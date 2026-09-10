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
    await page.waitForTimeout(800);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1200);
    }
  }

  // Open user menu, click Registrations, and wait for menu to close
  const userMenuBtn = page.locator('button:has-text("Rahul")').first();
  if (await userMenuBtn.isVisible()) {
    await userMenuBtn.click();
    await page.waitForTimeout(500);
    const myRegsOption = page.locator('button:has-text("Registrations")').first();
    if (await myRegsOption.isVisible()) {
      await myRegsOption.click();
      await page.waitForTimeout(1200);
    }
  }

  // Press Escape to ensure any lingering dropdown or backdrop is closed
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Click View QR Pass button
  const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await viewPassBtn.isVisible()) {
    console.log('Clicking View QR Pass...');
    await viewPassBtn.click({ force: true });
    await page.waitForTimeout(1500);

    const passEl = page.locator('#active-ticket-pass');
    if (await passEl.isVisible()) {
      await passEl.screenshot({ path: 'scratch/verified_final_pass_text.png' });
      console.log('SUCCESS: Saved verified pass screenshot to scratch/verified_final_pass_text.png');
    }
  } else {
    console.log('No View QR Pass button found; registering to view pass...');
    // Click Events in nav
    await page.locator('button:has-text("Events")').first().click();
    await page.waitForTimeout(1000);
    const regBtn = page.locator('button:has-text("Register Now"), button:has-text("Register")').first();
    if (await regBtn.isVisible()) {
      await regBtn.click();
      await page.waitForTimeout(1000);
      const checkbox = page.locator('input[type="checkbox"]');
      if (await checkbox.isVisible()) await checkbox.check();
      await page.locator('button:has-text("Confirm & Generate Pass")').click();
      await page.waitForTimeout(2000);
      const bookingPassEl = page.locator('#booking-qr-pass');
      if (await bookingPassEl.isVisible()) {
        await bookingPassEl.screenshot({ path: 'scratch/verified_final_pass_text.png' });
        console.log('SUCCESS: Saved booking pass to scratch/verified_final_pass_text.png');
      }
    }
  }

  await browser.close();
})();
