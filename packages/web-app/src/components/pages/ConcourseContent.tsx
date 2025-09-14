"use client";

import { useRouter } from 'next/navigation';
import { Container, ContentLayout, Cards, SpaceBetween, Box, Button, Badge, Header } from '@cloudscape-design/components';
import CloudscapeHero from '../ui/CloudscapeHero';
import CommunityTestimonials from '../ui/CommunityTestimonials';

export function ConcourseContent() {
  const router = useRouter();

  const primaryItems = [
    { id: 'circles', name: 'Peer Circles', description: 'Connect with sisters who understand your journey.', href: '/circles', meta: ['127 active members', '5 new this week'], icon: '👥' },
    { id: 'comedy', name: 'Comedy Lounge', description: 'Find relief through laughter with curated clips.', href: '/comedy', meta: ['45 new clips', '⭐ 4.9 rating'], icon: '😂' },
  ];

  const secondaryItems = [
    { id: 'stories', name: 'Story Booth', description: 'Share audio stories and inspire others.', href: '/stories', meta: ['23 stories today'], icon: '🎤' },
    { id: 'marketplace', name: 'Marketplace', description: 'Support Black-owned wellness brands.', href: '/marketplace', meta: ['89 featured brands'], icon: '🛍️' },
    { id: 'resources', name: 'Resource Hub', description: 'Curated health information and wellness tips.', href: '/resources', meta: ['156 articles available'], icon: '📚' },
  ];

  const cardDefinition = {
    header: (item: any) => (
      <SpaceBetween direction="horizontal" size="s" alignItems="center">
        <Box>{item.icon}</Box>
        <Header variant="h3">{item.name}</Header>
      </SpaceBetween>
    ),
    sections: [
      {
        content: (item: any) => (
          <SpaceBetween size="s">
            <Box>{item.description}</Box>
            {item.meta && (
              <SpaceBetween direction="horizontal" size="xs">
                {item.meta.map((m: string, i: number) => (
                  <Badge key={i} color="grey">{m}</Badge>
                ))}
              </SpaceBetween>
            )}
            <Button variant="primary" onClick={() => router.push(item.href)} data-testid={item.id === 'circles' ? 'mall-section-peer-circles' : undefined}>
              Visit {item.name}
            </Button>
          </SpaceBetween>
        ),
      },
    ],
  } as const;

  return (
    <ContentLayout header={
      <CloudscapeHero
        eyebrow="New"
        title="Concourse"
        description="Welcome to your wellness sanctuary. Explore community, joy, and trusted resources."
        primaryAction={{ text: 'Join a Circle', onClick: () => router.push('/circles'), iconName: 'users' }}
        secondaryAction={{ text: 'Explore Mall', onClick: () => document.getElementById('explore-start')?.scrollIntoView({ behavior: 'smooth' }), iconName: 'search' }}
        highlights={[{ icon: '👥', label: 'Members', value: '1.2k' }, { icon: '⭐', label: 'Relief Rating', value: '4.8/5' }]}
        images={['/images/hero/community-1.png','/images/hero/community-2.png','/images/hero/community-3.png']}
      />
    }>
      <SpaceBetween size="l">
        <Container id="explore-start">
          <Header variant="h2">Explore Your Wellness Mall</Header>
          <Cards cardDefinition={cardDefinition} items={primaryItems} selectionType="none" trackBy="id" />
          <Box padding={{ top: 'l' }}>
            <Cards cardDefinition={cardDefinition} items={secondaryItems} selectionType="none" trackBy="id" />
          </Box>
        </Container>

        <Container>
          <Header variant="h2">Today&apos;s Highlights</Header>
          <Cards
            cardDefinition={{
              header: (item: any) => <Header variant="h3">{item.title}</Header>,
              sections: [{ content: (item: any) => <Box>{item.body}</Box> }],
            }}
            items={[
              { id: 'discuss', title: '💬 Active Discussions', body: '“Managing Anxiety Together” – 12 new messages' },
              { id: 'comedy', title: '😂 Comedy Relief', body: 'New “Graves Giggles” collection – 5 minutes of joy' },
              { id: 'brand', title: '🛍️ Featured Brand', body: 'Melanin Wellness Co. – Natural supplements' },
            ]}
            trackBy="id"
            selectionType="none"
          />
        </Container>

        <Container>
          <Header variant="h2">Recent Community Activity</Header>
          <ul>
            <li>Aisha joined Peer Circles</li>
            <li>New post in Story Booth</li>
            <li>Comedy Lounge added 3 clips</li>
          </ul>
        </Container>

        <CommunityTestimonials />
      </SpaceBetween>
    </ContentLayout>
  );
}

export default ConcourseContent;

