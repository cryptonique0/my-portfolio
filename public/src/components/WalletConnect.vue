<template>
  <div class="wallet-container">
    <!-- Wallet Info Display -->
    <div v-if="isConnected" class="wallet-info">
      <div class="wallet-header">
        <h3>Connected Wallet</h3>
        <button @click="handleDisconnect" class="disconnect-btn">Disconnect</button>
      </div>
      <div class="wallet-details">
        <div class="detail-row">
          <span class="label">Wallet:</span>
          <span class="value">{{ walletInfo.walletName }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Address:</span>
          <span class="value mono">{{ truncateAddress(walletInfo.address) }}</span>
          <button @click="copyAddress" class="copy-btn" title="Copy address">📋</button>
        </div>
        <div class="detail-row">
          <span class="label">Balance:</span>
          <span class="value">{{ walletInfo.balance.toFixed(4) }} STX</span>
        </div>
      </div>
    </div>

    <!-- Connect Wallet Button -->
    <div v-else class="wallet-selector">
      <button @click="toggleWalletList" class="connect-btn">
        🔗 Connect Wallet
      </button>

      <!-- Wallet Selection Dropdown -->
      <div v-if="showWalletList" class="wallet-list">
        <h4>Select a Wallet</h4>
        <div
          v-for="wallet in supportedWallets"
          :key="wallet.id"
          class="wallet-option"
          @click="selectWallet(wallet.id)"
        >
          <span class="wallet-icon">{{ wallet.icon }}</span>
          <div class="wallet-details">
            <div class="wallet-name">{{ wallet.name }}</div>
            <div class="wallet-desc">{{ wallet.description }}</div>
          </div>
          <span class="arrow">→</span>
        </div>

        <!-- WalletConnect Option -->
        <div class="divider">or connect via WalletConnect</div>
        <button @click="connectViaWalletConnect" class="walletconnect-btn">
          🌐 WalletConnect
        </button>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
    </div>

    <!-- Network Selector -->
    <div class="network-selector">
      <label>
        <input
          type="checkbox"
          v-model="isMainnet"
          @change="switchNetwork"
        />
        Use Mainnet (unchecked = Testnet)
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { walletManager } from './wallet-manager';

const showWalletList = ref(false);
const statusMessage = ref('');
const statusType = ref('info');
const isMainnet = ref(false);

const walletInfo = computed(() => walletManager.getWalletInfo().value);
const isConnected = computed(() => walletInfo.value.isConnected);
const supportedWallets = computed(() => walletManager.getSupportedWallets());

const toggleWalletList = () => {
  showWalletList.value = !showWalletList.value;
};

const selectWallet = async (walletId: string) => {
  try {
    statusMessage.value = `Connecting to ${walletId}...`;
    statusType.value = 'info';
    await walletManager.connectWallet(walletId);
    statusMessage.value = 'Wallet connected successfully!';
    statusType.value = 'success';
    showWalletList.value = false;
    setTimeout(() => (statusMessage.value = ''), 3000);
  } catch (error) {
    statusMessage.value = `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`;
    statusType.value = 'error';
  }
};

const connectViaWalletConnect = async () => {
  try {
    statusMessage.value = 'Opening WalletConnect...';
    statusType.value = 'info';
    // WalletConnect integration would go here
    console.log('WalletConnect not yet implemented');
  } catch (error) {
    statusMessage.value = `WalletConnect error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    statusType.value = 'error';
  }
};

const handleDisconnect = async () => {
  try {
    await walletManager.disconnectWallet();
    statusMessage.value = 'Wallet disconnected';
    statusType.value = 'info';
    setTimeout(() => (statusMessage.value = ''), 2000);
  } catch (error) {
    statusMessage.value = `Disconnect error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    statusType.value = 'error';
  }
};

const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const copyAddress = () => {
  navigator.clipboard.writeText(walletInfo.value.address);
  statusMessage.value = 'Address copied!';
  statusType.value = 'success';
  setTimeout(() => (statusMessage.value = ''), 2000);
};

const switchNetwork = () => {
  walletManager.setNetwork(isMainnet.value);
  statusMessage.value = `Switched to ${isMainnet.value ? 'Mainnet' : 'Testnet'}`;
  statusType.value = 'info';
  setTimeout(() => (statusMessage.value = ''), 2000);
};
</script>

<style scoped>
.wallet-container {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Wallet Info Display */
.wallet-info {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.wallet-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.disconnect-btn {
  padding: 6px 16px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;
}

.disconnect-btn:hover {
  background: #ff5252;
}

.wallet-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.value {
  color: #333;
  font-weight: 600;
  word-break: break-all;
}

.value.mono {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  transition: transform 0.2s;
}

.copy-btn:hover {
  transform: scale(1.1);
}

/* Connect Button */
.connect-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 20px;
}

.connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.connect-btn:active {
  transform: translateY(0);
}

/* Wallet Selector */
.wallet-selector {
  position: relative;
}

.wallet-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wallet-list h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wallet-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.wallet-option:hover {
  background: #efefef;
  transform: translateX(4px);
}

.wallet-icon {
  font-size: 24px;
  min-width: 30px;
}

.wallet-details {
  flex: 1;
}

.wallet-name {
  color: #333;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}

.wallet-desc {
  color: #999;
  font-size: 12px;
}

.arrow {
  color: #ccc;
  font-size: 18px;
}

.divider {
  margin: 16px 0;
  padding: 12px 0;
  text-align: center;
  color: #999;
  font-size: 13px;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.walletconnect-btn {
  width: 100%;
  padding: 12px;
  background: #3b99fc;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.walletconnect-btn:hover {
  background: #2b89ec;
}

/* Status Message */
.status-message {
  margin-top: 15px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.2s ease-out;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* Network Selector */
.network-selector {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.network-selector label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.network-selector input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

@media (max-width: 480px) {
  .wallet-container {
    margin: 10px;
    padding: 15px;
  }

  .connect-btn {
    font-size: 15px;
    padding: 14px;
  }

  .wallet-option {
    padding: 10px;
  }

  .wallet-name {
    font-size: 14px;
  }
}
</style>
