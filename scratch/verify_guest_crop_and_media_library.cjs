const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;
const path = require('path');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('[1/5] Testing Public Site Header...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Verify NO "Upload Image" button on public page
  const publicUploadButtons = await page.$$('text="Upload Image"');
  console.log(`Public "Upload Image" count: ${publicUploadButtons.length} (Expected: 0)`);
  if (publicUploadButtons.length > 0) {
    throw new Error('Public header should NOT have "Upload Image" button!');
  }
  await page.screenshot({ path: path.join(__dirname, 'verified_public_clean_header.png') });
  console.log('Saved verified_public_clean_header.png');

  // Authenticate admin in localStorage with correct cu_swo_ prefix
  await page.evaluate(() => {
    localStorage.setItem('cu_swo_admin_auth', 'true');
  });

  console.log('[2/5] Testing Admin Media Asset Library at /admin.swo.ypr ...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // If DirectorateGateway is shown, log in
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    console.log('Logging into Directorate Gateway...');
    await passInput.fill('swo2026');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  }

  // Check Media Library button in header
  const mediaLibBtn = await page.waitForSelector('button:has-text("Media Library")');
  await mediaLibBtn.click();
  await page.waitForTimeout(600);

  // Verify Media Library Modal is open
  await page.waitForSelector('text=Institutional Media Asset Library');
  await page.screenshot({ path: path.join(__dirname, 'verified_admin_media_library_modal.png') });
  console.log('Saved verified_admin_media_library_modal.png');

  // Switch to Library tab
  const libTab = await page.waitForSelector('button:has-text("Media Library") >> nth=1');
  await libTab.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(__dirname, 'verified_admin_media_library_gallery.png') });
  console.log('Saved verified_admin_media_library_gallery.png');

  // Close modal
  const closeBtn = await page.waitForSelector('button:has-text("Close Library")');
  await closeBtn.click();
  await page.waitForTimeout(500);

  console.log('[3/5] Testing Admin Events Banner Selection...');
  // Click Events tab in admin sidebar
  const eventsNav = await page.waitForSelector('button:has-text("Events")');
  await eventsNav.click();
  await page.waitForTimeout(600);

  // Click Create Event
  const createEventBtn = await page.waitForSelector('button:has-text("Create Event")');
  await createEventBtn.click();
  await page.waitForTimeout(800);

  // Verify "Or Select from Uploaded Media Library" exists
  await page.waitForSelector('text=Or Select from Uploaded Media Library');
  await page.screenshot({ path: path.join(__dirname, 'verified_event_banner_media_library_picker.png') });
  console.log('Saved verified_event_banner_media_library_picker.png');

  // Close event modal
  const cancelEventBtn = await page.waitForSelector('button:has-text("Cancel")');
  await cancelEventBtn.click();
  await page.waitForTimeout(500);

  console.log('[4/5] Testing Showcase Studio & Keynote Guest Editing with 1:1 Square Preview...');
  // Click Overview in admin sidebar
  const overviewNav = await page.waitForSelector('button:has-text("Dashboard")');
  await overviewNav.click();
  await page.waitForTimeout(600);

  // Expand Showcase Studio if collapsed
  const expandBtn = await page.$('button:has-text("Edit All Showcases")');
  if (expandBtn) {
    await expandBtn.click();
    await page.waitForTimeout(600);
  }

  // Switch to Featured Guests tab
  const guestsTab = await page.waitForSelector('button:has-text("Featured Guests")');
  await guestsTab.click();
  await page.waitForTimeout(600);

  // Click "Edit Photo & Info" on the first guest
  const editGuestBtn = await page.waitForSelector('button:has-text("Edit Photo & Info") >> nth=0');
  await editGuestBtn.click();
  await page.waitForTimeout(600);

  // Verify inline editor and 1:1 square preview
  const squareContainer = await page.waitForSelector('div.aspect-square');
  const box = await squareContainer.boundingBox();
  console.log(`1:1 Preview Box dimensions: ${Math.round(box.width)}px width × ${Math.round(box.height)}px height`);
  const ratio = box.width / box.height;
  console.log(`Computed Aspect Ratio: ${ratio.toFixed(2)} (Expected: ~1.00 square, NOT 2.5 banner!)`);
  if (ratio > 1.3 || ratio < 0.7) {
    throw new Error(`Box is distorted! Ratio: ${ratio}`);
  }

  await page.screenshot({ path: path.join(__dirname, 'verified_guest_square_preview_editor.png') });
  console.log('Saved verified_guest_square_preview_editor.png');

  console.log('[5/5] Testing Interactive Crop & Zoom Studio on Keynote Guest...');
  const cropBtn = await page.waitForSelector('button:has-text("Crop & Zoom Photo")');
  await cropBtn.click();
  await page.waitForTimeout(600);

  // Verify cropper modal opened
  await page.waitForSelector('text=Allowed Ratios:');
  await page.screenshot({ path: path.join(__dirname, 'verified_guest_crop_zoom_studio.png') });
  console.log('Saved verified_guest_crop_zoom_studio.png');

  // Apply crop
  const applyCropBtn = await page.waitForSelector('button:has-text("Apply Crop & Upload")');
  await applyCropBtn.click();
  await page.waitForTimeout(600);

  // Save guest and publish live
  const saveGuestBtn = await page.waitForSelector('button:has-text("Done Editing Guest")');
  await saveGuestBtn.click();
  await page.waitForTimeout(500);

  const publishLiveBtn = await page.waitForSelector('button:has-text("Publish Live")');
  await publishLiveBtn.click();
  await page.waitForTimeout(1000);

  // Go to public home and verify hero
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'verified_public_hero_live_guests.png') });
  console.log('Saved verified_public_hero_live_guests.png');

  await browser.close();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
})();
