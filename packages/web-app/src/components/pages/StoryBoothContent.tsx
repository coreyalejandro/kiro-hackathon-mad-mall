'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout, Header, SpaceBetween, Button, Grid, Box, Badge, Cards } from '@cloudscape-design/components';
import { syntheticContentService } from '@/lib/synthetic-content-service';

export function StoryBoothContent() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const storiesData = await syntheticContentService.getWellnessStories(6);
        setStories(storiesData);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  const handleReadStory = (storyId: string, storyTitle: string) => {
    console.log(`Reading story: ${storyTitle} (${storyId})`);
    // TODO: Implement actual story reading functionality
  };

  if (loading) {
    return (
      <ContentLayout 
        header={
          <Header variant="h1" description="Share and discover inspiring personal stories">
            Story Booth
          </Header>
        }
      >
        <Container>
          <Box textAlign="center" padding="xl">
            Loading stories...
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout 
      header={
        <Header
          variant="h1"
          description="Share and discover inspiring personal stories"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="normal" iconName="document">Read Stories</Button>
              <Button variant="primary" iconName="edit">Share Your Story</Button>
            </SpaceBetween>
          }
        >
          Story Booth
        </Header>
      }
    >
      <Container>
        <Box variant="h2" margin={{ bottom: 'm' }}>
          Community Stories
        </Box>
        
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {stories.map((story) => (
            <Box
              key={story.id}
              variant="div"
              padding="m"
            >
              <SpaceBetween size="m">
                <Box textAlign="center">
                  <Box
                    variant="div"
                    padding="l"
                    textAlign="center"
                    color="text-status-info"
                    fontSize="display-l"
                  >
                    📖
                  </Box>
                </Box>

                <SpaceBetween size="s">
                  <Box variant="h3" fontSize="heading-s" fontWeight="bold" margin={{ bottom: "xs" }}>
                    {story.title}
                  </Box>
                  
                  <Box fontSize="body-s" color="text-body-secondary" margin={{ bottom: "s" }}>
                    by {story.author.name}
                  </Box>
                  
                  <Box fontSize="body-s" color="text-body-secondary" margin={{ bottom: "s" }}>
                    {story.content.substring(0, 150)}...
                  </Box>
                  
                  <SpaceBetween direction="horizontal" size="s" alignItems="center">
                    {story.tags.slice(0, 2).map((tag: string) => (
                      <Badge key={tag} color="blue">{tag}</Badge>
                    ))}
                  </SpaceBetween>
                  
                  <Box color="text-status-info" margin={{ bottom: "s" }}>
                    ❤️ {story.engagement?.likes || 0} • 💬 {story.engagement?.comments || 0} • 👀 {story.engagement?.views || 0}
                  </Box>
                </SpaceBetween>

                <Button 
                  variant="primary"
                  onClick={() => handleReadStory(story.id, story.title)}
                >
                  Read Story
                </Button>
              </SpaceBetween>
            </Box>
          ))}
        </Grid>
      </Container>
    </ContentLayout>
  );
}
