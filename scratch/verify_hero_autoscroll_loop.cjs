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

  console.log('[1/4] Loading Home page and verifying initial showcase...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Read initial headline
  const getHeadline = async () => {
    const h1 = await page.$('h1');
    return h1 ? (await h1.textContent()).trim() : '';
  };

  const initialHeadline = await getHeadline();
  console.log(`Initial Showcase Headline: "${initialHeadline}"`);
  await page.screenshot({ path: path.join(__dirname, 'verified_showcase_slide_1.png') });
  console.log('Saved verified_showcase_slide_1.png');

  console.log('[2/4] Waiting ~6.3 seconds for automatic scroll to next showcase in loop...');
  // Move mouse away from hero to ensure no accidental hover
  await page.mouse.move(10, 10);
  await page.waitForTimeout(6300);

  const secondHeadline = await getHeadline();
  console.log(`Second Showcase Headline after 6s: "${secondHeadline}"`);
  if (secondHeadline === initialHeadline) {
    throw new Error('Showcase did NOT auto-scroll after 6 seconds!');
  }
  await page.screenshot({ path: path.join(__dirname, 'verified_showcase_slide_2_autoscrolled.png') });
  console.log('Saved verified_showcase_slide_2_autoscrolled.png');

  console.log('[3/4] Waiting ~6.3 seconds for next automatic loop advance...');
  await page.waitForTimeout(6300);
  const thirdHeadline = await getHeadline();
  console.log(`Third Showcase Headline after 6s: "${thirdHeadline}"`);
  await page.screenshot({ path: path.join(__dirname, 'verified_showcase_slide_3_autoscrolled.png') });
  console.log('Saved verified_showcase_slide_3_autoscrolled.png');

  console.log('[4/4] Testing Manual Controls: Next, Prev, and Pause/Play toggle...');
  // Click Prev button
  const prevBtn = await page.waitForSelector('button[aria-label="Previous showcase"]');
  await prevBtn.click();
  await page.waitForTimeout(600);
  const headlineAfterPrev = await getHeadline();
  console.log(`Headline after clicking Prev: "${headlineAfterPrev}"`);

  // Click Next button
  const nextBtn = await page.waitForSelector('button[aria-label="Next showcase"]');
  await nextBtn.click();
  await page.waitForTimeout(600);
  const headlineAfterNext = await getHeadline();
  console.log(`Headline after clicking Next: "${headlineAfterNext}"`);

  // Click Pause button
  const pauseBtn = await page.waitForSelector('button[aria-label="Pause auto-scroll"]');
  await pauseBtn.click();
  await page.waitForTimeout(500);

  // Verify Pause button is active
  await page.waitForSelector('button[aria-label="Resume auto-scroll"]');
  console.log('Pause toggle verified (now showing Resume)');
  await page.screenshot({ path: path.join(__dirname, 'verified_showcase_paused_state.png') });
  console.log('Saved verified_showcase_paused_state.png');

  await browser.close();
  console.log('AUTO-SCROLL 6S LOOP VERIFICATION COMPLETED SUCCESSFULLY!');
})();
