import { test, expect } from '@playwright/test';

test('homepage: product-minded hero and featured order', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Shawn Bakker/);
  await expect(page.locator('.hero h1')).toHaveText('Shawn Bakker');
  await expect(page.locator('.eyebrow').first()).toContainText('Product-minded');
  const cards = await page.locator('.featured .card h3').allTextContents();
  expect(cards).toEqual(['parcelscope', 'Roguemouse', 'Low-Latency Order Execution Engine']);
});

test('homepage: primary CTAs resolve', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-actions a', { hasText: 'View live product' })).toHaveAttribute('href', /parcelscope-six\.vercel\.app/);
  await expect(page.locator('.hero-actions a', { hasText: 'See selected work' })).toHaveAttribute('href', '#work');
  await expect(page.locator('.hero-actions a', { hasText: 'Email me' })).toHaveAttribute('href', /^mailto:/);
  await expect(page.locator('.featured a[href="/order-engine/"]')).toBeVisible();
});

test('theme: first visit defaults to light', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  const btn = page.locator('#themeToggle');
  await expect(btn).toHaveText('dark');
  await expect(btn).toHaveAttribute('aria-label', 'switch to dark theme');
});

test('theme: legacy dark preference is ignored', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('shawnbakker:theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#themeToggle')).toHaveText('dark');
});

test('theme: v2 preference persists across pages and clears the legacy key', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('shawnbakker:theme', 'dark')); // legacy present
  await page.click('#themeToggle');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('shawnbakker:theme:v2'))).toBe('dark');
  expect(await page.evaluate(() => localStorage.getItem('shawnbakker:theme'))).toBeNull(); // legacy cleaned up
  // carries to the case study with no extra click
  await page.goto('/order-engine/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // back to light, then reload: light persists
  await page.click('#themeToggle');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('shawnbakker:theme:v2'))).toBe('light');
});

test('homepage: parcel map is keyboard-selectable', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('#parcelList button').first();
  await expect(first).toBeVisible();
  await first.click();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#mapReadout')).toContainText('buildable');
});

test('exchange-simulator live demo link resolves to a real anchor', async ({ page }) => {
  // The homepage card must point at the demos anchor...
  await page.goto('/');
  await expect(page.locator('a[href="/demos/#exchange-simulator"]')).toHaveText('Live demo');
  // ...the /demos/ page must load successfully...
  const resp = await page.goto('/demos/#exchange-simulator');
  expect(resp.ok()).toBeTruthy();
  // ...and the anchor target must exist on that page.
  await expect(page.locator('#exchange-simulator')).toBeVisible();
});

test('case study renders', async ({ page }) => {
  await page.goto('/order-engine/');
  await expect(page.locator('h1')).toContainText('Order Execution Engine');
  await expect(page.locator('#themeToggle')).toBeVisible();
});

test('no console errors on either page', async ({ page }) => {
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.goto('/order-engine/');
  await page.waitForTimeout(500);
  expect(errs).toEqual([]);
});
