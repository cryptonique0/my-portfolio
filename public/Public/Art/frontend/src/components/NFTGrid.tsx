import React, { useEffect, useState } from 'react';
import { NFTCard } from './NFTCard';
import { nftService } from '../services/api';
import { NFT } from '../types';

export const NFTGrid: React.FC<{ category?: string }> = ({ category }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const response = await nftService.getAll(1, 20, category ? { category } : {});
        setNfts(response.nfts);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg bg-gray-200 dark:bg-gray-800 h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No NFTs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
};
