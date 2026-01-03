# 🎨 Visual Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         APPLICATION ROOT                            │
│                        (app/layout.tsx)                             │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             v
┌────────────────────────────────────────────────────────────────────┐
│                      <Web3Provider>                                 │
│                 (src/providers/Web3Provider.tsx)                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    <WagmiConfig>                             │  │
│  │                  (Wagmi v1 Provider)                         │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │           <QueryClientProvider>                        │ │  │
│  │  │         (React Query Provider)                         │ │  │
│  │  │                                                         │ │  │
│  │  │  ┌──────────────────────────────────────────────────┐ │ │  │
│  │  │  │         <WalletProvider>                        │ │ │  │
│  │  │  │   (src/contexts/WalletContext.tsx)              │ │ │  │
│  │  │  │                                                  │ │ │  │
│  │  │  │  ┌────────────────────────────────────────────┐│ │ │  │
│  │  │  │  │         YOUR APP CONTENT                   ││ │ │  │
│  │  │  │  │                                             ││ │ │  │
│  │  │  │  │  Components can use:                       ││ │ │  │
│  │  │  │  │  - useWalletContext()                      ││ │ │  │
│  │  │  │  │  - useWalletState()                        ││ │ │  │
│  │  │  │  │  - useWalletActions()                      ││ │ │  │
│  │  │  │  └────────────────────────────────────────────┘│ │ │  │
│  │  │  └──────────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Flow Diagram

```
┌──────────────────┐
│  User Connects   │
│     Wallet       │
└────────┬─────────┘
         │
         v
┌────────────────────────────────────────────────────────────────┐
│                    WalletContext                                │
│                                                                  │
│  1. useConnect() → Connect to wallet provider                  │
│  2. Store: wallet_connected, wallet_connector_id               │
│  3. Update state: { isConnected: true, address: "0x..." }     │
└────────┬───────────────────────────────────────────────────────┘
         │
         v
┌────────────────────────────────────────────────────────────────┐
│                Network Detection                                │
│                                                                  │
│  - Check: chain.id === 8453 || chain.id === 84532?            │
│  - If NO: isCorrectNetwork = false                             │
│  - If YES: isCorrectNetwork = true                             │
└────────┬───────────────────────────────────────────────────────┘
         │
         v (if wrong network)
┌────────────────────────────────────────────────────────────────┐
│             Auto Switch Prompt (1 sec delay)                    │
│                                                                  │
│  - Wait 1 second                                                │
│  - Call: switchToBase()                                         │
│  - Prompt wallet to switch network                              │
└────────┬───────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    v         v
┌────────┐  ┌──────────┐
│ Accept │  │  Reject  │
└───┬────┘  └────┬─────┘
    │            │
    v            v
┌─────────┐  ┌────────────────────────┐
│ Success │  │ Show Error Message     │
│ ✅      │  │ "Switch rejected..."   │
└─────────┘  │ Keep "Switch" button   │
             └────────────────────────┘
```

---

## 🎯 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   WalletConnectButton                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  const { state, actions } = useWalletContext()       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  IF not connected:                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Connect Wallet] Button                             │  │
│  │       ↓ onClick                                       │  │
│  │  actions.connect(connectorId)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  IF connected + wrong network:                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [⚠️ Ethereum] [Switch to Base] [0x1234...7890] [❌]│  │
│  │                     ↓ onClick                         │  │
│  │                actions.switchToBase()                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  IF connected + correct network:                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [✅ Base] [0x1234...7890] [Disconnect]              │  │
│  │                               ↓ onClick               │  │
│  │                          actions.disconnect()         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

                         ↕️ (subscribes to)

┌─────────────────────────────────────────────────────────────┐
│                     WalletContext                            │
│                                                               │
│  STATE:                      ACTIONS:                        │
│  - address                   - connect()                     │
│  - isConnected              - disconnect()                   │
│  - isConnecting             - switchToBase()                 │
│  - chain                     - clearError()                  │
│  - isCorrectNetwork         - reconnect()                    │
│  - error                                                      │
└─────────────────────────────────────────────────────────────┘

                         ↕️ (uses)

