/**
 * Frontend environment configuration
 * Type-safe access to Vite environment variables
 */

interface FrontendConfig {
  // API
  apiUrl: string;
  
  // Network
  network: 'testnet' | 'mainnet';
  
  // Base (Sepolia Testnet & Mainnet)
  base: {
    testnet: {
      rpcUrl: string;
      chainId: number;
      chainName: string;
      currency: string;
      explorer: string;
      nftContract: string;
      marketplaceContract: string;
      auctionContract: string;
    };
    mainnet: {
      rpcUrl: string;
      chainId: number;
      chainName: string;
      currency: string;
      explorer: string;
      nftContract: string;
      marketplaceContract: string;
      auctionContract: string;
    };
  };
}

/**
 * Get optional environment variable with default
 */
function getOptionalEnv(key: keyof ImportMetaEnv, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}



/**
 * Validate and parse frontend environment variables
 */
function createConfig(): FrontendConfig {
  const network = getOptionalEnv('VITE_NETWORK', 'testnet');
  
  if (network !== 'testnet' && network !== 'mainnet') {
    console.warn(`Invalid VITE_NETWORK: ${network}. Defaulting to 'testnet'`);
  }

  return {
    apiUrl: getOptionalEnv('VITE_API_URL', 'http://localhost:3001/api'),
    network: (network === 'mainnet' ? 'mainnet' : 'testnet') as 'testnet' | 'mainnet',
    
    base: {
      testnet: {
        rpcUrl: getOptionalEnv('VITE_BASE_TESTNET_RPC_URL', 'https://sepolia.base.org'),
        chainId: 84532,
        chainName: 'Base Sepolia Testnet',
        currency: 'ETH',
        explorer: getOptionalEnv('VITE_BASE_TESTNET_EXPLORER', 'https://sepolia.basescan.org'),
        nftContract: getOptionalEnv(
          'VITE_BASE_TESTNET_NFT_CONTRACT',
          '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682'
        ),
        marketplaceContract: getOptionalEnv(
          'VITE_BASE_TESTNET_MARKETPLACE_CONTRACT',
          '0x7d28443e3571faB3821d669537E45484E4A06AC9'
        ),
        auctionContract: getOptionalEnv(
          'VITE_BASE_TESTNET_AUCTION_CONTRACT',
          '0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2'
        ),
      },
      mainnet: {
        rpcUrl: getOptionalEnv('VITE_BASE_RPC_URL', 'https://mainnet.base.org'),
        chainId: 8453,
        chainName: 'Base Mainnet',
        currency: 'ETH',
        explorer: getOptionalEnv('VITE_BASE_EXPLORER', 'https://basescan.org'),
        nftContract: getOptionalEnv(
          'VITE_BASE_NFT_CONTRACT',
          '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682'
        ),
        marketplaceContract: getOptionalEnv(
          'VITE_BASE_MARKETPLACE_CONTRACT',
          '0x7d28443e3571faB3821d669537E45484E4A06AC9'
        ),
        auctionContract: getOptionalEnv(
          'VITE_BASE_AUCTION_CONTRACT',
          '0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2'
        ),
      },
    },
  };
}

// Export singleton config
export const config = createConfig();

export type { FrontendConfig };
