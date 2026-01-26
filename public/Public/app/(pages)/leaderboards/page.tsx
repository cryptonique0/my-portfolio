'use client';

import MobileAppLayout from '../../components/common/MobileAppLayout';

export default function LeaderboardsPage() {
  const leaderboardData = [
    { rank: 1, name: 'Magnus Carlsen', rating: 2850, trophies: 12, badge: 'Grandmaster', country: '🇳🇴' },
    { rank: 2, name: 'Hikaru Nakamura', rating: 2820, trophies: 8, badge: 'Master', country: '🇺🇸' },
    { rank: 3, name: 'Fabiano Caruana', rating: 2800, trophies: 7, badge: 'Master', country: '🇺🇸' },
    { rank: 4, name: 'Ding Liren', rating: 2788, trophies: 6, badge: 'Master', country: '🇨🇳' },
    { rank: 5, name: 'Alireza Firouzja', rating: 2775, trophies: 5, badge: 'Expert', country: '🇫🇷' },
    { rank: 6, name: 'Ian Nepomniachtchi', rating: 2758, trophies: 4, badge: 'Expert', country: '🇷🇺' },
    { rank: 7, name: 'Giri, Anish', rating: 2740, trophies: 3, badge: 'Expert', country: '🇳🇱' },
    { rank: 8, name: 'Lê Quang Liêm', rating: 2735, trophies: 2, badge: 'Expert', country: '🇻🇳' },
  ];

  const yourRank = {
    rank: 47,
    name: 'ChessKing_2024',
    rating: 2450,
    trophies: 3,
    badge: 'Expert',
    country: '🇺🇸'
  };

  return (
    <MobileAppLayout>
      <div className="relative flex h-screen max-w-md mx-auto flex-col overflow-hidden">
        {/* Top App Bar */}
        <header className="flex flex-col pt-4 px-4 bg-background-light dark:bg-background-dark z-20 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full border-2 border-amber-400 p-0.5 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20">
                <span className="material-symbols-outlined text-amber-600 text-lg" style={{fontVariationSettings: '"FILL" 1'}}>emoji_events</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Global Ranking</p>
                <p className="text-sm font-bold leading-tight">Leaderboards</p>
              </div>
            </div>
            <button className="flex items-center justify-center h-9 px-3 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Weekly
            </button>
          </div>

          {/* Your Rank Card */}
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-blue-400/10 border border-primary/20 dark:border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold text-sm">
                  #{yourRank.rank}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Your Position</p>
                  <p className="text-sm font-bold">{yourRank.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary">{yourRank.rating}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{yourRank.badge}</p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-4">Top Players</h1>

          {/* Filter Tabs */}
          <div className="flex h-9 items-center justify-start gap-2 mb-4 overflow-x-auto">
            {['All Time', 'Monthly', 'Weekly', 'Blitz'].map((filter, idx) => (
              <button
                key={idx}
                className={`flex shrink-0 h-full items-center justify-center rounded-lg px-3 text-sm font-bold leading-normal transition-all ${
                  idx === 0
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-24">
          {/* Top 3 Podium */}
          <div className="px-4 py-6 space-y-2">
            <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Top Ranked Players
            </div>
            <div className="grid grid-cols-3 gap-2 h-40">
              {/* Silver - #2 */}
              <div className="flex flex-col items-center justify-end gap-2 order-first">
                <div className="w-full aspect-square rounded-lg bg-center bg-no-repeat bg-cover border-4 border-slate-300 dark:border-slate-600 overflow-hidden" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCYDdsaRC1CqICPi_XuK3Yu7Yi-ylnvqsSQu6engEBVh-cW3kUv2fSUpdeCMm0RCGcfqzZMFiTWqazszZplWTm2ZfrRn_MoEy_JwgmeImZLt3iq3NZQujSNepAjt1plAvNU3OXdYRPZ6Fn5t5ahfnBOEchM13W_V_RmfHjv16wfSOuI_Z7JU-WIx8uPtDtlOl-aOQVODrw39C9HW0qIStkfcasBuup7DIHCZPArlFffTJjEiqX6NOCdCkzvHXxh6PK6IGALPAEnPWWJ)'}}></div>
                <div className="flex items-center justify-center size-8 rounded-full bg-slate-300 dark:bg-slate-600 font-black text-sm text-slate-800 dark:text-white border-2 border-white dark:border-slate-800">
                  🥈
                </div>
                <p className="text-[10px] font-bold text-center leading-tight">Hikaru<br/>2820</p>
              </div>

              {/* Gold - #1 */}
              <div className="flex flex-col items-center justify-end gap-2 order-2">
                <div className="text-2xl font-black text-amber-500 dark:text-amber-400 text-center">★</div>
                <div className="w-full aspect-square rounded-lg bg-center bg-no-repeat bg-cover border-4 border-amber-400 dark:border-amber-600 overflow-hidden" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAGF2EXG7IQVWJSVmH8inHu2Y--UJoJLh4LWaiRQ8pGIoJ9CCGBlFVDwpmcCU9qb3OwAfbDTDBwgbAGGPei4oy5UqBP6ovnaA8YH3LA0W_AKna9_soLjM-aLNVzND18WionWjDZBz98GVNwinAeSLM1qgYKxc4kgCQ6bmhek3Kbp7EuvVW0QhhcvOiCXttqfmTYEVhR7fXYd2O99ZNY6fWNBcZD_cshSJRe4tUwwPb-jMU4YVHUrS-Iq14fi-z5mZyp5pEpTyjWxrmi)'}}></div>
                <div className="flex items-center justify-center size-8 rounded-full bg-amber-400 dark:bg-amber-600 font-black text-sm text-amber-800 dark:text-white border-2 border-white dark:border-amber-700">
                  🥇
                </div>
                <p className="text-[10px] font-bold text-center leading-tight">Magnus<br/>2850</p>
              </div>

              {/* Bronze - #3 */}
              <div className="flex flex-col items-center justify-end gap-2 order-3">
                <div className="w-full aspect-square rounded-lg bg-center bg-no-repeat bg-cover border-4 border-orange-600 dark:border-orange-700 overflow-hidden" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBQPDOdhXEt3OqKzGyEBOzYjvEuHLDHOTf2F_WQr0ZOYCwBjW5Fj8YFBZOLZAKrVzQYnBJYWFMx8rT3rW8F8A_1gYKuSNvWxn0YYKgXm5Ckd3HLvq5gGHgFEp4F7B5nNmAQlVfW9O3lO75K6JbU02l92FOMcw)'}}></div>
                <div className="flex items-center justify-center size-8 rounded-full bg-orange-600 dark:bg-orange-700 font-black text-sm text-white border-2 border-white dark:border-orange-800">
                  🥉
                </div>
                <p className="text-[10px] font-bold text-center leading-tight">Fabiano<br/>2800</p>
              </div>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="px-4 space-y-1">
            {leaderboardData.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-[#1c2433] hover:shadow-md hover:border-primary/20 transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                {/* Rank Badge */}
                <div className={`flex items-center justify-center size-9 rounded-lg font-bold text-sm flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                  idx === 1 ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200' :
                  idx === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  #{player.rank}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{player.name}</p>
                    <span className="text-xs">{player.country}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-bold">
                      {player.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{player.trophies} Tournament wins</p>
                </div>

                {/* Rating */}
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-black text-primary">{player.rating}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Rating</p>
                </div>
              </div>
            ))}
          </div>

          {/* See More Button */}
          <div className="px-4 py-4 text-center">
            <button className="w-full h-10 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity">
              View Full Leaderboard (500+ players)
            </button>
          </div>
        </main>
      </div>
    </MobileAppLayout>
  );
}
