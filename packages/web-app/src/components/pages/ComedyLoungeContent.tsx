'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout } from '@cloudscape-design/components';
import PageHeader from '@/components/ui/PageHeader';
import { useComedyClips, useSubmitReliefRating } from '@/lib/queries';
import ComedyTherapyPlayer from '@/components/featured/ComedyTherapyPlayer';
import type { ComedyClip } from '@/lib/types';
import AutoImageHero from '@/components/ui/AutoImageHero';

export function ComedyLoungeContent() {
  const { data: clips = [] } = useComedyClips(); // Using the custom hook to fetch clips
  const [currentClip, setCurrentClip] = useState<ComedyClip | null>(null);
  const [showRating, setShowRating] = useState(false);
  const submitRating = useSubmitReliefRating(); // Custom hook for submitting ratings

  const handleRate = (rating: number) => {
    if (currentClip) {
      submitRating.mutate({ clipId: currentClip.id, userId: 'user-1', rating });
      setCurrentClip(null);
      setShowRating(false);
    }
  };

  return (
    <>
      <AutoImageHero
        section="comedy"
        title="Comedy Lounge"
        description="Find joy and laughter in our comedy community space"
        eyebrow="Therapeutic Humor"
        primaryAction={{ text: 'Watch Comedy', onClick: () => {}, iconName: 'play' }}
        secondaryAction={{ text: 'Share a Laugh', onClick: () => {}, iconName: 'share' }}
        highlights={[{ label: 'New Clips', value: '45' }, { label: 'Rating', value: '4.9' }]}
      />
      <ContentLayout header={<PageHeader title="Comedy Lounge" description="Find joy and laughter in our comedy community space" primaryAction={{ text: 'Watch Comedy', onClick: () => {}, iconName: 'play' }} secondaryAction={{ text: 'Share a Laugh', onClick: () => {}, iconName: 'share' }} />}>
      <Container>
        {/* Featured player */}
        <div className="mt-8">
          <ComedyTherapyPlayer />
        </div>

        {/* Display clips if available */}
        <div className="clips-container">
          {clips.length > 0 ? (
            clips.map((clip) => (
              <div key={clip.id} className="clip">
                <h2>{clip.title}</h2>
                <p>{clip.description}</p>
                <button onClick={() => {
                  setCurrentClip(clip);
                  setShowRating(true);
                }}>
                  Rate This Clip
                </button>
              </div>
            ))
          ) : (
            <p>No clips available at the moment.</p>
          )}
        </div>

        {/* Rating Modal or UI could be implemented here based on showRating */}
        {showRating && currentClip && (
          <div className="rating-modal">
            <h2>Rate {currentClip.title}</h2>
            <div>
              <button onClick={() => handleRate(1)}>😞</button>
              <button onClick={() => handleRate(3)}>😐</button>
              <button onClick={() => handleRate(5)}>😄</button>
            </div>
            <button onClick={() => setShowRating(false)}>Close</button>
          </div>
        )}
      </Container>
      </ContentLayout>
    </>
  );
}
