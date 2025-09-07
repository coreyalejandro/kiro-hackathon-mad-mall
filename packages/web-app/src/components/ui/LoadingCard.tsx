import React from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';

interface LoadingCardProps {
  height?: string;
  showIcon?: boolean;
  message?: string;
  variant?: 'default' | 'shimmer' | 'pulse';
}

export default function LoadingCard({ 
  height = '200px', 
  showIcon = true,
  message = 'Loading wellness content...',
  variant = 'shimmer'
}: LoadingCardProps) {
  const getLoadingClass = () => {
    switch (variant) {
      case 'shimmer':
        return 'loading-shimmer';
      case 'pulse':
        return 'loading-pulse';
      default:
        return 'loading-default';
    }
  };

  return (
    <div 
      className={getLoadingClass()}
      style={{ 
        padding: 'var(--space-scaled-l)',
        height, 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background-container-content)',
        border: '1px solid var(--color-border-divider-default)'
      }}
    >
      <SpaceBetween size="m" alignItems="center">
        {showIcon && (
          <div 
            style={{ 
              fontSize: 'var(--font-size-heading-xl)',
              opacity: 0.3,
              animation: variant === 'pulse' ? 'pulse 1.5s ease-in-out infinite' : undefined
            }}
          >
            ⏳
          </div>
        )}
        <div 
          style={{ 
            fontSize: 'var(--font-size-body-m)',
            opacity: 0.6,
            textAlign: 'center'
          }}
        >
          {message}
        </div>
      </SpaceBetween>
    </div>
  );
}