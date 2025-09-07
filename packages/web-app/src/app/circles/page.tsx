import { Metadata } from 'next';
import { PeerCirclesContent } from '@/components/pages/PeerCirclesContent';

export const metadata: Metadata = {
  title: 'Peer Circles - MADMall Social Wellness Hub',
  description: 'Connect with supportive peer groups and communities',
};

export default function CirclesPage() {
  return <PeerCirclesContent />;
}