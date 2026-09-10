const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Sign in as Rahul
  const signInBtn = page.locator('button:has-text("Sign In"), button:has-text("Student Login")').first();
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
    await page.waitForTimeout(600);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Open Registrations view directly via state/button
  const profileBtn = page.locator('button:has-text("Rahul")').first();
  if (await profileBtn.isVisible()) {
    await profileBtn.click();
    await page.waitForTimeout(400);
    const regsOption = page.locator('button:has-text("Registrations")').first();
    if (await regsOption.isVisible()) {
      await regsOption.click();
      await page.waitForTimeout(1000);
    }
  }

  // Take screenshot of registrations view
  await page.screenshot({ path: 'scratch/regs_view_unobstructed.png' });
  console.log('Saved regs_view_unobstructed.png');

  // Look for View QR Pass
  const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await viewPassBtn.isVisible()) {
    console.log('Clicking View QR Pass...');
    await viewPassBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scratch/regs_pass_modal_opened.png' });
    console.log('Saved regs_pass_modal_opened.png');
  }

  await browser.close();
})();
