import React from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Textarea,
  Icon
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import FeaturedBrands from '../components/FeaturedBrands';

const stories = [
  {
    id: '1',
    title: 'My Diagnosis Journey',
    author: 'Maya K.',
    type: 'audio',
    duration: '4:32',
    likes: 23,
    preview: 'The day I got my diagnosis, I felt like my world turned upside down. But finding this community changed everything...'
  },
  {
    id: '2',
    title: 'Finding Strength in Sisterhood',
    author: 'Keisha R.',
    type: 'text',
    duration: '3 min read',
    likes: 45,
    preview: 'I never thought I would find people who truly understood what I was going through until I joined my first peer circle...'
  },
  {
    id: '3',
    title: 'Laughing Through the Hard Days',
    author: 'Sarah J.',
    type: 'audio',
    duration: '2:15',
    likes: 67,
    preview: 'Sometimes you have to laugh to keep from crying. Here\'s how humor became my secret weapon against Graves...'
  },
  {
    id: '4',
    title: 'My Self-Care Revolution',
    author: 'Tasha M.',
    type: 'text',
    duration: '5 min read',
    likes: 34,
    preview: 'Learning to put myself first wasn\'t selfish - it was survival. Here\'s how I built a self-care routine that actually works...'
  }
];

export default function StoryBooth() {
  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>🎤</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>📝</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>✨</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="Story Booth"
        title="Share Your Voice, Inspire Others"
        subtitle="Every story matters. Share your journey, wisdom, and experiences to help build our supportive community. Your voice has the power to heal and inspire."
        primaryCTA={{
          text: "Record Story",
          onClick: () => document.getElementById('share-story')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "🎤"
        }}
        secondaryCTA={{
          text: "Read Stories",
          onClick: () => document.getElementById('community-stories')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "📖"
        }}
        backgroundGradient="linear-gradient(135deg, var(--color-dusty-rose), var(--color-golden-ochre), var(--color-sage-green))"
        floatingElements={floatingElements}
        imageContent={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗣️</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Your Story Matters<br />
              Inspire & Heal Together
            </div>
          </div>
        }
      />
      
      <SpaceBetween size="l">

      <FeaturedBrands />

      <Container>
        <Header variant="h2" id="share-story">Share Your Story</Header>
        <SpaceBetween size="m">
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="s">
              <Header variant="h4">🎤 Record Audio Story</Header>
              <Box>Share your experience through voice - sometimes speaking feels more natural than writing.</Box>
              <Button iconName="microphone">Start Recording</Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="s">
              <Header variant="h4">✍️ Write Your Story</Header>
              <Textarea
                placeholder="Share your journey, insights, or words of encouragement..."
                rows={4}
              />
              <SpaceBetween direction="horizontal" size="s">
                <Button variant="primary">Publish Story</Button>
                <Button variant="normal">Save Draft</Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Container>

      <Container>
        <Header variant="h2" id="community-stories">Community Stories</Header>
        <Cards
          cardDefinition={{
            header: item => (
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Icon name={item.type === 'audio' ? 'microphone' : 'edit'} size="medium" />
                <Header variant="h3">{item.title}</Header>
                <Badge color={item.type === 'audio' ? 'blue' : 'green'}>
                  {item.type === 'audio' ? '🎤 Audio' : '📝 Text'}
                </Badge>
              </SpaceBetween>
            ),
            sections: [
              {
                content: item => (
                  <SpaceBetween size="s">
                    <Box fontStyle="italic">"{item.preview}"</Box>
                    <Box fontSize="body-s" color="text-body-secondary">
                      By {item.author}
                    </Box>
                    <SpaceBetween direction="horizontal" size="s">
                      <Badge>{item.duration}</Badge>
                      <Badge color="red">❤️ {item.likes} likes</Badge>
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="s">
                      <Button variant="primary" iconName={item.type === 'audio' ? 'play' : 'external'}>
                        {item.type === 'audio' ? 'Listen' : 'Read'}
                      </Button>
                      <Button variant="normal" iconName="heart">
                        Like
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
          items={stories}
          loadingText="Loading stories..."
        />
      </Container>

      <Container>
        <Header variant="h2">Story Prompts</Header>
        <Box padding="l" className="kadir-nelson-secondary">
          <SpaceBetween size="s">
            <Header variant="h4">Need inspiration? Try these prompts:</Header>
            <SpaceBetween size="xs">
              <Box>• What would you tell someone newly diagnosed?</Box>
              <Box>• Describe a moment when you felt truly supported</Box>
              <Box>• Share a coping strategy that works for you</Box>
              <Box>• What has Graves Disease taught you about yourself?</Box>
              <Box>• Describe your ideal support system</Box>
            </SpaceBetween>
            <Button size="small" variant="primary">Use a Prompt</Button>
          </SpaceBetween>
        </Box>
      </Container>

      <Container>
        <Header variant="h2">Featured This Week</Header>
        <Box padding="l" className="kadir-nelson-gradient-earth">
          <SpaceBetween size="s">
            <Box>
              🌟 <strong>"Finding Strength in Sisterhood"</strong> by Keisha R. has been the most-liked story this week with 45 hearts!
            </Box>
            <Box>
              🎤 <strong>"Laughing Through the Hard Days"</strong> by Sarah J. is trending in the Comedy Lounge - her humor is infectious!
            </Box>
            <Box>
              💪 <strong>"My Self-Care Revolution"</strong> by Tasha M. has inspired 12 women to start their own self-care routines!
            </Box>
          </SpaceBetween>
        </Box>
      </Container>
      </SpaceBetween>
    </div>
  );
}