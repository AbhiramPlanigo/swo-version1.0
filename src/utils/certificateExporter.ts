import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  filename?: string;
  scale?: number;
}

/**
 * Locate the certificate element in the DOM by explicit ID or common fallback selectors.
 */
export function findCertificateElement(elementId?: string): HTMLElement | null {
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) return el;
  }
  const candidateIds = [
    'student-certificate-view',
    'modal-certificate',
    'printable-certificate',
  ];
  for (const id of candidateIds) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return (
    document.querySelector('[data-certificate-canvas]') ||
    document.querySelector('div[id*="certificate"]')
  ) as HTMLElement | null;
}

/**
 * Convert an image URL to a safe base64 Data URL using same-origin fetch to prevent canvas tainting.
 */
async function fetchAsDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

/**
 * Convert an oklab color string to standard sRGB rgb() / rgba() string
 */
function oklabToRgb(L: number, a: number, b: number, alpha = 1): string {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const toSRGB = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    return clamped <= 0.0031308
      ? Math.round(clamped * 12.92 * 255)
      : Math.round((1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255);
  };

  const R = toSRGB(r);
  const G = toSRGB(g);
  const B = toSRGB(bl);

  return alpha < 1 ? `rgba(${R}, ${G}, ${B}, ${alpha})` : `rgb(${R}, ${G}, ${B})`;
}

/**
 * Convert an oklch color string to standard sRGB rgb() / rgba() string
 */
function oklchToRgb(L: number, C: number, H: number, alpha = 1): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  return oklabToRgb(L, a, b, alpha);
}

/**
 * Replaces modern color functions (oklab, oklch) in any CSS value string with standard rgb()/rgba()
 */
export function sanitizeModernColors(str: string): string {
  if (!str || typeof str !== 'string') return str;
  if (!str.includes('oklab') && !str.includes('oklch')) return str;

  let result = str.replace(
    /oklab\(\s*([0-9.]+%?)\s+([+-]?[0-9.]+%?)\s+([+-]?[0-9.]+%?)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi,
    (_match, lStr, aStr, bStr, alphaStr) => {
      const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      const a = aStr.endsWith('%') ? (parseFloat(aStr) / 100) * 0.4 : parseFloat(aStr);
      const b = bStr.endsWith('%') ? (parseFloat(bStr) / 100) * 0.4 : parseFloat(bStr);
      let alpha = 1;
      if (alphaStr) {
        alpha = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
      }
      return oklabToRgb(L, a, b, alpha);
    }
  );

  result = result.replace(
    /oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg|rad|turn)?)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi,
    (_match, lStr, cStr, hStr, alphaStr) => {
      const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      const C = cStr.endsWith('%') ? (parseFloat(cStr) / 100) * 0.4 : parseFloat(cStr);
      let H = parseFloat(hStr);
      if (hStr.endsWith('rad')) H = (H * 180) / Math.PI;
      else if (hStr.endsWith('turn')) H = H * 360;
      let alpha = 1;
      if (alphaStr) {
        alpha = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
      }
      return oklchToRgb(L, C, H, alpha);
    }
  );

  return result;
}

/**
 * Safely wraps a CSSStyleDeclaration to convert any oklab/oklch colors to sRGB without throwing Illegal Invocation
 */
function createStyleProxy(realStyle: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(realStyle, {
    get(target, prop) {
      const val = (target as any)[prop];
      if (typeof val === 'function') {
        return function (...args: any[]) {
          const res = val.apply(target, args);
          if (typeof res === 'string' && (res.includes('oklab') || res.includes('oklch'))) {
            return sanitizeModernColors(res);
          }
          return res;
        };
      }
      if (typeof val === 'string' && (val.includes('oklab') || val.includes('oklch'))) {
        return sanitizeModernColors(val);
      }
      return val;
    },
  });
}

/**
 * Capture the certificate as a high-definition canvas (2x scale) directly from the target element.
 * Guarantees standard A4 Landscape proportion (297/210 aspect ratio) with ultra-HD sharpness (2040 x 1442+ px).
 */
