import React from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Icon
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';

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
        title="Find Your Circle of Sisters"
        subtitle="Connect with Black women who truly understand your Graves' Disease journey. Share experiences, find support, and build lasting friendships in our safe community spaces."
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
        imageContent={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👩🏾‍🤝‍👩🏿</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Sisterhood<br />
              Support & Understanding
            </div>
          </div>
        }
      />
      
      <SpaceBetween size="l">

      <Container>
        <Header variant="h2" id="available-circles">Available Circles</Header>
        <Cards
          cardDefinition={{
            header: item => (
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Icon name="user-profile" size="medium" />
                <Header variant="h3">{item.name}</Header>
                {item.isJoined && <Badge color="green">Joined</Badge>}
              </SpaceBetween>
            ),
            sections: [
              {
                content: item => (
                  <SpaceBetween size="s">
                    <Box>{item.description}</Box>
                    <SpaceBetween direction="horizontal" size="s">
                      <Badge>{item.memberCount} members</Badge>
                      <Badge color="blue">Active {item.recentActivity}</Badge>
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="s">
                      <Button 
                        variant={item.isJoined ? "normal" : "primary"}
                        iconName={item.isJoined ? "external" : "add-plus"}
                      >
                        {item.isJoined ? "View Circle" : "Join Circle"}
                      </Button>
                      {item.isJoined && (
                        <Button variant="normal" iconName="edit">
                          Post Update
                        </Button>
                      )}
                    </SpaceBetween>
                  </SpaceBetween>
                )
              }
            ]
          }}
          items={sampleCircles}
          loadingText="Loading circles..."
        />
      </Container>

      <Container>
        <Header variant="h2">Recent Activity</Header>
        <Box padding="s">
          <SpaceBetween size="s">
            <Box>
              <strong>Sarah J.</strong> posted in <em>Managing Anxiety Together</em>: "Just tried the breathing technique we discussed - it really works! 💙"
            </Box>
            <Box>
              <strong>Maya K.</strong> joined <em>Newly Diagnosed Support</em> and introduced herself
            </Box>
            <Box>
              <strong>Keisha R.</strong> shared a resource in <em>Thyroid Warriors</em>: "Great article about nutrition and thyroid health"
            </Box>
          </SpaceBetween>
        </Box>
      </Container>
      </SpaceBetween>
    </div>
  );
}