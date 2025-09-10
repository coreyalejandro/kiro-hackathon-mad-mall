'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { signInWithRedirect, signOut } from 'aws-amplify/auth';
import { env } from '@/lib/env';
import { useEffect } from 'react';

export function AuthenticationContent() {
  useEffect(() => {
    // Preload or verify auth domain/client id presence
  }, []);
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Sign in or create your account to join our community"
        >
          Authentication
        </Header>
      }
    >
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Join Our Community</div>
                <h1 className="hero-title">Welcome</h1>
                <p className="hero-subtitle">
                  Sign in to your account or create a new one to join our wellness community.
                </p>
                <div className="hero-cta-group">
                  <button
                    className="hero-cta hero-cta-primary"
                    onClick={() => signInWithRedirect()}
                  >
                    <span className="hero-cta-icon">🔐</span>
                    Sign In
                  </button>
                  <button
                    className="hero-cta hero-cta-secondary"
                    onClick={() => signInWithRedirect()}
                  >
                    <span className="hero-cta-icon">📝</span>
                    Create Account
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    <div className="hero-default-content">
                      <div className="hero-default-icon">🌟</div>
                      <div className="hero-default-text">
                        Join Our<br />Community
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