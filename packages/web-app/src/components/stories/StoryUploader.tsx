'use client';

import { useState } from 'react';
import { Box, Button, FormField, Input, SpaceBetween, Textarea } from '@cloudscape-design/components';
import { useUploadStory } from '@/lib/queries';

export function StoryUploader() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { mutate: uploadStory, data, isPending, error } = useUploadStory();

  const handleSubmit = () => {
    const type = videoFile ? 'video' : audioFile ? 'audio' : 'text';
    const audioUrl = audioFile ? URL.createObjectURL(audioFile) : undefined;
    const videoUrl = videoFile ? URL.createObjectURL(videoFile) : undefined;
    uploadStory({ title, content, type, audioUrl, videoUrl });
    setTitle('');
    setContent('');
    setAudioFile(null);
    setVideoFile(null);
  };

  return (
    <Box margin={{ top: 'l' }}>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <SpaceBetween size="m">
          <FormField label="Title">
            <Input value={title} onChange={({ detail }) => setTitle(detail.value)} />
          </FormField>
          <FormField label="Story">
            <Textarea value={content} onChange={({ detail }) => setContent(detail.value)} />
          </FormField>
          <FormField label="Audio Upload">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={e => setAudioFile(e.target.files?.[0] || null)}
              aria-label="Upload audio file for your story"
              title="Select an audio file to upload"
            />
          </FormField>
          <FormField label="Video Upload">
            <input 
              type="file" 
              accept="video/*" 
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
              aria-label="Upload video file for your story"
              title="Select a video file to upload"
            />
          </FormField>
          <Button formAction="none" variant="primary" loading={isPending} disabled={!title || !content}>
            Submit
          </Button>
          {Boolean(data) && <div>Story uploaded successfully!</div>}
          {error && <div>Upload failed</div>}
        </SpaceBetween>
      </form>
    </Box>
  );
}
