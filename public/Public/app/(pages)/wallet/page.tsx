'use client';

import MobileAppLayout from '../../components/common/MobileAppLayout';

export default function WalletPage() {
  const assets = [
    { name: '$CHESS Token', balance: '1,250.00', usdValue: '$3,250.00', change: '+12.5%', icon: '💎', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'ETH', balance: '0.428', usdValue: '$1,652.00', change: '+5.2%', icon: '⟠', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { name: 'USDC', balance: '2,500.00', usdValue: '$2,500.00', change: '±0%', icon: '©', color: 'bg-green-100 dark:bg-green-900/30' },
  ];

  const nfts = [
    { name: 'Base Chess Champion NFT', rarity: 'Legendary', floorPrice: '2.5 ETH', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGF2EXG7IQVWJSVmH8inHu2Y--UJoJLh4LWaiRQ8pGIoJ9CCGBlFVDwpmcCU9qb3OwAfbDTDBwgbAGGPei4oy5UqBP6ovnaA8YH3LA0W_AKna9_soLjM-aLNVzND18WionWjDZBz98GVNwinAeSLM1qgYKxc4kgCQ6bmhek3Kbp7EuvVW0QhhcvOiCXttqfmTYEVhR7fXYd2O99ZNY6fWNBcZD_cshSJRe4tUwwPb-jMU4YVHUrS-Iq14fi-z5mZyp5pEpTyjWxrmi' },
    { name: 'Tournament Winner Badge', rarity: 'Rare', floorPrice: '0.8 ETH', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYDdsaRC1CqICPi_XuK3Yu7Yi-ylnvqsSQu6engEBVh-cW3kUv2fSUpdeCMm0RCGcfqzZMFiTWqazszZplWTm2ZfrRn_MoEy_JwgmeImZLt3iq3NZQujSNepAjt1plAvNU3OXdYRPZ6Fn5t5ahfnBOEchM13W_V_RmfHjv16wfSOuI_Z7JU-WIx8uPtDtlOl-aOQVODrw39C9HW0qIStkfcasBuup7DIHCZPArlFffTJjEiqX6NOCdCkzvHXxh6PK6IGALPAEnPWWJ' },
    { name: '7-Day Streak Medal', rarity: 'Uncommon', floorPrice: '0.2 ETH', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQPDOdhXEt3OqKzGyEBOzYjvEuHLDHOTf2F_WQr0ZOYCwBjW5Fj8YFBZOLZAKrVzQYnBJYWFMx8rT3rW8F8A_1gYKuSNvWxn0YYKgXm5Ckd3HLvq5gGHgFEp4F7B5nNmAQlVfW9O3lO75K6JbU02l92FOMcw' },
  ];

  const transactions = [
    { type: 'Received', asset: '$CHESS', amount: '+250.00', date: '2 hours ago', status: 'completed' },
    { type: 'Sent', asset: 'USDC', amount: '-100.00', date: '1 day ago', status: 'completed' },
    { type: 'Staked', asset: '$CHESS', amount: '+1,000.00', date: '3 days ago', status: 'completed' },
  ];

  return (
    <MobileAppLayout>
      <div className="relative flex h-screen max-w-md mx-auto flex-col overflow-hidden">
        {/* Top App Bar */}
        <header className="flex flex-col pt-4 px-4 bg-background-light dark:bg-background-dark z-20 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full border-2 border-primary/30 p-0.5 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <span className="material-symbols-outlined text-primary text-lg" style={{fontVariationSettings: '"FILL" 1'}}>account_balance_wallet</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Web3 Wallet</p>
                <p className="text-sm font-bold leading-tight">Assets & NFTs</p>
              </div>
            </div>
            <button className="flex items-center justify-center h-9 px-3 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-sm mr-1">settings</span>
              Manage
            </button>
          </div>

          {/* Portfolio Summary */}
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-blue-400/10 border border-primary/20 dark:border-primary/30">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-black text-primary mb-2">$7,402.00</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-base">trending_up</span>
              <span>+8.2% (24h)</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-4">My Assets</h1>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto space-y-6 p-4 pb-24">
          {/* Cryptocurrencies Section */}
          <section>
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Crypto Assets</h2>
            <div className="space-y-2">
              {assets.map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-[#1c2433] border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer">
                  <div className={`flex items-center justify-center size-12 rounded-lg text-2xl ${asset.color}`}>
                    {asset.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{asset.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{asset.balance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{asset.usdValue}</p>
                    <p className={`text-xs font-semibold ${asset.change.includes('+') ? 'text-green-600 dark:text-green-400' : asset.change.includes('-') ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {asset.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* NFTs Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Chess NFTs</h2>
              <a href="#" className="text-xs font-bold text-primary hover:opacity-80 transition-opacity">View all →</a>
            </div>
            <div className="space-y-2">
              {nfts.map((nft, idx) => (
                <div key={idx} className="flex gap-3 rounded-lg bg-white dark:bg-[#1c2433] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all cursor-pointer">
                  <div className="w-20 h-20 shrink-0 bg-center bg-no-repeat bg-cover" style={{backgroundImage: `url('${nft.image}')`}}></div>
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-bold leading-tight">{nft.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold">
                          {nft.rarity}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Floor: {nft.floorPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Transactions */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Recent Activity</h2>
              <a href="#" className="text-xs font-bold text-primary hover:opacity-80 transition-opacity">View all →</a>
            </div>
            <div className="space-y-2">
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#1c2433] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`flex items-center justify-center size-10 rounded-lg ${
                      tx.type === 'Received' ? 'bg-green-100 dark:bg-green-900/30' :
                      tx.type === 'Sent' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <span className={`material-symbols-outlined ${
                        tx.type === 'Received' ? 'text-green-600 dark:text-green-400' :
                        tx.type === 'Sent' ? 'text-red-600 dark:text-red-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {tx.type === 'Received' ? 'call_received' : tx.type === 'Sent' ? 'call_made' : 'trending_up'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{tx.type}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'Received' || tx.type === 'Staked' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.amount} {tx.asset}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center h-11 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined mr-2">send</span>
              Send
            </button>
            <button className="flex-1 flex items-center justify-center h-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined mr-2">call_received</span>
              Receive
            </button>
          </div>
        </main>
      </div>
    </MobileAppLayout>
  );
}
