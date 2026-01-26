import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const NFTCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <Skeleton className="h-64 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    <Skeleton className="h-48 w-full" />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8 -mt-24 mb-12">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="pt-8 flex-1 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ListingSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
    <Skeleton className="h-48 w-full mb-4 rounded-lg" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-8 w-32 mb-4" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export const NFTGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <NFTCardSkeleton key={i} />
    ))}
  </div>
);

export const ListingGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(count)].map((_, i) => (
      <ListingSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    <Skeleton className="h-12 w-full" />
    {[...Array(rows)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-40" />
  </div>
);

export const CommentSkeleton: React.FC = () => (
  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3 mb-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-16 w-full" />
  </div>
);
