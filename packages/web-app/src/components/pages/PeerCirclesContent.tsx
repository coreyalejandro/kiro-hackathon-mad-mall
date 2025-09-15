'use client';

import { Container, ContentLayout } from '@cloudscape-design/components';
import PageHeader from '@/components/ui/PageHeader';
import { CirclesGrid } from '@/components/ui'; // Importing CirclesGrid for displaying circles
import type { Circle } from '@/lib/types'; // Ensuring Circle type is imported
import { useCircles } from '@/lib/queries'; // Fetching circles via a custom hook
import AutoImageHero from '@/components/ui/AutoImageHero';

export function PeerCirclesContent() {
  const { data: circles = [] } = useCircles(); // Using custom hook to fetch circles data

  return (
    <>
      <AutoImageHero
        section="circles"
        title="Peer Circles"
        description="Connect with supportive peer groups and communities"
        eyebrow="Community"
        primaryAction={{ text: 'Create Circle', onClick: () => {}, iconName: 'add-plus' }}
        secondaryAction={{ text: 'Browse', onClick: () => {}, iconName: 'search' }}
        highlights={[{ label: 'Active', value: '127 members' }, { label: 'New', value: '5 this week' }]}
      />
      <ContentLayout header={<PageHeader title="Peer Circles" description="Connect with supportive peer groups and communities" primaryAction={{ text: 'Create Circle', onClick: () => {} , iconName: 'add-plus' }} secondaryAction={{ text: 'Browse', onClick: () => {} , iconName: 'search' }} />}>
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
    </>
  );
}
