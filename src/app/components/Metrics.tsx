'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

interface Metric {
  title: string;
  value: number;
  suffix: string;
  prefix?: string;
  description: string;
}

const metrics: Metric[] = [
  {
    title: "Community Members",
    value: 150000,
    suffix: "+",
    description: "Active members across Discord, Telegram, and Twitter"
  },
  {
    title: "Project Deliveries",
    value: 25,
    suffix: "+",
    description: "Successful protocol updates and feature launches"
  },
  {
    title: "Engagement Rate",
    value: 85,
    suffix: "%",
    description: "Average daily community engagement"
  },
  {
    title: "Team Leadership",
    value: 50,
    suffix: "+",
    description: "Community moderators and ambassadors managed"
  },
  {
    title: "Growth Rate",
    value: 200,
    suffix: "%",
    prefix: "+",
    description: "Average YoY community growth"
  },
  {
    title: "Content Reach",
    value: 2,
    suffix: "M+",
    description: "Total views on educational content"
  },
  {
    title: "Response Rate",
    value: 95,
    suffix: "%",
    description: "Support ticket resolution rate"
  },
  {
    title: "AMAs Hosted",
    value: 100,
    suffix: "+",
    description: "Successful community AMAs organized"
  },
  {
    title: "Project Success",
    value: 95,
    suffix: "%",
    description: "On-time project delivery rate"
  }
];

const Metrics = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={`p-6 rounded-xl bg-linear-to-br from-black/80 to-black/60 backdrop-blur-sm border border-primary/20 transform transition-all duration-500 ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">{metric.title}</h3>
          <div className="flex items-baseline space-x-1">
            {metric.prefix && (
              <span className="text-primary text-2xl font-bold">{metric.prefix}</span>
            )}
            <CountUp
              end={metric.value}
              duration={2}
              start={inView ? 0 : undefined}
              className="text-4xl font-bold text-primary"
            />
            <span className="text-primary text-2xl font-bold">{metric.suffix}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};

// CountUp component for animated numbers
const CountUp = ({ end, duration = 2, start, className = '' }: { end: number; duration?: number; start?: number; className?: string }) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (start === undefined) return;

    let startTime: number;
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(progress * end));
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [start, end, duration]);

  return <span className={className}>{count?.toLocaleString()}</span>;
};

export default Metrics;