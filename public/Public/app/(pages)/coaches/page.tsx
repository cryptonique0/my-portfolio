'use client';

import MobileAppLayout from '../../components/common/MobileAppLayout';
import CoachMarketplace from '../../components/features/CoachMarketplace';

export default function CoachesPage() {
  const coaches = [
    {
      name: 'GM Magnus Carlsen',
      title: 'World Champion',
      rating: 2850,
      fee: 250,
      currency: 'USDC',
      badge: 'verified',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpnTQxdaDU5qSBkBL5ggdMfX3fopZPL7LHEG9Ic0pqejm0XMRBk9kR2xVxwR5eSmvZuylmHQzFa637qsDsI7CI7QVo-yJRF5MRVwxE6-brbpiBjsUFeQ_yN5-LIo-D8r2Zw79sRZSHZEVamUjEVAyOTMOdCN1CZMgcr7xpw0yH0qSofnGwHsoWlNjiKn-GY4dFrsaKmMOroHYP0o5e8ej9OSlInnpTrS3f6rzov1w5Hr-E9MIz0XPksTcmh1mlJMcw9Pp2OHmTeaJg',
    },
    {
      name: 'GM Hikaru Nakamura',
      title: 'Blitz Specialist',
      rating: 2820,
      fee: 200,
      currency: 'USDC',
      badge: 'verified',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpnTQxdaDU5qSBkBL5ggdMfX3fopZPL7LHEG9Ic0pqejm0XMRBk9kR2xVxwR5eSmvZuylmHQzFa637qsDsI7CI7QVo-yJRF5MRVwxE6-brbpiBjsUFeQ_yN5-LIo-D8r2Zw79sRZSHZEVamUjEVAyOTMOdCN1CZMgcr7xpw0yH0qSofnGwHsoWlNjiKn-GY4dFrsaKmMOroHYP0o5e8ej9OSlInnpTrS3f6rzov1w5Hr-E9MIz0XPksTcmh1mlJMcw9Pp2OHmTeaJg',
    },
  ];

  return (
    <MobileAppLayout>
      <header className="px-4 py-4 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[24px]">token</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">GM <span className="text-primary">Market</span></h1>
        </div>

        {/* Search Section */}
        <label className="flex flex-col w-full">
          <div className="flex w-full items-stretch rounded-xl h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-slate-400 flex items-center justify-center pl-4">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="flex w-full border-none bg-transparent focus:ring-0 text-base font-normal placeholder:text-slate-500 px-3"
              placeholder="Search Grandmasters or IMs"
            />
            <div className="flex items-center pr-2">
              <button className="p-2 text-primary">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>
        </label>
      </header>

      {/* Filter Chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
        {['All Coaches', 'English', 'Endgames', 'Under 150 USDC'].map((filter, idx) => (
          <button
            key={idx}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 whitespace-nowrap border text-sm font-medium ${
              idx === 0
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
            }`}
          >
            {filter}
            {idx > 0 && <span className="material-symbols-outlined text-sm">expand_more</span>}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Verified Masters</h3>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">security</span> Base Secured
        </span>
      </div>

      {/* Marketplace Cards */}
      <main className="flex flex-col gap-4 px-4 mt-2 pb-24">
        {coaches.map((coach, idx) => (
          <div key={idx} className="flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold tracking-tighter bg-amber-500/10 text-amber-500 px-1.5 rounded uppercase">
                    {coach.title}
                  </span>
                  <span className="flex items-center text-primary">
                    <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
                  </span>
                </div>
                <p className="text-xl font-extrabold leading-tight">{coach.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[12px] font-bold">
                    <span className="text-slate-500">BASE RATING</span>
                    <span className="text-primary">{coach.rating}</span>
                  </div>
                </div>
              </div>
              <div className="w-20 h-20 bg-center bg-no-repeat bg-cover rounded-xl border-2 border-primary/20" style={{backgroundImage: `url('${coach.avatar}')`}}></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Session Fee</p>
                <p className="text-lg font-bold flex items-center gap-1">{coach.fee} <span className="text-sm text-slate-400 font-medium">{coach.currency}</span></p>
              </div>
              <button className="flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white gap-2 text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                <span>Book Now</span>
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Full CoachMarketplace Component */}
      <div className="px-4 pb-4">
        <CoachMarketplace />
      </div>
    </MobileAppLayout>
  );
}
