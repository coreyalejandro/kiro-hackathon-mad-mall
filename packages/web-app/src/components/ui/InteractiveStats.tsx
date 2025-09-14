'use client';

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
  animationDelay?: number;
  animationDuration?: number;
}

export default function InteractiveStats({ 
  stats, 
  animationDelay = 500,
  animationDuration = 2000 
}: InteractiveStatsProps) {
  const [animatedStats, setAnimatedStats] = useState<StatItem[]>(
    stats.map(stat => ({ ...stat, value: 0 }))
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set up intersection observer for animation trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('interactive-stats');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const animateStats = () => {
      stats.forEach((stat, index) => {
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
        }, animationDuration / steps);
      });
    };

    // Start animation after delay
    const timeout = setTimeout(animateStats, animationDelay);
    return () => clearTimeout(timeout);
  }, [stats, isVisible, animationDelay, animationDuration]);

  return (
    <div id="interactive-stats">
      <SpaceBetween direction="horizontal" size="l">
        {animatedStats.map((stat, index) => (
          <div 
            key={index}
            className="stat-card stat-card-interactive"
          >
            <SpaceBetween size="xs">
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-number stat-number-gradient">
                {stat.value.toLocaleString()}{stat.suffix || ''}
              </div>
              <Box fontSize="body-s" color="text-body-secondary">
                {stat.label}
              </Box>
            </SpaceBetween>
          </div>
        ))}
      </SpaceBetween>
    </div>
  );
}