┌─────────────────────────────────────────────────────────────┐
│                    Wagmi v1 Hooks                            │
│                                                               │
│  - useAccount()           → address, isConnected             │
│  - useNetwork()           → chain                            │
│  - useConnect()           → connect, connectors              │
│  - useDisconnect()        → disconnect                       │
│  - useSwitchNetwork()     → switchNetwork                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 UI State Diagram

```
                    ┌───────────────┐
                    │  DISCONNECTED │
                    └───────┬───────┘
                            │
                            │ User clicks "Connect Wallet"
                            ↓
                    ┌───────────────┐
                    │  CONNECTING   │
                    │   (loading)   │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        User accepts              User rejects
                │                       │
                v                       v
        ┌───────────────┐       ┌───────────────┐
        │   CONNECTED   │       │ DISCONNECTED  │
        │  (check net)  │       │  (show error) │
        └───────┬───────┘       └───────────────┘
                │
        ┌───────┴───────┐
        │               │
    Wrong Net      Correct Net
        │               │
        v               v
┌────────────────┐  ┌────────────────┐
│ WRONG_NETWORK  │  │    READY       │
│                │  │                │
│ Show warning   │  │ Green badge    │
│ Switch button  │  │ Full access    │
│ Auto-prompt    │  │                │
└────────────────┘  └────────────────┘
        │
        │ User clicks "Switch to Base"
        ↓
┌────────────────┐
│  SWITCHING     │
│   (loading)    │
└────────┬───────┘
         │
    ┌────┴────┐
    │         │
Accept    Reject
    │         │
    v         v
┌────────┐  ┌────────────┐
│ READY  │  │ SHOW_ERROR │
│        │  │ (can retry)│
└────────┘  └────────────┘
```

---

## 🗄️ LocalStorage Structure

```
localStorage
│
├─ wallet_connected: "true" | null
│  └─ Purpose: Indicates user was previously connected
│
├─ wallet_connector_id: "metaMask" | "walletConnect" | "injected" | null
│  └─ Purpose: Remembers which wallet to reconnect to
│
├─ wallet_last_address: "0x1234..." | null
│  └─ Purpose: Stores last connected address (for display/reference)
│
└─ wallet_auto_connected: "true" | null
   └─ Purpose: Prevents multiple auto-reconnect attempts
```

**Cleared on:** Manual disconnect, session timeout

---

## 🔐 Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S WALLET                         │
│             (MetaMask, WalletConnect, etc.)              │
│                                                           │
│  Private Keys: ✅ NEVER leave wallet                    │
│  Signatures: ✅ Requires user approval                  │
│  Transactions: ✅ Requires user approval                │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Approved connection
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  WALLET CONTEXT                          │
│                                                           │
│  Stores:                                                  │
│  ✅ Address (public, read-only)                         │
│  ✅ Chain ID (public info)                              │
│  ✅ Connection status (boolean)                         │
│                                                           │
│  Does NOT store:                                         │
│  ❌ Private keys                                         │
│  ❌ Seed phrases                                         │
│  ❌ Transaction signatures                               │
└─────────────────────────────────────────────────────────┘
                     │
                     │ Provides to
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  YOUR APP COMPONENTS                     │
│                                                           │
│  Can access:                                             │
│  ✅ Read wallet address                                 │
│  ✅ Check connection status                             │
│  ✅ Request network switch                              │
│  ✅ Request disconnect                                  │
│                                                           │
│  Cannot do:                                              │
│  ❌ Send transactions without user approval             │
│  ❌ Access private keys                                 │
│  ❌ Change network without user approval                │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Performance Optimization

