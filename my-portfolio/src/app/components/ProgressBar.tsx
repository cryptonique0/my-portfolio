'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface ProgressBarProps {
  skill: string;
  percentage: number;
  color?: string;
}

const ProgressBar = ({ skill, percentage, color = 'primary' }: ProgressBarProps) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    // no inline styles; we'll rely on class-based width using Tailwind arbitrary values
    if (inView && progressRef.current) {
      // ensure layout recalculates (no direct style mutation)
      progressRef.current.classList.remove('w-0');
      progressRef.current.classList.add(`w-[${percentage}%]`);
    }
  }, [inView, percentage]);

  return (
    <div ref={ref} className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">{skill}</span>
        <span className="text-sm font-medium text-primary">{percentage}%</span>
      </div>
      <div className="h-2 bg-bg-light/10 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className={`h-full rounded-full transition-all duration-1000 ease-out w-0 ${
            color === 'primary' ? 'bg-primary' : `bg-${color}`
          }`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;