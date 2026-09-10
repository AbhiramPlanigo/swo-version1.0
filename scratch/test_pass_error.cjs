const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:3000/events', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Sign in as student if needed
  await page.evaluate(() => {
    localStorage.setItem('swo_student_auth', JSON.stringify({
      id: 'usr_student_01',
      name: 'Abhiram U',
      role: 'student',
      regNo: '2543017',
      department: 'School of Sciences',
      year: '2nd Year',
      campus: 'Yeshwanthpur Campus, Bengaluru',
      email: 'abhiram.u@science.christuniversity.in',
    }));
  });

  await page.goto('http://localhost:3000/my-registrations', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Check if any "View QR Pass" button exists
  const passBtn = page.locator('button:has-text("View QR Pass")').first();
  if (await passBtn.isVisible()) {
    console.log('Found View QR Pass button, clicking...');
    await passBtn.click();
    await page.waitForTimeout(1000);

    // Try clicking Download Pass (JPEG)
    const downloadJpegBtn = page.locator('button:has-text("Download Pass (JPEG)")');
    if (await downloadJpegBtn.isVisible()) {
      console.log('Clicking Download Pass (JPEG)...');
      await downloadJpegBtn.click();
      await page.waitForTimeout(2000);
    }
  } else {
    console.log('No View QR Pass button found on /my-registrations');
  }

  await browser.close();
})();
