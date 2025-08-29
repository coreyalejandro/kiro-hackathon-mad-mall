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
  Icon,
  Grid
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';


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

      <Container>
        <Header variant="h2">Featured Stories</Header>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {/* My Diagnosis Journey */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🎤</Box>
                <Header variant="h4">My Diagnosis Journey</Header>
              </SpaceBetween>
              <Box>
                The day I got my diagnosis, I felt like my world turned upside down. But finding this community changed everything...
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">4:32</Badge>
                <Badge color="blue">Audio Story</Badge>
                <Badge color="green">❤️ 23 likes</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => console.log('Listen to My Diagnosis Journey')}
                >
                  Listen
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Like story')}
                >
                  Like
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* Finding Strength in Sisterhood */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">📝</Box>
                <Header variant="h4">Finding Strength in Sisterhood</Header>
              </SpaceBetween>
              <Box>
                I never thought I would find people who truly understood what I was going through until I joined my first peer circle...
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">3 min read</Badge>
                <Badge color="blue">Text Story</Badge>
                <Badge color="green">❤️ 45 likes</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="external"
                  onClick={() => console.log('Read Finding Strength in Sisterhood')}
                >
                  Read
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Like story')}
                >
                  Like
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* Laughing Through the Hard Days */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">😂</Box>
                <Header variant="h4">Laughing Through the Hard Days</Header>
              </SpaceBetween>
              <Box>
                Sometimes you have to laugh to keep from crying. Here's how humor became my secret weapon against Graves...
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">2:15</Badge>
                <Badge color="blue">Audio Story</Badge>
                <Badge color="green">❤️ 67 likes</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => console.log('Listen to Laughing Through the Hard Days')}
                >
                  Listen
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Like story')}
                >
                  Like
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2" id="community-stories">Community Stories</Header>
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* My Diagnosis Journey */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🎤</Box>
                <Header variant="h4">My Diagnosis Journey</Header>
                <Badge color="blue">Audio</Badge>
              </SpaceBetween>
              <Box>
                "The day I got my diagnosis, I felt like my world turned upside down. But finding this community changed everything..."
              </Box>
              <Box fontSize="body-s">
                By Maya K.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">4:32</Badge>
                <Badge color="green">❤️ 23 likes</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => console.log('Listen to My Diagnosis Journey')}
                >
                  Listen
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Like story')}
                >
                  Like
                </Button>
                <Button 
                  variant="normal"
                  iconName="share"
                  onClick={() => console.log('Share story')}
                >
                  Share
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* Finding Strength in Sisterhood */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">📝</Box>
                <Header variant="h4">Finding Strength in Sisterhood</Header>
                <Badge color="green">Text</Badge>
              </SpaceBetween>
              <Box>
                "I never thought I would find people who truly understood what I was going through until I joined my first peer circle..."
              </Box>
              <Box fontSize="body-s">
                By Keisha R.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">3 min read</Badge>
                <Badge color="green">❤️ 45 likes</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="external"
                  onClick={() => console.log('Read Finding Strength in Sisterhood')}
                >
                  Read
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Like story')}
                >
                  Like
                </Button>
                <Button 
                  variant="normal"
                  iconName="share"
                  onClick={() => console.log('Share story')}
                >
                  Share
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>

        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* Laughing Through the Hard Days */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">😂</Box>
                <Header variant="h4">Laughing Through the Hard Days</Header>
                <Badge color="blue">Audio</Badge>
              </SpaceBetween>
              <Box>
                "Sometimes you have to laugh to keep from crying. Here's how humor became my secret weapon against Graves..."
              </Box>
              <Box fontSize="body-s">
                By Sarah J.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">2:15</Badge>
                <Badge color="green">❤️ 67 likes</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => console.log('Listen to Laughing Through the Hard Days')}
                >
                  Listen
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Like story')}
                >
                  Like
                </Button>
                <Button 
                  variant="normal"
                  iconName="share"
                  onClick={() => console.log('Share story')}
                >
                  Share
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          {/* My Self-Care Revolution */}
          <Box padding="l" className="kadir-nelson-secondary">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">💪</Box>
                <Header variant="h4">My Self-Care Revolution</Header>
                <Badge color="green">Text</Badge>
              </SpaceBetween>
              <Box>
                "Learning to put myself first wasn't selfish - it was survival. Here's how I built a self-care routine that actually works..."
              </Box>
              <Box fontSize="body-s">
                By Tasha M.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="grey">5 min read</Badge>
                <Badge color="green">❤️ 34 likes</Badge>
              </SpaceBetween>
              <SpaceBetween direction="horizontal" size="s">
                <Button 
                  variant="primary"
                  iconName="external"
                  onClick={() => console.log('Read My Self-Care Revolution')}
                >
                  Read
                </Button>
                <Button 
                  variant="normal"
                  iconName="heart"
                  onClick={() => console.log('Like story')}
                >
                  Like
                </Button>
                <Button 
                  variant="normal"
                  iconName="share"
                  onClick={() => console.log('Share story')}
                >
                  Share
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2" id="share-story">Share Your Story</Header>
        <SpaceBetween size="m">
          <Box padding="l" className="kadir-nelson-secondary">
            <SpaceBetween size="s">
              <Header variant="h4">Need inspiration? Try these prompts:</Header>
              <Box>You can record or write your story using one of these prompts:</Box>
              <SpaceBetween size="xs">
                <Box>• What would you tell someone newly diagnosed?</Box>
                <Box>• Describe a moment when you felt truly supported</Box>
                <Box>• Share a coping strategy that works for you</Box>
                <Box>• What has Graves Disease taught you about yourself?</Box>
                <Box>• Describe your ideal support system</Box>
              </SpaceBetween>
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
                <Button variant="primary" onClick={() => console.log('Publish story')}>Publish Story</Button>
                <Button variant="normal" onClick={() => console.log('Save draft')}>Save Draft</Button>
              </SpaceBetween>
            </SpaceBetween>
          </Box>

          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="s">
              <Header variant="h4">🎤 Record Audio Story</Header>
              <Box>Share your experience through voice - sometimes speaking feels more natural than writing.</Box>
              <Button variant="primary" iconName="microphone" onClick={() => console.log('Start recording')}>Start Recording</Button>
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Container>


      </SpaceBetween>
    </div>
  );
}