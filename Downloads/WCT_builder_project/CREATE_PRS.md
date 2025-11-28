# Pull Request Creation Commands

Run these commands to create PRs for all the branches I've created:

## 1. Security Vulnerabilities Fix Plan
```bash
gh pr create --head fix/security-vulnerabilities --title "docs: add security vulnerabilities fix plan" --body "📋 Documents security issues and outlines fix strategy

- Documents 34 vulnerabilities needing attention
- Outlines migration from WalletConnect v1 to v2  
- Adds action items for dependency updates

Part of contest improvements." --base main
```

## 2. Add Project Badges
```bash
gh pr create --head feat/add-badges-readme --title "feat: add project badges to README" --body "✨ Adds professional badges to README

- MIT license badge
- Hardhat, Solidity, WalletConnect badges
- PRs Welcome badge

Improves project presentation and encourages contributions." --base main
```

## 3. Add MIT License
```bash
gh pr create --head docs/add-license --title "docs: add MIT license" --body "📄 Adds MIT License

- Enables open-source contributions
- Clarifies usage permissions
- Standard practice for open projects" --base main
```

## 4. Add Comprehensive .gitignore
```bash
gh pr create --head feat/add-gitignore --title "feat: add comprehensive .gitignore" --body "🔒 Adds comprehensive .gitignore

- Ignores node_modules and dependencies
- Ignores build artifacts and caches  
- Ignores environment variables and secrets
- Ignores IDE and OS-specific files
- Ignores Hardhat artifacts

Prevents accidental commits of sensitive files." --base main
```

## 5. Add Deployment Guide
```bash
gh pr create --head docs/improve-deployment-guide --title "docs: add comprehensive deployment guide" --body "📚 Comprehensive deployment documentation

- Step-by-step Sepolia deployment
- Faucet links and prerequisites
- Verification process
- Troubleshooting section
- CI/CD deployment notes
- Multi-network support

Makes it easy for contributors to deploy and test." --base main
```

## 6. Main feature branch (already created earlier)
```bash
gh pr create --head docs/add-contrib-templates --title "feat: Complete WalletConnect Builder Contest Setup" --body "🚀 Major update with Hardhat integration, demo features, and documentation

### Smart Contracts
- Rewards.sol ERC20 contract with mint/claim
- Hardhat config for Sepolia
- Deploy and verification scripts
- Comprehensive tests

### Frontend Features
- Social share component
- Interactive tutorial
- Network warning
- Gas estimator
- Improved TransactionDemo with claim/mint UI

### Documentation
- CONTRIBUTING.md with contributor guide
- ROADMAP.md with tasks
- TROUBLESHOOTING.md
- SECURITY.md policy
- PERFORMANCE.md optimization guide
- Issue templates

### CI/CD
- GitHub Action for deploy & verify
- Automated artifact uploads

Ready for contest judging!" --base main
```

---

## Or create them all via GitHub web UI:

Visit these URLs to create PRs manually:
1. https://github.com/cryptonique0/my-portfolio/pull/new/fix/security-vulnerabilities
2. https://github.com/cryptonique0/my-portfolio/pull/new/feat/add-badges-readme
3. https://github.com/cryptonique0/my-portfolio/pull/new/docs/add-license
4. https://github.com/cryptonique0/my-portfolio/pull/new/feat/add-gitignore
5. https://github.com/cryptonique0/my-portfolio/pull/new/docs/improve-deployment-guide
6. https://github.com/cryptonique0/my-portfolio/pull/new/docs/add-contrib-templates

Use the titles and descriptions above for each PR.
