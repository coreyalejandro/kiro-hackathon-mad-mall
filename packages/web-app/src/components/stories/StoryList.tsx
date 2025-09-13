'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, SpaceBetween } from '@cloudscape-design/components';
import { useStories, useTrackStoryEngagement } from '@/lib/queries';

export function StoryList() {
  const [page, setPage] = useState(1);
  const { data } = useStories({}, page, 5);
  const stories = data?.data ?? [];
  const hasMore = data?.pagination.hasMore;
  const viewed = useRef(new Set<string>());
  const { mutate: track } = useTrackStoryEngagement();

  useEffect(() => {
    stories.forEach(story => {
      if (!viewed.current.has(story.id)) {
        track({ storyId: story.id, type: 'view' });
        viewed.current.add(story.id);
      }
    });
  }, [stories, track]);

  return (
    <Box margin={{ top: 'l' }}>
      <SpaceBetween size="l">
        {stories.map(story => (
          <Box key={story.id} padding="s" borderRadius="medium" border="all">
            <h3>{story.title}</h3>
            <p>{story.content.slice(0, 120)}...</p>
            <div>
              👁️ {story.engagement.views} · ❤️ {story.engagement.likes} · 💬 {story.engagement.comments} · 🔁 {story.engagement.shares}
            </div>
            <Button
              onClick={() => track({ storyId: story.id, type: 'like' })}
              variant="link"
            >
              Like
            </Button>
          </Box>
        ))}
        <Box direction="row" display="flex" justifyContent="space-between">
          <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
          <Button disabled={!hasMore} onClick={() => setPage(p => p + 1)}>Next</Button>
        </Box>
      </SpaceBetween>
    </Box>
  );
}
