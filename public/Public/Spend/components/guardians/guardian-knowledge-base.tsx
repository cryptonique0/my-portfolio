'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, BookOpen, HelpCircle, Lightbulb, Users, Shield, Zap, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
  relatedTopics?: string[];
}

export function GuardianKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    // Guardians Overview
    {
      id: 'what-are-guardians',
      category: 'Getting Started',
      question: 'What are guardians in SpendGuard?',
      answer:
        'Guardians are trusted individuals or entities you designate to approve or reject large withdrawals from your vault. They act as a security layer, requiring multiple approvals for sensitive transactions. This multi-signature approach helps protect your funds from unauthorized access.',
      icon: <Users className="h-5 w-5" />,
      relatedTopics: ['how-many-guardians', 'trusted-guardian'],
    },
    {
      id: 'how-many-guardians',
      category: 'Getting Started',
      question: 'How many guardians should I have?',
      answer:
        'We recommend having 3-5 guardians for optimal security. This provides good protection against compromise while remaining manageable. You need at least 1 guardian to enable vault protection, but 2-3 is ideal for most users. Enterprise users may want 5+ guardians.',
      icon: <Lightbulb className="h-5 w-5" />,
      relatedTopics: ['what-are-guardians', 'add-guardian'],
    },
    {
      id: 'add-guardian',
      category: 'Getting Started',
      question: 'How do I add a guardian?',
      answer:
        'Navigate to Guardians > Manage Guardians and click "Add Guardian". Enter their wallet address or ENS name, set their access level, and confirm. Your new guardian will receive a notification and must accept the role. You can set different permissions for different guardians (approve/reject only, or full control).',
      icon: <Users className="h-5 w-5" />,
      relatedTopics: ['permissions', 'guardian-notifications'],
    },

    // Reputation & Rankings
    {
      id: 'reputation-score',
      category: 'Reputation & Rankings',
      question: 'How is the reputation score calculated?',
      answer:
        'The reputation score (0-100) is calculated from 4 key metrics: (1) Approval Rate (40%): percentage of requests approved, (2) Response Speed (30%): average time to respond, (3) Activity Level (20%): consistent participation, (4) Reliability (10%): zero errors or missed requests. The weighted average determines the final score.',
      icon: <Shield className="h-5 w-5" />,
      relatedTopics: ['badges-system', 'activity-rankings'],
    },
    {
      id: 'activity-rankings',
      category: 'Reputation & Rankings',
      question: 'What do the activity rankings show?',
      answer:
        'Activity rankings track: Most Approvals (total decisions made), Fastest Response (average response time), Consistency Rate (approval percentage), and Participation Streak (consecutive days active). These help you identify your most reliable guardians and track their performance over time.',
      icon: <Zap className="h-5 w-5" />,
      relatedTopics: ['reputation-score', 'badges-system'],
    },
    {
      id: 'top-guardians',
      category: 'Reputation & Rankings',
      question: 'How are "Top Guardians" determined?',
      answer:
        'Top Guardians are ranked by reputation score (highest first). You can filter by: All Guardians, Active Only (have responded in last 7 days), With Badges (earned achievements), or Top Performers (90+ reputation). This helps you find and prioritize your most trusted guardians.',
      icon: <Shield className="h-5 w-5" />,
      relatedTopics: ['reputation-score', 'badges-system'],
    },

    // Badges & Achievements
    {
      id: 'badges-system',
      category: 'Badges & Achievements',
      question: 'What is the badges system?',
      answer:
        'Badges are achievements earned by guardians through consistent performance. There are 4 badge types: Fast Responder (< 2h avg response), 100% Reliable (≥ 95% approval rate), Consistent Guardian (30+ days active), and Trusted Advisor (90+ reputation score). Badges help you identify high-performing guardians and they count toward overall achievement points.',
      icon: <Award className="h-5 w-5" />,
      relatedTopics: ['reputation-score', 'trusted-guardian'],
    },
    {
      id: 'earn-badges',
      category: 'Badges & Achievements',
      question: 'How do guardians earn badges?',
      answer:
        'Guardians automatically earn badges when they meet specific criteria: Fast Responder is earned by maintaining < 2 hour average response time, 100% Reliable requires ≥ 95% approval rate, Consistent Guardian needs 30+ consecutive days of activity, and Trusted Advisor is earned at 90+ reputation score. All criteria are tracked automatically.',
      icon: <Lightbulb className="h-5 w-5" />,
      relatedTopics: ['badges-system', 'reputation-score'],
    },
    {
      id: 'badge-value',
      category: 'Badges & Achievements',
      question: 'What are badges useful for?',
      answer:
        'Badges serve multiple purposes: they indicate guardian quality and trustworthiness, unlock special permissions (legendary badges unlock higher approval limits), contribute to achievement points (used for leaderboards), and help you quickly identify top performers. Badges are permanent once earned and visible on the guardian\'s profile.',
      icon: <Shield className="h-5 w-5" />,
      relatedTopics: ['badges-system', 'permissions'],
    },

    // Guardian Management
    {
      id: 'remove-guardian',
      category: 'Guardian Management',
      question: 'How do I remove a guardian?',
      answer:
        'Go to Guardians > Manage Guardians, find the guardian you want to remove, and click "Remove" or the trash icon. You\'ll be asked to confirm. Removing a guardian revokes their access immediately. If you later need them back, you\'ll need to re-add them through the standard process.',
      icon: <Users className="h-5 w-5" />,
      relatedTopics: ['add-guardian', 'permissions'],
    },
    {
      id: 'permissions',
      category: 'Guardian Management',
      question: 'What permissions can I set for guardians?',
      answer:
        'You can set different permission levels: View Only (see transaction history), Approve Only (approve/reject requests), Manage (modify vault settings), or Full Control (all permissions). Set restrictive permissions for new guardians and expand as they prove reliable. You can change permissions anytime.',
      icon: <Shield className="h-5 w-5" />,
      relatedTopics: ['add-guardian', 'security-tips'],
    },
    {
      id: 'emergency-contacts',
      category: 'Guardian Management',
      question: 'What are emergency contacts?',
      answer:
        'Emergency contacts are backup guardians who can take control if primary guardians become unavailable. You can designate up to 3 emergency contacts. In case of emergency, they can be activated to provide immediate access. Emergency contacts should be people you trust completely.',
      icon: <HelpCircle className="h-5 w-5" />,
      relatedTopics: ['security-tips', 'trusted-guardian'],
    },

    // Security & Best Practices
    {
      id: 'security-tips',
      category: 'Security & Best Practices',
      question: 'What are the security best practices for guardians?',
      answer:
        'Best practices include: (1) Choose guardians with different locations/organizations to avoid single-point failure, (2) Verify guardian wallet addresses before adding, (3) Require guardian consensus (2-of-3) for large withdrawals, (4) Regularly review guardian activity, (5) Use hardware wallets for guardian accounts, (6) Set up emergency contacts, (7) Rotate guardians periodically.',
      icon: <Shield className="h-5 w-5" />,
      relatedTopics: ['trusted-guardian', 'remove-guardian'],
    },
    {
      id: 'trusted-guardian',
      category: 'Security & Best Practices',
      question: 'How do I know if a guardian is trustworthy?',
      answer:
        'Check these indicators: High reputation score (80+), multiple earned badges, consistent activity, fast response times, high approval rate, positive history with you personally, and verified identity. Review their profile, see their historical approvals, and start with View-Only permissions before granting full access.',
      icon: <Shield className="h-5 w-5" />,
      relatedTopics: ['reputation-score', 'badges-system'],
    },
    {
      id: 'compromised-guardian',
      category: 'Security & Best Practices',
      question: 'What should I do if a guardian\'s account is compromised?',
      answer:
        'Immediately: (1) Revoke their access via Guardians > Manage, (2) Change your vault password and recovery codes, (3) Review recent transactions for unauthorized activity, (4) Enable 2FA if not already active, (5) Consider updating withdrawal limits, (6) Contact other guardians to alert them. Then investigate with the affected guardian and decide if they should be re-added.',
      icon: <Shield className="h-5 w-5" />,
      relatedTopics: ['remove-guardian', 'security-tips'],
    },

    // Notifications & Approvals
    {
      id: 'guardian-notifications',
      category: 'Notifications & Approvals',
      question: 'How do guardians get notified of requests?',
      answer:
        'Guardians receive notifications through their preferred channels: Email (if configured), In-app notifications (if they visit the app), and Push notifications (if they have the mobile app). You can configure notification settings for each guardian. Guardians should respond within your configured time window (default 24 hours).',
      icon: <Lightbulb className="h-5 w-5" />,
      relatedTopics: ['add-guardian', 'response-time'],
    },
    {
      id: 'response-time',
      category: 'Notifications & Approvals',
      question: 'What is the response time deadline?',
      answer:
        'The default response deadline is 24 hours from request creation. If a guardian doesn\'t respond within this window, the request expires and must be resubmitted. You can configure custom deadlines per guardian (e.g., 12h for quick decisions, 72h for slower guardians). This is reflected in response time metrics.',
      icon: <Zap className="h-5 w-5" />,
      relatedTopics: ['guardian-notifications', 'reputation-score'],
    },
    {
      id: 'approval-process',
      category: 'Notifications & Approvals',
      question: 'How does the approval process work?',
      answer:
        'When you request a large withdrawal: (1) The request is sent to designated guardians, (2) Each guardian receives a notification, (3) They review the transaction details, (4) They approve or reject with optional reason, (5) Results are tallied (majority wins), (6) Transaction executes if approved. You can see the approval status in real-time.',
      icon: <HelpCircle className="h-5 w-5" />,
      relatedTopics: ['guardian-notifications', 'add-guardian'],
    },

    // Troubleshooting
    {
      id: 'guardian-not-responding',
      category: 'Troubleshooting',
      question: 'What if a guardian isn\'t responding?',
      answer:
        'First, check if they\'re online and have notifications enabled. Send them a reminder through their preferred contact method. If they still don\'t respond after 12 hours, consider: (1) Extending the deadline, (2) Asking another guardian to approve, (3) Checking if their account is compromised. If this is recurring, you may want to replace them.',
      icon: <HelpCircle className="h-5 w-5" />,
      relatedTopics: ['guardian-notifications', 'remove-guardian'],
    },
    {
      id: 'lost-guardian-access',
      category: 'Troubleshooting',
      question: 'What if a guardian lost access to their account?',
      answer:
        'The guardian can recover their account using their recovery codes or reset password. If they can\'t recover, contact support with proof of identity. As the vault owner, you can revoke their access and re-add them later if they regain access. Don\'t wait too long if the guardian is critical to your approval process.',
      icon: <HelpCircle className="h-5 w-5" />,
      relatedTopics: ['emergency-contacts', 'security-tips'],
    },
  ];

  // Group FAQ by category
  const categories = Array.from(new Set(faqData.map((item) => item.category)));

  // Filter FAQ based on search
  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (selectedCategory === null || item.category === selectedCategory)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-3">Guardian Knowledge Base</h1>
        <p className="text-lg text-muted-foreground">
          Learn everything about guardians, reputation scoring, badges, and best practices
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-6 text-base"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full transition ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryItems = filteredFAQ.filter((item) => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {categoryItems[0].icon}
                {category}
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {categoryItems.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="text-left text-base font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-base">
                      <p className="text-muted-foreground mb-4">{item.answer}</p>
                      {item.relatedTopics && (
                        <div className="bg-secondary/50 rounded p-3">
                          <p className="text-xs font-semibold mb-2">Related Topics:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.relatedTopics.map((topic) => (
                              <button
                                key={topic}
                                onClick={() => {
                                  const relatedItem = faqData.find((i) => i.id === topic);
                                  if (relatedItem) {
                                    setSearchQuery(relatedItem.question);
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition"
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFAQ.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground">Try a different search or browse by category</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-4">Quick Links & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="#"
            className="border rounded-lg p-6 hover:shadow-lg transition hover:border-primary"
          >
            <BookOpen className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Guardian Setup Guide</h3>
            <p className="text-sm text-muted-foreground">
              Step-by-step guide to set up your first guardians
            </p>
          </a>
          <a
            href="#"
            className="border rounded-lg p-6 hover:shadow-lg transition hover:border-primary"
          >
            <Shield className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Security Best Practices</h3>
            <p className="text-sm text-muted-foreground">
              Learn how to secure your vault with guardians
            </p>
          </a>
          <a
            href="#"
            className="border rounded-lg p-6 hover:shadow-lg transition hover:border-primary"
          >
            <Users className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Guardian Roles & Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Understand guardian roles and permission levels
            </p>
          </a>
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-bold mb-2">Still have questions?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          If you can\'t find the answer you\'re looking for, our support team is here to help.
        </p>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition">
          Contact Support
        </button>
      </div>
    </div>
  );
}
