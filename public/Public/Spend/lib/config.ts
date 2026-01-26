import {
    getDefaultConfig,
    Chain,
} from '@rainbow-me/rainbowkit';
import {
    base,
    baseSepolia,
} from 'wagmi/chains';

// IMPORTANT: To enable WalletConnect v2 and support more wallets,
// you must set your WalletConnect Cloud projectId below.
// Get one for free at https://cloud.walletconnect.com

// Cache the config to prevent multiple initializations
let cachedConfig: any = null;

function createConfig() {
    if (cachedConfig) {
        console.log('[config] Using cached wagmi config');
        return cachedConfig;
    }

    console.log('[config] Creating new wagmi config');
    cachedConfig = getDefaultConfig({
        appName: 'SpendGuard',
        projectId: '2c744d31bd68644ba0831658bbd2f1d6', // <-- WalletConnect Cloud projectId
        chains: [base, baseSepolia],
        ssr: true, // If your dApp uses server side rendering (SSR)
    });
    
    return cachedConfig;
}

export const config = createConfig();
