import React from 'react';
import { ProgressBar } from '@cloudscape-design/components';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  className = '' 
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <ProgressBar
      value={percentage}
      className={className}
      label={`${percentage}%`}
    />
  );
};