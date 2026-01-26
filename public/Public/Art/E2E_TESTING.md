# E2E Testing with Playwright

## Overview

This project uses **Playwright** for comprehensive end-to-end testing, providing automated browser testing, visual regression testing, and detailed test reports.

## Features

✅ **User Flow Testing** - Test critical user journeys (navigation, discovery, marketplace)
✅ **Automated Browser Testing** - Run tests across Chromium, Firefox, and WebKit simultaneously
✅ **Visual Regression Testing** - Capture and compare page screenshots to detect UI changes
✅ **Detailed Test Reports** - HTML reports with traces, videos, and screenshots for failures

## Setup

### 1. Install Dependencies

Playwright is already installed at the repo root:

```bash
npm install  # This installs @playwright/test
npx playwright install  # Browsers are pre-installed
```

### 2. Configuration

Configuration is in `playwright.config.ts` at the repo root:

```typescript
export default defineConfig({
  testDir: './tests/e2e',           // Location of test files
  baseURL: 'http://localhost:5173', // Frontend URL
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,     // Reuse existing dev server
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  reporter: [['list'], ['html']],   // List output + HTML report
});
```

## Running Tests

### Run All Tests

```bash
npm run e2e:test
```

This will:
- Start the dev server (if not running)
- Run tests across all three browsers
- Generate HTML report at `playwright-report/index.html`

### Run Specific Test File

```bash
npx playwright test tests/e2e/navigation.spec.ts
```

### Run Tests with Named Pattern

```bash
npx playwright test -g "Home page loads"
```

### Run in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Run Single Browser

```bash
npx playwright test --project=chromium
```

### Run with Debug Mode

```bash
npx playwright test --debug
```

Opens Playwright Inspector with step-through debugging.

## Viewing Results

### View HTML Report

```bash
npm run e2e:report
```

This opens the interactive HTML report showing:
- ✅ Passed/Failed test counts
- 📸 Screenshots of each step
- 🎬 Video recordings of failures
- 📍 Trace files for debugging
- ⏱️ Execution times

## Test Structure

Tests are organized in `tests/e2e/` directory:

```
tests/e2e/
├── navigation.spec.ts      # Navigation flow tests
└── visual.spec.ts          # Visual regression tests
```

### Navigation Tests (`navigation.spec.ts`)

Tests core user flows:
- ✅ Home page loads
- ✅ Header navigation works
- ✅ Routes load correctly
- ✅ UI elements render

**Run:**
```bash
npx playwright test navigation.spec.ts
```

### Visual Tests (`visual.spec.ts`)

Captures page screenshots and compares against baseline:
- 📸 Home page layout
- 📸 Discover page layout
- 📸 Analytics dashboard layout

**Initial Run (Creates Baseline):**
```bash
npx playwright test visual.spec.ts
```

Screenshots saved to: `tests/e2e/visual.spec.ts-snapshots/`

**Subsequent Runs (Compares):**
Playwright compares new screenshots against baseline. If pixel difference > threshold (1-3%), test fails.

**Update Baseline:**
```bash
npx playwright test visual.spec.ts --update-snapshots
```

## Key Testing Patterns

### Wait for Elements

```typescript
// Wait for element to be visible
await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();

// Wait for navigation
await expect(page).toHaveURL(/\/discover$/);

// Wait for network idle
await page.waitForLoadState('networkidle');
```

### Click and Type

```typescript
// Click button
await page.getByRole('button', { name: 'Discover' }).click();

// Type in input
await page.getByPlaceholder('Search...').fill('NFT');
```

### Assertions

```typescript
// Check visibility
await expect(page.locator('.header')).toBeVisible();

// Check URL
await expect(page).toHaveURL('/discover');

// Check text content
await expect(page.getByRole('heading')).toContainText('Discover NFTs');

// Check attribute
await expect(page.getByRole('button')).toHaveAttribute('disabled');

// Check count
await expect(page.locator('.nft-card')).toHaveCount(12);
```

