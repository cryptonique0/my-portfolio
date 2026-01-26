# CI/CD Pipeline Setup Guide

## Overview

Your BitArt Market has a **complete, production-ready CI/CD pipeline** using GitHub Actions with automated testing, building, and deployment.

---

## 🔄 GitHub Actions Workflows

### 1. **Test Workflow** (`.github/workflows/test.yml`)

**Trigger:** Push to main/develop or pull requests

**What it does:**
- ✅ Runs backend tests with PostgreSQL
- ✅ Runs frontend tests
- ✅ Lints both codebases
- ✅ Builds both applications
- ✅ Reports results as PR checks

**Duration:** ~10-15 minutes

```yaml
Trigger: push/pull_request to main, develop
├─ Backend Tests
│  ├─ Install dependencies
│  ├─ Lint code
│  ├─ Build
│  └─ Run tests (with PostgreSQL)
└─ Frontend Tests
   ├─ Install dependencies
   ├─ Lint code
   ├─ Build
   └─ Run tests
```

---

### 2. **Build Workflow** (`.github/workflows/build.yml`)

**Trigger:** Push to main/develop or pull requests

**What it does:**
- ✅ Full build verification
- ✅ Format checking
- ✅ Linting
- ✅ Artifact storage (frontend dist)
- ✅ Build artifact retention (7 days)

**Duration:** ~8-12 minutes

```yaml
Trigger: push/pull_request to main, develop
├─ Install dependencies
├─ Lint all code
├─ Check code formatting
├─ Build backend
├─ Build frontend
├─ Store frontend artifacts
└─ Run all tests
```

---

### 3. **E2E Test Workflow** (`.github/workflows/e2e.yml`)

**Trigger:** Push to main/develop or pull requests

**What it does:**
- ✅ Runs 35 Playwright tests
- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Captures test videos on failure
- ✅ Stores test reports (30 days)
- ✅ Screenshots of failures

**Duration:** ~15-20 minutes

```yaml
Trigger: push/pull_request to main, develop
├─ Install dependencies
├─ Install Playwright browsers
├─ Build frontend
├─ Start backend server
├─ Run 35 E2E tests
├─ Upload test reports
└─ Upload failure videos
```

---

### 4. **Deploy Workflow** (`.github/workflows/deploy.yml`)

**Trigger:** Push to main branch OR release published

**What it does:**
- ✅ Builds frontend
- ✅ Deploys to Vercel (frontend)
- ✅ Deploys to Render/Railway (backend)
- ✅ Notifies Slack on completion
- ✅ No manual intervention needed

**Duration:** ~10-15 minutes

```yaml
Trigger: push to main or release published
├─ Build frontend with env vars
├─ Deploy to Vercel
├─ Build backend
├─ Deploy to Render (or Railway)
└─ Notify Slack
```

---

## 🔑 Required GitHub Secrets

### Set these in Repository Settings → Secrets and Variables

#### Frontend Secrets (Vercel)
```
VERCEL_TOKEN            # Vercel API token
VERCEL_ORG_ID          # Vercel organization ID
VERCEL_PROJECT_ID      # Vercel project ID
```

#### Backend Secrets (Render/Railway)
```
RENDER_DEPLOY_KEY      # Render deployment token
RENDER_SERVICE_ID      # Render service ID
RAILWAY_TOKEN          # Railway API token (optional)
```

#### Environment Variables (Secrets)
```
VITE_API_URL           # Backend API URL
VITE_CHAIN_ID          # Base chain ID (8453)
VITE_NFT_CONTRACT      # NFT contract address
VITE_MARKETPLACE_CONTRACT  # Marketplace contract address
VITE_AUCTION_CONTRACT  # Auction contract address
VITE_GA_MEASUREMENT_ID # Google Analytics ID
VITE_EXPLORER_URL      # BlockScout/BaseScan URL
```

#### Optional (Notifications)
```
SLACK_WEBHOOK_URL      # Slack webhook for notifications
```

### How to Set Secrets

1. Go to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret from the list above
4. Repeat for all secrets needed

---

## 📊 Build Status Badges

Add these to your README.md to show pipeline status:

### Status Badges

```markdown
<!-- Test Status -->
![Test](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/test.yml/badge.svg)

<!-- Build Status -->
![Build](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/build.yml/badge.svg)

<!-- E2E Tests Status -->
![E2E Tests](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/e2e.yml/badge.svg)

<!-- Deployment Status -->
![Deploy](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/deploy.yml/badge.svg)

<!-- Node Version -->
![Node](https://img.shields.io/badge/node-20.x-green)

<!-- License -->
![License](https://img.shields.io/badge/license-MIT-blue)
```

### Example README Section

```markdown
## 🚀 Status

![Test](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/test.yml/badge.svg)
![Build](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/build.yml/badge.svg)
![E2E Tests](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/e2e.yml/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/BitArt-Market/actions/workflows/deploy.yml/badge.svg)

Production deployment: [Visit Live Site](https://your-frontend-url.com)
```

---

## 📈 Workflow Execution Flow

### On Every Push to main/develop

