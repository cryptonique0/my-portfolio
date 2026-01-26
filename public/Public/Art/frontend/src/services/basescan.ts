/**
 * BaseScan explorer integration utility
 * Generate deep links to BaseScan for transactions, addresses, blocks, and contracts
 */

const BASESCAN_URL = 'https://basescan.org';

export type BaseScanResourceType = 'tx' | 'address' | 'token' | 'block' | 'contract';

export interface BaseScanLink {
  url: string;
  label: string;
  icon: string;
}

/**
 * Generate BaseScan URL for a transaction
 */
export function getTransactionLink(txHash: string): BaseScanLink {
  return {
    url: `${BASESCAN_URL}/tx/${txHash}`,
    label: `View on BaseScan`,
    icon: '🔍'
  };
}

/**
 * Generate BaseScan URL for an address
 */
export function getAddressLink(address: string, label?: string): BaseScanLink {
  return {
    url: `${BASESCAN_URL}/address/${address}`,
    label: label || `${address.substring(0, 6)}...${address.substring(-4)}`,
    icon: '👤'
  };
}

/**
 * Generate BaseScan URL for a contract
 */
export function getContractLink(contractAddress: string): BaseScanLink {
  return {
    url: `${BASESCAN_URL}/address/${contractAddress}`,
    label: `Contract`,
    icon: '📋'
  };
}

/**
 * Generate BaseScan URL for a token
 */
export function getTokenLink(tokenAddress: string, tokenName?: string): BaseScanLink {
  return {
    url: `${BASESCAN_URL}/token/${tokenAddress}`,
    label: tokenName || 'Token',
    icon: '💰'
  };
}

/**
 * Generate BaseScan URL for a block
 */
export function getBlockLink(blockNumber: number | string): BaseScanLink {
  return {
    url: `${BASESCAN_URL}/block/${blockNumber}`,
    label: `Block ${blockNumber}`,
    icon: '📦'
  };
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(-chars)}`;
}

/**
 * Shorten transaction hash for display
 */
export function shortenTxHash(txHash: string, chars: number = 6): string {
  return `${txHash.substring(0, chars)}...${txHash.substring(-chars)}`;
}

/**
 * Get full BaseScan URL (without link object)
 */
export function getBaseScanUrl(resourceType: BaseScanResourceType, resourceId: string): string {
  return `${BASESCAN_URL}/${resourceType}/${resourceId}`;
}

/**
 * Known contract addresses on Base Mainnet
 */
export const BASE_CONTRACTS = {
  BITART_NFT: '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682',
  BITART_MARKETPLACE: '0x7d28443e3571faB3821d669537E45484E4A06AC9',
  BITART_AUCTION: '0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WETH: '0x4200000000000000000000000000000000000006'
};

/**
 * Get contract name from address
 */
export function getContractName(address: string): string | null {
  const lowerAddress = address.toLowerCase();
  const contractEntry = Object.entries(BASE_CONTRACTS).find(
    ([_, addr]) => addr.toLowerCase() === lowerAddress
  );
  return contractEntry ? contractEntry[0].replace(/_/g, ' ') : null;
}
