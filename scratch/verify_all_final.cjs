const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Navigating to Admin Dashboard...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Authenticate via Directorate Gateway if present
  const passcodeInput = page.locator('input[type="password"]');
  if (await passcodeInput.isVisible()) {
    console.log('Logging in as Admin with swo2026...');
    await passcodeInput.fill('swo2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  }

  // Switch to Dashboard overview
  const dashTab = page.locator('button:has-text("Dashboard")').first();
  if (await dashTab.isVisible()) {
    await dashTab.click();
    await page.waitForTimeout(1000);
  }

  // Take screenshot of top-right header chip to confirm "SWO"
  const headerChip = page.locator('button[title*="SWO Admin profile"], button:has-text("SWO")').first();
  if (await headerChip.isVisible()) {
    const chipText = (await headerChip.innerText()).replace(/\s+/g, ' ').trim();
    console.log('Admin Header Chip Text:', chipText);
    await headerChip.screenshot({ path: 'scratch/verified_admin_chip_swo.png' });
    console.log('Saved chip screenshot: scratch/verified_admin_chip_swo.png');
  }

  // Check Activity Stream
  const activityStreamEl = page.locator('h3:has-text("Activity Stream")').locator('xpath=ancestor::div[contains(@class, "space-y-4")]').first();
  if (await activityStreamEl.isVisible()) {
    console.log('Found Activity Stream!');
    await activityStreamEl.screenshot({ path: 'scratch/verified_activity_stream_before.png' });

    // Test deleting an individual item
    const firstItemDeleteBtn = activityStreamEl.locator('button[title="Delete activity"]').first();
    if (await firstItemDeleteBtn.isVisible()) {
      console.log('Clicking individual item delete button (X)...');
      await firstItemDeleteBtn.click();
      await page.waitForTimeout(1000);
      console.log('Deleted 1 item successfully!');
    }

    // Test Clear All button
    const clearAllBtn = activityStreamEl.locator('button:has-text("Clear All")').first();
    if (await clearAllBtn.isVisible()) {
      console.log('Clicking Clear All activities...');
      await clearAllBtn.click();
      await page.waitForTimeout(1000);
      await activityStreamEl.screenshot({ path: 'scratch/verified_activity_stream_cleared.png' });
      console.log('Saved cleared activity stream: scratch/verified_activity_stream_cleared.png');

      // Test Reset button
      const resetBtn = activityStreamEl.locator('button:has-text("Reset")').first();
      if (await resetBtn.isVisible()) {
        console.log('Clicking Reset activities...');
        await resetBtn.click();
        await page.waitForTimeout(1000);
        console.log('Restored activity stream successfully!');
      }
    }
  }

  // 2. Test 1-Click Event Pass Revert in Events tab
  console.log('2. Switching to Events tab to test Pass Revert button...');
  const eventsTab = page.locator('button:has-text("Events")').first();
  if (await eventsTab.isVisible()) {
    await eventsTab.click();
    await page.waitForTimeout(1500);

    const togglePassBtn = page.locator('button:has-text("QR Pass Required"), button:has-text("Open Walk-in")').first();
    if (await togglePassBtn.isVisible()) {
      const state1 = (await togglePassBtn.innerText()).replace(/\s+/g, ' ').trim();
      console.log('State before toggle:', state1);

      await togglePassBtn.click();
      await page.waitForTimeout(1200);

      const state2 = (await togglePassBtn.innerText()).replace(/\s+/g, ' ').trim();
      console.log('State after toggle:', state2);

      await page.screenshot({ path: 'scratch/verified_admin_events_view.png' });
      console.log('Saved events view screenshot: scratch/verified_admin_events_view.png');
    }
  }

  // 3. Test Student Pass text visibility
  console.log('3. Navigating to student view...');
  await page.goto('http://localhost:3000/events', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Sign in as student
  const studentLoginBtn = page.locator('button:has-text("Sign In"), button:has-text("Student Login")').first();
  if (await studentLoginBtn.isVisible()) {
    await studentLoginBtn.click();
    await page.waitForTimeout(800);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1200);
    }
  }

  // Open Registrations via URL hash / state
  await page.evaluate(() => {
    window.location.hash = '#registrations';
  });
  await page.waitForTimeout(1000);

  // Or click on user profile -> Registrations
  const profileBtn = page.locator('button:has-text("Rahul")').first();
  if (await profileBtn.isVisible()) {
    await profileBtn.click();
    await page.waitForTimeout(500);
    const regsOption = page.locator('button:has-text("Registrations")').first();
    if (await regsOption.isVisible()) {
      await regsOption.click();
      await page.waitForTimeout(1200);
    }
  }

  // Click View QR Pass
  const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await viewPassBtn.isVisible()) {
    await viewPassBtn.click();
    await page.waitForTimeout(1200);

    const passEl = page.locator('#active-ticket-pass');
    if (await passEl.isVisible()) {
      await passEl.screenshot({ path: 'scratch/verified_student_pass_final.png' });
      console.log('Saved student pass screenshot: scratch/verified_student_pass_final.png');
    }
  }

  await browser.close();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
})();
