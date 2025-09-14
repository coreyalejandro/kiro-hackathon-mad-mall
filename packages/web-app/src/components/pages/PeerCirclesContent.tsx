'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { CirclesGrid } from '@/components/ui'; // Importing CirclesGrid for displaying circles
import type { Circle } from '@/lib/types'; // Ensuring Circle type is imported
import { useCircles } from '@/lib/queries'; // Fetching circles via a custom hook

export function PeerCirclesContent() {
  const { data: circles = [] } = useCircles(); // Using custom hook to fetch circles data

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Connect with supportive peer groups and communities"
        >
          Peer Circles
        </Header>
      }
    >
      <Container>
        {/* Display the circles using CirclesGrid */}
        <div className="circles-section">
          <h2>Available Peer Circles</h2>
          {circles.length > 0 ? (
            <CirclesGrid circles={circles} /> // Pass circles to CirclesGrid component
          ) : (
            <p>No peer circles available at this time. Please check back later.</p>
          )}
        </div>
      </Container>
    </ContentLayout>
  );
}
