# Advanced Wallet Connection System

Complete wallet connection handling with Base network detection, automatic switching, error handling, session persistence, and global state management.

## 🎯 Features

### ✅ Base Network Detection
- Automatically detects if user is on Base Mainnet (8453) or Base Sepolia (84532)
- Visual indicators showing network status
- Real-time chain monitoring

### ✅ Automatic Network Switching
- Prompts user to switch to Base after connection
- Seamless switching with one click
- Falls back to manual instructions if needed

### ✅ Graceful Error Handling
- User-friendly error messages for:
  - Rejected network switches
  - Missing network configurations
  - Connection failures
- Auto-dismissing error notifications
- Manual error clearing

### ✅ Session Persistence
- Maintains wallet connection across page refreshes
- Remembers last connected wallet
- Automatic reconnection on page load
- Secure localStorage-based session management

### ✅ Global State Provider
- Centralized wallet and chain state
- Type-safe context API
- Multiple convenience hooks
- Efficient re-render optimization

---

## 🚀 Quick Start

### 1. The WalletContext is already integrated into your app via `Web3Provider`

Your app layout already includes the provider:

```tsx
import { Web3Provider } from '@/providers/Web3Provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

### 2. Use the hooks in your components

```tsx
import { useWalletContext } from '@/contexts/WalletContext';

