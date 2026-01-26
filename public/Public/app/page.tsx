'use client';

import MobileAppLayout from './components/common/MobileAppLayout';
import ThemeToggle from './components/ThemeToggle';
import PlayerComparison from './components/PlayerComparison';
import Link from 'next/link';

export default function Home() {
  const user = {
    name: 'ChessKing_2024',
    rating: 2450,
    eth: 0.428,
    usdc: 1250.0,
    gwei: 5420.50,
    level: 'Grandmaster',
    streakDays: 12,
  };

  const quickStats = [
    { 
      label: 'Games Played', 
      value: '47', 
      icon: 'sports_esports', 
      color: 'text-blue-600 dark:text-blue-400',
      trend: '+5 this week',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      label: 'Win Rate', 
      value: '68%', 
      icon: 'trending_up', 
      color: 'text-green-600 dark:text-green-400',
      trend: '+2% this week',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    { 
      label: 'Rating', 
      value: '2450', 
      icon: 'star', 
      color: 'text-amber-600 dark:text-amber-400',
      trend: '+50 rating',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
  ];

  const recentActivity = [
    { type: 'Won', opponent: 'Master_Player', time: '2h ago', result: 'Won by resignation', rating: '+45' },
    { type: 'Draw', opponent: 'LuckyChess', time: '1d ago', result: 'Draw by agreement', rating: '+0' },
    { type: 'Lost', opponent: 'GrandmasterX', time: '2d ago', result: 'Lost in time', rating: '-32' },
  ];

  return (
    <MobileAppLayout>
      <div className="relative flex min-h-screen max-w-md mx-auto flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Header with Glassmorphism Effect */}
        <header className="flex flex-col px-4 pt-4 pb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {/* Top Bar with Profile & Balance */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-1">
              {/* Profile Avatar with Glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-lg opacity-50"></div>
                <div className="relative size-12 rounded-full border-2 border-gradient-to-r from-blue-500 to-purple-600 p-0.5 bg-white dark:bg-slate-800">
                  <div className="h-full w-full rounded-full bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuB7i18cJ6pXr1uOnL49FTETulcMFOV9XIsxkYjjiLhyw7BULd3wmcKcH_ENXsiwS6yZAq3U1AhDVCa0o3ztA8SYWZv7G1Dl5Xs3ew8zwMiqnMb6KbVgbYvWG7n4sUaoELbtMUBqoqFaX0JYs-jty_R90WgSs3K0nIR-6AWQnZD9l4Oxwp7xsKjobR6qklZMccd20umhBawaOfTGQbSo4lrWsb3uLy2MrrgRql_fUmM9OCdznFZL-ZwCNgMS1dwZF_ETKhLUCTBYNneo)'}}></div>
                </div>
              </div>
              
              {/* User Info */}
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Welcome Back</p>
                <p className="text-lg font-black leading-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">{user.name}</p>
              </div>
            </div>
            
            {/* Streak Badge & Theme Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200/50 dark:border-amber-700/50">
                <span className="text-lg">🔥</span>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{user.streakDays}d</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Main Stats Card with Gradient */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 border border-blue-400/30 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">Current Rating</p>
                <p className="text-4xl font-black drop-shadow-lg">{user.rating}</p>
                <p className="text-xs font-semibold text-blue-200 mt-1">{user.level}</p>
              </div>
              <span className="material-symbols-outlined text-white text-5xl opacity-40 drop-shadow-lg" style={{fontVariationSettings: '"FILL" 1'}}>emoji_events</span>
            </div>
            
            {/* Assets Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
              <div className="flex flex-col bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
                <p className="text-[9px] text-blue-100 font-bold uppercase">ETH Balance</p>
                <p className="text-lg font-black text-white mt-1">{user.eth}</p>
              </div>
              <div className="flex flex-col bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
                <p className="text-[9px] text-blue-100 font-bold uppercase">USDC</p>
                <p className="text-lg font-black text-white mt-1">${user.usdc.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Dashboard</h1>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          {/* Quick Stats */}
          <div className="px-4 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Quick Stats</h2>
              <span className="text-xs font-bold text-slate-500">This Week</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {quickStats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl ${stat.bgColor} border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-center justify-center mb-3 p-2 bg-white dark:bg-slate-800 rounded-lg w-full">
                    <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">{stat.trend}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-4 py-4 space-y-3">
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/(pages)/play" className="group flex items-center justify-center h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105">
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-2xl">sports_esports</span>
                  <span className="text-xs font-bold">Play Now</span>
                </div>
              </Link>
              <Link href="/(pages)/training" className="group flex items-center justify-center h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white font-black hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105">
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-2xl">school</span>
                  <span className="text-xs font-bold">Learn</span>
                </div>
              </Link>
              <Link href="/(pages)/puzzles" className="group flex items-center justify-center h-16 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white font-black hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105">
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-2xl">puzzle</span>
                  <span className="text-xs font-bold">Puzzles</span>
                </div>
              </Link>
              <Link href="/(pages)/coaches" className="group flex items-center justify-center h-16 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white font-black hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105">
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-2xl">person</span>
                  <span className="text-xs font-bold">Coaches</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-4 py-6 space-y-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Recent Activity</h2>
              <Link href="/(pages)/leaderboards" className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1">
                View all 
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-102 cursor-pointer ${
                    activity.type === 'Won' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                      : activity.type === 'Draw' 
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`flex items-center justify-center size-11 rounded-lg font-black text-xl ${
                      activity.type === 'Won' 
                        ? 'bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                        : activity.type === 'Draw' 
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300' 
                        : 'bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    }`}>
                      {activity.type === 'Won' ? '✓' : activity.type === 'Draw' ? '=' : '✕'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{activity.opponent}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{activity.result}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className={`text-xs font-black ${
                      activity.type === 'Won' 
                        ? 'text-green-700 dark:text-green-300' 
                        : activity.type === 'Draw' 
                        ? 'text-slate-700 dark:text-slate-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>{activity.rating}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="px-4 py-6 space-y-4 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Explore</h2>
            <div className="space-y-3">
              <Link href="/(pages)/online" className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-11 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">public</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Tournaments</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Join global competitions</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600">arrow_forward</span>
              </Link>
              <Link href="/(pages)/wallet" className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-600 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-11 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Wallet & Assets</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Manage crypto & NFTs</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600">arrow_forward</span>
              </Link>
              <Link href="/(pages)/leaderboards" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-11 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl" style={{fontVariationSettings: '"FILL" 1'}}>emoji_events</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Leaderboards</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Climb the global rankings</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Player Comparison Section */}
          <PlayerComparison 
            userRating={user.rating} 
            bestRating={3200}
            personalBest={2450}
            trend={50}
          />
        </main>
      </div>
    </MobileAppLayout>
  );
}
