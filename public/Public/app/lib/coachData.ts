// Coach marketplace data
export interface Coach {
  address: `0x${string}`;
  name: string;
  title: string; // GM, IM, FM, NM, etc.
  bio: string;
  hourlyRate: bigint; // in wei
  rating: number; // out of 500 (5.00 stars)
  totalSessions: number;
  specialties: number[]; // indices into SPECIALTIES array
  languages: string[];
  timezone: string;
  availability: string;
  experience: string;
  peakRating: number; // FIDE rating
  verified: boolean;
  imageUrl?: string;
}

export interface Session {
  id: number;
  coachAddress: `0x${string}`;
  studentAddress: `0x${string}`;
  sessionType: number;
  scheduledTime: number; // unix timestamp
  duration: number; // minutes
  price: bigint;
  status: SessionStatus;
  rating?: number;
  feedback?: string;
  contentURI?: string;
}

export enum SessionStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
  Disputed = 4
}

export enum SessionType {
  OneOnOne = 0,
  GroupLesson = 1,
  GameAnalysis = 2,
  OpeningPrep = 3,
  TournamentPrep = 4
}

export const SPECIALTIES = [
  'Opening Theory',
  'Middlegame Strategy',
  'Endgame Technique',
  'Tactical Training',
  'Positional Play',
  'Attack & Defense',
  'Calculation',
  'Tournament Preparation',
  'Blitz & Rapid',
  'Classical Chess',
  'Game Analysis',
  'Psychology',
  'Time Management',
  'Chess for Kids',
  'Advanced Players'
];

export const SESSION_TYPE_NAMES = [
  'One-on-One Coaching',
  'Group Lesson',
  'Game Analysis',
  'Opening Preparation',
  'Tournament Preparation'
];

// Mock coach database
export const COACHES: Coach[] = [
  {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    name: 'Sarah Chen',
    title: 'GM',
    bio: 'Grandmaster with 15 years of coaching experience. Former national champion and Olympiad player. Specialized in helping intermediate players break through to advanced level.',
    hourlyRate: BigInt('50000000000000000'), // 0.05 ETH
    rating: 485, // 4.85 stars
    totalSessions: 127,
    specialties: [0, 7, 9], // Opening Theory, Tournament Prep, Classical
    languages: ['English', 'Mandarin'],
    timezone: 'UTC+8 (Asia/Shanghai)',
    availability: 'Mon-Fri: 9am-5pm, Sat: 10am-2pm',
    experience: '15+ years coaching, 2400+ FIDE rating',
    peakRating: 2485,
    verified: true
  },
  {
    address: '0x2345678901234567890123456789012345678901' as `0x${string}`,
    name: 'David Torres',
    title: 'IM',
    bio: 'International Master specializing in tactical training and aggressive play. Known for creative attacking chess and puzzle composition.',
    hourlyRate: BigInt('30000000000000000'), // 0.03 ETH
    rating: 470, // 4.70 stars
    totalSessions: 89,
    specialties: [3, 5, 8], // Tactical Training, Attack & Defense, Blitz & Rapid
    languages: ['English', 'Spanish'],
    timezone: 'UTC-5 (America/New_York)',
    availability: 'Tue-Sun: 2pm-10pm',
    experience: '10 years coaching, 2350 FIDE rating',
    peakRating: 2368,
    verified: true
  },
  {
    address: '0x3456789012345678901234567890123456789012' as `0x${string}`,
    name: 'Elena Petrov',
    title: 'FM',
    bio: 'FIDE Master focused on endgame technique and positional understanding. Patient teacher who excels at explaining complex concepts simply.',
    hourlyRate: BigInt('25000000000000000'), // 0.025 ETH
    rating: 460, // 4.60 stars
    totalSessions: 64,
    specialties: [2, 4, 10], // Endgame, Positional Play, Game Analysis
    languages: ['English', 'Russian'],
    timezone: 'UTC+3 (Europe/Moscow)',
    availability: 'Mon-Sat: 12pm-8pm',
    experience: '8 years coaching, 2280 FIDE rating',
    peakRating: 2295,
    verified: true
  },
  {
    address: '0x4567890123456789012345678901234567890123' as `0x${string}`,
    name: 'Raj Kumar',
    title: 'GM',
    bio: 'Experienced Grandmaster coach with proven track record of training juniors to master level. Systematic approach to chess improvement.',
    hourlyRate: BigInt('60000000000000000'), // 0.06 ETH
    rating: 495, // 4.95 stars
    totalSessions: 203,
    specialties: [0, 1, 6, 7], // Opening, Middlegame, Calculation, Tournament Prep
    languages: ['English', 'Hindi', 'Tamil'],
    timezone: 'UTC+5:30 (Asia/Kolkata)',
    availability: 'Daily: 6am-2pm, 6pm-9pm',
    experience: '20+ years coaching, 2550+ FIDE rating',
    peakRating: 2587,
    verified: true
  },
  {
    address: '0x5678901234567890123456789012345678901234' as `0x${string}`,
    name: 'Maria Santos',
    title: 'WGM',
    bio: 'Women Grandmaster specializing in coaching female players and juniors. Warm, encouraging teaching style with focus on building confidence.',
    hourlyRate: BigInt('35000000000000000'), // 0.035 ETH
    rating: 480, // 4.80 stars
    totalSessions: 156,
    specialties: [11, 13, 4], // Psychology, Chess for Kids, Positional Play
    languages: ['English', 'Portuguese', 'Spanish'],
    timezone: 'UTC-3 (America/Sao_Paulo)',
    availability: 'Mon-Fri: 3pm-9pm',
    experience: '12 years coaching, 2350 FIDE rating',
    peakRating: 2372,
    verified: true
  },
  {
    address: '0x6789012345678901234567890123456789012345' as `0x${string}`,
    name: 'Alex Weber',
    title: 'NM',
    bio: 'National Master with focus on helping adult improvers. Expert in explaining chess patterns and strategic concepts for busy professionals.',
    hourlyRate: BigInt('20000000000000000'), // 0.02 ETH
    rating: 450, // 4.50 stars
    totalSessions: 42,
    specialties: [1, 4, 12], // Middlegame Strategy, Positional Play, Time Management
    languages: ['English', 'German'],
    timezone: 'UTC+1 (Europe/Berlin)',
    availability: 'Wed-Sun: 4pm-11pm',
    experience: '5 years coaching, 2180 FIDE rating',
    peakRating: 2196,
    verified: false
  },
  {
    address: '0x7890123456789012345678901234567890123456' as `0x${string}`,
    name: 'Li Wei',
    title: 'IM',
    bio: 'International Master known for deep opening preparation and creative ideas. Helps players build complete opening repertoires.',
    hourlyRate: BigInt('40000000000000000'), // 0.04 ETH
    rating: 475, // 4.75 stars
    totalSessions: 98,
    specialties: [0, 3, 10], // Opening Theory, Tactical Training, Game Analysis
    languages: ['Mandarin', 'English'],
    timezone: 'UTC+8 (Asia/Shanghai)',
    availability: 'Tue-Sat: 7pm-11pm',
    experience: '10 years coaching, 2420 FIDE rating',
    peakRating: 2438,
    verified: true
  },
  {
    address: '0x8901234567890123456789012345678901234567' as `0x${string}`,
    name: 'Sofia Martinez',
    title: 'FM',
    bio: 'FIDE Master specializing in blitz and rapid chess. High-energy sessions focused on practical play and quick decision-making.',
    hourlyRate: BigInt('28000000000000000'), // 0.028 ETH
    rating: 465, // 4.65 stars
    totalSessions: 71,
    specialties: [8, 12, 5], // Blitz & Rapid, Time Management, Attack & Defense
    languages: ['Spanish', 'English', 'Catalan'],
    timezone: 'UTC+1 (Europe/Madrid)',
    availability: 'Mon-Fri: 5pm-10pm',
    experience: '7 years coaching, 2240 FIDE rating',
    peakRating: 2258,
    verified: true
  }
];

