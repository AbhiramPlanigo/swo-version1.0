const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

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

  // Go to events tab
  await page.locator('button:has-text("Events")').first().click();
  await page.waitForTimeout(1200);

  // Look for any event to view details or register
  // Click on the first event card
  const eventCard = page.locator('h3:has-text("ad")').first();
  if (await eventCard.isVisible()) {
    await eventCard.click();
    await page.waitForTimeout(1200);

    // If "View Pass" or "View Ticket" button in details modal
    const viewTicketBtn = page.locator('button:has-text("View Official Gate Pass"), button:has-text("View Ticket"), button:has-text("View Pass")').first();
    if (await viewTicketBtn.isVisible()) {
      await viewTicketBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Or click profile -> Registrations and click on View QR Pass
  const profileBtn = page.locator('button:has-text("Rahul")').first();
  if (await profileBtn.isVisible()) {
    await profileBtn.click();
    await page.waitForTimeout(500);
    const regsOption = page.locator('button:has-text("Registrations")').first();
    if (await regsOption.isVisible()) {
      await regsOption.click();
      await page.waitForTimeout(1500);

      // Click anywhere on page body to dismiss profile menu
      await page.mouse.click(200, 200);
      await page.waitForTimeout(500);

      const viewPassBtn = page.locator('button:has-text("View QR Pass")').first();
      if (await viewPassBtn.isVisible()) {
        await viewPassBtn.click();
        await page.waitForTimeout(1500);
      }
    }
  }

  await page.screenshot({ path: 'scratch/active_pass_full_screen.png' });
  console.log('Saved active_pass_full_screen.png');

  await browser.close();
})();
