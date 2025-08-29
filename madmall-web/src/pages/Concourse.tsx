import React, { useState } from 'react';
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
import InteractiveStats from '../components/InteractiveStats';
import '../styles/concourse-interactions.css';

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
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const showInteractionFeedback = (message: string) => {
    setFeedback(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const handleSectionClick = (sectionName: string, href: string) => {
    showInteractionFeedback(`Navigating to ${sectionName}...`);
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  };

  const communityStats = [
    { label: 'Active Members', value: 1247, icon: '👥' },
    { label: 'Stories Shared', value: 89, icon: '📖' },
    { label: 'Comedy Clips', value: 156, icon: '😂' },
    { label: 'Relief Rating', value: 4.8, suffix: '/5', icon: '⭐' }
  ];

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

      {/* Floating Feedback */}
      <div className={`floating-feedback ${showFeedback ? 'show' : ''}`}>
        {feedback}
      </div>

      <Container>
        <SpaceBetween size="l">
          <Box textAlign="center">
            <Header variant="h2" className="text-rich-umber">
              Community at a Glance
            </Header>
            <InteractiveStats stats={communityStats} />
          </Box>
        </SpaceBetween>
      </Container>

      <Container>
        <Header variant="h2" id="mall-sections" className="text-rich-umber">
          Explore Your Wellness Mall
        </Header>
        <div className="interactive-grid">
          <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
            {/* Peer Circles */}
            <Box 
              padding="l" 
              className="kadir-nelson-gradient-warm mall-section-card ripple-effect"
              onClick={() => handleSectionClick('Peer Circles', '/circles')}
              tabIndex={0}
              role="button"
              aria-label="Visit Peer Circles"
            >
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-xl" className="mall-section-icon">👥</Box>
                  <Header variant="h3">Peer Circles</Header>
                </SpaceBetween>
                <Box>
                  Connect with sisters who understand your journey. Share experiences, find support, and build lasting friendships.
                </Box>
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Badge color="grey" className="mall-section-badge">
                    127 active members
                  </Badge>
                  <Badge color="grey" className="mall-section-badge active-indicator">
                    5 new clips this week
                  </Badge>
                </SpaceBetween>
                <Button 
                  variant="primary"
                  className="mall-section-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionClick('Peer Circles', '/circles');
                  }}
                >
                  Visit Peer Circles
                </Button>
              </SpaceBetween>
            </Box>

            {/* Comedy Lounge */}
            <Box 
              padding="l" 
              className="kadir-nelson-gradient-sage mall-section-card ripple-effect"
              onClick={() => handleSectionClick('Comedy Lounge', '/comedy')}
              tabIndex={0}
              role="button"
              aria-label="Visit Comedy Lounge"
            >
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-xl" className="mall-section-icon">😂</Box>
                  <Header variant="h3">Comedy Lounge</Header>
                </SpaceBetween>
                <Box>
                  Find relief through laughter. Curated comedy content designed to lift your spirits and reduce stress.
                </Box>
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Badge color="grey" className="mall-section-badge">
                    45 new clips this week
                  </Badge>
                  <Badge color="grey" className="mall-section-badge">
                    ⭐ 4.9 relief rating
                  </Badge>
                </SpaceBetween>
                <Button 
                  variant="primary"
                  className="mall-section-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionClick('Comedy Lounge', '/comedy');
                  }}
                >
                  Visit Comedy Lounge
                </Button>
              </SpaceBetween>
            </Box>
          </Grid>
        </div>

        <div className="interactive-grid">
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {/* Story Booth */}
            <Box 
              padding="l" 
              className="kadir-nelson-gradient-earth mall-section-card ripple-effect"
              onClick={() => handleSectionClick('Story Booth', '/stories')}
              tabIndex={0}
              role="button"
              aria-label="Visit Story Booth"
            >
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-l" className="mall-section-icon">🎤</Box>
                  <Header variant="h4">Story Booth</Header>
                </SpaceBetween>
                <Box>
                  Share your voice. Record audio stories, write posts, and inspire others.
                </Box>
                <Badge color="grey" className="mall-section-badge">
                  23 stories today
                </Badge>
                <Button 
                  variant="primary"
                  className="mall-section-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionClick('Story Booth', '/stories');
                  }}
                >
                  Visit Story Booth
                </Button>
              </SpaceBetween>
            </Box>

            {/* Marketplace */}
            <Box 
              padding="l" 
              className="kadir-nelson-accent mall-section-card ripple-effect"
              onClick={() => handleSectionClick('Marketplace', '/marketplace')}
              tabIndex={0}
              role="button"
              aria-label="Visit Marketplace"
            >
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-l" className="mall-section-icon">🛍️</Box>
                  <Header variant="h4">Marketplace</Header>
                </SpaceBetween>
                <Box>
                  Support Black-owned wellness brands that celebrate your culture.
                </Box>
                <Badge color="grey" className="mall-section-badge">
                  89 featured brands
                </Badge>
                <Button 
                  variant="primary"
                  className="mall-section-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionClick('Marketplace', '/marketplace');
                  }}
                >
                  Visit Marketplace
                </Button>
              </SpaceBetween>
            </Box>

            {/* Resource Hub */}
            <Box 
              padding="l" 
              className="kadir-nelson-secondary mall-section-card ripple-effect"
              onClick={() => handleSectionClick('Resource Hub', '/resources')}
              tabIndex={0}
              role="button"
              aria-label="Visit Resource Hub"
            >
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-l" className="mall-section-icon">📚</Box>
                  <Header variant="h4">Resource Hub</Header>
                </SpaceBetween>
                <Box>
                  Access curated health information and wellness tips from trusted sources.
                </Box>
                <Badge color="grey" className="mall-section-badge">
                  156 articles available
                </Badge>
                <Button 
                  variant="primary"
                  className="mall-section-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionClick('Resource Hub', '/resources');
                  }}
                >
                  Visit Resource Hub
                </Button>
              </SpaceBetween>
            </Box>
          </Grid>
        </div>
      </Container>

      <Container>
        <Header variant="h2">
          Today's Highlights
        </Header>
        <div className="interactive-grid">
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            <Box 
              padding="l" 
              className="kadir-nelson-gradient-warm highlight-card"
              onClick={() => showInteractionFeedback('Joining discussion...')}
              tabIndex={0}
              role="button"
              aria-label="Join Active Discussion"
            >
              <SpaceBetween size="s">
                <Header variant="h4" className="breadcrumb-trail">💬 Active Discussions</Header>
                <Box>Join the conversation in "Managing Anxiety Together" - 12 new messages</Box>
                <Button 
                  variant="normal"
                  className="mall-section-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showInteractionFeedback('Joining discussion...');
                  }}
                >
                  Join Discussion
                </Button>
              </SpaceBetween>
            </Box>
            
            <Box 
              padding="l" 
              className="kadir-nelson-gradient-sage highlight-card"
              onClick={() => {
                showInteractionFeedback('Loading comedy content...');
                setTimeout(() => window.location.href = '/comedy', 500);
              }}
              tabIndex={0}
              role="button"
              aria-label="Watch Comedy Content"
            >
              <SpaceBetween size="s">
                <Header variant="h4" className="breadcrumb-trail">😂 Comedy Relief</Header>
                <Box>New "Graves Giggles" collection just dropped - 5 minutes of pure joy</Box>
                <Button 
                  variant="normal"
                  className="mall-section-button success-animation"
                  onClick={(e) => {
                    e.stopPropagation();
                    showInteractionFeedback('Loading comedy content...');
                    setTimeout(() => window.location.href = '/comedy', 500);
                  }}
                >
                  Watch Now
                </Button>
              </SpaceBetween>
            </Box>
            
            <Box 
              padding="l" 
              className="kadir-nelson-gradient-earth highlight-card"
              onClick={() => {
                showInteractionFeedback('Opening marketplace...');
                setTimeout(() => window.location.href = '/marketplace', 500);
              }}
              tabIndex={0}
              role="button"
              aria-label="Shop Featured Brand"
            >
              <SpaceBetween size="s">
                <Header variant="h4" className="breadcrumb-trail">🛍️ Featured Brand</Header>
                <Box>Discover "Melanin Wellness Co." - Natural supplements for thyroid support</Box>
                <Button 
                  variant="normal"
                  className="mall-section-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showInteractionFeedback('Opening marketplace...');
                    setTimeout(() => window.location.href = '/marketplace', 500);
                  }}
                >
                  Shop Now
                </Button>
              </SpaceBetween>
            </Box>
          </Grid>
        </div>
      </Container>
      </SpaceBetween>
    </div>
  );
}