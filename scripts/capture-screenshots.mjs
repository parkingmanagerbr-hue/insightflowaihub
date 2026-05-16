/**
 * InsightFlow — Automated Screenshot Capture
 * Logs in via Supabase, navigates all pages, saves full-page PNGs
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs EMAIL PASSWORD
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const [,, EMAIL, PASSWORD] = process.argv;
const BASE_URL = 'https://insightflowaihub.netlify.app';
const OUT_DIR  = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/capture-screenshots.mjs EMAIL PASSWORD');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { name: '01-landing',       url: '/',                        auth: false, fullPage: true  },
  { name: '02-auth',          url: '/auth',                    auth: false, fullPage: false },
  { name: '03-plans',         url: '/plans',                   auth: false, fullPage: true  },
  { name: '04-dashboard',     url: '/dashboard',               auth: true,  fullPage: false },
  { name: '05-ai-chat',       url: '/dashboard/chat',          auth: true,  fullPage: false },
  { name: '06-reports',       url: '/dashboard/reports',       auth: true,  fullPage: false },
  { name: '07-powerbi',       url: '/dashboard/powerbi',       auth: true,  fullPage: false },
  { name: '08-history',       url: '/dashboard/history',       auth: true,  fullPage: false },
  { name: '09-executions',    url: '/dashboard/executions',    auth: true,  fullPage: false },
  { name: '10-settings',      url: '/dashboard/settings',      auth: true,  fullPage: false },
  { name: '11-admin',         url: '/dashboard/admin',         auth: true,  fullPage: false },
  { name: '12-site-config',   url: '/dashboard/site-config',   auth: true,  fullPage: false },
];

(async () => {
  console.log('🚀 Launching browser…');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  console.log('🔑 Logging in…');
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  await page.click('input[type="email"]');
  await page.type('input[type="email"]', EMAIL, { delay: 50 });
  await page.click('input[type="password"]');
  await page.type('input[type="password"]', PASSWORD, { delay: 50 });
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard after login
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
  console.log(`✅ Logged in — now at: ${page.url()}`);

  // ── CAPTURE EACH PAGE ──────────────────────────────────────────────────────
  for (const p of PAGES) {
    console.log(`📸 Capturing ${p.name} (${p.url})…`);
    try {
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 1500)); // let animations settle

      const outPath = path.join(OUT_DIR, `${p.name}.png`);
      await page.screenshot({ path: outPath, fullPage: p.fullPage });
      console.log(`   ✅ Saved: ${outPath}`);
    } catch (err) {
      console.warn(`   ⚠️  Failed ${p.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\n✅ Done! Screenshots saved to: ${OUT_DIR}`);
  console.log('Files:');
  fs.readdirSync(OUT_DIR).forEach(f => console.log('  ' + f));
})();
