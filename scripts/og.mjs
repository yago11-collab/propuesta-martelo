// Genera public/img/og-placeholder.png a partir de scripts/og.html (usa el Chrome instalado).
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.resolve('scripts/og.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/img/og-placeholder.png' });
await browser.close();
console.log('OK public/img/og-placeholder.png');
