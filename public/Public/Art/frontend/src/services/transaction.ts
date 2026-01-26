/**
 * Transaction handling service
 * Manages transaction lifecycle, status tracking, and BaseScan integration
 */

import { getTransactionLink } from './basescan';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface Transaction {
  hash: string;
  status: TransactionStatus;
  type: 'mint' | 'list' | 'buy' | 'auction' | 'bid' | 'approve';
  description: string;
  timestamp: number;
  from: string;
  to?: string;
  value?: string; // in ETH
  error?: string;
  blockNumber?: number;
  gasUsed?: string;
}

export interface TransactionCallback {
  onPending?: (tx: Transaction) => void;
  onSuccess?: (tx: Transaction) => void;
  onError?: (tx: Transaction, error: string) => void;
  onConfirm?: (tx: Transaction, blockNumber: number) => void;
}

class TransactionService {
  private transactions: Map<string, Transaction> = new Map();
  private statusListeners: Map<string, ((tx: Transaction) => void)[]> = new Map();
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new transaction record
   */
  createTransaction(
    hash: string,
    type: Transaction['type'],
    description: string,
    from: string,
    to?: string,
    value?: string
  ): Transaction {
    const tx: Transaction = {
      hash,
      status: 'pending',
      type,
      description,
      timestamp: Date.now(),
      from,
      to,
      value
    };

    this.transactions.set(hash, tx);
    this.notifyListeners(hash, tx);

    return tx;
  }

  /**
   * Get transaction by hash
   */
  getTransaction(hash: string): Transaction | undefined {
    return this.transactions.get(hash);
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(
    hash: string,
    status: TransactionStatus,
    error?: string,
    blockNumber?: number
  ): Transaction | undefined {
    const tx = this.transactions.get(hash);
    if (!tx) return undefined;

    tx.status = status;
    if (error) tx.error = error;
    if (blockNumber) tx.blockNumber = blockNumber;

    this.notifyListeners(hash, tx);

    // Stop polling on final status
    if (status === 'success' || status === 'failed' || status === 'cancelled') {
      this.stopPolling(hash);
    }

    return tx;
  }

  /**
   * Poll transaction status on Base RPC
   */
  async pollTransactionStatus(
    hash: string,
    maxPolls: number = 60,
    pollInterval: number = 1000
  ): Promise<Transaction | undefined> {
    const rpcUrl = 'https://mainnet.base.org';
    let pollCount = 0;

    const poll = async () => {
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [hash]
          })
        });

        const data = await response.json();
        const receipt = data.result;

        if (receipt) {
          // Transaction mined
          const status = receipt.status === '0x1' ? 'success' : 'failed';
          this.updateTransactionStatus(hash, status, undefined, parseInt(receipt.blockNumber, 16));
          return this.getTransaction(hash);
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          // Timeout - mark as pending
          console.warn(`Transaction ${hash} still pending after ${maxPolls * pollInterval}ms`);
          return this.getTransaction(hash);
        }
      } catch (error) {
        console.error('Failed to poll transaction status:', error);
      }
    };

    // Start polling
    const interval = setInterval(poll, pollInterval);
    this.pollIntervals.set(hash, interval);

    // Initial check
    await poll();

    return this.getTransaction(hash);
  }

  /**
   * Stop polling for a transaction
   */
  stopPolling(hash: string): void {
    const interval = this.pollIntervals.get(hash);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(hash);
    }
  }

  /**
   * Get BaseScan link for transaction
   */
  getBaseScanLink(hash: string): string {
    return getTransactionLink(hash).url;
  }

  /**
   * Get transaction display message
   */
  getTransactionMessage(tx: Transaction): { title: string; message: string } {
    const messages: Record<Transaction['type'], { verb: string; noun: string }> = {
      mint: { verb: 'Minted', noun: 'NFT' },
      list: { verb: 'Listed', noun: 'NFT for sale' },
      buy: { verb: 'Purchased', noun: 'NFT' },
      auction: { verb: 'Created', noun: 'auction' },
      bid: { verb: 'Placed bid on', noun: 'NFT' },
      approve: { verb: 'Approved', noun: 'contract' }
    };

    const typeMsg = messages[tx.type];
    const basePart = `${typeMsg.verb} ${typeMsg.noun}`;

    switch (tx.status) {
      case 'pending':
        return {
          title: `${basePart}...`,
          message: `Transaction pending: ${tx.description}`
        };
      case 'success':
        return {
          title: `✅ ${basePart}!`,
          message: `Transaction confirmed on Base Mainnet`
        };
      case 'failed':
        return {
          title: `❌ ${basePart} failed`,
          message: tx.error || 'Transaction was reverted'
        };
      case 'cancelled':
        return {
          title: `⊘ ${basePart} cancelled`,
          message: 'Transaction was cancelled'
        };
    }
  }

  /**
   * Register listener for transaction status updates
   */
  onTransactionStatusChange(
    hash: string,
    callback: (tx: Transaction) => void
  ): () => void {
    if (!this.statusListeners.has(hash)) {
      this.statusListeners.set(hash, []);
    }

    const listeners = this.statusListeners.get(hash)!;
    listeners.push(callback);

    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }

  /**
   * Notify all listeners of transaction status change
   */
  private notifyListeners(hash: string, tx: Transaction): void {
    const listeners = this.statusListeners.get(hash);
    if (listeners) {
      listeners.forEach(listener => listener(tx));
    }
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).filter(tx => tx.status === 'pending');
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit: number = 10): Transaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear old transactions
   */
  clearOldTransactions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    for (const [hash, tx] of this.transactions) {
      if (tx.timestamp < cutoff) {
        this.transactions.delete(hash);
      }
    }
  }
}

export const transactionService = new TransactionService();
