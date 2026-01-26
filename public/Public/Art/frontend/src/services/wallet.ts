import axios from 'axios';
import { config } from '../config/env';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Use config for network settings
const getNetworkConfig = (isTestnet: boolean = true) => {
  return isTestnet ? config.base.testnet : config.base.mainnet;
};

class WalletService {
  private baseSessionKey = 'bitart-base-address';
  private networkKey = 'bitart-network'; // 'testnet' or 'mainnet'
  private accountChangeListeners: ((accounts: string[]) => void)[] = [];
  private disconnectListeners: (() => void)[] = [];

  constructor() {
    this.setupAccountChangeListener();
    this.setupDisconnectListener();
  }

  /**
   * Setup listener for account changes
   */
  private setupAccountChangeListener(): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          this.disconnectWallet();
          this.disconnectListeners.forEach(listener => listener());
        } else {
          // Account changed, update session
          const newAddress = accounts[0];
          localStorage.setItem(this.baseSessionKey, newAddress);
          this.accountChangeListeners.forEach(listener => listener(accounts));
        }
      });
    }
  }

  /**
   * Setup listener for wallet disconnect
   */
  private setupDisconnectListener(): void {
    if (window.ethereum) {
      // Some wallets emit disconnect event
      window.ethereum.on('disconnect', () => {
        this.disconnectWallet();
        this.disconnectListeners.forEach(listener => listener());
      });
    }
  }

  /**
   * Register listener for account changes
   */
  onAccountChange(callback: (accounts: string[]) => void): () => void {
    this.accountChangeListeners.push(callback);
    return () => {
      this.accountChangeListeners = this.accountChangeListeners.filter((l: (accounts: string[]) => void) => l !== callback);
    };
  }

  /**
   * Register listener for wallet disconnect
   */
  onDisconnect(callback: () => void): () => void {
    this.disconnectListeners.push(callback);
    return () => {
      this.disconnectListeners = this.disconnectListeners.filter(l => l !== callback);
    };
  }

  /**
   * Get current network preference (testnet or mainnet)
   */
  getNetworkPreference(): 'testnet' | 'mainnet' {
    return (localStorage.getItem(this.networkKey) as 'testnet' | 'mainnet') || 'testnet';
  }

  /**
   * Set network preference
   */
  setNetworkPreference(network: 'testnet' | 'mainnet'): void {
    localStorage.setItem(this.networkKey, network);
  }

  /**
   * Auto-detect current wallet chain and switch to Base if needed
   */
  async autoDetectAndSwitchToBase(isTestnet: boolean = true): Promise<boolean> {
    if (!window.ethereum) {
      console.warn('No Ethereum-compatible wallet found');
      return false;
    }

    try {
      const networkConfig = getNetworkConfig(isTestnet);
      
      // Get current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const isOnCorrectChain = parseInt(chainId, 16) === networkConfig.chainId;

      if (!isOnCorrectChain) {
        // Not on correct Base network, attempt to switch
        return await this.switchToBase(isTestnet);
      }

      return true; // Already on correct Base network
    } catch (error) {
      console.error('Failed to auto-detect chain:', error);
      return false;
    }
  }

  /**
   * Switch to Base chain (testnet or mainnet)
   */
  async switchToBase(isTestnet: boolean = true): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      const networkConfig = getNetworkConfig(isTestnet);
      const chainIdHex = `0x${networkConfig.chainId.toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });
      
      this.setNetworkPreference(isTestnet ? 'testnet' : 'mainnet');
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, add it
        try {
          const networkConfig = getNetworkConfig(isTestnet);
          const chainIdHex = `0x${networkConfig.chainId.toString(16)}`;
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: networkConfig.chainName,
              rpcUrls: [networkConfig.rpcUrl],
              nativeCurrency: {
                name: networkConfig.currency,
                symbol: networkConfig.currency,
                decimals: 18
              },
              blockExplorerUrls: [networkConfig.explorer]
            }]
          });
          
          this.setNetworkPreference(isTestnet ? 'testnet' : 'mainnet');
          return true;
        } catch (addError) {
          console.error('Failed to add Base chain:', addError);
          return false;
        }
      } else if (switchError.code === 4001) {
        // User rejected
        return false;
      } else {
        console.error('Failed to switch to Base:', switchError);
        return false;
      }
    }
  }

  /**
   * Get current connected chain (always 'base' now)
   */
  async getCurrentChain(): Promise<'base' | null> {
    if (!window.ethereum) return null;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const parsedChainId = parseInt(chainId, 16);
      
      // Check if it's Base testnet (84532) or mainnet (8453)
      if (parsedChainId === 84532 || parsedChainId === 8453) {
        return 'base';
      }
      
      return null; // Not on Base
    } catch (error) {
      console.error('Failed to get current chain:', error);
      return null;
    }
  }

  /**
   * Check if wallet is installed
   */
  isWalletInstalled(): boolean {
    return !!window.ethereum;
  }

  /**
   * Connect to Base wallet (MetaMask/Coinbase Wallet/etc)
   */
  async connectBaseWallet(isTestnet: boolean = true): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('No Ethereum-compatible wallet found. Please install MetaMask or a Base-compatible wallet.');
    }

    // Auto-detect and switch to Base
    const switchedToBase = await this.autoDetectAndSwitchToBase(isTestnet);
    if (!switchedToBase) {
      throw new Error('Failed to switch to Base network. Please switch manually in your wallet.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts?.[0] || null;
    if (address) {
      localStorage.setItem(this.baseSessionKey, address);
      this.setNetworkPreference(isTestnet ? 'testnet' : 'mainnet');
    }
    return address;
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    localStorage.removeItem(this.baseSessionKey);
    localStorage.removeItem(this.networkKey);
    this.disconnectListeners.forEach(listener => listener());
  }

  /**
   * Check if user is logged in (Base only)
   */
  isUserLoggedIn(): boolean {
    return !!localStorage.getItem(this.baseSessionKey);
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const address = localStorage.getItem(this.baseSessionKey);
    if (!address) return null;

    const balance = await this.getBaseBalance(address);
    const isTestnet = this.getNetworkPreference() === 'testnet';
    
    return {
      address,
      username: null,
      chain: 'base' as const,
      balance,
      network: isTestnet ? 'testnet' : 'mainnet'
    };
  }

  /**
   * Connect wallet (Base only)
   */
  async connectWallet(isTestnet: boolean = true) {
    const address = await this.connectBaseWallet(isTestnet);
    return address ? { address, chain: 'base' as const, network: isTestnet ? 'testnet' : 'mainnet' } : null;
  }

  /**
   * Get Base balance via RPC
   */
  async getBaseBalance(address: string): Promise<string | null> {
    try {
      const isTestnet = this.getNetworkPreference() === 'testnet';
      const networkConfig = getNetworkConfig(isTestnet);
      
      const response = await axios.post(networkConfig.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest']
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const balanceHex = response.data?.result;
      if (!balanceHex) return null;
      const wei = BigInt(balanceHex);
      // Convert to ETH with 4 decimal precision for UI
      const eth = Number(wei) / 1e18;
      return eth.toFixed(4);
    } catch (error) {
      console.error('Failed to fetch Base balance', error);
      return null;
    }
  }
}

export const walletService = new WalletService();
