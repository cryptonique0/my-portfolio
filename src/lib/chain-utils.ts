import { useAccount, useChainId, useSwitchNetwork } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { ChainType, NETWORKS, EVM_NETWORKS, STACKS_NETWORKS } from './web3-config';
import { StacksWalletType } from './stacks-config';

/**
 * Multi-Chain Detection and Management
 * Handles switching between EVM chains and Stacks
 */

export interface ChainInfo {
  id: number | string;
  name: string;
  type: ChainType;
  currency: string;
  blockExplorer: string;
  rpcUrl: string;
}

export enum WalletType {
  METAMASK = 'MetaMask',
  WALLETCONNECT = 'WalletConnect',
  INJECTED = 'Injected',
  HIRO = 'Hiro',
  XVERSE = 'Xverse',
  LEATHER = 'Leather',
}

/**
 * Hook to detect current chain and handle switching
 */
export function useChainDetection() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchNetwork } = useSwitchNetwork();
  const [currentChain, setCurrentChain] = useState<ChainInfo | null>(null);
  const [isStacksChain, setIsStacksChain] = useState(false);
  const [isEvmChain, setIsEvmChain] = useState(true);

  // Detect current chain type
  useEffect(() => {
    if (!isConnected || !chainId) return;

    // Find the current chain in our networks
    const chain = Object.values(NETWORKS).find(
      (net) => net.id === chainId
    );

    if (chain) {
      setCurrentChain(chain as ChainInfo);
      setIsEvmChain(chain.type === ChainType.EVM);
      setIsStacksChain(chain.type === ChainType.STACKS);
    }
  }, [chainId, isConnected]);

  // Function to switch to a specific chain
  const switchToChain = useCallback(
    async (chainId: number | string) => {
      if (typeof chainId === 'string') {
        // Stacks chain - requires different wallet connection
        console.log('Switching to Stacks chain:', chainId);
        // Handle Stacks switching (requires Hiro, Xverse, or Leather wallet)
      } else {
        // EVM chain - use wagmi's switchNetwork
        try {
          await switchNetwork?.({ chainId });
        } catch (error) {
          console.error('Failed to switch chain:', error);
        }
      }
    },
    [switchNetwork]
  );

  return {
    currentChain,
    isEvmChain,
    isStacksChain,
    chainId,
    address,
    isConnected,
    switchToChain,
  };
}

/**
 * Hook for Stacks-specific chain detection
 */
export function useStacksChain() {
  const [stacksNetwork, setStacksNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [stacksAddress, setStacksAddress] = useState<string | null>(null);
  const [connectedStacksWallet, setConnectedStacksWallet] = useState<StacksWalletType | null>(
    null
  );

  const switchStacksNetwork = useCallback((network: 'mainnet' | 'testnet') => {
    setStacksNetwork(network);
  }, []);

  return {
    stacksNetwork,
    stacksAddress,
    connectedStacksWallet,
    switchStacksNetwork,
    isStacksConnected: !!stacksAddress,
  };
}

/**
 * Get chain information by ID
 */
export function getChainInfo(chainId: number | string): ChainInfo | undefined {
  return Object.values(NETWORKS).find((net) => net.id === chainId) as ChainInfo | undefined;
}

/**
 * Check if address belongs to a specific chain type
 */
export function isStacksAddress(address: string): boolean {
  return /^S[P|T][0-9A-Z]{32}$/.test(address);
}

export function isEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address based on chain type
 */
export function formatAddressByChainType(address: string): string {
  if (isStacksAddress(address)) {
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  }
  if (isEvmAddress(address)) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}

/**
 * Get block explorer URL for a transaction
 */
export function getExplorerUrl(
  txHash: string,
  chainType: ChainType = ChainType.EVM,
  chainId?: number | string
): string {
  if (chainType === ChainType.STACKS) {
    const network = Object.values(NETWORKS).find(
      (net) => net.id === chainId && net.chainType === ChainType.STACKS
    );
    if (network) {
      return `${network.blockExplorer}/tx/${txHash}`;
    }
    return `https://explorer.stacks.co/tx/${txHash}`;
  }

  // EVM explorer
  const evmChain = Object.values(NETWORKS).find(
    (net) => net.id === chainId && net.chainType === ChainType.EVM
  );
  if (evmChain) {
    return `${evmChain.blockExplorer}/tx/${txHash}`;
  }

  return `https://etherscan.io/tx/${txHash}`;
}

/**
 * Get all available networks for dropdown/selector
 */
export function getAllNetworks(): ChainInfo[] {
  return Object.values(NETWORKS) as ChainInfo[];
}

/**
 * Get networks filtered by type
 */
export function getNetworksByType(type: ChainType): ChainInfo[] {
  const networks = type === ChainType.EVM ? EVM_NETWORKS : STACKS_NETWORKS;
  return networks as ChainInfo[];
}

/**
 * Multi-chain contract address resolver
 */
export function getContractAddress(
  contractType: 'onChainResume' | 'achievementNFT' | 'credentialVerifier',
  chainId?: number | string
): string | undefined {
  const chainInfo = chainId ? getChainInfo(chainId) : undefined;

  if (!chainInfo) {
    return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  }

  // EVM chains use the same contract addresses
  if (chainInfo.type === ChainType.EVM) {
    return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  }

  // Stacks contracts - would be loaded from environment
  return undefined;
}
