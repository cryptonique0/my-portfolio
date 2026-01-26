/**
 * Coinbase Wallet optimization
 * Detect and provide optimized UX for Coinbase Wallet users
 */

/**
 * Detect if user is using Coinbase Wallet
 */
export function isCoinbaseWallet(): boolean {
  if (typeof window === 'undefined') return false;
  const ethereum = window.ethereum as any;
  return ethereum?.isCoinbaseWallet === true;
}

/**
 * Detect if user is using Coinbase Smart Wallet
 */
export function isCoinbaseSmartWallet(): boolean {
  if (typeof window === 'undefined') return false;
  const ethereum = window.ethereum as any;
  return ethereum?.isCoinbaseBrowser === true || ethereum?.isWalletLink === true;
}

/**
 * Deep link format for Coinbase Wallet
 * Opens transaction details in Coinbase Wallet app if installed
 */
export function getCoinbaseWalletLink(txHash: string): string {
  return `https://www.coinbase.com/tx/eth/${txHash}`;
}

/**
 * Get Coinbase Wallet download link
 */
export function getCoinbaseWalletDownloadLink(): string {
  return 'https://www.coinbase.com/wallet';
}

/**
 * Coinbase Wallet specific gas preferences
 */
export const COINBASE_GAS_PREFERENCES = {
  preferredGasMultiplier: 1.1, // Slightly higher for reliability
  autoGasPriceEnabled: true,
  showDetailedGasUI: true
};

/**
 * Request account with Coinbase Wallet-specific hints
 */
export async function requestAccountsCoinbaseOptimized(): Promise<string[]> {
  if (!window.ethereum) throw new Error('No wallet detected');

  try {
    // Use the standard RPC method with Coinbase hints
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
      params: [{ optionalMethods: ['eth_sign'] }]
    });

    return accounts as string[];
  } catch (error) {
    throw error;
  }
}

/**
 * Send transaction with Coinbase Wallet optimizations
 */
export async function sendTransactionOptimized(txData: {
  to: string;
  from: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}): Promise<string> {
  if (!window.ethereum) throw new Error('No wallet detected');

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txData]
    });

    return txHash as string;
  } catch (error) {
    throw error;
  }
}

/**
 * Coinbase Wallet feature detection
 */
export interface CoinbaseWalletFeatures {
  isCoinbaseWallet: boolean;
  isSmartWallet: boolean;
  supportsEIP1559: boolean;
  supportsBatchTx: boolean;
}

export async function detectCoinbaseWalletFeatures(): Promise<CoinbaseWalletFeatures> {
  const isCoinbase = isCoinbaseWallet();
  const isSmartWallet = isCoinbaseSmartWallet();

  // Check EIP-1559 support
  let supportsEIP1559 = false;
  try {
    const blockData = await (window as any).ethereum?.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false]
    });
    supportsEIP1559 = blockData?.baseFeePerGas !== undefined;
  } catch (e) {
    supportsEIP1559 = true; // Assume modern chains support it
  }

  return {
    isCoinbaseWallet: isCoinbase,
    isSmartWallet,
    supportsEIP1559,
    supportsBatchTx: isCoinbase && isSmartWallet
  };
}

/**
 * Message to display for Coinbase Wallet users
 */
export function getCoinbaseOptimizationMessage(): string {
  if (isCoinbaseSmartWallet()) {
    return '💳 Using Coinbase Smart Wallet - gasless transactions available on supported chains';
  }
  if (isCoinbaseWallet()) {
    return '💳 Coinbase Wallet detected - optimized for Base Mainnet';
  }
  return '';
}
