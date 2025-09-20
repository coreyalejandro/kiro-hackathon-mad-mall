'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout, Header, SpaceBetween, Button, Grid, Box, Badge } from '@cloudscape-design/components';
import { syntheticContentService } from '@/lib/synthetic-content-service';

export function MarketplaceContent() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const businessesData = await syntheticContentService.getBusinesses(8);
        setBusinesses(businessesData);
      } catch (error) {
        console.error('Failed to load businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const handleShopNow = (businessId: string, businessName: string) => {
    console.log(`Shopping at: ${businessName} (${businessId})`);
    // TODO: Implement actual shopping functionality
  };

  if (loading) {
    return (
      <ContentLayout 
        header={
          <Header variant="h1" description="Discover wellness products and services from community businesses">
            Marketplace
          </Header>
        }
      >
        <Container>
          <Box textAlign="center" padding="xl">
            Loading businesses...
          </Box>
        </Container>
      </ContentLayout>
    );
  }

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
          Featured Black-Owned Businesses
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
                  <Box
                    variant="div"
                    padding="l"
                    textAlign="center"
                    color="text-status-info"
                    fontSize="display-l"
                  >
                    🏪
                  </Box>
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
      </Container>
    </ContentLayout>
  );
}
