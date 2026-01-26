# E2E Testing Quick Reference

## 🚀 Essential Commands

### Run Tests
```bash
# All tests
npm run e2e:test

# Specific file
npx playwright test navigation.spec.ts
npx playwright test smoke.spec.ts

# Match pattern
npx playwright test -g "Dark mode"
npx playwright test -g "loads"
```

### View Results
```bash
# Interactive HTML report
npm run e2e:report

# Verbose console output
npx playwright test --reporter=verbose

# Show test names only
npx playwright test --reporter=list
```

### Debug & Development
```bash
# Step-through debugger
npx playwright test --debug

# See browser while tests run
npx playwright test --headed

# Update visual snapshots
npx playwright test visual.spec.ts --update-snapshots

# Run one test
npx playwright test -g "Home page loads"
```

### Browser-Specific
```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit

# Specific test + browser
npx playwright test navigation.spec.ts --project=chromium
```

### Advanced
```bash
# Custom timeout (milliseconds)
npx playwright test --timeout 120000

# No retries (fail fast)
npx playwright test --retries 0

# Run tests in serial (not parallel)
npx playwright test --workers=1

# Disable parallelization
npx playwright test --forbid-only

# Show all tests without running
npx playwright test --list
```

---

## 📁 Test Suites

| File | Tests | Purpose |
|------|-------|---------|
| `navigation.spec.ts` | 4 | Route navigation, page loading |
| `visual.spec.ts` | 3 | Screenshot regression |
| `marketplace.spec.ts` | 10 | User workflows, interactions |
| `smoke.spec.ts` | 20 | Smoke, performance, a11y, errors |

---

## 📊 Test Coverage

### Navigation Tests (4)
```
✓ Home page loads and header is visible
✓ Navigate to Discover page via header
✓ Open Analytics Dashboard route
✓ Visit NFT Detail route skeleton renders
```

### Visual Regression Tests (3)
```
✓ Home page snapshot
✓ Discover page snapshot
✓ Analytics Dashboard snapshot
```

### Marketplace Tests (10)
```
✓ Load discover page and verify layout
✓ Search and filter NFTs
✓ Navigate home and check hero section
✓ Create button is visible in header
✓ Dark mode toggle works
✓ Analytics dashboard loads
✓ Collections page accessible
✓ Multiple page navigation flow
✓ NFT detail page loads
✓ Responsive menu works on mobile
```

### Smoke Tests (20)
```
SMOKE TESTS (7)
✓ Home page loads without crashing
✓ Marketplace page loads
✓ Analytics dashboard loads
✓ Collections page loads
✓ NFT detail page loads
✓ Admin dashboard loads
✓ Royalties dashboard loads

PERFORMANCE TESTS (3)
✓ Home page loads in reasonable time
✓ Analytics dashboard loads in reasonable time
✓ Discover page renders quickly

ACCESSIBILITY TESTS (5)
✓ Header has semantic HTML
✓ Main content in main element
✓ Buttons are keyboard accessible
✓ Colors have sufficient contrast
✓ All inputs are labeled

ERROR HANDLING TESTS (5)
✓ 404 route doesn't crash app
✓ Invalid NFT ID doesn't crash
✓ Network errors handled gracefully
✓ Offline mode gracefully degrades
✓ Error recovery works
```

---

## 🎯 Common Test Patterns

### Wait for Element
```typescript
await expect(page.locator('button')).toBeVisible({ timeout: 10000 });
```

### Click Element
```typescript
await page.getByText('Discover').click();
```

### Type in Input
```typescript
await page.getByPlaceholder('Search...').fill('NFT');
```

### Check URL
```typescript
await expect(page).toHaveURL(/\/discover/);
```

### Check Text
```typescript
await expect(page.getByRole('heading')).toContainText('Discover');
```

### Take Screenshot
```typescript
await expect(page).toHaveScreenshot('home.png');
```

### Count Elements
```typescript
const count = await page.locator('.nft-card').count();
expect(count).toBeGreaterThan(0);
```

### Listen for Errors
```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
```

---

## 🔧 Configuration

**File: `playwright.config.ts`**

Key settings:
- **baseURL**: `http://localhost:5173` - Frontend URL
- **webServer**: Auto-starts dev server
- **timeout**: 60 seconds per test
- **retries**: 0 (clean runs)
- **workers**: Sequential execution
- **reporters**: List + HTML report
- **trace**: On first retry
- **video**: On failure only
- **screenshot**: On failure only

---

## 📈 Report Features

HTML Report (`playwright-report/`) includes:

- ✅ Test status (pass/fail)
- 📊 Stats and timing
- 📸 Screenshots of each step
- 🎬 Video of test execution
- 📍 Trace files (network, timing, DOM)
- 📝 Console logs and errors
- 💥 Error messages and stack traces

---

## 🐛 Troubleshooting

### Tests timeout
```bash
npx playwright test --timeout 120000  # 120 seconds
```

### Can't find element
```bash
# Debug the selector
npx playwright test --debug

# Check current DOM in inspector
await page.pause()  # Pauses execution
```

### Visual snapshots different
```bash
# Update baseline
npx playwright test visual.spec.ts --update-snapshots
```

### Server not starting
- Check port 5173 is free
- Kill existing process: `lsof -ti:5173 | xargs kill -9`
- Or set `reuseExistingServer: false` in config

### Flaky tests
- Add waits: `await page.waitForTimeout(500)`
- Use `waitForLoadState()`: `await page.waitForLoadState('networkidle')`
- Increase timeout for that test

---

## 💡 Pro Tips

1. **Use `--headed` during development**
   ```bash
   npx playwright test marketplace.spec.ts --headed
   ```
   See the browser while tests run.

2. **Debug single test**
   ```bash
   npx playwright test -g "Dark mode" --debug
   ```
   Step through just that test.

3. **Update snapshots in batch**
   ```bash
   npx playwright test visual.spec.ts --update-snapshots
   ```
   After intentional UI changes.

4. **Run without parallel workers**
   ```bash
   npx playwright test --workers=1
   ```
   For more predictable debugging.

5. **Show all available tests**
   ```bash
   npx playwright test --list
   ```
   See test names and files.

6. **Run tests matching multiple patterns**
   ```bash
   npx playwright test -g "loads|loads|snapshot"
   ```
   Multiple -g flags work as OR.

---

## 📋 Checklist for CI/CD

- [ ] Tests pass locally: `npm run e2e:test`
- [ ] Report generated: Check `playwright-report/`
- [ ] Snapshots committed: `.spec.ts-snapshots/` directory
- [ ] GitHub Actions configured: `.github/workflows/e2e.yml`
- [ ] Artifact upload enabled: Store reports 30 days
- [ ] Timeout set appropriately: 60-120 seconds per test
- [ ] Error logging enabled: Capture console and network errors

---

## 🚀 Getting Started (3 steps)

1. **Run tests**
   ```bash
   npm run e2e:test
   ```

2. **View results**
   ```bash
   npm run e2e:report
   ```

3. **Debug failures**
   ```bash
   npx playwright test --debug
   ```

---

**Happy testing! 🎉**

