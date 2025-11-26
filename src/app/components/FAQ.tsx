'use client';

import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'services' | 'engagement' | 'rates' | 'process';
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What community management services do you offer?",
    answer: "I offer comprehensive community management services including Discord/Telegram/Slack moderation, community strategy development, engagement planning, crisis management, analytics and reporting, ambassador program development, event planning, and stakeholder communication. I tailor services to your specific project needs.",
    category: "services"
  },
  {
    id: 2,
    question: "What's your approach to community engagement?",
    answer: "I believe in creating authentic connections and delivering consistent value. My approach combines data-driven strategies with genuine community interaction. I focus on understanding member needs, facilitating meaningful discussions, recognizing contributions, and implementing feedback. The goal is sustainable growth with high-quality engagement rather than vanity metrics.",
    category: "engagement"
  },
  {
    id: 3,
    question: "How do you handle crisis situations in communities?",
    answer: "I have a proven crisis management framework that includes immediate assessment, transparent communication, stakeholder coordination, and recovery planning. I focus on preventing panic, maintaining trust through clear messaging, taking concrete action steps, and learning from the incident. I've successfully navigated multiple crises with 90%+ community retention rates.",
    category: "engagement"
  },
  {
    id: 4,
    question: "What metrics do you track and report on?",
    answer: "I track comprehensive metrics including community growth rate, daily active users, engagement rate, sentiment analysis, response times, crisis metrics, campaign performance, and member retention. Reports are customized to your KPIs and delivered weekly or monthly. I use data to continuously optimize strategies.",
    category: "process"
  },
  {
    id: 5,
    question: "How do you structure your rates?",
    answer: "My rates are project-based and depend on scope, community size, and engagement level. I offer flexible engagement models: monthly retainers for ongoing management (starting at $3,500/month), project-based fees for specific initiatives, or equity arrangements for early-stage projects. Let's discuss your needs for a custom quote.",
    category: "rates"
  },
  {
    id: 6,
    question: "What's your availability for new projects?",
    answer: "I'm currently taking on 1-2 new projects per quarter to ensure quality delivery. I prefer long-term engagements (minimum 3-6 months) to build genuine impact. Available for immediate starts on urgent needs. Let's have a discovery call to discuss your timeline and requirements.",
    category: "rates"
  },
  {
    id: 7,
    question: "How long does it take to see results?",
    answer: "Quick wins (improved sentiment, better engagement) are visible within 2-4 weeks. Significant growth typically shows in 2-3 months. Long-term community health and loyalty build over 6-12 months. The timeline depends on starting conditions, market conditions, and resources allocated.",
    category: "process"
  },
  {
    id: 8,
    question: "Do you work with early-stage projects or only established ones?",
    answer: "I work with both early-stage projects and established protocols. I find early-stage work rewarding because there's more opportunity for strategic impact. For early-stage projects, I often structure arrangements with base fees + equity to align incentives. The key is having a viable product and committed team.",
    category: "services"
  },
  {
    id: 9,
    question: "What makes your approach different from other community managers?",
    answer: "I combine strategic thinking with hands-on execution. I don't just moderate—I build systems, implement data-driven strategies, and manage up to leadership while staying connected to community sentiment. My background in project management helps me execute with precision. I'm also deeply embedded in Web3 culture and understand the space authentically.",
    category: "engagement"
  },
  {
    id: 10,
    question: "How do you stay updated with Web3 and community trends?",
    answer: "I'm actively involved in multiple Web3 communities, follow key opinion leaders, attend major conferences, participate in industry discussions, and continuously consume content about new platforms and trends. I maintain relationships across major projects and stay current with emerging challenges and opportunities in the space.",
    category: "process"
  },
  {
    id: 11,
    question: "Can you help scale a community from 0 to 100K+ members?",
    answer: "Absolutely. I've done this multiple times. The key is having a good product, clear positioning, and execution discipline. I focus on building organic growth through authentic engagement, leveraging network effects, implementing referral programs, and strategic partnerships. Growth strategies differ significantly at different stages (0-10K vs 10-100K+ members).",
    category: "services"
  },
  {
    id: 12,
    question: "What's your onboarding process?",
    answer: "Discovery call to understand your goals, current state, and challenges. I then conduct a community audit, develop a strategic plan, create a detailed proposal with deliverables and timelines, and establish communication cadence. We typically start with a 2-4 week sprint to implement quick wins while building longer-term strategy.",
    category: "process"
  }
];

const categories = {
  services: { label: 'Services', icon: '🎯' },
  engagement: { label: 'Engagement', icon: '👥' },
  rates: { label: 'Rates & Availability', icon: '💰' },
  process: { label: 'Process', icon: '⚙️' }
};

const FAQ = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQ = selectedCategory
    ? faqData.filter(item => item.category === selectedCategory)
    : faqData;

  const toggleAccordion = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === null
              ? 'bg-primary text-bg'
              : 'bg-bg-light/10 text-text-secondary hover:bg-bg-light/20'
          }`}
        >
          All Questions ({faqData.length})
        </button>
        {Object.entries(categories).map(([key, { label }]) => {
          const count = faqData.filter(item => item.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === key
                  ? 'bg-primary text-bg'
                  : 'bg-bg-light/10 text-text-secondary hover:bg-bg-light/20'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQ.map(item => (
          <div
            key={item.id}
            className="card bg-bg-light/5 backdrop-blur-sm border border-primary/10 rounded-lg overflow-hidden hover:border-primary/20 transition-all duration-300"
          >
            <button
              onClick={() => toggleAccordion(item.id)}
              className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-bg-light/5 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
                  {item.question}
                </h3>
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {categories[item.category as keyof typeof categories].label}
                </span>
              </div>
              <div className="shrink-0 mt-1">
                <svg
                  className={`w-6 h-6 text-primary transition-transform duration-300 ${
                    expandedId === item.id ? 'transform rotate-180' : ''
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {expandedId === item.id && (
              <div className="px-6 pb-6 border-t border-primary/10 pt-4">
                <p className="text-text-secondary leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
