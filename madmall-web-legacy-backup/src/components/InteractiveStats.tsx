import React, { useState, useEffect } from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  icon: string;
}

interface InteractiveStatsProps {
  stats: StatItem[];
}

export default function InteractiveStats({ stats }: InteractiveStatsProps) {
  const [animatedStats, setAnimatedStats] = useState<StatItem[]>(
    stats.map(stat => ({ ...stat, value: 0 }))
  );

  useEffect(() => {
    const animateStats = () => {
      stats.forEach((stat, index) => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = stat.value / steps;
        let currentValue = 0;

        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= stat.value) {
            currentValue = stat.value;
            clearInterval(timer);
          }

          setAnimatedStats(prev => 
            prev.map((item, i) => 
              i === index 
                ? { ...item, value: Math.floor(currentValue) }
                : item
            )
          );
        }, duration / steps);
      });
    };

    // Start animation after a short delay
    const timeout = setTimeout(animateStats, 500);
    return () => clearTimeout(timeout);
  }, [stats]);

  return (
    <SpaceBetween direction="horizontal" size="l">
      {animatedStats.map((stat, index) => (
        <Box 
          key={index}
          className="stat-card"
          padding="m"
          textAlign="center"
        >
          <SpaceBetween size="xs">
            <Box fontSize="heading-xl">{stat.icon}</Box>
            <Box className="stat-number" fontSize="heading-l">
              {stat.value.toLocaleString()}{stat.suffix || ''}
            </Box>
            <Box fontSize="body-s" color="text-body-secondary">
              {stat.label}
            </Box>
          </SpaceBetween>
        </Box>
      ))}
    </SpaceBetween>
  );
}