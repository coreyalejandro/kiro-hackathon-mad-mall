'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout, Header, SpaceBetween, Button, Grid, Box, Badge, Cards } from '@cloudscape-design/components';
import { syntheticContentService } from '@/lib/synthetic-content-service';

export function PeerCirclesContent() {
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCircles = async () => {
      try {
        const circlesData = await syntheticContentService.getPeerCircles(12);
        setCircles(circlesData);
      } catch (error) {
        console.error('Failed to load circles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCircles();
  }, []);

  const handleJoinCircle = (circleId: string, circleName: string) => {
    console.log(`Joining circle: ${circleName} (${circleId})`);
    // TODO: Implement actual join functionality
  };

  if (loading) {
    return (
      <ContentLayout 
        header={
          <Header variant="h1" description="Connect with supportive peer groups and communities">
            Peer Circles
          </Header>
        }
      >
        <Container>
          <Box textAlign="center" padding="xl">
            Loading peer circles...
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
          description="Connect with supportive peer groups and communities"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="normal" iconName="search">Browse</Button>
              <Button variant="primary" iconName="add-plus">Create Circle</Button>
            </SpaceBetween>
          }
        >
          Peer Circles
        </Header>
      }
    >
      <Container>
        <Box variant="h2" margin={{ bottom: 'm' }}>
          Available Peer Circles
        </Box>
        
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {circles.map((circle) => (
            <Box
              key={circle.id}
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
                    👥
                  </Box>
                </Box>

                <Box textAlign="center">
                  <Box variant="h3" fontSize="heading-s" fontWeight="bold" margin={{ bottom: "xs" }}>
                    {circle.name}
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    {circle.description}
                  </Box>
                </Box>

                <Box textAlign="center">
                  <SpaceBetween direction="horizontal" size="s" alignItems="center">
                    <Badge color="grey">
                      {circle.memberCount} members
                    </Badge>
                    <Badge color="grey">
                      Active {circle.recentActivity}
                    </Badge>
                  </SpaceBetween>
                  
                  <Box margin={{ top: "m" }}>
                    <Button 
                      variant="primary"
                      onClick={() => handleJoinCircle(circle.id, circle.name)}
                    >
                      Join Circle
                    </Button>
                  </Box>
                </Box>
              </SpaceBetween>
            </Box>
          ))}
        </Grid>
      </Container>
    </ContentLayout>
  );
}
