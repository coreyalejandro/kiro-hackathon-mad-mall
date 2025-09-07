import { Metadata } from 'next';
import { StoryBoothContent } from '@/components/pages/StoryBoothContent';

export const metadata: Metadata = {
  title: 'Story Booth - MADMall Social Wellness Hub',
  description: 'Share and discover inspiring personal stories',
};

export default function StoriesPage() {
  return <StoryBoothContent />;
}