import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

/**
 * Public client for reading contract state from the blockchain
 * Used in API routes and server-side operations
 */
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});
