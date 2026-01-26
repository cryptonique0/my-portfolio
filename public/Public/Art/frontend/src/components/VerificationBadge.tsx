import { FC } from 'react';
import { getVerificationStatus } from '../services/verification';
import { useQuery } from '@tanstack/react-query';

interface VerificationBadgeProps {
  address: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BadgeConfig = {
  bronze: {
    icon: '🥉',
    color: 'bg-amber-100 text-amber-800',
    label: 'Verified Creator',
    description: 'Bronze Level Verification'
  },
  silver: {
    icon: '🥈',
    color: 'bg-gray-100 text-gray-800',
    label: 'Verified Creator',
    description: 'Silver Level Verification'
  },
  gold: {
    icon: '🥇',
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Gold Verified',
    description: 'Gold Level Verification'
  },
  platinum: {
    icon: '💎',
    color: 'bg-blue-100 text-blue-800',
    label: 'Platinum Verified',
    description: 'Platinum Level Verification'
  }
};

const SizeConfig = {
  sm: {
    badge: 'px-2 py-1 text-xs',
    icon: 'text-sm'
  },
  md: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'text-base'
  },
  lg: {
    badge: 'px-4 py-2 text-base',
    icon: 'text-lg'
  }
};

export const VerificationBadge: FC<VerificationBadgeProps> = ({
  address,
  showLabel = true,
  size = 'md'
}) => {
  const { data: status, isLoading } = useQuery({
    queryKey: ['verification', address],
    queryFn: () => getVerificationStatus(address),
    enabled: !!address
  });

  if (isLoading || !status?.isVerified) {
    return null;
  }

  const config = BadgeConfig[status.verificationLevel as keyof typeof BadgeConfig];
  const sizeClass = SizeConfig[size];

  if (!config) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${config.color} ${sizeClass.badge}`}
      title={config.description}
    >
      <span className={sizeClass.icon}>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};

export default VerificationBadge;
