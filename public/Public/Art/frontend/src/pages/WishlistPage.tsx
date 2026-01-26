import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function WishlistPage() {
  const { isConnected } = useWallet();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('authToken');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.data || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) fetchWishlist();
  }, [isConnected]);

  const removeItem = async (item: any) => {
    try {
      const id = item.nft_id || item.nftId || item.id;
      await axios.delete(`${API_URL}/api/wishlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.filter((i) => (i.nft_id || i.nftId || i.id) !== id));
    } catch (err) {
      alert('Failed to remove from wishlist');
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Connect your wallet to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
        <button onClick={fetchWishlist} className="px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Refresh</button>
      </div>

      {loading ? (
        <p className="mt-6 text-gray-600 dark:text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-gray-600 dark:text-gray-400">No items in your wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {items.map((item) => {
            const id = item.nft_id || item.nftId || item.id;
            const name = item.nft_name || item.nftName || item.name || `NFT ${String(id).slice(0, 8)}...`;
            const image = item.nft_image || item.nftImage || item.image;
            return (
              <div key={id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                {image && (
                  <img src={image} alt={name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
                    <Link to={`/nft/${id}`} className="text-sm text-purple-600 dark:text-purple-400 hover:underline">View details</Link>
                  </div>
                  <button onClick={() => removeItem(item)} className="text-sm text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
