"use client";

import React, { useEffect, useState } from 'react';
import { validateImageContent } from '../../lib/image-validation';

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

interface AvatarImageProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ children, className = '' }) => (
  <div className={`avatar ${className}`} style={{
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0'
  }}>
    {children}
  </div>
);

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  category = 'avatar',
  className = '',
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  useEffect(() => {
    const runValidation = async () => {
      try {
        const result = await validateImageContent({
          url: src,
          altText: alt,
          category,
        });
        const ok =
          result.cultural >= 0.8 &&
          result.inclusivity >= 0.8 &&
          !(result.issues || []).some((i) => i.includes('cultural_mismatch'));
        if (!ok) {
          console.warn('Avatar image failed cultural validation', {
            src,
            alt,
            category,
            result,
          });
          setImageSrc('/images/default-placeholder.jpg');
        }
      } catch (err) {
        console.error('TitanEngine validation failed', {
          error: err,
          src,
          alt,
          category,
        });
        setImageSrc('/images/default-placeholder.jpg');
      }
    };
    runValidation();
  }, [src, alt, category]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className = '' }) => (
  <div className={className} style={{
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#666'
  }}>
    {children}
  </div>
);