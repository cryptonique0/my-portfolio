import { useNotificationsContext } from '@/components/notifications/NotificationsContext';

/**
 * Hook for triggering notifications from vault activities
 * Usage examples included below
 */
export function useVaultNotifications() {
    const { addNotification } = useNotificationsContext();

    const notifyWithdrawalRequested = (amount: string, token: string, vaultAddress: string) => {
        addNotification({
            type: 'withdrawal',
            title: 'Withdrawal Request Submitted',
            message: `You requested to withdraw ${amount} ${token}`,
            actionUrl: `/activity?vault=${vaultAddress}`,
            vaultAddress,
        });
    };

    const notifyWithdrawalApproved = (guardian: string, amount: string, token: string, vaultAddress: string) => {
        addNotification({
            type: 'approval',
            title: 'Withdrawal Approved',
            message: `${guardian} approved your ${amount} ${token} withdrawal`,
            actionUrl: `/activity?vault=${vaultAddress}`,
            vaultAddress,
        });
    };

    const notifyWithdrawalRejected = (guardian: string, amount: string, token: string, vaultAddress: string) => {
        addNotification({
            type: 'rejection',
            title: 'Withdrawal Rejected',
            message: `${guardian} rejected your ${amount} ${token} withdrawal`,
            actionUrl: `/activity?vault=${vaultAddress}`,
            vaultAddress,
        });
    };

    const notifyGuardianAdded = (guardianAddress: string, vaultAddress: string) => {
        addNotification({
            type: 'guardian_action',
            title: 'Guardian Added',
            message: `New guardian added: ${guardianAddress.slice(0, 6)}...${guardianAddress.slice(-4)}`,
            actionUrl: `/guardians?vault=${vaultAddress}`,
            vaultAddress,
        });
    };

    const notifyVaultFrozen = (reason: string, vaultAddress: string) => {
        addNotification({
            type: 'emergency',
            title: '🚨 Vault Frozen',
            message: `Your vault has been frozen. Reason: ${reason}`,
            actionUrl: `/emergency?vault=${vaultAddress}`,
            vaultAddress,
        });
    };

    const notifyVaultUnfrozen = (vaultAddress: string) => {
        addNotification({
            type: 'emergency',
            title: '✓ Vault Unfrozen',
            message: 'Your vault has been unfrozen and is now active',
            actionUrl: `/dashboard?vault=${vaultAddress}`,
            vaultAddress,
        });
    };

    const notifyEmergencyUnlockInitiated = (timelock: string, vaultAddress: string) => {
        addNotification({
            type: 'emergency',
            title: 'Emergency Unlock Initiated',
            message: `Emergency unlock requested. Available in ${timelock}`,
            actionUrl: `/emergency?vault=${vaultAddress}`,
            vaultAddress,
        });
    };

    const notifySystemUpdate = (message: string) => {
        addNotification({
            type: 'system',
            title: 'System Update',
            message,
            actionUrl: '/support',
        });
    };

    return {
        notifyWithdrawalRequested,
        notifyWithdrawalApproved,
        notifyWithdrawalRejected,
        notifyGuardianAdded,
        notifyVaultFrozen,
        notifyVaultUnfrozen,
        notifyEmergencyUnlockInitiated,
        notifySystemUpdate,
    };
}

/**
 * Usage Example in a Component:
 * 
 * function WithdrawalForm() {
 *   const { notifyWithdrawalRequested } = useVaultNotifications();
 *   
 *   const handleSubmit = async (data) => {
 *     // ... submit withdrawal
 *     notifyWithdrawalRequested('10', 'ETH', '0x1234...');
 *   };
 * }
 */
