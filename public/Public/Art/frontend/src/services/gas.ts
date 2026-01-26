import axios from 'axios';

// Base RPC endpoint
const BASE_RPC_URL = (import.meta as any).env?.VITE_BASE_RPC_URL || 'https://mainnet.base.org';

// Platform fee in basis points (0.25% = 25 bps, 2.5% = 250 bps)
const PLATFORM_FEE_BPS = 250; // 2.5%

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string; // in wei
  gasPriceGwei: number;
  estimatedGasCost: string; // in wei
  estimatedGasCostEth: number;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionFeeBreakdown {
  itemPrice: number; // in ETH
  platformFee: number; // in ETH
  platformFeeBps: number;
  royaltyFee: number; // in ETH (if applicable)
  royaltyPercentage: number;
  estimatedGasCost: number; // in ETH
  totalCost: number; // in ETH
  isCheapGas: boolean; // True if gas < 0.01 ETH
  savings: number; // Estimated savings vs Ethereum mainnet
}

/**
 * Get current Base gas prices
 */
export async function getBaseGasPrice(): Promise<GasEstimate> {
  try {
    const response = await axios.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_gasPrice',
      params: []
    });

    const gasPriceHex = response.data?.result;
    if (!gasPriceHex) throw new Error('Failed to get gas price');

    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;

    return {
      gasLimit: '21000',
      gasPrice: gasPriceWei.toString(),
      gasPriceGwei,
      estimatedGasCost: (gasPriceWei * BigInt(21000)).toString(),
      estimatedGasCostEth: (Number(gasPriceWei * BigInt(21000)) / 1e18)
    };
  } catch (error) {
    console.error('Failed to get Base gas price:', error);
    // Return fallback estimate (typical Base gas ~0.1 gwei)
    return {
      gasLimit: '21000',
      gasPrice: '100000000', // 0.1 gwei in wei
      gasPriceGwei: 0.1,
      estimatedGasCost: '2100000000000000',
      estimatedGasCostEth: 0.0021
    };
  }
}

/**
 * Estimate gas for a contract transaction
 */
export async function estimateTransactionGas(
  to: string,
  data: string,
  from?: string
): Promise<GasEstimate> {
  try {
    const response = await axios.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_estimateGas',
      params: [
        {
          from: from || '0x0000000000000000000000000000000000000000',
          to,
          data
        }
      ]
    });

    const gasLimitHex = response.data?.result;
    if (!gasLimitHex) throw new Error('Failed to estimate gas');

    const gasLimitWei = BigInt(gasLimitHex);
    
    // Get current gas price
    const gasPriceResponse = await axios.post(BASE_RPC_URL, {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_gasPrice',
      params: []
    });

    const gasPriceWei = BigInt(gasPriceResponse.data?.result || '100000000');
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    const estimatedCost = gasLimitWei * gasPriceWei;

    return {
      gasLimit: gasLimitWei.toString(),
      gasPrice: gasPriceWei.toString(),
      gasPriceGwei,
      estimatedGasCost: estimatedCost.toString(),
      estimatedGasCostEth: Number(estimatedCost) / 1e18
    };
  } catch (error) {
    console.error('Failed to estimate transaction gas:', error);
    // Fallback estimate for marketplace listing (~100k gas)
    const estimatedGas = BigInt('100000');
    const gasPriceWei = BigInt('100000000');
    return {
      gasLimit: estimatedGas.toString(),
      gasPrice: gasPriceWei.toString(),
      gasPriceGwei: 0.1,
      estimatedGasCost: (estimatedGas * gasPriceWei).toString(),
      estimatedGasCostEth: Number(estimatedGas * gasPriceWei) / 1e18
    };
  }
}

/**
 * Calculate transaction fee breakdown for marketplace operations
 */
export function calculateFeeBreakdown(
  itemPrice: number, // in ETH
  estimatedGasCostEth: number,
  royaltyPercentage: number = 0 // 0-100
): TransactionFeeBreakdown {
  const platformFee = itemPrice * (PLATFORM_FEE_BPS / 10000);
  const royaltyFee = itemPrice * (royaltyPercentage / 100);
  const totalCost = itemPrice + platformFee + royaltyFee + estimatedGasCostEth;

  return {
    itemPrice,
    platformFee,
    platformFeeBps: PLATFORM_FEE_BPS,
    royaltyFee,
    royaltyPercentage,
    estimatedGasCost: estimatedGasCostEth,
    totalCost,
    isCheapGas: estimatedGasCostEth < 0.01,
    savings: estimatedGasCostEth > 0 ? (estimatedGasCostEth * 0.8) : 0 // Rough estimate vs mainnet
  };
}

/**
 * Format price for display
 */
export function formatPrice(eth: number, decimals: number = 6): string {
  if (eth === 0) return '0.00';
  if (eth < 0.000001) return '< 0.000001';
  return eth.toFixed(decimals).replace(/\.?0+$/, '');
}
