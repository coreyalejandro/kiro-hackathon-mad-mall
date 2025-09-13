'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { validateImageContent } from '../../lib/image-validation';

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
  src?: string; // Allow direct src for Next.js Image optimization
  width?: number;
  height?: number;
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
  overlayText,
  src,
  width,
  height
}: CommunityImageProps) {
  // For now, we'll use placeholder images until the image library is migrated
  const getPlaceholderImage = () => {
    const placeholders = {
      community: '/images/community-placeholder.jpg',
      wellness: '/images/wellness-placeholder.jpg',
      lifestyle: '/images/lifestyle-placeholder.jpg',
      portraits: '/images/portrait-placeholder.jpg'
    };
    return placeholders[category] || '/images/default-placeholder.jpg';
  };

  const [imageUrl, setImageUrl] = useState(src || getPlaceholderImage());

  useEffect(() => {
    const runValidation = async () => {
      if (!src) return;
      try {
        const result = await validateImageContent({
          url: src,
          altText: alt || '',
          category,
        });
        const ok =
          result.cultural >= 0.8 &&
          result.inclusivity >= 0.8 &&
          !(result.issues || []).some((i) => i.includes('cultural_mismatch'));
        if (!ok) {
          console.warn('Image failed cultural validation', {
            src,
            alt,
            category,
            result,
          });
          setImageUrl(getPlaceholderImage());
        }
      } catch (err) {
        console.error('TitanEngine validation failed', {
          error: err,
          src,
          alt,
          category,
        });
        setImageUrl(getPlaceholderImage());
      }
    };
    runValidation();
  }, [src, alt, category]);
  
  const sizeConfig = {
    small: { width: 120, height: 120 },
    medium: { width: 200, height: 200 },
    large: { width: 300, height: 300 },
    hero: { width: 600, height: 400 }
  };

  const { width: defaultWidth, height: defaultHeight } = sizeConfig[size];
  const imageWidth = width || defaultWidth;
  const imageHeight = height || defaultHeight;

  const containerStyle = {
    position: 'relative' as const,
    display: 'inline-block',
    borderRadius: rounded ? '50%' : '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    ...style
  };

  const imageStyle = {
    objectFit: 'cover' as const,
    objectPosition: 'center',
    filter: 'brightness(1.05) contrast(1.02) saturate(1.1)',
    transition: 'all 0.3s ease',
    borderRadius: rounded ? '50%' : '12px'
  };

  // Fallback for when image fails to load
  const handleImageError = () => {
    console.log('Image failed to load:', imageUrl);
  };

  return (
    <div 
      className={`community-image-container ${className}`}
      style={containerStyle}
    >
      {src ? (
        <Image
          src={imageUrl}
          alt={alt || `Authentic representation of Black women in ${category}`}
          width={imageWidth}
          height={imageHeight}
          style={imageStyle}
          className="community-image"
          onError={handleImageError}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      ) : (
        <div 
          className={`community-image-placeholder ${className}`}
          style={{
            width: imageWidth,
            height: imageHeight,
            backgroundColor: 'var(--color-sage-green, #87A96B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            borderRadius: rounded ? '50%' : '12px',
            ...style
          }}
        >
          Beautiful Black Women
        </div>
      )}
      
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