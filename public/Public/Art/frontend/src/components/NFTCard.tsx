import React from 'react';
import { NFT } from '../types';
import { Link } from 'react-router-dom';
import { GasBreakdown } from './GasBreakdown';
import { NFTBadges } from './Badge';

interface NFTCardProps {
  nft: NFT;
  price?: number; // in ETH
  royaltyPercentage?: number;
  showGasEstimate?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  price,
  royaltyPercentage = 0,
  showGasEstimate = true,
  isTrending = false,
  isFeatured = false,
  isNew = false,
  selectable = false,
  selected = false,
  onSelect
}) => {
  return (
    <div className="group rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow hover:shadow-xl transition-all relative">
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect?.(e.target.checked)}
          className="absolute top-2 left-2 z-10 w-5 h-5 accent-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          title="Select for bulk action"
        />
      )}
      {/* Image */}
      <Link to={`/nft/${nft.id}`} className="block relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-48">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Top Right Badges */}
        <div className="absolute top-2 right-2">
          <NFTBadges
            isBaseNative={true}
            isTrending={isTrending}
            isFeatured={isFeatured}
            isNew={isNew}
            className="justify-end"
          />
        </div>

        {/* Category Badge - Bottom Left */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
          {nft.category}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/nft/${nft.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {nft.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
          By {nft.creator.substring(0, 8)}...
        </p>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {price !== undefined && price > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {price.toFixed(4)} ETH
                </p>
              </div>

              {/* Gas Breakdown Preview */}
              {showGasEstimate && (
                <GasBreakdown
                  itemPrice={price}
                  royaltyPercentage={royaltyPercentage}
                  className="mt-2"
                />
              )}

              {/* CTA Button */}
              <Link
                to={`/nft/${nft.id}`}
                className="block w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center transition-colors"
              >
                View & Buy
              </Link>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">Not Listed</p>
          )}
        </div>
      </div>
    </div>
  );
};
