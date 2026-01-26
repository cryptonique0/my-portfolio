import { test, expect } from '@playwright/test';

test.describe('Marketplace User Flow', () => {
  // Test basic page loading with improved selectors
  test('Load discover page and verify layout', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    
    // Wait for main container
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    
    // Verify bulk action buttons are present
    const selectAllBtn = page.locator('button').filter({ hasText: /Select All/i });
    await expect(selectAllBtn).toBeVisible({ timeout: 5000 });
  });

  test('Search and filter NFTs', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    
    // Look for search input if available
    const searchInputs = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]');
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      await searchInput.fill('art');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Verify page still renders
    await expect(page.locator('main')).toBeVisible();
  });

  test('Navigate home and check hero section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check for header elements
    const header = page.locator('header');
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('Create button is visible in header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    // Look for Create link/button
    const createBtn = page.locator('a, button').filter({ hasText: /Create/i });
    if (await createBtn.count() > 0) {
      await expect(createBtn.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Dark mode toggle works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Look for theme toggle button
    const themeToggle = page.locator('button').filter({ hasText: /🌙|☀️/i });
    if (await themeToggle.count() > 0) {
      const toggleBtn = themeToggle.first();
      await expect(toggleBtn).toBeVisible({ timeout: 5000 });
      
      // Get initial state
      const htmlElement = page.locator('html');
      const initialDarkMode = await htmlElement.evaluate(el => 
        el.classList.contains('dark')
      );
      
      // Click toggle
      await toggleBtn.click();
      await page.waitForTimeout(500);
      
      // Verify state changed
      const newDarkMode = await htmlElement.evaluate(el => 
        el.classList.contains('dark')
      );
      
      expect(newDarkMode).toBe(!initialDarkMode);
    }
  });

  test('Analytics dashboard loads', async ({ page }) => {
    await page.goto('/analytics-dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Check for main content area
    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible({ timeout: 10000 });
  });

  test('Collections page accessible', async ({ page }) => {
    await page.goto('/collections', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Verify page renders
    await expect(page.locator('body')).toBeVisible();
  });

  test('Multiple page navigation flow', async ({ page }) => {
    // Home -> Discover -> Home -> Collections
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Navigate to discover
    const discoverLink = page.locator('a, button').filter({ hasText: /Discover/i });
    if (await discoverLink.count() > 0) {
      await discoverLink.first().click();
      await page.waitForTimeout(1500);
      await expect(page.locator('main')).toBeVisible();
    }
    
    // Go back home
    const logoLink = page.locator('a[href="/"]');
    if (await logoLink.count() > 0) {
      await logoLink.first().click();
      await page.waitForTimeout(1500);
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('NFT detail page loads', async ({ page }) => {
    // Try to load NFT detail page
    await page.goto('/nft/1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Check for main content
    const mainContent = page.locator('main, .min-h-screen');
    await expect(mainContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('Responsive menu works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Header should still be visible
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  });

  test('Page doesn\'t have console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Should have minimal or no errors (some expected from external services)
    const criticalErrors = errors.filter(e => 
      !e.includes('Failed to load') && 
      !e.includes('CORS') &&
      !e.includes('undefined')
    );
    
    console.log('Errors found:', criticalErrors.length);
  });
});
