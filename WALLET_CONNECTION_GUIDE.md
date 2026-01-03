# Advanced Wallet Connection System

Complete implementation of advanced wallet connection handling with Base network detection, automatic switching, session persistence, and error handling.

## 🎯 Features Implemented

### ✅ Base Network Detection
- Automatic detection of Base Mainnet (Chain ID: 8453)
- Automatic detection of Base Sepolia testnet (Chain ID: 84532)
- Real-time network monitoring and change detection
- Helper utilities for network validation

### ✅ Automatic Network Switching
- Prompts user to switch to Base network when connected to wrong chain
- Retry logic with maximum 3 attempts
- Smart delay (1 second) before showing switch prompt
- Resets attempts on successful switch or manual network change

### ✅ Graceful Error Handling
- User rejection detection (error code 4001)
- Missing network detection (error code 4902)
- RPC and connection errors
- Helpful error messages with actionable instructions
- Auto-dismissing error notifications
- Manual error clearing

### ✅ Session Persistence
- Wallet connection persists across page refresh
- Automatic reconnection on app load
- Stores last connected address and connector
- Tracks auto-connection vs manual connection
- Network preference storage

### ✅ Global Provider
- Comprehensive `WalletContext` with all wallet state
- Easy-to-use hooks for components
- Real-time state updates
- Type-safe interfaces

---

## 📦 Files Created/Modified

### New Files
1. **`src/hooks/useWalletSession.ts`** (220 lines)
   - `useWalletSession()` - Main session hook
   - `useNeedsBaseSwitch()` - Check if network switch needed
   - `useNetworkStatus()` - Get network status
   - `useWalletPersistence()` - Monitor persistence

2. **`src/components/NetworkStatusBanner.tsx`** (230 lines)
   - Persistent network status banner
   - Auto-switch prompt UI
   - Example component with session display

### Modified Files
1. **`src/contexts/WalletContext.tsx`**
   - Enhanced `switchToBase()` with retry logic
   - Network change detection
   - Better error handling
   - Session tracking improvements

2. **`src/lib/wallet.ts`**
   - Added `detectBaseNetwork()` function
   - Added `getRecommendedBaseNetwork()` function
   - Enhanced Base network detection

---

## 🚀 Quick Start

### 1. Basic Usage - Wallet Connection

```tsx
'use client';

import { useWalletSession } from '@/hooks/useWalletSession';

export function MyComponent() {
  const { session, actions } = useWalletSession();

  return (
    <div>
      {session.isConnected ? (
        <div>
          <p>Connected: {session.shortAddress}</p>
          <p>Network: {session.chainName}</p>
          <button onClick={actions.disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={actions.connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### 2. Network Status Check

```tsx
import { useNetworkStatus } from '@/hooks/useWalletSession';

export function NetworkCheck() {
  const network = useNetworkStatus();

  if (network.needsSwitch) {
    return (
      <div className="alert alert-warning">
        ⚠️ Wrong network! Connected to {network.chainName}
      </div>
    );
  }

  return <div>✅ Connected to Base</div>;
}
```

### 3. Auto-Switch to Base

```tsx
import { useWalletSession } from '@/hooks/useWalletSession';

export function BaseRequiredComponent() {
  const { session, actions } = useWalletSession();

  useEffect(() => {
    if (session.isConnected && !session.isBaseNetwork) {
      // Automatically prompt switch
      actions.switchToBase();
    }
  }, [session.isConnected, session.isBaseNetwork]);

  if (!session.isConnected) {
    return <button onClick={actions.connect}>Connect Wallet</button>;
  }

  if (!session.isBaseNetwork) {
    return (
      <div>
        <p>Please switch to Base network</p>
        <button onClick={actions.switchToBase}>Switch Now</button>
      </div>
    );
  }

  return <div>Ready to use on Base!</div>;
}
```

### 4. Add Network Status Banner (Recommended)

```tsx
// In your layout.tsx or app.tsx
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          <NetworkStatusBanner />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

---

## 📚 API Reference

### `useWalletSession()`

Returns wallet session state and actions.

#### Session State

```typescript
interface WalletSession {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  hasWallet: boolean;
  
  // Account info
  address?: string;
  shortAddress?: string;  // Formatted: 0x1234...5678
  
  // Network info
  chainId?: number;
  chainName?: string;
  isBaseNetwork: boolean;
  networkType?: 'mainnet' | 'testnet' | null;
  
  // Session persistence
  isSessionRestored: boolean;
  wasAutoConnected: boolean;
  
  // Error state
  error?: string;
  hasError: boolean;
}
```

