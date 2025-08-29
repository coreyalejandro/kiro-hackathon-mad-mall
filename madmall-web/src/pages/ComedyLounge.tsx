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
        pageName="Comedy Lounge"
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
        <Header variant="h2">Featured Comedy</Header>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {/* Graves Giggles: Thyroid Humor */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🎭</Box>
                <Header variant="h4">Graves Giggles: Thyroid Humor</Header>
              </SpaceBetween>
              <Box>
                When your thyroid has more mood swings than a teenager 😂
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">3:45</Badge>
                <Badge color="blue">234 views</Badge>
                <Badge color="green">⭐ 4.8</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => console.log('Watch Graves Giggles')}
                >
                  Watch
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Rate relief')}
                >
                  Rate Relief
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* Doctor Visit Chronicles */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">👩‍⚕️</Box>
                <Header variant="h4">Doctor Visit Chronicles</Header>
              </SpaceBetween>
              <Box>
                That moment when you Google your symptoms and WebMD says you have 47 different diseases
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">2:30</Badge>
                <Badge color="blue">189 views</Badge>
                <Badge color="green">⭐ 4.9</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => console.log('Watch Doctor Visit Chronicles')}
                >
                  Watch
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Rate relief')}
                >
                  Rate Relief
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* Medication Reminders */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">💊</Box>
                <Header variant="h4">Medication Reminders</Header>
              </SpaceBetween>
              <Box>
                Setting 15 alarms to remember your pills and still forgetting anyway
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">4:12</Badge>
                <Badge color="blue">156 views</Badge>
                <Badge color="green">⭐ 4.7</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => console.log('Watch Medication Reminders')}
                >
                  Watch
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Rate relief')}
                >
                  Rate Relief
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2" id="featured-comedy">Comedy Collection</Header>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {/* Energy Boost Comedy */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">⚡</Box>
                <Header variant="h4">Energy Boost Comedy</Header>
              </SpaceBetween>
              <Box>
                Quick laughs to give you that instant energy boost when you need it most
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">2:15</Badge>
                <Badge color="blue">312 views</Badge>
                <Badge color="green">⭐ 4.6</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="play"
                onClick={() => console.log('Watch Energy Boost Comedy')}
              >
                Watch Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Wellness Wins & Fails */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🌱</Box>
                <Header variant="h4">Wellness Wins & Fails</Header>
              </SpaceBetween>
              <Box>
                Hilarious takes on our wellness journey - the good, the bad, and the ridiculous
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">5:30</Badge>
                <Badge color="blue">278 views</Badge>
                <Badge color="green">⭐ 4.8</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="play"
                onClick={() => console.log('Watch Wellness Wins & Fails')}
              >
                Watch Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Sleep Struggles */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">😴</Box>
                <Header variant="h4">Sleep Struggles</Header>
              </SpaceBetween>
              <Box>
                Comedy about those 3 AM moments when your mind decides it's party time
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">3:20</Badge>
                <Badge color="blue">195 views</Badge>
                <Badge color="green">⭐ 4.7</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="play"
                onClick={() => console.log('Watch Sleep Struggles')}
              >
                Watch Now
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {/* Food & Mood */}
          <Box padding="l" className="kadir-nelson-secondary">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🍽️</Box>
                <Header variant="h4">Food & Mood</Header>
              </SpaceBetween>
              <Box>
                Funny stories about how food affects our mood and energy levels
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">4:45</Badge>
                <Badge color="blue">267 views</Badge>
                <Badge color="green">⭐ 4.5</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="play"
                onClick={() => console.log('Watch Food & Mood')}
              >
                Watch Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Exercise Expectations */}
          <Box padding="l" className="kadir-nelson-accent">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🏃‍♀️</Box>
                <Header variant="h4">Exercise Expectations</Header>
              </SpaceBetween>
              <Box>
                Reality vs expectations when it comes to working out with chronic conditions
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">3:55</Badge>
                <Badge color="blue">143 views</Badge>
                <Badge color="green">⭐ 4.9</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="play"
                onClick={() => console.log('Watch Exercise Expectations')}
              >
                Watch Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Support System Stories */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🤗</Box>
                <Header variant="h4">Support System Stories</Header>
              </SpaceBetween>
              <Box>
                Heartwarming and funny moments with family and friends who just don't get it
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">6:10</Badge>
                <Badge color="blue">321 views</Badge>
                <Badge color="green">⭐ 4.8</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="play"
                onClick={() => console.log('Watch Support System Stories')}
              >
                Watch Now
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2" id="mood-rating">How Are You Feeling?</Header>
        <Box padding="l" className="kadir-nelson-gradient-earth">
          <SpaceBetween size="s">
            <Box>After watching comedy content, rate how it made you feel:</Box>
            <SpaceBetween direction="horizontal" size="s">
              <Button variant="normal" onClick={() => console.log('Rating: 1')}>😢 1</Button>
              <Button variant="normal" onClick={() => console.log('Rating: 2')}>😐 2</Button>
              <Button variant="normal" onClick={() => console.log('Rating: 3')}>🙂 3</Button>
              <Button variant="normal" onClick={() => console.log('Rating: 4')}>😊 4</Button>
              <Button variant="primary" onClick={() => console.log('Rating: 5')}>😂 5</Button>
            </SpaceBetween>
            <Box fontSize="body-s">Your feedback helps us curate better content for therapeutic relief.</Box>
          </SpaceBetween>
        </Box>
      </Container>
      </SpaceBetween>
    </div>
  );
}