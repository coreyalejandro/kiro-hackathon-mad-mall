'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout } from '@cloudscape-design/components';
import PageHeader from '@/components/ui/PageHeader';
// import { api } from '@/lib/mock-api';
import { Product } from '@/lib/types';
import AutoImageHero from '@/components/ui/AutoImageHero';

export function MarketplaceContent() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Mock data for now - replace with actual API call when available
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Thyroid Support Tea',
        description: 'Herbal tea blend designed to support thyroid health',
        price: 24.99,
        imageUrl: '/products/thyroid-tea.jpg',
        affiliateUrl: 'https://example.com/thyroid-tea',
        business: {
          name: 'Melanin Wellness Co.',
          ownerName: 'Dr. Sarah Johnson',
          story: 'Founded by a Black endocrinologist to provide culturally-informed wellness products',
          logoUrl: '/businesses/melanin-wellness.jpg',
          isBlackOwned: true
        },
        category: 'Supplements',
        tags: ['thyroid', 'herbal', 'wellness'],
        rating: 4.8,
        reviewCount: 127
      },
      {
        id: '2',
        name: 'Stress Relief Candle',
        description: 'Lavender and sage candle for relaxation and stress relief',
        price: 18.50,
        imageUrl: '/products/stress-candle.jpg',
        affiliateUrl: 'https://example.com/stress-candle',
        business: {
          name: 'Sisterhood Scents',
          ownerName: 'Maria Rodriguez',
          story: 'A Latina-owned business creating aromatherapy products for women of color',
          logoUrl: '/businesses/sisterhood-scents.jpg',
          isBlackOwned: false
        },
        category: 'Aromatherapy',
        tags: ['stress-relief', 'candles', 'aromatherapy'],
        rating: 4.6,
        reviewCount: 89
      }
    ];
    setProducts(mockProducts);
  }, []);

  return (
    <>
      <AutoImageHero
        section="marketplace"
        title="Marketplace"
        description="Discover wellness products and services from community businesses"
        eyebrow="Support Black-Owned"
        primaryAction={{ text: 'Browse Products', onClick: () => {}, iconName: 'cart' }}
        secondaryAction={{ text: 'List Business', onClick: () => {}, iconName: 'upload' }}
        highlights={[{ label: 'Featured', value: '89 brands' }]}
      />
      <ContentLayout header={<PageHeader title="Marketplace" description="Discover wellness products and services from community businesses" primaryAction={{ text: 'Browse Products', onClick: () => {}, iconName: 'cart' }} secondaryAction={{ text: 'List Business', onClick: () => {}, iconName: 'upload' }} />}>
      <Container>
        <div>
          <h2>Popular Products</h2>
          <ul>
            {products.slice(0, 5).map(p => (
              <li key={p.id}>
                <strong>{p.name}</strong> - ${p.price}
                <br />
                <small>{p.business.name} • ⭐ {p.rating} ({p.reviewCount} reviews)</small>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      </ContentLayout>
    </>
  );
}
