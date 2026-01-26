        // Drop calendar integration (Google/Apple)
        const addToCalendar = (drop: DropSchedule, type: 'google' | 'apple') => {
          const start = new Date(drop.mintOpen);
          const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour event
          const title = encodeURIComponent(drop.title + ' Mint Opens');
          const details = encodeURIComponent('Mint opens for ' + drop.title + ' on BitArt Market.');
          const location = encodeURIComponent(window.location.origin);
          const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
          const dates = `${dt(start)}/${dt(end)}`;
          if (type === 'google') {
            const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
            window.open(googleUrl, '_blank');
          } else {
            const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${drop.title} Mint Opens\nDESCRIPTION:Mint opens for ${drop.title} on BitArt Market.\nDTSTART:${dt(start)}\nDTEND:${dt(end)}\nLOCATION:${window.location.origin}\nEND:VEVENT\nEND:VCALENDAR`;
            const blob = new Blob([ics.replace(/\\n/g, '\r\n')], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${drop.title.replace(/\s+/g, '_')}_mint.ics`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 1000);
          }
        };
      // Gamified streak meter (mocked for now)
      const streak = 4;
      const streakGoal = 7;
      const aboutToLose = streak === 1;
          {/* Gamified Streak Meter */}
          <section className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                <span>Streak Meter</span>
                {aboutToLose && <span className="px-2 py-1 rounded-full bg-amber-500 text-white animate-pulse">About to lose streak!</span>}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-700 h-4 rounded-full transition-all animate-pulse"
                  style={{ width: `${Math.min(100, (streak / streakGoal) * 100)}%` }}
                />
                <div className="absolute left-2 top-0 h-4 flex items-center text-xs font-bold text-green-900 dark:text-green-100">{streak} / {streakGoal}</div>
                <div className="absolute right-2 top-0 h-4 flex items-center text-xs font-bold text-green-900 dark:text-green-100">{streakGoal}-day goal</div>
              </div>
            </div>
          </section>
    // Referral progress bar (mocked for now)
    const referralProgress = {
      current: 41,
      nextTier: 50,
      reward: 0.5
    };
        {/* Referral Progress Bar */}
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-200 font-semibold">Referral Progress</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(100, (referralProgress.current / referralProgress.nextTier) * 100)}%` }}
              />
              <div className="absolute left-2 top-0 h-4 flex items-center text-xs font-bold text-white">{referralProgress.current} / {referralProgress.nextTier}</div>
              <div className="absolute right-2 top-0 h-4 flex items-center text-xs font-bold text-purple-900 dark:text-purple-200">+{referralProgress.reward} ETH</div>
            </div>
          </div>
        </section>
  // Personal bests (mocked for now)
  const personalBests = {
    bestStreak: 7,
    biggestBuy: 2.5,
    fastestFlip: '3h 12m'
  };
      {/* Personal Bests */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
          <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl px-6 py-4 text-green-900 dark:text-green-100 font-semibold text-lg">
            🏅 Best Streak: {personalBests.bestStreak} days
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl px-6 py-4 text-blue-900 dark:text-blue-100 font-semibold text-lg">
            💸 Biggest Buy: {personalBests.biggestBuy} ETH
          </div>
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-xl px-6 py-4 text-amber-900 dark:text-amber-100 font-semibold text-lg">
            ⚡ Fastest Flip: {personalBests.fastestFlip}
          </div>
        </div>
      </section>
import { engagementExtraService, type Quest, type SocialProofEvent, type PortfolioHealth } from '../services/engagement-extra';
import defaultAvatar from '../components/default-avatar.png';
  const [quests, setQuests] = useState<Quest[]>([]);
  const [socialProof, setSocialProof] = useState<SocialProofEvent[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioHealth | null>(null);
    const fetchExtras = async () => {
      try {
        const [q, sp, ph] = await Promise.all([
          engagementExtraService.getQuests(),
          engagementExtraService.getSocialProof(),
          engagementExtraService.getPortfolioHealth(user.address)
        ]);
        setQuests(q);
        setSocialProof(sp);
        setPortfolio(ph);
      } catch (err) {
        // ignore
      }
    };
  fetchExtras();
      {/* Social Proof Strip */}
      <section className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 py-2 px-4">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto text-sm text-blue-900 dark:text-blue-100 items-center">
          {socialProof.map((e, i) => (
            <span key={i} className="whitespace-nowrap flex items-center gap-2">
              <img src={defaultAvatar} alt="avatar" className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-700" />
              <span>{e.user.slice(0, 6)}...</span> {e.action} <b>{e.nft}</b> <span className="text-xs text-gray-500">{e.time}</span>
            </span>
          ))}
        </div>
      </section>
      {/* Quests + Portfolio Health */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Active Quests</h3>
            <div className="space-y-4">
              {quests.map((q) => (
                <div key={q.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{q.title}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">{Math.max(0, Math.floor((new Date(q.expiresAt).getTime() - Date.now())/3600000))}h left</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{q.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">+{q.rewardXp} XP</span>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200">{q.badge}</span>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{q.progress}/{q.target}</span>
                    {q.progress === q.target && (
                      <span className="ml-2 px-2 py-1 rounded-full bg-emerald-500 text-white animate-bounce">Completed!</span>
                    )}
                    {q.target - q.progress === 1 && q.progress < q.target && (
                      <span className="ml-2 px-2 py-1 rounded-full bg-amber-400 text-white animate-pulse">Almost!</span>
                    )}
                  </div>
                </div>
              ))}
              {quests.length === 0 && <p className="text-gray-600 dark:text-gray-400">No active quests.</p>}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Portfolio Health</h3>
            {portfolio ? (
              <>
                <div className="flex gap-4 mb-2">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 text-xs">Diversity {portfolio.diversityScore}</span>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 text-xs">Verified {portfolio.verifiedCollections}</span>
                  <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 text-xs">Unrealized PnL {portfolio.unrealizedPnL} ETH</span>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-200">
                  {portfolio.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </>
            ) : <p className="text-gray-600 dark:text-gray-400">Loading portfolio health...</p>}
          </div>
        </div>
      </section>
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActivityFeed } from '../components/ActivityFeed';
import { useThemeStore } from '../store';
  const { isDarkMode, toggle: toggleTheme } = useThemeStore();
  // Leaderboard filter state
  const [lbFilter, setLbFilter] = useState<'xp' | 'volume' | 'streak' | 'referrals'>('xp');
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (lbFilter === 'xp') return b.xp - a.xp;
    if (lbFilter === 'volume') return b.volume - a.volume;
    if (lbFilter === 'streak') return b.streakDays - a.streakDays;
    // fallback to XP for now (referrals not in mock)
    return b.xp - a.xp;
  });
import { VerificationBadge } from '../components/VerificationBadge';
import { getTopCreators } from '../services/follows';
import { analyticsService, baseService } from '../services/api';
import {
  engagementService,
  type LeaderboardEntry,
  type DropSchedule,
  type Recommendation,
  type TrustSignals,
  type ReferralResponse
} from '../services/engagement';
import { MarketplaceStats } from '../types';
import { useUserStore } from '../store';
import { config } from '../config/env';
import { StatCardSkeleton } from '../components/SkeletonLoader';

interface MockNFT {
  id: string;
  name: string;
  image: string;
  price: number;
  creator: string;
  verified?: boolean;
  floorPrice?: number;
}

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [baseHealth, setBaseHealth] = useState<string>('Loading...');
  const [baseBalance, setBaseBalance] = useState<string | null>(null);
  const [isTestnet, setIsTestnet] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const { user } = useUserStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referrals, setReferrals] = useState<ReferralResponse | null>(null);
  const [drops, setDrops] = useState<DropSchedule[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trustSignals, setTrustSignals] = useState<TrustSignals | null>(null);
  const [copied, setCopied] = useState(false);

  // Mock trending NFTs for Base
  const mockTrendingNFTs: MockNFT[] = [
    {
      id: '1',
      name: 'CyberPunk Genesis #001',
      image: '/images/nfts/cyberpunk-001.svg',
      price: 0.5,
      creator: '0xArtist1',
      verified: true,
      floorPrice: 0.45
    },
    {
      id: '2',
      name: 'Digital Dreams #042',
      image: '/images/nfts/digital-dreams-042.svg',
      price: 0.75,
      creator: '0xCreator2',
      verified: false,
      floorPrice: 0.6
    },
    {
      id: '3',
      name: 'Base Builders #777',
      image: '/images/nfts/base-builders-777.svg',
      price: 1.25,
      creator: '0xDev3',
      verified: true,
      floorPrice: 1.0
    },
    {
      id: '4',
      name: 'Pixel Paradise #99',
      image: '/images/nfts/pixel-paradise-99.svg',
      price: 0.35,
      creator: '0xPixel4',
      verified: false,
      floorPrice: 0.3
    },
  ];

  // Top creators by followers
  const { data: topCreators, isLoading: loadingCreators } = useQuery({
    queryKey: ['topCreatorsHome'],
    queryFn: () => getTopCreators(6)
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await analyticsService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchEngagement = async () => {
      try {
        const [lb, ref, dr, recs, trust] = await Promise.all([
          engagementService.getLeaderboard(5),
          engagementService.getReferrals(user.address),
          engagementService.getDrops(),
          engagementService.getRecommendations(['base-native', 'generative']),
          engagementService.getTrust()
        ]);

        setLeaderboard(lb);
        setReferrals(ref);
        setDrops(dr);
        setRecommendations(recs);
        setTrustSignals(trust);
      } catch (error) {
        console.error('Failed to load engagement data:', error);
      }
    };

    const fetchBaseHealth = async () => {
      try {
        const data = await baseService.getHealth();
        setBaseHealth(data.clientVersion || 'Healthy');
      } catch (error) {
        setBaseHealth('Unavailable');
      }
    };

    fetchStats();
    fetchEngagement();
    fetchBaseHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user.address && user.chain === 'base') {
        try {
          const data = await baseService.getBalance(user.address);
          setBaseBalance(data.balance);
        } catch (error) {
          setBaseBalance(null);
        }
      }
    };

    fetchBalance();
  }, [user.chain, user.address]);

  const currentNetwork = isTestnet ? config.base.testnet : config.base.mainnet;

  const formatTimeLeft = (iso: string) => {
    const diffMs = new Date(iso).getTime() - Date.now();
    if (diffMs <= 0) return 'Live now';
    const hours = Math.floor(diffMs / 3_600_000);
    const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
    if (hours > 24) return `${Math.ceil(hours / 24)}d`; 
    if (hours >= 1) return `${hours}h ${minutes}m`;
    return `${Math.max(minutes, 1)}m`;
  };

  const copyInvite = async (code?: string) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Clipboard failed', err);
    }
  };

  const notifyDrop = async (id: string) => {
    const value = window.prompt('Enter email or webhook URL for drop alerts');
    if (!value) return;
    const payload = value.includes('http') ? { webhook: value } : { email: value };
    try {
      await engagementService.notifyDrop(id, payload);
      alert('Notification saved for this drop');
    } catch (err) {
      console.error('Notify failed', err);
      alert('Could not register notification');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Digital Art on Base
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Discover, create, and trade unique digital artworks on Base blockchain.
                Creators get royalties on every resale.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Explore Now
                </button>
                <button className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 blur-3xl" />
              <div className="relative h-full bg-gradient-to-br from-blue-900 via-gray-900 to-black rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/logo.png" 
                  alt="BitArt Market" 
                  className="w-4/5 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {loadingStats ? (
        <section className="bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      ) : stats && (
        <section className="bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalNfts.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">NFTs Created</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalVolume.toFixed(2)} ETH
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Trading Volume</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalSales.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Total Sales</p>
              </div>
            </div>

            {/* Base Network Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {currentNetwork.chainName}
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {isTestnet ? 'Testnet' : 'Mainnet'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsTestnet(true)}
                    disabled={isTestnet}
                    className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                      isTestnet
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Sepolia
                  </button>
                  <button
                    onClick={() => setIsTestnet(false)}
                    disabled={!isTestnet}
                    className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                      !isTestnet
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Mainnet
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">RPC: {baseHealth}</p>
                {user.chain === 'base' && user.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Balance: {baseBalance ? `${baseBalance} ETH` : 'Loading...'}</p>
                )}
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">BitArt Market</div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200">Ready</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create, mint, and trade NFTs on Base.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Section with Mock NFTs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Trending Now on {isTestnet ? 'Sepolia' : 'Base'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTrendingNFTs.map((nft) => (
              <div key={nft.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{nft.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{nft.price} ETH</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
                      Buy Now
                    </button>
                  </div>
                  {nft.floorPrice && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Floor: {nft.floorPrice} ETH</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* XP + Leaderboard + Referrals */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Collector Leaderboard</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Top collectors by XP, volume, streak</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setLbFilter('xp')} className={`px-2 py-1 rounded text-xs font-semibold ${lbFilter==='xp'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>XP</button>
                <button onClick={() => setLbFilter('volume')} className={`px-2 py-1 rounded text-xs font-semibold ${lbFilter==='volume'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Volume</button>
                <button onClick={() => setLbFilter('streak')} className={`px-2 py-1 rounded text-xs font-semibold ${lbFilter==='streak'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Streak</button>
                <button disabled className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed">Referrals</button>
              </div>
            </div>
            <div className="space-y-3">
              {sortedLeaderboard.map((entry, idx) => (
                <div
                  key={entry.address}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">{entry.username}</p>
                        <VerificationBadge address={entry.address} showLabel={false} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{entry.address.slice(0, 6)}...{entry.address.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">XP</p>
                      <p className="font-bold text-purple-600 dark:text-purple-400">{entry.xp.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Volume</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">{entry.volume.toFixed(1)} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Streak</p>
                      <p className="font-bold text-green-600 dark:text-green-400">{entry.streakDays}d</p>
                    </div>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400">Leaderboard loading...</p>
              )}
            </div>
          </div>
        {/* Theme toggle button */}
        <button
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full shadow-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-lg border-2 border-white dark:border-gray-900 hover:scale-105 transition-transform"
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Referral Boost</h3>
              <span className="text-xs bg-white/15 px-2 py-1 rounded-full">Kickback live</span>
            </div>
            {referrals ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/80">Your code</p>
                  <p className="text-2xl font-bold tracking-wide">{referrals.you.code}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/80">Volume</p>
                    <p className="text-lg font-bold">{referrals.you.referredVolume.toFixed(1)} ETH</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/80">Rewards</p>
                    <p className="text-lg font-bold">{referrals.you.rewardsEth.toFixed(2)} ETH</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/80">Signups</p>
                    <p className="text-lg font-bold">{referrals.you.signups}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/80">Rank</p>
                    <p className="text-lg font-bold">#{referrals.you.rank}</p>
                  </div>
                </div>
                <div className="text-sm text-white/80">
                  Top referrer: {referrals.topReferrers[0]?.username} · {referrals.topReferrers[0]?.volume.toFixed(1)} ETH
                </div>
                <button
                  className="w-full py-3 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  onClick={() => copyInvite(referrals.you.code)}
                >
                  {copied ? 'Copied!' : 'Copy Invite Link'}
                </button>
              </div>
            ) : (
              <p className="text-white/80">Loading referral insights...</p>
            )}
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Creators</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Ranked by followers</span>
          </div>

          {loadingCreators ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topCreators && topCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topCreators.map((creator: { address: string; followerCount: number }) => (
                <div
                  key={creator.address}
                  className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {creator.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                        </p>
                        <VerificationBadge address={creator.address} showLabel={false} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {creator.followerCount.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Engagement score powered by social signals</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No creator data yet.</p>
          )}
        </div>
      </section>

      {/* Drop Calendar + AI Picks + Trust */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Drop Calendar</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allowlist + countdown + featured</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">Early access</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drops.map((drop) => (
                  <div key={drop.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{drop.title}</p>
                      {drop.isFeatured && <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">Featured</span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Creator: {drop.creator.slice(0, 6)}...{drop.creator.slice(-4)}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Mint opens</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">{formatTimeLeft(drop.mintOpen)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Price</p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">{drop.priceEth} ETH</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Spots</p>
                        <p className="font-semibold text-purple-600 dark:text-purple-400">{drop.allowlistSpots}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                        onClick={() => notifyDrop(drop.id)}
                      >
                        Notify me
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => alert('Allowlist request captured (mock).')}
                      >
                        Request allowlist
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                        onClick={() => addToCalendar(drop, 'google')}
                      >
                        Add to Google Calendar
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition-colors"
                        onClick={() => addToCalendar(drop, 'apple')}
                      >
                        Add to Apple Calendar
                      </button>
                    </div>
                          {/* Bulk Actions (mock) */}
                          <section className="py-8 px-4 sm:px-6 lg:px-8">
                            <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
                              <button
                                className="px-6 py-3 rounded-lg bg-blue-700 text-white font-bold text-lg hover:bg-blue-800 transition-colors shadow"
                                onClick={() => alert('Bulk buy: All floor NFTs in your filters would be added to cart and purchased in one transaction (mock).')}
                              >
                                Bulk Buy Floor
                              </button>
                              <button
                                className="px-6 py-3 rounded-lg bg-purple-700 text-white font-bold text-lg hover:bg-purple-800 transition-colors shadow"
                                onClick={() => alert('Bulk list: All your selected NFTs would be listed at floor price in one transaction (mock).')}
                              >
                                Bulk List NFTs
                              </button>
                            </div>
                          </section>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {drop.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {drops.length === 0 && <p className="text-gray-600 dark:text-gray-400">No scheduled drops yet.</p>}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Picks For You</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">Cosine + popularity</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="flex gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {rec.name.split('#')[1] ? '#' + rec.name.split('#')[1] : rec.name.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{rec.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{rec.reason}</p>
                      <div className="flex items-center gap-2 text-xs mt-2">
                        {rec.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{tag}</span>
                        ))}
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200">Score {rec.score.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && <p className="text-gray-600 dark:text-gray-400">Recommendations will appear once you collect or search.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Safety & Trust</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Live preflight</span>
              </div>
              <div className="space-y-3">
                {trustSignals?.badges.map((badge) => (
                  <div
                    key={badge.code}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative group"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white cursor-help" title={badge.description}>
                      {badge.label}
                      <span className="ml-2 text-xs text-gray-400 group-hover:inline hidden absolute left-0 top-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 z-10 whitespace-nowrap shadow-lg">
                        {badge.description}
                      </span>
                    </p>
                  </div>
                ))}
                {!trustSignals && <p className="text-gray-600 dark:text-gray-400">Loading trust signals...</p>}
              </div>
              {trustSignals?.recentAlerts?.length ? (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Recent alerts</p>
                  {trustSignals.recentAlerts.map((alert) => (
                    <p key={alert.collection} className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.collection}: {alert.reason}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-bold mb-2">Ready for Top 10?</h4>
              <p className="text-sm text-white/80 mb-4">Earn XP for buys, sells, mints, listings, referrals. Streaks and safety badges boost your multiplier.</p>
              <button className="w-full py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Start a streak</button>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Activity */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace Activity</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Live events across the market</span>
          </div>
          <ActivityFeed limit={15} showFilters className="mt-4" />
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Featured Collection {i}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    Curated artworks from top creators
                  </p>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Items: {100 * i}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      Floor: {(i * 0.5).toFixed(2)} ETH
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Create?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Upload your artwork, set royalties, and start selling on BitArt Market.
            It takes just a few minutes.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-lg">
            Create Your First NFT
          </button>
        </div>
      </section>
    </div>
  );
};
