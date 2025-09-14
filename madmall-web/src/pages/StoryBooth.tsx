import { useState } from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Textarea,
  Grid,
  Input,
  Alert
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import LoadingCard from '../components/LoadingCard';
import ToastNotification from '../components/ToastNotification';
import { useFeaturedStories, useUserStories, useContentInteraction } from '../hooks/useApiData';
import { formatTimeAgo } from '../utils/timeUtils';

// Type definitions
interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  duration: string;
  likes: number;
  timestamp: string;
  themes?: string[];
}

type ToastType = 'info' | 'success' | 'error' | 'warning';

export default function StoryBooth() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({ 
    show: false, 
    message: '', 
    type: 'info' 
  });
  const [newStory, setNewStory] = useState('');
  
  const { data: featuredStories, loading: featuredLoading, error: featuredError } = useFeaturedStories(3);
  const { data: allStories, loading: storiesLoading, error: storiesError } = useUserStories(20);
  const { likeContent, shareContent, saveContent, interacting } = useContentInteraction();

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleLike = async (contentId: string) => {
    try {
      await likeContent(contentId, 'story');
      showToast('Story liked! ❤️', 'success');
    } catch (error) {
      showToast('Unable to like story right now', 'error');
    }
  };



  const handleSave = async (contentId: string) => {
    try {
      await saveContent(contentId, 'story');
      showToast('Story saved! 📚', 'success');
    } catch (error) {
      showToast('Unable to save story right now', 'error');
    }
  };

  const handlePublishStory = () => {
    if (newStory.trim()) {
      showToast('Story published! Thank you for sharing. 📖', 'success');
      setNewStory('');
    } else {
      showToast('Please write your story first', 'warning');
    }
  };

  const filteredStories = allStories?.filter((story: Story) => {
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      story.themes?.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  }) || [];

  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>🎤</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>📝</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>✨</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="storyBooth"
        title="Share Your Voice, Inspire Others"
        subtitle="Every story matters. Share your journey, wisdom, and experiences to help build our supportive community. Your voice has the power to heal and inspire."
        variant="contained"
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
        bentoBoxes={[
          {
            title: "23 Stories Today",
            content: "Community members sharing their journeys",
            icon: "📖",
            action: () => document.getElementById('community-stories')?.scrollIntoView({ behavior: 'smooth' }),
            size: 'medium'
          },
          {
            title: "Share Your Experience",
            content: "Write or record your story to inspire others",
            icon: "✍️",
            action: () => document.getElementById('share-story')?.scrollIntoView({ behavior: 'smooth' }),
            size: 'medium'
          }
        ]}
      />
      
      <SpaceBetween size="l">
        <ToastNotification
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
        />

        <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber">Search Stories</Header>
          <SpaceBetween size="m">
            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
              <Input
                placeholder="Search stories by title, author, or theme..."
                value={searchQuery}
                onChange={({ detail }) => setSearchQuery(detail.value)}
                type="search"
              />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Categories</option>
                <option value="diagnosis">Diagnosis Journey</option>
                <option value="self_care">Self Care</option>
                <option value="advocacy">Medical Advocacy</option>
                <option value="workplace">Workplace</option>
                <option value="family">Family & Relationships</option>
              </select>
            </Grid>
            <SpaceBetween direction="horizontal" size="s">
              <Badge color="blue">{filteredStories.length} stories found</Badge>
              {searchQuery && (
                <Badge color="green">Searching: "{searchQuery}"</Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge color="blue">Category: {selectedCategory}</Badge>
              )}
            </SpaceBetween>
          </SpaceBetween>
          </div>
        </Container>

        <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber">Featured Stories</Header>
          {featuredError && (
            <Alert type="error">
              Failed to load featured stories. Please try again later.
            </Alert>
          )}
          {featuredLoading ? (
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
              <LoadingCard height="250px" />
              <LoadingCard height="250px" />
              <LoadingCard height="250px" />
            </Grid>
          ) : (
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
              {featuredStories?.map((story: Story, index: number) => {
                const gradients = ['kadir-nelson-gradient-warm', 'kadir-nelson-gradient-sage', 'kadir-nelson-gradient-earth'];
                const icons = ['🎤', '📖', '✨'];
                
                return (
                  <Box key={story.id} padding="l" className={gradients[index % 3]}>
                    <SpaceBetween size="m">
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Box fontSize="heading-l">{icons[index % 3]}</Box>
                        <Header variant="h3">"{story.title}"</Header>
                      </SpaceBetween>
                      <Box>
                        {story.content.substring(0, 120)}...
                      </Box>
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Badge color="grey">{story.author}</Badge>
                        <Badge color="grey">{story.duration}</Badge>
                        <Badge color="grey">❤️ {story.likes}</Badge>
                        <Badge color="grey">{formatTimeAgo(story.timestamp)}</Badge>
                      </SpaceBetween>
                      <SpaceBetween direction="horizontal" size="s">
                        <Button 
                          variant="primary"
                          onClick={() => console.log('Read story:', story.id)}
                        >
                          Read Story
                        </Button>
                        <Button 
                          variant="normal"
                          loading={interacting}
                          onClick={() => handleLike(story.id)}
                        >
                          Like ❤️
                        </Button>
                        <Button 
                          variant="normal"
                          loading={interacting}
                          onClick={() => handleSave(story.id)}
                        >
                          Save 📚
                        </Button>
                      </SpaceBetween>
                    </SpaceBetween>
                  </Box>
                );
              })}
            </Grid>
          )}
          </div>
        </Container>

        <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber" id="community-stories">Story Collection ({filteredStories.length} stories)</Header>
          {storiesError && (
            <Alert type="error">
              Failed to load stories. Please try again later.
            </Alert>
          )}
          {storiesLoading ? (
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <LoadingCard key={i} height="200px" />
              ))}
            </Grid>
          ) : filteredStories.length === 0 ? (
            <Box textAlign="center" padding="xl">
              <SpaceBetween size="m">
                <Box fontSize="heading-xl">📖</Box>
                <Header variant="h3">No stories found</Header>
                <Box>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Be the first to share your story with the community!'}
                </Box>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </SpaceBetween>
            </Box>
          ) : (
            <Cards
              cardDefinition={{
                header: (item: Story) => (
                  <SpaceBetween direction="horizontal" size="s" alignItems="center">
                    <Box fontSize="heading-m">
                      {item.themes?.includes('diagnosis') ? '🎯' :
                       item.themes?.includes('self_care') ? '🌱' :
                       item.themes?.includes('advocacy') ? '👩‍⚕️' :
                       item.themes?.includes('workplace') ? '💼' :
                       item.themes?.includes('family') ? '🏠' : '💪'}
                    </Box>
                    <Header variant="h3">{item.title}</Header>
                  </SpaceBetween>
                ),
                sections: [
                  {
                    content: (item: Story) => (
                      <SpaceBetween size="s">
                        <Box>{item.content.substring(0, 150)}...</Box>
                        <SpaceBetween direction="horizontal" size="s" alignItems="center">
                          <Badge color="grey">{item.author}</Badge>
                          <Badge color="grey">{item.duration}</Badge>
                          <Badge color="grey">❤️ {item.likes}</Badge>
                          <Badge color="grey">{formatTimeAgo(item.timestamp)}</Badge>
                        </SpaceBetween>
                        <SpaceBetween direction="horizontal" size="s">
                          <Button 
                            variant="primary"
                            onClick={() => console.log('Read story:', item.id)}
                          >
                            Read Story
                          </Button>
                          <Button 
                            variant="normal"
                            loading={interacting}
                            onClick={() => handleLike(item.id)}
                          >
                            Like ❤️
                          </Button>
                          <Button 
                            variant="normal"
                            loading={interacting}
                            onClick={() => handleSave(item.id)}
                          >
                            Save 📚
                          </Button>
                        </SpaceBetween>
                      </SpaceBetween>
                    )
                  }
                ]
              }}
              items={filteredStories}
              cardsPerRow={[
                { cards: 1 },
                { minWidth: 500, cards: 2 },
                { minWidth: 800, cards: 3 }
              ]}
            />
          )}
          </div>
        </Container>

        <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber" id="share-story">Share Your Story</Header>
          <SpaceBetween size="m">
            <Box padding="l" className="kadir-nelson-secondary">
              <SpaceBetween size="s">
                <Header variant="h3">Need inspiration? Try these prompts:</Header>
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
                <Header variant="h3">✍️ Write Your Story</Header>
                <Textarea
                  placeholder="Share your journey, insights, or words of encouragement..."
                  rows={4}
                  value={newStory}
                  onChange={({ detail }) => setNewStory(detail.value)}
                />
                <SpaceBetween direction="horizontal" size="s">
                  <Button variant="primary" onClick={handlePublishStory}>
                    Publish Story
                  </Button>
                  <Button variant="normal" onClick={() => showToast('Draft saved! 💾', 'success')}>
                    Save Draft
                  </Button>
                </SpaceBetween>
              </SpaceBetween>
            </Box>

            <Box padding="l" className="kadir-nelson-gradient-warm">
              <SpaceBetween size="s">
                <Header variant="h3">🎤 Record Audio Story</Header>
                <Box>Share your experience through voice - sometimes speaking feels more natural than writing.</Box>
                <Button 
                  variant="primary" 
                  iconName="microphone" 
                  onClick={() => showToast('Recording feature coming soon! 🎤', 'info')}
                >
                  Start Recording
                </Button>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
          </div>
        </Container>
      </SpaceBetween>
    </div>
  );
}