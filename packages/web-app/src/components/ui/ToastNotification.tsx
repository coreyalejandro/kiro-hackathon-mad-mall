'use client';

import React, { useState, useEffect } from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  show: boolean;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export default function ToastNotification({ 
  message, 
  type, 
  show, 
  onClose, 
  duration = 3000,
  position = 'top-right'
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  const getPositionStyles = () => {
    const positions = {
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
    };
    return positions[position];
  };

  const getToastStyles = (): React.CSSProperties => {
    const positionStyles = getPositionStyles();
    const existingTransform = 'transform' in positionStyles ? (positionStyles as any).transform : '';
    
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      ...positionStyles,
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '300px',
      opacity: isVisible ? 1 : 0,
      transform: `${existingTransform} ${isVisible ? 'translateY(0)' : 'translateY(-20px)'}`.trim(),
      transition: 'all 0.3s ease',
      color: 'white',
      fontWeight: '500'
    };

    const typeStyles = {
      success: { backgroundColor: '#4CAF50' },
      error: { backgroundColor: '#F44336' },
      info: { backgroundColor: '#2196F3' },
      warning: { backgroundColor: '#FF9800' }
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    return icons[type];
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div style={getToastStyles()}>
      <SpaceBetween direction="horizontal" size="s" alignItems="center">
        <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.4rem',
            padding: '0 4px',
            lineHeight: 1,
            opacity: 0.8,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </SpaceBetween>
    </div>
  );
}