### Screenshots

```typescript
// Full page screenshot
await expect(page).toHaveScreenshot('home-page.png');

// Element screenshot
await expect(page.locator('.header')).toHaveScreenshot('header.png');

// Custom comparison settings
await expect(page).toHaveScreenshot('analytics.png', {
  maxDiffPixelRatio: 0.03,  // Allow 3% difference
  mask: [page.locator('.timestamp')] // Ignore timestamps
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run e2e:test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Failed Tests

### 1. View HTML Report

```bash
npm run e2e:report
```

Click on failed test to see:
- Step-by-step screenshots
- Video of test execution
- Network logs
- Console logs

### 2. Run in Debug Mode

```bash
npx playwright test --debug
```

This opens the Playwright Inspector where you can:
- Step through test line-by-line
- Inspect elements
- See DOM state at each step
- Hover over elements to highlight

### 3. Check Console Logs

Add to test:
```typescript
page.on('console', msg => console.log(msg.text()));
```

### 4. Common Issues

| Issue | Solution |
|-------|----------|
| Element not found | Check selector with `page.locator()` in DevTools |
| Timeout waiting for element | Increase timeout: `page.goto(..., { timeout: 30000 })` |
| Screenshot mismatch | Update snapshots: `npx playwright test --update-snapshots` |
| Server not starting | Check port 5173 is free, or set `reuseExistingServer: false` |

## Test Data

Tests use the live frontend with real API calls. For isolated testing with mocks, see [Playwright API Mocking](https://playwright.dev/docs/api-testing).

### Mock API Response Example

```typescript
await page.route('**/api/nfts/**', route => {
  route.abort();
  // Or mock response
  // route.continue({ response: ... });
});
```

## Performance Profiling

### Trace Recording

Playwright automatically records traces on failure. To view:

```bash
npx playwright show-trace playwright-report/traces/your-test.zip
```

Shows network requests, rendering timeline, and CPU usage.

### Lighthouse Integration

For performance testing, extend tests with Lighthouse:

```bash
npm install -D @playwright/test lighthouse
```

Then in test:
```typescript
import { playAudit } from 'playwright-lighthouse';

test('audit performance', async ({ page }) => {
  await playAudit({
    page,
    port: 9222,
    config: { extends: 'lighthouse:default' }
  });
});
```

## Test Coverage

Current tests cover:

| Area | Coverage | Status |
|------|----------|--------|
| Navigation | Home, Discover, Analytics, NFT Detail | ✅ |
| Visual Regression | Home, Discover, Analytics Dashboard | ✅ |
| User Flows | Route changes, page loads, header interactions | ✅ |
| Marketplace (Coming) | Search, filter, bulk operations | 🔜 |
| Authentication (Coming) | Login, wallet connect, disconnect | 🔜 |
| Transactions (Coming) | Offer creation, acceptance, purchases | 🔜 |

## Adding New Tests

### 1. Create Test File

```typescript
// tests/e2e/marketplace.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test('filter NFTs by price', async ({ page }) => {
    await page.goto('/discover');
    await page.getByLabel('Min Price').fill('100');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.nft-card')).toHaveCount(5);
  });
});
```

### 2. Run New Test

```bash
npx playwright test marketplace.spec.ts
```

### 3. Update Snapshots

```bash
npx playwright test visual.spec.ts --update-snapshots
```

## Performance Benchmark

Tests run in parallel across 3 browsers:

| Test Count | Total Time | Per-Browser |
|------------|-----------|-------------|
| 4 tests | ~45 seconds | ~45s each |
| 12 tests | ~90 seconds | ~90s each |

With `fullyParallel: false` in config to run sequentially:

```typescript
fullyParallel: false // Run one test at a time
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Support

For issues with Playwright:

1. Check the [Troubleshooting Guide](https://playwright.dev/docs/troubleshooting)
2. Run with `--debug` flag
3. Check `playwright-report/` for detailed failure info
4. Review browser console logs in HTML report

