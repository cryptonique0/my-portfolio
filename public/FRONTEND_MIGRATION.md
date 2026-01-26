# Frontend Migration Guide - Wagmi & Viem for Base

## Overview

This guide helps migrate the Vue.js frontend from Stacks to Base Chain using Wagmi and Viem.

## Dependencies Installed

```json
{
  "@wagmi/core": "^2.4.0",
  "wagmi": "^2.4.0",
  "viem": "^2.8.0",
  "@rainbow-me/rainbowkit": "^1.3.0",
  "vue": "^3.3.0",
  "ethers": "^6.10.0"
}
```

## Setup Steps

### 1. Wagmi Configuration

Create `src/config/wagmi.ts`:

```typescript
import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
    }),
  ],
  transports: {
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL),
    [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL),
  },
})
```

### 2. Setup in Main.ts

```typescript
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './config/wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

app.use(WagmiProvider, { config: wagmiConfig })
app.use(QueryClientProvider, { client: queryClient })
```

### 3. Update Wallet Connection Component

Create `src/components/WalletConnect.vue`:

```vue
<template>
  <div class="wallet-connect">
    <div v-if="isConnected" class="connected">
      <span class="address">{{ truncateAddress(address) }}</span>
      <button @click="disconnect" class="btn-disconnect">
        Disconnect
      </button>
    </div>
    <button v-else @click="showConnectModal" class="btn-connect">
      Connect Wallet
    </button>

    <!-- Balance Display -->
    <div v-if="isConnected" class="balance">
      <span>Balance: {{ formatBalance(balance) }} ETH</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { formatEther } from 'viem'

const { address, isConnected } = useAccount()
const { disconnect } = useDisconnect()
const { data: balanceData } = useBalance({ address })

const showConnectModal = ref(false)

const balance = computed(() => {
  return balanceData?.value ? formatEther(balanceData.value) : '0'
})

function truncateAddress(addr?: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatBalance(bal: string) {
  return parseFloat(bal).toFixed(4)
}
</script>

<style scoped>
.wallet-connect {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.address {
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.btn-connect, .btn-disconnect {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-connect {
  background: #0052ff;
  color: white;
}

.btn-disconnect {
  background: #ff6b6b;
  color: white;
}

.balance {
  font-size: 0.9rem;
  color: #666;
}
</style>
```

## Contract Interaction Hooks

### Create `src/hooks/useAirdropManager.ts`

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { AIRDROP_MANAGER_ABI } from '@/abi/AirdropManager'

const MANAGER_ADDRESS = import.meta.env.VITE_AIRDROP_MANAGER_ADDRESS

export function useAirdropManager() {
  const { writeContract, isPending } = useWriteContract()

  // Read Functions
  const {
    data: airdropData,
    isLoading: isLoadingAirdrop,
  } = useReadContract({
    address: MANAGER_ADDRESS,
    abi: AIRDROP_MANAGER_ABI,
    functionName: 'getAirdrop',
    args: [1n], // airdropId
  })

  const {
    data: allocation,
    isLoading: isLoadingAllocation,
  } = useReadContract({
    address: MANAGER_ADDRESS,
    abi: AIRDROP_MANAGER_ABI,
    functionName: 'getAllocation',
    args: [1n, '0x...'], // airdropId, userAddress
  })

  // Write Functions
  const claimTokens = (airdropId: bigint) => {
    writeContract({
      address: MANAGER_ADDRESS,
      abi: AIRDROP_MANAGER_ABI,
      functionName: 'claimTokens',
      args: [airdropId],
    })
  }

  const setAllocation = (airdropId: bigint, recipient: string, amount: string) => {
    writeContract({
      address: MANAGER_ADDRESS,
      abi: AIRDROP_MANAGER_ABI,
      functionName: 'setAllocation',
      args: [
        airdropId,
        recipient,
        parseUnits(amount, 6), // 6 decimals for AIRST
      ],
    })
  }

  return {
    airdropData,
    allocation,
    isLoadingAirdrop,
    isLoadingAllocation,
    isPending,
    claimTokens,
    setAllocation,
  }
}
```

### Create `src/hooks/useETHAirdrop.ts`

```typescript
import { useReadContract, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { ETH_AIRDROP_MANAGER_ABI } from '@/abi/ETHAirdropManager'

const ETH_MANAGER_ADDRESS = import.meta.env.VITE_ETH_AIRDROP_ADDRESS

export function useETHAirdrop() {
  const { writeContract, isPending } = useWriteContract()

  const {
    data: ethAllocation,
    isLoading: isLoadingAllocation,
  } = useReadContract({
    address: ETH_MANAGER_ADDRESS,
    abi: ETH_AIRDROP_MANAGER_ABI,
    functionName: 'getETHAllocation',
    args: [1n, '0x...'], // airdropId, userAddress
  })

  const claimETH = (airdropId: bigint) => {
    writeContract({
      address: ETH_MANAGER_ADDRESS,
      abi: ETH_AIRDROP_MANAGER_ABI,
      functionName: 'claimETH',
      args: [airdropId],
    })
  }

  return {
    ethAllocation,
    isLoadingAllocation,
    isPending,
    claimETH,
  }
}
```

## Update App.vue

```vue
<template>
  <div id="app">
    <header>
      <h1>AirStack V2</h1>
      <WalletConnect />
    </header>

    <main>
      <div v-if="isConnected">
        <div class="airdrop-section">
          <h2>Token Airdrop</h2>
          <AirdropCard />
        </div>

        <div class="eth-airdrop-section">
          <h2>ETH Airdrop</h2>
          <ETHAirdropCard />
        </div>

        <div class="vesting-section">
          <h2>Vesting Schedule</h2>
          <VestingCard />
        </div>

        <div class="governance-section">
          <h2>Governance</h2>
          <GovernancePanel />
        </div>
      </div>
      <div v-else class="connect-wallet">
        <p>Please connect your wallet to continue</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAccount } from 'wagmi'
