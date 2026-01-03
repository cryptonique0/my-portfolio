import { createConfig, http } from 'wagmi';
import { base, baseSepolia, mainnet, sepolia } from 'wagmi/chains';
import { metaMask, walletConnect, injected } from '@wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [base, baseSepolia, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

// Chain Types
export enum ChainType {
  EVM = 'evm',
  STACKS = 'stacks',
}

// Export chain configurations
export const NETWORKS = {
  // EVM Chains
  BASE_MAINNET: {
    id: 8453,
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    currency: 'ETH',
    chainType: ChainType.EVM,
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    currency: 'ETH',
    chainType: ChainType.EVM,
  },
  ETHEREUM_MAINNET: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    currency: 'ETH',
    chainType: ChainType.EVM,
  },
  ETHEREUM_SEPOLIA: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    blockExplorer: 'https://sepolia.etherscan.io',
    currency: 'ETH',
    chainType: ChainType.EVM,
  },
  
  // Stacks Mainnet (Bitcoin L2)
  STACKS_MAINNET: {
    id: 0,
    name: 'Stacks Mainnet',
    rpcUrl: 'https://mainnet.stacks.co',
    blockExplorer: 'https://explorer.stacks.co',
    currency: 'STX',
    chainType: ChainType.STACKS,
  },
  
  // Stacks Testnet
  STACKS_TESTNET: {
    id: 2147483648,
    name: 'Stacks Testnet',
    rpcUrl: 'https://testnet-api.stacks.co',
    blockExplorer: 'https://testnet-explorer.stacks.co',
    currency: 'STX',
    chainType: ChainType.STACKS,
  },
};

export const DEFAULT_NETWORK = NETWORKS.BASE_MAINNET;

// Get all supported networks
export const SUPPORTED_NETWORKS = Object.values(NETWORKS);

// Get networks by chain type
export const EVM_NETWORKS = SUPPORTED_NETWORKS.filter(
  (net) => net.chainType === ChainType.EVM
);

export const STACKS_NETWORKS = SUPPORTED_NETWORKS.filter(
  (net) => net.chainType === ChainType.STACKS
);
