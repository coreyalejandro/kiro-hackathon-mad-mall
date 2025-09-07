import { Metadata } from 'next';
import { ConcourseContent } from '@/components/pages/ConcourseContent';

export const metadata: Metadata = {
  title: 'Concourse - MADMall Social Wellness Hub',
  description: 'Welcome to the main hub of our social wellness community',
};

export default function HomePage() {
  return <ConcourseContent />;
}