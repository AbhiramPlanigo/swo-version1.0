import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { sanitizeModernColors } from './certificateExporter';

export interface TicketExportOptions {
  filename?: string;
  scale?: number;
}

export function findTicketElement(elementId?: string): HTMLElement | null {
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) return el;
  }
  const candidates = ['booking-qr-pass', 'active-ticket-pass', 'ticket-card-view'];
  for (const id of candidates) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return document.querySelector('[data-ticket-pass]') as HTMLElement | null;
}

/**
 * Safely wraps a CSSStyleDeclaration to convert any oklab/oklch colors to sRGB
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
 * Capture the ticket pass card as an ultra-high-definition canvas (3x scale) using an isolated off-screen sandbox.
 * Guarantees standard proportions without being clipped by modals, CSS scale, or responsive constraints.
 */
export async function captureTicketCanvas(
  elementId: string,
  options: TicketExportOptions = {}
): Promise<HTMLCanvasElement> {
  const targetEl = findTicketElement(elementId);
  if (!targetEl) {
    throw new Error(`Ticket element "${elementId}" was not found in the DOM.`);
  }

  // Ensure fonts are ready
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // continue
    }
  }

  // Intercept window.getComputedStyle on main window so html2canvas never crashes on modern oklab/oklch styles
  const origWindowGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    const cs = origWindowGetComputedStyle.call(window, elt, pseudoElt);
    return createStyleProxy(cs);
  };

  const rect = targetEl.getBoundingClientRect();
  const naturalWidth = Math.round(rect.width) || 400;

  // Create an unscaled, isolated host container for html2canvas
  const isolatedContainer = document.createElement('div');
  isolatedContainer.style.position = 'fixed';
  isolatedContainer.style.left = '-9999px';
  isolatedContainer.style.top = '0';
  isolatedContainer.style.width = `${naturalWidth}px`;
  isolatedContainer.style.height = 'auto';
  isolatedContainer.style.transform = 'none';
  isolatedContainer.style.margin = '0';
  isolatedContainer.style.padding = '0';
  isolatedContainer.style.zIndex = '-9999';
  isolatedContainer.style.overflow = 'visible';
  isolatedContainer.style.background = 'transparent';

  const clonedTarget = targetEl.cloneNode(true) as HTMLElement;
  clonedTarget.style.transform = 'none';
  clonedTarget.style.margin = '0';
  clonedTarget.style.height = 'auto';
  clonedTarget.style.width = `${naturalWidth}px`;
  clonedTarget.style.minWidth = `${naturalWidth}px`;
  clonedTarget.style.maxWidth = `${naturalWidth}px`;
  clonedTarget.style.boxSizing = 'border-box';

  // Remove any animated shimmer elements in clone that cause gradient / pseudo-element rasterization issues
  const shimmers = clonedTarget.querySelectorAll('.ticket-shimmer-effect');
  shimmers.forEach((s) => s.remove());

  isolatedContainer.appendChild(clonedTarget);
  document.body.appendChild(isolatedContainer);

  try {
    const scale = options.scale || 3; // 3x for crisp text & barcodes
    const targetHeight = Math.ceil(clonedTarget.scrollHeight || clonedTarget.offsetHeight);

    const canvas = await html2canvas(clonedTarget, {
      scale,
      width: naturalWidth,
      height: targetHeight,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#002147',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedEl) => {
        if (clonedDoc.defaultView) {
          const win = clonedDoc.defaultView;
          const origGetComputedStyle = win.getComputedStyle;
          win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            const cs = origGetComputedStyle.call(win, elt, pseudoElt);
            return createStyleProxy(cs);
          };
        }

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

        clonedEl.style.transform = 'none';
        clonedEl.style.width = `${naturalWidth}px`;
        clonedEl.style.boxSizing = 'border-box';

        const clonedImgs = clonedEl.querySelectorAll('img');
        clonedImgs.forEach((cImg) => {
          cImg.setAttribute('crossorigin', 'anonymous');
        });
      },
    });

    return canvas;
  } finally {
    if (isolatedContainer.parentNode) {
      isolatedContainer.parentNode.removeChild(isolatedContainer);
    }
    window.getComputedStyle = origWindowGetComputedStyle;
  }
}

/**
 * Download ticket pass as a high-definition JPEG image in the exact same format.
 */
export async function downloadTicketAsJpeg(
  elementId: string,
  filename = 'Christ_University_Event_Pass'
): Promise<void> {
  const canvas = await captureTicketCanvas(elementId, { scale: 3 });

  // Create canvas with solid background for JPEG format compliance
  const solidCanvas = document.createElement('canvas');
  solidCanvas.width = canvas.width;
  solidCanvas.height = canvas.height;
  const ctx = solidCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#002147';
    ctx.fillRect(0, 0, solidCanvas.width, solidCanvas.height);
    ctx.drawImage(canvas, 0, 0);
  }

  const imgData = (ctx ? solidCanvas : canvas).toDataURL('image/jpeg', 0.98);

  const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const link = document.createElement('a');
  link.download = `${safeName}.jpg`;
  link.href = imgData;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download ticket pass as a PDF formatted with the EXACT aspect ratio of the pass card.
 * No excess white space, perfectly scaled for mobile wallets and desktop viewers.
 */
export async function downloadTicketAsPdf(
  elementId: string,
  filename = 'Christ_University_Event_Pass'
): Promise<void> {
  const canvas = await captureTicketCanvas(elementId, { scale: 3 });
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // Exact aspect ratio of the pass card
  const aspect = canvas.height / canvas.width;
  const widthMm = 100; // 100mm width (standard mobile wallet pass width)
  const heightMm = Math.round(widthMm * aspect);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm], // Exact ratio of the pass!
    compress: true,
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');

  const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${safeName}.pdf`);
}

/**
 * Print ticket pass inside an isolated iframe, centered with exact pass aspect ratio and zero blank overflow.
 */
export async function printTicketPass(elementId: string): Promise<void> {
  const targetEl = findTicketElement(elementId);
  if (!targetEl) {
    window.print();
    return;
  }

  try {
    const canvas = await captureTicketCanvas(elementId, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');

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
          <title>Christ University Official Event Pass</title>
          <style>
            @page {
              size: auto;
              margin: 12mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
              margin: 0;
              padding: 0;
            }
            html, body {
              width: 100% !important;
              height: 100% !important;
              background: #ffffff !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .pass-container {
              width: 95mm;
              max-width: 95mm;
              margin: auto;
              text-align: center;
              page-break-inside: avoid !important;
            }
            img {
              width: 100% !important;
              height: auto !important;
              display: block !important;
              margin: 0 auto !important;
              border-radius: 24px !important;
              box-shadow: 0 8px 32px rgba(0,33,71,0.2) !important;
            }
            .print-footer {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 8pt;
              color: #475569;
              margin-top: 5mm;
              text-align: center;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="pass-container">
            <img src="${imgData}" alt="Christ University Official Event Pass" />
            <div class="print-footer">
              <strong>Christ University • Student Welfare Office</strong><br/>
              Bangalore Yeshwanthpur Campus • Verified Digital Entry Pass<br/>
              Scan this QR ticket at the auditorium entrance for verified check-in.
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    await new Promise((resolve) => setTimeout(resolve, 400));

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 4000);
  } catch (err) {
    console.warn('Isolated ticket print error, falling back to window.print():', err);
    window.print();
  }
}
