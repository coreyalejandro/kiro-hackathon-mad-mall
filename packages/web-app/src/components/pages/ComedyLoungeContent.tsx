'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { useState } from 'react';
import { useComedyClips, useSubmitReliefRating } from '@/lib/queries';
import type { ComedyClip } from '@/lib/types';

export function ComedyLoungeContent() {
  const { data: clips } = useComedyClips();
  const [currentClip, setCurrentClip] = useState<ComedyClip | null>(null);
  const [showRating, setShowRating] = useState(false);
  const submitRating = useSubmitReliefRating();

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
                    <div className="hero-default-content">
                      <div className="hero-default-icon">🎪</div>
                      <div className="hero-default-text">
                        Laughter<br />& Joy
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container>
        {clips ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clips.data.map(clip => (
              <div
                key={clip.id}
                className="cursor-pointer"
                onClick={() => {
                  setCurrentClip(clip);
                  setShowRating(false);
                }}
              >
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.title}
                  className="w-full h-auto rounded"
                />
                <div className="mt-2 font-semibold">{clip.title}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>Loading clips...</div>
        )}
      </Container>

      {currentClip && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-2xl w-full">
            <video
              src={currentClip.videoUrl}
              controls
              autoPlay
              className="w-full"
              onEnded={() => setShowRating(true)}
            />
            {showRating && (
              <div className="mt-4">
                <p className="mb-2">How much relief did this clip provide?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      className="px-3 py-1 border rounded"
                      onClick={() => handleRate(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              className="mt-4 text-sm text-gray-600"
              onClick={() => {
                setCurrentClip(null);
                setShowRating(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </ContentLayout>
  );
}