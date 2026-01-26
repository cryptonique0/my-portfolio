import { useState, useCallback, useEffect as ReactUseEffect } from 'react';
import { ethers } from 'ethers';

/**
 * Hook for blockchain interactions
 */
export const useBlockchain = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = accounts[0];
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAddress(addr);
      setChainId(Number(network.chainId));

      // Get balance
      const balance = await provider.getBalance(addr);
      setBalance(ethers.formatEther(balance));

      return { address: addr, signer, provider };
    } catch (error: any) {
      console.error('Wallet connection failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTransaction = useCallback(
    async (to: string, value: string, data?: string) => {
      if (!signer) throw new Error('Wallet not connected');

      try {
        const tx = await signer.sendTransaction({
          to,
          value: ethers.parseEther(value),
          data,
        });

        return tx.hash;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    },
    [signer]
  );

  const estimateGas = useCallback(
    async (to: string, value: string, data?: string) => {
      if (!provider) throw new Error('Provider not initialized');

      try {
        const estimate = await provider.estimateGas({
          to,
          value: ethers.parseEther(value),
          data,
        });

        return estimate.toString();
      } catch (error) {
        console.error('Gas estimation failed:', error);
        throw error;
      }
    },
    [provider]
  );

  return {
    provider,
    signer,
    address,
    chainId,
    balance,
    loading,
    connectWallet,
    sendTransaction,
    estimateGas,
    isConnected: !!address,
  };
};

/**
 * Hook for NFT minting
 */
export const useMintNFT = () => {
  const [minting, setMinting] = useState(false);
  const [progress, setProgress] = useState<{
    step: 'preparing' | 'uploading' | 'minting' | 'confirming' | 'complete';
    message: string;
    hash?: string;
  } | null>(null);

  const mint = useCallback(
    async (
      contractAddress: string,
      metadata: { name: string; description: string; imageUrl: string },
      signer: ethers.Signer
    ) => {
      setMinting(true);
      setProgress({ step: 'preparing', message: 'Preparing metadata...' });

      try {
        // Step 1: Prepare metadata
        setProgress({ step: 'uploading', message: 'Uploading to IPFS...' });
        const response = await fetch('/api/minting/prepare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metadata, contractAddress }),
        });
        const { metadataIPFS } = await response.json();

        // Step 2: Send mint transaction
        setProgress({ step: 'minting', message: 'Minting NFT...' });
        const tx = await signer.sendTransaction({
          to: contractAddress,
          data: '0x', // Mock - implement actual contract call
          value: '0',
        });

        const hash = tx.hash;
        setProgress({ step: 'confirming', message: 'Confirming transaction...', hash });

        // Step 3: Wait for confirmation
        await tx.wait(1);
        setProgress({ step: 'complete', message: 'NFT minted successfully!', hash });

        return { hash, metadataIPFS };
      } catch (error: any) {
        console.error('Mint failed:', error);
        throw error;
      } finally {
        setMinting(false);
      }
    },
    []
  );

  return { mint, minting, progress };
};

/**
 * Hook for buy/sell operations
 */
export const useBuySell = () => {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const buy = useCallback(
    async (
      listingId: string,
      price: string,
      signer: ethers.Signer
    ) => {
      setLoading(true);
      try {
        // In production, call marketplace contract
        const tx = await signer.sendTransaction({
          to: 'MARKETPLACE_CONTRACT', // Replace with actual
          value: ethers.parseEther(price),
          data: '0x', // Mock
        });

        setTxHash(tx.hash);
        await tx.wait(1);
        return tx.hash;
      } catch (error) {
        console.error('Buy failed:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sell = useCallback(
    async (
      nftAddr: string,
      tokenIdStr: string,
      priceStr: string,
      signer: ethers.Signer
    ) => {
      setLoading(true);
      try {
        // In production, call marketplace contract list function
        const tx = await signer.sendTransaction({
          to: 'MARKETPLACE_CONTRACT', // Replace with actual
          data: '0x', // Mock
          value: '0',
        });

        setTxHash(tx.hash);
        await tx.wait(1);
        return tx.hash;
      } catch (error) {
        console.error('Sell failed:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { buy, sell, loading, txHash };
};

/**
 * Hook for auction bidding
 */
export const useBid = () => {
  const [bidding, setBidding] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const placeBid = useCallback(
    async (
      auctionId: string,
      bidAmount: string,
      signer: ethers.Signer
    ) => {
      setBidding(true);
      try {
        const tx = await signer.sendTransaction({
          to: 'AUCTION_CONTRACT', // Replace with actual
          value: ethers.parseEther(bidAmount),
          data: '0x', // Mock
        });

        setTxHash(tx.hash);
        
        // Track transaction
        await fetch('/api/transactions/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hash: tx.hash,
            type: 'bid',
            auctionId,
            amount: bidAmount,
          }),
        });

        await tx.wait(1);
        return tx.hash;
      } catch (error) {
        console.error('Bid failed:', error);
        throw error;
      } finally {
        setBidding(false);
      }
    },
    []
  );

  return { placeBid, bidding, txHash };
};

/**
 * Hook for transaction status tracking
 */
export const useTransactionStatus = (hash: string | null) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(!!hash);

  const pollStatus = useCallback(async () => {
    if (!hash) return;

    try {
      const response = await fetch(`/api/transactions/${hash}/status`);
      const data = await response.json();

      setStatus(data.status);
      setDetails(data);

      if (data.status !== 'pending') {
        setLoading(false);
      }
    } catch (error) {
      console.error('Status poll failed:', error);
    }
  }, [hash]);

  // Poll every 5 seconds
  ReactUseEffect(() => {
    if (!hash) return;

    const interval = setInterval(pollStatus, 5000);
    pollStatus(); // Initial poll

    return () => clearInterval(interval);
  }, [hash, pollStatus]);

  return { status, details, loading };
};
