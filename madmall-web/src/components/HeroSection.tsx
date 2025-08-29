import React, { useEffect, useState } from 'react';
import { Button } from '@cloudscape-design/components';
import '../styles/hero-sections.css';

interface HeroSectionProps {
  pageName?: string;
  title: string;
  subtitle: string;
  primaryCTA?: {
    text: string;
    onClick: () => void;
    icon?: string;
  };
  secondaryCTA?: {
    text: string;
    onClick: () => void;
    icon?: string;
  };
  imageContent?: React.ReactNode;
  backgroundGradient?: string;
  floatingElements?: React.ReactNode[];
}

export default function HeroSection({
  pageName,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  imageContent,
  backgroundGradient,
  floatingElements = []
}: HeroSectionProps) {
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset;
      setScrollOffset(offset * 0.5); // Parallax effect
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroStyle = backgroundGradient 
    ? { background: backgroundGradient }
    : {};

  return (
    <div 
      className="hero-section parallax" 
      style={{
        ...heroStyle,
        ['--scroll-offset' as any]: `${scrollOffset}px`
      }}
    >
      <div className="hero-container">
        <div className="hero-bento-grid">
          <div className="hero-content">
            {pageName && <div className="hero-page-name">{pageName}</div>}
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
            
            <div className="hero-cta-group">
              {primaryCTA && (
                <button 
                  className="hero-cta hero-cta-primary"
                  onClick={primaryCTA.onClick}
                >
                  {primaryCTA.icon && <span>{primaryCTA.icon}</span>}
                  {primaryCTA.text}
                </button>
              )}
              
              {secondaryCTA && (
                <button 
                  className="hero-cta hero-cta-secondary"
                  onClick={secondaryCTA.onClick}
                >
                  {secondaryCTA.icon && <span>{secondaryCTA.icon}</span>}
                  {secondaryCTA.text}
                </button>
              )}
            </div>
          </div>
          
          <div className="hero-image-container">
            <div className="hero-image-layer hero-image-depth-2"></div>
            <div className="hero-image-layer hero-image-depth-1"></div>
            <div className="hero-image-layer hero-image-main">
              {imageContent || (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👩🏾‍💼</div>
                  <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    Beautiful Black Women<br />
                    Thriving Together
                  </div>
                </div>
              )}
            </div>
            
            {/* Floating elements for additional depth */}
            {floatingElements.map((element, index) => (
              <div key={index} className="hero-floating-element">
                {element}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}