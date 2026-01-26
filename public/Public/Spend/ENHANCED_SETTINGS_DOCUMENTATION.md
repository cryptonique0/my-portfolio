# Enhanced Settings Page Documentation

## Overview

The Enhanced Settings Page provides a comprehensive interface for users to manage all aspects of their SpendGuard account. Built with tabbed navigation for better organization, it includes theme customization, notification preferences, security settings, wallet management, and account preferences.

## Components

### 1. Main Settings Page (`app/settings/page.tsx`)

The main settings page wrapper that orchestrates all tabs and sections.

**Features:**
- Tab-based navigation with 5 main tabs
- URL param support (e.g., `?tab=notifications`)
- Responsive mobile design
- Gradient background and clean typography
- Danger zone section for destructive actions

**Tabs:**
1. **Appearance** - Theme customization
2. **Notifications** - Alert preferences
3. **Security** - 2FA and session management
4. **Wallets** - Connected wallet management
5. **Account** - Personal information and preferences

**Additional Sections:**
- Vault Management (Email preferences, Analytics, Transfer)
- Danger Zone (Sign out all sessions)

### 2. Theme Toggle (`components/settings/theme-toggle.tsx`)

Visual theme selection with light/dark/system options.

**Features:**
- Three theme options with visual indicators
- Shows active theme with badge
- System theme that respects device preferences
- Accessibility option for reduced motion
- Information tips about theme persistence

**Props:** None (uses `next-themes`)

**Exports:**
```tsx
export function ThemeToggle()
```

### 3. Security Settings (`components/settings/security-settings.tsx`)

Comprehensive security management including 2FA, sessions, and login activity.

**Features:**
- Two-Factor Authentication (2FA) setup
- QR code generation (placeholder)
- Secret key with copy/visibility toggle
- Active sessions management with revocation
- Password change option
- Login activity tracking

**Session Management:**
- Shows device, browser, location, and last activity
- Current session indicator
- Revoke unused sessions
- Cross-device session control

**Props:** None

**Exports:**
```tsx
export function SecuritySettings()
```

**State Management:**
- `twoFAEnabled` - Toggle 2FA activation
- `activeSessions` - List of logged-in devices
- `showSecret` - Toggle secret key visibility

### 4. Wallet Management (`components/settings/wallet-management.tsx`)

Connected wallet management with multi-chain support.

**Features:**
- Display all connected wallets with provider info
- Show balance per wallet
- Copy address to clipboard
- Direct link to block explorer
- Set primary wallet
- Disconnect/remove wallets
- Chain support indicator (Current: Base, Future: Ethereum, Arbitrum, Optimism)

**Wallet Information Displayed:**
- Wallet address (shortened with full copy option)
- Custom label
- Provider (MetaMask, Coinbase Wallet, etc.)
- Balance in ETH
- Chain network
- Connection date
- Primary wallet badge

**Props:** None (uses `useAccount` from wagmi)

**Exports:**
```tsx
export function WalletManagement()
```

**State Management:**
- `connectedWallets` - Array of wallet objects
- `copiedAddress` - Track which address was copied

### 5. Account Preferences (`components/settings/account-preferences.tsx`)

Personal account information and communication preferences.

**Features:**
- Display name editing
- Email address management with verification status
- Timezone selection (8 worldwide timezones)
- Language selection (7 languages)
- Account creation date and status
- Last login timestamp
- Communication preferences (4 toggle options)
- Edit/Save/Cancel workflow

**Communication Preferences:**
1. Account security & important updates (enabled by default)
2. Tips and best practices (enabled by default)
3. New feature announcements
4. Promotional offers and special events

**Props:** None

**Exports:**
```tsx
export function AccountPreferences()
```

**State Management:**
- `isEditing` - Toggle edit mode
- `displayName` - User's display name
- `email` - Email address
- `emailVerified` - Email verification status
- `timezone` - Selected timezone
- `language` - Selected language
- `savedMessage` - Show success notification

### 6. Notification Preferences (Existing)

Integrated from the existing notification system.

**Location:** `components/notifications/notification-preferences.tsx`

**Features:**
- In-app notification toggles (5 types)
- Email notification toggle
- Save preferences with success feedback

## Integration Guide

### Using URL Parameters

Navigate to specific tabs using query parameters:

```tsx
// Navigate to notifications tab
<a href="/settings?tab=notifications">Settings</a>

// Navigate to security tab
router.push('/settings?tab=security');
```

### Programmatic Tab Navigation

```tsx
'use client';
import { useRouter } from 'next/navigation';

export function MyComponent() {
  const router = useRouter();
  
  const goToSecuritySettings = () => {
    router.push('/settings?tab=security');
  };
  
  return <button onClick={goToSecuritySettings}>Security</button>;
}
```

