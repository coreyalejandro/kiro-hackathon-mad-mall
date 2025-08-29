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
  Icon
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import FeaturedBrands from '../components/FeaturedBrands';

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

      <FeaturedBrands />

      <Container>
        <Header variant="h2">Search Resources</Header>
        <SpaceBetween size="s">
          <Input
            placeholder="Search for articles, guides, tips..."
            type="search"
          />
          <SpaceBetween direction="horizontal" size="s">
            <Button variant="normal" iconName="filter">Education</Button>
            <Button variant="normal" iconName="filter">Mental Health</Button>
            <Button variant="normal" iconName="filter">Nutrition</Button>
            <Button variant="normal" iconName="filter">Relationships</Button>
            <Button variant="normal" iconName="filter">Treatment</Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>

      <Container>
        <Header variant="h2" id="featured-resources">Featured Resources</Header>
        <Cards
          cardDefinition={{
            header: item => (
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Icon name="book" size="medium" />
                <Header variant="h3">{item.title}</Header>
                {item.saved && <Badge color="green">Saved</Badge>}
              </SpaceBetween>
            ),
            sections: [
              {
                content: item => (
                  <SpaceBetween size="s">
                    <Box>{item.description}</Box>
                    <Box fontSize="body-s" color="text-body-secondary">
                      By {item.author}
                    </Box>
                    <SpaceBetween direction="horizontal" size="s">
                      <Badge color="blue">{item.category}</Badge>
                      <Badge>{item.readTime}</Badge>
                      <Badge color="green">👍 {item.helpful} found helpful</Badge>
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="s">
                      <Button variant="primary" iconName="external">
                        Read Article
                      </Button>
                      <Button 
                        variant="normal" 
                        iconName={item.saved ? "bookmark-filled" : "bookmark"}
                      >
                        {item.saved ? "Saved" : "Save"}
                      </Button>
                      <Button variant="normal" iconName="share">
                        Share
                      </Button>
                    </SpaceBetween>
                  </SpaceBetween>
                )
              }
            ]
          }}
          items={resources}
          loadingText="Loading resources..."
        />
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