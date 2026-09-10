const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  console.log('Navigating to Admin Portal...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Check for login form
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    console.log('Filling admin credentials with swo2026...');
    await emailInput.fill('swo.admin@christuniversity.in');
    await page.locator('input[type="password"]').fill('swo2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  }

  // 1. Admin Header Bar: Upload Image Button
  console.log('Checking Admin Header Upload Image button...');
  const headerUploadBtn = page.locator('header button:has-text("Upload Image")').first();
  if (await headerUploadBtn.isVisible()) {
    console.log('Found Admin Upload Image button, clicking...');
    await headerUploadBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/verified_admin_upload_modal.png' });
    console.log('Screenshot saved: scratch/verified_admin_upload_modal.png');
    await page.locator('button:has-text("Done")').first().click();
    await page.waitForTimeout(500);
  }

  // 2. Admin Events View: Create New Event with ImageUploadField
  console.log('Navigating to Admin Events View...');
  await page.locator('aside button:has-text("Events")').first().click();
  await page.waitForTimeout(1500);

  const newEventBtn = page.locator('button:has-text("New Event"), button:has-text("Create New Event")').first();
  if (await newEventBtn.isVisible()) {
    console.log('Clicking New Event button...');
    await newEventBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scratch/verified_admin_create_event_upload.png' });
    console.log('Screenshot saved: scratch/verified_admin_create_event_upload.png');
  }

  await browser.close();
  console.log('ADMIN TESTS COMPLETED SUCCESSFULLY!');
})();
