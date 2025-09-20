"use client";

import { useRouter } from 'next/navigation';
import { Container, ContentLayout, Cards, SpaceBetween, Box, Button, Badge, Header } from '@cloudscape-design/components';
import CommunityTestimonials from '../ui/CommunityTestimonials';

export function ConcourseContent() {
  const router = useRouter();

  const primaryItems = [
    {
      id: 'circles',
      name: 'Peer Circles',
      description: 'Connect with sisters who understand your journey.',
      href: '/circles',
      meta: ['127 active members', '5 new this week'],
      icon: '👥',
    },
    {
      id: 'comedy',
      name: 'Comedy Lounge',
      description: 'Find relief through laughter with curated clips.',
      href: '/comedy',
      meta: ['45 new clips', '⭐ 4.9 rating'],
      icon: '😂',
    },
  ];

  const secondaryItems = [
    {
      id: 'stories',
      name: 'Story Booth',
      description: 'Share audio stories and inspire others.',
      href: '/stories',
      meta: ['23 stories today'],
      icon: '🎤',
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      description: 'Support Black-owned wellness brands.',
      href: '/marketplace',
      meta: ['89 featured brands'],
      icon: '🛍️',
    },
    {
      id: 'resources',
      name: 'Resource Hub',
      description: 'Curated health information and wellness tips.',
      href: '/resources',
      meta: ['156 articles available'],
      icon: '📚',
    },
  ];

  const cardDefinition = {
    sections: [
      {
        content: (item: any) => (
          <SpaceBetween size="s">
            <Box>{item.description}</Box>
            {item.meta && (
              <SpaceBetween direction="horizontal" size="xs">
                {item.meta.map((meta: string, index: number) => (
                  <Badge key={index} color="blue">
                    {meta}
                  </Badge>
                ))}
              </SpaceBetween>
            )}
            <Button
              variant="primary"
              onClick={() => router.push(item.href)}
            >
              Enter {item.name}
            </Button>
          </SpaceBetween>
        ),
      },
    ],
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Your wellness journey starts here. Connect, share, and grow with a community that understands your unique path to wellness."
        >
          Welcome to MADMall
        </Header>
      }
    >
      <Container>
        <Header variant="h2">Featured Sections</Header>
        <Cards
          cardDefinition={cardDefinition}
          cardsPerRow={[{ cards: 2 }, { minWidth: 500, cards: 1 }]}
          items={primaryItems}
        />
      </Container>

      <Container>
        <Header variant="h2">Explore More</Header>
        <Cards
          cardDefinition={cardDefinition}
          cardsPerRow={[{ cards: 3 }, { minWidth: 500, cards: 1 }]}
          items={secondaryItems}
        />
      </Container>

      <CommunityTestimonials />
    </ContentLayout>
  );
}

export default ConcourseContent;
