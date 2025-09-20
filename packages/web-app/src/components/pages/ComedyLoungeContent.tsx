'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout, Header, SpaceBetween, Button, Grid, Box, Badge } from '@cloudscape-design/components';
import { syntheticContentService } from '@/lib/synthetic-content-service';

export function ComedyLoungeContent() {
  const [comedyClips, setComedyClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComedyClips = async () => {
      try {
        const clipsData = await syntheticContentService.getComedyContent(8);
        setComedyClips(clipsData);
      } catch (error) {
        console.error('Failed to load comedy clips:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComedyClips();
  }, []);

  const handleWatchClip = (clipId: string, clipTitle: string) => {
    console.log(`Watching clip: ${clipTitle} (${clipId})`);
    // TODO: Implement actual video playback functionality
  };

  if (loading) {
    return (
      <ContentLayout 
        header={
          <Header variant="h1" description="Find joy and laughter in our comedy community space">
            Comedy Lounge
          </Header>
        }
      >
        <Container>
          <Box textAlign="center" padding="xl">
            Loading comedy clips...
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
          description="Find joy and laughter in our comedy community space"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="normal" iconName="share">Share a Laugh</Button>
              <Button variant="primary" iconName="play">Watch Comedy</Button>
            </SpaceBetween>
          }
        >
          Comedy Lounge
        </Header>
      }
    >
      <Container>
        <Box variant="h2" margin={{ bottom: 'm' }}>
          Therapeutic Humor
        </Box>
        
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {comedyClips.map((clip) => (
            <Box
              key={clip.id}
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
                    😂
                  </Box>
                </Box>

                <SpaceBetween size="s">
                  <Box variant="h3" fontSize="heading-s" fontWeight="bold" margin={{ bottom: "xs" }}>
                    {clip.title}
                  </Box>
                  
                  <Box fontSize="body-s" color="text-body-secondary" margin={{ bottom: "s" }}>
                    {clip.description}
                  </Box>
                  
                  <SpaceBetween direction="horizontal" size="s" alignItems="center">
                    <Badge color="blue">{clip.category}</Badge>
                    <Badge color="grey">{clip.duration}</Badge>
                  </SpaceBetween>
                  
                  <Box color="text-status-info" margin={{ bottom: "s" }}>
                    😄 {clip.engagement.likes} • 👀 {clip.engagement.views} • ⭐ {clip.rating}
                  </Box>
                </SpaceBetween>

                <Button 
                  variant="primary"
                  iconName="play"
                  onClick={() => handleWatchClip(clip.id, clip.title)}
                >
                  Watch Now
                </Button>
              </SpaceBetween>
            </Box>
          ))}
        </Grid>
      </Container>
    </ContentLayout>
  );
}
