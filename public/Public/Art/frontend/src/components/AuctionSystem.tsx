import React, { useState, useEffect } from 'react';
import { useBlockchain, useBid } from '../hooks/useBlockchain';

interface Auction {
  id: string;
  nftName: string;
  nftImage: string;
  startingPrice: string;
  currentBid: string;
  bidsCount: number;
  seller: string;
  timeLeft: string;
  status: 'active' | 'ended' | 'settled';
}

interface BidHistory {
  bidder: string;
  amount: string;
  timestamp: number;
}

export const AuctionSystem: React.FC = () => {
  const { address, isConnected } = useBlockchain();
  const { placeBid, bidding, txHash } = useBid();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'detail' | 'create'>('browse');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auctions/active');
      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError('Failed to load auctions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAuction = async (auction: Auction) => {
    setSelectedAuction(auction);
    setActiveTab('detail');

    // Fetch bid history
    try {
      const response = await fetch(`/api/auctions/${auction.id}/bids`);
      const bids = await response.json();
      setBidHistory(bids);
    } catch (err) {
      console.error('Failed to fetch bid history:', err);
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedAuction || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= parseFloat(selectedAuction.currentBid)) {
      setError(`Bid must be higher than ${selectedAuction.currentBid}`);
      return;
    }

    try {
      setError(null);
      await placeBid(selectedAuction.id, bidAmount, {
        sendTransaction: () => Promise.resolve({ hash: '' }),
      } as any);

      // Refresh auction data
      await fetchAuctions();
      setBidAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">NFT Auctions</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-2 px-4 font-semibold transition ${
            activeTab === 'browse'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Browse Auctions
        </button>
        <button
          onClick={() => setActiveTab('create')}
          disabled={!isConnected}
          className={`pb-2 px-4 font-semibold transition ${
            activeTab === 'create'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
          }`}
        >
          Create Auction
        </button>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-800">
          Connect your wallet to participate in auctions
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* Browse Auctions Tab */}
      {activeTab === 'browse' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading auctions...</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No active auctions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <div
                  key={auction.id}
                  onClick={() => handleSelectAuction(auction)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  <img
                    src={auction.nftImage}
                    alt={auction.nftName}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{auction.nftName}</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Bid</p>
                        <p className="font-bold text-lg">{auction.currentBid} ETH</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bids</p>
                        <p className="font-bold text-lg">{auction.bidsCount}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded p-2 text-sm font-semibold text-blue-700 text-center">
                      {auction.timeLeft}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auction Detail Tab */}
      {activeTab === 'detail' && selectedAuction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NFT Image & Details */}
          <div className="lg:col-span-2">
            <img
              src={selectedAuction.nftImage}
              alt={selectedAuction.nftName}
              className="w-full rounded-lg shadow-lg mb-6"
            />

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-3xl font-bold mb-4">{selectedAuction.nftName}</h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Starting Price</p>
                  <p className="font-bold text-xl">{selectedAuction.startingPrice}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Current Bid</p>
                  <p className="font-bold text-xl text-blue-600">{selectedAuction.currentBid}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Bids Placed</p>
                  <p className="font-bold text-xl">{selectedAuction.bidsCount}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Seller:</span>
                  <span className="font-mono ml-2">{selectedAuction.seller.substring(0, 10)}...</span>
                </p>
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Bid History</h3>
              {bidHistory.length === 0 ? (
                <p className="text-gray-600">No bids yet</p>
              ) : (
                <div className="space-y-3">
                  {bidHistory.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-mono text-sm">
                          {bid.bidder.substring(0, 10)}...{bid.bidder.substring(-6)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(bid.timestamp * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold">{bid.amount} ETH</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bidding Panel */}
          <div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Place Your Bid</h3>

              {selectedAuction.status === 'ended' ? (
                <div className="bg-gray-100 rounded p-4 text-center text-gray-600 font-semibold">
                  This auction has ended
                </div>
              ) : selectedAuction.status === 'settled' ? (
                <div className="bg-green-100 rounded p-4 text-center text-green-700 font-semibold">
                  Auction settled
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Minimum Bid</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(parseFloat(selectedAuction.currentBid) + 0.001).toFixed(4)} ETH
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Your Bid Amount</label>
                    <input
                      type="number"
                      step="0.001"
                      min={parseFloat(selectedAuction.currentBid) + 0.001}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount in ETH"
                      disabled={!isConnected}
                    />
                  </div>

                  {bidAmount && (
                    <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-600">Bid Amount</p>
                      <p className="font-bold text-lg">{bidAmount} ETH</p>
                    </div>
                  )}

                  {txHash && (
                    <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Transaction Hash</p>
                      <a
                        href={`https://basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs hover:underline font-mono"
                      >
                        {txHash.substring(0, 20)}...
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handlePlaceBid}
                    disabled={!isConnected || bidding || !bidAmount}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {bidding ? 'Placing Bid...' : 'Place Bid'}
                  </button>

                  <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded">
                    <p>⏱️ Time remaining: {selectedAuction.timeLeft}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Auction Tab */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Create an Auction</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              📝 Auction creation form will be implemented with NFT selection, duration, and reserve price options
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
