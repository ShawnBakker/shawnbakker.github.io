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
  await expect(page.locator('.hero-actions a', { hasText: 'View parcelscope' })).toHaveAttribute('href', '#work');
  await expect(page.locator('.hero-actions a', { hasText: 'Email me' })).toHaveAttribute('href', /^mailto:/);
  await expect(page.locator('.featured a[href="/order-engine/"]')).toBeVisible();
});

test('homepage: theme toggle flips data-theme', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await page.click('#themeToggle');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.click('#themeToggle');
  await expect(html).not.toHaveAttribute('data-theme', 'dark');
});

test('homepage: parcel map is keyboard-selectable', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('#parcelList button').first();
  await expect(first).toBeVisible();
  await first.click();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#mapReadout')).toContainText('buildable');
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
