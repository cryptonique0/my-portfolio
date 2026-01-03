'use client';

import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3-config';
import { ReactNode, useState } from 'react';
import { WalletProvider } from '@/contexts/WalletContext';

/**
 * Web3 Provider Component
 * Wraps the application with Wagmi, React Query, and Wallet Context providers
 * for wallet connection, blockchain interactions, and global wallet state management
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
