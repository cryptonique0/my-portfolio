/**
 * Paymaster / Gasless transaction integration (optional)
 * Supports Pimlico, ERC-4337 account abstraction, and future paymaster services
 *
 * NOTE: This is a framework for gasless transactions. To use:
 * 1. Set up a Paymaster service (e.g., Pimlico, Gelato, custom)
 * 2. Deploy an EntryPoint contract on Base
 * 3. Configure the PAYMASTER_URL and CONTRACT_ADDRESS
 */

export interface GaslessTransactionConfig {
  paymasterUrl: string; // Paymaster service endpoint
  entryPointAddress: string; // ERC-4337 EntryPoint contract
  supportedChainId: number; // 8453 for Base Mainnet
  gaslessListingEnabled: boolean;
}

export interface GaslessUserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  preVerificationGas: string;
  verificationGasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

/**
 * Get default gasless configuration for Base Mainnet
 * NOTE: Configure with real Paymaster endpoint
 */
export function getGaslessConfig(): GaslessTransactionConfig {
  return {
    paymasterUrl: import.meta.env.VITE_PAYMASTER_URL || '',
    entryPointAddress: '0x0000000071727De22E5E9d109855203dDA811F26', // Standard ERC-4337 EntryPoint
    supportedChainId: 8453, // Base Mainnet
    gaslessListingEnabled: !!import.meta.env.VITE_PAYMASTER_URL
  };
}

/**
 * Check if gasless transactions are enabled
 */
export function isGaslessEnabled(): boolean {
  return getGaslessConfig().gaslessListingEnabled;
}

/**
 * Check if user's wallet supports account abstraction
 */
export async function supportsAccountAbstraction(_userAddress: string): Promise<boolean> {
  try {
    const config = getGaslessConfig();
    if (!config.gaslessListingEnabled) return false;

    // Check if user has an account abstraction wallet
    // This would be implemented based on your Paymaster service
    return true;
  } catch (error) {
    console.error('Failed to check account abstraction support:', error);
    return false;
  }
}

/**
 * Get gasless listing cost estimation
 * ListingNFT transaction typically costs ~100k-150k gas on Base
 * With Paymaster, this cost can be sponsored entirely
 */
export function getGaslessListingEstimate(): {
  normalGasCost: number; // in ETH
  gaslessReduction: number; // percentage savings
  paymasterFee: number; // in ETH (if paymaster takes a cut)
  netSavings: number; // in ETH
} {
  // Typical listing gas: 120k * 0.1 gwei = 0.012 ETH
  const normalGasCost = 0.012;

  // With Paymaster, can reduce by 80-100%
  const gaslessReduction = 95; // percent

  // Paymaster fee (typically 1-5% if not free)
  const paymasterFee = 0.0001; // 0.01 USD equivalent

  return {
    normalGasCost,
    gaslessReduction,
    paymasterFee,
    netSavings: normalGasCost - paymasterFee
  };
}

/**
 * Check if address is eligible for gasless transactions
 * Could implement reputation system, tx count, etc.
 */
export async function isEligibleForGasless(_userAddress: string): Promise<boolean> {
  try {
    const config = getGaslessConfig();
    if (!config.gaslessListingEnabled) return false;

    // TODO: Implement eligibility check
    // - Check tx history
    // - Check reputation
    // - Check whitelist
    // - etc.

    return true;
  } catch (error) {
    console.error('Failed to check gasless eligibility:', error);
    return false;
  }
}

/**
 * Submit a gasless user operation
 * This would interact with your Paymaster service
 */
export async function submitGaslessUserOperation(
  userOp: GaslessUserOperation
): Promise<{ transactionHash: string; isGasless: boolean }> {
  const config = getGaslessConfig();

  if (!config.gaslessListingEnabled) {
    throw new Error('Gasless transactions are not enabled');
  }

  try {
    const response = await fetch(`${config.paymasterUrl}/v1/sendUserOperation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userOperation: userOp,
        entrypoint: config.entryPointAddress
      })
    });

    if (!response.ok) {
      throw new Error(`Paymaster error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      transactionHash: data.transactionHash || data.userOpHash,
      isGasless: true
    };
  } catch (error) {
    console.error('Failed to submit gasless operation:', error);
    throw error;
  }
}

/**
 * Feature flag for gasless UI elements
 */
export const GASLESS_FEATURES = {
  showGaslessToggle: isGaslessEnabled(),
  showGaslessBadges: isGaslessEnabled(),
  promoteGaslessFirstTime: true,
  gaslessListingBonus: 'Free gas on first 5 listings!'
};

/**
 * Fallback to normal transaction if gasless fails
 * Graceful degradation pattern
 */
export async function transactionWithFallback(
  normalTxFunction: () => Promise<string>,
  gaslessTxFunction: () => Promise<string>
): Promise<{ hash: string; isGasless: boolean }> {
  try {
    if (isGaslessEnabled()) {
      const hash = await gaslessTxFunction();
      return { hash, isGasless: true };
    }
  } catch (error) {
    console.warn('Gasless transaction failed, falling back to normal:', error);
  }

  // Fallback to normal transaction
  const hash = await normalTxFunction();
  return { hash, isGasless: false };
}
