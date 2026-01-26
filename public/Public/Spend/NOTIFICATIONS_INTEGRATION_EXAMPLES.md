/**
 * NOTIFICATIONS INTEGRATION EXAMPLES
 * 
 * This file shows real-world examples of how to integrate the notifications
 * system into existing SpendGuard components.
 */

// Example 1: Withdrawal Form Integration
import { useVaultNotifications } from '@/lib/hooks/useVaultNotifications';
import { useNotificationsContext } from '@/components/notifications/NotificationsContext';

export function WithdrawalFormExample() {
  const { notifyWithdrawalRequested } = useVaultNotifications();
  const { preferences } = useNotificationsContext();

  const handleSubmitWithdrawal = async (amount: string, token: string, vaultAddress: string) => {
    // Only notify if user has withdrawal notifications enabled
    if (preferences.withdrawalRequests) {
      notifyWithdrawalRequested(amount, token, vaultAddress);
    }

    // ... rest of submission logic
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmitWithdrawal('10', 'ETH', '0x1234...');
    }}>
      {/* Form fields */}
    </form>
  );
}

// Example 2: Guardian Voting Integration
export function GuardianVotingExample() {
  const { notifyWithdrawalApproved, notifyWithdrawalRejected } = useVaultNotifications();
  const { preferences } = useNotificationsContext();

  const handleApprove = async (withdrawalId: string, amount: string, token: string, vaultAddress: string) => {
    // Submit approval to contract
    // const tx = await submitApproval(...);

    // Notify if enabled
    if (preferences.approvals) {
      notifyWithdrawalApproved('Your Guardian Name', amount, token, vaultAddress);
    }
  };

  const handleReject = async (withdrawalId: string, amount: string, token: string, vaultAddress: string) => {
    // Submit rejection
    // const tx = await submitRejection(...);

    // Notify if enabled
    if (preferences.rejections) {
      notifyWithdrawalRejected('Your Guardian Name', amount, token, vaultAddress);
    }
  };

  return (
    <div>
      <button onClick={() => handleApprove('w1', '5', 'ETH', '0x1234')}>Approve</button>
      <button onClick={() => handleReject('w1', '5', 'ETH', '0x1234')}>Reject</button>
    </div>
  );
}

// Example 3: Emergency Freeze Integration
export function EmergencyFreezeExample() {
  const { notifyVaultFrozen, notifyVaultUnfrozen } = useVaultNotifications();
  const { preferences } = useNotificationsContext();

  const handleFreeze = async (reason: string, vaultAddress: string) => {
    // Execute freeze on contract
    // const tx = await freezeVault(...);

    if (preferences.emergencyAlerts) {
      notifyVaultFrozen(reason, vaultAddress);
    }
  };

  const handleUnfreeze = async (vaultAddress: string) => {
    // Execute unfreeze
    // const tx = await unfreezeVault(...);

    if (preferences.emergencyAlerts) {
      notifyVaultUnfrozen(vaultAddress);
    }
  };

  return (
    <div>
      <button onClick={() => handleFreeze('Suspicious activity detected', '0x1234')}>
        Freeze Vault
      </button>
      <button onClick={() => handleUnfreeze('0x1234')}>
        Unfreeze Vault
      </button>
    </div>
  );
}

// Example 4: Guardian Management Integration
export function AddGuardianExample() {
  const { notifyGuardianAdded } = useVaultNotifications();
  const { preferences } = useNotificationsContext();

  const handleAddGuardian = async (guardianAddress: string, vaultAddress: string) => {
    // Add guardian to contract
    // const tx = await addGuardian(guardianAddress, ...);

    if (preferences.guardianActions) {
      notifyGuardianAdded(guardianAddress, vaultAddress);
    }
  };

  return (
    <button onClick={() => handleAddGuardian('0x5678...', '0x1234...')}>
      Add Guardian
    </button>
  );
}

// Example 5: Custom Notifications with Full Context
export function CustomNotificationExample() {
  const { addNotification, preferences } = useNotificationsContext();

  const handleCustomEvent = () => {
    if (preferences.inAppNotifications) {
      addNotification({
        type: 'system',
        title: 'Custom Event Occurred',
        message: 'This is a custom notification from your app',
        actionUrl: '/dashboard',
        vaultAddress: '0x1234...',
      });
    }
  };

  return (
    <button onClick={handleCustomEvent}>
      Trigger Custom Notification
    </button>
  );
}

// Example 6: Activity Log with Notification Shortcuts
export function ActivityLogWithNotificationExample() {
  const { notifications, markAsRead, deleteNotification } = useNotificationsContext();

  return (
    <div>
      <h2>Recent Activity & Notifications</h2>
      {notifications.slice(0, 5).map((notif) => (
        <div key={notif.id} className="p-4 border rounded">
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
          <button onClick={() => deleteNotification(notif.id)}>Delete</button>
          {notif.actionUrl && (
            <a href={notif.actionUrl}>View Details</a>
          )}
        </div>
      ))}
    </div>
  );
}

// Example 7: Dashboard Widget with Unread Count
export function NotificationsDashboardWidget() {
  const { unreadCount, notifications } = useNotificationsContext();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-bold">You have {unreadCount} unread notifications</h3>
      <p className="text-sm text-gray-600">
        Total notifications: {notifications.length}
      </p>
      <a href="/notifications" className="text-primary font-semibold text-sm mt-2 inline-block">
        View All Notifications →
      </a>
    </div>
  );
}

// Example 8: Notification Preferences Integration
export function SettingsPageExample() {
  const { preferences, updatePreferences } = useNotificationsContext();

  const handleToggleWithdrawals = () => {
    updatePreferences({
      withdrawalRequests: !preferences.withdrawalRequests,
    });
  };

  return (
    <div>
      <h2>Notification Settings</h2>
      <label>
        <input
          type="checkbox"
          checked={preferences.withdrawalRequests}
          onChange={handleToggleWithdrawals}
        />
        Notify on withdrawal requests
      </label>
    </div>
  );
}

/**
 * BEST PRACTICES:
 * 
 * 1. Always check user preferences before triggering notifications
 * 2. Keep notification messages short and actionable
 * 3. Always include actionUrl for navigation
 * 4. Use vault-specific notification helpers from useVaultNotifications
 * 5. Test notifications across dark/light themes
 * 6. Mobile test the dropdown doesn't overflow
 * 7. Use appropriate notification types for categorization
 * 8. Include vault addresses for filtering/context
 * 9. Dismiss critical notifications when resolved
 * 10. Monitor notification performance with analytics
 */
