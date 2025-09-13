'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Header,
  ContentLayout,
  SpaceBetween,
  Select,
  Spinner,
} from '@cloudscape-design/components';
import {
  useArticles,
  useArticleCategories,
  useArticleFormats,
  useArticleCredibilityLevels,
} from '@/lib/queries';

export function ResourceHubContent() {
  const [topic, setTopic] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [credibility, setCredibility] = useState<string | null>(null);

  const { data, isLoading } = useArticles({
    category: topic || undefined,
    format: format || undefined,
    credibility: credibility || undefined,
  });

  const { data: categoriesData } = useArticleCategories();
  const { data: formatsData } = useArticleFormats();
  const { data: credibilityData } = useArticleCredibilityLevels();

  const categoryOptions = (categoriesData?.data || []).map((c) => ({ label: c, value: c }));
  const formatOptions = (formatsData?.data || []).map((f) => ({ label: f, value: f }));
  const credibilityOptions = (credibilityData?.data || []).map((c) => ({ label: c, value: c }));

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

      <Container>
        <SpaceBetween size="l">
          <SpaceBetween direction="horizontal" size="s">
            <Select
              placeholder="Topic"
              selectedOption={topic ? { label: topic, value: topic } : null}
              onChange={({ detail }) => setTopic(detail.selectedOption?.value || null)}
              options={categoryOptions}
            />
            <Select
              placeholder="Format"
              selectedOption={format ? { label: format, value: format } : null}
              onChange={({ detail }) => setFormat(detail.selectedOption?.value || null)}
              options={formatOptions}
            />
            <Select
              placeholder="Credibility"
              selectedOption={credibility ? { label: credibility, value: credibility } : null}
              onChange={({ detail }) => setCredibility(detail.selectedOption?.value || null)}
              options={credibilityOptions}
            />
          </SpaceBetween>

          {isLoading ? (
            <Spinner />
          ) : (
            <SpaceBetween size="m">
              {(data?.data || []).map((article) => (
                <div key={article.id}>
                  <h3>
                    <Link href={`/resources/${article.id}`}>{article.title}</Link>
                  </h3>
                  <p>{article.excerpt}</p>
                </div>
              ))}
            </SpaceBetween>
          )}
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}