import WalletConnect from './components/WalletConnect.vue'
import AirdropCard from './components/AirdropCard.vue'
import ETHAirdropCard from './components/ETHAirdropCard.vue'
import VestingCard from './components/VestingCard.vue'
import GovernancePanel from './components/GovernancePanel.vue'

const { isConnected } = useAccount()
</script>

<style>
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}

main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.connect-wallet {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>
```

## Contract ABI Files

Create `src/abi/AirdropManager.ts`:

```typescript
export const AIRDROP_MANAGER_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'airdropId', type: 'uint256' },
    ],
    name: 'getAirdrop',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenContract', type: 'address' },
          { internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'claimedAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'bool', name: 'active', type: 'bool' },
          { internalType: 'address', name: 'creator', type: 'address' },
        ],
        internalType: 'struct AirdropManager.Airdrop',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // ... more functions
] as const
```

## Environment Variables

Update `.env` with frontend addresses:

```env
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
VITE_WC_PROJECT_ID=your_walletconnect_project_id
VITE_AIRDROP_MANAGER_ADDRESS=0x...
VITE_AIRDROP_TOKEN_ADDRESS=0x...
VITE_GOVERNANCE_ADDRESS=0x...
VITE_VESTING_ADDRESS=0x...
VITE_WHITELIST_ADDRESS=0x...
VITE_MERKLE_TREE_ADDRESS=0x...
VITE_ETH_AIRDROP_ADDRESS=0x...
VITE_AGGREGATOR_ADDRESS=0x...
VITE_ANALYTICS_ADDRESS=0x...
```

## Build & Deploy

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Differences from Stacks

| Feature | Stacks | Base (Wagmi/Viem) |
|---------|--------|------------------|
| Network | Testnet/Mainnet | Base/Base Sepolia |
| Wallet | Stacks Wallet | MetaMask, Rainbow, WalletConnect |
| Token Standard | SIP-010 | ERC20 |
| Units | micro-STX | wei/gwei |
| Gas | STX | ETH |
| Transactions | ~10 minutes | ~2 seconds |

## Common Tasks

### Connect to Different Network

```typescript
const { switchChain } = useSwitchChain()

switchChain({ chainId: baseSepolia.id })
```

### Format Numbers

```typescript
import { formatEther, parseEther } from 'viem'

// ETH
formatEther(1000000000000000000n) // "1"
parseEther("1") // 1000000000000000000n

// Tokens (6 decimals)
formatUnits(1000000n, 6) // "1"
parseUnits("1", 6) // 1000000n
```

### Handle Transactions

```typescript
const hash = await writeContractAsync({
  address,
  abi,
  functionName: 'claimTokens',
  args: [airdropId],
})

const receipt = await waitForTransactionReceipt(config, { hash })
```
