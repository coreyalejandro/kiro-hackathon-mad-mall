'use client';

import { useState, useEffect } from 'react';
import { Container, Box, SpaceBetween, Button, Header } from '@cloudscape-design/components';

interface HeroSectionProps {
  title: string;
  description: string;
  section: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

export default function HeroSection({
  title,
  description,
  section,
  primaryAction,
  secondaryAction
}: HeroSectionProps) {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch(`/api/images/generate-for-site?section=${section}`);
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setHeroImage(data.images[0].url);
        }
      } catch (error) {
        console.error('Failed to fetch hero image:', error);
      }
    };

    fetchHeroImage();
  }, [section]);

  return (
    <Container>
      <Box padding="xl">
        <div className="hero-section" style={{
          minHeight: '400px',
          background: heroImage
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImage})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}>
          <SpaceBetween size="l">
            <Header
              variant="h1"
              description={description}
              headingTagOverride="h1"
            >
              {title}
            </Header>

            {(primaryAction || secondaryAction) && (
              <SpaceBetween direction="horizontal" size="s">
                {primaryAction && (
                  <Button
                    variant="primary"
                    size="large"
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.text}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    variant="normal"
                    size="large"
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.text}
                  </Button>
                )}
              </SpaceBetween>
            )}
          </SpaceBetween>
        </div>
      </Box>
    </Container>
  );
}