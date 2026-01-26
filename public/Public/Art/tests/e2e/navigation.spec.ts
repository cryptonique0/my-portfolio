import { test, expect } from '@playwright/test';

test.describe('User Flow Navigation', () => {
  test('Home page loads and header is visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Check header is visible by checking for navigation elements
    await expect(page.locator('header')).toBeVisible({ timeout: 15000 });
    // Verify nav link exists
    const discoverLink = page.getByText(/Discover/i);
    await expect(discoverLink.first()).toBeVisible({ timeout: 10000 });
  });

  test('Navigate to Discover page via header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Click on discover link
    const discoverLink = page.getByText(/Discover/i).first();
    await discoverLink.click();
    await expect(page).toHaveURL(/\/discover|\/marketplace/, { timeout: 15000 });
    // Check bulk action buttons appear
    await expect(page.getByText('Select All')).toBeVisible({ timeout: 10000 });
  });

  test('Open Analytics Dashboard route', async ({ page }) => {
    await page.goto('/analytics-dashboard', { waitUntil: 'networkidle' });
    // Wait for dashboard container to render
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });

  test('Visit NFT Detail route skeleton renders', async ({ page }) => {
    await page.goto('/nft/1', { waitUntil: 'networkidle' });
    // Check main content area renders
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });
});
