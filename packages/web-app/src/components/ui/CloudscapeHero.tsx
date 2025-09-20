"use client";

import React, { useMemo } from 'react';
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

  const layers = useMemo(() => {
    const base = images.slice(0, 3);
    // If not enough images, fill with subtle gradients
    while (base.length < 3) base.push('');
    return base as [string, string, string];
  }, [images]);


  return (
    <Container>
      {/* Glass gradient surface */}
      <Box
        padding="l"
        variant="div"
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
          <Box>
            <Box variant="div">
              {/* back glow */}
              <Box variant="div" />

              {/* depth layers */}
              <Box variant="div">
                <Box variant="div">
                  {layers[2] ? (
                    <img src={layers[2]} alt="Community" />
                  ) : null}
                </Box>
              </Box>
              <Box variant="div">
                <Box variant="div">
                  {layers[1] ? (
                    <img src={layers[1]} alt="Community" />
                  ) : null}
                </Box>
              </Box>
              <Box variant="div">
                <Box variant="div">
                  {layers[0] ? (
                    <img src={layers[0]} alt="Community" />
                  ) : null}
                </Box>
              </Box>

              {/* overlay chips (top-right) */}
              <SpaceBetween direction="horizontal" size="xs">
                {chips.map((c, i) => (
                  <Button key={i} variant="normal" iconName={c.iconName}>
                    {c.text}
                  </Button>
                ))}
              </SpaceBetween>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Container>
  );
}
