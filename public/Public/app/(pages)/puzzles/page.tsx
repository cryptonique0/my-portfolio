'use client';

import MobileAppLayout from '../../components/common/MobileAppLayout';
import PuzzleTraining from '../../components/features/PuzzleTraining';

export default function PuzzlesPage() {
  return (
    <MobileAppLayout>
      <main className="max-w-md mx-auto pb-24">
        {/* Streak Info Banner */}
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-r from-orange-500/10 to-primary/10 border border-orange-500/20 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 rounded-lg p-1.5 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg" style={{fontVariationSettings: '"FILL" 1'}}>local_fire_department</span>
              </div>
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">5 Day Streak</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">2 days until Rare NFT Drop</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </div>
        </div>

        {/* Featured Daily Challenge Card */}
        <div className="p-4">
          <div className="relative overflow-hidden group rounded-xl bg-slate-900 shadow-2xl shadow-primary/10">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
            <div className="relative z-10 p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-primary text-[10px] font-black text-white rounded uppercase tracking-tighter">Daily Special</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className="material-symbols-outlined text-yellow-400 text-sm" style={{fontVariationSettings: '"FILL" 1'}}>star</span>
                  ))}
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">Daily Tactical Challenge</h2>
              <p className="text-slate-400 text-sm mb-6">Expert Level • 1850 ELO</p>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Reward</span>
                  <span className="text-lg font-bold text-white flex items-center gap-1">
                    50 XP <span className="text-primary text-xs">+</span> 2 $CHESS
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Ends In</span>
                  <span className="text-lg font-bold text-white">04:22:15</span>
                </div>
              </div>
              <button className="w-full bg-primary hover:bg-blue-600 transition-colors text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined">play_circle</span>
                Solve Now
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-30 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-[120px] text-white">grid_view</span>
            </div>
          </div>
        </div>

        {/* Training Grounds Section */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Training Grounds</h2>
          <button className="text-primary text-xs font-bold uppercase tracking-widest">See All</button>
        </div>

        {/* Puzzle Categories Grid */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {[
            { title: 'Pins & Skewers', level: 'Intermediate', solved: '12/20' },
            { title: 'Forks & Tactics', level: 'Advanced', solved: '8/20' },
            { title: 'Endgame', level: 'Expert', solved: '20/20' },
            { title: 'Sacrifices', level: 'Master', solved: '0/15' },
          ].map((category, idx) => (
            <div key={idx} className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group shadow-sm">
              <div className="h-32 bg-slate-200 dark:bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="bg-white/20 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-tighter">{category.level}</span>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{category.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{category.solved}</span>
                  <span className="text-primary font-bold">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Puzzle Training Component */}
        <div className="px-4 pb-4">
          <PuzzleTraining />
        </div>
      </main>
    </MobileAppLayout>
  );
}
