import React, { useState } from 'react';
import { useBlockchain, useMintNFT } from '../hooks/useBlockchain';

interface MintFormData {
  name: string;
  description: string;
  image: File | null;
  royaltyPercentage: number;
  attributes: Array<{ trait: string; value: string }>;
}

export const MintNFT: React.FC = () => {
  const { address, signer, connectWallet, isConnected } = useBlockchain();
  const { mint, minting, progress } = useMintNFT();
  const [formData, setFormData] = useState<MintFormData>({
    name: '',
    description: '',
    image: null,
    royaltyPercentage: 0,
    attributes: [],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ hash: string; metadataIPFS: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { trait: '', value: '' }],
    });
  };

  const handleAttributeChange = (index: number, field: 'trait' | 'value', value: string) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.image) {
      setError('Name and image are required');
      return;
    }

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const imageData = reader.result as string;

        const metadata = {
          name: formData.name,
          description: formData.description,
          imageUrl: imageData, // In production, upload to IPFS first
          attributes: formData.attributes.filter(a => a.trait && a.value),
          royaltyPercentage: formData.royaltyPercentage,
        };

        const result = await mint(
          process.env.REACT_APP_NFT_CONTRACT || '',
          metadata,
          signer!
        );

        setSuccess(result);
        setFormData({
          name: '',
          description: '',
          image: null,
          royaltyPercentage: 0,
          attributes: [],
        });
        setPreviewUrl(null);
      };
      reader.readAsDataURL(formData.image);
    } catch (err: any) {
      setError(err.message || 'Minting failed');
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Mint NFT</h1>
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Connect Wallet to Mint
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-green-50 rounded-lg shadow border border-green-200">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">NFT Minted Successfully!</h2>
          <div className="space-y-2 text-sm text-gray-700 mb-6">
            <p>
              <span className="font-semibold">Transaction Hash:</span>
              <a
                href={`https://basescan.org/tx/${success.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                {success.hash.substring(0, 10)}...{success.hash.substring(-8)}
              </a>
            </p>
            <p>
              <span className="font-semibold">Metadata IPFS:</span>
              <span className="ml-2 font-mono text-xs">{success.metadataIPFS}</span>
            </p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Mint Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-2">Mint NFT</h1>
      <p className="text-gray-600 mb-6">Create and mint a new NFT on the blockchain</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">NFT Image *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
            {previewUrl ? (
              <div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto mb-4 rounded"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className="text-blue-600 cursor-pointer hover:underline"
                >
                  Change Image
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="text-4xl mb-2">📸</div>
                  <p className="font-semibold text-gray-700">Click to upload image</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">NFT Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., My Awesome Art"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Royalty Percentage</label>
            <input
              type="number"
              value={formData.royaltyPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  royaltyPercentage: Math.min(100, Math.max(0, Number(e.target.value))),
                })
              }
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0-100"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Tell us about your NFT..."
          />
        </div>

        {/* Attributes */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold">Attributes (Traits)</label>
            <button
              type="button"
              onClick={handleAddAttribute}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Attribute
            </button>
          </div>

          <div className="space-y-2">
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Trait (e.g., Color)"
                  value={attr.trait}
                  onChange={(e) => handleAttributeChange(index, 'trait', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., Red)"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        {progress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-spin">⚙️</div>
              <span className="font-semibold text-blue-900">{progress.message}</span>
            </div>
            {progress.hash && (
              <p className="text-sm text-blue-700 font-mono">
                {progress.hash.substring(0, 20)}...
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={minting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {minting ? 'Minting...' : 'Mint NFT'}
        </button>

        {/* Account Info */}
        <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
          <p>
            <span className="font-semibold">Connected Account:</span>
            <span className="ml-2 font-mono">{address?.substring(0, 10)}...{address?.substring(-8)}</span>
          </p>
        </div>
      </form>
    </div>
  );
};
