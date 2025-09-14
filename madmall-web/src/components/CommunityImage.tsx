import React from 'react';
import { getImage, getRandomImage } from '../assets/images/imageLibrary';

interface CommunityImageProps {
  category: 'community' | 'wellness' | 'lifestyle' | 'portraits';
  type?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large' | 'hero';
  rounded?: boolean;
  overlay?: boolean;
  overlayText?: string;
}

export default function CommunityImage({
  category,
  type,
  alt,
  className = '',
  style = {},
  size = 'medium',
  rounded = false,
  overlay = false,
  overlayText
}: CommunityImageProps) {
  const imageUrl = type ? getImage(category, type) : getRandomImage(category);
  
  if (!imageUrl) {
    return (
      <div 
        className={`community-image-placeholder ${className}`}
        style={{
          ...style,
          backgroundColor: 'var(--color-sage-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600
        }}
      >
        Beautiful Black Women
      </div>
    );
  }

  const sizeStyles = {
    small: { width: '120px', height: '120px' },
    medium: { width: '200px', height: '200px' },
    large: { width: '300px', height: '300px' },
    hero: { width: '100%', height: '400px' }
  };

  const imageStyle = {
    ...sizeStyles[size],
    objectFit: 'cover' as const,
    objectPosition: 'center',
    borderRadius: rounded ? '50%' : '12px',
    filter: 'brightness(1.05) contrast(1.02) saturate(1.1)',
    transition: 'all 0.3s ease',
    ...style
  };

  return (
    <div 
      className={`community-image-container ${className}`}
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        borderRadius: rounded ? '50%' : '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
      }}
    >
      <img
        src={imageUrl}
        alt={alt || `Authentic representation of Black women in ${category}`}
        style={imageStyle}
        className="community-image"
        loading="lazy"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />
      
      {overlay && (
        <div 
          className="community-image-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(184, 84, 80, 0.2), rgba(135, 169, 107, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            borderRadius: rounded ? '50%' : '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        >
          {overlayText && (
            <div 
              style={{
                color: 'white',
                fontWeight: 600,
                textAlign: 'center',
                padding: '1rem',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
              }}
            >
              {overlayText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}