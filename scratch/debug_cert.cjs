const pw = require('C:/Users/ABHIRAM U/AppData/Local/ms-playwright-go/1.50.1/package');
const { chromium } = pw;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000/admin.swo.ypr', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    await emailInput.fill('swo.admin@christuniversity.in');
    await page.locator('input[type="password"]').fill('swo2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
  }

  const certNavBtn = page.locator('aside button:has-text("Certificates")');
  await certNavBtn.click();
  await page.waitForTimeout(1500);

  const cert = page.locator('#printable-certificate');
  const count = await cert.count();
  console.log('Cert elements found:', count);
  if (count === 0) {
    await browser.close();
    return;
  }

  const metrics = await page.evaluate(() => {
    const cert = document.getElementById('printable-certificate');
    if (!cert) return null;

    const certRect = cert.getBoundingClientRect();
    const children = Array.from(cert.children).map((c, i) => {
      const rect = c.getBoundingClientRect();
      return {
        index: i,
        tag: c.tagName,
        className: c.className.slice(0, 50),
        rectHeight: Math.round(rect.height),
        rectTop: Math.round(rect.top),
        rectBottom: Math.round(rect.bottom),
        clientHeight: c.clientHeight,
        scrollHeight: c.scrollHeight,
      };
    });

    const sigDiv = cert.querySelector('.grid.grid-cols-3') || cert.querySelector('[class*="grid-cols"]') || cert.querySelector('.shrink-0.pt-2');
    let sigDetails = null;
    if (sigDiv) {
      const sRect = sigDiv.getBoundingClientRect();
      const colDetails = Array.from(sigDiv.children).map((col) => {
        const cRect = col.getBoundingClientRect();
        const pTags = Array.from(col.querySelectorAll('p, span')).map((el) => {
          const r = el.getBoundingClientRect();
          return {
            text: el.innerText.trim(),
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            height: Math.round(r.height),
            scrollHeight: el.scrollHeight,
          };
        });
        return {
          colRect: { top: Math.round(cRect.top), bottom: Math.round(cRect.bottom), height: Math.round(cRect.height) },
          pTags,
        };
      });
      sigDetails = {
        top: Math.round(sRect.top),
        bottom: Math.round(sRect.bottom),
        height: Math.round(sRect.height),
        scrollHeight: sigDiv.scrollHeight,
        colDetails,
      };
    }

    return {
      certRect: { top: Math.round(certRect.top), bottom: Math.round(certRect.bottom), height: Math.round(certRect.height) },
      certScrollHeight: cert.scrollHeight,
      certClientHeight: cert.clientHeight,
      children,
      sigDetails,
    };
  });

  console.log('Metrics:', JSON.stringify(metrics, null, 2));

  await cert.screenshot({ path: 'C:\\Users\\ABHIRAM U\\.gemini\\antigravity-ide\\brain\\f98047f8-3a84-44f3-98f3-f7a1a3828c67\\scratch\\cert_current.png' });
  console.log('Screenshot saved to scratch/cert_current.png');

  await browser.close();
})();
