import React, { useState } from 'react';
import axios from 'axios';
import { useNotificationStore } from '../store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface BulkResult {
  success: boolean;
  total: number;
  succeeded?: number;
  failed?: number;
  delisted?: number;
  errors?: any[];
}

const BulkOperations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'price' | 'transfer' | 'delist'>('upload');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // Price update state
  const [priceCSV, setPriceCSV] = useState('');
  
  // Transfer state
  const [transferCSV, setTransferCSV] = useState('');
  
  // Delist state
  const [delistIds, setDelistIds] = useState('');
  
  const { addNotification } = useNotificationStore();
  
  const getAuthToken = () => localStorage.getItem('authToken');

  const handleUpload = async () => {
    if (!uploadFile) {
      addNotification({ message: 'Please select a file', type: 'error' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await axios.post(`${API_URL}/api/bulk/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
      addNotification(`Bulk upload complete: ${response.data.succeeded || 0} success, ${response.data.failed || 0} failed`, 'success');
      setUploadFile(null);
    } catch (error: any) {
      addNotification(error.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async () => {
    if (!priceCSV.trim()) {
      addNotification({ message: 'Please enter NFT IDs and prices', type: 'error' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Parse CSV (format: nftId,newPrice)
      const lines = priceCSV.trim().split('\n');
      const nfts = lines.map(line => {
        const [nftId, newPrice] = line.split(',').map(s => s.trim());
        return { nftId: Number(nftId), newPrice: Number(newPrice) };
      }).filter(item => !isNaN(item.nftId) && !isNaN(item.newPrice));

      if (nfts.length === 0) {
        addNotification({ message: 'No valid entries found', type: 'error' });
        return;
      }

      const response = await axios.post(`${API_URL}/api/bulk/price-update`, { nfts }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      setResult(response.data);
      addNotification(`Batch price update complete: ${response.data.succeeded || 0} success, ${response.data.failed || 0} failed`, 'success');
      setPriceCSV('');
    } catch (error: any) {
      addNotification(error.response?.data?.error || 'Price update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferCSV.trim()) {
      addNotification({ message: 'Please enter NFT IDs and addresses', type: 'error' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Parse CSV (format: nftId,toAddress)
      const lines = transferCSV.trim().split('\n');
      const transfers = lines.map(line => {
        const [nftId, toAddress] = line.split(',').map(s => s.trim());
        return { nftId: Number(nftId), toAddress };
      }).filter(item => !isNaN(item.nftId) && item.toAddress);

      if (transfers.length === 0) {
        addNotification({ message: 'No valid entries found', type: 'error' });
        return;
      }

      const response = await axios.post(`${API_URL}/api/bulk/transfer`, { transfers }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      setResult(response.data);
      addNotification(`Mass transfer complete: ${response.data.succeeded || 0} success, ${response.data.failed || 0} failed`, 'success');
      setTransferCSV('');
    } catch (error: any) {
      addNotification(error.response?.data?.error || 'Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelist = async () => {
    if (!delistIds.trim()) {
      addNotification({ message: 'Please enter NFT IDs', type: 'error' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Parse comma-separated IDs
      const nftIds = delistIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

      if (nftIds.length === 0) {
        addNotification({ message: 'No valid IDs found', type: 'error' });
        return;
      }

      const response = await axios.post(`${API_URL}/api/bulk/delist`, { nftIds }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      setResult(response.data);
      addNotification(`Bulk delisting complete: ${response.data.delisted} delisted`, 'success');
      setDelistIds('');
    } catch (error: any) {
      addNotification(error.response?.data?.error || 'Delist failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Operations</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium ${activeTab === 'upload' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
        >
          📦 Bulk Upload
        </button>
        <button
          onClick={() => setActiveTab('price')}
          className={`px-4 py-2 font-medium ${activeTab === 'price' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
        >
          🏷️ Batch Pricing
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 font-medium ${activeTab === 'transfer' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
        >
          📤 Mass Transfer
        </button>
        <button
          onClick={() => setActiveTab('delist')}
          className={`px-4 py-2 font-medium ${activeTab === 'delist' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
        >
          🗑️ Bulk Delist
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Bulk NFT Upload</h2>
          <p className="text-gray-600 mb-4">
            Upload CSV or JSON file with NFT data. Required fields: name, image_url. Optional: description, price, royalty_percentage.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select File (CSV/JSON)</label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || !uploadFile}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload NFTs'}
          </button>
        </div>
      )}

      {/* Price Update Tab */}
      {activeTab === 'price' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Batch Price Update</h2>
          <p className="text-gray-600 mb-4">
            Enter NFT IDs and new prices (one per line, format: nftId,price)
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">NFT ID, New Price (CSV)</label>
            <textarea
              value={priceCSV}
              onChange={(e) => setPriceCSV(e.target.value)}
              placeholder="1,100&#10;2,250&#10;3,500"
              rows={8}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handlePriceUpdate}
            disabled={loading || !priceCSV.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Prices'}
          </button>
        </div>
      )}

      {/* Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Mass Transfer</h2>
          <p className="text-gray-600 mb-4">
            Transfer multiple NFTs (one per line, format: nftId,recipientAddress)
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">NFT ID, Recipient Address (CSV)</label>
            <textarea
              value={transferCSV}
              onChange={(e) => setTransferCSV(e.target.value)}
              placeholder="1,SP1234...&#10;2,SP5678...&#10;3,SP9ABC..."
              rows={8}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={loading || !transferCSV.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Transferring...' : 'Transfer NFTs'}
          </button>
        </div>
      )}

      {/* Delist Tab */}
      {activeTab === 'delist' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Bulk Delist</h2>
          <p className="text-gray-600 mb-4">
            Remove multiple NFTs from marketplace (comma-separated IDs)
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">NFT IDs (comma-separated)</label>
            <textarea
              value={delistIds}
              onChange={(e) => setDelistIds(e.target.value)}
              placeholder="1, 2, 3, 4, 5"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleDelist}
            disabled={loading || !delistIds.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Delisting...' : 'Delist NFTs'}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className="font-bold mb-2">Operation Results</h3>
          <div className="space-y-1">
            <p>Total: {result.total}</p>
            {result.succeeded !== undefined && <p className="text-green-600">✓ Successful: {result.succeeded}</p>}
            {result.delisted !== undefined && <p className="text-green-600">✓ Delisted: {result.delisted}</p>}
            {result.failed && result.failed > 0 && <p className="text-red-600">✗ Failed: {result.failed}</p>}
            {result.errors && result.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600">View Errors</summary>
                <div className="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded text-xs">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="mb-1 text-red-600">
                      {JSON.stringify(err)}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;
