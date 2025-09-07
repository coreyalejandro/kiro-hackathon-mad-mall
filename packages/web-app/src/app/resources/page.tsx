import { Metadata } from 'next';
import { ResourceHubContent } from '@/components/pages/ResourceHubContent';

export const metadata: Metadata = {
  title: 'Resource Hub - MADMall Social Wellness Hub',
  description: 'Access mental health resources and wellness tools',
};

export default function ResourcesPage() {
  return <ResourceHubContent />;
}