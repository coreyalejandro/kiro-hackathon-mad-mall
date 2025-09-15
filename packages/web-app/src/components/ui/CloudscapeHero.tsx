"use client";

import React, { useMemo, useState } from 'react';
import { Container, Header, SpaceBetween, Button, Box, Grid, Badge } from '@cloudscape-design/components';

type Action = { text: string; onClick: () => void; iconName?: string };

interface CloudscapeHeroProps {
  title: string;
  description?: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  highlights?: Array<{ icon?: string; label: string; value?: string }>;
  images?: string[]; // recommended: 2–3 images of Black women in community/wellness contexts
  eyebrow?: string; // e.g., "New"
  chips?: Array<{ iconName?: string; text: string }>;
}

export default function CloudscapeHero({
  title,
  description,
  primaryAction,
  secondaryAction,
  highlights = [],
  images = [],
  eyebrow,
  chips = [{ iconName: 'fire', text: 'Streaks' }, { iconName: 'user-profile', text: 'Community' }],
}: CloudscapeHeroProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1..1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1..1
    setOffset({ x, y });
  };

  const layers = useMemo(() => {
    const base = images.slice(0, 3);
    // If not enough images, fill with subtle gradients
    while (base.length < 3) base.push('');
    return base as [string, string, string];
  }, [images]);

  const layerStyle = (index: number): React.CSSProperties => {
    const depth = [12, 8, 4][index];
    const translateX = offset.x * depth;
    const translateY = offset.y * depth;
    const rotations = [2, -1.5, 1];
    const rotate = rotations[index] + offset.x * 2;
    return {
      transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
      transition: 'transform 120ms ease-out',
    };
  };

  const imageCardStyle = (blur = 0, opacity = 1): React.CSSProperties => ({
    width: '100%',
    height: 260,
    borderRadius: 24,
    boxShadow: '0 30px 70px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.25)',
    overflow: 'hidden',
    filter: `saturate(1.06) contrast(1.03) blur(${blur}px)`,
    opacity,
    background: 'linear-gradient(135deg, #b85450 0%, #87a96b 100%)',
  });

  return (
    <Container>
      {/* Glass gradient surface */}
      <Box
        padding="l"
        style={{
          background: 'linear-gradient(135deg, rgba(184,84,80,0.09), rgba(135,169,107,0.09))',
          borderRadius: 24,
          border: '1px solid var(--color-border-divider-default, #e9ebed)',
        }}
      >
        <Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}> 
          {/* Left: eyebrow, headline, body, CTAs, highlights */}
          <Box>
            <SpaceBetween size="m">
              {eyebrow && (
                <Badge color="blue">{eyebrow}</Badge>
              )}
              <Header
                variant="h1"
                description={description}
                actions={(primaryAction || secondaryAction) ? (
                  <SpaceBetween direction="horizontal" size="xs">
                    {secondaryAction && (
                      <Button variant="normal" iconName={secondaryAction.iconName} onClick={secondaryAction.onClick}>
                        {secondaryAction.text}
                      </Button>
                    )}
                    {primaryAction && (
                      <Button variant="primary" iconName={primaryAction.iconName} onClick={primaryAction.onClick}>
                        {primaryAction.text}
                      </Button>
                    )}
                  </SpaceBetween>
                ) : undefined}
              >
                {title}
              </Header>
              {highlights.length > 0 && (
                <SpaceBetween direction="horizontal" size="s">
                  {highlights.map((h, i) => (
                    <Badge key={i} color="blue">
                      {h.icon ? `${h.icon} ` : ''}{h.label}{h.value ? ` · ${h.value}` : ''}
                    </Badge>
                  ))}
                </SpaceBetween>
              )}
            </SpaceBetween>
          </Box>

          {/* Right: depth-stacked image with overlay chips */}
          <Box onMouseMove={handleMouseMove}>
            <div style={{ position: 'relative', height: 300 }}>
              {/* back glow */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 28,
                background: 'radial-gradient(120% 120% at 80% 20%, rgba(184,84,80,0.25) 0%, rgba(135,169,107,0.18) 40%, transparent 70%)',
                filter: 'blur(18px)'
              }} />

              {/* depth layers */}
              <div style={{ position: 'absolute', top: 0, left: 28, right: 28, ...layerStyle(2) }}>
                <Box style={imageCardStyle(0, 0.75)}>
                  {layers[2] ? (
                    <img src={layers[2]} alt="Community" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </Box>
              </div>
              <div style={{ position: 'absolute', top: 18, left: 14, right: 14, ...layerStyle(1) }}>
                <Box style={imageCardStyle(0, 0.88)}>
                  {layers[1] ? (
                    <img src={layers[1]} alt="Community" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </Box>
              </div>
              <div style={{ position: 'absolute', top: 36, left: 0, right: 0, ...layerStyle(0) }}>
                <Box style={imageCardStyle(0, 1)}>
                  {layers[0] ? (
                    <img src={layers[0]} alt="Community" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </Box>
              </div>

              {/* overlay chips (top-right) */}
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                {chips.map((c, i) => (
                  <Button key={i} variant="normal" iconName={c.iconName}>
                    {c.text}
                  </Button>
                ))}
              </div>
            </div>
          </Box>
        </Grid>
      </Box>
    </Container>
  );
}
