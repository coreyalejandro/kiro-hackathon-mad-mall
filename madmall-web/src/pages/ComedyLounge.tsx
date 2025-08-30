import React, { useState } from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Grid,
  Icon,
  Input,
  Alert
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import LoadingCard from '../components/LoadingCard';
import ToastNotification from '../components/ToastNotification';
import { useFeaturedComedy, useComedyContent, useContentInteraction } from '../hooks/useApiData';
import { formatTimeAgo } from '../utils/timeUtils';

export default function ComedyLounge() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });
  
  const { data: featuredComedy, loading: featuredLoading, error: featuredError } = useFeaturedComedy(3);
  const { data: comedyContent, loading: contentLoading, error: contentError } = useComedyContent(selectedCategory || null, 20);
  const { likeContent, watchContent, shareContent, interacting } = useContentInteraction();

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleWatch = async (contentId: string, title: string) => {
    try {
      await watchContent(contentId, 'comedy');
      showToast(`Now watching: ${title} 🎬`, 'success');
    } catch (error) {
      showToast('Unable to play content right now', 'error');
    }
  };

  const handleLike = async (contentId: string) => {
    try {
      await likeContent(contentId, 'comedy');
      showToast('Added to your favorites! ❤️', 'success');
    } catch (error) {
      showToast('Unable to like content right now', 'error');
    }
  };

  const handleShare = async (contentId: string) => {
    try {
      await shareContent(contentId, 'comedy');
      showToast('Shared with your circles! 🔗', 'success');
    } catch (error) {
      showToast('Unable to share right now', 'error');
    }
  };

  const filteredContent = comedyContent?.filter(item => 
    !searchQuery || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
        <ToastNotification
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
        />

        <Container>
          <Header variant="h2">Search Comedy</Header>
          <SpaceBetween size="m">
            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 3 }, { colspan: 3 }]}>
              <Input
                placeholder="Search for comedy clips, topics, or themes..."
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
                <option value="">All Categories</option>
                <option value="Thyroid Life">Thyroid Life</option>
                <option value="Self-Care Struggles">Self-Care Struggles</option>
                <option value="Community Moments">Community Moments</option>
                <option value="Medical Adventures">Medical Adventures</option>
              </select>
              <Box textAlign="right">
                <Badge color="blue">{filteredContent.length} videos</Badge>
              </Box>
            </Grid>
          </SpaceBetween>
        </Container>

        <Container>
          <Header variant="h2">Featured Comedy</Header>
          {featuredError && (
            <Alert type="error">
              Failed to load featured comedy. Please try again later.
            </Alert>
          )}
          {featuredLoading ? (
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
              <LoadingCard height="280px" />
              <LoadingCard height="280px" />
              <LoadingCard height="280px" />
            </Grid>
          ) : featuredComedy && featuredComedy.length > 0 ? (
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
              {featuredComedy.slice(0, 3).map((comedy, index) => {
                const gradientClasses = ['kadir-nelson-gradient-warm', 'kadir-nelson-gradient-sage', 'kadir-nelson-gradient-earth'];
                const icons = ['🎭', '👩‍⚕️', '💊'];
                
                return (
                  <Box key={comedy.id} padding="l" className={gradientClasses[index]}>
                    <SpaceBetween size="m">
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Box fontSize="heading-l">{icons[index]}</Box>
                        <Header variant="h3">{comedy.title}</Header>
                      </SpaceBetween>
                      <Box>{comedy.description}</Box>
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Badge color="grey">{comedy.duration}</Badge>
                        <Badge color="blue">{comedy.views} views</Badge>
                        <Badge color="green">⭐ {comedy.reliefRating}</Badge>
                      </SpaceBetween>
                      <Box fontSize="body-s" color="text-body-secondary">
                        {formatTimeAgo(comedy.timestamp)}
                      </Box>
                      <SpaceBetween direction="horizontal" size="s">
                        <Button 
                          variant="primary"
                          iconName="play"
                          loading={interacting}
                          onClick={() => handleWatch(comedy.id, comedy.title)}
                        >
                          Watch
                        </Button>
                        <Button 
                          variant="normal"
                          iconName="heart"
                          loading={interacting}
                          onClick={() => handleLike(comedy.id)}
                        >
                          Like
                        </Button>
                        <Button 
                          variant="normal"
                          iconName="share"
                          loading={interacting}
                          onClick={() => handleShare(comedy.id)}
                        >
                          Share
                        </Button>
                      </SpaceBetween>
                    </SpaceBetween>
                  </Box>
                );
              })}
            </Grid>
          ) : (
            <Box padding="l" textAlign="center">
              <SpaceBetween size="m">
                <Box fontSize="heading-xl">🎭</Box>
                <Header variant="h3">No featured comedy available</Header>
                <Box>Check back later for new content!</Box>
              </SpaceBetween>
            </Box>
          )}
        </Container>

        <Container>
          <SpaceBetween size="m">
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Header variant="h2" id="featured-comedy">Comedy Collection</Header>
              {selectedCategory && (
                <Badge color="blue">
                  {selectedCategory}
                </Badge>
              )}
              {searchQuery && (
                <Badge color="green">
                  "{searchQuery}"
                </Badge>
              )}
            </SpaceBetween>
            
            {contentError && (
              <Alert type="error">
                Failed to load comedy content. Please try again later.
              </Alert>
            )}
            
            {contentLoading ? (
              <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <LoadingCard key={i} height="250px" />
                ))}
              </Grid>
            ) : filteredContent.length === 0 ? (
              <Box textAlign="center" padding="xl">
                <SpaceBetween size="m">
                  <Box fontSize="heading-xl">😔</Box>
                  <Header variant="h3">No comedy found</Header>
                  <Box>
                    {searchQuery || selectedCategory 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No comedy content available at the moment.'}
                  </Box>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </SpaceBetween>
              </Box>
            ) : (
              <Cards
                cardDefinition={{
                  header: item => (
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Box fontSize="heading-m">
                        {item.category === 'Thyroid Life' ? '💊' :
                         item.category === 'Self-Care Struggles' ? '🧘‍♀️' :
                         item.category === 'Community Moments' ? '👨‍👩‍👧‍👦' :
                         item.category === 'Medical Adventures' ? '🩺' : '😂'}
                      </Box>
                      <Header variant="h3">{item.title}</Header>
                    </SpaceBetween>
                  ),
                  sections: [
                    {
                      content: item => (
                        <SpaceBetween size="s">
                          <Box>{item.description}</Box>
                          <SpaceBetween direction="horizontal" size="s" alignItems="center">
                            <Badge color="grey">{item.duration}</Badge>
                            <Badge color="grey">⭐ {item.reliefRating}</Badge>
                            <Badge color="grey">👀 {item.views}</Badge>
                            <Badge color="blue">{item.category}</Badge>
                          </SpaceBetween>
                          <SpaceBetween direction="horizontal" size="s">
                            <Button 
                              variant="primary"
                              iconName="play"
                              loading={interacting}
                              onClick={() => handleWatch(item.id, item.title)}
                            >
                              Watch Now
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
                              onClick={() => handleShare(item.id)}
                            >
                              Share 🔗
                            </Button>
                          </SpaceBetween>
                        </SpaceBetween>
                      )
                    }
                  ]
                }}
                items={filteredContent}
                cardsPerRow={[
                  { cards: 1 },
                  { minWidth: 500, cards: 2 },
                  { minWidth: 800, cards: 3 }
                ]}
              />
            )}
          </SpaceBetween>
        </Container>

        <Container>
          <Header variant="h2" id="mood-rating">How Are You Feeling?</Header>
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="s">
              <Box>After watching comedy content, rate how it made you feel:</Box>
              <SpaceBetween direction="horizontal" size="s">
                <Button variant="normal" onClick={() => showToast('Thanks for rating! 😢', 'info')}>😢 1</Button>
                <Button variant="normal" onClick={() => showToast('Thanks for rating! 😐', 'info')}>😐 2</Button>
                <Button variant="normal" onClick={() => showToast('Thanks for rating! 🙂', 'info')}>🙂 3</Button>
                <Button variant="normal" onClick={() => showToast('Thanks for rating! 😊', 'success')}>😊 4</Button>
                <Button variant="primary" onClick={() => showToast('Thanks for rating! 😂', 'success')}>😂 5</Button>
              </SpaceBetween>
              <Box fontSize="body-s">Your feedback helps us curate better content for therapeutic relief.</Box>
            </SpaceBetween>
          </Box>
        </Container>
      </SpaceBetween>
    </div>
  );
}