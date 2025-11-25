'use client';

import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

interface TimelineItem {
  date: string;
  company: string;
  title: string;
  logo: string;
  description: string[];
  achievements: string[];
}

const timelineData: TimelineItem[] = [
  {
    date: "2023 - Present",
    company: "DecentraHub",
    title: "Senior Community Manager",
    logo: "/companies/decentrahub.svg",
    description: [
      "Leading a team of 12 community moderators across Discord, Telegram, and Twitter",
      "Developing and executing community growth strategies resulting in 200% YoY growth",
      "Managing crisis communication and community sentiment during major protocol updates",
      "Implementing data-driven engagement strategies and analytics reporting"
    ],
    achievements: [
      "Grew global community from 50K to 150K members in 12 months",
      "Maintained 85%+ positive sentiment score during market volatility",
      "Launched successful ambassador program with 100+ active members",
      "Organized 24 AMAs with industry leaders, averaging 5K+ attendance"
    ]
  },
  {
    date: "2022 - 2023",
    company: "CryptoSphere",
    title: "Project Manager & Community Lead",
    logo: "/companies/cryptosphere.svg",
    description: [
      "Led end-to-end delivery of 5 major protocol upgrades and feature launches",
      "Coordinated cross-functional teams across engineering, design, and marketing",
      "Established community governance framework and DAO structure",
      "Implemented comprehensive community analytics and reporting system"
    ],
    achievements: [
      "Reduced project delivery time by 40% through improved workflows",
      "Successfully launched community DAO with 40K active participants",
      "Achieved 95% on-time delivery rate for all project milestones",
      "Increased community engagement rate from 15% to 45%"
    ]
  },
  {
    date: "2021 - 2022",
    company: "BlockchainVentures",
    title: "Community Growth Specialist",
    logo: "/companies/blockchainventures.svg",
    description: [
      "Developed and executed community engagement strategies for 3 DeFi protocols",
      "Created comprehensive educational content and onboarding materials",
      "Managed social media presence reaching 200K+ followers",
      "Organized virtual events and hackathons with 1000+ participants"
    ],
    achievements: [
      "Increased Twitter engagement by 300% through targeted campaigns",
      "Created viral educational series with 2M+ total views",
      "Reduced support response time from 24h to 2h",
      "Built and maintained relationships with 50+ crypto influencers"
    ]
  }
];

const Timeline = () => {
  const { ref: timelineRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div ref={timelineRef} className="relative">
      {/* Line */}
      <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-primary/20" />

      {/* Timeline Items */}
      <div className="space-y-16">
        {timelineData.map((item, index) => (
          <div
            key={index}
            className={`relative flex items-start ${
              index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
            } ${inView ? 'animate-in' : 'animate-out'}`}
          >
            {/* Dot */}
            <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-2 md:-translate-x-2 mt-1.5">
              <div className="w-2 h-2 bg-bg rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Content */}
            <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} ml-12 md:ml-0`}>
              <div className="card bg-bg-light/5 backdrop-blur-sm p-6 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-primary font-medium">{item.date}</span>
                    <h3 className="text-xl font-bold mt-1">{item.title}</h3>
                    <span className="text-text-secondary">{item.company}</span>
                  </div>
                  <div className="w-16 h-16 relative shrink-0">
                    <Image
                      src={item.logo}
                      alt={item.company}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold text-primary/90 mb-2">Responsibilities:</h4>
                  <ul className="space-y-2 list-disc list-inside text-text-secondary">
                    {item.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-primary/90 mb-2">Key Achievements:</h4>
                  <ul className="space-y-2 list-disc list-inside text-text-secondary">
                    {item.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;