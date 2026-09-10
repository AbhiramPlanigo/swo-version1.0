const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
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

  const debug = await page.evaluate(async () => {
    const targetEl = document.getElementById('printable-certificate');
    const scale = 2;

    let oncloneInfo = {};

    // Run html2canvas
    const html2canvas = window.html2canvas || (await import('/node_modules/html2canvas/dist/html2canvas.js')).default;

    // Check what targetEl has on host
    const hostRect = targetEl.getBoundingClientRect();
    const hostParentRect = targetEl.parentElement.getBoundingClientRect();

    const canvas = await html2canvas(targetEl, {
      scale,
      width: 900,
      height: 636,
      useCORS: true,
      allowTaint: false,
      logging: true,
      onclone: (clonedDoc, clonedEl) => {
        const cRect = clonedEl.getBoundingClientRect();
        const pRect = clonedEl.parentElement.getBoundingClientRect();
        const pStyle = clonedDoc.defaultView.getComputedStyle(clonedEl.parentElement);
        const cStyle = clonedDoc.defaultView.getComputedStyle(clonedEl);

        // Find Benny Thomas p tag in clone
        const bennyP = Array.from(clonedEl.querySelectorAll('p')).find(p => p.innerText.includes('Benny Thomas'));
        const bennyRect = bennyP ? bennyP.getBoundingClientRect() : null;

        // Find designation in clone
        const desigP = Array.from(clonedEl.querySelectorAll('p')).find(p => p.innerText.includes('Bangalore Yeshwanthpur'));
        const desigRect = desigP ? desigP.getBoundingClientRect() : null;

        // Find footer in clone
        const footerSpan = Array.from(clonedEl.querySelectorAll('span')).find(s => s.innerText.includes('Cert ID'));
        const footerRect = footerSpan ? footerSpan.getBoundingClientRect() : null;

        oncloneInfo = {
          cRect,
          pRect,
          pStyleTransform: pStyle.transform,
          pStyleMargin: pStyle.marginBottom,
          cStyleTransform: cStyle.transform,
          cStyleHeight: cStyle.height,
          bennyRect,
          desigRect,
          footerRect,
        };
      }
    });

    return {
      hostRect,
      hostParentRect,
      oncloneInfo,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    };
  });

  console.log('HTML2CANVAS CLONE DEBUG:', JSON.stringify(debug, null, 2));

  await browser.close();
})();
