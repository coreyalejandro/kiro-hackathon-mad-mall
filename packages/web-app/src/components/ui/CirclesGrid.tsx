'use client';

import React, { useState } from 'react';
import {
  Container,
  Header,
  Grid,
  Input,
  Select,
  SpaceBetween,
  Badge,
  Box,
  Button,
  Textarea,
  Alert
} from '@cloudscape-design/components';
import { useCircles, useJoinCircle, useLeaveCircle, useCreateCirclePost } from '@/lib/queries';
import { CircleFilters } from '@/lib/types';

export function CirclesGrid() {
  const [search, setSearch] = useState('');
  const [activity, setActivity] = useState<string | null>(null);
  const [postTarget, setPostTarget] = useState<string | null>(null);
  const [postContent, setPostContent] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filters: CircleFilters = {};
  if (search) filters.search = search;
  if (activity) filters.activityLevel = activity as any;

  const { data } = useCircles(filters);
  const joinMutation = useJoinCircle();
  const leaveMutation = useLeaveCircle();
  const postMutation = useCreateCirclePost();

  const circles = data?.data || [];

  const handlePost = async (circleId: string) => {
    try {
      const res = await postMutation.mutateAsync({ circleId, userId: 'user-1', content: postContent });
      if (!res.success) {
        setFeedback(res.message || 'Content failed cultural validation');
      } else {
        setFeedback('Post submitted successfully');
        setPostContent('');
        setPostTarget(null);
      }
    } catch (err: any) {
      setFeedback(err.message);
    }
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h2">Browse Circles</Header>
        <SpaceBetween size="s" direction="horizontal">
          <Input
            placeholder="Search circles"
            value={search}
            onChange={e => setSearch(e.detail.value)}
          />
          <Select
            placeholder="Activity"
            selectedOption={activity ? { label: activity, value: activity } : null}
            onChange={e => setActivity(e.detail.selectedOption?.value || null)}
            options={[
              { label: 'All', value: '' },
              { label: 'low', value: 'low' },
              { label: 'medium', value: 'medium' },
              { label: 'high', value: 'high' }
            ]}
          />
        </SpaceBetween>
        {feedback && (
          <Alert type="info" onDismiss={() => setFeedback(null)}>{feedback}</Alert>
        )}
        <Grid gridDefinition={[{ colspan: 3 }, { colspan: 3 }, { colspan: 3 }, { colspan: 3 }]}>
          {circles.map(circle => (
            <div key={circle.id} className="p-3 border border-neutral-400 rounded">
              <SpaceBetween size="s">
                <Box fontWeight="bold">{circle.name}</Box>
                <Box>{circle.description}</Box>
                <SpaceBetween direction="horizontal" size="xs">
                  <Badge>{circle.memberCount} members</Badge>
                  <Badge>{circle.activityLevel} activity</Badge>
                </SpaceBetween>
                <SpaceBetween direction="horizontal" size="s">
                  <Button onClick={() => joinMutation.mutate({ circleId: circle.id, userId: 'user-1' })}>
                    Join
                  </Button>
                  <Button onClick={() => leaveMutation.mutate({ circleId: circle.id, userId: 'user-1' })}>
                    Leave
                  </Button>
                  <Button onClick={() => setPostTarget(circle.id)}>Post</Button>
                </SpaceBetween>
                {postTarget === circle.id && (
                  <SpaceBetween size="s">
                    <Textarea
                      value={postContent}
                      onChange={e => setPostContent(e.detail.value)}
                      placeholder="Share something with the circle"
                    />
                    <Button variant="primary" onClick={() => handlePost(circle.id)} disabled={!postContent}>
                      Submit
                    </Button>
                  </SpaceBetween>
                )}
              </SpaceBetween>
            </div>
          ))}
        </Grid>
      </SpaceBetween>
    </Container>
  );
}

export default CirclesGrid;

