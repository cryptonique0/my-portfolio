'use client';

import { useState } from 'react';

interface Certification {
  id: number;
  title: string;
  issuer: string;
  date: string;
  icon: string;
  verified: boolean;
  credentialUrl?: string;
  category: 'project-management' | 'community-management' | 'web3' | 'leadership';
}

const certificationData: Certification[] = [
  {
    id: 1,
    title: "HubSpot Social Media Marketing Certification",
    issuer: "HubSpot Academy",
    date: "Free - Start Today",
    icon: "📱",
    verified: false,
    credentialUrl: "https://academy.hubspot.com/courses/social-media-marketing",
    category: "community-management"
  },
  {
    id: 2,
    title: "Google Digital Marketing & E-commerce Certificate",
    issuer: "Google (via Coursera)",
    date: "Free with Financial Aid",
    icon: "📊",
    verified: false,
    credentialUrl: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
    category: "project-management"
  },
  {
    id: 3,
    title: "Community Management Fundamentals",
    issuer: "HubSpot Academy",
    date: "Free - Start Today",
    icon: "👥",
    verified: false,
    credentialUrl: "https://academy.hubspot.com/courses/community-management",
    category: "community-management"
  },
  {
    id: 4,
    title: "Project Management Principles and Practices Specialization",
    issuer: "University of California, Irvine (Coursera)",
    date: "Free to Audit",
    icon: "🎯",
    verified: false,
    credentialUrl: "https://www.coursera.org/specializations/project-management",
    category: "project-management"
  },
  {
    id: 5,
    title: "Content Marketing Certification",
    issuer: "HubSpot Academy",
    date: "Free - Start Today",
    icon: "✍️",
    verified: false,
    credentialUrl: "https://academy.hubspot.com/courses/content-marketing",
    category: "community-management"
  },
  {
    id: 6,
    title: "Blockchain Basics",
    issuer: "University at Buffalo (Coursera)",
    date: "Free to Audit",
    icon: "⛓️",
    verified: false,
    credentialUrl: "https://www.coursera.org/learn/blockchain-basics",
    category: "web3"
  },
  {
    id: 7,
    title: "Agile Project Management",
    issuer: "Google (via Coursera)",
    date: "Free with Financial Aid",
    icon: "🚀",
    verified: false,
    credentialUrl: "https://www.coursera.org/learn/agile-project-management",
    category: "project-management"
  },
  {
    id: 8,
    title: "Inbound Marketing Certification",
    issuer: "HubSpot Academy",
    date: "Free - Start Today",
    icon: "🎯",
    verified: false,
    credentialUrl: "https://academy.hubspot.com/courses/inbound-marketing",
    category: "community-management"
  }
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  'project-management': { label: 'Project Management', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'community-management': { label: 'Community Management', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'web3': { label: 'Web3 & Blockchain', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  'leadership': { label: 'Leadership', color: 'bg-green-500/10 text-green-400 border-green-500/20' }
};

const Certifications = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCertifications = selectedCategory
    ? certificationData.filter(cert => cert.category === selectedCategory)
    : certificationData;

  const categories = Array.from(new Set(certificationData.map(cert => cert.category)));

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === null
              ? 'bg-primary text-bg'
              : 'bg-bg-light/10 text-text-secondary hover:bg-bg-light/20'
          }`}
        >
          All Certifications ({certificationData.length})
        </button>
        {categories.map(category => {
          const config = categoryLabels[category as keyof typeof categoryLabels];
          const count = certificationData.filter(cert => cert.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? config.color + ' border'
                  : 'bg-bg-light/10 text-text-secondary hover:bg-bg-light/20'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCertifications.map((cert, index) => (
          <div
            key={cert.id}
            className="card bg-bg-light/5 backdrop-blur-sm p-6 rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group animate-in"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{cert.icon}</div>
              {cert.verified && (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <h3 className="font-bold text-sm mb-2 text-text-primary group-hover:text-primary transition-colors">
              {cert.title}
            </h3>

            <p className="text-xs text-text-secondary mb-3">{cert.issuer}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary/70">{cert.date}</span>
              <span className={`px-2 py-1 text-xs rounded border ${categoryLabels[cert.category].color}`}>
                {categoryLabels[cert.category].label}
              </span>
            </div>

            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                View Credential
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCertifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No certifications found in this category.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{certificationData.length}</div>
            <p className="text-sm text-text-secondary">Total Certifications</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{certificationData.filter(c => c.verified).length}</div>
            <p className="text-sm text-text-secondary">Verified</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{categories.length}</div>
            <p className="text-sm text-text-secondary">Categories</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">Active</div>
            <p className="text-sm text-text-secondary">Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certifications;