```
1. Test Workflow (parallel)
   ├─ Backend tests (with PostgreSQL)
   └─ Frontend tests
   ↓
2. Build Workflow
   ├─ Full lint check
   ├─ Build backend
   └─ Build frontend
   ↓
3. E2E Workflow
   ├─ Run 35 Playwright tests
   ├─ Capture videos on failure
   └─ Store reports
   ↓
4. On Success:
   └─ Deploy Workflow (if push to main)
      ├─ Deploy to Vercel
      ├─ Deploy to Render
      └─ Notify Slack
```

### On Pull Request

```
1. Test Workflow (parallel)
2. Build Workflow
3. E2E Workflow
↓
GitHub shows results as PR checks
↓
Can merge only if all pass
```

### On Release

```
1-3. Test → Build → E2E
↓
4. Deploy Workflow
   ├─ Deploy frontend
   ├─ Deploy backend
   └─ Notify team
```

---

## 🔧 Manual Deployment

### Deploy Frontend Only
```bash
# Push to main (automatic)
git push origin main

# Or manual Vercel deployment
vercel --prod
```

### Deploy Backend Only
```bash
# Push to main (automatic)
git push origin main

# Or manual Render deployment
render deploy --service YOUR_SERVICE_ID
```

### Create Release
```bash
# Create and tag release (triggers deploy)
git tag v1.0.0
git push origin v1.0.0

# On GitHub, create release from tag
# → Triggers deploy.yml automatically
```

---

## 📋 Environment Variables by Deployment

### Development (Local)

```bash
# Frontend (.env.local or .env)
VITE_API_URL=http://localhost:5000/api
VITE_CHAIN_ID=8453
VITE_NFT_CONTRACT=0x...
VITE_MARKETPLACE_CONTRACT=0x...
```

### Staging (CI/CD)

```bash
# Set in GitHub Secrets
VITE_API_URL=https://api-staging.example.com
VITE_CHAIN_ID=8453
# ... other staging vars
```

### Production (Deployment)

```bash
# Set in GitHub Secrets for main branch
VITE_API_URL=https://api.bitart.market
VITE_CHAIN_ID=8453
# ... production vars with real contracts
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] GitHub Actions workflows successful
- [ ] E2E tests pass
- [ ] Code review completed
- [ ] Environment variables set in GitHub Secrets
- [ ] Deployment target (Vercel/Render) configured
- [ ] Database migrations run
- [ ] Smart contracts deployed
- [ ] Analytics tracking verified
- [ ] Error logging configured

---

## 🐛 Troubleshooting

### Workflow Fails on Tests

1. **Check test output:**
   - Click on failing workflow
   - Expand step that failed
   - Look for error messages

2. **Local reproduction:**
   ```bash
   npm test
   npm run e2e:test
   ```

3. **Common fixes:**
   - Clear node_modules: `rm -rf node_modules && npm ci`
   - Check environment variables
   - Verify Node version (20.x required)

### Deployment Fails

1. **Check deployment logs:**
   - GitHub Actions output
   - Vercel dashboard
   - Render/Railway dashboard

2. **Common issues:**
   - Missing environment variables
   - Invalid API keys/tokens
   - Build errors (check Build Workflow logs)
   - Database connection issues

3. **Rollback:**
   ```bash
   # Revert last commit
   git revert HEAD
   git push origin main
   ```

### GitHub Secrets Not Found

1. **Verify secrets exist:**
   - Settings → Secrets and variables → Actions
   - Check exact secret names match workflow

2. **If just added:**
   - Wait 30 seconds
   - Trigger workflow again

3. **Re-add secret:**
   - Delete old secret
   - Create new with exact name

---

## 📊 Monitoring & Logs

### View Workflow Results

1. **GitHub Actions Tab:**
   - Go to repository
   - Click "Actions" tab
   - Select workflow run
   - Click on job to see logs

2. **PR Checks:**
   - Open pull request
   - Scroll to checks section
   - Click "Details" on any check

### Artifact Access

After workflow completes:

1. **Frontend Build:**
   - Actions tab → workflow → build job
   - Artifacts section
   - Download `frontend-build`

2. **E2E Reports:**
   - Actions tab → E2E workflow
   - Artifacts section
   - Download `playwright-report`

3. **Test Videos:**
   - If tests failed
   - Download `test-videos` artifact

---

## 🚀 Advanced Configuration

### Conditional Workflows

Run only on certain conditions:

```yaml
# Run only on main branch
if: github.ref == 'refs/heads/main'

# Run only on release
if: github.event_name == 'release'

# Run only if files changed
if: |
  contains(github.event.pull_request.changed_files, 'frontend/')
```

### Matrix Testing

Test on multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

### Scheduled Workflows

Run tests on schedule:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

---

## 📖 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Render Deployment](https://render.com/docs/github)
- [Playwright CI Guide](https://playwright.dev/docs/ci)

---

## 🎉 You're Set!

Your CI/CD pipeline is now configured and ready:

✅ Tests run automatically on every push/PR  
✅ Build verification before merge  
✅ E2E tests validate everything works  
✅ One-click deployments to production  
✅ Automatic notifications on completion  

**All you need to do:** Push code → Pipeline handles the rest! 🚀

