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

const blackOwnedBrands = [
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

export default function FeaturedBrands() {
  return (
    <Container>
      <Header variant="h2" id="featured-brands">Featured Brands</Header>
      <Cards
        cardDefinition={{
          header: item => (
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Icon name="shopping-cart" size="medium" />
              <Header variant="h3">{item.name}</Header>
              {item.featured && <Badge color="red">Featured</Badge>}
            </SpaceBetween>
          ),
          sections: [
            {
              content: item => (
                <SpaceBetween size="s">
                  <Box>{item.description}</Box>
                  <Box fontStyle="italic" color="text-body-secondary">
                    "{item.story}"
                  </Box>
                  <SpaceBetween direction="horizontal" size="s">
                    <Badge color="blue">{item.category}</Badge>
                    <Badge color="green">⭐ {item.rating}</Badge>
                    <Badge>{item.products} products</Badge>
                  </SpaceBetween>
                  <SpaceBetween direction="horizontal" size="s">
                    <Button variant="primary" iconName="external">
                      Shop Now
                    </Button>
                    <Button variant="normal" iconName="heart">
                      Save Brand
                    </Button>
                    <Button variant="normal" iconName="share">
                      Share
                    </Button>
                  </SpaceBetween>
                </SpaceBetween>
              )
            }
          ]
        }}
        items={blackOwnedBrands}
        loadingText="Loading brands..."
      />
    </Container>
  );
}