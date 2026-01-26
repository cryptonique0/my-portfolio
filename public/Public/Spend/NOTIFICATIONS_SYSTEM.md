# 🔔 Notifications System

SpendGuard now includes a comprehensive notifications center with real-time alerts, dropdown bell icon, and customizable preferences.

## Features

✅ **Bell Icon with Badge** - Shows unread notification count in navbar
✅ **Notification Dropdown** - Quick access to recent notifications
✅ **Full Notifications Page** - Comprehensive view at `/notifications`
✅ **Mark as Read** - Individual notification state management
✅ **Notification Preferences** - Customize which events trigger alerts
✅ **Multiple Event Types** - Withdrawal, approvals, guardian actions, emergencies
✅ **Dark Mode Support** - Fully styled for dark/light themes
✅ **Responsive Design** - Works on mobile and desktop

## Components

### 1. NotificationBell (`components/notifications/notification-bell.tsx`)
- Bell icon in navbar with unread count badge
- Dropdown showing last 10 notifications
- Quick actions: Mark all read, view all, clear all
- Click outside to close

### 2. NotificationsContext (`components/notifications/NotificationsContext.tsx`)
- Global state management for notifications
- Provides `useNotificationsContext()` hook
- Wraps entire app in `NotificationsProvider`

### 3. NotificationPreferences (`components/notifications/notification-preferences.tsx`)
- Customizable notification settings
- 5 in-app notification types
- Email notification toggle
- Save preferences functionality

### 4. NotificationsPage (`app/notifications/page.tsx`)
- Full notifications center at `/notifications`
- Tabs for Notifications and Preferences
- Color-coded by notification type
- Expandable details and actions

## Usage

### Add a Notification

```typescript
import { useNotificationsContext } from '@/components/notifications/NotificationsContext';

export function MyComponent() {
  const { addNotification } = useNotificationsContext();

  const handleWithdrawal = () => {
    addNotification({
      type: 'withdrawal',
      title: 'Withdrawal Requested',
      message: 'You requested to withdraw 10 ETH',
      actionUrl: '/activity',
      vaultAddress: '0x1234...',
    });
  };

  return <button onClick={handleWithdrawal}>Submit</button>;
}
```

### Use Vault-Specific Notifications

```typescript
import { useVaultNotifications } from '@/lib/hooks/useVaultNotifications';

export function WithdrawalForm() {
  const { notifyWithdrawalRequested, notifyWithdrawalApproved } = useVaultNotifications();

  const handleSubmit = async (amount) => {
    // ... submit logic
    notifyWithdrawalRequested('10', 'ETH', vaultAddress);
  };
}
```

### Access Notification Context

```typescript
import { useNotificationsContext } from '@/components/notifications/NotificationsContext';

export function MyComponent() {
  const {
    notifications,        // All notifications
    unreadCount,         // Number of unread
    markAsRead,          // Mark single as read
    markAllAsRead,       // Mark all as read
    deleteNotification,  // Delete by ID
    clearAll,            // Clear all notifications
    preferences,         // User preferences
    updatePreferences,   // Update preferences
  } = useNotificationsContext();
}
```

## Notification Types

| Type | Icon | Color | Purpose |
|------|------|-------|---------|
| `withdrawal` | 🔄 | Blue | Withdrawal requests submitted |
| `approval` | ✅ | Green | Guardian approvals |
| `rejection` | ❌ | Red | Withdrawal rejections |
| `guardian_action` | 👥 | Purple | Guardian voting/actions |
| `emergency` | ⚠️ | Red | Emergency freeze/unlock events |
| `system` | ℹ️ | Gray | System updates/announcements |

## Notification Preferences

Users can customize which events trigger notifications:

**In-App Notifications:**
- Withdrawal Requests
- Approvals & Rejections
- Guardian Actions
- Emergency Alerts
- System Updates

**Email Notifications:**
- Email digest toggle

## Integration Points

The notifications system can be integrated with:

1. **Withdrawal Flow** - When user submits withdrawal request
2. **Guardian Voting** - When guardian approves/rejects
3. **Emergency Actions** - When vault is frozen/unfrozen
4. **Guardian Management** - When guardians are added/removed
5. **System Events** - Scheduled maintenance, security alerts

## Files Structure

```
components/notifications/
├── NotificationsContext.tsx       # Global state provider
├── notification-bell.tsx          # Bell icon + dropdown
├── notification-preferences.tsx   # Settings page
└── notifications-page-client.tsx  # Full notifications view

lib/hooks/
├── useNotifications.ts            # Core hook
└── useVaultNotifications.ts       # Vault-specific helpers

app/notifications/
└── page.tsx                       # Full notifications page
```

## Styling

All components use:
- TailwindCSS for base styling
- Dark mode support via `dark:` prefix
- Color-coded notification types
- Responsive design (mobile-first)
- Smooth transitions and hover states

## Future Enhancements

Planned features:
- [ ] Push notifications (web push API)
- [ ] Email digest scheduling
- [ ] Notification history export
- [ ] Notification grouping by vault
- [ ] Smart filtering (last 24h, last week, etc.)
- [ ] Webhook integrations
- [ ] Discord/Slack bot notifications
- [ ] SMS alerts (Twilio integration)

## Example: Complete Notification Flow

```typescript
// 1. User submits withdrawal in WithdrawalForm
const { notifyWithdrawalRequested } = useVaultNotifications();
notifyWithdrawalRequested('10', 'ETH', vaultAddress);

// 2. Guardian sees notification in bell dropdown
// 3. Guardian clicks to view details

// 4. Guardian approves withdrawal
const { notifyWithdrawalApproved } = useVaultNotifications();
notifyWithdrawalApproved('Guardian Name', '10', 'ETH', vaultAddress);

// 5. User sees approval notification
// 6. User can mark as read, delete, or click "View Details"

// 7. User clicks notification link to see activity log
```

## Tips

- Keep notification messages **brief and actionable**
- Always include `actionUrl` for navigation
- Use `vaultAddress` for filtering in activity log
- Respect user preferences before showing alerts
- Test notifications across dark/light themes
- Mobile test dropdown doesn't overflow screen

## Support

For questions or issues with notifications:
- Check `/notifications` page for all alerts
- Review preferences at `/notifications?tab=preferences`
- Contact support via `/support`
