import { useState } from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Grid,
  Input,
  Alert
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import LoadingCard from '../components/LoadingCard';
import ToastNotification from '../components/ToastNotification';
import FeaturedBusinesses from '../components/FeaturedBusinesses';
import { useFeaturedProducts, useProductReviews, useContentInteraction } from '../hooks/useApiData';

// Type definitions
interface Product {
  id: string;
  productName: string;
  brand: string;
  reviewContent: string;
  category: string;
  rating: number;
  price: string;
  culturalRelevance?: string[];
  verifiedPurchase?: boolean;
}

type ToastType = 'info' | 'success' | 'error' | 'warning';



export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({ 
    show: false, 
    message: '', 
    type: 'info' 
  });
  
  // API data hooks
  const { data: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts(6);
  const { data: allProducts, loading: productsLoading, error: productsError } = useProductReviews(selectedCategory, 20);
  const { saveContent, interacting } = useContentInteraction();

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleSave = async (productId: string, productName: string) => {
    try {
      await saveContent(productId, 'product');
      showToast(`${productName} saved to wishlist! 💝`, 'success');
    } catch (error) {
      showToast('Failed to save product', 'error');
    }
  };

  const handleShop = (productName: string, brand: string) => {
    showToast(`Redirecting to ${brand} for ${productName}... 🛒`, 'info');
  };

  const filteredProducts = allProducts?.filter((product: Product) => {
    const matchesSearch = !searchQuery || 
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.reviewContent.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>🛍️</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>💜</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>✨</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="marketplace"
        title="Support Black-Owned Wellness"
        subtitle="Discover and support Black-owned wellness brands that understand your journey and celebrate your culture. Every purchase supports sisterhood and healing."
        variant="contained"
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
        bentoBoxes={[
          {
            title: "89 Featured Brands",
            content: "Curated Black-owned wellness businesses",
            icon: "🏪",
            action: () => document.getElementById('featured-brands')?.scrollIntoView({ behavior: 'smooth' }),
            size: 'medium'
          },
          {
            title: "Melanin Wellness Co.",
            content: "Featured brand: Natural thyroid support supplements",
            icon: "💊",
            action: () => console.log('View featured brand'),
            size: 'large'
          }
        ]}
      />
      
      <SpaceBetween size="l">

      <ToastNotification
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber">Search Products</Header>
        <SpaceBetween size="m">
          <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
            <Input
              placeholder="Search for products, brands, wellness items..."
              type="search"
              value={searchQuery}
              onChange={({ detail }) => setSearchQuery(detail.value)}
            />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            >
              <option value="">All Categories</option>
              <option value="Supplements">💊 Supplements</option>
              <option value="Wellness">🍵 Wellness</option>
              <option value="Skincare">✨ Beauty</option>
              <option value="Fitness">🏃‍♀️ Fitness</option>
              <option value="Self-Care">🛁 Self-Care</option>
              <option value="Nutrition">🥗 Nutrition</option>
            </select>
          </Grid>
          <SpaceBetween direction="horizontal" size="s">
            <Badge color="blue">{filteredProducts.length} products found</Badge>
            {searchQuery && (
              <Badge color="green">Searching: "{searchQuery}"</Badge>
            )}
            {selectedCategory && (
              <Badge color="blue">Category: {selectedCategory}</Badge>
            )}
          </SpaceBetween>
        </SpaceBetween>
          </div>
      </Container>

      <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber">Featured Products</Header>
        {featuredError && (
          <Alert type="error">
            Failed to load featured products. Please try again later.
          </Alert>
        )}
        {featuredLoading ? (
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }, { colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <LoadingCard key={i} height="280px" />
            ))}
          </Grid>
        ) : (
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }, { colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {featuredProducts?.map((product: Product, index: number) => {
              const gradients = [
                'kadir-nelson-gradient-warm', 'kadir-nelson-gradient-sage', 'kadir-nelson-gradient-earth',
                'kadir-nelson-accent', 'kadir-nelson-secondary', 'kadir-nelson-gradient-warm'
              ];
              const icons: { [key: string]: string } = {
                'Supplements': '💊',
                'Skincare': '✨',
                'Wellness': '🍵',
                'Self-Care': '🛁',
                'Fitness': '🏃‍♀️',
                'Nutrition': '🥗'
              };
              
              return (
                <Box key={product.id} padding="l">
                  <SpaceBetween size="m">
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Box fontSize="heading-l">{icons[product.category] || '✨'}</Box>
                      <Header variant="h3">{product.productName}</Header>
                    </SpaceBetween>
                    <Box>
                      {product.brand} - {product.reviewContent.substring(0, 80)}...
                    </Box>
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Badge color="grey">⭐ {product.rating}/5</Badge>
                      <Badge color="grey">{product.price}</Badge>
                      {product.culturalRelevance?.includes('black_owned') && (
                        <Badge color="blue">Black-owned</Badge>
                      )}
                      {product.verifiedPurchase && (
                        <Badge color="green">Verified</Badge>
                      )}
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="s">
                      <Button 
                        variant="primary"
                        iconName="external"
                        onClick={() => handleShop(product.productName, product.brand)}
                      >
                        Shop Now
                      </Button>
                      <Button 
                        variant="normal"
                        loading={interacting}
                        onClick={() => handleSave(product.id, product.productName)}
                      >
                        Save 💝
                      </Button>
                    </SpaceBetween>
                  </SpaceBetween>
                </Box>
              );
            })}
          </Grid>
        )}
        </div>
      </Container>

      <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber">Product Collection</Header>
        {productsError && (
          <Alert type="error">
            Failed to load products. Please try again later.
          </Alert>
        )}
        {productsLoading ? (
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <LoadingCard key={i} height="250px" />
            ))}
          </Grid>
        ) : filteredProducts.length === 0 ? (
          <Box textAlign="center" padding="xl">
            <SpaceBetween size="m">
              <Box fontSize="heading-xl">🛍️</Box>
              <Header variant="h3">No products found</Header>
              <Box>
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No products available at the moment.'}
              </Box>
              <Button 
                variant="primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
              >
                Clear Filters
              </Button>
            </SpaceBetween>
          </Box>
        ) : (
          <Cards
            cardDefinition={{
              header: (item: Product) => (
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-m">
                    {item.category === 'Supplements' ? '💊' :
                     item.category === 'Skincare' ? '✨' :
                     item.category === 'Wellness' ? '🍵' :
                     item.category === 'Self-Care' ? '🛁' :
                     item.category === 'Fitness' ? '🏃‍♀️' :
                     item.category === 'Nutrition' ? '🥗' : '🛍️'}
                  </Box>
                  <Header variant="h3">{item.productName}</Header>
                </SpaceBetween>
              ),
              sections: [
                {
                  content: (item: Product) => (
                    <SpaceBetween size="s">
                      <Box><strong>{item.brand}</strong></Box>
                      <Box>{item.reviewContent.substring(0, 120)}...</Box>
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Badge color="grey">⭐ {item.rating}/5</Badge>
                        <Badge color="grey">{item.price}</Badge>
                        <Badge color="blue">{item.category}</Badge>
                        {item.culturalRelevance?.includes('black_owned') && (
                          <Badge color="green">Black-owned</Badge>
                        )}
                      </SpaceBetween>
                      <SpaceBetween direction="horizontal" size="s">
                        <Button 
                          variant="primary"
                          iconName="external"
                          onClick={() => handleShop(item.productName, item.brand)}
                        >
                          Shop Now
                        </Button>
                        <Button 
                          variant="normal"
                          loading={interacting}
                          onClick={() => handleSave(item.id, item.productName)}
                        >
                          Save 💝
                        </Button>
                      </SpaceBetween>
                    </SpaceBetween>
                  )
                }
              ]
            }}
            items={filteredProducts}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 },
              { minWidth: 800, cards: 3 }
            ]}
          />
        )}
        </div>
      </Container>

      <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber">Retail Therapy Corner</Header>
        <Box padding="l">
          <SpaceBetween size="s">
            <Header variant="h3">💜 Treat Yourself Today</Header>
            <Box>
              Sometimes a little retail therapy is exactly what we need. These carefully curated items 
              are perfect for those "I deserve something nice" moments.
            </Box>
            <SpaceBetween direction="horizontal" size="s">
              <Button variant="primary" onClick={() => showToast('Self-Care Sunday Kit added to cart! 🛒', 'success')}>
                Self-Care Sunday Kit
              </Button>
              <Button onClick={() => showToast('Comfort Collection added to cart! 🛒', 'success')}>
                Comfort Collection
              </Button>
              <Button onClick={() => showToast('Energy Boost Bundle added to cart! 🛒', 'success')}>
                Energy Boost Bundle
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </Box>
        </div>
      </Container>

      <Container>
          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <Header variant="h2" className="text-rich-umber">Community Recommendations</Header>
        <Box padding="l">
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
        </div>
      </Container>

      <FeaturedBusinesses />
      </SpaceBetween>
    </div>
  );
}