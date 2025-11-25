'use client';

import { useInView } from 'react-intersection-observer';

interface Skill {
  category: string;
  skills: {
    name: string;
    level: number;
    details?: string[];
  }[];
}

const skillsData: Skill[] = [
  {
    category: "Community Management",
    skills: [
      { 
        name: "Community Growth Strategy", 
        level: 98,
        details: [
          "Member acquisition & retention",
          "Growth hacking & viral campaigns",
          "Community segmentation & targeting",
          "Ambassador program development",
          "Engagement metrics optimization"
        ]
      },
      { name: "Crisis Management", level: 95 },
      { name: "Content & Campaign Planning", level: 92 },
      { name: "Community Analytics", level: 90 },
      { name: "User Engagement & Retention", level: 95 },
      { name: "Social Media Management", level: 93 }
    ]
  },
  {
    category: "Project Management",
    skills: [
      { name: "Agile & Scrum", level: 95 },
      { name: "Risk & Issue Management", level: 92 },
      { name: "Stakeholder Communication", level: 96 },
      { name: "Resource Planning", level: 90 },
      { name: "Project Analytics & KPIs", level: 88 },
      { name: "Team Leadership", level: 94 }
    ]
  },
  {
    category: "Platforms & Tools",
    skills: [
      { name: "Discord Moderation", level: 98 },
      { name: "Twitter/X Growth", level: 95 },
      { name: "Telegram Community Building", level: 92 },
      { name: "HubSpot & CRM Tools", level: 85 },
      { name: "Analytics Platforms", level: 90 }
    ]
  }
];

const Skills = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {skillsData.map((category, idx) => (
        <div
          key={idx}
          className={`p-6 rounded-xl bg-linear-to-br from-black/80 to-black/60 backdrop-blur-sm border border-primary/20 transform transition-all duration-500 ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h3 className="text-xl font-bold text-primary mb-6">{category.category}</h3>
          <div className="space-y-4">
            {category.skills.map((skill, skillIdx) => (
              <div key={skillIdx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-sm text-primary">{skill.level}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-linear-to-r from-primary to-secondary origin-left transition-all duration-1000 ${inView ? `w-[${skill.level}%]` : 'w-0'}`}
                  />
                </div>
                {skill.details && (
                  <div className="mt-3 ml-2 space-y-1 text-xs text-text-secondary/80">
                    {skill.details.map((detail, detailIdx) => (
                      <div key={detailIdx} className="flex items-start gap-2">
                        <span className="text-primary/60 mt-0.5">✓</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skills;