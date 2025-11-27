# Branches & PRs — ready-to-create

These are the ready commands to create three small branches and commit the prepared changes. Run these locally from the repository root.

1) Branch for demo GIF placeholder and README mention

```bash
git checkout -b feat/demo-gif
# add the demo gif later to demo/demo.gif
git add demo/README.md
git commit -m "docs: add demo placeholder and instructions"
git push -u origin feat/demo-gif
```

PR description (copy into GitHub UI or gh CLI):

Title: docs: add demo GIF placeholder
Body: Adds `demo/README.md` and instructions for adding `demo/demo.gif`. This helps judges preview the dApp quickly.

---

2) Branch for quickstart docs

```bash
git checkout -b docs/quickstart
git add dapp/docs/quickstart.md
git commit -m "docs: add quickstart for dapp (deploy & demo)"
git push -u origin docs/quickstart
```

PR description:

Title: docs: add quickstart for local dev and deploy
Body: Adds a `dapp/docs/quickstart.md` with steps to run the frontend, deploy the Rewards contract, and run demo batch transactions.

---

3) Branch for Hardhat/demo code and CI

```bash
git checkout -b feat/hardhat-deploy
# commit the Hardhat files already prepared in the repo
git add dapp/contracts dapp/scripts dapp/abi dapp/hardhat.config.cjs .github/workflows/hardhat-deploy.yml dapp/package.json
git commit -m "feat: add Hardhat Rewards contract, deploy & batch scripts, CI workflow"
git push -u origin feat/hardhat-deploy
```

PR description:

Title: feat: add Hardhat rewards demo + deploy scripts
Body: Adds a simple `Rewards.sol` contract, deploy and batch tx scripts, a minimal ABI for the frontend, updates `dapp/package.json` with Hardhat devDeps, and a GitHub Action that compiles and can deploy/verify when repository secrets are configured. Also documents how to run the demo locally.

---

Feel free to run these commands to create branches and open PRs. If you'd like, I can prepare separate branch commits instead (create the branches and commit files here) but pushing requires your Git remote/auth.
