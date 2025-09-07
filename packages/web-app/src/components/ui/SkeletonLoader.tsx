import React from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'text' | 'avatar' | 'button';
  count?: number;
  height?: string;
  width?: string;
  animated?: boolean;
}

export default function SkeletonLoader({ 
  type, 
  count = 1, 
  height = '20px', 
  width = '100%',
  animated = true
}: SkeletonLoaderProps) {
  const skeletonStyle: React.CSSProperties = {
    background: animated 
      ? 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
      : '#f0f0f0',
    backgroundSize: animated ? '200% 100%' : 'auto',
    animation: animated ? 'shimmer 1.5s infinite' : undefined,
    borderRadius: '4px',
    height,
    width
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div style={{ padding: 'var(--space-scaled-l)', border: '1px solid #e0e0e0', borderRadius: '12px' }}>
            <SpaceBetween size="m">
              <div style={{ ...skeletonStyle, height: '24px', width: '60%' }} />
              <div style={{ ...skeletonStyle, height: '16px', width: '100%' }} />
              <div style={{ ...skeletonStyle, height: '16px', width: '80%' }} />
              <SpaceBetween direction="horizontal" size="s">
                <div style={{ ...skeletonStyle, height: '24px', width: '80px' }} />
                <div style={{ ...skeletonStyle, height: '24px', width: '100px' }} />
              </SpaceBetween>
              <div style={{ ...skeletonStyle, height: '36px', width: '120px' }} />
            </SpaceBetween>
          </div>
        );
      
      case 'list':
        return (
          <SpaceBetween size="s">
            <div style={{ ...skeletonStyle, height: '20px', width: '70%' }} />
            <div style={{ ...skeletonStyle, height: '16px', width: '100%' }} />
            <div style={{ ...skeletonStyle, height: '16px', width: '90%' }} />
          </SpaceBetween>
        );
      
      case 'avatar':
        return (
          <div style={{ 
            ...skeletonStyle, 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%' 
          }} />
        );
      
      case 'button':
        return (
          <div style={{ 
            ...skeletonStyle, 
            height: '36px', 
            width: '120px',
            borderRadius: '6px'
          }} />
        );
      
      case 'text':
      default:
        return <div style={skeletonStyle} />;
    }
  };

  return (
    <>
      {animated && (
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}
        </style>
      )}
      <SpaceBetween size="m">
        {Array.from({ length: count }, (_, index) => (
          <div key={index}>
            {renderSkeleton()}
          </div>
        ))}
      </SpaceBetween>
    </>
  );
}