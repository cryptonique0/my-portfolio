'use client';

import { useState } from 'react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  link: string;
  platform: 'medium' | 'blog' | 'twitter' | 'linkedin';
  featured?: boolean;
}

const articlesData: Article[] = [
  {
    id: 1,
    title: "Building a 150K Member Community in 12 Months: A Data-Driven Approach",
    excerpt: "Discover the strategies and frameworks that helped scale a Web3 community from 50K to 150K members. Learn about engagement tactics, sentiment analysis, and sustainable growth principles.",
    date: "Nov 15, 2024",
    readTime: "12 min read",
    category: "Community Management",
    tags: ["Growth", "Strategy", "Web3"],
    link: "#",
    platform: "medium",
    featured: true
  },
  {
    id: 2,
    title: "Crisis Management in Web3: How to Navigate Community Backlash",
    excerpt: "Security incidents and market volatility can destroy community trust. This article outlines a proven crisis management framework that helped retain 92% of community members during a critical period.",
    date: "Nov 8, 2024",
    readTime: "10 min read",
    category: "Leadership",
    tags: ["Crisis", "Communication", "Trust"],
    link: "#",
    platform: "medium"
  },
  {
    id: 3,
    title: "The 5-Step Framework for Creating Viral Educational Content in Crypto",
    excerpt: "Learn how to create educational content that resonates with crypto audiences. This framework generated 2M+ views and 300% engagement growth for a DeFi protocol.",
    date: "Oct 28, 2024",
    readTime: "8 min read",
    category: "Content Strategy",
    tags: ["Content", "Viral", "Education"],
    link: "#",
    platform: "medium"
  },
  {
    id: 4,
    title: "Implementing DAO Governance: From Theory to Practice",
    excerpt: "A comprehensive guide to implementing community DAO governance. Covers voting mechanisms, proposal systems, tokenomics considerations, and lessons from managing 40K+ active participants.",
    date: "Oct 15, 2024",
    readTime: "15 min read",
    category: "Web3 Governance",
    tags: ["DAO", "Governance", "Tokenomics"],
    link: "#",
    platform: "blog"
  },
  {
    id: 5,
    title: "Web3 Community Metrics That Actually Matter (Not Vanity Metrics)",
    excerpt: "Stop counting followers. Learn about meaningful KPIs for Web3 communities: sentiment analysis, retention rates, quality of engagement, and predictive indicators of long-term health.",
    date: "Oct 1, 2024",
    readTime: "9 min read",
    category: "Analytics",
    tags: ["Metrics", "Analytics", "KPIs"],
    link: "#",
    platform: "blog",
    featured: true
  },
  {
    id: 6,
    title: "From Beta to 40K Active Users: The Community-First Product Approach",
    excerpt: "How I helped launch a DAO governance system with 40K+ active participants from day one. Strategies for community co-creation, beta testing, and scaling product adoption.",
    date: "Sep 20, 2024",
    readTime: "11 min read",
    category: "Product",
    tags: ["Product", "Launch", "Community"],
    link: "#",
    platform: "linkedin"
  }
];

const platformIcons: Record<string, string> = {
  medium: '📖',
  blog: '📝',
  twitter: '𝕏',
  linkedin: '💼'
};

const platformColors: Record<string, string> = {
  medium: 'bg-black/50 text-white',
  blog: 'bg-blue-500/20 text-blue-400',
  twitter: 'bg-cyan-500/20 text-cyan-400',
  linkedin: 'bg-blue-600/20 text-blue-300'
};

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredArticles = articlesData.filter(article => {
    const categoryMatch = !selectedCategory || article.category === selectedCategory;
    const tagMatch = !selectedTag || article.tags.includes(selectedTag);
    return categoryMatch && tagMatch;
  });

  const categories = Array.from(new Set(articlesData.map(a => a.category)));
  const allTags = Array.from(new Set(articlesData.flatMap(a => a.tags)));

  const featuredArticles = articlesData.filter(a => a.featured);

  return (
    <div className="w-full">
      {/* Featured Articles */}
      {!selectedCategory && !selectedTag && featuredArticles.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Featured Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.map(article => (
              <a
                key={article.id}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group card bg-linear-to-br from-primary/20 via-primary/5 to-transparent backdrop-blur-sm p-8 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${platformColors[article.platform]}`}>
                    {platformIcons[article.platform]} {article.platform}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-text-secondary leading-relaxed mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                    {article.category}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Category Filter */}
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-3">Filter by Category:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-bg'
                  : 'bg-bg-light/10 text-text-secondary hover:bg-bg-light/20'
              }`}
            >
              All ({articlesData.length})
            </button>
            {categories.map(category => {
              const count = articlesData.filter(a => a.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-primary text-bg'
                      : 'bg-bg-light/10 text-text-secondary hover:bg-bg-light/20'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag Filter */}
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-3">Filter by Tags:</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const count = articlesData.filter(a => a.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTag === tag
                      ? 'bg-primary text-bg'
                      : 'bg-bg-light/10 text-text-secondary hover:bg-bg-light/20'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <a
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group card bg-bg-light/5 backdrop-blur-sm p-6 rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 transform hover:translate-x-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${platformColors[article.platform]}`}>
                      {platformIcons[article.platform]}
                    </span>
                    <span className="text-xs text-text-secondary/70">{article.date}</span>
                    <span className="text-xs text-text-secondary/70">•</span>
                    <span className="text-xs text-text-secondary/70">{article.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {article.category}
                    </span>
                    {article.tags.map(tag => (
                      <span key={tag} className="text-xs text-primary/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors shrink-0">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </div>
            </a>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary">No articles found matching your filters.</p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
              className="mt-4 text-primary hover:text-primary/80 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-12 p-8 rounded-xl bg-primary/5 border border-primary/20 text-center">
        <h3 className="text-xl font-bold mb-2">Want to read more?</h3>
        <p className="text-text-secondary mb-4">Follow my work on Medium, LinkedIn, and my blog for regular insights on community management and Web3.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/60 transition-colors text-sm font-medium">
            📖 Read on Medium
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600/50 text-blue-100 rounded-lg hover:bg-blue-600/60 transition-colors text-sm font-medium">
            💼 Follow on LinkedIn
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium">
            📝 Visit Blog
          </a>
        </div>
      </div>
    </div>
  );
};

export default Blog;
