'use client';

import { useState } from 'react';

interface Project {
  id: number;
  title: string;
  client: string;
  category: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: { label: string; value: string }[];
  technologies: string[];
  year: string;
}

const projectData: Project[] = [
  {
    id: 1,
    title: "Community Growth & Stabilization",
    client: "DecentraHub",
    category: "Community Management",
    challenge: "Protocol faced declining community engagement and negative sentiment during bear market. Members were leaving, Discord activity dropped 60%, and trust was eroding.",
    solution: "Implemented comprehensive engagement strategy with daily AMAs, weekly challenges, transparent communication, and launched ambassador program. Created educational content series and implemented data-driven sentiment tracking.",
    results: [
      "Grew community from 50K to 150K members (200% growth)",
      "Increased daily active users by 250%",
      "Achieved 85% positive sentiment score",
      "Created 100+ ambassador network"
    ],
    metrics: [
      { label: "Member Growth", value: "50K → 150K" },
      { label: "Sentiment Score", value: "85%" },
      { label: "Active Users", value: "+250%" },
      { label: "Ambassadors", value: "100+" }
    ],
    technologies: ["Discord", "Analytics", "Content Strategy", "Leadership"],
    year: "2023-2024"
  },
  {
    id: 2,
    title: "Protocol Upgrade Management",
    client: "CryptoSphere",
    category: "Project Management",
    challenge: "Coordinating 5 major protocol upgrades across multiple teams with tight deadlines. Previous upgrade took 8 months. Communication gaps existed between technical, design, and community teams.",
    solution: "Implemented Agile/Scrum framework, created cross-functional working groups, established clear communication protocols, and built comprehensive documentation. Introduced risk management and stakeholder communication system.",
    results: [
      "Reduced delivery time by 40% (average 4.8 months)",
      "Achieved 95% on-time milestone completion",
      "Zero critical issues at launch",
      "Improved team satisfaction by 90%"
    ],
    metrics: [
      { label: "Time Saved", value: "40%" },
      { label: "On-Time Rate", value: "95%" },
      { label: "Critical Issues", value: "0" },
      { label: "Team Satisfaction", value: "90%" }
    ],
    technologies: ["Scrum", "Jira", "Leadership", "Risk Management"],
    year: "2022-2023"
  },
  {
    id: 3,
    title: "DAO Governance Implementation",
    client: "CryptoSphere",
    category: "Project Management",
    challenge: "Community had no governance structure. Needed to establish democratic decision-making framework for 40K+ members. Complex tokenomics and voting mechanism design required.",
    solution: "Designed and implemented community DAO structure with tiered governance, created voting mechanism, developed governance documentation, and conducted community education program with governance workshops.",
    results: [
      "Successfully launched DAO with 40K active participants",
      "Proposal approval rate: 87%",
      "Average voter participation: 42%",
      "Zero governance disputes"
    ],
    metrics: [
      { label: "Active Participants", value: "40K+" },
      { label: "Voter Turnout", value: "42%" },
      { label: "Proposal Success", value: "87%" },
      { label: "Disputes", value: "0" }
    ],
    technologies: ["Governance Design", "Community Building", "Tokenomics"],
    year: "2023"
  },
  {
    id: 4,
    title: "Content Marketing Campaign",
    client: "BlockchainVentures",
    category: "Community Management",
    challenge: "Low awareness and brand presence. Needed viral content to establish thought leadership in crowded crypto space. Limited content creation resources.",
    solution: "Created comprehensive educational content series with multi-format approach (videos, articles, infographics, threads). Optimized for virality and SEO. Partnered with 50+ influencers for distribution.",
    results: [
      "2M+ total views on educational series",
      "300% increase in Twitter engagement",
      "50+ influencer partnerships",
      "Ranked top 3 in category"
    ],
    metrics: [
      { label: "Total Views", value: "2M+" },
      { label: "Engagement Growth", value: "300%" },
      { label: "Influencer Partners", value: "50+" },
      { label: "Category Ranking", value: "Top 3" }
    ],
    technologies: ["Content Strategy", "Social Media", "Video Production"],
    year: "2021-2022"
  },
  {
    id: 5,
    title: "Support System Optimization",
    client: "BlockchainVentures",
    category: "Project Management",
    challenge: "Community support was overwhelmed with 24-hour average response time. User satisfaction dropped to 42%. Support tickets kept growing faster than team capacity.",
    solution: "Redesigned support workflow, implemented chatbot for common issues, created comprehensive FAQ, trained support team with better templates, and established priority queuing system.",
    results: [
      "Reduced response time from 24h to 2h",
      "Increased user satisfaction to 89%",
      "Support tickets resolved 70% faster",
      "Support team capacity increased 3x"
    ],
    metrics: [
      { label: "Response Time", value: "24h → 2h" },
      { label: "Satisfaction", value: "89%" },
      { label: "Resolution Time", value: "-70%" },
      { label: "Capacity Increase", value: "3x" }
    ],
    technologies: ["Support Systems", "Automation", "Process Optimization"],
    year: "2022"
  },
  {
    id: 6,
    title: "Crisis Management & Recovery",
    client: "DecentraHub",
    category: "Community Management",
    challenge: "Security incident caused reputation damage and community panic. Trust collapsed, members FUDing, mass exodus risk. Media coverage was negative.",
    solution: "Executed crisis communication plan with daily updates, transparent information, community town halls, and recovery roadmap. Built confidence through consistent messaging and concrete action steps.",
    results: [
      "Prevented mass exodus (retained 92% of community)",
      "Recovered to positive sentiment within 3 weeks",
      "Media narrative shifted from negative to neutral/positive",
      "Community stronger after recovery"
    ],
    metrics: [
      { label: "Member Retention", value: "92%" },
      { label: "Recovery Time", value: "3 weeks" },
      { label: "Sentiment Shift", value: "Negative → Positive" },
      { label: "Growth Post-Crisis", value: "+40%" }
    ],
    technologies: ["Crisis Management", "Communication Strategy", "Leadership"],
    year: "2023"
  }
];