// Mock sessions (for demonstration)
export const MOCK_SESSIONS: Session[] = [];

// Helper functions
export function getCoachByAddress(address: `0x${string}`): Coach | undefined {
  return COACHES.find(coach => coach.address.toLowerCase() === address.toLowerCase());
}

export function getCoachesBySpecialty(specialtyIndex: number): Coach[] {
  return COACHES.filter(coach => coach.specialties.includes(specialtyIndex));
}

export function getCoachesByRating(minRating: number): Coach[] {
  return COACHES.filter(coach => coach.rating >= minRating);
}

export function getCoachesByPriceRange(maxPriceWei: bigint): Coach[] {
  return COACHES.filter(coach => coach.hourlyRate <= maxPriceWei);
}

export function formatRating(rating: number): string {
  return (rating / 100).toFixed(2);
}

export function renderStars(rating: number): string {
  const stars = rating / 100;
  const fullStars = Math.floor(stars);
  const hasHalfStar = (stars % 1) >= 0.5;
  
  return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '');
}

export function calculateSessionPrice(hourlyRate: bigint, durationMinutes: number): bigint {
  return (hourlyRate * BigInt(durationMinutes)) / BigInt(60);
}

export function formatPrice(priceWei: bigint): string {
  return (Number(priceWei) / 1e18).toFixed(4);
}

export function getSessionStatusText(status: SessionStatus): string {
  switch (status) {
    case SessionStatus.Scheduled: return 'Scheduled';
    case SessionStatus.InProgress: return 'In Progress';
    case SessionStatus.Completed: return 'Completed';
    case SessionStatus.Cancelled: return 'Cancelled';
    case SessionStatus.Disputed: return 'Disputed';
    default: return 'Unknown';
  }
}

export function getSessionTypeText(type: SessionType): string {
  return SESSION_TYPE_NAMES[type] || 'Unknown';
}

export function sortCoachesByRating(coaches: Coach[]): Coach[] {
  return [...coaches].sort((a, b) => b.rating - a.rating);
}

export function sortCoachesByPrice(coaches: Coach[], ascending = true): Coach[] {
  return [...coaches].sort((a, b) => {
    const diff = Number(a.hourlyRate - b.hourlyRate);
    return ascending ? diff : -diff;
  });
}

export function sortCoachesBySessions(coaches: Coach[]): Coach[] {
  return [...coaches].sort((a, b) => b.totalSessions - a.totalSessions);
}
