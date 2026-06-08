import React from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '../utils/cn';

const StatItem = React.memo(({ count, prefix = '', suffix = '', label, className = '', light = false }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const [displayCount, setDisplayCount] = React.useState(0);

  React.useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(count);
      if (isNaN(end)) return;
      
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / end));
      if (stepTime === 0) {
        setDisplayCount(end);
        return;
      }
      
      const timer = setInterval(() => {
        start += 1;
        setDisplayCount(start);
        if (start >= end) {
          setDisplayCount(end);
          clearInterval(timer);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [inView, count]);

  return (
    <div ref={ref} className={className}>
      <div className={cn(
        "text-3xl md:text-4xl font-extrabold leading-none",
        light ? "text-accent-light" : "text-accent"
      )}>
        {prefix}{displayCount}{suffix}
      </div>
      <div className={cn(
        "text-sm mt-2 font-bold",
        light ? "text-white/70" : "text-gray-600"
      )}>
        {label}
      </div>
    </div>
  );
});

export default StatItem;
