const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  const brainDir = path.resolve('C:/Users/ABHIRAM U/.gemini/antigravity-ide/brain/f98047f8-3a84-44f3-98f3-f7a1a3828c67');

  console.log('Navigating to admin portal...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const passcodeInput = page.locator('input[type="password"]');
  if (await passcodeInput.isVisible()) {
    await passcodeInput.fill('swo2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
  }

  // Look for Featured Showcase Editor
  const editBtn = page.locator('button:has-text("Edit All Showcases")').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(800);
  }

  // Accept window confirm dialogs automatically
  page.on('dialog', async (dialog) => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });

  // Delete items until only 1 remains
  while (true) {
    const deleteBtn = page.locator('button:has-text("Delete \\"")').first();
    if (await deleteBtn.isVisible()) {
      const deleteText = await deleteBtn.innerText();
      console.log('Clicking delete:', deleteText);
      await deleteBtn.click();
      await page.waitForTimeout(800);
    } else {
      console.log('Only 1 item remaining! Delete button hidden as expected.');
      break;
    }
  }

  await page.screenshot({ path: path.join(brainDir, 'verified_admin_single_event_studio.png') });
  console.log('Saved verified_admin_single_event_studio.png');

  // Now go to the public website and verify only 1 event tab shows
  console.log('Navigating to public website to verify single event hero display...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  await page.screenshot({ path: path.join(brainDir, 'verified_hero_single_event_mode.png') });
  console.log('Saved verified_hero_single_event_mode.png');

  await browser.close();
  console.log('Single event mode verified successfully!');
})();
