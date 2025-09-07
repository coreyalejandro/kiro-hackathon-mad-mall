'use client';

import React from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Icon
} from '@cloudscape-design/components';

interface Brand {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  featured: boolean;
  story: string;
  products: number;
}

interface FeaturedBrandsProps {
  brands?: Brand[];
  onShopNow?: (brandId: string) => void;
  onSaveBrand?: (brandId: string) => void;
  onShareBrand?: (brandId: string) => void;
}

const defaultBlackOwnedBrands: Brand[] = [
  {
    id: '1',
    name: 'Melanin Wellness Co.',
    description: 'Natural supplements and vitamins specifically formulated for Black women with thyroid conditions.',
    category: 'Supplements',
    rating: 4.9,
    featured: true,
    story: 'Founded by Dr. Keisha Williams after her own Graves diagnosis',
    products: 12
  },
  {
    id: '2',
    name: 'Sister Strength Teas',
    description: 'Herbal tea blends designed to support thyroid health and reduce stress naturally.',
    category: 'Wellness',
    rating: 4.8,
    featured: false,
    story: 'Family recipes passed down through generations',
    products: 8
  },
  {
    id: '3',
    name: 'Crown & Glory Skincare',
    description: 'Gentle skincare products for sensitive skin affected by thyroid medication.',
    category: 'Beauty',
    rating: 4.7,
    featured: true,
    story: 'Created by a chemist who understands our unique skin needs',
    products: 15
  }
];

export default function FeaturedBrands({ 
  brands = defaultBlackOwnedBrands,
  onShopNow,
  onSaveBrand,
  onShareBrand
}: FeaturedBrandsProps) {
  const handleShopNow = (brandId: string) => {
    if (onShopNow) {
      onShopNow(brandId);
    } else {
      console.log(`Shop brand ${brandId}`);
    }
  };

  const handleSaveBrand = (brandId: string) => {
    if (onSaveBrand) {
      onSaveBrand(brandId);
    } else {
      console.log(`Save brand ${brandId}`);
    }
  };

  const handleShareBrand = (brandId: string) => {
    if (onShareBrand) {
      onShareBrand(brandId);
    } else {
      console.log(`Share brand ${brandId}`);
    }
  };

  return (
    <Container>
      <Header variant="h2" id="featured-brands">Featured Brands</Header>
      <Cards
        cardDefinition={{
          header: item => (
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Icon name="external" size="medium" />
              <Header variant="h3">{item.name}</Header>
              {item.featured && <Badge color="red">Featured</Badge>}
            </SpaceBetween>
          ),
          sections: [
            {
              content: item => (
                <SpaceBetween size="s">
                  <Box>{item.description}</Box>
                  <Box color="text-body-secondary">
                    <em>"{item.story}"</em>
                  </Box>
                  <SpaceBetween direction="horizontal" size="s">
                    <Badge color="blue">{item.category}</Badge>
                    <Badge color="green">⭐ {item.rating}</Badge>
                    <Badge>{item.products} products</Badge>
                  </SpaceBetween>
                  <SpaceBetween direction="horizontal" size="s">
                    <Button 
                      variant="primary" 
                      iconName="external"
                      onClick={() => handleShopNow(item.id)}
                    >
                      Shop Now
                    </Button>
                    <Button 
                      variant="normal" 
                      iconName="heart"
                      onClick={() => handleSaveBrand(item.id)}
                    >
                      Save Brand
                    </Button>
                    <Button 
                      variant="normal" 
                      iconName="share"
                      onClick={() => handleShareBrand(item.id)}
                    >
                      Share
                    </Button>
                  </SpaceBetween>
                </SpaceBetween>
              )
            }
          ]
        }}
        items={brands}
        loadingText="Loading brands..."
      />
    </Container>
  );
}