```
┌─────────────────────────────────────────────────────┐
│         COMPONENT RE-RENDER OPTIMIZATION             │
└─────────────────────────────────────────────────────┘

SCENARIO 1: Component needs only state
┌──────────────────────────────┐
│  const state =               │
│    useWalletState()          │
│                              │
│  ✅ Re-renders: Only when    │
│     state changes            │
│  ✅ No re-render when        │
│     actions are called       │
└──────────────────────────────┘

SCENARIO 2: Component needs only actions
┌──────────────────────────────┐
│  const actions =             │
│    useWalletActions()        │
│                              │
│  ✅ Re-renders: Never        │
│     (actions are stable)     │
│  ✅ No re-render when        │
│     state changes            │
└──────────────────────────────┘

SCENARIO 3: Component needs both
┌──────────────────────────────┐
│  const { state, actions } =  │
│    useWalletContext()        │
│                              │
│  ✅ Re-renders: When state   │
│     changes                  │
│  ⚠️  Gets both state and     │
│     actions (use only if     │
│     you need both)           │
└──────────────────────────────┘

BEST PRACTICE:
- Display components → useWalletState()
- Button components → useWalletActions()
- Complex components → useWalletContext()
```

---

## 📊 Error Handling Flow

```
┌─────────────────────────────────────────────┐
│          ERROR SCENARIOS                     │
└─────────────────────────────────────────────┘

1. CONNECTION REJECTED
   User action: Reject wallet connection
   ↓
   WalletContext catches error
   ↓
   Set state.error = "Connection rejected by user"
   ↓
   UI shows error notification
   ↓
   Auto-dismiss after 5 seconds

2. NETWORK SWITCH REJECTED
   User action: Reject network switch
   ↓
   WalletContext catches error
   ↓
   Set state.error = "Network switch rejected..."
   ↓
   UI shows error + keeps "Switch" button
   ↓
   User can retry or dismiss

3. NETWORK NOT FOUND
   User action: Try to switch to Base
   Error: Base not in wallet
   ↓
   WalletContext catches error (code 4902)
   ↓
   Set state.error = "Base network not found..."
   ↓
   UI shows error with instructions
   ↓
   User needs to add Base manually

4. UNKNOWN ERROR
   Any unexpected error
   ↓
   WalletContext catches error
   ↓
   Log to console: "❌ Network switch error:"
   ↓
   Set state.error = "Failed to switch network: [message]"
   ↓
   UI shows generic error
   ↓
   User can dismiss and retry
```

---

## 🎨 UI Component States

```
WALLET CONNECT BUTTON STATES
─────────────────────────────

┌────────────────────────────────┐
│  [Connect Wallet]              │  ← Disconnected
└────────────────────────────────┘

┌────────────────────────────────┐
│  [🔄 Connecting...]            │  ← Connecting
└────────────────────────────────┘

┌────────────────────────────────┐
│  [✅ Base] [0x12..34] [❌]     │  ← Connected + Correct Network
└────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [⚠️ Ethereum] [Switch to Base] [0x12..34] [❌]    │  ← Connected + Wrong Network
└─────────────────────────────────────────────────────┘

┌────────────────────────────────┐
│  [🔄 Switching...]             │  ← Switching Network
└────────────────────────────────┘

ERROR NOTIFICATION
──────────────────

┌─────────────────────────────────────────────┐
│  ⚠️  Network Error                    [×]   │
│  Network switch rejected. Please switch     │
│  to Base network manually.                  │
└─────────────────────────────────────────────┘
    ↑
    Auto-dismiss after 5 seconds

CONNECTOR MODAL
───────────────

┌─────────────────────────────────┐
│  Select a wallet:                │
│                                   │
│  ┌─────────────────────────────┐│
│  │  [M] MetaMask               ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │  [W] WalletConnect          ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │  [I] Injected               ││
│  └─────────────────────────────┘│
│                                   │
│  💡 You'll be prompted to switch │
│     to Base network after        │
│     connecting                   │
└─────────────────────────────────┘
```

---

**Architecture built for scalability, security, and developer experience** 🚀
