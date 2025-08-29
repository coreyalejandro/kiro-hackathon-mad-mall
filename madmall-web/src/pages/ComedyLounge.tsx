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
  Icon
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import SkeletonLoader from '../components/SkeletonLoader';
import ToastNotification from '../components/ToastNotification';
import SearchWithFilters from '../components/SearchWithFilters';
import { useFeaturedComedy, useComedyContent, useContentInteraction } from '../hooks/useApiData';
import { formatTimeAgo } from '../utils/timeUtils';

export default function ComedyLounge() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });
  
  const { data: featuredComedy, loading: featuredLoading } = useFeaturedComedy(3);
  const { data: comedyContent, loading: contentLoading } = useComedyContent(selectedCategory, 20);
  const { likeContent, watchContent, shareContent } = useContentInteraction();

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleWatch = async (contentId: string) => {
    try {
      await watchContent(contentId, 'comedy');
      showToast('Enjoy the laughs! 😂', 'success');
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

  const categories = ['Thyroid Life', 'Self-Care Struggles', 'Community Moments', 'Medical Adventures'];
  
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
        <SearchWithFilters
          placeholder="Search for comedy clips, topics, or themes..."
          categories={categories}
          onSearch={(query, category) => {
            setSearchQuery(query);
            setSelectedCategory(category || null);
          }}
          onClear={() => {
            setSearchQuery('');
            setSelectedCategory(null);
          }}
        />
      </Container>

      <Container>
        <Header variant="h2">Featured Comedy</Header>
        {featuredLoading ? (
          <SkeletonLoader type="card" count={3} />
        ) : (
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {featuredComedy?.slice(0, 3).map((comedy, index) => {
              const gradientClasses = ['kadir-nelson-gradient-warm', 'kadir-nelson-gradient-sage', 'kadir-nelson-gradient-earth'];
              const icons = ['🎭', '👩‍⚕️', '💊'];
              
              return (
                <Box key={comedy.id} padding="l" className={gradientClasses[index]}>
                  <SpaceBetween size="m">
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Box fontSize="heading-l">{icons[index]}</Box>
                      <Header variant="h4">{comedy.title}</Header>
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
                        onClick={() => handleWatch(comedy.id)}
                      >
                        Watch
                      </Button>
                      <Button 
                        variant="normal"
                        iconName="heart"
                        onClick={() => handleLike(comedy.id)}
                      >
                        Like
                      </Button>
                      <Button 
                        variant="normal"
                        iconName="share"
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
        )}
      </Container>

      <Container>
        <Header variant="h2" id="featured-comedy">
          Comedy Collection
          {selectedCategory && (
            <Badge color="blue" style={{ marginLeft: '8px' }}>
              {selectedCategory}
            </Badge>
          )}
          {searchQuery && (
            <Badge color="green" style={{ marginLeft: '8px' }}>
              "{searchQuery}"
            </Badge>
          )}
        </Header>
        
        {contentLoading ? (
          <SkeletonLoader type="card" count={6} />
        ) : filteredContent.length === 0 ? (
          <Box textAlign="center" padding="xl">
            <SpaceBetween size="m">
              <Box fontSize="heading-l">😔</Box>
              <Box>No comedy content found matching your search.</Box>
              <Button 
                variant="primary" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              >
                Show All Comedy
              </Button>
            </SpaceBetween>
          </Box>
        ) : (
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {filteredContent.map((comedy, index) => {
              const gradientClasses = [
                'kadir-nelson-gradient-warm', 'kadir-nelson-gradient-sage', 'kadir-nelson-gradient-earth',
                'kadir-nelson-secondary', 'kadir-nelson-accent', 'kadir-nelson-gradient-warm'
              ];
              const icons = ['⚡', '🌱', '😴', '🍽️', '🏃‍♀️', '🤗'];
              
              return (
                <Box key={comedy.id} padding="l" className={gradientClasses[index % gradientClasses.length]}>
                  <SpaceBetween size="m">
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Box fontSize="heading-l">{icons[index % icons.length]}</Box>
                      <Header variant="h4">{comedy.title}</Header>
                    </SpaceBetween>
                    <Box>{comedy.description}</Box>
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Badge color="grey">{comedy.duration}</Badge>
                      <Badge color="blue">{comedy.views} views</Badge>
                      <Badge color="green">⭐ {comedy.reliefRating}</Badge>
                    </SpaceBetween>
                    <Box fontSize="body-s" color="text-body-secondary">
                      {formatTimeAgo(comedy.timestamp)} • {comedy.category}
                    </Box>
                    <SpaceBetween direction="horizontal" size="s">
                      <Button 
                        variant="primary"
                        iconName="play"
                        onClick={() => handleWatch(comedy.id)}
                      >
                        Watch
                      </Button>
                      <Button 
                        variant="normal"
                        iconName="heart"
                        onClick={() => handleLike(comedy.id)}
                      >
                        Like
                      </Button>
                      <Button 
                        variant="normal"
                        iconName="share"
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
        )}
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