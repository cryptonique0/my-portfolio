import React from 'react';
import { getTransactionLink, getAddressLink, getContractLink, shortenTxHash, shortenAddress } from '../services/basescan';

interface BaseScanLinkProps {
  type: 'tx' | 'address' | 'contract';
  hash: string;
  label?: string;
  showIcon?: boolean;
  className?: string;
  shorten?: boolean;
}

/**
 * BaseScan deep link component for transactions, addresses, and contracts
 * Opens BaseScan in a new tab with the resource details
 */
export const BaseScanLink: React.FC<BaseScanLinkProps> = ({
  type,
  hash,
  label,
  showIcon = true,
  className = '',
  shorten = true
}) => {
  let link;
  let displayLabel = label;

  switch (type) {
    case 'tx':
      link = getTransactionLink(hash);
      displayLabel = label || (shorten ? shortenTxHash(hash) : hash);
      break;
    case 'address':
      link = getAddressLink(hash, label);
      displayLabel = label || (shorten ? shortenAddress(hash) : hash);
      break;
    case 'contract':
      link = getContractLink(hash);
      displayLabel = label || 'View Contract';
      break;
    default:
      return <span>{label || hash}</span>;
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors ${className}`}
      title={`Open on BaseScan: ${hash}`}
    >
      {showIcon && <span className="text-sm">{link.icon}</span>}
      <span>{displayLabel}</span>
    </a>
  );
};

interface TransactionStatusProps {
  txHash: string;
  status?: 'pending' | 'success' | 'failed';
  className?: string;
}

/**
 * Transaction status display with BaseScan link
 */
export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  txHash,
  status = 'pending',
  className = ''
}) => {
  const statusConfig = {
    pending: { color: 'text-yellow-600 dark:text-yellow-400', icon: '⏳', label: 'Pending' },
    success: { color: 'text-green-600 dark:text-green-400', icon: '✅', label: 'Success' },
    failed: { color: 'text-red-600 dark:text-red-400', icon: '❌', label: 'Failed' }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${config.color} text-lg`}>{config.icon}</span>
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        <BaseScanLink type="tx" hash={txHash} className="text-xs" />
      </div>
    </div>
  );
};

interface AddressDisplayProps {
  address: string;
  showLink?: boolean;
  copyable?: boolean;
  className?: string;
}

/**
 * Address display with optional copy and BaseScan link
 */
export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  showLink = true,
  copyable = true,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono break-all">
        {shortenAddress(address)}
      </code>
      {copyable && (
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Copy address"
        >
          {copied ? '✓' : '📋'}
        </button>
      )}
      {showLink && (
        <BaseScanLink type="address" hash={address} showIcon className="text-xs" />
      )}
    </div>
  );
};

interface ContractLinkProps {
  contractAddress: string;
  contractName?: string;
  className?: string;
}

/**
 * Contract link with name label
 */
export const ContractLink: React.FC<ContractLinkProps> = ({
  contractAddress,
  contractName = 'Contract',
  className = ''
}) => {
  return (
    <BaseScanLink
      type="contract"
      hash={contractAddress}
      label={contractName}
      className={className}
    />
  );
};

// Re-export helpers for convenience
export { shortenTxHash, shortenAddress } from '../services/basescan';
