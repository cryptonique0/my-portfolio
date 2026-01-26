import WalletConnectProvider from '@walletconnect/web3-provider';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

export interface WalletConnectConfig {
  projectId: string;
  chains: number[];
  methods: string[];
  events: string[];
}

class WalletConnectManager {
  private provider: WalletConnectProvider | null = null;
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  async initialize(): Promise<WalletConnectProvider> {
    if (this.provider) {
      return this.provider;
    }

    this.provider = new WalletConnectProvider({
      projectId: this.projectId,
      chains: [1, 137, 56], // Ethereum mainnet, Polygon, BSC
      showQrModal: true,
      rpcMap: {
        1: 'https://eth.llamarpc.com',
        137: 'https://polygon.llamarpc.com',
      },
      metadata: {
        name: 'AirStack - Token Airdrop System',
        description: 'Efficient token distribution platform on Stacks',
        url: 'https://airstack.io',
        icons: ['https://airstack.io/icon.png'],
      },
    });

    await this.provider.enable();
    return this.provider;
  }

  async connect(): Promise<string[]> {
    if (!this.provider) {
      await this.initialize();
    }

    try {
      const accounts = await this.provider!.enable();
      return accounts;
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
  }

  getProvider(): WalletConnectProvider | null {
    return this.provider;
  }

  isConnected(): boolean {
    return this.provider?.connected ?? false;
  }

  getAccounts(): string[] {
    return this.provider?.accounts ?? [];
  }

  getChainId(): number {
    return this.provider?.chainId ?? 1;
  }
}

export const walletConnectManager = new WalletConnectManager(
  process.env.VITE_WALLETCONNECT_PROJECT_ID || ''
);
