'use client';

import { useEffect, useState } from 'react';
import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { useComedyClips, useSubmitReliefRating } from '@/lib/queries';
import ComedyTherapyPlayer from '@/components/featured/ComedyTherapyPlayer';
import type { ComedyClip } from '@/lib/types';

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
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Find joy and laughter in our comedy community space"
        >
          Comedy Lounge
        </Header>
      }
    >
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Wellness Through Laughter</div>
                <h1 className="hero-title">Comedy Lounge</h1>
                <p className="hero-subtitle">
                  Discover the healing power of laughter and share moments of joy with our community.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">😄</span>
                    Watch Comedy
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">🎭</span>
                    Share a Laugh
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    {/* Optional: Placeholder for the main image, you can add a specific image component here */}
                  </div>
                </div>
              </div>
            </div>

            {/* Therapy Player */}
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
          </div>
        </div>
      </Container>
    </ContentLayout>
  );
}