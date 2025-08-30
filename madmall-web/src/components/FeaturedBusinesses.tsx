import {
  Container,
  Header,
  Grid,
  Button,
  SpaceBetween,
  Badge,
  Box
} from '@cloudscape-design/components';
import CommunityImage from './CommunityImage';

const featuredBusinesses = [
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

export default function FeaturedBusinesses() {
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
          {featuredBusinesses.map((business) => (
            <div 
              key={business.id}
              className="kadir-nelson-gradient-sage"
              style={{ 
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                padding: '1.5rem'
              }}
            >
              <SpaceBetween size="m">
                <Box textAlign="center">
                  <CommunityImage 
                    category="lifestyle"
                    type="success"
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
                  
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                    {business.name}
                  </div>
                  
                  <div 
                    style={{ 
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontStyle: 'italic',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Founded by {business.owner}
                  </div>
                  
                  <div 
                    style={{ 
                      fontSize: '1rem',
                      color: 'white',
                      lineHeight: '1.5',
                      marginBottom: '1rem'
                    }}
                  >
                    {business.description}
                  </div>
                  
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
                    ⭐ {business.rating} ({business.reviews} reviews)
                  </div>
                </SpaceBetween>

                <Button 
                  variant="primary"
                  onClick={() => console.log(`Shop ${business.name}`)}
                >
                  Shop Now
                </Button>
              </SpaceBetween>
            </div>
          ))}
        </Grid>
      </SpaceBetween>
    </Container>
  );
}