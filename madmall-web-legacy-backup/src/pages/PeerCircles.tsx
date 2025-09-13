import React from 'react';
import {
  Container,
  Header,
  Grid,
  Button,
  SpaceBetween,
  Badge,
  Box
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import FeaturedCircles from '../components/FeaturedCircles';

const sampleCircles = [
  {
    id: '1',
    name: 'Newly Diagnosed Support',
    description: 'A safe space for those recently diagnosed with Graves Disease to ask questions and find support.',
    memberCount: 45,
    recentActivity: '2 hours ago',
    isJoined: false
  },
  {
    id: '2',
    name: 'Managing Anxiety Together',
    description: 'Share coping strategies and support each other through anxiety and stress management.',
    memberCount: 67,
    recentActivity: '30 minutes ago',
    isJoined: true
  },
  {
    id: '3',
    name: 'Thyroid Warriors',
    description: 'For the strong women who have been fighting this battle and want to share their wisdom.',
    memberCount: 89,
    recentActivity: '1 hour ago',
    isJoined: false
  },
  {
    id: '4',
    name: 'Self-Care Sunday',
    description: 'Weekly discussions about self-care practices, wellness routines, and treating ourselves with love.',
    memberCount: 34,
    recentActivity: '4 hours ago',
    isJoined: true
  }
];

export default function PeerCircles() {
  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>💕</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>🤗</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>👭</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="peerCircles"
        title="Find Your Circle of Sisters"
        subtitle="Connect with Black women who truly understand your Graves' Disease journey. Share experiences, find support, and build lasting friendships in our safe community spaces."
        variant="contained"
        primaryCTA={{
          text: "Join a Circle",
          onClick: () => document.getElementById('available-circles')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "👥"
        }}
        secondaryCTA={{
          text: "Create New Circle",
          onClick: () => console.log('Create circle'),
          icon: "➕"
        }}
        backgroundGradient="linear-gradient(135deg, var(--color-sage-green), var(--color-dusty-rose), var(--color-burnt-sienna))"
        floatingElements={floatingElements}
        bentoBoxes={[
          {
            title: "67 Members Active",
            content: "Join 'Managing Anxiety Together' - most active circle",
            icon: "🧘‍♀️",
            action: () => console.log('Join anxiety circle'),
            size: 'medium'
          },
          {
            title: "New Discussion",
            content: "Sarah J. shared breathing techniques that work",
            icon: "💬",
            action: () => console.log('View discussion'),
            size: 'medium'
          }
        ]}
      />
      
      <SpaceBetween size="l">

      <FeaturedCircles />

      <Container>
        <Header variant="h2" id="available-circles">Available Circles</Header>
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* Newly Diagnosed Support */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-xl">👥</Box>
                <Header variant="h3">Newly Diagnosed Support</Header>
              </SpaceBetween>
              <Box>
                A safe space for those recently diagnosed with Graves Disease to ask questions and find support.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">45 members</Badge>
                <Badge color="grey">Active 2 hours ago</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                onClick={() => console.log('Join Newly Diagnosed Support')}
              >
                Join Circle
              </Button>
            </SpaceBetween>
          </Box>

          {/* Managing Anxiety Together */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-xl">🧘‍♀️</Box>
                <Header variant="h3">Managing Anxiety Together</Header>
                <Badge color="green">Joined</Badge>
              </SpaceBetween>
              <Box>
                Share coping strategies and support each other through anxiety and stress management.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">67 members</Badge>
                <Badge color="grey">Active 30 minutes ago</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="normal"
                  onClick={() => console.log('View Managing Anxiety Together')}
                >
                  View Circle
                </Button>
                <Button 
                  variant="normal"
                  onClick={() => console.log('Post update')}
                >
                  Post Update
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>

        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* Thyroid Warriors */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-xl">💪</Box>
                <Header variant="h3">Thyroid Warriors</Header>
              </SpaceBetween>
              <Box>
                For the strong women who have been fighting this battle and want to share their wisdom.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">89 members</Badge>
                <Badge color="grey">Active 1 hour ago</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                onClick={() => console.log('Join Thyroid Warriors')}
              >
                Join Circle
              </Button>
            </SpaceBetween>
          </Box>

          {/* Self-Care Sunday */}
          <Box padding="l" className="kadir-nelson-accent">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-xl">🌸</Box>
                <Header variant="h3">Self-Care Sunday</Header>
                <Badge color="green">Joined</Badge>
              </SpaceBetween>
              <Box>
                Weekly discussions about self-care practices, wellness routines, and treating ourselves with love.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">34 members</Badge>
                <Badge color="grey">Active 4 hours ago</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="normal"
                  onClick={() => console.log('View Self-Care Sunday')}
                >
                  View Circle
                </Button>
                <Button 
                  variant="normal"
                  onClick={() => console.log('Post update')}
                >
                  Post Update
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2">Recent Activity</Header>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="s">
              <Header variant="h4">💬 New Discussion</Header>
              <Box><strong>Sarah J.</strong> posted in <em>Managing Anxiety Together</em>: "Just tried the breathing technique we discussed - it really works! 💙"</Box>
              <Button 
                variant="normal"
                onClick={() => console.log('View discussion')}
              >
                View Discussion
              </Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="s">
              <Header variant="h4">👋 New Member</Header>
              <Box><strong>Maya K.</strong> joined <em>Newly Diagnosed Support</em> and introduced herself</Box>
              <Button 
                variant="normal"
                onClick={() => console.log('Welcome member')}
              >
                Welcome Maya
              </Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="s">
              <Header variant="h4">📚 Resource Shared</Header>
              <Box><strong>Keisha R.</strong> shared a resource in <em>Thyroid Warriors</em>: "Great article about nutrition and thyroid health"</Box>
              <Button 
                variant="normal"
                onClick={() => console.log('View resource')}
              >
                View Resource
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>
      </SpaceBetween>
    </div>
  );
}