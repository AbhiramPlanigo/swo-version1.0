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

  const report = await page.evaluate(() => {
    const cert = document.getElementById('printable-certificate');
    const clone = cert.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.width = '900px';
    clone.style.height = '636px';
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '99999';
    document.body.appendChild(clone);

    const data = [];
    const walk = (el, p = '') => {
      const r = el.getBoundingClientRect();
      const rawText = el.innerText || el.textContent || '';
      const txt = el.children.length === 0 ? rawText.trim() : '';
      data.push({
        path: p,
        tag: el.tagName.toLowerCase(),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
        scrollHeight: el.scrollHeight,
        text: txt ? txt.slice(0, 45) : undefined,
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 45),
      });
      Array.from(el.children).forEach((c, idx) => walk(c, p ? p + '>' + idx : '' + idx));
    };
    walk(clone);
    document.body.removeChild(clone);
    return data;
  });

  const bottomItems = report.filter((r) => r.top > 400 || r.bottom > 500);
  console.log('Bottom items in unscaled 900x636 clone:', JSON.stringify(bottomItems, null, 2));

  await browser.close();
})();
