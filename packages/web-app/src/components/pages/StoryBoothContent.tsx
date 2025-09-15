'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout } from '@cloudscape-design/components';
import PageHeader from '@/components/ui/PageHeader';
import { StoryUploader } from '@/components/stories/StoryUploader';
import { StoryList } from '@/components/stories/StoryList';
// import { api } from '@/lib/mock-api';
import { Story } from '@/lib/types';
import AutoImageHero from '@/components/ui/AutoImageHero';

export function StoryBoothContent() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    // Mock data for now - replace with actual API call when available
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'My Journey with Graves Disease',
        content: 'A personal story about living with Graves Disease...',
        type: 'text',
        author: {
          name: 'Sarah M.',
          avatar: '/avatars/sarah.jpg'
        },
        tags: ['diagnosis', 'journey'],
        publishedAt: new Date(),
        engagement: {
          likes: 12,
          comments: 3,
          shares: 1,
          views: 45,
          saves: 8,
          helpfulVotes: 5
        },
        isAnonymous: false
      }
    ];
    setStories(mockStories);
  }, []);

  return (
    <>
      <AutoImageHero
        section="stories"
        title="Story Booth"
        description="Share and discover inspiring personal stories"
        eyebrow="Community Voices"
        primaryAction={{ text: 'Share Your Story', onClick: () => {}, iconName: 'edit' }}
        secondaryAction={{ text: 'Read Stories', onClick: () => {}, iconName: 'document' }}
        highlights={[{ label: 'Today', value: '23 stories' }]}
      />
      <ContentLayout header={<PageHeader title="Story Booth" description="Share and discover inspiring personal stories" primaryAction={{ text: 'Share Your Story', onClick: () => {}, iconName: 'edit' }} secondaryAction={{ text: 'Read Stories', onClick: () => {}, iconName: 'document' }} />}>
      <Container>
        <div>
          <h2>Recent Stories</h2>
          <ul>
            {stories.slice(0, 5).map(s => (
              <li key={s.id}>
                <strong>{s.title}</strong> by {s.author.name}
                <br />
                <small>{s.engagement.likes} likes • {s.engagement.comments} comments</small>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <StoryUploader />
      <StoryList />
      </ContentLayout>
    </>
  );
}
