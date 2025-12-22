'use client';

import React from 'react';
import {
  Box,
  Button,
  SpaceBetween,
  Badge,
  Link
} from '@cloudscape-design/components';
import CommunityImage from './CommunityImage';

export interface MarketplaceCardProps {
  id: string | number;
  name: string;
  owner: string;
  description: string;
  category: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  blackOwned?: boolean;
  featured?: boolean;
  href?: string;
  onShopNow?: (businessId: string | number, businessName: string) => void;
  className?: string;
}

/**
 * MarketplaceCard - A reusable card component for displaying businesses in the Marketplace/Mall
 * 
 * Features:
 * - Displays business information with image, badges, and ratings
 * - Supports "Shop Now" action
 * - Responsive design with Cloudscape components
 * - Black-owned business highlighting
 */
export function MarketplaceCard({
  id,
  name,
  owner,
  description,
  category,
  rating = 0,
  reviews = 0,
  imageUrl,
  blackOwned = true,
  featured = false,
  href,
  onShopNow,
  className = ''
}: MarketplaceCardProps) {
  const handleShopNow = () => {
    if (onShopNow) {
      onShopNow(id, name);
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <Box
      className={`marketplace-card ${className}`}
      variant="div"
      padding="m"
      style={{
        borderRadius: '12px',
        border: '1px solid var(--color-border-divider-default, #e0e0e0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        backgroundColor: 'var(--color-background-container, #ffffff)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <SpaceBetween size="m" direction="vertical">
        {/* Image Section */}
        <Box textAlign="center">
          {imageUrl ? (
            <Box
              variant="div"
              style={{
                width: '100%',
                height: '200px',
                borderRadius: '8px',
                overflow: 'hidden',
                margin: '0 auto',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
          ) : (
            <CommunityImage 
              category="lifestyle"
              size="medium"
              rounded={true}
              overlay={featured}
              overlayText={featured ? 'Featured' : undefined}
              style={{ 
                margin: '0 auto',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
              }}
            />
          )}
        </Box>

        {/* Badges Section */}
        <SpaceBetween direction="horizontal" size="s" alignItems="center">
          {blackOwned && (
            <Badge color="green">Black-Owned</Badge>
          )}
          <Badge color="grey">{category}</Badge>
          {featured && (
            <Badge color="blue">Featured</Badge>
          )}
        </SpaceBetween>

        {/* Business Info Section */}
        <SpaceBetween size="s" direction="vertical">
          <Box 
            variant="h3" 
            fontSize="heading-s" 
            fontWeight="bold" 
            margin={{ bottom: "xs" }}
            color="text-heading-default"
          >
            {name}
          </Box>
          
          <Box 
            fontSize="body-s"
            color="text-body-secondary"
            margin={{ bottom: "xs" }}
          >
            Founded by {owner}
          </Box>
          
          <Box 
            fontSize="body-s" 
            color="text-body-secondary"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: '60px'
            }}
          >
            {description}
          </Box>

          {/* Rating Section */}
          {rating > 0 && (
            <Box 
              color="text-status-info" 
              margin={{ top: "xs", bottom: "s" }}
              fontSize="body-s"
            >
              ⭐ {rating.toFixed(1)} {reviews > 0 && `(${reviews} reviews)`}
            </Box>
          )}
        </SpaceBetween>

        {/* Action Button */}
        <Button 
          variant="primary"
          onClick={handleShopNow}
          fullWidth={true}
          iconName="external"
        >
          Shop Now
        </Button>
      </SpaceBetween>
    </Box>
  );
}

export default MarketplaceCard;

