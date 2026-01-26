import React, { useState } from 'react';
import { useModerationCases, useAdminActions } from '../../hooks/useAdmin';

interface ModerateNFTProps {
  onModerate?: (nftId: string) => void;
}

export const ModerateNFT: React.FC<ModerateNFTProps> = ({ onModerate }) => {
  const { cases, loading, refetch } = useModerationCases(50);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolution, setResolution] = useState<'approved' | 'rejected'>('approved');
  const [action, setAction] = useState('none');

  const handleResolve = async () => {
    if (!selectedCase) return;
    try {
      await useAdminActions.resolveModerationCase(selectedCase.id, resolution, action);
      setShowModal(false);
      setSelectedCase(null);
      refetch();
      onModerate?.(selectedCase.nft_id);
    } catch (error) {
      console.error('Resolution failed:', error);
    }
  };

  if (loading) return <div className="p-4">Loading moderation cases...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🖼️ NFT Moderation</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
            {cases.length} Pending
          </span>
          <button onClick={() => refetch()} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
            Refresh
          </button>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="p-4 bg-gray-100 rounded text-center text-gray-600">
          No pending moderation cases
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((modCase: any) => (
            <div
              key={modCase.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedCase(modCase);
                setShowModal(true);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-sm">NFT: {modCase.nft_id.slice(0, 12)}</div>
                  <div className="text-sm text-gray-600">Reason: {modCase.reason}</div>
                  {modCase.description && <div className="text-xs text-gray-500 mt-1">{modCase.description}</div>}
                  <div className="text-xs text-gray-400 mt-2">{new Date(modCase.created_at).toLocaleString()}</div>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  {modCase.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {showModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Resolve Moderation Case</h3>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">NFT ID:</p>
                <p className="font-mono text-xs p-2 bg-gray-100 rounded">{selectedCase.nft_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reason: {selectedCase.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="approved">✓ Approved (Take Action)</option>
                  <option value="rejected">✗ Rejected (No Action)</option>
                </select>
              </div>
              {resolution === 'approved' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Action</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="warning">Warning</option>
                    <option value="delisted">Delist</option>
                    <option value="deleted">Delete</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleResolve}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resolve
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCase(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerateNFT;
