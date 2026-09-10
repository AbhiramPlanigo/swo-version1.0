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

  const debugInfo = await page.evaluate(async () => {
    const cert = document.getElementById('printable-certificate');
    if (!cert) return 'No cert element';

    // Let's inspect all elements inside cert
    const items = [];
    const walk = (node, depth = 0) => {
      if (node.nodeType === 1) {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        items.push({
          depth,
          tag: node.tagName,
          id: node.id,
          cls: (node.className || '').slice(0, 60),
          rect: {
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            height: Math.round(rect.height),
            width: Math.round(rect.width),
          },
          computedHeight: style.height,
          computedMaxHeight: style.maxHeight,
          computedOverflow: style.overflow,
          computedLineHeight: style.lineHeight,
          computedFontSize: style.fontSize,
          scrollHeight: node.scrollHeight,
          clientHeight: node.clientHeight,
          text: node.children.length === 0 ? node.innerText.slice(0, 40) : undefined,
        });
        for (const child of node.children) {
          walk(child, depth + 1);
        }
      }
    };
    walk(cert);
    return items;
  });

  console.log('DOM Walk on screen:', JSON.stringify(debugInfo, null, 2));

  await browser.close();
})();
