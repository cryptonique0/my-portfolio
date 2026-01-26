import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Home page snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    // Mask dynamic elements like timestamps/prices
    await expect(page).toHaveScreenshot('home.png', { 
      maxDiffPixelRatio: 0.05,
      mask: [page.locator('[data-testid="price"]')]
    });
  });

  test('Discover page snapshot', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('discover.png', { 
      maxDiffPixelRatio: 0.05,
      mask: [page.locator('[data-testid="nft-price"]')]
    });
  });

  test('Analytics Dashboard snapshot', async ({ page }) => {
    await page.goto('/analytics-dashboard', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    // Mask time-sensitive chart data
    await expect(page).toHaveScreenshot('analytics-dashboard.png', { 
      maxDiffPixelRatio: 0.05,
      mask: [page.locator('canvas')]
    });
  });
});