#### Actions

```typescript
interface WalletSessionActions {
  connect: () => Promise<void>;           // Connect wallet
  disconnect: () => void;                  // Disconnect and clear session
  switchToBase: () => Promise<boolean>;   // Switch to Base network
  clearError: () => void;                  // Clear error state
  refreshSession: () => Promise<void>;    // Attempt reconnection
}
```

### `useNetworkStatus()`

Get current network status.

```typescript
const { 
  isCorrect,      // true if on Base
  needsSwitch,    // true if connected but not Base
  chainId,        // Current chain ID
  chainName,      // Current chain name
  isBase          // true if on Base
} = useNetworkStatus();
```

### `useNeedsBaseSwitch()`

Simple check if user needs to switch networks.

```typescript
const needsSwitch = useNeedsBaseSwitch();
// Returns: true if connected but not on Base
```

### `detectBaseNetwork(chainId)`

Detect Base network and get details.

```typescript
import { detectBaseNetwork } from '@/lib/wallet';

const network = detectBaseNetwork(8453);
// Returns:
// {
//   isBase: true,
//   network: 'mainnet',
//   name: 'Base Mainnet',
//   chainId: 8453
// }
```

---

## 🎨 UI Components

### NetworkStatusBanner

Persistent banner that shows network status and prompts for switching.

**Features:**
- Auto-shows when wrong network detected
- One-click switching
- Auto-dismisses on correct network
- Manual dismiss option
- Error display

**Usage:**
```tsx
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';

// Add to your layout
<NetworkStatusBanner />
```

### WalletSessionExample

Complete example component showing all session features.

```tsx
import { WalletSessionExample } from '@/components/NetworkStatusBanner';

<WalletSessionExample />
```

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_USE_TESTNET=false  # false = Base Mainnet, true = Base Sepolia
```

### Session Storage Keys

The system uses localStorage with these keys:
- `wallet_connected` - Connection state
- `wallet_connector_id` - Last used connector
- `wallet_last_address` - Last connected address
- `wallet_auto_connected` - Auto-reconnection flag
- `preferred_chain_id` - Preferred chain after switch

---

## 🛠️ Error Handling

### Error Types

1. **User Rejection (Code 4001)**
   - User declined network switch
   - Sets switch attempts to max (no auto-retry)
   - Shows user-friendly message

2. **Network Not Found (Code 4902)**
   - Base network not in wallet
   - Provides manual addition instructions
   - Shows RPC URL and chain details

3. **RPC Errors**
   - Connection issues
   - Prompts to check internet
   - Allows retry

4. **Generic Errors**
   - Shows error message
   - Allows manual retry
   - Max 3 attempts

### Error Display

```tsx
const { session, actions } = useWalletSession();

if (session.hasError) {
  return (
    <div className="error">
      <p>{session.error}</p>
      <button onClick={actions.clearError}>Clear</button>
      <button onClick={actions.switchToBase}>Retry</button>
    </div>
  );
}
```

---

## 🔄 Session Persistence

### How It Works

1. **On Connect:**
   - Stores `wallet_connected = true`
   - Stores connector ID
   - Stores wallet address

2. **On Page Load:**
   - Checks localStorage
   - Attempts auto-reconnection
   - Restores last session state

3. **On Disconnect:**
   - Clears all storage
   - Resets state
   - Stops auto-reconnection

### Manual Session Management

```tsx
const { session, actions } = useWalletSession();

// Check if session was restored
if (session.isSessionRestored) {
  console.log('Session restored from previous visit');
}

// Check if auto-connected
if (session.wasAutoConnected) {
  console.log('Automatically reconnected');
}

// Manually refresh session
await actions.refreshSession();
```

---

## 🎯 Best Practices

### 1. Always Use Hooks

```tsx
// ✅ Good
const { session, actions } = useWalletSession();

// ❌ Bad - Don't use wagmi hooks directly
const { address } = useAccount();
```

### 2. Check Network Before Transactions

```tsx
const { session, actions } = useWalletSession();

async function handleTransaction() {
  // Check network first
  if (!session.isBaseNetwork) {
    const switched = await actions.switchToBase();
    if (!switched) {
      return; // User rejected
    }
  }
  
  // Proceed with transaction
  await contract.write();
}
```

### 3. Handle Errors Gracefully

```tsx
if (session.hasError) {
  // Show error UI
  return <ErrorDisplay error={session.error} onClear={actions.clearError} />;
}
```

### 4. Provide Network Context

```tsx
// Show network badge
<div className="network-badge">
  {session.chainName}
  {!session.isBaseNetwork && ' ⚠️'}
