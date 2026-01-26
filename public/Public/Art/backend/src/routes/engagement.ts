import { Router, Request, Response } from 'express';

const router = Router();

// Mocked XP + badge data (would be persisted in DB in production)
// Mocked quest data
const quests = [
  {
    id: 'quest-unique-creators',
    title: 'Diversity Collector',
    description: 'Buy from 3 unique creators in 48h',
    rewardXp: 500,
    badge: 'Diversity Champ',
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    progress: 2,
    target: 3
  },
  {
    id: 'quest-streak',
    title: 'Streak Starter',
    description: 'Buy or sell every day for 5 days',
    rewardXp: 800,
    badge: 'Streaker',
    expiresAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    progress: 1,
    target: 5
  }
];

// Mocked social proof events
const socialProof = [
  { user: '0xA1ce9d...', action: 'bought', nft: 'Base Builders #777', time: '2m ago' },
  { user: '0xB2c0ff...', action: 'minted', nft: 'Astro Bloom', time: '5m ago' },
  { user: '0xC3a11f...', action: 'listed', nft: 'Pixel Paradise #99', time: '8m ago' }
];

// Mocked portfolio health
const portfolioHealth = {
  address: '0xYourAddress',
  diversityScore: 78,
  verifiedCollections: 4,
  unrealizedPnL: 1.7,
  tips: [
    'Collect from more creators to boost your diversity score',
    'List at least 1 NFT from a verified collection for a bonus',
    'Sell an NFT above mint price to realize PnL'
  ]
};

const leaderboard = [
  {
    address: '0xA1ce9d8bF43c1F9d91B7cE45d7e6a12f3cA1b001',
    username: 'BaseWhale',
    xp: 12850,
    volume: 412.3,
    streakDays: 21,
    badges: ['Base OG', 'Verified Collector', 'Streak Champion'],
    lastAction: 'buy',
    lastActiveAt: new Date().toISOString()
  },
  {
    address: '0xB2c0ffee21C0ffee21C0ffee21C0ffee21C0ffee',
    username: 'ArtQueen',
    xp: 10420,
    volume: 298.4,
    streakDays: 13,
    badges: ['Legendary Volume', 'Referral Pro'],
    lastAction: 'mint',
    lastActiveAt: new Date().toISOString()
  },
  {
    address: '0xC3a11f00d1234567890abcdefC3a11f00d123456',
    username: 'SignalSeeker',
    xp: 8890,
    volume: 212.9,
    streakDays: 9,
    badges: ['Hot Streak', 'Verified Collector'],
    lastAction: 'list',
    lastActiveAt: new Date().toISOString()
  },
  {
    address: '0xD4eadb33f9876543210abcdefD4eadb33f987654',
    username: 'RefRaid',
    xp: 7920,
    volume: 188.1,
    streakDays: 5,
    badges: ['Referral Pro', 'Safety First'],
    lastAction: 'sell',
    lastActiveAt: new Date().toISOString()
  }
];

const referralLeaders = [
  { address: '0xRefTop1', username: 'ViralMint', referrals: 182, volume: 142.3, rewards: 4.2 },
  { address: '0xRefTop2', username: 'GrowthGuru', referrals: 141, volume: 119.8, rewards: 3.5 },
  { address: '0xRefTop3', username: 'SignalSeeker', referrals: 98, volume: 88.4, rewards: 2.4 }
];

const dropCalendar = [
  {
    id: 'drop-astro',
    title: 'Astro Bloom',
    creator: '0xA1ce9d8bF43c1F9d91B7cE45d7e6a12f3cA1b001',
    supply: 500,
    allowlistOpen: new Date(Date.now() + 3600 * 1000).toISOString(),
    mintOpen: new Date(Date.now() + 3600 * 1000 * 6).toISOString(),
    mintClose: new Date(Date.now() + 3600 * 1000 * 30).toISOString(),
    priceEth: 0.12,
    allowlistSpots: 150,
    isFeatured: true,
    tags: ['sci-fi', 'animated', 'base-native']
  },
  {
    id: 'drop-kinetic',
    title: 'Kinetic Lines',
    creator: '0xB2c0ffee21C0ffee21C0ffee21C0ffee21C0ffee',
    supply: 250,
    allowlistOpen: new Date(Date.now() + 3600 * 1000 * 12).toISOString(),
    mintOpen: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
    mintClose: new Date(Date.now() + 3600 * 1000 * 48).toISOString(),
    priceEth: 0.2,
    allowlistSpots: 80,
    isFeatured: false,
    tags: ['minimal', 'generative', 'monochrome']
  }
];

