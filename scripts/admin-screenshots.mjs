/**
 * Takes admin page screenshots by temporarily flagging isAdmin=true via window flag.
 * Runs against the local dev server (localhost:8080).
 * Usage: node scripts/admin-screenshots.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:8080';
const OUT_DIR  = path.join(__dirname, '..', 'screenshots');
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoemlranVra293eHZma2ZpeXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDU0MjUsImV4cCI6MjA4NDA4MTQyNX0.FpqKa1pQgXNUCRaovR91zVw9SPp9ewA3_9Bm9IQfAzs';

async function getSession() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ email: 'm_rovariz@hotmail.com', password: 'Nu4qreq15$' });
    const req = https.request({
      hostname: 'ehzikjukkowxvfkfiyxu.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Content-Length': Buffer.byteLength(body) },
    }, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); });
    req.on('error', reject); req.write(body); req.end();
  });
}

(async () => {
  console.log('🔑 Getting session...');
  const session = await getSession();
  if (!session.access_token) { console.error('Login failed:', session); process.exit(1); }

  const LS_KEY = 'sb-ehzikjukkowxvfkfiyxu-auth-token';
  const storageValue = JSON.stringify({
    access_token: session.access_token,
    token_type: 'bearer',
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    refresh_token: session.refresh_token,
    user: session.user,
  });

  console.log('🚀 Launching Chrome...');
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: {
      cookies: [],
      origins: [{ origin: BASE_URL, localStorage: [{ name: LS_KEY, value: storageValue }] }],
    },
  });

  const page = await context.newPage();

  // Navigate to app first to inject the admin flag
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.evaluate(() => { window.__SCREENSHOT_ADMIN__ = true; });

  for (const p of [
    { name: '11-admin',       url: '/dashboard/admin'       },
    { name: '12-site-config', url: '/dashboard/site-config' },
  ]) {
    console.log(`📸 ${p.name} (${p.url})...`);
    await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle', timeout: 25000 });
    // Re-inject flag after navigation (SPA might lose it)
    await page.evaluate(() => { window.__SCREENSHOT_ADMIN__ = true; });
    await page.waitForTimeout(3000);
    const out = path.join(OUT_DIR, `${p.name}.png`);
    await page.screenshot({ path: out });
    console.log(`   ✅ ${out}`);
  }

  await browser.close();
  console.log('\n✅ Admin screenshots done!');
})();
