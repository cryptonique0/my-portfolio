import React, { useState } from 'react';
import { useVerification } from '../../hooks/useProfileEnhancements';

export const VerificationBadge: React.FC<{ isVerified: boolean; size?: 'sm' | 'md' | 'lg' }> = ({ 
  isVerified, 
  size = 'md' 
}) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  return (
    <span
      className={`inline-flex items-center justify-center bg-blue-500 text-white rounded-full ${sizeClasses[size]}`}
      title="Verified User"
    >
      ✓
    </span>
  );
};

interface VerificationRequestFormProps {
  onSuccess?: () => void;
}

export const VerificationRequestForm: React.FC<VerificationRequestFormProps> = ({ onSuccess }) => {
  const { submitRequest, checkEligibility, eligibility, loading, error } = useVerification();
  const [requestType, setRequestType] = useState<'creator' | 'influencer' | 'business' | 'developer'>('creator');
  const [reason, setReason] = useState('');
  const [socialProof, setSocialProof] = useState<string[]>(['']);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [showEligibility, setShowEligibility] = useState(false);

  const handleCheckEligibility = async () => {
    await checkEligibility(requestType);
    setShowEligibility(true);
  };

  const handleAddSocialProof = () => {
    setSocialProof([...socialProof, '']);
  };

  const handleAddPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  const handleSocialProofChange = (index: number, value: string) => {
    const newProof = [...socialProof];
    newProof[index] = value;
    setSocialProof(newProof);
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    const newLinks = [...portfolioLinks];
    newLinks[index] = value;
    setPortfolioLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await submitRequest(requestType, {
      social_proof: socialProof.filter(p => p.trim() !== ''),
      portfolio_links: portfolioLinks.filter(l => l.trim() !== ''),
      reason,
    });

    if (success) {
      alert('✅ Verification request submitted successfully!');
      onSuccess?.();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">✅ Request Verification</h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Verification Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verification Type
          </label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as any)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="creator">🎨 Creator (for NFT artists)</option>
            <option value="influencer">⭐ Influencer (for content creators)</option>
            <option value="business">🏢 Business (for companies)</option>
            <option value="developer">💻 Developer (for developers)</option>
          </select>
        </div>

        {/* Check Eligibility */}
        <button
          type="button"
          onClick={handleCheckEligibility}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          🔍 Check Eligibility
        </button>

        {showEligibility && eligibility && (
          <div className={`p-4 rounded-lg ${
            eligibility.eligible
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
          }`}>
            <div className="font-semibold mb-2">
              {eligibility.eligible ? '✅ You are eligible!' : '⚠️ Requirements not met'}
            </div>
            {!eligibility.eligible && eligibility.reasons.length > 0 && (
              <ul className="list-disc list-inside space-y-1">
                {eligibility.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Why do you want to be verified? *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Explain why you deserve verification..."
          />
        </div>

        {/* Social Proof */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Social Proof Links
          </label>
          <div className="space-y-2">
            {socialProof.map((proof, index) => (
              <input
                key={index}
                type="url"
                value={proof}
                onChange={(e) => handleSocialProofChange(index, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://twitter.com/yourprofile"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddSocialProof}
            className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
          >
            + Add another link
          </button>
        </div>

        {/* Portfolio Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Portfolio Links
          </label>
          <div className="space-y-2">
            {portfolioLinks.map((link, index) => (
              <input
                key={index}
                type="url"
                value={link}
                onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://yourportfolio.com"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddPortfolioLink}
            className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
          >
            + Add another link
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !reason}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-semibold"
        >
          {loading ? '⏳ Submitting...' : '📤 Submit Request'}
        </button>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Verification Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Complete your profile with avatar, banner, and bio</li>
          <li>Add social media links to your profile</li>
          <li>Have a strong NFT creation or trading history</li>
          <li>Provide genuine and verifiable social proof</li>
          <li>Be patient - verification can take 3-5 business days</li>
        </ul>
      </div>
    </div>
  );
};

interface VerificationRequestsListProps {
  userId?: string;
}

export const VerificationRequestsList: React.FC<VerificationRequestsListProps> = () => {
  const { requests, loading } = useVerification();

  if (loading) {
    return <div className="animate-pulse">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-5xl mb-4">📭</div>
        <div className="text-gray-600 dark:text-gray-400">No verification requests yet</div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  };

  const statusIcons = {
    pending: '⏳',
    approved: '✅',
    rejected: '❌',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Verification Requests</h3>

      <div className="space-y-4">
        {requests.map(request => (
          <div
            key={request.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white capitalize">
                  {request.request_type} Verification
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Submitted {new Date(request.submitted_at).toLocaleDateString()}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status]}`}>
                {statusIcons[request.status]} {request.status.toUpperCase()}
              </span>
            </div>

            <div className="text-gray-700 dark:text-gray-300 text-sm">
              <strong>Reason:</strong> {request.reason}
            </div>

            {request.status === 'pending' && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                ⏳ Your request is being reviewed. We'll notify you once it's processed.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
