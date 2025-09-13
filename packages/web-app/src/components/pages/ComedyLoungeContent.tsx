'use client';

import { useEffect, useState } from 'react';
import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { api } from '@/lib/mock-api';
import { ComedyClip } from '@/lib/types';

export function ComedyLoungeContent() {
  const [clips, setClips] = useState<ComedyClip[]>([]);

  useEffect(() => {
    api.getComedyClips().then(res => setClips(res.data));
  }, []);

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
        <div>
          <h2>Top Clips</h2>
          <ul>
            {clips.slice(0, 5).map(c => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
        </div>
      </Container>
    </ContentLayout>
  );
}