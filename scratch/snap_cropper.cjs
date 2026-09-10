const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  console.log('1. Navigating to Public Portal homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Open Media Upload Modal
  console.log('2. Clicking Navbar Upload Image button...');
  await page.locator('button:has-text("Upload Image")').first().click();
  await page.waitForTimeout(1000);

  // Switch to Enter Web Link
  console.log('3. Entering an image with non-matching aspect ratio...');
  await page.locator('button:has-text("Enter Web Link")').first().click();
  await page.waitForTimeout(300);
  const urlInput = page.locator('input[placeholder*="https://"]').first();
  await urlInput.fill('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=60');
  await page.locator('button:has-text("Apply")').first().click();
  await page.waitForTimeout(1500);

  // Verify Cropper Modal is open!
  console.log('4. Checking if Cropper Studio is open...');
  const cropperModal = page.locator('text=Allowed Ratios:').first();
  if (!(await cropperModal.isVisible())) {
    const cropBtn = page.locator('button:has-text("Refine Crop"), button:has-text("Crop to")').first();
    if (await cropBtn.isVisible()) {
      console.log('Clicking crop button to open studio...');
      await cropBtn.click({ force: true });
      await page.waitForTimeout(600);
    }
  }
  await cropperModal.waitFor({ state: 'visible', timeout: 5000 });
  console.log('SUCCESS: Image Framing & Crop Studio is OPEN!');

  await page.screenshot({ path: 'scratch/verified_cropper_studio_open.png' });
  console.log('Saved: scratch/verified_cropper_studio_open.png');

  // Adjust zoom slider to 1.7x and rotate +90 deg
  console.log('5. Adjusting zoom and rotation in Cropper...');
  const zoomSlider = page.locator('input[type="range"]').first();
  if (await zoomSlider.isVisible()) {
    await zoomSlider.fill('1.7');
    await page.waitForTimeout(400);
  }
  const rotateBtn = page.locator('button:has-text("Rotate +90°")').first();
  if (await rotateBtn.isVisible()) {
    await rotateBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({ path: 'scratch/verified_cropper_studio_zoomed.png' });
  console.log('Saved: scratch/verified_cropper_studio_zoomed.png');

  // Apply Crop & Upload
  console.log('6. Clicking Apply Crop & Upload...');
  await page.locator('button:has-text("Apply Crop & Upload")').first().click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'scratch/verified_cropper_applied_in_modal.png' });
  console.log('Saved: scratch/verified_cropper_applied_in_modal.png');

  // Close media modal
  await page.locator('button:has-text("Done")').first().click();
  await page.waitForTimeout(500);

  // Visit Admin Portal
  console.log('7. Visiting Admin Portal...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    await emailInput.fill('swo.admin@christuniversity.in');
    await page.locator('input[type="password"]').fill('swo2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  }

  // Go to Admin Certificates Studio to check signature upload
  console.log('8. Checking Certificates Studio Signatures...');
  await page.locator('aside button:has-text("Certificates")').first().click();
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Signatories")').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/verified_admin_signatures_upload.png' });
  console.log('Saved: scratch/verified_admin_signatures_upload.png');

  // Go to Admin Committees to check member photo upload
  console.log('9. Checking Committees Add Member Photo Upload...');
  await page.locator('aside button:has-text("Committees")').first().click();
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Add Member"), button:has-text("Appoint")').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/verified_admin_committee_photo_upload.png' });
  console.log('Saved: scratch/verified_admin_committee_photo_upload.png');

  await browser.close();
  console.log('ALL SNAPSHOTS COMPLETED SUCCESSFULLY!');
})();
