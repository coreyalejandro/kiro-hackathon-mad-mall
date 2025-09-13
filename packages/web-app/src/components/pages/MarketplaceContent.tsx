'use client';

import { useEffect, useState } from 'react';
import { Container, Header, ContentLayout } from '@cloudscape-design/components';
import { api } from '@/lib/mock-api';
import { Product } from '@/lib/types';

export function MarketplaceContent() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts().then(res => setProducts(res.data));
  }, []);

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Discover wellness products and services from community businesses"
        >
          Marketplace
        </Header>
      }
    >
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Community Commerce</div>
                <h1 className="hero-title">Marketplace</h1>
                <p className="hero-subtitle">
                  Support community businesses and discover wellness products and services.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">🛍️</span>
                    Browse Products
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">🏪</span>
                    List Business
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    <div className="hero-default-content">
                      <div className="hero-default-icon">🏬</div>
                      <div className="hero-default-text">
                        Community<br />Marketplace
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2>Popular Products</h2>
          <ul>
            {products.slice(0, 5).map(p => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </div>
      </Container>
    </ContentLayout>
  );
}