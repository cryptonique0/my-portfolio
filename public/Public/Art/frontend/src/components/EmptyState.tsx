import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
      {description}
    </p>
    {action && (
      <Button onClick={action.onClick} variant="primary">
        {action.label}
      </Button>
    )}
  </div>
);

export const NoNFTsFound: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon="🎨"
    title="No NFTs Found"
    description="There are no NFTs to display. Start creating your first digital masterpiece!"
    action={onCreate ? {
      label: 'Create NFT',
      onClick: onCreate
    } : undefined}
  />
);

export const NoListingsFound: React.FC = () => (
  <EmptyState
    icon="🏪"
    title="No Listings Available"
    description="There are currently no active listings. Check back later for new items!"
  />
);

export const NoActivityFound: React.FC = () => (
  <EmptyState
    icon="📊"
    title="No Activity Yet"
    description="No recent activity to display. Start exploring and interacting with NFTs!"
  />
);

export const NoCommentsFound: React.FC = () => (
  <EmptyState
    icon="💬"
    title="No Comments Yet"
    description="Be the first to share your thoughts on this NFT!"
    className="py-8"
  />
);

export const NoFavoritesFound: React.FC = () => (
  <EmptyState
    icon="⭐"
    title="No Favorites Yet"
    description="Start exploring and favorite NFTs you love to see them here."
  />
);

export const NoFollowersFound: React.FC = () => (
  <EmptyState
    icon="👥"
    title="No Followers Yet"
    description="Share your profile to gain followers and grow your community."
    className="py-8"
  />
);

export const NoSearchResults: React.FC<{ query: string }> = ({ query }) => (
  <EmptyState
    icon="🔍"
    title="No Results Found"
    description={`No results found for "${query}". Try adjusting your search or filters.`}
  />
);

export const WalletNotConnected: React.FC<{ onConnect: () => void }> = ({ onConnect }) => (
  <EmptyState
    icon="🔌"
    title="Wallet Not Connected"
    description="Connect your wallet to view your profile, create NFTs, and interact with the marketplace."
    action={{
      label: 'Connect Wallet',
      onClick: onConnect
    }}
  />
);

export const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <EmptyState
    icon="⚠️"
    title="Something Went Wrong"
    description={error || 'An unexpected error occurred. Please try again.'}
    action={onRetry ? {
      label: 'Retry',
      onClick: onRetry
    } : undefined}
  />
);
