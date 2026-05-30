#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import os from 'os';
import path from 'path';

const BASE_URL = process.env.EBNJAOS_BASE_URL || 'http://127.0.0.1:4173/ebnjaOS_beta';
const OUT_DIR = process.env.EBNJAOS_OUT_DIR || path.join(os.homedir(), 'Desktop', 'ebnjaOS_QA_152C');

const routes = [
  { slug: 'dashboard', path: '/' },
  { slug: 'tasks', path: '/tasks' },
  { slug: 'calendar', path: '/calendar' },
  { slug: 'fitness', path: '/fitness' },
  { slug: 'qa', path: '/qa' },
  { slug: 'notes', path: '/notes' },
  { slug: 'resources', path: '/resources' },
  { slug: 'review', path: '/review' },
  { slug: 'goals', path: '/goals' },
  { slug: 'projects', path: '/projects' },
  { slug: 'settings', path: '/settings' },
];

const viewports = [
  { slug: 'desktop-1920', width: 1920, height: 1080 },
  { slug: 'desktop-1512', width: 1512, height: 982 },
  { slug: 'desktop-1366', width: 1366, height: 768 },
  { slug: 'iphone-pro-max', width: 430, height: 932, isMobile: true, hasTouch: true },
  { slug: 'iphone-pro', width: 393, height: 852, isMobile: true, hasTouch: true },
  { slug: 'iphone-se', width: 375, height: 667, isMobile: true, hasTouch: true },
];

function joinUrl(base, p) {
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = p.startsWith('/') ? p : `/${p}`;
  return `${cleanBase}${cleanPath}`;
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: !!vp.isMobile,
        hasTouch: !!vp.hasTouch,
        deviceScaleFactor: vp.isMobile ? 3 : 2,
      });

      const page = await context.newPage();
      page.setDefaultTimeout(30000);

      for (const route of routes) {
        const url = joinUrl(BASE_URL, route.path);
        const file = path.join(OUT_DIR, `${vp.slug}__${route.slug}.png`);

        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.screenshot({ path: file, fullPage: true });
          console.log(`OK ${file}`);
        } catch (error) {
          console.error(`FAIL ${vp.slug} ${route.slug}: ${error.message}`);
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Done. Output: ${OUT_DIR}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
