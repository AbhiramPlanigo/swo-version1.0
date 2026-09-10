const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Sign in as Rahul
  const signInBtn = page.locator('button:has-text("Sign In"), button:has-text("Student Login")').first();
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
    await page.waitForTimeout(800);
    const rahulBtn = page.locator('button:has-text("Rahul Sharma")');
    if (await rahulBtn.isVisible()) {
      await rahulBtn.click();
      await page.waitForTimeout(1200);
    }
  }

  // Open user profile menu and click Registrations
  const userMenuBtn = page.locator('button:has-text("Rahul")').first();
  if (await userMenuBtn.isVisible()) {
    await userMenuBtn.click();
    await page.waitForTimeout(600);
    const myRegsOption = page.locator('button:has-text("Registrations"), a:has-text("Registrations")').first();
    if (await myRegsOption.isVisible()) {
      await myRegsOption.click();
      await page.waitForTimeout(1500);
    }
  }

  await browser.close();
})();
