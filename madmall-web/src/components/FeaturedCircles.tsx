
import {
  Container,
  Header,
  Grid,
  Button,
  SpaceBetween,
  Badge,
  Box
} from '@cloudscape-design/components';
import CommunityImage from './CommunityImage';

const featuredCircles = [
  {
    id: '1',
    name: 'Newly Diagnosed Support',
    description: 'A welcoming space for those recently diagnosed with Graves Disease to ask questions and find support.',
    memberCount: 45,
    recentActivity: '2 hours ago',
    featured: true,
    highlight: 'Most supportive community for beginners',
    activeDiscussions: 8
  },
  {
    id: '2',
    name: 'Managing Anxiety Together',
    description: 'Share coping strategies and support each other through anxiety and stress management.',
    memberCount: 67,
    recentActivity: '30 minutes ago',
    featured: true,
    highlight: 'Practical anxiety management techniques',
    activeDiscussions: 12
  },
  {
    id: '3',
    name: 'Thyroid Warriors',
    description: 'For the strong women who have been fighting this battle and want to share their wisdom.',
    memberCount: 89,
    recentActivity: '1 hour ago',
    featured: false,
    highlight: 'Experienced members sharing wisdom',
    activeDiscussions: 6
  }
];

export default function FeaturedCircles() {
  return (
    <Container>
      <Header variant="h2" id="featured-circles">Featured Circles</Header>
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        {/* Newly Diagnosed Support */}
        <Box padding="l" className="kadir-nelson-gradient-warm">
          <SpaceBetween size="m">
            <CommunityImage 
              category="community"
              type="groupSupport"
              size="medium"
              rounded={true}
              overlay={true}
              overlayText="New Members Welcome"
              style={{ margin: '0 auto 1rem auto', display: 'block' }}
            />
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Box fontSize="heading-l">👥</Box>
              <Header variant="h3">Newly Diagnosed Support</Header>
            </SpaceBetween>
            <Box>
              A welcoming space for those recently diagnosed with Graves Disease to ask questions and find support.
            </Box>
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Badge color="grey">45 members</Badge>
              <Badge color="grey">Active 2 hours ago</Badge>
            </SpaceBetween>
            <Button 
              variant="primary"
              onClick={() => console.log('Join Newly Diagnosed Support')}
            >
              Join Circle
            </Button>
          </SpaceBetween>
        </Box>

        {/* Managing Anxiety Together */}
        <Box padding="l" className="kadir-nelson-gradient-sage">
          <SpaceBetween size="m">
            <CommunityImage 
              category="wellness"
              type="meditation"
              size="medium"
              rounded={true}
              overlay={true}
              overlayText="Find Your Peace"
              style={{ margin: '0 auto 1rem auto', display: 'block' }}
            />
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Box fontSize="heading-l">🧘‍♀️</Box>
              <Header variant="h3">Managing Anxiety Together</Header>
            </SpaceBetween>
            <Box>
              Share coping strategies and support each other through anxiety and stress management.
            </Box>
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Badge color="grey">67 members</Badge>
              <Badge color="grey">Active 30 minutes ago</Badge>
            </SpaceBetween>
            <Button 
              variant="primary"
              onClick={() => console.log('Join Managing Anxiety Together')}
            >
              Join Circle
            </Button>
          </SpaceBetween>
        </Box>

        {/* Thyroid Warriors */}
        <Box padding="l" className="kadir-nelson-gradient-earth">
          <SpaceBetween size="m">
            <CommunityImage 
              category="lifestyle"
              type="strength"
              size="medium"
              rounded={true}
              overlay={true}
              overlayText="Warriors Unite"
              style={{ margin: '0 auto 1rem auto', display: 'block' }}
            />
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Box fontSize="heading-l">💪</Box>
              <Header variant="h3">Thyroid Warriors</Header>
            </SpaceBetween>
            <Box>
              For the strong women who have been fighting this battle and want to share their wisdom.
            </Box>
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Badge color="grey">89 members</Badge>
              <Badge color="grey">Active 1 hour ago</Badge>
            </SpaceBetween>
            <Button 
              variant="primary"
              onClick={() => console.log('Join Thyroid Warriors')}
            >
              Join Circle
            </Button>
          </SpaceBetween>
        </Box>
      </Grid>
    </Container>
  );
}