"use client";

import { useState } from "react";
import { Wallet, Copy, Check, Trash2, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";

export function WalletManagement() {
  const { address } = useAccount();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [connectedWallets, setConnectedWallets] = useState([
    {
      id: 1,
      address: "0x1234567890123456789012345678901234567890",
      label: "Main Wallet",
      provider: "MetaMask",
      chainId: 8453,
      chainName: "Base",
      balance: "2.5",
      token: "ETH",
      isPrimary: true,
      connectedSince: "Jan 15, 2025",
    },
    {
      id: 2,
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      label: "Backup Wallet",
      provider: "Coinbase Wallet",
      chainId: 8453,
      chainName: "Base",
      balance: "0.8",
      token: "ETH",
      isPrimary: false,
      connectedSince: "Jan 10, 2025",
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const removeWallet = (id: number) => {
    setConnectedWallets(connectedWallets.filter(w => w.id !== id));
  };

  const setPrimaryWallet = (id: number) => {
    setConnectedWallets(
      connectedWallets.map(w => ({
        ...w,
        isPrimary: w.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Connected Wallets
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage wallets connected to your SpendGuard account
        </p>
      </div>

      {/* Connected Wallets List */}
      <div className="space-y-4">
        {connectedWallets.length > 0 ? (
          connectedWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{wallet.label}</h4>
                    {wallet.isPrimary && (
                      <span className="text-xs bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {wallet.chainName}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {wallet.provider} • Connected {wallet.connectedSince}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-xs bg-muted px-3 py-2 rounded font-mono">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(wallet.address, `wallet-${wallet.id}`)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      {copiedAddress === `wallet-${wallet.id}` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`https://basescan.org/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="text-sm font-medium">
                    Balance: <span className="text-primary">{wallet.balance} {wallet.token}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                {!wallet.isPrimary && (
                  <button
                    onClick={() => setPrimaryWallet(wallet.id)}
                    className="flex-1 px-4 py-2 text-sm bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                  >
                    Set as Primary
                  </button>
                )}
                <button
                  onClick={() => removeWallet(wallet.id)}
                  className="flex-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No wallets connected. Connect your first wallet to get started.
            </p>
          </div>
        )}
      </div>

      {/* Add Wallet */}
      <div className="pt-4 border-t border-border">
        <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          + Connect Another Wallet
        </button>
      </div>

      {/* Supported Chains */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold mb-3">Supported Blockchain Networks</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm">Base Mainnet</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span className="text-sm">Ethereum Mainnet (Coming Soon)</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-sm">Arbitrum (Coming Soon)</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-sm">Optimism (Coming Soon)</span>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Security Note:</strong> Only connect wallets that you fully control. Never share your private keys or seed phrases. SpendGuard is non-custodial and never has access to your wallet's private keys.
        </p>
      </div>
    </div>
  );
}
