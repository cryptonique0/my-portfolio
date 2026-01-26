import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Comment, NFT } from '../types';
import { nftService, userService } from '../services/api';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../components/Button';
import { useNotificationStore } from '../store';
import { VerificationBadge } from '../components/VerificationBadge';
import { FollowButton } from '../components/FollowButton';
import { ActivityFeed } from '../components/ActivityFeed';
import { Skeleton, CommentSkeleton } from '../components/SkeletonLoader';
import { NoCommentsFound } from '../components/EmptyState';
import WishlistButton from '../components/wishlist/WishlistButton';
import CollectionsManager from '../components/collections/CollectionsManager';
import PriceAlertForm from '../components/alerts/PriceAlertForm';
import OfferModal from '../components/offers/OfferModal';
import OfferHistory from '../components/offers/OfferHistory';

export const NFTDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useWallet();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const nftData = await nftService.getById(parseInt(id));
        setNft(nftData);

        const historyData = await nftService.getHistory(parseInt(id));
        setHistory(historyData);

        const likeData = await nftService.getLikes(parseInt(id), user.address || undefined);
        setLikes(likeData.likes);
        setLiked(likeData.liked);

        const commentData = await nftService.getComments(parseInt(id));
        setComments(commentData);

        if (user.address) {
          const favorites = await userService.getFavorites(user.address);
          setIsFavorite(favorites.includes(parseInt(id)));
        }

        // In a real app, would fetch from marketplace
        // For now, mock listing data
      } catch (error) {
        console.error('Failed to fetch NFT:', error);
        addNotification({
          type: 'error',
          title: 'Failed to Load',
          message: 'Could not load NFT details'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, addNotification, user.address]);

  const handleBuy = async () => {
    if (!user.isConnected) {
      addNotification({
        type: 'error',
        title: 'Not Connected',
        message: 'Please connect your wallet to make offers'
      });
      return;
    }
  };

    const handleToggleLike = async () => {
      if (!user.isConnected || !user.address || !id) {
        addNotification({
          type: 'error',
          title: 'Not Connected',
          message: 'Connect your wallet to like this NFT.'
        });
        return;
      }

      try {
        const result = await nftService.toggleLike(parseInt(id), user.address);
        setLikes(result.likes);
        setLiked(result.liked);
      } catch (error: any) {
        addNotification({
          type: 'error',
          title: 'Action Failed',
          message: error.message || 'Could not update like state'
        });
      }
    };

    const handleToggleFavorite = async () => {
      if (!user.isConnected || !user.address || !id) {
        addNotification({
          type: 'error',
          title: 'Not Connected',
          message: 'Connect your wallet to favorite this NFT.'
        });
        return;
      }

      try {
        const result = await userService.toggleFavorite(user.address, parseInt(id));
        setIsFavorite(result.favorited);
      } catch (error: any) {
        addNotification({
          type: 'error',
          title: 'Action Failed',
          message: error.message || 'Could not update favorites'
        });
      }
    };

    const handleAddComment = async () => {
      if (!user.isConnected || !user.address || !id) {
        addNotification({
          type: 'error',
          title: 'Not Connected',
          message: 'Connect your wallet to comment.'
        });
        return;
      }

      if (!commentText.trim()) {
        return;
      }

      try {
        setCommentLoading(true);
        const newComment = await nftService.addComment(parseInt(id), user.address, commentText.trim());
        setComments((prev) => [newComment, ...prev]);
        setCommentText('');
      } catch (error: any) {
        addNotification({
          type: 'error',
          title: 'Comment Failed',
          message: error.message || 'Could not add comment'
        });
      } finally {
        setCommentLoading(false);
      }
    };

  if (loading || !nft) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full rounded-lg shadow-xl"
            />
          </div>

          {/* Details */}
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                  {nft.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {nft.name}
              </h1>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <span>By</span>
                <span className="font-semibold">{nft.creator.substring(0, 8)}...</span>
                <VerificationBadge address={nft.creator} size="sm" />
                {user.address && user.address !== nft.creator && (
                  <FollowButton
                    followerAddress={user.address}
                    creatorAddress={nft.creator}
                    variant="outline"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {nft.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Owner</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nft.owner.substring(0, 8)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Creator Royalty</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nft.royaltyPercentage}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(nft.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contract</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  #{nft.id}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <OfferModal nftId={id || ''} />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggleLike}
                variant={liked ? 'primary' : 'outline'}
                size="md"
                className="flex-1"
              >
                {liked ? 'Liked' : 'Like'} · {likes}
              </Button>
              <WishlistButton nftId={id || ''} nftName={nft.name} nftImage={nft.image} />
            </div>

            <div className="mt-6 space-y-6">
              <PriceAlertForm nftId={id || ''} />
              <CollectionsManager
                initialNftId={id || ''}
                initialNftName={nft.name}
                initialNftImage={nft.image}
              />
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Comments</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <Button
                onClick={handleAddComment}
                disabled={commentLoading}
                variant="primary"
              >
                {commentLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
            {commentLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <CommentSkeleton key={i} />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <NoCommentsFound />
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{comment.author.substring(0, 10)}...</span>
                      <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Activity</h2>
          <ActivityFeed
            filters={{ nftId: id || undefined }}
            limit={10}
            showFilters={false}
          />
        </div>

        {/* History */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Transaction History
          </h2>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No transaction history</p>
            ) : (
              history.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {tx.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`https://explorer.stacks.co/txid/${tx.txHash}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
                  >
                    View on Explorer →
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Offer History */}
        <OfferHistory nftId={id || ''} />
      </div>
    </div>
  );
};