const ProjectShowcase = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(projectData[0]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(projectData.map(p => p.category)));
  const filteredProjects = selectedCategory
    ? projectData.filter(p => p.category === selectedCategory)
    : projectData;

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
          All Projects ({projectData.length})
        </button>
        {categories.map(category => {
          const count = projectData.filter(p => p.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-bold mb-4">Projects</h3>
          {filteredProjects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                selectedProject?.id === project.id
                  ? 'bg-primary text-bg shadow-lg'
                  : 'bg-bg-light/5 hover:bg-bg-light/10 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="font-semibold text-sm">{project.title}</div>
              <div className="text-xs opacity-70 mt-1">{project.client}</div>
              <div className="text-xs opacity-60 mt-1">{project.year}</div>
            </button>
          ))}
        </div>

        {/* Project Details */}
        {selectedProject && (
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-bg-light/5 backdrop-blur-sm p-8 rounded-xl border border-primary/10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary mb-3">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-3xl font-bold mb-2">{selectedProject.title}</h2>
                  <p className="text-text-secondary flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-11-4h4m0 0V1m0 1.5V1m5 4v10m-4-10v10" />
                    </svg>
                    {selectedProject.client} • {selectedProject.year}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-primary/5 rounded-lg">
                {selectedProject.metrics.map((metric, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-bold text-primary">{metric.value}</div>
                    <div className="text-xs text-text-secondary mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Challenge */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2 text-primary">Challenge</h3>
                <p className="text-text-secondary leading-relaxed">{selectedProject.challenge}</p>
              </div>

              {/* Solution */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2 text-primary">Solution</h3>
                <p className="text-text-secondary leading-relaxed">{selectedProject.solution}</p>
              </div>

              {/* Results */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3 text-primary">Results</h3>
                <ul className="space-y-2">
                  {selectedProject.results.map((result, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <span className="text-primary mt-1">✓</span>
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="font-bold text-lg mb-3 text-primary">Technologies & Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectShowcase;
