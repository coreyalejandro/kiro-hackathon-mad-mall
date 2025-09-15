'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
  Cards,
  Box,
  Badge,
} from '@cloudscape-design/components';

export default function AdminImagesPage() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const sections = useMemo(() => [
    'concourse',
    'circles',
    'comedy',
    'stories',
    'marketplace',
    'resources',
    'auth',
    'profile',
  ], []);

  const fetchApproved = async () => {
    const approvedResponse = await fetch('/api/images/approve');
    const approvedData = await approvedResponse.json();
    setResults(approvedData);
  };

  useEffect(() => {
    // Load any approved images on first visit
    fetchApproved();
  }, []);

  const generateSiteImages = async () => {
    setGenerating(true);
    try {
      for (const section of sections) {
        await fetch('/api/images/generate-for-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, count: 3 })
        });
      }
      await fetchApproved();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const cardDefinition = {
    header: (item: any) => (
      <SpaceBetween size="xs" direction="horizontal">
        <Badge color="blue">{item.category}</Badge>
        <Badge color="green">{new Date(item.approvedAt).toLocaleString()}</Badge>
      </SpaceBetween>
    ),
    sections: [
      {
        id: 'preview',
        content: (item: any) => (
          <Box>
            <img
              src={item.url}
              alt={item.altText}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
            />
          </Box>
        )
      },
      {
        id: 'meta',
        content: (item: any) => (
          <SpaceBetween size="xs">
            <Box variant="p">{item.altText}</Box>
            <Box variant="code">{item.prompt}</Box>
          </SpaceBetween>
        )
      }
    ]
  } as const;

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="primary" onClick={generateSiteImages} loading={generating} iconName="status-in-progress">
                {generating ? 'Generating images…' : 'Generate Images For All Sections'}
              </Button>
              <Button variant="normal" onClick={fetchApproved} iconName="refresh">Refresh</Button>
            </SpaceBetween>
          }
        >
          Site Image Management
        </Header>
      }
    >
      <Container>
        <SpaceBetween size="l">
          <Header variant="h2">Approved Images {results ? `(${results.total})` : ''}</Header>
          <Cards
            cardDefinition={cardDefinition as any}
            cardsPerRow={[{ cards: 3 }, { minWidth: 500, cards: 1 }]}
            items={results?.approvedImages || []}
            empty={<Box variant="p">No approved images yet. Click Generate to create them.</Box>}
          />
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}
