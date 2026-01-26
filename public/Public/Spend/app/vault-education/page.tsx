'use client';

import { useState } from 'react';
import { BookOpen, Play, AlertCircle, Shield, Users, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VaultSetupVideos } from '@/components/vault-setup/vault-setup-videos';
import { WalkthroughGuides } from '@/components/vault-setup/walkthrough-guides';
import { GuardianSelectionGuide } from '@/components/vault-setup/guardian-selection-guide';
import { SecurityTips } from '@/components/vault-setup/security-tips';
import { AlertsComponent } from '@/components/vault-setup/alerts-component';

export default function VaultEducationPage() {
  const [activeTab, setActiveTab] = useState('videos');

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Vault Education & Security</h1>
            </div>
            <p className="text-lg text-gray-400">
              Comprehensive guides, tutorials, and security resources to help you set up and manage your vault
              safely and effectively.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                <Play className="w-5 h-5" />8
              </div>
              <div className="text-sm text-blue-300">Video Tutorials</div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />4
              </div>
              <div className="text-sm text-emerald-300">Walkthroughs</div>
            </div>
            <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                <Users className="w-5 h-5" />6
              </div>
              <div className="text-sm text-purple-300">Selection Criteria</div>
            </div>
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                18
              </div>
              <div className="text-sm text-red-300">Security Tips</div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 border border-gray-700">
              <TabsTrigger value="videos" className="gap-2">
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="walkthroughs" className="gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Guides</span>
              </TabsTrigger>
              <TabsTrigger value="guardians" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Guardians</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
            </TabsList>

            {/* Video Tutorials Tab */}
            <TabsContent value="videos" className="space-y-6">
              <VaultSetupVideos />
            </TabsContent>

            {/* Walkthrough Guides Tab */}
            <TabsContent value="walkthroughs" className="space-y-6">
              <WalkthroughGuides />
            </TabsContent>

            {/* Guardian Selection Tab */}
            <TabsContent value="guardians" className="space-y-6">
              <GuardianSelectionGuide />
            </TabsContent>

            {/* Security Tips Tab */}
            <TabsContent value="security" className="space-y-6">
              <SecurityTips />
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              <AlertsComponent />
            </TabsContent>
          </Tabs>

          {/* Learning Path */}
          <div className="mt-12 border-t border-gray-700 pt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Recommended Learning Path</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  number: 1,
                  title: 'Watch Introduction Video',
                  description:
                    'Start with "Creating Your First Vault" to understand the basics and requirements.',
                  time: '8 min',
                  tab: 'videos',
                },
                {
                  number: 2,
                  title: 'Follow Setup Walkthrough',
                  description:
                    'Use the step-by-step interactive guide "Set Up Your First Vault" to create your vault.',
                  time: '15 min',
                  tab: 'walkthroughs',
                },
                {
                  number: 3,
                  title: 'Select Your Guardians',
                  description:
                    'Review the Guardian Selection Guide to choose the right people for your vault.',
                  time: '20 min',
                  tab: 'guardians',
                },
                {
                  number: 4,
                  title: 'Enable Security Features',
                  description: 'Implement security tips and best practices to protect your vault.',
                  time: '15 min',
                  tab: 'security',
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setActiveTab(step.tab)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 flex-shrink-0">
                      <span className="font-bold text-white">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                      <div className="inline-block px-2 py-1 rounded text-xs bg-gray-800 text-gray-400">
                        ⏱️ {step.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-12 bg-red-900/20 border border-red-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Important Security Notes
            </h3>
            <ul className="space-y-2 text-red-200">
              <li>• Never share your vault password with anyone, including support staff</li>
              <li>• Always enable two-factor authentication (2FA) for your account</li>
              <li>• Keep recovery codes in a safe, offline location</li>
              <li>• Verify guardian identities before adding them to your vault</li>
              <li>• Test recovery procedures before storing large amounts</li>
              <li>• Review your vault settings and activity regularly</li>
              <li>• Contact support immediately if you suspect compromise</li>
            </ul>
          </div>

          {/* FAQ Quick Links */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Answers</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { q: 'How do I create a vault?', a: 'Watch the video tutorial or follow the interactive walkthrough.' },
                {
                  q: 'How many guardians do I need?',
                  a: 'Recommended 3-5 guardians with a 2-of-3 approval threshold.',
                },
                {
                  q: 'What happens if a guardian is unavailable?',
                  a: 'See the emergency access walkthrough for procedures.',
                },
                { q: 'How do I secure my vault?', description: 'Review the security tips section for comprehensive guidance.' },
                {
                  q: 'What are the gas costs?',
                  a: 'Costs vary by network. Check current prices before deployment.',
                },
                {
                  q: 'Can I change my guardians later?',
                  a: 'Yes, but changes require guardian approval depending on your settings.',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">{item.q}</h4>
                  <p className="text-sm text-gray-400">{item.a || item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
