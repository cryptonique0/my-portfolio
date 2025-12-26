import { createConfig, http, cookieStorage, createStorage } from 'wagmi';
import { base, baseSepolia, mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect, metaMask } from '@wagmi/connectors';

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
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});

// Export chain configurations
export const NETWORKS = {
  BASE_MAINNET: {
    id: 8453,
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    currency: 'ETH',
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    currency: 'ETH',
  },
  ETHEREUM_MAINNET: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    currency: 'ETH',
  },
  ETHEREUM_SEPOLIA: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    blockExplorer: 'https://sepolia.etherscan.io',
    currency: 'ETH',
  },
};

export const DEFAULT_NETWORK = NETWORKS.BASE_MAINNET;
