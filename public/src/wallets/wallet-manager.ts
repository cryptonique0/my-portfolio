import { ref, computed } from 'vue';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { connect, disconnect, showBlockstackConnect } from '@stacks/connect';
import { userSessionState } from '@stacks/auth';

export interface WalletInfo {
  address: string;
  publicKey: string;
  balance: number;
  isConnected: boolean;
  walletName: string;
}

class WalletManager {
  private walletInfo = ref<WalletInfo>({
    address: '',
    publicKey: '',
    balance: 0,
    isConnected: false,
    walletName: '',
  });

  private network = new StacksMainnet();
  private userSession = userSessionState();

  // Supported wallets
  private supportedWallets = [
    {
      id: 'xverse',
      name: 'Xverse',
      icon: '🔐',
      description: 'Bitcoin & Stacks Wallet',
    },
    {
      id: 'leather',
      name: 'Leather',
      icon: '👜',
      description: 'Stacks & Bitcoin Wallet',
    },
    {
      id: 'hiro',
      name: 'Hiro Wallet',
      icon: '🚀',
      description: 'Stacks Wallet',
    },
    {
      id: 'stacks-connect',
      name: 'Stacks Connect',
      icon: '🔌',
      description: 'Universal Stacks Wallet',
    },
  ];

  getWalletInfo() {
    return computed(() => this.walletInfo.value);
  }

  getSupportedWallets() {
    return this.supportedWallets;
  }

  async connectWithStacksConnect() {
    try {
      await connect({
        onFinish: () => {
          this.updateWalletInfo();
        },
        onCancel: () => {
          console.log('Connection cancelled');
        },
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async connectXverse() {
    try {
      const response = await window.xverse?.request('getAddresses', null);
      if (response?.stxAddress) {
        this.walletInfo.value = {
          address: response.stxAddress,
          publicKey: response.publicKey || '',
          balance: 0,
          isConnected: true,
          walletName: 'Xverse',
        };
        await this.fetchBalance();
      }
    } catch (error) {
      console.error('Error connecting to Xverse:', error);
      throw error;
    }
  }

  async connectLeather() {
    try {
      const response = await window.LeatherProvider?.request('getAddresses', null);
      if (response?.stxAddress) {
        this.walletInfo.value = {
          address: response.stxAddress,
          publicKey: response.publicKey || '',
          balance: 0,
          isConnected: true,
          walletName: 'Leather',
        };
        await this.fetchBalance();
      }
    } catch (error) {
      console.error('Error connecting to Leather:', error);
      throw error;
    }
  }

  async connectWallet(walletId: string) {
    try {
      switch (walletId) {
        case 'xverse':
          await this.connectXverse();
          break;
        case 'leather':
          await this.connectLeather();
          break;
        case 'stacks-connect':
        default:
          await this.connectWithStacksConnect();
          break;
      }
    } catch (error) {
      console.error(`Failed to connect ${walletId}:`, error);
      throw error;
    }
  }

  async disconnectWallet() {
    try {
      await disconnect();
      this.walletInfo.value = {
        address: '',
        publicKey: '',
        balance: 0,
        isConnected: false,
        walletName: '',
      };
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  private async updateWalletInfo() {
    if (this.userSession.isUserSignedIn()) {
      const userData = this.userSession.userData();
      this.walletInfo.value.address = userData.profile.stxAddress.mainnet;
      this.walletInfo.value.publicKey = userData.profile.publicKey;
      this.walletInfo.value.isConnected = true;
      await this.fetchBalance();
    }
  }

  private async fetchBalance() {
    try {
      const response = await fetch(
        `${this.network.getCoreApiUrl()}/v2/accounts/${this.walletInfo.value.address}`
      );
      const data = await response.json();
      this.walletInfo.value.balance = parseInt(data.balance) / 1000000; // Convert to STX
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }

  setNetwork(isMainnet: boolean) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
  }
}

export const walletManager = new WalletManager();
