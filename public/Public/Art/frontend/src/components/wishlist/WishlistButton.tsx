import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  nftId: string;
  nftName?: string;
  nftImage?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function WishlistButton({ nftId, nftName, nftImage }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/api/wishlist/check/${nftId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(res.data.data.isWishlisted);
      } catch (err) {
        // silent
      }
    };
    check();
  }, [nftId]);

  const toggleWishlist = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (isWishlisted) {
        await axios.delete(`${API_URL}/api/wishlist/${nftId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(false);
      } else {
        await axios.post(`${API_URL}/api/wishlist`, { nftId, nftName, nftImage }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(true);
      }
    } catch (err) {
      alert('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
        isWishlisted ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {isWishlisted ? '⭐ In Wishlist' : '☆ Add to Wishlist'}
    </button>
  );
}
