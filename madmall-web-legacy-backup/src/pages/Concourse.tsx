import { useState } from 'react';
import React from 'react';
import {
  Container,
  Header,
  Grid,
  Box,
  Button,
  SpaceBetween,
  Badge
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import InteractiveStats from '../components/InteractiveStats';
import CommunityTestimonials from '../components/CommunityTestimonials';
import '../styles/concourse-interactions.css';



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
    <div className="floating-element-large">✨</div>,
    <div className="floating-element-medium">💫</div>,
    <div className="floating-element-small">🌟</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="concourse"
        title="Welcome to Your Wellness Sanctuary"
        subtitle="A digital mall designed by and for Black women living with Graves' Disease. Find sisterhood, healing, and joy in our culturally safe community space."
        variant="contained"
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
        bentoBoxes={[
          {
            title: "127 Active Members",
            content: "Join our growing community of sisters supporting each other",
            icon: "👥",
            action: () => window.location.href = '/circles',
            size: 'medium'
          },
          {
            title: "45 New Comedy Clips",
            content: "Fresh therapeutic content added this week",
            icon: "😂",
            action: () => window.location.href = '/comedy',
            size: 'medium'
          },
          {
            title: "4.8/5 Relief Rating",
            content: "Community-rated therapeutic effectiveness",
            icon: "⭐",
            action: () => document.getElementById('mall-sections')?.scrollIntoView({ behavior: 'smooth' }),
            size: 'large'
          }
        ]}
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
            <div 
              className="kadir-nelson-gradient-warm mall-section-card ripple-effect mall-section-container"
              onClick={() => handleSectionClick('Peer Circles', '/circles')}
              tabIndex={0}
              role="button"
              aria-label="Visit Peer Circles"
            >
              <Box padding="l">
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
            </div>

            {/* Comedy Lounge */}
            <div 
              className="kadir-nelson-gradient-sage mall-section-card ripple-effect mall-section-container"
              onClick={() => handleSectionClick('Comedy Lounge', '/comedy')}
              tabIndex={0}
              role="button"
              aria-label="Visit Comedy Lounge"
            >
              <Box padding="l">
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
            </div>
          </Grid>
        </div>

        <div className="interactive-grid">
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {/* Story Booth */}
            <div 
              className="kadir-nelson-gradient-earth mall-section-card ripple-effect mall-section-container"
              onClick={() => handleSectionClick('Story Booth', '/stories')}
              tabIndex={0}
              role="button"
              aria-label="Visit Story Booth"
            >
              <Box padding="l">
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-l" className="mall-section-icon">🎤</Box>
                  <Header variant="h3">Story Booth</Header>
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
            </div>

            {/* Marketplace */}
            <div 
              className="kadir-nelson-accent mall-section-card ripple-effect mall-section-container"
              onClick={() => handleSectionClick('Marketplace', '/marketplace')}
              tabIndex={0}
              role="button"
              aria-label="Visit Marketplace"
            >
              <Box padding="l">
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-l" className="mall-section-icon">🛍️</Box>
                  <Header variant="h3">Marketplace</Header>
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
            </div>

            {/* Resource Hub */}
            <div 
              className="kadir-nelson-secondary mall-section-card ripple-effect mall-section-container"
              onClick={() => handleSectionClick('Resource Hub', '/resources')}
              tabIndex={0}
              role="button"
              aria-label="Visit Resource Hub"
            >
              <Box padding="l">
              <SpaceBetween size="m">
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-l" className="mall-section-icon">📚</Box>
                  <Header variant="h3">Resource Hub</Header>
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
            </div>
          </Grid>
        </div>
      </Container>

      <Container>
        <Header variant="h2">
          Today's Highlights
        </Header>
        <div className="interactive-grid">
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            <div 
              className="kadir-nelson-gradient-warm highlight-card mall-section-container"
              onClick={() => showInteractionFeedback('Joining discussion...')}
              tabIndex={0}
              role="button"
              aria-label="Join Active Discussion"
            >
              <Box padding="l">
              <SpaceBetween size="s">
                <Header variant="h3" className="breadcrumb-trail">💬 Active Discussions</Header>
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
            </div>
            
            <div 
              className="kadir-nelson-gradient-sage highlight-card mall-section-container"
              onClick={() => {
                showInteractionFeedback('Loading comedy content...');
                setTimeout(() => window.location.href = '/comedy', 500);
              }}
              tabIndex={0}
              role="button"
              aria-label="Watch Comedy Content"
            >
              <Box padding="l">
              <SpaceBetween size="s">
                <Header variant="h3" className="breadcrumb-trail">😂 Comedy Relief</Header>
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
            </div>
            
            <div 
              className="kadir-nelson-gradient-earth highlight-card mall-section-container"
              onClick={() => {
                showInteractionFeedback('Opening marketplace...');
                setTimeout(() => window.location.href = '/marketplace', 500);
              }}
              tabIndex={0}
              role="button"
              aria-label="Shop Featured Brand"
            >
              <Box padding="l">
              <SpaceBetween size="s">
                <Header variant="h3" className="breadcrumb-trail">🛍️ Featured Brand</Header>
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
            </div>
          </Grid>
        </div>
      </Container>

      <CommunityTestimonials />
      </SpaceBetween>
    </div>
  );
}