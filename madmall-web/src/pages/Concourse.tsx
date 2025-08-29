import React from 'react';
import {
  Container,
  Header,
  Grid,
  Box,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Icon
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import FeaturedBrands from '../components/FeaturedBrands';

const mallSections = [
  {
    id: 'peer-circles',
    title: 'Peer Circles',
    description: 'Connect with sisters who understand your journey. Share experiences, find support, and build lasting friendships.',
    icon: 'user-profile',
    color: 'blue',
    href: '/circles',
    stats: '127 active members'
  },
  {
    id: 'comedy-lounge',
    title: 'Comedy Lounge',
    description: 'Find relief through laughter. Curated comedy content designed to lift your spirits and reduce stress.',
    icon: 'heart',
    color: 'green',
    href: '/comedy',
    stats: '45 new clips this week'
  },
  {
    id: 'story-booth',
    title: 'Story Booth',
    description: 'Share your voice. Record audio stories, write posts, and inspire others with your experiences.',
    icon: 'microphone',
    color: 'purple',
    href: '/stories',
    stats: '23 stories shared today'
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Support Black-owned wellness brands. Discover products that celebrate your culture and support your health.',
    icon: 'shopping-cart',
    color: 'orange',
    href: '/marketplace',
    stats: '89 featured brands'
  },
  {
    id: 'resource-hub',
    title: 'Resource Hub',
    description: 'Access curated health information, wellness tips, and educational content from trusted sources.',
    icon: 'book',
    color: 'teal',
    href: '/resources',
    stats: '156 articles available'
  }
];

export default function Concourse() {
  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>✨</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>💫</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>🌟</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="Concourse"
        title="Welcome to Your Wellness Sanctuary"
        subtitle="A digital mall designed by and for Black women living with Graves' Disease. Find sisterhood, healing, and joy in our culturally safe community space."
        primaryCTA={{
          text: "Join a Circle",
          onClick: () => window.location.href = '/circles',
          icon: "👥"
        }}
        secondaryCTA={{
          text: "Explore the Mall",
          onClick: () => document.getElementById('mall-sections')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "🏬"
        }}
        backgroundGradient="linear-gradient(135deg, var(--color-burnt-sienna), var(--color-golden-ochre), var(--color-sage-green))"
        floatingElements={floatingElements}
      />
      
      <SpaceBetween size="l">

      <FeaturedBrands />

      <Container>
        <Header variant="h2" id="mall-sections" className="text-rich-umber">
          Explore Your Wellness Mall
        </Header>
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* Peer Circles */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-xl">👥</Box>
                <Header variant="h3">Peer Circles</Header>
              </SpaceBetween>
              <Box>
                Connect with sisters who understand your journey. Share experiences, find support, and build lasting friendships.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">
                  127 active members
                </Badge>
                <Badge color="grey">
                  5 new clips this week
                </Badge>
              </SpaceBetween>
              <Button 
                variant="primary" 
                href="/circles"
              >
                Visit Peer Circles
              </Button>
            </SpaceBetween>
          </Box>

          {/* Comedy Lounge */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-xl">😂</Box>
                <Header variant="h3">Comedy Lounge</Header>
              </SpaceBetween>
              <Box>
                Find relief through laughter. Curated comedy content designed to lift your spirits and reduce stress.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">
                  45 new clips this week
                </Badge>
                <Badge color="grey">
                  ⭐ 4.9 relief rating
                </Badge>
              </SpaceBetween>
              <Button 
                variant="primary" 
                href="/comedy"
              >
                Visit Comedy Lounge
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {/* Story Booth */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🎤</Box>
                <Header variant="h4">Story Booth</Header>
              </SpaceBetween>
              <Box>
                Share your voice. Record audio stories, write posts, and inspire others.
              </Box>
              <Badge color="grey">
                23 stories today
              </Badge>
              <Button 
                size="small"
                href="/stories"
              >
                Visit Story Booth
              </Button>
            </SpaceBetween>
          </Box>

          {/* Marketplace */}
          <Box padding="l" className="kadir-nelson-accent">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🛍️</Box>
                <Header variant="h4">Marketplace</Header>
              </SpaceBetween>
              <Box>
                Support Black-owned wellness brands that celebrate your culture.
              </Box>
              <Badge color="grey">
                89 featured brands
              </Badge>
              <Button 
                size="small"
                href="/marketplace"
              >
                Visit Marketplace
              </Button>
            </SpaceBetween>
          </Box>

          {/* Resource Hub */}
          <Box padding="l" className="kadir-nelson-secondary">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">📚</Box>
                <Header variant="h4">Resource Hub</Header>
              </SpaceBetween>
              <Box>
                Access curated health information and wellness tips from trusted sources.
              </Box>
              <Badge color="grey">
                156 articles available
              </Badge>
              <Button 
                size="small"
                href="/resources"
              >
                Visit Resource Hub
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2">
          Today's Highlights
        </Header>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="s">
              <Header variant="h4">💬 Active Discussions</Header>
              <Box>Join the conversation in "Managing Anxiety Together" - 12 new messages</Box>
              <Button 
                size="small"
              >
                Join Discussion
              </Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="s">
              <Header variant="h4">😂 Comedy Relief</Header>
              <Box>New "Graves Giggles" collection just dropped - 5 minutes of pure joy</Box>
              <Button 
                size="small"
              >
                Watch Now
              </Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="s">
              <Header variant="h4">🛍️ Featured Brand</Header>
              <Box>Discover "Melanin Wellness Co." - Natural supplements for thyroid support</Box>
              <Button 
                size="small"
              >
                Shop Now
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>
      </SpaceBetween>
    </div>
  );
}