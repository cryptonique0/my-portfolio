# Quickstart — dapp

This file explains how to run the dapp locally and how to run demo deploys.

Local frontend

```bash
cd dapp
npm install
npm run dev
```

Build

```bash
npm run build
```

Deploying the Rewards contract (testnet)

1. Create a `.env` file in `dapp/`:

```
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your-etherscan-key
```

2. Install dev deps and run deploy:

```bash
npm ci
npx hardhat run scripts/deploy.js --network sepolia
```

3. After deploy the script writes the contract address to `dapp/.deploy_address`. Use that address with the demo batch script.

Batch demo transactions

The `scripts/batchTxs.js` script attempts `claim()` and `transfer()` calls for a list of private keys. Provide these env vars before running:

```bash
export RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
export CONTRACT_ADDRESS="0xDeployedAddress"
export PRIVATE_KEYS="0xpk1,0xpk2"
node scripts/batchTxs.js
```

Notes

- Use ephemeral test wallets funded from a faucet for demo automation.
- Do not commit private keys or API keys.
- Check contest rules before automating txs.
