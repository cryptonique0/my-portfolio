# Frontend Setup Guide

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- A code editor (VS Code recommended)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Get WalletConnect Project ID from https://cloud.walletconnect.com and add to `.env.local`

## Development Server

Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Building for Production

Build the project:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── WalletConnect.vue      # Wallet connection component
├── wallets/
│   ├── wallet-manager.ts      # Main wallet manager
│   └── walletconnect-manager.ts # WalletConnect integration
├── types/
│   └── window.d.ts            # Global type definitions
├── App.vue                     # Main app component
└── main.ts                     # Entry point
```

## Vue 3 + TypeScript Setup

The project uses Vue 3 with TypeScript for type-safe development:

```typescript
// Use setup syntax
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>
```

## Wallet Integration

### Using Wallet Manager

```typescript
import { walletManager } from '@/wallets/wallet-manager';

// Connect wallet
await walletManager.connectWallet('xverse');

// Get wallet info
const info = walletManager.getWalletInfo();

// Disconnect
await walletManager.disconnectWallet();
```

### Displaying Wallet Component

```vue
<template>
  <WalletConnect />
</template>

<script setup lang="ts">
import WalletConnect from '@/components/WalletConnect.vue';
</script>
```

## Environment Variables

Create `.env.local` with:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_STACKS_NETWORK=testnet
VITE_APP_URL=http://localhost:3000
```

## Common Tasks

### Change Network

```typescript
// Switch to mainnet
walletManager.setNetwork(true);

// Switch to testnet
walletManager.setNetwork(false);
```

### Handle Wallet Connection

```typescript
try {
  await walletManager.connectWallet('xverse');
  console.log('Connected:', walletManager.getWalletInfo().value.address);
} catch (error) {
  console.error('Connection failed:', error);
}
```

### Format Address Display

```typescript
const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
```

## Deployment

### Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables
6. Deploy

### Traditional Hosting

1. Build project: `npm run build`
2. Copy `dist` folder to server
3. Configure web server to serve `index.html` for all routes
4. Set environment variables on server

## Troubleshooting

### Port Already in Use

Change port in `vite.config.ts`:
```typescript
server: {
  port: 3001,
}
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Wallet Extension Not Detected

1. Ensure extension is installed
2. Check if extension is enabled
3. Reload page
4. Clear browser cache

## Development Tips

- Use Vue DevTools browser extension for debugging
- Check browser console for error messages
- Use TypeScript strict mode for better type checking
- Test on testnet before mainnet deployment

## Additional Resources

- [Vue 3 Documentation](https://vuejs.org)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Stacks Documentation](https://docs.stacks.co)
