import { Metadata } from 'next';
import { MarketplaceContent } from '@/components/pages/MarketplaceContent';

export const metadata: Metadata = {
  title: 'Marketplace - MADMall Social Wellness Hub',
  description: 'Discover wellness products and services from community businesses',
};

export default function MarketplacePage() {
  return <MarketplaceContent />;
}