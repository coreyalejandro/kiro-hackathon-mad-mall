'use client';

import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { useMallSections, useCommunityActivity } from '@/lib/queries';
import { useRouter } from 'next/navigation';

export function ConcourseContent() {
  const router = useRouter();
  const { data: mallSections } = useMallSections();
  const { data: communityActivity } = useCommunityActivity();

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

      <Container className="mt-8">
        <Header variant="h2">Explore the Mall</Header>
        {mallSections?.data ? (
          <div className="mall-sections-grid">
            {mallSections.data.map(section => (
              <div
                key={section.id}
                className="mall-section-card"
                role="button"
                tabIndex={0}
                data-testid={`mall-section-${section.id}`}
                onClick={() => router.push(section.href)}
                onKeyDown={e => {
                  if (e.key === 'Enter') router.push(section.href);
                }}
              >
                <div className="mall-section-icon">{section.icon}</div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>Loading sections...</div>
        )}
      </Container>

      <Container className="mt-8">
        <Header variant="h2">Community Activity</Header>
        {communityActivity?.data ? (
          <ul className="community-activity-list">
            {communityActivity.data.map(item => (
              <li key={item.id} className="community-activity-item">
                <span className="activity-user">{item.user.name}</span> {item.content}
              </li>
            ))}
          </ul>
        ) : (
          <div>Loading activity...</div>
        )}
      </Container>
    </ContentLayout>
  );
}