const recommendationPool = [
  {
    id: 'rec-1',
    name: 'Base Builders #777',
    image: '/images/nfts/base-builders-777.svg',
    tags: ['base-native', '3d', 'builders'],
    score: 0.92,
    reason: 'High overlap with your collected Base-native 3D sets'
  },
  {
    id: 'rec-2',
    name: 'Digital Dreams #042',
    image: '/images/nfts/digital-dreams-042.svg',
    tags: ['dream', 'neo-noir'],
    score: 0.84,
    reason: 'You favor neo-noir palettes and animated pieces'
  },
  {
    id: 'rec-3',
    name: 'Pixel Paradise #99',
    image: '/images/nfts/pixel-paradise-99.svg',
    tags: ['pixel', 'retro'],
    score: 0.77,
    reason: 'Recent bids on pixel-art collections'
  }
];

const trustSignals = {
  badges: [
    { code: 'PROVENANCE', label: 'On-chain provenance', description: 'Minted + transfers verified on Base', severity: 'info' },
    { code: 'VERIFIED_CREATOR', label: 'Verified creator', description: 'Creator identity attested', severity: 'success' },
    { code: 'SUSPICIOUS', label: 'Suspicious activity', description: 'Abnormal volume or copied metadata detected', severity: 'warning' }
  ],
  recentAlerts: [
    {
      collection: '0xCopyCat...',
      reason: 'Metadata similarity to 3 verified sets',
      action: 'flagged',
      flaggedAt: new Date().toISOString()
    }
  ]
};

router.get('/leaderboard', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '10', 10);
  const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp);
  res.json({ success: true, leaderboard: sorted.slice(0, limit) });
});

router.get('/user/:address', (req: Request, res: Response) => {
  const { address } = req.params;
  const base = leaderboard.find((p) => p.address.toLowerCase() === address.toLowerCase());

  const summary = base || {
    address,
    username: address.slice(0, 6) + '...' + address.slice(-4),
    xp: 540,
    volume: 3.2,
    streakDays: 1,
    badges: ['New Collector'],
    lastAction: 'view',
    lastActiveAt: new Date().toISOString()
  };

  const multipliers = {
    buy: 50,
    sell: 60,
    mint: 80,
    list: 30,
    referral: 120
  };

  res.json({ success: true, summary, multipliers });
});

router.get('/referrals', (req: Request, res: Response) => {
  const address = (req.query.address as string) || '0xYourAddress';
  const base = referralLeaders[0];

  const you = {
    address,
    code: `BIT-${address.slice(2, 6).toUpperCase()}`,
    clicks: 92,
    signups: 41,
    referredVolume: 36.4,
    rewardsEth: 1.1,
    pendingRewardsEth: 0.3,
    rank: 7
  };

  res.json({ success: true, you, topReferrers: referralLeaders, baseline: base });
});

router.get('/drops', (_req: Request, res: Response) => {
  const sorted = [...dropCalendar].sort((a, b) => new Date(a.mintOpen).getTime() - new Date(b.mintOpen).getTime());
  res.json({ success: true, drops: sorted });
});

router.post('/drops/:id/notify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, webhook } = req.body;

  if (!email && !webhook) {
    return res.status(400).json({ success: false, error: 'email or webhook required' });
  }

  const drop = dropCalendar.find((d) => d.id === id);
  if (!drop) {
    return res.status(404).json({ success: false, error: 'Drop not found' });
  }

  res.json({ success: true, message: 'Notification registered', dropId: id, channel: email ? 'email' : 'webhook' });
});

router.get('/recommendations', (req: Request, res: Response) => {
  const interest = ((req.query.tags as string) || '').split(',').filter(Boolean);

  const scored = recommendationPool.map((item) => {
    const overlap = interest.filter((tag) => item.tags.includes(tag)).length;
    return { ...item, score: item.score + overlap * 0.05 };
  });

  const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 8);
  res.json({ success: true, recommendations: sorted });
});

router.get('/trust', (_req: Request, res: Response) => {
  res.json({ success: true, trust: trustSignals });
});

export default router;