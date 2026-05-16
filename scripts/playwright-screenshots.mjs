/**
 * InsightFlow — Playwright Screenshot Capture
 * Injects Supabase session into localStorage and captures all pages.
 *
 * Usage: node scripts/playwright-screenshots.mjs
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://insightflowaihub.netlify.app';
const OUT_DIR  = path.join(__dirname, '..', 'screenshots');
const SESSION_FILE = 'C:/Users/m_rov/AppData/Local/Temp/sb-session.json';
const SUPABASE_URL = 'https://ehzikjukkowxvfkfiyxu.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoemlranVra293eHZma2ZpeXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDU0MjUsImV4cCI6MjA4NDA4MTQyNX0.FpqKa1pQgXNUCRaovR91zVw9SPp9ewA3_9Bm9IQfAzs';

const PAGES = [
  { name: '01-landing',     url: '/',                      auth: false, fullPage: true  },
  { name: '02-auth',        url: '/auth',                  auth: false, fullPage: false },
  { name: '03-plans',       url: '/plans',                 auth: false, fullPage: true  },
  { name: '04-dashboard',   url: '/dashboard',             auth: true,  fullPage: false },
  { name: '05-ai-chat',     url: '/dashboard/chat',        auth: true,  fullPage: false },
  { name: '06-reports',     url: '/dashboard/reports',     auth: true,  fullPage: false },
  { name: '07-powerbi',     url: '/dashboard/powerbi',     auth: true,  fullPage: false },
  { name: '08-history',     url: '/dashboard/history',     auth: true,  fullPage: false },
  { name: '09-executions',  url: '/dashboard/executions',  auth: true,  fullPage: false },
  { name: '10-settings',    url: '/dashboard/settings',    auth: true,  fullPage: false },
  { name: '11-admin',       url: '/dashboard/admin',       auth: true,  fullPage: false },
  { name: '12-site-config', url: '/dashboard/site-config', auth: true,  fullPage: false },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

// Build Supabase localStorage key
const projectRef = 'ehzikjukkowxvfkfiyxu';
const LS_KEY = `sb-${projectRef}-auth-token`;

(async () => {
  // Load session
  const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  const storageValue = JSON.stringify({
    access_token: session.access_token,
    token_type: 'bearer',
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    refresh_token: session.refresh_token,
    user: session.user,
  });

  console.log('🚀 Launching Chrome…');
  const browser = await chromium.launch({
    channel: 'chrome',          // Use existing Chrome install — no download
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: {
      cookies: [],
      origins: [
        {
          origin: BASE_URL,
          localStorage: [
            { name: LS_KEY, value: storageValue },
          ],
        },
      ],
    },
  });

  const page = await context.newPage();

  // ── PUBLIC PAGES (no auth needed) ─────────────────────────────────────────
  for (const p of PAGES.filter(p => !p.auth)) {
    console.log(`📸 ${p.name} (${p.url})…`);
    try {
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(2000);
      const out = path.join(OUT_DIR, `${p.name}.png`);
      await page.screenshot({ path: out, fullPage: p.fullPage });
      console.log(`   ✅ ${out}`);
    } catch (err) {
      console.warn(`   ⚠️  Failed: ${err.message}`);
    }
  }

  // ── AUTH PAGES (inject session via localStorage) ───────────────────────────
  // First navigate to the app so localStorage is set for the domain
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 25000 });

  // Inject session into localStorage
  await page.evaluate(([key, value]) => {
    localStorage.setItem(key, value);
  }, [LS_KEY, storageValue]);

  console.log('🔑 Session injected into localStorage');

  // Wait for auth to propagate
  await page.waitForTimeout(1500);

  for (const p of PAGES.filter(p => p.auth)) {
    console.log(`📸 ${p.name} (${p.url})…`);
    try {
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(2500); // let animations + data settle
      const out = path.join(OUT_DIR, `${p.name}.png`);
      await page.screenshot({ path: out, fullPage: p.fullPage });
      console.log(`   ✅ ${out}`);
    } catch (err) {
      console.warn(`   ⚠️  Failed: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\n✅ Done! Screenshots saved to: ${OUT_DIR}`);
  console.log('Files:');
  fs.readdirSync(OUT_DIR).sort().forEach(f => console.log('  ' + f));
})();
