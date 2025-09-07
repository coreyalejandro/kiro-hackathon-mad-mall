'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';

export function ConcourseContent() {
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Welcome to the main hub of our social wellness community"
        >
          Concourse
        </Header>
      }
    >
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Community Hub</div>
                <h1 className="hero-title">Welcome to the Concourse</h1>
                <p className="hero-subtitle">
                  Your central gathering place for wellness, community, and connection.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">🌟</span>
                    Explore Communities
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">💬</span>
                    Start Conversation
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    <div className="hero-default-content">
                      <div className="hero-default-icon">🏛️</div>
                      <div className="hero-default-text">
                        Community<br />Gathering Space
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </ContentLayout>
  );
}