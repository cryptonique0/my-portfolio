# Wallet Integration Guide

## Overview

AirStack supports multiple Stacks wallets through a unified wallet connection interface. Users can connect their wallets to claim tokens, participate in governance, and manage their airdrops.

## Supported Wallets

### Xverse Wallet
- **Description**: Bitcoin & Stacks Wallet
- **Platform**: Web Extension
- **Features**: BTC L2 support, DeFi integration
- **Install**: [xverse.app](https://www.xverse.app)

### Leather Wallet
- **Description**: Stacks & Bitcoin Wallet
- **Platform**: Web Extension
- **Features**: Full Stacks integration, secure key management
- **Install**: [leather.io](https://leather.io)

### Hiro Wallet
- **Description**: Stacks Wallet
- **Platform**: Web Extension
- **Features**: Developer-friendly, great for testing
- **Install**: [wallet.hiro.so](https://wallet.hiro.so)

### WalletConnect
- **Description**: Universal wallet connection protocol
- **Platform**: QR Code based
- **Features**: Support for multiple wallets via single interface

## Integration Architecture

### Wallet Detection
The system automatically detects installed wallet extensions and displays them in the wallet selector:

```typescript
// Detected wallets appear in the wallet list
- Xverse (if `window.xverse` is available)
- Leather (if `window.LeatherProvider` is available)
- Hiro (if `window.hiro` is available)
- WalletConnect (always available)
```

### Connection Flow

1. User clicks "Connect Wallet"
2. Wallet selector shows available wallets
3. User selects preferred wallet
4. Wallet extension prompts for connection approval
5. Address and balance are retrieved
6. User can now interact with AirStack

### Wallet Manager API

```typescript
// Connect wallet
await walletManager.connectWallet(walletId);

// Disconnect wallet
await walletManager.disconnectWallet();

// Get wallet info
const info = walletManager.getWalletInfo();

// Switch network
walletManager.setNetwork(isMainnet);
```

## Setting Up Wallet Extension

### For Users

1. Install your preferred wallet extension:
   - [Xverse](https://www.xverse.app)
   - [Leather](https://leather.io)
   - [Hiro](https://wallet.hiro.so)

2. Create or import your Stacks account

3. Visit AirStack website and click "Connect Wallet"

4. Select your wallet from the list

5. Approve the connection in your wallet extension

### For Developers

#### Adding a New Wallet

To add support for a new Stacks wallet:

1. Create a wallet interface:
```typescript
async connectNewWallet() {
  const response = await window.newWallet?.request('getAddresses', null);
  if (response?.stxAddress) {
    this.walletInfo.value = {
      address: response.stxAddress,
      publicKey: response.publicKey || '',
      isConnected: true,
      walletName: 'New Wallet',
    };
  }
}
```

2. Add to wallet list:
```typescript
{
  id: 'new-wallet',
  name: 'New Wallet',
  icon: '🆕',
  description: 'Description of wallet',
}
```

3. Add case in `connectWallet()`:
```typescript
case 'new-wallet':
  await this.connectNewWallet();
  break;
```

## WalletConnect Configuration

### Getting Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create new project
3. Copy Project ID
4. Add to `.env.local`:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### WalletConnect Features

- QR code based connection
- Support for mobile wallets
- No extension required
- Works across different blockchains

## Handling Wallet Interactions

### Get User Balance

```typescript
const balance = walletInfo.value.balance; // in STX
```

### Get User Address

```typescript
const address = walletInfo.value.address;
```

### Switch Networks

```typescript
// Switch to mainnet
walletManager.setNetwork(true);

// Switch to testnet
walletManager.setNetwork(false);
```

## Security Best Practices

1. **Never share private keys**: The wallet extension manages keys securely
2. **Verify addresses**: Always show user their address before transactions
3. **Check network**: Ensure user is on correct network (testnet/mainnet)
4. **Confirm transactions**: Always require user confirmation for transactions
5. **Handle errors gracefully**: Provide clear error messages to users

## Testing

### Local Testing

1. Install wallet extension
2. Create testnet account
3. Request testnet STX from faucet:
   - [Stacks Testnet Faucet](https://testnet.sip10lab.com)
4. Connect wallet to localhost
5. Test airdrop claims

### Testnet Wallets

All supported wallets work on Stacks Testnet:
- Create test accounts with testnet STX
- Test without real funds
- Perfect for development

### Mainnet Testing

1. Ensure you have real STX
2. Switch to mainnet in wallet
3. Click "Use Mainnet" in AirStack
4. Connect wallet
5. Participate in real airdrops

## Troubleshooting

### Wallet Not Detected

**Problem**: Wallet extension not showing up

**Solutions**:
1. Ensure wallet is installed
2. Reload page
3. Check if wallet is enabled in extensions
4. Clear browser cache

### Connection Fails

**Problem**: "Failed to connect to wallet"

**Solutions**:
1. Restart wallet extension
2. Make sure you're on correct network
3. Check browser console for errors
4. Try different wallet

### Balance Not Updating

**Problem**: Balance shows 0 or incorrect

**Solutions**:
1. Ensure address is correct
2. Check network is correct (testnet/mainnet)
3. Wait for blockchain confirmation
4. Refresh page

### Transaction Not Processing

**Problem**: Transaction hangs or fails

**Solutions**:
1. Check network connection
2. Ensure sufficient balance for gas
3. Try with higher gas fee
4. Check wallet gas settings

## API Reference

### WalletManager

```typescript
interface WalletInfo {
  address: string;
  publicKey: string;
  balance: number;
  isConnected: boolean;
  walletName: string;
}

// Methods
connectWallet(walletId: string): Promise<void>
disconnectWallet(): Promise<void>
getWalletInfo(): ComputedRef<WalletInfo>
getSupportedWallets(): Wallet[]
setNetwork(isMainnet: boolean): void
```

### WalletConnect Manager

```typescript
initialize(): Promise<WalletConnectProvider>
connect(): Promise<string[]>
disconnect(): Promise<void>
isConnected(): boolean
getAccounts(): string[]
getChainId(): number
```

## Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Xverse Documentation](https://docs.xverse.app)
- [Leather Documentation](https://leather.io/guides)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [SIP-010 Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
