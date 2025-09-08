import { Metadata } from 'next';
import { Container, Header, ContentLayout, Box, Button, SpaceBetween } from '@cloudscape-design/components';

export const metadata: Metadata = {
  title: 'Page Not Found - MADMall Social Wellness Hub',
  description: 'The page you are looking for could not be found',
};

export default function NotFound() {
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="The page you are looking for could not be found"
        >
          Page Not Found
        </Header>
      }
    >
      <Container>
        <Box textAlign="center" padding="xl">
          <SpaceBetween size="l">
            <Box fontSize="display-l">🔍</Box>
            <Header variant="h2">Oops! Page Not Found</Header>
            <Box>
              The page you're looking for doesn't exist or has been moved.
              Let's get you back to our wellness community.
            </Box>
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Button 
                variant="primary" 
                href="/"
              >
                Return to Concourse
              </Button>
              <Button 
                variant="normal" 
                href="/circles"
              >
                Browse Peer Circles
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </Box>
      </Container>
    </ContentLayout>
  );
}