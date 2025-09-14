import React from 'react';
import { Badge as CloudscapeBadge } from '@cloudscape-design/components';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  // Map our variants to Cloudscape badge colors
  const getColor = (variant: string) => {
    switch (variant) {
      case 'secondary':
        return 'grey';
      case 'destructive':
        return 'red';
      case 'outline':
        return 'blue';
      default:
        return 'green';
    }
  };

  return (
    <CloudscapeBadge color={getColor(variant)} className={className}>
      {children}
    </CloudscapeBadge>
  );
};