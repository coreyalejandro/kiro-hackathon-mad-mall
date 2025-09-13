'use client';

import { useEffect, useState } from 'react';
import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { StoryUploader } from '@/components/stories/StoryUploader';
import { StoryList } from '@/components/stories/StoryList';
import { api } from '@/lib/mock-api';
import { Story } from '@/lib/types';

export function StoryBoothContent() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    api.getStories().then(res => setStories(res.data));
  }, []);

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Share and discover inspiring personal stories"
        >
          Story Booth
        </Header>
      }
    >
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Personal Narratives</div>
                <h1 className="hero-title">Story Booth</h1>
                <p className="hero-subtitle">
                  Share your journey and be inspired by the stories of others in our community.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">📖</span>
                    Read Stories
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">✍️</span>
                    Share Your Story
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    <div className="hero-default-content">
                      <div className="hero-default-icon">📚</div>
                      <div className="hero-default-text">
                        Personal<br />Stories
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2>Recent Stories</h2>
          <ul>
            {stories.slice(0, 5).map(s => (
              <li key={s.id}>{s.title}</li>
            ))}
          </ul>
        </div>
      </Container>

      <StoryUploader />
      <StoryList />
    </ContentLayout>
  );
}