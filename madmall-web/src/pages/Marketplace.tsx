import React from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Icon,
  Grid,
  Input
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';



export default function Marketplace() {
  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>🛍️</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>💜</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>✨</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="Marketplace"
        title="Support Black-Owned Wellness"
        subtitle="Discover and support Black-owned wellness brands that understand your journey and celebrate your culture. Every purchase supports sisterhood and healing."
        primaryCTA={{
          text: "Shop Brands",
          onClick: () => document.getElementById('featured-brands')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "🛒"
        }}
        secondaryCTA={{
          text: "My Favorites",
          onClick: () => console.log('Show favorites'),
          icon: "💜"
        }}
        backgroundGradient="linear-gradient(135deg, var(--color-golden-ochre), var(--color-deep-amber), var(--color-dusty-rose))"
        floatingElements={floatingElements}
        imageContent={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Black-Owned Wellness<br />
              Support & Celebrate
            </div>
          </div>
        }
      />
      
      <SpaceBetween size="l">

      <Container>
        <Header variant="h2">Search Products</Header>
        <Box padding="l" className="kadir-nelson-secondary">
          <SpaceBetween size="s">
            <Input
              placeholder="Search for products, brands, wellness items..."
              type="search"
              value=""
              onChange={() => console.log('Search')}
            />
            <SpaceBetween direction="horizontal" size="s">
              <Button variant="normal" iconName="filter">💊 Supplements</Button>
              <Button variant="normal" iconName="filter">🍵 Wellness</Button>
              <Button variant="normal" iconName="filter">✨ Beauty</Button>
              <Button variant="normal" iconName="filter">🏃‍♀️ Fitness</Button>
              <Button variant="normal" iconName="filter">🛁 Self-Care</Button>
              <Button variant="normal" iconName="filter">🥗 Nutrition</Button>
            </SpaceBetween>
          </SpaceBetween>
        </Box>
      </Container>

      <Container>
        <Header variant="h2">Featured Products</Header>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {/* Supplements */}
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">💊</Box>
                <Header variant="h4">Thyroid Support Supplement</Header>
              </SpaceBetween>
              <Box>
                Natural supplements specifically formulated for Black women with thyroid conditions.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Supplements</Badge>
                <Badge color="green">⭐ 4.9</Badge>
                <Badge color="grey">$29.99</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="external"
                onClick={() => console.log('Shop Thyroid Support')}
              >
                Shop Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Wellness */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🍵</Box>
                <Header variant="h4">Calm Evening Tea Blend</Header>
              </SpaceBetween>
              <Box>
                Herbal tea blends designed to support thyroid health and reduce stress naturally.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Wellness</Badge>
                <Badge color="green">⭐ 4.8</Badge>
                <Badge color="grey">$19.99</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="external"
                onClick={() => console.log('Shop Tea Blend')}
              >
                Shop Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Beauty */}
          <Box padding="l" className="kadir-nelson-gradient-earth">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">✨</Box>
                <Header variant="h4">Gentle Skincare Set</Header>
              </SpaceBetween>
              <Box>
                Gentle skincare products for sensitive skin affected by thyroid medication.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Beauty</Badge>
                <Badge color="green">⭐ 4.7</Badge>
                <Badge color="grey">$45.99</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="external"
                onClick={() => console.log('Shop Skincare Set')}
              >
                Shop Now
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {/* Fitness */}
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🏃‍♀️</Box>
                <Header variant="h4">Low-Impact Workout Kit</Header>
              </SpaceBetween>
              <Box>
                Gentle fitness equipment designed for women managing chronic conditions.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Fitness</Badge>
                <Badge color="green">⭐ 4.6</Badge>
                <Badge color="grey">$39.99</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="external"
                onClick={() => console.log('Shop Workout Kit')}
              >
                Shop Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Self-Care */}
          <Box padding="l" className="kadir-nelson-secondary">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🛁</Box>
                <Header variant="h4">Relaxation Bath Set</Header>
              </SpaceBetween>
              <Box>
                Luxurious bath products infused with calming essential oils for stress relief.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Self-Care</Badge>
                <Badge color="green">⭐ 4.8</Badge>
                <Badge color="grey">$34.99</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="external"
                onClick={() => console.log('Shop Bath Set')}
              >
                Shop Now
              </Button>
            </SpaceBetween>
          </Box>

          {/* Nutrition */}
          <Box padding="l" className="kadir-nelson-accent">
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box fontSize="heading-l">🥗</Box>
                <Header variant="h4">Thyroid-Friendly Meal Kit</Header>
              </SpaceBetween>
              <Box>
                Nutritious meal ingredients specifically chosen to support thyroid health.
              </Box>
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Badge color="blue">Nutrition</Badge>
                <Badge color="green">⭐ 4.5</Badge>
                <Badge color="grey">$49.99</Badge>
              </SpaceBetween>
              <Button 
                variant="primary"
                iconName="external"
                onClick={() => console.log('Shop Meal Kit')}
              >
                Shop Now
              </Button>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>

      <Container>
        <Header variant="h2">Retail Therapy Corner</Header>
        <Box padding="l" className="kadir-nelson-secondary">
          <SpaceBetween size="s">
            <Header variant="h4">💜 Treat Yourself Today</Header>
            <Box>
              Sometimes a little retail therapy is exactly what we need. These carefully curated items 
              are perfect for those "I deserve something nice" moments.
            </Box>
            <SpaceBetween direction="horizontal" size="s">
              <Button size="small" variant="primary">Self-Care Sunday Kit</Button>
              <Button size="small">Comfort Collection</Button>
              <Button size="small">Energy Boost Bundle</Button>
            </SpaceBetween>
          </SpaceBetween>
        </Box>
      </Container>

      <Container>
        <Header variant="h2">Community Recommendations</Header>
        <Box padding="l" className="kadir-nelson-gradient-earth">
          <SpaceBetween size="s">
            <Box>
              <strong>Maya K.</strong> recommends <em>Sister Strength Teas</em>: "The Calm Evening blend has been a game-changer for my sleep! 🌙"
            </Box>
            <Box>
              <strong>Keisha R.</strong> loves <em>Crown & Glory Skincare</em>: "Finally found products that don't irritate my sensitive skin ✨"
            </Box>
            <Box>
              <strong>Sarah J.</strong> swears by <em>Melanin Wellness Co.</em>: "Their thyroid support supplement actually works - my energy is back! 💪"
            </Box>
          </SpaceBetween>
        </Box>
      </Container>
      </SpaceBetween>
    </div>
  );
}