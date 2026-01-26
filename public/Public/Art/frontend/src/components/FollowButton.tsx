import { FC, useState } from 'react';
import { followCreator, unfollowCreator, isFollowing } from '../services/follows';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FollowButtonProps {
  followerAddress: string;
  creatorAddress: string;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const FollowButton: FC<FollowButtonProps> = ({
  followerAddress,
  creatorAddress,
  onFollowChange,
  className = '',
  variant = 'primary'
}) => {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const hasAddresses = Boolean(followerAddress && creatorAddress);

  // Check follow status
  const { data: following = false, isLoading } = useQuery({
    queryKey: ['isFollowing', followerAddress, creatorAddress],
    queryFn: () => isFollowing(followerAddress, creatorAddress),
    enabled: !!followerAddress && !!creatorAddress
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: () => followCreator(followerAddress, creatorAddress),
    onMutate: async () => {
      setIsOptimistic(true);
      await queryClient.cancelQueries({
        queryKey: ['isFollowing', followerAddress, creatorAddress]
      });

      const previousData = queryClient.getQueryData<boolean>([
        'isFollowing',
        followerAddress,
        creatorAddress
      ]);

      queryClient.setQueryData(['isFollowing', followerAddress, creatorAddress], true);

      return { previousData };
    },
    onSuccess: () => {
      setIsOptimistic(false);
      onFollowChange?.(true);
      // Invalidate creator stats
      queryClient.invalidateQueries({
        queryKey: ['creatorStats', creatorAddress]
      });
    },
    onError: (_error: unknown, _variables: unknown, context?: { previousData?: boolean }) => {
      setIsOptimistic(false);
      // Revert optimistic update
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(
          ['isFollowing', followerAddress, creatorAddress],
          context.previousData
        );
      }
    }
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: () => unfollowCreator(followerAddress, creatorAddress),
    onMutate: async () => {
      setIsOptimistic(true);
      await queryClient.cancelQueries({
        queryKey: ['isFollowing', followerAddress, creatorAddress]
      });

      const previousData = queryClient.getQueryData<boolean>([
        'isFollowing',
        followerAddress,
        creatorAddress
      ]);

      queryClient.setQueryData(['isFollowing', followerAddress, creatorAddress], false);

      return { previousData };
    },
    onSuccess: () => {
      setIsOptimistic(false);
      onFollowChange?.(false);
      // Invalidate creator stats
      queryClient.invalidateQueries({
        queryKey: ['creatorStats', creatorAddress]
      });
    },
    onError: (_error: unknown, _variables: unknown, context?: { previousData?: boolean }) => {
      setIsOptimistic(false);
      // Revert optimistic update
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(
          ['isFollowing', followerAddress, creatorAddress],
          context.previousData
        );
      }
    }
  });

  const handleClick = async () => {
    if (!hasAddresses) return;

    if (following) {
      unfollowMutation.mutate(undefined);
    } else {
      followMutation.mutate(undefined);
    }
  };

  const isLoading_ = isLoading || isOptimistic || followMutation.isPending || unfollowMutation.isPending;

  const baseClasses =
    'px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: `${following ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`,
    secondary: `${following ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' : 'bg-blue-100 hover:bg-blue-200 text-blue-900'}`,
    outline: `${following ? 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading_ || !hasAddresses}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title={hasAddresses ? (following ? 'Unfollow this creator' : 'Follow this creator') : 'Connect your wallet to follow'}
    >
      {isLoading_ ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      ) : following ? (
        'Following'
      ) : !hasAddresses ? (
        'Connect to follow'
      ) : (
        'Follow'
      )}
    </button>
  );
};

export default FollowButton;
