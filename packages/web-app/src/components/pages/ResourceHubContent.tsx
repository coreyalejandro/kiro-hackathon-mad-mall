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
  Button,
} from '@cloudscape-design/components';
import {
  useArticles,
  useArticleCategories,
  useArticleFormats,
  useArticleCredibilityLevels,
} from '@/lib/queries';
import type { Article } from '@/lib/types'; // Ensure Article type is imported

export function ResourceHubContent() {
  const [topic, setTopic] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [credibility, setCredibility] = useState<string | null>(null);

  const { data: articles, isLoading } = useArticles({
    category: topic || undefined,
    format: format || undefined,
    credibility: credibility || undefined,
  });

  const { data: categoriesData } = useArticleCategories();
  const { data: formatsData } = useArticleFormats();
  const { data: credibilityData } = useArticleCredibilityLevels();

  const categoryOptions = (categoriesData?.data || []).map((c) => ({ label: c, value: c }));
  const formatOptions = (formatsData?.data || []).map((f) => ({ label: f, value: f }));
  const credibilityOptions = (credibilityData?.data || []).map((level) => ({
    label: level,
    value: level,
  }));

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Your resource hub for accessing articles related to various topics."
        >
          Resource Hub
        </Header>
      }
    >
      <Container>
        <SpaceBetween size="l">
          <div>
            <Select
              selectedOption={{ label: topic || 'Select category', value: topic }}
              onChange={({ detail }) => setTopic(detail.selectedOption.value)}
              options={categoryOptions}
            />
            <Select
              selectedOption={{ label: format || 'Select format', value: format }}
              onChange={({ detail }) => setFormat(detail.selectedOption.value)}
              options={formatOptions}
            />
            <Select
              selectedOption={{ label: credibility || 'Select credibility level', value: credibility }}
              onChange={({ detail }) => setCredibility(detail.selectedOption.value)}
              options={credibilityOptions}
            />
          </div>
          <Button onClick={() => { setTopic(null); setFormat(null); setCredibility(null); }}>
            Clear Filters
          </Button>
        </SpaceBetween>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="articles-list">
            {articles && articles.length > 0 ? (
              articles.map((article: Article) => (
                <div key={article.id} className="article-card">
                  <h2>
                    <Link href={`/articles/${article.id}`}>{article.title}</Link>
                  </h2>
                  <p>{article.description}</p>
                </div>
              ))
            ) : (
              <p>No articles found for the selected filters.</p>
            )}
          </div>
        )}
      </Container>
    </ContentLayout>
  );
}