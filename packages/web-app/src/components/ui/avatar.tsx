import React from 'react';

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

interface AvatarImageProps {
  src: string;
  alt: string;
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

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className = '' }) => (
  <img 
    src={src} 
    alt={alt} 
    className={className}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }}
  />
);

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className = '' }) => (
  <div className={className} style={{
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#666'
  }}>
    {children}
  </div>
);