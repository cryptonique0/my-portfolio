# WCT DApp (WalletConnect demo)

This is a minimal React + Vite dapp that demonstrates integrating WalletConnect (v2) via Web3Modal and Wagmi.

Features:
- Connect/disconnect using WalletConnect v2 (Web3Modal)
- Display connected address
- Sign a message demo

Important: WalletConnect v2 requires a Project ID. Create one at https://cloud.walletconnect.com/ and set it in the environment.

Setup

1. Install dependencies:

```bash
cd dapp
npm install
```

2. Set your WalletConnect Project ID (example uses Vite env):

Create a file named `.env` in the `dapp/` folder with:

```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

3. Run the dev server:

```bash
npm run dev
```

Open the app (Vite will print the local URL). Click Connect to open the WalletConnect modal and choose a wallet.

Notes
- This scaffold targets Ethereum mainnet by default (wagmi `mainnet`). To change chains, edit `src/main.jsx`.
- The Web3Modal UI is provided by `Web3Modal` component in `src/main.jsx`.
