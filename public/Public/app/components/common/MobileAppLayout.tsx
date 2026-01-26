import React from 'react';

/**
 * Mobile-first app layout using Tailwind and glassmorphism, matching the main_player_hub design.
 * Usage: Wrap your page content in <MobileAppLayout>...</MobileAppLayout>
 */
export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 font-display">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-blue-600 dark:border-blue-400" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBxm0DC_HC0y6kB_rdUul_DvCqMGnpAZPZlYh_9xgia4eRcM-al3SRxRSp37Juxg2mWo2yqtdBwzs-Iygf_mWrczrUDgZVcxBrplsHaLcFsB8SuAkwRQdLQN1p45297MXBdEvDJUzNs-aSSIfar6G0HfujKAK8Tkr4xL3SPMkn-eh8BmgmsbLuKCm7-Dm_ZcbfDNhK_MjmURk5YG7jYvOKlga5gt0rppt9WtXrflHinXOQWb7c4UIwVAfHyWZMrHRFZ4hWYnz0QFw3q)'}}></div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 size-3 rounded-full border-2 border-white dark:border-slate-950"></div>
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white text-sm font-bold leading-tight">Grandmaster_X</h2>
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Base Network</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors">
              <span className="material-symbols-outlined" style={{fontSize: 20}}>search</span>
            </button>
            <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors">
              <span className="material-symbols-outlined" style={{fontSize: 20}}>notifications</span>
            </button>
          </div>
        </div>
      </div>
      {/* Main content */}
      <main className="px-0 sm:px-4 pt-2">{children}</main>
    </div>
  );
}
