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
  variant?: 'viewport' | 'contained';
  bentoBoxes?: Array<{
    title: string;
    content: string;
    icon: string;
    action?: () => void;
    size?: 'small' | 'medium' | 'large';
  }>;
}

export default function HeroSection({
  pageName,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  imageContent,
  backgroundGradient,
  floatingElements = [],
  variant = 'viewport',
  bentoBoxes = []
}: HeroSectionProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset;
      setScrollOffset(offset * 0.5); // Parallax effect
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const heroStyle = backgroundGradient 
    ? { background: backgroundGradient }
    : {};

  const heroClasses = `hero-section parallax hero-${variant}`;

  return (
    <div 
      className={heroClasses}
      style={{
        ...heroStyle,
        ['--scroll-offset' as any]: `${scrollOffset}px`,
        ['--mouse-x' as any]: `${mousePosition.x}%`,
        ['--mouse-y' as any]: `${mousePosition.y}%`
      }}
    >
      <div className="hero-container">
        <div className="hero-main-grid">
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
                  {primaryCTA.icon && <span className="hero-cta-icon">{primaryCTA.icon}</span>}
                  {primaryCTA.text}
                </button>
              )}
              
              {secondaryCTA && (
                <button 
                  className="hero-cta hero-cta-secondary"
                  onClick={secondaryCTA.onClick}
                >
                  {secondaryCTA.icon && <span className="hero-cta-icon">{secondaryCTA.icon}</span>}
                  {secondaryCTA.text}
                </button>
              )}
            </div>
          </div>
          
          <div className="hero-visual-container">
            <div className="hero-image-container">
              <div className="hero-image-layer hero-image-depth-2"></div>
              <div className="hero-image-layer hero-image-depth-1"></div>
              <div className="hero-image-layer hero-image-main">
                {imageContent || (
                  <div className="hero-default-content">
                    <div className="hero-default-icon">👩🏾‍💼</div>
                    <div className="hero-default-text">
                      Beautiful Black Women<br />
                      Thriving Together
                    </div>
                  </div>
                )}
              </div>
              
              {/* Floating elements for additional depth */}
              {floatingElements.map((element, index) => (
                <div 
                  key={index} 
                  className={`hero-floating-element hero-floating-${index + 1}`}
                  style={{
                    ['--delay' as any]: `${index * 0.5}s`
                  }}
                >
                  {element}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AWS-style Bento Box Grid */}
        {bentoBoxes.length > 0 && (
          <div className="hero-bento-container">
            <div className="hero-bento-grid">
              {bentoBoxes.map((box, index) => (
                <div 
                  key={index}
                  className={`hero-bento-box hero-bento-${box.size || 'medium'}`}
                  onClick={box.action}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      box.action?.();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${box.title}: ${box.content}`}
                  style={{
                    ['--animation-delay' as any]: `${index * 0.1}s`
                  }}
                >
                  <div className="hero-bento-icon">{box.icon}</div>
                  <div className="hero-bento-title">{box.title}</div>
                  <div className="hero-bento-content">{box.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}