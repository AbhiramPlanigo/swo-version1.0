const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    await emailInput.fill('swo.admin@christuniversity.in');
    await page.locator('input[type="password"]').fill('swo2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
  }

  const certNavBtn = page.locator('aside button:has-text("Certificates")');
  await certNavBtn.click();
  await page.waitForTimeout(2000);

  // Close or hide any toast popups
  await page.evaluate(() => {
    const toasts = document.querySelectorAll('[data-sonner-toaster], .sonner-toast');
    toasts.forEach((t) => t.remove());
  });

  // Capture clean preview without toast
  const cert = page.locator('#printable-certificate');
  await cert.screenshot({
    path: 'C:\\Users\\ABHIRAM U\\.gemini\\antigravity-ide\\brain\\f98047f8-3a84-44f3-98f3-f7a1a3828c67\\scratch\\cert_preview_clean.png',
  });
  console.log('Clean preview screenshot saved');

  // Trigger Download PDF and capture download event
  const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
  const downloadBtn = page.locator('button:has-text("Download PDF")');
  await downloadBtn.click();
  const download = await downloadPromise;
  const downloadPath = 'C:\\Users\\ABHIRAM U\\.gemini\\antigravity-ide\\brain\\f98047f8-3a84-44f3-98f3-f7a1a3828c67\\scratch\\exported.pdf';
  await download.saveAs(downloadPath);
  console.log('PDF downloaded successfully:', download.suggestedFilename());
  const stats = fs.statSync(downloadPath);
  console.log('PDF file size:', stats.size, 'bytes');

  // Also trigger Download JPEG
  const jpegPromise = page.waitForEvent('download', { timeout: 10000 });
  const jpegBtn = page.locator('button:has-text("Download JPEG")');
  await jpegBtn.click();
  const jpegDownload = await jpegPromise;
  const jpegPath = 'C:\\Users\\ABHIRAM U\\.gemini\\antigravity-ide\\brain\\f98047f8-3a84-44f3-98f3-f7a1a3828c67\\scratch\\exported.jpg';
  await jpegDownload.saveAs(jpegPath);
  console.log('JPEG downloaded successfully:', jpegDownload.suggestedFilename());

  // Also test all templates
  const templates = ['modern-blue', 'minimal-academic', 'heritage-distinction', 'classic-gold'];
  for (const t of templates) {
    const tmplBtn = page.locator(`button[data-template-id="${t}"], button:has-text("${t}")`);
    // Or click template button in studio
    const btn = page.locator(`button:has-text("${t === 'classic-gold' ? 'Classic Gold Crest' : t === 'modern-blue' ? 'Modern Executive Blue' : t === 'minimal-academic' ? 'Minimalist Academic Seal' : 'Heritage Honor Roll'}")`);
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(600);
      await cert.screenshot({
        path: `C:\\Users\\ABHIRAM U\\.gemini\\antigravity-ide\\brain\\f98047f8-3a84-44f3-98f3-f7a1a3828c67\\scratch\\template_${t}.png`,
      });
      console.log(`Saved screenshot for ${t}`);
    }
  }

  await browser.close();
})();