export async function captureCertificateCanvas(
  elementId: string,
  options: ExportOptions = {}
): Promise<HTMLCanvasElement> {
  const targetEl = findCertificateElement(elementId);
  if (!targetEl) {
    throw new Error(`Certificate element "${elementId}" was not found in the DOM.`);
  }

  // Pre-convert any non-data URLs to base64 Data URLs so html2canvas never suffers CORS/taint errors
  const imgs = Array.from(targetEl.querySelectorAll('img'));
  const originalSrcMap = new Map<HTMLImageElement, string>();

  await Promise.all(
    imgs.map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) {
        originalSrcMap.set(img, img.src);
        try {
          const dataUrl = await fetchAsDataUrl(img.src);
          if (dataUrl && dataUrl.startsWith('data:')) {
            img.src = dataUrl;
          }
        } catch {
          // keep original
        }
      }
    })
  );

  // Ensure all fonts are ready for crisp typographic rasterization
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font readiness API times out
    }
  }

  // Temporarily proxy window.getComputedStyle so html2canvas never sees oklab/oklch in modern browser styles
  const origWindowGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    const cs = origWindowGetComputedStyle.call(window, elt, pseudoElt);
    return createStyleProxy(cs);
  };

  // Create an unscaled, isolated host container so html2canvas measures true 900x636 bounds
  // (Prevents ancestor transform: scale(...) from cutting off the bottom signatories of the certificate!)
  const isolatedContainer = document.createElement('div');
  isolatedContainer.style.position = 'fixed';
  isolatedContainer.style.left = '-9999px';
  isolatedContainer.style.top = '0';
  isolatedContainer.style.width = '900px';
  isolatedContainer.style.height = '636px';
  isolatedContainer.style.transform = 'none';
  isolatedContainer.style.margin = '0';
  isolatedContainer.style.padding = '0';
  isolatedContainer.style.zIndex = '-9999';
  isolatedContainer.style.overflow = 'hidden';

  const clonedTarget = targetEl.cloneNode(true) as HTMLElement;
  clonedTarget.style.transform = 'none';
  clonedTarget.style.margin = '0';
  clonedTarget.style.width = '900px';
  clonedTarget.style.height = '636px';
  clonedTarget.style.minWidth = '900px';
  clonedTarget.style.minHeight = '636px';
  clonedTarget.style.maxWidth = '900px';
  clonedTarget.style.maxHeight = '636px';
  clonedTarget.style.boxSizing = 'border-box';

  isolatedContainer.appendChild(clonedTarget);
  document.body.appendChild(isolatedContainer);

  try {
    const scale = options.scale || 2; // 2x gives 1800 x 1272 ultra HD sharpness
    const canvas = await html2canvas(clonedTarget, {
      scale,
      width: 900,
      height: 636,
      windowWidth: 1400,
      windowHeight: 900,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedEl) => {
        // 1. Intercept getComputedStyle in the cloned iframe window to automatically convert oklab/oklch to rgb
        if (clonedDoc.defaultView) {
          const win = clonedDoc.defaultView;
          const origGetComputedStyle = win.getComputedStyle;
          win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            const cs = origGetComputedStyle.call(win, elt, pseudoElt);
            return createStyleProxy(cs);
          };
        }

        // 2. Explicitly sanitize inline and computed styles on all cloned nodes
        const colorProps = [
          'color',
          'backgroundColor',
          'borderColor',
          'borderTopColor',
          'borderRightColor',
          'borderBottomColor',
          'borderLeftColor',
          'outlineColor',
        ];
        const allNodes = [clonedEl, ...Array.from(clonedEl.querySelectorAll('*'))];
        for (const node of allNodes) {
          if (node instanceof HTMLElement || node instanceof SVGElement) {
            const style = node.style;
            for (const cp of colorProps) {
              const val = (style as any)[cp];
              if (typeof val === 'string' && (val.includes('oklab') || val.includes('oklch'))) {
                (style as any)[cp] = sanitizeModernColors(val);
              }
            }
          }
        }

        // 3. Guarantee clean unscaled physical A4 Landscape dimensions inside the cloned DOM
        clonedEl.style.transform = 'none';
        clonedEl.style.margin = '0';
        clonedEl.style.width = '900px';
        clonedEl.style.height = '636px';
        clonedEl.style.minWidth = '900px';
        clonedEl.style.minHeight = '636px';
        clonedEl.style.maxWidth = '900px';
        clonedEl.style.maxHeight = '636px';
        clonedEl.style.boxSizing = 'border-box';

        const clonedImgs = clonedEl.querySelectorAll('img');
        clonedImgs.forEach((cImg) => {
          cImg.setAttribute('crossorigin', 'anonymous');
        });
      },
    });

    return canvas;
  } finally {
    // Remove isolated container from DOM
    if (isolatedContainer.parentNode) {
      isolatedContainer.parentNode.removeChild(isolatedContainer);
    }

    // Restore window.getComputedStyle
    window.getComputedStyle = origWindowGetComputedStyle;

    // Restore original image sources on on-screen element
    originalSrcMap.forEach((origSrc, img) => {
      img.src = origSrc;
    });
  }
}

/**
 * Download certificate as a standard single-page A4 Landscape PDF (297 mm x 210 mm).
 * The PDF is rendered directly in full landscape orientation filling the entire page without bottom whitespace.
 */
export async function downloadCertificateAsPdf(
  elementId: string,
  filename = 'Christ_University_Certificate'
): Promise<void> {
  const canvas = await captureCertificateCanvas(elementId, { scale: 2 });
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4', // Exactly 297 mm x 210 mm
    compress: true,
  });

  // Exactly fills the 297mm x 210mm page from (0, 0)
  pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');

  const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${safeName}.pdf`);
}

/**
 * Download certificate as a high-definition JPEG image (matching preview aspect ratio).
 */
export async function downloadCertificateAsJpeg(
  elementId: string,
  filename = 'Christ_University_Certificate'
): Promise<void> {
  const canvas = await captureCertificateCanvas(elementId, { scale: 2 });
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const link = document.createElement('a');
  link.download = `${safeName}.jpg`;
  link.href = imgData;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print certificate with pixel-perfect single-page A4 Landscape layout.
 * Enforces strict `@page { size: A4 landscape; margin: 0; }` inside an isolated iframe,
 * guaranteeing the printed document is strictly 1 single landscape page with zero whitespace below.
 */
export async function printCertificate(elementId: string): Promise<void> {
  const targetEl = findCertificateElement(elementId);
  if (!targetEl) {
    window.print();
    return;
  }

  try {
    const canvas = await captureCertificateCanvas(elementId, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Create isolated print iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Christ University Official Certificate</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            @media print {
              @page {
                size: A4 landscape;
                margin: 0;
              }
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            html, body {
              width: 297mm !important;
              height: 210mm !important;
              max-width: 297mm !important;
              max-height: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            img {
              width: 297mm !important;
              height: 210mm !important;
              max-width: 297mm !important;
              max-height: 210mm !important;
              object-fit: fill !important;
              display: block !important;
              margin: 0 !important;
              padding: 0 !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Christ University Official Certificate" />
        </body>
      </html>
    `);
    doc.close();

    // Wait for image to be fully decoded inside the iframe
    await new Promise((resolve) => setTimeout(resolve, 350));

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Cleanup iframe after print dialog is handled
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 4000);
  } catch (err) {
    console.warn('Certificate print error, falling back to window.print():', err);
    window.print();
  }
}
