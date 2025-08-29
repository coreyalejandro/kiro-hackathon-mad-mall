import React from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Input,
  Icon,
  Grid
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';


const resources = [
  {
    id: '1',
    title: 'Understanding Graves Disease: A Beginner\'s Guide',
    description: 'Comprehensive overview of symptoms, causes, and treatment options written specifically for Black women.',
    category: 'Education',
    readTime: '8 min read',
    saved: false,
    helpful: 89,
    author: 'Dr. Keisha Williams, MD'
  },
  {
    id: '2',
    title: 'Managing Anxiety with Graves Disease',
    description: 'Practical strategies for dealing with anxiety symptoms and finding calm during flare-ups.',
    category: 'Mental Health',
    readTime: '5 min read',
    saved: true,
    helpful: 156,
    author: 'Licensed Therapist Maya Johnson'
  },
  {
    id: '3',
    title: 'Nutrition Guide for Thyroid Health',
    description: 'Foods that support thyroid function and recipes that are both delicious and healing.',
    category: 'Nutrition',
    readTime: '12 min read',
    saved: false,
    helpful: 203,
    author: 'Nutritionist Sarah Davis, RD'
  },
  {
    id: '4',
    title: 'Building Your Support Network',
    description: 'How to communicate with family and friends about your condition and build understanding.',
    category: 'Relationships',
    readTime: '6 min read',
    saved: true,
    helpful: 134,
    author: 'Community Health Advocate'
  }
];

export default function ResourceHub() {
  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>📚</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>💡</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>✨</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="Resource Hub"
        title="Your Wellness Knowledge Hub"
        subtitle="Access curated health information, evidence-based wellness tips, and educational content from trusted sources. Knowledge is power on your healing journey."
        primaryCTA={{
          text: "Explore Resources",
          onClick: () => document.getElementById('featured-resources')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "📖"
        }}
        secondaryCTA={{
          text: "My Saved Resources",
          onClick: () => console.log('Show saved resources'),
          icon: "🔖"
        }}
        backgroundGradient="linear-gradient(135deg, var(--color-sage-green), var(--color-deep-olive), var(--color-golden-ochre))"
        floatingElements={floatingElements}
        imageContent={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Knowledge & Wisdom<br />
              Evidence-Based Healing
            </div>
          </div>
        }
      />
      
      <SpaceBetween size="l">

      <Container>
        <Header variant="h2">Search Resources</Header>
        <Box padding="l" className="kadir-nelson-secondary">
          <SpaceBetween size="s">
            <Input
              placeholder="Search for articles, guides, tips..."
              type="search"
              value=""
              onChange={() => console.log('Search')}
            />
            <SpaceBetween direction="horizontal" size="s">
              <Button variant="normal" iconName="filter">📚 Education</Button>
              <Button variant="normal" iconName="filter">🧠 Mental Health</Button>
              <Button variant="normal" iconName="filter">🥗 Nutrition</Button>
              <Button variant="normal" iconName="filter">💕 Relationships</Button>
              <Button variant="normal" iconName="filter">💊 Treatment</Button>
            </SpaceBetween>
          </SpaceBetween>
        </Box>
      </Container>



      <Container>
        <Header variant="h2" id="featured-resources">Featured Resources</Header>
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* Understanding Graves Disease */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">📚</Box>
                <Header variant="h4">Understanding Graves Disease: A Beginner's Guide</Header>
              </SpaceBetween>
              <Box>
                Comprehensive overview of symptoms, causes, and treatment options written specifically for Black women.
              </Box>
              <Box fontSize="body-s">
                By Dr. Keisha Williams, MD
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Education</Badge>
                <Badge color="grey">8 min read</Badge>
                <Badge color="green">👍 89 found helpful</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="external"
                  onClick={() => console.log('Read Understanding Graves Disease')}
                >
                  Read Article
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Save article')}
                >
                  Save
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* Managing Anxiety */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🧠</Box>
                <Header variant="h4">Managing Anxiety with Graves Disease</Header>
                <Badge color="green">Saved</Badge>
              </SpaceBetween>
              <Box>
                Practical strategies for dealing with anxiety symptoms and finding calm during flare-ups.
              </Box>
              <Box fontSize="body-s">
                By Licensed Therapist Maya Johnson
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Mental Health</Badge>
                <Badge color="grey">5 min read</Badge>
                <Badge color="green">👍 156 found helpful</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="external"
                  onClick={() => console.log('Read Managing Anxiety')}
                >
                  Read Article
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Save article')}
                >
                  Saved
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>

        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* Nutrition Guide */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🥗</Box>
                <Header variant="h4">Nutrition Guide for Thyroid Health</Header>
              </SpaceBetween>
              <Box>
                Foods that support thyroid function and recipes that are both delicious and healing.
              </Box>
              <Box fontSize="body-s">
                By Nutritionist Sarah Davis, RD
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Nutrition</Badge>
                <Badge color="grey">12 min read</Badge>
                <Badge color="green">👍 203 found helpful</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="external"
                  onClick={() => console.log('Read Nutrition Guide')}
                >
                  Read Article
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Save article')}
                >
                  Save
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* Building Support Network */}
          <Box padding="l" className="kadir-nelson-accent">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">💕</Box>
                <Header variant="h4">Building Your Support Network</Header>
                <Badge color="green">Saved</Badge>
              </SpaceBetween>
              <Box>
                How to communicate with family and friends about your condition and build understanding.
              </Box>
              <Box fontSize="body-s">
                By Community Health Advocate
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Relationships</Badge>
                <Badge color="grey">6 min read</Badge>
                <Badge color="green">👍 134 found helpful</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="external"
                  onClick={() => console.log('Read Building Support Network')}
                >
                  Read Article
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Save article')}
                >
                  Saved
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2">Quick Access</Header>
        <SpaceBetween direction="horizontal" size="m">
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="s">
              <Header variant="h4">📋 Symptom Tracker</Header>
              <Box>Keep track of your symptoms and patterns</Box>
              <Button size="small">Open Tracker</Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="s">
              <Header variant="h4">💊 Medication Reminders</Header>
              <Box>Set up reminders for your medications</Box>
              <Button size="small">Set Reminders</Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-secondary">
            <SpaceBetween size="s">
              <Header variant="h4">🏥 Find Doctors</Header>
              <Box>Locate thyroid specialists in your area</Box>
              <Button size="small">Search Doctors</Button>
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Container>

      <Container>
        <Header variant="h2">Community Contributions</Header>
        <Box padding="l" className="kadir-nelson-gradient-earth">
          <SpaceBetween size="s">
            <Box>
              <strong>Maya K.</strong> shared: "This meditation technique from the anxiety guide really works! Try the 4-7-8 breathing method."
            </Box>
            <Box>
              <strong>Keisha R.</strong> recommended: "The nutrition guide helped me identify trigger foods. Feeling so much better!"
            </Box>
            <Box>
              <strong>Sarah J.</strong> added: "The support network article gave me the words to explain my condition to my family. Thank you!"
            </Box>
          </SpaceBetween>
        </Box>
      </Container>
      </SpaceBetween>
    </div>
  );
}