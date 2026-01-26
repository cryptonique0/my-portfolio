"use client";

import { useState } from "react";
import { Lock, Shield, Eye, EyeOff, Copy, Check } from "lucide-react";

export function SecuritySettings() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "MacBook Pro", browser: "Chrome", location: "San Francisco, CA", lastActive: "2 minutes ago", current: true },
    { id: 2, device: "iPhone 15", browser: "Safari", location: "San Francisco, CA", lastActive: "1 hour ago", current: false },
    { id: 3, device: "Windows PC", browser: "Chrome", location: "New York, NY", lastActive: "3 days ago", current: false },
  ]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeSession = (id: number) => {
    setActiveSessions(activeSessions.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Two-Factor Authentication (2FA)
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add an extra layer of security to your account using an authenticator app
        </p>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>Status:</strong> {twoFAEnabled ? (
              <span className="text-green-600 dark:text-green-400 font-semibold">✓ Enabled</span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Not Enabled</span>
            )}
          </p>
        </div>

        {!twoFAEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code:
            </p>

            <div className="bg-white dark:bg-slate-950 border border-border rounded-lg p-6 flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-sm text-muted-foreground">QR Code Placeholder</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Or enter this secret key manually:
            </p>

            <div className="flex gap-2">
              <input
                type={showSecret ? "text" : "password"}
                value="JBSWY3DPEHPK3PXP"
                readOnly
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-muted text-sm font-mono"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="px-3 py-2 hover:bg-muted rounded-lg transition-colors"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopySecret}
                className="px-3 py-2 hover:bg-muted rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={twoFAEnabled}
                  onChange={(e) => setTwoFAEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border border-border"
                />
                <span className="text-sm">I have saved my secret key in a secure location</span>
              </label>
              {twoFAEnabled && (
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Enable 2FA
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Two-factor authentication is active on your account
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Disable 2FA
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Active Sessions
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage all devices currently logged into your account
        </p>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{session.device}</span>
                  {session.current && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      Current Session
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.browser} • {session.location}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last active: {session.lastActive}
                </p>
              </div>
              {!session.current && (
                <button
                  onClick={() => revokeSession(session.id)}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>

        {activeSessions.length === 0 && (
          <p className="text-sm text-muted-foreground">No active sessions</p>
        )}
      </div>

      {/* Password Settings */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold mb-4">Password</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Change your password regularly to keep your account secure
        </p>
        <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          Change Password
        </button>
      </div>

      {/* Login Activity */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold mb-4">Login Activity</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Review recent login attempts to your account
        </p>
        <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          View All Activity
        </button>
      </div>
    </div>
  );
}