function MyComponent() {
  const { state, actions } = useWalletContext();

  return (
    <div>
      {state.isConnected ? (
        <p>Connected: {state.address}</p>
      ) : (
        <button onClick={() => actions.connect()}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

---

## 📚 API Reference

### Hooks

#### `useWalletContext()`
Returns the full wallet context with state and actions.

```tsx
const { state, actions } = useWalletContext();
```

#### `useWalletState()`
Returns only the wallet state (for read-only components).

```tsx
const state = useWalletState();
```

#### `useWalletActions()`
Returns only the wallet actions (for action-only components).

```tsx
const actions = useWalletActions();
```

---

### State Properties

```typescript
interface WalletState {
  // User's wallet address (0x...)
  address?: string;
  
  // Whether wallet is connected
  isConnected: boolean;
  
  // Whether a connection/switch operation is in progress
  isConnecting: boolean;
  
  // Current chain information
  chain?: {
    id: number;           // Chain ID (8453 for Base)
    name: string;         // Chain name (e.g., "Base")
    unsupported?: boolean; // If chain is not in config
  };
  
  // Whether connected to Base network
  isCorrectNetwork: boolean;
  
  // Current error message (if any)
  error?: string;
}
```

---

### Action Methods

```typescript
interface WalletActions {
  // Connect wallet (optionally specify connector ID)
  connect: (connectorId?: string) => Promise<void>;
  
  // Disconnect wallet and clear session
  disconnect: () => void;
  
  // Switch to Base network
  // Returns true if successful, false if rejected
  switchToBase: () => Promise<boolean>;
  
  // Clear current error message
  clearError: () => void;
  
  // Manually trigger reconnection
  reconnect: () => Promise<void>;
}
```

---

## 💡 Usage Examples

### Basic Connection Check

```tsx
function WalletStatus() {
  const { state } = useWalletContext();

  if (!state.isConnected) {
    return <p>Not connected</p>;
  }

  return (
    <div>
      <p>Address: {state.address}</p>
      <p>Network: {state.chain?.name}</p>
      <p>Correct Network: {state.isCorrectNetwork ? '✅' : '❌'}</p>
    </div>
  );
}
```

### Protected Component

```tsx
function ProtectedFeature() {
  const { state, actions } = useWalletContext();

  // Not connected
  if (!state.isConnected) {
    return (
      <div>
        <h2>Connect Required</h2>
        <button onClick={() => actions.connect()}>
          Connect Wallet
        </button>
      </div>
    );
  }

  // Wrong network
  if (!state.isCorrectNetwork) {
    return (
      <div>
        <h2>Wrong Network</h2>
        <p>Currently on: {state.chain?.name}</p>
        <button onClick={actions.switchToBase}>
          Switch to Base
        </button>
      </div>
    );
  }

  // All good!
  return <div>Your feature content here</div>;
}
```

### Error Handling

```tsx
function NetworkSwitcher() {
  const { state, actions } = useWalletContext();

  const handleSwitch = async () => {
    const success = await actions.switchToBase();
    
    if (success) {
      console.log('✅ Switched to Base');
      // Continue with your logic
    } else {
      console.log('❌ Switch failed:', state.error);
      // Handle error
    }
  };

  return (
    <div>
      {state.error && (
        <div className="error">
          {state.error}
          <button onClick={actions.clearError}>×</button>
        </div>
      )}
      
      <button onClick={handleSwitch}>
        Switch to Base
      </button>
    </div>
  );
}
```

### Conditional Rendering

```tsx
function DashboardPage() {
  const { state, actions } = useWalletContext();

  return (
    <div>
      {/* Loading State */}
      {state.isConnecting && <Spinner />}

      {/* Not Connected */}
      {!state.isConnected && !state.isConnecting && (
        <ConnectPrompt onConnect={actions.connect} />
      )}

      {/* Wrong Network */}
      {state.isConnected && !state.isCorrectNetwork && (
        <NetworkWarning onSwitch={actions.switchToBase} />
      )}

      {/* Connected & Correct Network */}
      {state.isConnected && state.isCorrectNetwork && (
        <DashboardContent address={state.address} />
      )}
    </div>
  );
}
```

### Using with useEffect

```tsx
function DataFetcher() {
  const { state } = useWalletContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (state.isConnected && state.isCorrectNetwork && state.address) {
      // Fetch user-specific data
      fetchUserData(state.address).then(setData);
    }
  }, [state.isConnected, state.isCorrectNetwork, state.address]);

  return <div>{/* Render data */}</div>;
}
```

---

## 🎨 Enhanced WalletConnectButton

The updated `WalletConnectButton` component includes:

- ✅ **Visual network status** - Green for Base, Amber for wrong network
- ✅ **One-click network switching** - Button appears when on wrong network
- ✅ **Error notifications** - Auto-dismissing with manual close option
- ✅ **Loading states** - Spinner animation during operations
- ✅ **Connector selection** - Modal to choose wallet provider
- ✅ **Smooth animations** - Using Framer Motion

```tsx
import { WalletConnectButton } from '@/components/WalletConnectButton';

function Header() {
  return (
    <header>
      <nav>
        <Logo />
        <WalletConnectButton />
      </nav>
    </header>
  );
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local

# Use testnet (Base Sepolia) instead of mainnet
NEXT_PUBLIC_USE_TESTNET=true

# WalletConnect Project ID (optional but recommended)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Supported Networks

The system automatically detects and works with:

- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia** (Chain ID: 84532)

Set `NEXT_PUBLIC_USE_TESTNET=true` to use Base Sepolia as the target network.

---

## 🔐 Session Storage

The wallet system persists the following data in `localStorage`:

| Key | Purpose |
|-----|---------|
| `wallet_connected` | Whether user was previously connected |
| `wallet_connector_id` | Last used wallet connector |
| `wallet_last_address` | Last connected address |
| `wallet_auto_connected` | Whether auto-reconnect was attempted |

**All data is cleared on manual disconnect.**

---

## 🚨 Error Messages

The system provides user-friendly error messages for common scenarios:

| Error Type | Message | Action |
|------------|---------|--------|
| Rejected Switch | "Network switch rejected. Please switch to Base network manually." | User can try again or switch manually in wallet |
| Missing Network | "Base network not found in wallet. Please add it manually." | User needs to add Base to their wallet |
| Connection Rejected | "Connection rejected by user" | User can try connecting again |
| Wrong Network (Auto) | Auto-prompts switch after 1 second | User sees switch prompt automatically |

---

## 🎯 Best Practices

### 1. Always Check Network Before Transactions

```tsx
const { state, actions } = useWalletContext();

async function handleTransaction() {
  if (!state.isCorrectNetwork) {
    const switched = await actions.switchToBase();
    if (!switched) return; // User rejected
  }
  
  // Proceed with transaction
  await sendTransaction();
}
```

### 2. Use Specific Hooks for Better Performance

```tsx
// ✅ Good - only subscribes to state
function DisplayAddress() {
  const state = useWalletState();
  return <span>{state.address}</span>;
}

// ❌ Less optimal - subscribes to everything
function DisplayAddress() {
  const { state, actions } = useWalletContext();
  return <span>{state.address}</span>;
}
```

### 3. Handle Loading States

```tsx
function ActionButton() {
  const { state, actions } = useWalletContext();

  return (
    <button 
      onClick={actions.switchToBase}
      disabled={state.isConnecting}
    >
      {state.isConnecting ? 'Switching...' : 'Switch Network'}
    </button>
  );
}
```

### 4. Clear Errors After Handling

```tsx
useEffect(() => {
  if (state.error) {
    // Show error notification
    showToast(state.error);
    
    // Clear after showing
    setTimeout(() => {
      actions.clearError();
    }, 5000);
  }
}, [state.error]);
```

---

## 📦 Utility Functions

Additional wallet utilities in `src/lib/wallet.ts`:

```typescript
// Format address for display
formatAddress(address: string, prefixLength?: number, suffixLength?: number): string

// Validate Ethereum address
isValidAddress(address: string): boolean

// Copy to clipboard
copyToClipboard(text: string): Promise<boolean>

// Open block explorer
openBlockExplorer(address: string, chainId?: number): void

// Format transaction hash
formatTxHash(hash: string): string

// Check if on Base network
isBaseNetwork(chainId?: number): boolean

// Get network name
getNetworkName(chainId?: number): string

// Format balance (wei to ETH)
formatBalance(balance: bigint | string, decimals?: number): string
```

---

## 🐛 Troubleshooting

### Issue: Auto-reconnect not working

**Solution:** Check that `localStorage` is accessible and not disabled in browser settings.

### Issue: Network switch fails silently

**Solution:** Check browser console for error details. Ensure Base network is added to wallet.

### Issue: Session persists after disconnect

**Solution:** Manually clear localStorage or use incognito mode for testing.

### Issue: Wrong network detected but no prompt

**Solution:** Check that `state.error` is not already set (blocking auto-switch). Clear error first.

---

## 🔗 Related Files

- **Context:** [src/contexts/WalletContext.tsx](src/contexts/WalletContext.tsx)
- **Provider:** [src/providers/Web3Provider.tsx](src/providers/Web3Provider.tsx)
- **Button:** [src/components/WalletConnectButton.tsx](src/components/WalletConnectButton.tsx)
- **Utilities:** [src/lib/wallet.ts](src/lib/wallet.ts)
- **Config:** [src/lib/web3-config.ts](src/lib/web3-config.ts)
- **Examples:** [src/examples/wallet-context-usage.tsx](src/examples/wallet-context-usage.tsx)

---

## 📝 Migration Guide

### From Old `useWallet()` Hook

**Before:**
```tsx
import { useWallet } from '@/lib/wallet';

function Component() {
  const { address, isConnected, isLoading } = useWallet();
  // ...
}
```

**After:**
```tsx
import { useWalletState } from '@/contexts/WalletContext';

function Component() {
  const { address, isConnected, isConnecting } = useWalletState();
  // Now includes: chain, isCorrectNetwork, error
}
```

### From Direct Wagmi Hooks

**Before:**
```tsx
import { useAccount, useDisconnect } from 'wagmi';

function Component() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  // ...
}
```

**After:**
```tsx
import { useWalletContext } from '@/contexts/WalletContext';

function Component() {
  const { state, actions } = useWalletContext();
  // state.address, actions.disconnect()
  // Plus: network detection, persistence, errors
}
```

---

## 🎉 Summary

You now have a production-ready wallet connection system with:

✅ Automatic Base network detection  
✅ One-click network switching  
✅ Graceful error handling  
✅ Session persistence  
✅ Global state management  
✅ Type-safe API  
✅ Comprehensive utilities  

Happy building! 🚀
