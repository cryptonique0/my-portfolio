import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import CollectionsManager from '../components/collections/CollectionsManager';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsByCollection, setItemsByCollection] = useState<Record<string, any[]>>({});
  const [removing, setRemoving] = useState<{ collectionId: string; nftId: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const token = localStorage.getItem('authToken');
  const addNotification = useNotificationStore((s) => s.addNotification);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/user-collections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollections(res.data.data || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const next: Record<string, any[]> = {};
      for (const c of collections) {
        try {
          const res = await axios.get(`${API_URL}/api/user-collections/${c.id}/items`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          next[c.id] = res.data.data || [];
        } catch (err) {
          next[c.id] = [];
        }
      }
      setItemsByCollection(next);
    };
    if (collections.length > 0) fetchItems();
  }, [collections]);

  const removeFromCollection = async (collectionId: string, nftId: string) => {
    try {
      setRemoving({ collectionId, nftId });
      await axios.delete(`${API_URL}/api/user-collections/${collectionId}/items/${nftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItemsByCollection((prev) => {
        const cloned = { ...prev };
        cloned[collectionId] = (cloned[collectionId] || []).filter((i: any) => (i.nft_id || i.nftId || i.id) !== nftId);
        return cloned;
      });
      addNotification({ type: 'success', title: 'Removed', message: 'Item removed from collection.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Remove Failed', message: 'Could not remove item.' });
    } finally {
      setRemoving(null);
      setConfirmOpen(false);
    }
  };

  const requestRemove = (collectionId: string, nftId: string) => {
    setRemoving({ collectionId, nftId });
    setConfirmOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collections</h1>
        <button onClick={fetchCollections} className="px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Refresh</button>
      </div>

      <CollectionsManager />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Collections</h3>
        {loading ? (
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading...</p>
        ) : collections.length === 0 ? (
          <p className="mt-3 text-gray-600 dark:text-gray-400">No collections yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {collections.map((c: any) => {
              const items = itemsByCollection[c.id] || [];
              const thumbs = items.slice(0, 3);
              return (
                <div key={c.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                      {c.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">{c.description}</div>
                      )}
                      {Array.isArray(c.tags) && c.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {c.tags.map((t: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">#{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Items: {items.length}</div>
                    </div>
                    <Link to={`/collections/${c.id}`} className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Open</Link>
                  </div>
                  {thumbs.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {thumbs.map((it: any, i: number) => {
                        const id = it.nft_id || it.nftId || it.id;
                        return (
                          <div key={i} className="relative group">
                            <img src={it.nft_image || it.image} alt={it.nft_name || it.name || 'NFT'} className="w-16 h-16 object-cover rounded" />
                            <button
                              onClick={() => requestRemove(c.id, String(id))}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                              title="Remove"
                              disabled={!!removing && removing.collectionId === c.id && removing.nftId === String(id)}
                            >
                              {removing && removing.collectionId === c.id && removing.nftId === String(id) ? '…' : '×'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {confirmOpen && removing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remove Item</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to remove this item from the collection?</p>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg">Cancel</button>
              <button onClick={() => removeFromCollection(removing.collectionId, removing.nftId)} disabled={!!removing} className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
