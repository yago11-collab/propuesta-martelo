// Capturas de la demo con Playwright: escritorio (1440 px) y móvil (390 px).
// Requiere el servidor local en marcha: npm run serve  (http://localhost:8080)
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:8080/';
const browser = await chromium.launch({ channel: 'chrome' });

// "inicio" = primera pantalla (nítida); "completa" = toda la página.
// La completa de móvil va a 1x: a 2x supera el alto máximo de captura de Chrome (~16 384 px).
const capturas = [
  { archivo: 'escritorio-1440-inicio', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, fullPage: false },
  { archivo: 'escritorio-1440-completa', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, fullPage: true },
  { archivo: 'movil-390-inicio', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, fullPage: false },
  { archivo: 'movil-390-completa', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, fullPage: true },
];

for (const { archivo, fullPage, ...opciones } of capturas) {
  // reducedMotion: 'reduce' para que las animaciones de entrada no dejen bloques invisibles en la captura completa
  const ctx = await browser.newContext({ ...opciones, reducedMotion: 'reduce', locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `capturas/${archivo}.png`, fullPage });
  await ctx.close();
  console.log('OK', archivo);
}
await browser.close();
