'use client';

import React from 'react';
import {
  Container,
  Header,
  Grid,
  Button,
  SpaceBetween,
  Badge,
  Box
} from '@cloudscape-design/components';
// import { Business } from '@madmall/shared-types';
import CommunityImage from './CommunityImage';

// Temporary type definition
interface Business {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  rating?: number;
}

interface FeaturedBusiness {
  id: number;
  name: string;
  owner: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  featured: boolean;
  blackOwned: boolean;
}

interface FeaturedBusinessesProps {
  businesses?: FeaturedBusiness[];
  onShopNow?: (businessId: number) => void;
}

const defaultFeaturedBusinesses: FeaturedBusiness[] = [
  {
    id: 1,
    name: "Melanin Wellness Co.",
    owner: "Dr. Aisha Thompson",
    description: "Natural thyroid support supplements formulated specifically for Black women's unique health needs.",
    category: "Supplements",
    rating: 4.9,
    reviews: 234,
    featured: true,
    blackOwned: true
  },
  {
    id: 2,
    name: "Sister's Self-Care Studio",
    owner: "Keisha Williams",
    description: "Handcrafted aromatherapy products and wellness rituals designed to reduce stress and promote healing.",
    category: "Self-Care",
    rating: 4.8,
    reviews: 156,
    featured: true,
    blackOwned: true
  },
  {
    id: 3,
    name: "Roots & Remedies",
    owner: "Amara Johnson",
    description: "Traditional herbal teas and natural remedies passed down through generations of Black healers.",
    category: "Herbal Medicine",
    rating: 4.9,
    reviews: 189,
    featured: true,
    blackOwned: true
  }
];

export default function FeaturedBusinesses({ 
  businesses = defaultFeaturedBusinesses,
  onShopNow
}: FeaturedBusinessesProps) {
  const handleShopNow = (businessId: number, businessName: string) => {
    if (onShopNow) {
      onShopNow(businessId);
    } else {
      console.log(`Shop ${businessName}`);
    }
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Box textAlign="center">
          <Header variant="h2" className="text-rich-umber">
            Featured Black-Owned Wellness Brands
          </Header>
          <Box color="text-body-secondary" fontSize="body-s">
            Supporting businesses that understand and celebrate our community
          </Box>
        </Box>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {businesses.map((business) => (
            <Box
              key={business.id}
              variant="div"
              padding="m"
            >
              <SpaceBetween size="m">
                <Box textAlign="center">
                  <CommunityImage 
                    category="lifestyle"
                    size="medium"
                    rounded={false}
                    overlay={true}
                    overlayText={`Shop ${business.name}`}
                    style={{ 
                      margin: '0 auto',
                      borderRadius: '12px',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </Box>

                <SpaceBetween size="s">
                  <SpaceBetween direction="horizontal" size="s" alignItems="center">
                    <Badge color="green">Black-Owned</Badge>
                    <Badge color="grey">{business.category}</Badge>
                  </SpaceBetween>
                  
                  <Box variant="h3" fontSize="heading-s" fontWeight="bold" margin={{ bottom: "xs" }}>
                    {business.name}
                  </Box>
                  
                  <Box 
                    fontSize="body-s"
                    color="text-body-secondary"
                    margin={{ bottom: "s" }}
                  >
                    Founded by {business.owner}
                  </Box>
                  
                  <Box fontSize="body-s" color="text-body-secondary">
                    {business.description}
                  </Box>
                  
                  <Box color="text-status-info" margin={{ bottom: "s" }}>
                    ⭐ {business.rating} ({business.reviews} reviews)
                  </Box>
                </SpaceBetween>

                <Button 
                  variant="primary"
                  onClick={() => handleShopNow(business.id, business.name)}
                >
                  Shop Now
                </Button>
              </SpaceBetween>
            </Box>
          ))}
        </Grid>
      </SpaceBetween>
    </Container>
  );
}
