}import React, { useState } from 'react';
import { Container, ContentLayout } from '@cloudscape-design/components'; // Make sure to import the correct component library.
import './ComedyLounge.css'; // Assuming you have an accompanying CSS file for styles.

const ComedyLounge = ({ clips }) => {
  const [currentClip, setCurrentClip] = useState(null);
  const [showRating, setShowRating] = useState(false);

  const handleRate = (rating) => {
    // Logic for handling the rating submission
    console.log(`Rating submitted for "${currentClip.title}": ${rating}`);
    setShowRating(false);
    setCurrentClip(null);
  };

  return (
    <ContentLayout>
      <Container>
        <div className="hero-section hero-contained">
          <div className="hero-container">
            <div className="hero-main-grid">
              <div className="hero-content">
                <div className="hero-page-name">Wellness Through Laughter</div>
                <h1 className="hero-title">Comedy Lounge</h1>
                <p className="hero-subtitle">
                  Discover the healing power of laughter and share moments of joy with our community.
                </p>
                <div className="hero-cta-group">
                  <button className="hero-cta hero-cta-primary">
                    <span className="hero-cta-icon">😄</span>
                    Watch Comedy
                  </button>
                  <button className="hero-cta hero-cta-secondary">
                    <span className="hero-cta-icon">🎭</span>
                    Share a Laugh
                  </button>
                </div>
              </div>
              <div className="hero-visual-container">
                <div className="hero-image-container">
                  <div className="hero-image-layer hero-image-main">
                    {/* Optional: Placeholder for the main image, you can add a specific image component here */}
                  </div>
                </div>
              </div>
            </div>

            {/* Display clips if available */}
            <div className="clips-container">
              {clips.length > 0 ? (
                clips.map((clip) => (
                  <div key={clip.id} className="clip">
                    <h2>{clip.title}</h2>
                    <p>{clip.description}</p>
                    <button onClick={() => {
                      setCurrentClip(clip);
                      setShowRating(true);
                    }}>
                      Rate This Clip
                    </button>
                  </div>
                ))
              ) : (
                <p>No clips available at the moment.</p>
              )}
            </div>

            {/* Rating Modal or UI could be implemented here based on showRating */}
            {showRating && currentClip && (
              <div className="rating-modal">
                <h2>Rate {currentClip.title}</h2>
                <div>
                  <button onClick={() => handleRate(1)}>😞</button>
                  <button onClick={() => handleRate(3)}>😐</button>
                  <button onClick={() => handleRate(5)}>😄</button>
                </div>
                <button onClick={() => setShowRating(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </ContentLayout>
  );
};

export default ComedyLounge;