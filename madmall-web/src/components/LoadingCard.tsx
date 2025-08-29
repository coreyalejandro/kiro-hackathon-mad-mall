import React from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';

interface LoadingCardProps {
  height?: string;
  showIcon?: boolean;
}

export default function LoadingCard({ height = '200px', showIcon = true }: LoadingCardProps) {
  return (
    <Box 
      padding="l" 
      className="loading-shimmer"
      style={{ 
        height, 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <SpaceBetween size="m" alignItems="center">
        {showIcon && (
          <Box fontSize="heading-xl" style={{ opacity: 0.3 }}>
            ⏳
          </Box>
        )}
        <Box fontSize="body-m" style={{ opacity: 0.6 }}>
          Loading wellness content...
        </Box>
      </SpaceBetween>
    </Box>
  );
}