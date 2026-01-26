/**
 * SETTINGS INTEGRATION EXAMPLES
 * 
 * Real-world examples of how to integrate the Enhanced Settings Page
 * with other components and features in SpendGuard.
 */

// Example 1: Navigate to settings from navbar
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

export function SettingsButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/settings')}
      className="p-2 hover:bg-muted rounded-lg transition-colors"
      title="Go to Settings"
    >
      <Settings className="w-5 h-5" />
    </button>
  );
}

// Example 2: Navigate to specific settings tab
export function NotificationSettingsLink() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/settings?tab=notifications')}
      className="text-sm text-primary hover:text-primary/80"
    >
      Manage Notification Preferences
    </button>
  );
}

// Example 3: Security settings from notifications
export function Enable2FAPrompt() {
  const router = useRouter();

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
      <p className="text-sm mb-3">
        Add two-factor authentication for enhanced security.
      </p>
      <button
        onClick={() => router.push('/settings?tab=security')}
        className="text-sm text-primary hover:text-primary/80 font-medium"
      >
        Enable 2FA →
      </button>
    </div>
  );
}

// Example 4: Theme toggle in footer
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function QuickThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 hover:bg-muted rounded-lg transition-colors"
      title="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

// Example 5: Check if user has 2FA enabled
import { useState } from 'react';

export function VaultSecurityStatus() {
  const [twoFAEnabled] = useState(true); // Would come from user context

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Security Status</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Two-Factor Authentication</span>
          <span className={twoFAEnabled ? 'text-green-600' : 'text-red-600'}>
            {twoFAEnabled ? '✓ Enabled' : '✗ Not Enabled'}
          </span>
        </div>
        {!twoFAEnabled && (
          <a href="/settings?tab=security" className="text-sm text-primary">
            Enable 2FA →
          </a>
        )}
      </div>
    </div>
  );
}

// Example 6: Account info in profile dropdown
import { useRouter } from 'next/navigation';

export function AccountMenu() {
  const router = useRouter();

  return (
    <div className="p-4 border-t border-border">
      <div className="mb-3">
        <p className="text-sm font-medium">John Doe</p>
        <p className="text-xs text-muted-foreground">john@example.com</p>
      </div>
      <button
        onClick={() => router.push('/settings?tab=account')}
        className="w-full px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
      >
        Account Settings
      </button>
    </div>
  );
}

// Example 7: Wallet selection from withdrawal form
import { useRouter } from 'next/navigation';

export function WalletSelector() {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState('0x1234...');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">From Wallet</label>
      <select
        value={selectedWallet}
        onChange={(e) => setSelectedWallet(e.target.value)}
        className="w-full px-4 py-2 border border-border rounded-lg bg-card"
      >
        <option value="0x1234...">Main Wallet (2.5 ETH)</option>
        <option value="0xabcd...">Backup Wallet (0.8 ETH)</option>
      </select>
      <a
        href="/settings?tab=wallets"
        className="text-xs text-primary hover:text-primary/80"
      >
        Manage wallets →
      </a>
    </div>
  );
}

// Example 8: Email preference integration
import { useNotificationsContext } from '@/components/notifications/NotificationsContext';

export function EmailNotificationToggle() {
  const { preferences, updatePreferences } = useNotificationsContext();

  const handleToggleEmail = () => {
    updatePreferences({
      emailNotifications: !preferences.emailNotifications,
    });
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={preferences.emailNotifications}
        onChange={handleToggleEmail}
        className="w-4 h-4 rounded border border-border"
      />
      <span className="text-sm">Send email notifications</span>
      <a href="/settings?tab=notifications" className="text-xs text-primary">
        (Manage)
      </a>
    </label>
  );
}

// Example 9: Timezone-aware notifications
import { useEffect, useState } from 'react';

export function TimezoneAwareScheduler() {
  const [timezone, setTimezone] = useState('America/Los_Angeles');

  // When scheduling notifications, respect user's timezone
  const scheduleNotification = (time: Date) => {
    // Convert time to user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
    });

    const localTime = formatter.format(time);
    console.log(`Scheduled for ${localTime} in ${timezone}`);
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Notifications scheduled in your timezone: {timezone}
      </p>
      <a href="/settings?tab=account" className="text-sm text-primary">
        Change timezone →
      </a>
    </div>
  );
}

// Example 10: Language preference usage
import { useEffect } from 'react';

export function LocalizedContent() {
  const [language, setLanguage] = useState('en-US');

  const translations: Record<string, Record<string, string>> = {
    'en-US': {
      welcome: 'Welcome to SpendGuard',
      settings: 'Settings',
      security: 'Security',
    },
    'es-ES': {
      welcome: 'Bienvenido a SpendGuard',
      settings: 'Configuración',
      security: 'Seguridad',
    },
    'fr-FR': {
      welcome: 'Bienvenue sur SpendGuard',
      settings: 'Paramètres',
      security: 'Sécurité',
    },
  };

  return (
    <div>
      <h1>{translations[language]?.welcome || translations['en-US'].welcome}</h1>
      <a href="/settings?tab=account" className="text-sm text-primary">
        {translations[language]?.settings} →
      </a>
    </div>
  );
}

// Example 11: Session management in header
export function ActiveSessionIndicator() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      <span>Session Active</span>
      <button
        onClick={() => router.push('/settings?tab=security')}
        className="text-primary hover:text-primary/80"
      >
        Manage Sessions
      </button>
    </div>
  );
}

// Example 12: Full settings modal from component
import { useState } from 'react';
import { X } from 'lucide-react';

export function EmbeddedSettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
      >
        Open Settings
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-background">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab content here */}
        <div className="p-6">
          {/* Render settings components based on activeTab */}
        </div>
      </div>
    </div>
  );
}

/**
 * INTEGRATION PATTERNS
 * 
 * 1. NAVIGATION PATTERN
 *    - Use `router.push('/settings?tab=tabname')` for direct navigation
 *    - Include back button to return to previous page
 * 
 * 2. CONTEXT PATTERN
 *    - Access notification preferences via useNotificationsContext()
 *    - Subscribe to preference changes for real-time updates
 * 
 * 3. STATE SYNC PATTERN
 *    - Mirror settings changes across components
 *    - Save to localStorage or backend after changes
 * 
 * 4. CONDITIONAL RENDERING
 *    - Show settings prompts based on user preferences
 *    - Display security status in various components
 * 
 * 5. DEEPLINK PATTERN
 *    - Link to specific settings from error messages
 *    - Link from notifications to preference management
 *    - Link from security alerts to 2FA setup
 * 
 * 6. EMBEDDED MODAL PATTERN
 *    - Open settings modal without navigation
 *    - Useful for in-context settings changes
 * 
 * 7. QUICK TOGGLE PATTERN
 *    - Provide quick toggles in navbar/sidebar
 *    - Full options available in /settings page
 * 
 * 8. PREFERENCE PERSISTENCE
 *    - Save theme in localStorage (handled by next-themes)
 *    - Save other preferences to database
 *    - Sync across devices on backend
 */