</div>
```

---

## 📊 Testing

### Test Connection Flow

1. Connect wallet
2. Switch to different network (e.g., Ethereum)
3. Should auto-prompt to switch to Base
4. Refresh page
5. Should auto-reconnect and restore state

### Test Error Scenarios

1. **User Rejection:**
   - Reject network switch prompt
   - Should show error message
   - Should not auto-retry

2. **Network Not Found:**
   - Remove Base network from wallet
   - Try to switch
   - Should show manual instructions

3. **Connection Loss:**
   - Disconnect internet
   - Try to switch
   - Should show connection error

---

## 🔍 Debugging

### Enable Console Logs

The system includes helpful console logs:

```
✅ Successfully switched to Base Mainnet
⚠️ User rejected network switch
🔄 Attempting to reconnect wallet...
🔗 Wallet Connected: { address: "0x1234...5678", chain: "Base" }
🔀 Network changed: 1 → 8453
```

### Check Session State

```tsx
const { session } = useWalletSession();
console.log('Session:', session);
```

### Monitor Network Changes

```tsx
import { useWalletPersistence } from '@/hooks/useWalletSession';

// Logs connection state changes
useWalletPersistence();
```

---

## 🚨 Common Issues

### Issue: Auto-reconnect not working

**Solution:** Check localStorage in DevTools:
- Should have `wallet_connected = "true"`
- Should have `wallet_connector_id`
- Clear and try again

### Issue: Network switch not prompting

**Solution:**
- Check if on Base already (`session.isBaseNetwork`)
- Check for existing errors (`session.error`)
- Check switch attempts (max 3)

### Issue: Session lost on refresh

**Solution:**
- Ensure `Web3Provider` wraps entire app
- Check localStorage is enabled
- Verify `WalletProvider` is in component tree

---

## 📈 Advanced Usage

### Custom Network Switch Logic

```tsx
const { session, actions } = useWalletSession();

// Only prompt on specific pages
useEffect(() => {
  if (requiresBase && !session.isBaseNetwork) {
    actions.switchToBase();
  }
}, [requiresBase, session.isBaseNetwork]);
```

### Network-Specific Features

```tsx
if (session.networkType === 'testnet') {
  // Show testnet badge
  return <TestnetBadge />;
}

if (session.networkType === 'mainnet') {
  // Production features
  return <ProductionFeatures />;
}
```

### Multi-Chain Support

```tsx
const supportedChains = [8453, 84532]; // Base Mainnet & Sepolia

if (session.chainId && !supportedChains.includes(session.chainId)) {
  return <UnsupportedChainWarning />;
}
```

---

## ✅ Checklist

- [x] Base network detection
- [x] Automatic network switching
- [x] Graceful error handling
- [x] Session persistence across refresh
- [x] Global wallet & chain provider
- [x] User rejection handling
- [x] Network change detection
- [x] Retry logic (max 3 attempts)
- [x] Helper hooks and utilities
- [x] UI components
- [x] TypeScript types
- [x] Comprehensive documentation

---

## 🔗 Related Files

- [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) - Core wallet context
- [`src/hooks/useWalletSession.ts`](src/hooks/useWalletSession.ts) - Session hook
- [`src/lib/wallet.ts`](src/lib/wallet.ts) - Wallet utilities
- [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx) - Connect button
- [`src/components/NetworkStatusBanner.tsx`](src/components/NetworkStatusBanner.tsx) - Network banner
- [`src/providers/Web3Provider.tsx`](src/providers/Web3Provider.tsx) - Web3 setup

---

## 📝 Next Steps

1. Add `<NetworkStatusBanner />` to your layout
2. Replace existing wallet hooks with `useWalletSession()`
3. Test connection flow with network switching
4. Customize error messages for your brand
5. Add analytics for network switch success/failure rates

---

## 🎉 Summary

Your application now has enterprise-grade wallet connection handling with:

- ✅ Seamless Base network detection and switching
- ✅ Persistent sessions across page refreshes
- ✅ Graceful error handling with retry logic
- ✅ User-friendly notifications and prompts
- ✅ Type-safe hooks and utilities
- ✅ Production-ready components

All wallet and network state is now available globally through the provider system!
