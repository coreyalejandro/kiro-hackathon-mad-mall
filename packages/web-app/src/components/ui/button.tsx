import React from 'react';
import { Button as CloudscapeButton } from '@cloudscape-design/components';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}) => {
  // Map our variants to Cloudscape button variants
  const getVariant = (variant: string) => {
    switch (variant) {
      case 'destructive':
        return 'primary';
      case 'outline':
        return 'normal';
      case 'secondary':
        return 'normal';
      case 'ghost':
        return 'inline-link';
      case 'link':
        return 'inline-link';
      default:
        return 'primary';
    }
  };

  return (
    <CloudscapeButton
      variant={getVariant(variant)}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </CloudscapeButton>
  );
};