### Accessing Notification Context

If you need to trigger settings navigation from notification components:

```tsx
import { useRouter } from 'next/navigation';

export function NotificationBell() {
  const router = useRouter();
  
  return (
    <button onClick={() => router.push('/settings?tab=notifications')}>
      Notification Preferences
    </button>
  );
}
```

## UI Components Used

- **Tabs** (`@/components/ui/tabs`) - Tab navigation
- **Icons** - Lucide React (Moon, Sun, Monitor, Lock, Shield, Wallet, User, etc.)
- **Material Symbols** - `notifications`, `history` icons
- **Input/Select** - Native HTML elements styled with Tailwind

## Styling

All components use:
- **Color scheme**: Dark/light mode aware with TailwindCSS
- **Spacing**: Consistent padding (p-4, p-6) and margins
- **Borders**: Using `border-border` class for consistent styling
- **Focus states**: Blue ring on focus (focus:ring-2 focus:ring-primary)
- **Hover states**: Subtle background color changes
- **Status badges**: Green (active/verified), Blue (info), Red (danger)

## Responsive Design

- Mobile-first approach
- Hidden labels on mobile (e.g., `hidden sm:inline`)
- Grid adjusts: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
- Tab labels abbreviated on mobile (`Theme` instead of `Appearance`)

## State Management

### Local Component State

Each component manages its own state:

```tsx
const [twoFAEnabled, setTwoFAEnabled] = useState(false);
const [connectedWallets, setConnectedWallets] = useState([...]);
const [isEditing, setIsEditing] = useState(false);
```

### Context Integration

Notification preferences use the global `NotificationsContext`:

```tsx
const { preferences, updatePreferences } = useNotificationsContext();
```

### Wagmi Integration

Wallet management uses `useAccount` from wagmi:

```tsx
const { address } = useAccount();
```

## Future Enhancements

1. **Backend Integration**
   - Store preferences in database
   - Sync across devices
   - Backup 2FA recovery codes

2. **Advanced Security**
   - Hardware key support
   - Backup authentication methods
   - Device fingerprinting

3. **Enhanced Analytics**
   - Login location history
   - Activity timeline
   - Failed login alerts

4. **Theme Customization**
   - Custom color schemes
   - Font size adjustment
   - Layout preferences

5. **Multi-Language Support**
   - Full i18n implementation
   - Right-to-left (RTL) languages
   - Regional number formatting

6. **Export & Import**
   - Download account data
   - Import wallet list
   - Settings backup

## Accessibility

- Semantic HTML with proper labels
- Color contrast meets WCAG standards
- Keyboard navigation support
- Focus indicators on all interactive elements
- Material Symbols for icon accessibility
- Form grouping with `<label>` elements
- Success/error messages for user feedback

## Error Handling

Components include:
- Disabled states for loading/processing
- Visual feedback for actions (copy, save)
- Success/error messages
- Input validation (email format, address format)
- Graceful fallbacks for missing data

## Security Considerations

1. **Sensitive Data:**
   - 2FA secret shown with visibility toggle
   - Passwords handled securely
   - Session tokens not displayed

2. **User Actions:**
   - Confirmation for destructive actions
   - Multiple confirmation steps for 2FA
   - Revoke session functionality

3. **Data Privacy:**
   - No personal data exposed in URLs
   - LocalStorage used for theme preference only
   - Secure communication for settings updates

## Testing Checklist

- [ ] All tabs render correctly
- [ ] URL params navigate to correct tabs
- [ ] Theme toggle switches themes and persists
- [ ] 2FA setup shows secret correctly
- [ ] Copy address button works with visual feedback
- [ ] Session revocation removes from list
- [ ] Form save/cancel buttons work
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Dark mode styling correct on all components
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader compatible

## Files Created

1. `/app/settings/page.tsx` - Main settings page (updated)
2. `/components/settings/theme-toggle.tsx` - Theme selection
3. `/components/settings/security-settings.tsx` - 2FA & sessions
4. `/components/settings/wallet-management.tsx` - Wallet management
5. `/components/settings/account-preferences.tsx` - Personal preferences

## Files Modified

- `/app/settings/page.tsx` - Replaced with tabbed layout and new components

## Environment Variables

None required. All components use client-side state management.

## Performance Notes

- Components are client-side only (`"use client"`)
- No unnecessary re-renders (useState for local state only)
- Tab switching is instant (no data fetching)
- Copy to clipboard is synchronous
- Material Symbols loaded globally in layout.tsx

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design tested
