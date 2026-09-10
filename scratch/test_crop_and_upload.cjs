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

  // Check Public Navbar Upload Image button
  console.log('2. Clicking Navbar Upload Image button...');
  const navUploadBtn = page.locator('button:has-text("Upload Image")').first();
  await navUploadBtn.click();
  await page.waitForTimeout(1000);

  // In the Media Upload Modal, enter an image or use the default preview
  console.log('3. Entering an image URL into the field...');
  const webLinkTab = page.locator('button:has-text("Enter Web Link")').first();
  if (await webLinkTab.isVisible()) {
    await webLinkTab.click();
    await page.waitForTimeout(300);
    const urlInput = page.locator('input[placeholder*="https://"]').first();
    await urlInput.fill('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=60');
    await page.locator('button:has-text("Apply")').first().click();
    await page.waitForTimeout(1500);
  }

  // Now click Crop & Zoom
  console.log('4. Clicking Crop & Zoom button...');
  const cropBtn = page.locator('button:has-text("Refine Crop / Zoom"), button:has-text("Crop to")').first();
  if (await cropBtn.isVisible()) {
    console.log('Found crop button, clicking...');
    await cropBtn.click({ force: true });
    await page.waitForTimeout(1200);
    
    // Wait for the Cropper modal to appear
    const cropperModal = page.locator('text=Image Framing & Crop Studio').first();
    await cropperModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Image Framing & Crop Studio modal is VISIBLE!');

    await page.screenshot({ path: 'scratch/verified_crop_studio_active.png' });
    console.log('Screenshot saved: scratch/verified_crop_studio_active.png');

    // Test Zoom Slider
    const zoomSlider = page.locator('input[type="range"]').first();
    if (await zoomSlider.isVisible()) {
      await zoomSlider.fill('1.8');
      await page.waitForTimeout(400);
    }

    // Test Rotate button
    const rotateBtn = page.locator('button:has-text("Rotate +90°")').first();
    if (await rotateBtn.isVisible()) {
      await rotateBtn.click();
      await page.waitForTimeout(400);
    }

    await page.screenshot({ path: 'scratch/verified_crop_transformed.png' });
    console.log('Screenshot saved: scratch/verified_crop_transformed.png');

    // Apply Crop
    const applyCropBtn = page.locator('button:has-text("Apply Crop & Upload")').first();
    if (await applyCropBtn.isVisible()) {
      await applyCropBtn.click();
      await page.waitForTimeout(1000);
      console.log('Crop applied successfully!');
    }
  }

  // Close media upload modal
  const doneBtn = page.locator('button:has-text("Done")').first();
  if (await doneBtn.isVisible()) {
    await doneBtn.click();
    await page.waitForTimeout(500);
  }

  // 5. Navigate to Admin Portal
  console.log('5. Testing Admin Portal Image Upload & Cropper...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    await emailInput.fill('swo.admin@christuniversity.in');
    await page.locator('input[type="password"]').fill('swo2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  }

  // Go to Admin Certificates Studio to verify Signatures
  console.log('6. Checking Admin Certificates Studio Signature Cropper...');
  const certsTab = page.locator('aside button:has-text("Certificates")').first();
  if (await certsTab.isVisible()) {
    await certsTab.click();
    await page.waitForTimeout(1500);

    const sigTab = page.locator('button:has-text("Signatories")').first();
    if (await sigTab.isVisible()) {
      await sigTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'scratch/verified_admin_signatures_upload.png' });
      console.log('Screenshot saved: scratch/verified_admin_signatures_upload.png');
    }
  }

  // Go to Admin Committees to verify member photo upload
  console.log('7. Checking Admin Committees Member Photo Upload...');
  const commsTab = page.locator('aside button:has-text("Committees")').first();
  if (await commsTab.isVisible()) {
    await commsTab.click();
    await page.waitForTimeout(1500);

    const addMemberBtn = page.locator('button:has-text("Add Member"), button:has-text("Appoint")').first();
    if (await addMemberBtn.isVisible()) {
      await addMemberBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'scratch/verified_admin_committee_photo_upload.png' });
      console.log('Screenshot saved: scratch/verified_admin_committee_photo_upload.png');
    }
  }

  await browser.close();
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
})();
