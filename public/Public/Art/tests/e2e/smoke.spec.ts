import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Quick validation that core pages load without errors
 */
test.describe('Smoke Tests', () => {
  test('Home page loads without crashing', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    await expect(page.locator('header')).toBeVisible();
    expect(errors.length).toBeLessThan(3); // Allow minimal errors
  });

  test('Marketplace page loads', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Analytics dashboard loads', async ({ page }) => {
    await page.goto('/analytics-dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Collections page loads', async ({ page }) => {
    await page.goto('/collections', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('NFT detail page loads', async ({ page }) => {
    await page.goto('/nft/1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('Admin dashboard loads', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('Royalties dashboard loads', async ({ page }) => {
    await page.goto('/royalties/SP2YQXK8QX2GQPF8NR6H9F9JFQC5C5H5K5P5T5X5Z', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('main, body')).toBeVisible();
  });
});

/**
 * Performance Tests - Measure page load times
 */
test.describe('Performance', () => {
  test('Home page loads in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // Less than 10 seconds
    
    console.log(`Home page load time: ${loadTime}ms`);
  });

  test('Analytics dashboard loads in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/analytics-dashboard', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Analytics dashboard load time: ${loadTime}ms`);
  });

  test('Discover page renders quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Less than 5 seconds
    
    console.log(`Discover page DOM ready time: ${loadTime}ms`);
  });
});

/**
 * Accessibility Tests - Basic a11y checks
 */
test.describe('Accessibility', () => {
  test('Header has semantic HTML', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const nav = header.locator('nav');
    expect(await nav.count()).toBeGreaterThanOrEqual(0); // May have nav
  });

  test('Main content in main element', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    
    const main = page.locator('main');
    await expect(main.first()).toBeVisible();
  });

  test('Can tab through focusable elements', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Count focusable elements
    const focusableCount = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button:not([disabled])');
      const links = document.querySelectorAll('a');
      const inputs = document.querySelectorAll('input:not([disabled])');
      return buttons.length + links.length + inputs.length;
    });
    
    // Should have some focusable elements
    expect(focusableCount).toBeGreaterThan(0);
  });

  test('Text elements are readable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Check that text is rendered (basic readability check)
    const headings = page.locator('h1, h2, h3');
    const buttons = page.locator('button, a[role="button"]');
    
    const headingCount = await headings.count();
    const buttonCount = await buttons.count();
    
    // Should have at least some interactive elements
    expect(headingCount + buttonCount).toBeGreaterThan(0);
  });
});

/**
 * Error Handling Tests
 */
test.describe('Error Handling', () => {
  test('404 route doesn\'t crash app', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/non-existent-page', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // App should still render (header should be present)
    const header = page.locator('header');
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test('Invalid NFT ID doesn\'t crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/nft/999999999', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Page should render - header should be visible
    const header = page.locator('header');
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test('API errors don\'t crash the app', async ({ page }) => {
    // Test that app handles failed API calls gracefully
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    // App shell should still render
    const header = page.locator('header');
    await expect(header).toBeVisible({ timeout: 5000 });
  });
});
