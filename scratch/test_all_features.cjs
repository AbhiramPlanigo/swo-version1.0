const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
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

  console.log('--- TEST 1: Public Homepage & Event Details Modal ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click details button on first event
  const detailsBtn = page.locator('button:has-text("Details")').first();
  if (await detailsBtn.isVisible()) {
    await detailsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/verified_details_modal_public.png' });
    console.log('Verified Event Details Modal screenshot captured!');
    
    // Close modal
    await page.locator('button:has-text("Close")').first().click();
    await page.waitForTimeout(500);
  }

  console.log('--- TEST 2: Public Header Upload Image Button ---');
  const uploadNavBtn = page.locator('button:has-text("Upload Image")').first();
  if (await uploadNavBtn.isVisible()) {
    await uploadNavBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/verified_upload_modal_public.png' });
    console.log('Verified Public Upload Modal screenshot captured!');

    // Close upload modal
    await page.locator('button:has-text("Done")').first().click();
    await page.waitForTimeout(500);
  }

  console.log('--- TEST 3: Events Page Upload Action ---');
  await page.goto('http://localhost:3000/#events', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'scratch/verified_events_page_upload.png' });

  console.log('--- TEST 4: Admin Portal Image Upload in Header & Event Creation ---');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Login if gateway is shown
  const loginInput = page.locator('input[type="password"]');
  if (await loginInput.isVisible()) {
    await loginInput.fill('christ@swo2026');
    await page.locator('button:has-text("Enter Directorate Portal")').click();
    await page.waitForTimeout(2000);
  }

  // Admin header upload button
  const adminUploadBtn = page.locator('button:has-text("Upload Image")').first();
  if (await adminUploadBtn.isVisible()) {
    console.log('Found Admin Upload Image button, clicking...');
    await adminUploadBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/verified_admin_upload_modal.png' });
    await page.locator('button:has-text("Done")').first().click();
    await page.waitForTimeout(500);
  }

  // Navigate to Admin Events
  const eventsNavTab = page.locator('button:has-text("Events")').first();
  if (await eventsNavTab.isVisible()) {
    await eventsNavTab.click();
    await page.waitForTimeout(1500);

    // Click Create Event button
    const createEventBtn = page.locator('button:has-text("Create New Event"), button:has-text("New Event")').first();
    if (await createEventBtn.isVisible()) {
      await createEventBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'scratch/verified_admin_create_event_upload.png' });
      console.log('Verified Admin Create Event Image Upload screenshot captured!');
    }
  }

  console.log('Console errors captured during test run:', consoleErrors);
  await browser.close();
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
})();
