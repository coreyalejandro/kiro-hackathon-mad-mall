'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout, Header, SpaceBetween, Button, Cards, Box } from '@cloudscape-design/components';
// import { api } from '@/lib/mock-api';
import { Product } from '@/lib/types';

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
    <ContentLayout 
      header={
        <Header
          variant="h1"
          description="Discover wellness products and services from community businesses"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="normal" iconName="upload">List Business</Button>
              <Button variant="primary" iconName="external">Browse Products</Button>
            </SpaceBetween>
          }
        >
          Marketplace
        </Header>
      }
    >
      <Container>
        <Box variant="h2" margin={{ bottom: 'm' }}>
          Popular Products
        </Box>
        <Cards
          cardDefinition={{
            sections: [
              {
                id: 'product',
                content: (item: Product) => (
                  <SpaceBetween direction="vertical" size="xs">
                    <Box variant="strong">{item.name}</Box>
                    <Box variant="small" color="text-body-secondary">
                      {item.business.name} • ⭐ {item.rating} ({item.reviewCount} reviews)
                    </Box>
                    <Box variant="strong" color="text-status-success">
                      ${item.price}
                    </Box>
                  </SpaceBetween>
                )
              }
            ]
          }}
          items={products.slice(0, 5)}
        />
      </Container>
    </ContentLayout>
  );
}
