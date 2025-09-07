'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';

export function UserProfileContent() {
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Manage your profile and account settings"
        >
          User Profile
        </Header>
      }
    >
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Account Management</div>
                <h1 className="hero-title">Your Profile</h1>
                <p className="hero-subtitle">
                  Manage your account settings, preferences, and community profile.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">⚙️</span>
                    Edit Profile
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">🔒</span>
                    Privacy Settings
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    <div className="hero-default-content">
                      <div className="hero-default-icon">👤</div>
                      <div className="hero-default-text">
                        Your<br />Profile
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