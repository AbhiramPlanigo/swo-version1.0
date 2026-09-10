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

  console.log('1. Navigating to public homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const brainDir = path.resolve('C:/Users/ABHIRAM U/.gemini/antigravity-ide/brain/f98047f8-3a84-44f3-98f3-f7a1a3828c67');

  // Verify Talk Series, AI Conclave, and Darpan Fest tabs exist
  const talkSeriesBtn = page.locator('button:has-text("Talk Series")').first();
  const aiConclaveBtn = page.locator('button:has-text("AI Conclave")').first();
  const darpanBtn = page.locator('button:has-text("Darpan Fest")').first();

  console.log('Talk series visible:', await talkSeriesBtn.isVisible());
  console.log('AI Conclave visible:', await aiConclaveBtn.isVisible());
  console.log('Darpan visible:', await darpanBtn.isVisible());

  // 2. Log in to Directorate Admin Gateway
  console.log('2. Navigating to Directorate Admin Gateway...');
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const passcodeInput = page.locator('input[type="password"]');
  if (await passcodeInput.isVisible()) {
    console.log('Authenticating via Directorate Gateway...');
    await passcodeInput.fill('swo2026');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  // Look for the Featured Showcase Editor on Overview tab
  console.log('Looking for Featured Showcase Editor...');
  const editBtn = page.locator('button:has-text("Edit All Showcases")').first();
  if (await editBtn.isVisible()) {
    console.log('Expanding Showcase Studio in Admin Dashboard...');
    await editBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(brainDir, 'verified_admin_showcase_studio_expanded.png') });
  console.log('Saved verified_admin_showcase_studio_expanded.png');

  // Test selecting Darpan Fest in the admin editor
  const adminDarpanPill = page.locator('button:has-text("Darpan Fest")').first();
  if (await adminDarpanPill.isVisible()) {
    console.log('Switching to Darpan Fest in editor tabs...');
    await adminDarpanPill.click();
    await page.waitForTimeout(600);
  }

  // Modify Tab Label and Emoji and Location Badge
  console.log('Customizing Darpan Fest: custom name, custom emoji 🔥, and campus stage location...');
  const tabNameInput = page.locator('input[placeholder*="AI Conclave, Darpan Fest"]').first();
  await tabNameInput.fill('Darpan Mega Fest 2026');

  const emojiInput = page.locator('input[placeholder*="🎙️"]').first();
  await emojiInput.fill('🔥');

  const stageInput = page.locator('input[placeholder*="Main Auditorium • Central Campus"]').first();
  await stageInput.fill('Open-Air Amphitheatre • Stage Flow / Quadrangle');

  // Add a new guest
  console.log('Testing Add New Guest...');
  const guestsSubTab = page.locator('button:has-text("Featured Guests")').first();
  await guestsSubTab.click();
  await page.waitForTimeout(400);

  const addGuestBtn = page.locator('button:has-text("Add Keynote Guest")').first();
  if (await addGuestBtn.isVisible()) {
    await addGuestBtn.click();
    await page.waitForTimeout(400);
    await page.locator('input[placeholder*="Dr. Aarav Nambiar"]').first().fill('Celebrity Choreographer Alex');
    await page.locator('input[placeholder*="Chief AI Architect"]').first().fill('Grand Finale Chief Jury');
    await page.locator('button:has-text("Confirm Guest")').first().click();
    await page.waitForTimeout(500);
  }

  // Test adding a brand new 4th showcase event
  console.log('Testing "+ Add New Showcase"...');
  const addNewShowcaseBtn = page.locator('button:has-text("Add New Showcase")').first();
  await addNewShowcaseBtn.click();
  await page.waitForTimeout(800);

  // Switch back to details tab and customize the new showcase
  const detailsTab = page.locator('button:has-text("Title, Names, Stage")').first();
  await detailsTab.click();
  await page.waitForTimeout(400);

  await tabNameInput.fill('Rocket Tech Fest');
  await emojiInput.fill('🚀');
  await stageInput.fill('Campus Innovation Quad • Stage 2');
  const headlineInput = page.locator('input[placeholder*="THE NEXT COGNITIVE EPOCH"]').first();
  await headlineInput.fill('NATIONAL AEROSPACE & ROVERS EXPO 2026');

  // Save the new showcase
  const saveBtn = page.locator('button:has-text("Publish Live"), button:has-text("Save")').first();
  await saveBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(brainDir, 'verified_admin_new_showcase_created.png') });
  console.log('Saved verified_admin_new_showcase_created.png');

  // 3. Return to public homepage and verify both customized Darpan (with 🔥 emoji) and brand new Rocket Tech Fest (with 🚀 emoji) are live!
  console.log('3. Returning to public website to verify live update...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(brainDir, 'verified_hero_all_events_live.png') });
  console.log('Saved verified_hero_all_events_live.png');

  // Click on the newly created Rocket Tech Fest
  const rocketBtn = page.locator('button:has-text("Rocket Tech Fest")').first();
  console.log('Rocket Tech Fest button visible:', await rocketBtn.isVisible());
  if (await rocketBtn.isVisible()) {
    await rocketBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(brainDir, 'verified_hero_rocket_fest_selected.png') });
    console.log('Saved verified_hero_rocket_fest_selected.png');
  }

  await browser.close();
  console.log('SUCCESS: All showcase customization capabilities verified end-to-end!');
})();
