'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { StatCard } from '@/app/components/ui/DataDisplay';
import { Avatar } from '@/app/components/ui/DataDisplay';

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: '♟️',
      title: 'Play Chess Online',
      description: 'Challenge players worldwide in real-time games with live updates and instant feedback.',
      color: 'blue',
    },
    {
      icon: '🧠',
      title: 'AI Powered Training',
      description: 'Practice against advanced AI opponents that adapt to your skill level using Gemini AI.',
      color: 'purple',
    },
    {
      icon: '🎯',
      title: 'Puzzle Master',
      description: 'Solve hundreds of curated puzzles to improve your tactical skills and pattern recognition.',
      color: 'amber',
    },
    {
      icon: '📊',
      title: 'Live Leaderboard',
      description: 'Climb the global rankings and earn ETH rewards for your victories and achievements.',
      color: 'green',
    },
    {
      icon: '👨‍🏫',
      title: 'Expert Coaching',
      description: 'Learn from grandmasters through personalized coaching sessions and game analysis.',
      color: 'red',
    },
    {
      icon: '💰',
      title: 'Earn Rewards',
      description: 'Win tournaments, complete challenges, and earn cryptocurrency rewards for your skills.',
      color: 'indigo',
    },
  ];

  const stats = [
    { label: 'Active Players', value: '12.4K', icon: '👥', color: 'blue' },
    { label: 'Games Played', value: '2.3M', icon: '♟️', color: 'green' },
    { label: 'Total Prizes', value: '$845K', icon: '💰', color: 'amber' },
    { label: 'Avg Rating', value: '1850', icon: '⭐', color: 'purple' },
  ];

  const testimonials = [
    {
      name: 'AlexMaster92',
      role: 'Professional Player',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexMaster',
      text: 'The best chess platform I\'ve used. The AI training is incredibly helpful and the rewards are genuine!',
      rating: 5,
    },
    {
      name: 'ChessEnthusiast',
      role: 'Casual Player',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Enthusiast',
      text: 'Love the leaderboard and the coaching marketplace. Finally a place where I can improve and earn!',
      rating: 5,
    },
    {
      name: 'TacticalGenius',
      role: 'Puzzle Enthusiast',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tactical',
      text: 'The puzzle collection is massive and the difficulty progression is perfectly balanced.',
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-black">♟️</div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">BaseChess</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#stats" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Stats
            </a>
            <a href="#testimonials" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/(pages)/play">
              <Button size="md" variant="primary">
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="primary">
              🚀 Powered by Web3 & AI
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight">
              Master Chess.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Earn Rewards.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Play chess against AI, compete with global players, solve puzzles, and earn ETH rewards on the
              most advanced on-chain chess platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/(pages)/play">
                <Button size="lg" variant="primary" fullWidth className="sm:w-auto">
                  Start Playing
                </Button>
              </Link>
              <Link href="/(pages)/training">
                <Button size="lg" variant="outline" fullWidth className="sm:w-auto">
                  Learn & Train
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl p-8 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">♟️</div>
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ready to Play?</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Join thousands of players today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive tools and features designed for chess players of all skill levels
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              variant="elevated"
              padding="lg"
              hover
              onMouseEnter={() => setHoveredFeature(idx)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`transform transition-all duration-300 ${
                hoveredFeature === idx ? 'scale-105 md:scale-110' : ''
              }`}
            >
              <div className="space-y-4">
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                <Button variant="ghost" className="mt-4 p-0 justify-start">
                  Learn More →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl">
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            By The Numbers
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
            Join Our Growing Community
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color as any}
            />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            What Players Say
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
            Loved by Chess Enthusiasts Worldwide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} variant="elevated" padding="lg">
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <span key={i} className="text-amber-400">
                        ★
                      </span>
                    ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Avatar src={testimonial.avatar} name={testimonial.name} size="md" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card
          variant="elevated"
          padding="lg"
          gradient
          className="text-center space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
            Ready to Start Your Chess Journey?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join thousands of players earning rewards while mastering the game
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/(pages)/play">
              <Button size="lg" variant="primary">
                Play Now
              </Button>
            </Link>
            <Link href="/(pages)/leaderboards">
              <Button size="lg" variant="secondary">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">♟️</div>
                <span className="font-bold text-slate-900 dark:text-white">BaseChess</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The most advanced on-chain chess platform
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Game</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="/(pages)/play" className="hover:text-slate-900 dark:hover:text-white transition-colors">Play</a></li>
                <li><a href="/(pages)/training" className="hover:text-slate-900 dark:hover:text-white transition-colors">Training</a></li>
                <li><a href="/(pages)/puzzles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Puzzles</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="/(pages)/leaderboards" className="hover:text-slate-900 dark:hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="/(pages)/coaches" className="hover:text-slate-900 dark:hover:text-white transition-colors">Coaches</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Discord</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              © 2024 BaseChess. All rights reserved. | Built on Base Blockchain
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
