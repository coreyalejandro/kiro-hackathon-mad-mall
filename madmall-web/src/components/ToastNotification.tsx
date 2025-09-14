import React, { useState, useEffect } from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({ 
  message, 
  type, 
  show, 
  onClose, 
  duration = 3000 
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '300px',
      transform: show ? 'translateX(0)' : 'translateX(400px)',
      transition: 'transform 0.3s ease',
      color: 'white',
      fontWeight: '500'
    };

    const typeStyles = {
      success: { backgroundColor: 'var(--color-sage-green)' },
      error: { backgroundColor: '#CD5C5C' },
      info: { backgroundColor: 'var(--color-burnt-sienna)' },
      warning: { backgroundColor: 'var(--color-golden-ochre)' }
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

  return (
    <div style={getToastStyles()}>
      <SpaceBetween direction="horizontal" size="s" alignItems="center">
        <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </SpaceBetween>
    </div>
  );
}