'use client';

import MobileAppLayout from '../../components/common/MobileAppLayout';

export default function TrainingPage() {
  const lessons = [
    {
      id: 1,
      title: 'Italian Game',
      category: 'Openings',
      level: 'Beginner',
      duration: '12 min',
      progress: 75,
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfQSKm9Pc3Yo2jh9H0cWqJ9x0FmqMhqGBxj7xh8tLb5sZH_EYqX4F_sYVb4gCJhM_3yNPFYN-Z_rC7p4-W0AKJ35yDRTbH5p9mJ_pYh_S-rvOj7yb4GVKu3j-9Mha89eqAjAOXwAULDt2p5lbTmMKpLXbsT0Y'
    },
    {
      id: 2,
      title: 'Rook Endgames',
      category: 'Endgames',
      level: 'Intermediate',
      duration: '18 min',
      progress: 45,
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQPDOdhXEt3OqKzGyEBOzYjvEuHLDHOTf2F_WQr0ZOYCwBjW5Fj8YFBZOLZAKrVzQYnBJYWFMx8rT3rW8F8A_1gYKuSNvWxn0YYKgXm5Ckd3HLvq5gGHgFEp4F7B5nNmAQlVfW9O3lO75K6JbU02l92FOMcw'
    },
    {
      id: 3,
      title: 'Sicilian Defense',
      category: 'Openings',
      level: 'Advanced',
      duration: '25 min',
      progress: 30,
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK_7LK_PXQtGX3Fy2QnKNpwQhPkIqTsVbqJG9F8TQjQ0J7VpFMFgHfnfDYC8FNmj1hY_M3yIVZy8Q9XTwGKM_5QrAkrKVQKXyJLHVKZJREQMUPJf_x4dTnfSqbBwrKJyLzFxVGXnLNb0sYx3LlCEqTLMhx0Vg'
    },
    {
      id: 4,
      title: 'Piece Sacrifice Patterns',
      category: 'Tactics',
      level: 'Intermediate',
      duration: '15 min',
      progress: 60,
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvU-Jf7GN__KpQD_cRfVcVRLUxQ-R_P8XP1P8R-P_3R4C8k_V0P-Z_v8bh9YjzTYs7qQQT2zJLaKaG9AKM_7XwEkNMfJ7pXVvJz7BhECQ-e92Nzfnb4jqm94qI'
    }
  ];

  const stats = [
    { label: 'Lessons Completed', value: '18' },
    { label: 'Mastery Points', value: '540' },
    { label: 'Current Streak', value: '7 Days' }
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
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Learning Hub</p>
                <p className="text-sm font-bold leading-tight">Welcome Back!</p>
              </div>
            </div>
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-full px-3 py-1.5 gap-2">
              <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: '"FILL" 1'}}>auto_awesome</span>
              <span className="text-sm font-bold">Level 5</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center">{stat.label}</p>
                <p className="text-base font-black text-primary">{stat.value}</p>
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-4">My Curriculum</h1>

          {/* Filter Tabs */}
          <div className="flex h-9 items-center justify-start gap-2 mb-4 overflow-x-auto">
            {['All', 'Openings', 'Tactics', 'Endgames'].map((filter, idx) => (
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
        <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex gap-3 rounded-xl bg-white dark:bg-[#1c2433] shadow-md overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-24 h-24 shrink-0 bg-center bg-no-repeat bg-cover relative overflow-hidden">
                <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{backgroundImage: `url('${lesson.thumbnail}')`}}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl opacity-70">play_circle</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold leading-tight flex-1">{lesson.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary font-bold shrink-0">
                      {lesson.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{lesson.category} • {lesson.duration}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2">{lesson.progress}% Complete</p>
              </div>
            </div>
          ))}

          {/* Coming Soon Section */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold mb-3">Coming Soon</h2>
            <div className="space-y-2">
              {['Position Evaluation Masterclass', 'Psychological Tactics', 'Fortress Defense'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">lock</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </MobileAppLayout>
  );
}
