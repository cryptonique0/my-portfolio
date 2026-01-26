'use client';

import MobileAppLayout from '../../components/common/MobileAppLayout';

export default function OnlinePage() {
  const tournaments = [
    {
      name: 'Elite Grandmasters Open',
      registered: 92,
      max: 128,
      prizePool: 2500,
      entryFee: 25,
      featured: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGF2EXG7IQVWJSVmH8inHu2Y--UJoJLh4LWaiRQ8pGIoJ9CCGBlFVDwpmcCU9qb3OwAfbDTDBwgbAGGPei4oy5UqBP6ovnaA8YH3LA0W_AKna9_soLjM-aLNVzND18WionWjDZBz98GVNwinAeSLM1qgYKxc4kgCQ6bmhek3Kbp7EuvVW0QhhcvOiCXttqfmTYEVhR7fXYd2O99ZNY6fWNBcZD_cshSJRe4tUwwPb-jMU4YVHUrS-Iq14fi-z5mZyp5pEpTyjWxrmi',
    },
    {
      name: 'Intermediate Players Cup',
      registered: 56,
      max: 64,
      prizePool: 1200,
      entryFee: 15,
      featured: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYDdsaRC1CqICPi_XuK3Yu7Yi-ylnvqsSQu6engEBVh-cW3kUv2fSUpdeCMm0RCGcfqzZMFiTWqazszZplWTm2ZfrRn_MoEy_JwgmeImZLt3iq3NZQujSNepAjt1plAvNU3OXdYRPZ6Fn5t5ahfnBOEchM13W_V_RmfHjv16wfSOuI_Z7JU-WIx8uPtDtlOl-aOQVODrw39C9HW0qIStkfcasBuup7DIHCZPArlFffTJjEiqX6NOCdCkzvHXxh6PK6IGALPAEnPWWJ',
    },
  ];

  return (
    <MobileAppLayout>
      <div className="relative flex h-screen max-w-md mx-auto flex-col overflow-hidden">
        {/* Top App Bar */}
        <header className="flex flex-col pt-4 px-4 bg-background-light dark:bg-background-dark z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full border-2 border-primary/30 p-0.5">
                <div className="h-full w-full rounded-full bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuB7i18cJ6pXr1uOnL49FTETulcMFOV9XIsxkYjjiLhyw7BULd3wmcKcH_ENXsiwS6yZAq3U1AhDVCa0o3ztA8SYWZv7G1Dl5Xs3ew8zwMiqnMb6KbVgbYvWG7n4sUaoELbtMUBqoqFaX0JYs-jty_R90WgSs3K0nIR-6AWQnZD9l4Oxwp7xsKjobR6qklZMccd20umhBawaOfTGQbSo4lrWsb3uLy2MrrgRql_fUmM9OCdznFZL-ZwCNgMS1dwZF_ETKhLUCTBYNneo)'}}></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Base Network</p>
                <p className="text-sm font-bold leading-tight">0x71C...4f21</p>
              </div>
            </div>
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-full px-3 py-1.5 gap-2">
              <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: '"FILL" 1'}}>account_balance_wallet</span>
              <span className="text-sm font-bold">1,240.50 USDC</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-4">Tournaments</h1>

          {/* Segmented Controls */}
          <div className="flex h-11 items-center justify-center rounded-xl bg-slate-200 dark:bg-[#1c2433] p-1 mb-4">
            {['Active', 'Upcoming', 'My History'].map((tab, idx) => (
              <label key={idx} className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold leading-normal transition-all ${
                idx === 0
                  ? 'bg-white dark:bg-background-dark shadow-sm text-primary'
                  : 'text-slate-500 dark:text-[#9da6b9]'
              }`}>
                <span className="truncate">{tab}</span>
              </label>
            ))}
          </div>
        </header>

        {/* Filters Chips */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {['Entry Fee', 'Prize Pool', 'Blitz Only'].map((filter, idx) => (
            <button key={idx} className="flex h-8 shrink-0 items-center justify-center gap-x-1 rounded-lg bg-slate-200 dark:bg-slate-800 px-3 border border-transparent active:border-primary/50">
              <p className="text-xs font-bold">{filter}</p>
              {idx < 2 && <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {tournaments.map((tournament, idx) => (
            <div
              key={idx}
              className={tournament.featured ? "relative overflow-hidden rounded-xl border border-primary/20 bg-white dark:bg-[#1c2433] shadow-lg group" : "flex flex-col rounded-xl bg-white dark:bg-[#1c2433] shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden"}
            >
              {tournament.featured && (
                <>
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full">
                    <div className="size-1.5 rounded-full bg-white animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Live Bracket</span>
                  </div>
                  <div className="aspect-[16/8] w-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: `url('${tournament.image}')`}}></div>
                </>
              )}

              {!tournament.featured && (
                <div className="flex">
                  <div className="w-1/3 aspect-square bg-center bg-no-repeat bg-cover" style={{backgroundImage: `url('${tournament.image}')`}}></div>
                  <div className="w-2/3 p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tournament.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{tournament.registered} Players</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-primary uppercase">Prize Pool</p>
                      <p className="text-lg font-black text-primary">${tournament.prizePool}</p>
                    </div>
                  </div>
                </div>
              )}

              {tournament.featured && (
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold leading-none mb-1">{tournament.name}</h3>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">group</span>
                        <p className="text-xs font-medium">{tournament.registered} / {tournament.max} Registered</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-primary uppercase">Prize Pool</p>
                      <p className="text-lg font-black text-primary">${tournament.prizePool}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Entry Fee</span>
                      <span className="text-sm font-bold">${tournament.entryFee}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <span className="material-symbols-outlined mr-1">account_tree</span>
                        Spectate
                      </button>
                      <button className="flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
                        Join Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!tournament.featured && (
                <div className="p-3 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Entry Fee</p>
                    <p className="text-lg font-bold">${tournament.entryFee}</p>
                  </div>
                  <button className="mt-2 w-full flex items-center justify-center h-9 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity">
                    Join Tournament
                  </button>
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </MobileAppLayout>
  );
}
