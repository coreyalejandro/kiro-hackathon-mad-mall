'use client';

import { useEffect, useState } from 'react';
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
            </div>
          </div>
        </div>

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