'use client';

import React from 'react';
import {
  Container,
  Header,
  Grid,
  Button,
  SpaceBetween,
  Badge,
  Box
} from '@cloudscape-design/components';
// import { Circle } from '@madmall/shared-types';
import CommunityImage from './CommunityImage';

// Temporary type definition
interface Circle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  imageUrl?: string;
}

interface FeaturedCircle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  recentActivity: string;
  featured: boolean;
  highlight: string;
  activeDiscussions: number;
  image: string;
}

interface FeaturedCirclesProps {
  circles?: FeaturedCircle[];
  onJoinCircle?: (circleId: string) => void;
}

const defaultFeaturedCircles: FeaturedCircle[] = [
  {
    id: '1',
    name: 'Newly Diagnosed Support',
    description: 'A welcoming space for those recently diagnosed with Graves Disease to ask questions and find support.',
    memberCount: 45,
    recentActivity: '2 hours ago',
    featured: true,
    highlight: 'Most supportive community for beginners',
    activeDiscussions: 8,
    image: "testimonial1"
  },
  {
    id: '2',
    name: 'Managing Anxiety Together',
    description: 'Share coping strategies and support each other through anxiety and stress management.',
    memberCount: 67,
    recentActivity: '30 minutes ago',
    featured: true,
    highlight: 'Practical anxiety management techniques',
    activeDiscussions: 12,
    image: "testimonial2"
  },
  {
    id: '3',
    name: 'Thyroid Warriors',
    description: 'For the strong women who have been fighting this battle and want to share their wisdom.',
    memberCount: 89,
    recentActivity: '1 hour ago',
    featured: false,
    highlight: 'Experienced members sharing wisdom',
    activeDiscussions: 6,
    image: "testimonial3"
  }
];

export default function FeaturedCircles({ 
  circles = defaultFeaturedCircles, 
  onJoinCircle 
}: FeaturedCirclesProps) {
  const handleJoinCircle = (circleId: string, circleName: string) => {
    if (onJoinCircle) {
      onJoinCircle(circleId);
    } else {
      console.log(`Join ${circleName}`);
    }
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Box textAlign="center">
          <Header variant="h2">Featured Circles</Header>
          <Box color="text-body-secondary" fontSize="body-s">
            Join supportive communities led by sisters who understand your journey
          </Box>
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
                  <CommunityImage 
                    category="portraits"
                    type={circle.image}
                    size="small"
                    rounded={true}
                    style={{ 
                      margin: '0 auto',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                    }}
                  />
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
      </SpaceBetween>
    </Container>
  );
}
