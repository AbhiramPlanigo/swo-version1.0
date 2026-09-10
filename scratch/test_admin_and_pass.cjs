const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  console.log('Navigating to admin portal...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // If gateway login form is present, authenticate with swo2026
  const passcodeInput = page.locator('input[type="password"]');
  if (await passcodeInput.isVisible()) {
    console.log('Authenticating via Directorate Gateway...');
    await passcodeInput.fill('swo2026');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(2500);
  }

  // Navigate to Events tab if not already on it
  const eventsTab = page.locator('button:has-text("Events")').first();
  if (await eventsTab.isVisible()) {
    console.log('Switching to Events tab...');
    await eventsTab.click();
    await page.waitForTimeout(1500);
  }

  // Find the revert / toggle button on the first event card
  const togglePassBtn = page.locator('button:has-text("QR Pass Required"), button:has-text("Open Walk-in")').first();
  if (await togglePassBtn.isVisible()) {
    const initialText = (await togglePassBtn.innerText()).replace(/\s+/g, ' ').trim();
    console.log('Initial Button State:', initialText);

    console.log('Clicking 1-click Revert button to toggle pass requirement...');
    await togglePassBtn.click();
    await page.waitForTimeout(1500);

    const toggledText = (await togglePassBtn.innerText()).replace(/\s+/g, ' ').trim();
    console.log('Toggled Button State:', toggledText);

    await page.screenshot({ path: 'scratch/admin_revert_toggled.png' });
    console.log('Saved admin screenshot: scratch/admin_revert_toggled.png');

    console.log('Clicking again to verify bidirectional revert back...');
    await togglePassBtn.click();
    await page.waitForTimeout(1500);

    const revertedBackText = (await togglePassBtn.innerText()).replace(/\s+/g, ' ').trim();
    console.log('Reverted Back Button State:', revertedBackText);
  } else {
    console.log('Could not find pass toggle button. Capturing current view...');
    await page.screenshot({ path: 'scratch/admin_failed_find_btn.png' });
  }

  // Now verify Student Pass visual appearance
  console.log('Navigating to /registrations to check student pass text visibility...');
  await page.goto('http://localhost:3000/registrations', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // If student login button is visible, sign in
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

  // Look for View QR Pass button
  const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await viewPassBtn.isVisible()) {
    console.log('Opening View QR Pass modal...');
    await viewPassBtn.click();
    await page.waitForTimeout(1500);

    const passEl = page.locator('#active-ticket-pass');
    if (await passEl.isVisible()) {
      await passEl.screenshot({ path: 'scratch/pass_text_visibility_check.png' });
      console.log('Successfully saved pass screenshot to scratch/pass_text_visibility_check.png');
    }
  } else {
    // If no existing registrations, register for the first event to view pass
    console.log('No existing registration found. Navigating to /events to register...');
    await page.goto('http://localhost:3000/events', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

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
          await passEl.screenshot({ path: 'scratch/pass_text_visibility_check.png' });
          console.log('Successfully saved registration pass screenshot to scratch/pass_text_visibility_check.png');
        }
      }
    }
  }

  await browser.close();
  console.log('All verification steps completed!');
})();
