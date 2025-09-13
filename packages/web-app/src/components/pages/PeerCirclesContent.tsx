'use client';

import { useEffect, useState } from 'react';
import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { api } from '@/lib/mock-api';
import { Circle } from '@/lib/types';

export function PeerCirclesContent() {
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    api.getCircles().then(res => setCircles(res.data));
  }, []);

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
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Support Networks</div>
                <h1 className="hero-title">Peer Circles</h1>
                <p className="hero-subtitle">
                  Find your community and connect with others who understand your journey.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">👥</span>
                    Join a Circle
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">➕</span>
                    Create Circle
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    <div className="hero-default-content">
                      <div className="hero-default-icon">🤝</div>
                      <div className="hero-default-text">
                        Supportive<br />Communities
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2>Featured Circles</h2>
          <ul>
            {circles.slice(0, 5).map(c => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </div>
      </Container>
    </ContentLayout>
  );
}