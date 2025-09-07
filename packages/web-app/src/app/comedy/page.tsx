import { Metadata } from 'next';
import { ComedyLoungeContent } from '@/components/pages/ComedyLoungeContent';

export const metadata: Metadata = {
  title: 'Comedy Lounge - MADMall Social Wellness Hub',
  description: 'Find joy and laughter in our comedy community space',
};

export default function ComedyPage() {
  return <ComedyLoungeContent />;
}