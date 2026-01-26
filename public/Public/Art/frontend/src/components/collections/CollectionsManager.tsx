import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Collection {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

interface Props {
  initialNftId?: string;
  initialNftName?: string;
  initialNftImage?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CollectionsManager({ initialNftId, initialNftName, initialNftImage }: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('authToken');

  const fetchCollections = async () => {
    const res = await axios.get(`${API_URL}/api/user-collections`, { headers: { Authorization: `Bearer ${token}` } });
    setCollections(res.data.data || []);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const createCollection = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/user-collections`, {
        name,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setName(''); setDescription(''); setTags('');
      setCollections([res.data.data, ...collections]);
    } catch (err) {
      alert('Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const addToCollection = async (collectionId: string) => {
    if (!initialNftId) return;
    try {
      await axios.post(`${API_URL}/api/user-collections/${collectionId}/items`, {
        nftId: initialNftId,
        nftName: initialNftName,
        nftImage: initialNftImage
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Added to collection');
    } catch (err) {
      alert('Failed to add to collection');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Collection</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mt-3">
          <button onClick={createCollection} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Create Collection
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Collections</h3>
        {collections.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 mt-2">No collections yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {collections.map(c => (
              <div key={c.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                    {c.description && <div className="text-sm text-gray-600 dark:text-gray-400">{c.description}</div>}
                    {c.tags && c.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.tags.map((t, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {initialNftId && (
                    <button onClick={() => addToCollection(c.id)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Add NFT
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
