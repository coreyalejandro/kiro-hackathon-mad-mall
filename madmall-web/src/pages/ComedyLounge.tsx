import React from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Grid,
  Icon
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';

const comedyClips = [
  {
    id: '1',
    title: 'Graves Giggles: Thyroid Humor',
    description: 'When your thyroid has more mood swings than a teenager 😂',
    duration: '3:45',
    views: 234,
    rating: 4.8,
    thumbnail: '🎭'
  },
  {
    id: '2',
    title: 'Doctor Visit Chronicles',
    description: 'That moment when you Google your symptoms and WebMD says you have 47 different diseases',
    duration: '2:30',
    views: 189,
    rating: 4.9,
    thumbnail: '👩‍⚕️'
  },
  {
    id: '3',
    title: 'Medication Reminders',
    description: 'Setting 15 alarms to remember your pills and still forgetting anyway',
    duration: '4:12',
    views: 156,
    rating: 4.7,
    thumbnail: '💊'
  },
  {
    id: '4',
    title: 'Energy Level Rollercoaster',
    description: 'From "I can conquer the world" to "I need a nap" in 0.5 seconds',
    duration: '5:20',
    views: 298,
    rating: 4.9,
    thumbnail: '🎢'
  }
];

export default function ComedyLounge() {
  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>😂</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>🎭</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>✨</div>
  ];

  return (
    <div>
      <HeroSection
        title="Laughter is the Best Medicine"
        subtitle="Find relief through joy and humor. Our curated comedy content is designed specifically to lift your spirits and provide therapeutic relief during challenging moments."
        primaryCTA={{
          text: "Watch Comedy",
          onClick: () => document.getElementById('featured-comedy')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "🎬"
        }}
        secondaryCTA={{
          text: "Rate Your Mood",
          onClick: () => document.getElementById('mood-rating')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "💝"
        }}
        backgroundGradient="linear-gradient(135deg, var(--color-golden-ochre), var(--color-deep-amber), var(--color-sage-green))"
        floatingElements={floatingElements}
        imageContent={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😂</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Therapeutic Laughter<br />
              Joy & Healing
            </div>
          </div>
        }
      />
      
      <SpaceBetween size="l">

      <Container>
        <Header variant="h2" id="featured-comedy">Featured Comedy</Header>
        <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <Box fontSize="display-l" textAlign="center">🎭</Box>
              <Header variant="h3" textAlign="center">
                Daily Dose of Laughter
              </Header>
              <Box textAlign="center">
                "When your thyroid medication kicks in and you suddenly have the energy to reorganize your entire life at 2 AM"
              </Box>
              <Box textAlign="center">
                <Button variant="primary" size="large" iconName="play">
                  Watch Now (3:45)
                </Button>
              </Box>
            </SpaceBetween>
          </Box>
          
          <SpaceBetween size="s">
            <Box padding="l" className="kadir-nelson-gradient-sage">
              <SpaceBetween size="s">
                <Header variant="h4">Quick Relief</Header>
                <Box>Need a quick laugh? Try our 30-second mood boosters!</Box>
                <Button size="small" iconName="play">30s Boost</Button>
              </SpaceBetween>
            </Box>
            
            <Box padding="l" className="kadir-nelson-secondary">
              <SpaceBetween size="s">
                <Header variant="h4">Community Favorites</Header>
                <Box>See what's making everyone laugh this week</Box>
                <Button size="small" iconName="star">Top Rated</Button>
              </SpaceBetween>
            </Box>
            
            <Box padding="l" className="kadir-nelson-accent">
              <SpaceBetween size="s">
                <Header variant="h4">Share a Laugh</Header>
                <Box>Submit your own funny moments</Box>
                <Button size="small" iconName="add-plus">Submit</Button>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2">Comedy Collection</Header>
        <Cards
          cardDefinition={{
            header: item => (
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">{item.thumbnail}</Box>
                <Header variant="h3">{item.title}</Header>
              </SpaceBetween>
            ),
            sections: [
              {
                content: item => (
                  <SpaceBetween size="s">
                    <Box>{item.description}</Box>
                    <SpaceBetween direction="horizontal" size="s">
                      <Badge>{item.duration}</Badge>
                      <Badge color="blue">{item.views} views</Badge>
                      <Badge color="green">⭐ {item.rating}</Badge>
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="s">
                      <Button variant="primary" iconName="play">
                        Watch
                      </Button>
                      <Button variant="normal" iconName="heart">
                        Rate Relief
                      </Button>
                    </SpaceBetween>
                  </SpaceBetween>
                )
              }
            ]
          }}
          items={comedyClips}
          loadingText="Loading comedy clips..."
        />
      </Container>

      <Container>
        <Header variant="h2" id="mood-rating">How Are You Feeling?</Header>
        <Box padding="l" className="kadir-nelson-gradient-earth">
          <SpaceBetween size="s">
            <Box>After watching comedy content, rate how it made you feel:</Box>
            <SpaceBetween direction="horizontal" size="s">
              <Button size="small">😢 1</Button>
              <Button size="small">😐 2</Button>
              <Button size="small">🙂 3</Button>
              <Button size="small">😊 4</Button>
              <Button size="small">😂 5</Button>
            </SpaceBetween>
            <Box fontSize="body-s">Your feedback helps us curate better content for therapeutic relief.</Box>
          </SpaceBetween>
        </Box>
      </Container>
      </SpaceBetween>
    </div>
  );
}