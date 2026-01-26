import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { analyticsService, nftService } from '../services/api';
import { useNotificationStore } from '../store';
import { Button } from '../components/Button';

export const CreatePage: React.FC = () => {
  const { user } = useWallet();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'art',
    royaltyPercentage: 0,
    imageFile: null as File | null
  });
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [overview, setOverview] = useState<any | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'royaltyPercentage' ? parseInt(value) : value
    });
  };

  useEffect(() => {
    const loadOverview = async () => {
      if (!user.address) return;
      try {
        const data = await analyticsService.getCreatorOverview(user.address);
        setOverview(data);
      } catch {
        // Non-blocking for creation flow
      }
    };

    loadOverview();
  }, [user.address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.isConnected) {
      addNotification({
        type: 'error',
        title: 'Not Connected',
        message: 'Please connect your wallet first'
      });
      return;
    }

    if (!formData.imageFile) {
      addNotification({
        type: 'error',
        title: 'Missing Image',
        message: 'Please upload an image'
      });
      return;
    }

    try {
      setLoading(true);

      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('royaltyPercentage', formData.royaltyPercentage.toString());
      uploadFormData.append('imageFile', formData.imageFile);

      await nftService.create(uploadFormData, user.address || '');

      addNotification({
        type: 'success',
        title: 'NFT Created',
        message: 'Your NFT has been created successfully. You can now mint it on the blockchain.'
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'art',
        royaltyPercentage: 0,
        imageFile: null
      });
      setPreview(null);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create NFT'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Create New NFT
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Upload your artwork and set the details. You'll be able to mint it on the blockchain.
        </p>

        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">30d Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.last30d.volume} ETH</p>
              <p className="text-xs text-gray-500">{overview.last30d.sales} sales · avg {overview.last30d.avgPrice} ETH</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Collectors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.totals.collectors}</p>
              <p className="text-xs text-gray-500">Listed: {overview.totals.listed} · Volume: {overview.totals.volume} ETH</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Artwork Image
            </label>
            <div className="relative">
              {preview ? (
                <div className="relative w-full">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setFormData({ ...formData, imageFile: null });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-6-8l-4 4m0 0l-4-4m4 4v12m-12-8h20"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Drag and drop or click to select
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter NFT name"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your artwork"
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="art">Art</option>
              <option value="collectibles">Collectibles</option>
              <option value="sports">Sports</option>
              <option value="digital-items">Digital Items</option>
              <option value="music">Music</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Royalty */}
          <div>
            <label htmlFor="royaltyPercentage" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Creator Royalty ({formData.royaltyPercentage}%)
            </label>
            <input
              type="range"
              id="royaltyPercentage"
              name="royaltyPercentage"
              min="0"
              max="25"
              step="1"
              value={formData.royaltyPercentage}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              You'll receive {formData.royaltyPercentage}% of the price on every resale
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create NFT'}
          </Button>
        </form>
      </div>
    </div>
  );
};
