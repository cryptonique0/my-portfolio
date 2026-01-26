import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface VerificationRequest {
  id: string;
  userId: string;
  username?: string;
  type: 'creator' | 'influencer' | 'business' | 'developer';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  socialProof: string[];
  portfolioLinks: string[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface VerificationStats {
  totalVerified: number;
  pendingRequests: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  byType: {
    creator: number;
    influencer: number;
    business: number;
    developer: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function VerificationManagement() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch pending requests (you'll need to create an admin route for this)
      const requestsRes = await axios.get(`${API_URL}/api/admin/verification/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requestsRes.data);

      // Fetch stats (you'll need to create an admin route for this)
      const statsRes = await axios.get(`${API_URL}/api/admin/verification/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this verification request?')) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post(
        `${API_URL}/api/admin/verification/${requestId}/approve`,
        { notes: reviewNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(requests.filter(r => r.id !== requestId));
      setSelectedRequest(null);
      setReviewNotes('');
      await fetchData();
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve verification request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!reviewNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Are you sure you want to reject this verification request?')) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post(
        `${API_URL}/api/admin/verification/${requestId}/reject`,
        { notes: reviewNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(requests.filter(r => r.id !== requestId));
      setSelectedRequest(null);
      setReviewNotes('');
      await fetchData();
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject verification request');
    } finally {
      setProcessing(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      creator: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      influencer: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      developer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Verified</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.totalVerified}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">
              {stats.pendingRequests}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved This Month</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {stats.approvedThisMonth}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected This Month</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {stats.rejectedThisMonth}
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Pending Verification Requests
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-600 dark:text-gray-400">No pending verification requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {request.username || request.userId.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(request.type)}`}>
                        {request.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{request.reason}</p>
                    
                    {request.socialProof.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Social Proof:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {request.socialProof.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Link {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {request.portfolioLinks.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Portfolio:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {request.portfolioLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Link {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Review Verification Request
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  User
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedRequest.username || selectedRequest.userId}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(selectedRequest.type)}`}>
                  {selectedRequest.type}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <p className="text-gray-900 dark:text-white">{selectedRequest.reason}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Add notes about your decision..."
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
