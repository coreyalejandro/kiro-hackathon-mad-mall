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
import HeroSection from '../components/HeroSection';
import FeaturedBrands from '../components/FeaturedBrands';


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

      <FeaturedBrands />

      <Container>
        <Header variant="h2">Categories</Header>
        <SpaceBetween direction="horizontal" size="s">
          <Button variant="normal" iconName="filter">Supplements</Button>
          <Button variant="normal" iconName="filter">Wellness</Button>
          <Button variant="normal" iconName="filter">Beauty</Button>
          <Button variant="normal" iconName="filter">Fitness</Button>
          <Button variant="normal" iconName="filter">Self-Care</Button>
          <Button variant="normal" iconName="filter">Nutrition</Button>
        </SpaceBetween>
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