'use client';

import MobileAppLayout from '../../components/common/MobileAppLayout';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { label: 'Username', value: 'ChessKing_2024', icon: 'person' },
        { label: 'Email', value: 'player@base.eth', icon: 'mail' },
        { label: 'Profile Visibility', value: 'Public', icon: 'visibility' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Theme', value: 'Dark Mode', icon: 'dark_mode', toggle: true },
        { label: 'Notifications', value: 'Enabled', icon: 'notifications', toggle: true },
        { label: 'Sound', value: 'Enabled', icon: 'volume_up', toggle: true },
      ]
    },
    {
      title: 'Gameplay',
      items: [
        { label: 'Move Confirmation', value: 'Enabled', icon: 'done_all', toggle: true },
        { label: 'Animation Speed', value: 'Normal', icon: 'speed' },
        { label: 'Board Style', value: 'Standard', icon: 'dashboard' },
      ]
    },
    {
      title: 'Web3 & Wallet',
      items: [
        { label: 'Connected Wallet', value: '0x71C...4f21', icon: 'account_balance_wallet' },
        { label: 'Network', value: 'Base Mainnet', icon: 'language' },
        { label: 'NFT Gallery', value: 'Enabled', icon: 'collections' },
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { label: 'Two-Factor Auth', value: 'Disabled', icon: 'security', toggle: true },
        { label: 'Data Collection', value: 'Minimal', icon: 'privacy_tip' },
        { label: 'Blocked Players', value: '2 players', icon: 'block' },
      ]
    },
  ];

  return (
    <MobileAppLayout>
      <div className="relative flex h-screen max-w-md mx-auto flex-col overflow-hidden">
        {/* Top App Bar */}
        <header className="flex flex-col pt-4 px-4 bg-background-light dark:bg-background-dark z-20 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full border-2 border-primary/30 p-0.5">
                <div className="h-full w-full rounded-full bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuB7i18cJ6pXr1uOnL49FTETulcMFOV9XIsxkYjjiLhyw7BULd3wmcKcH_ENXsiwS6yZAq3U1AhDVCa0o3ztA8SYWZv7G1Dl5Xs3ew8zwMiqnMb6KbVgbYvWG7n4sUaoELbtMUBqoqFaX0JYs-jty_R90WgSs3K0nIR-6AWQnZD9l4Oxwp7xsKjobR6qklZMccd20umhBawaOfTGQbSo4lrWsb3uLy2MrrgRql_fUmM9OCdznFZL-ZwCNgMS1dwZF_ETKhLUCTBYNneo)'}}></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Settings</p>
                <p className="text-sm font-bold leading-tight">Configuration</p>
              </div>
            </div>
            <button className="flex items-center justify-center size-10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-4">Settings & Preferences</h1>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto space-y-1 pb-24">
          {settingsSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section Header */}
              <div className="sticky top-0 bg-background-light dark:bg-background-dark px-4 py-3 z-10 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xs font-bold text-primary uppercase tracking-widest">{section.title}</h2>
              </div>

              {/* Section Items */}
              <div className="flex flex-col">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer last:border-b-0"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        {!item.toggle && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.value}</p>
                        )}
                      </div>
                    </div>

                    {item.toggle ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 dark:peer-focus:ring-offset-background-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    ) : (
                      <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="px-4 py-6 mt-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
            <button className="w-full flex items-center justify-center h-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined mr-2 text-lg">logout</span>
              Sign Out
            </button>
            <button className="w-full flex items-center justify-center h-11 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <span className="material-symbols-outlined mr-2 text-lg">delete_outline</span>
              Delete Account
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <p className="mb-1">Chess Academy v2.0.1</p>
            <p className="text-[10px]">© 2024 All Rights Reserved</p>
          </div>
        </main>
      </div>
    </MobileAppLayout>
  );
}
