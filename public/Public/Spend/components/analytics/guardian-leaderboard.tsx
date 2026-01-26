"use client";

import { Medal, TrendingUp, Award, Target } from 'lucide-react';

interface GuardianStats {
  rank: number;
  address: string;
  displayName: string;
  approvalRate: number;
  totalApprovals: number;
  responseTime: number;
  badges: string[];
  trustScore: number;
  lastActive: string;
}

const guardianLeaderboardData: GuardianStats[] = [
  {
    rank: 1,
    address: '0x1234...5678',
    displayName: 'Alice Chen',
    approvalRate: 96,
    totalApprovals: 24,
    responseTime: 1.8,
    badges: ['Fast Responder', '100% Reliable'],
    trustScore: 95,
    lastActive: '2 hours ago',
  },
  {
    rank: 2,
    address: '0xabcd...efgh',
    displayName: 'Bob Johnson',
    approvalRate: 86,
    totalApprovals: 18,
    responseTime: 3.4,
    badges: ['Consistent'],
    trustScore: 82,
    lastActive: '5 hours ago',
  },
  {
    rank: 3,
    address: '0x5678...9abc',
    displayName: 'Charlie Williams',
    approvalRate: 92,
    totalApprovals: 22,
    responseTime: 1.8,
    badges: ['Fast Responder'],
    trustScore: 88,
    lastActive: '1 hour ago',
  },
  {
    rank: 4,
    address: '0xdef0...1234',
    displayName: 'Diana Park',
    approvalRate: 91,
    totalApprovals: 20,
    responseTime: 2.5,
    badges: ['Trusted Advisor'],
    trustScore: 85,
    lastActive: '3 hours ago',
  },
];

function getMedalColor(rank: number) {
  switch (rank) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-gray-400';
    case 3:
      return 'text-orange-600';
    default:
      return 'text-muted-foreground';
  }
}

function getBadgeColor(badge: string) {
  const colors: Record<string, string> = {
    'Fast Responder': 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200',
    '100% Reliable': 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200',
    'Consistent': 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200',
    'Trusted Advisor': 'bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-200',
  };
  return colors[badge] || 'bg-muted text-muted-foreground';
}

export function GuardianLeaderboard() {
  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Guardians by Trust Score</h3>
        <p className="text-sm text-muted-foreground">
          Ranking based on approval rate, response time, and activity metrics
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-3">
        {guardianLeaderboardData.map((guardian) => (
          <div key={guardian.address} className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors">
            {/* Rank and Name Section */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                {guardian.rank <= 3 ? (
                  <Medal className={`w-6 h-6 ${getMedalColor(guardian.rank)}`} />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">#{guardian.rank}</span>
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-semibold">{guardian.displayName}</p>
                <p className="text-xs text-muted-foreground">{guardian.address}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold">{guardian.trustScore}</span>
                </div>
                <p className="text-xs text-muted-foreground">Trust Score</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mb-3 pb-3 border-b border-border">
              <div className="text-center">
                <p className="text-sm font-semibold text-primary">{guardian.approvalRate}%</p>
                <p className="text-xs text-muted-foreground">Approval Rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">{guardian.totalApprovals}</p>
                <p className="text-xs text-muted-foreground">Approvals</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">{guardian.responseTime}h</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{guardian.lastActive}</p>
                <p className="text-xs font-medium">Last Active</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {guardian.badges.map((badge) => (
                <span
                  key={badge}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${getBadgeColor(badge)}`}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rankings Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <div className="flex gap-3">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">How rankings work:</p>
            <ul className="space-y-1 text-xs">
              <li>• Approval rate (40%): Higher approval rates = higher trust</li>
              <li>• Response time (30%): Faster responses = higher trust</li>
              <li>• Activity (20%): More consistent activity = higher trust</li>
              <li>• Reliability (10%): Historical performance and badges</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Highest Approval Rate</p>
          <p className="text-2xl font-bold">Alice Chen</p>
          <p className="text-xs text-muted-foreground mt-1">96%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Fastest Response</p>
          <p className="text-2xl font-bold">Alice Chen</p>
          <p className="text-xs text-muted-foreground mt-1">1.8 hours</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Most Approvals</p>
          <p className="text-2xl font-bold">Alice Chen</p>
          <p className="text-xs text-muted-foreground mt-1">24 total</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Team Average</p>
          <p className="text-2xl font-bold">91.25%</p>
          <p className="text-xs text-muted-foreground mt-1">Approval Rate</p>
        </div>
      </div>
    </div>
  );
}
