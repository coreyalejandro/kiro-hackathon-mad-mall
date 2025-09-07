'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';

export function ResourceHubContent() {
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Access mental health resources and wellness tools"
        >
          Resource Hub
        </Header>
      }
    >
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Wellness Resources</div>
                <h1 className="hero-title">Resource Hub</h1>
                <p className="hero-subtitle">
                  Access curated mental health resources, tools, and professional support.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">📋</span>
                    Browse Resources
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">🔍</span>
                    Find Help
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    <div className="hero-default-content">
                      <div className="hero-default-icon">🧠</div>
                      <div className="hero-default-text">
                        Mental Health<br />Resources
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