import React, { useState } from 'react';
import {
  Container,
  Header,
  Cards,
  Button,
  SpaceBetween,
  Badge,
  Box,
  Input,
  Icon,
  Grid,
  Alert,
  Spinner
} from '@cloudscape-design/components';
import HeroSection from '../components/HeroSection';
import LoadingCard from '../components/LoadingCard';
import ToastNotification from '../components/ToastNotification';
import { useFeaturedResources, useResourceContent, useContentInteraction } from '../hooks/useApiData';


export default function ResourceHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });
  
  // API data hooks
  const { data: featuredResources, loading: featuredLoading, error: featuredError } = useFeaturedResources(4);
  const { data: allResources, loading: resourcesLoading, error: resourcesError } = useResourceContent(selectedCategory, 20);
  const { saveContent, likeContent, interacting } = useContentInteraction();

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleSave = async (resourceId: string, resourceTitle: string) => {
    try {
      await saveContent(resourceId, 'resource');
      showToast(`"${resourceTitle}" saved to your library! 📚`, 'success');
    } catch (error) {
      showToast('Failed to save resource', 'error');
    }
  };

  const handleLike = async (resourceId: string) => {
    try {
      await likeContent(resourceId, 'resource');
      showToast('Marked as helpful! 👍', 'success');
    } catch (error) {
      showToast('Failed to mark as helpful', 'error');
    }
  };

  const handleRead = (resourceTitle: string) => {
    showToast(`Opening "${resourceTitle}"... 📖`, 'info');
  };

  const filteredResources = allResources?.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];
  const floatingElements = [
    <div style={{ fontSize: '2rem', opacity: 0.6 }}>📚</div>,
    <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>💡</div>,
    <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>✨</div>
  ];

  return (
    <div>
      <HeroSection
        pageName="Resource Hub"
        title="Your Wellness Knowledge Hub"
        subtitle="Access curated health information, evidence-based wellness tips, and educational content from trusted sources. Knowledge is power on your healing journey."
        primaryCTA={{
          text: "Explore Resources",
          onClick: () => document.getElementById('featured-resources')?.scrollIntoView({ behavior: 'smooth' }),
          icon: "📖"
        }}
        secondaryCTA={{
          text: "My Saved Resources",
          onClick: () => console.log('Show saved resources'),
          icon: "🔖"
        }}
        backgroundGradient="linear-gradient(135deg, var(--color-sage-green), var(--color-deep-olive), var(--color-golden-ochre))"
        floatingElements={floatingElements}
        imageContent={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Knowledge & Wisdom<br />
              Evidence-Based Healing
            </div>
          </div>
        }
      />
      
      <SpaceBetween size="l">

      <ToastNotification
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <Container>
        <Header variant="h2">Search Resources</Header>
        <SpaceBetween size="m">
          <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
            <Input
              placeholder="Search for articles, guides, tips..."
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
              <option value="education">📚 Education</option>
              <option value="mental_health">🧠 Mental Health</option>
              <option value="nutrition">🥗 Nutrition</option>
              <option value="relationships">💕 Relationships</option>
              <option value="treatment">💊 Treatment</option>
            </select>
          </Grid>
          <SpaceBetween direction="horizontal" size="s">
            <Badge color="blue">{filteredResources.length} resources found</Badge>
            {searchQuery && (
              <Badge color="green">Searching: "{searchQuery}"</Badge>
            )}
            {selectedCategory && (
              <Badge color="purple">Category: {selectedCategory}</Badge>
            )}
          </SpaceBetween>
        </SpaceBetween>
      </Container>



      <Container>
        <Header variant="h2" id="featured-resources">Featured Resources</Header>
        {featuredError && (
          <Alert type="error">
            Failed to load featured resources. Please try again later.
          </Alert>
        )}
        {featuredLoading ? (
          <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
            <LoadingCard height="300px" />
            <LoadingCard height="300px" />
            <LoadingCard height="300px" />
            <LoadingCard height="300px" />
          </Grid>
        ) : (
          <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
            {featuredResources?.map((resource, index) => {
              const gradients = ['kadir-nelson-gradient-warm', 'kadir-nelson-gradient-sage', 'kadir-nelson-gradient-earth', 'kadir-nelson-accent'];
              const icons = {
                'education': '📚',
                'mental_health': '🧠',
                'nutrition': '🥗',
                'relationships': '💕',
                'treatment': '💊'
              };
              
              return (
                <Box key={resource.id} padding="l" className={gradients[index % 4]}>
                  <SpaceBetween size="m">
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Box fontSize="heading-l">{icons[resource.category] || '📚'}</Box>
                      <Header variant="h3">{resource.title}</Header>
                    </SpaceBetween>
                    <Box>
                      {resource.content.substring(0, 120)}...
                    </Box>
                    <Box fontSize="body-s">
                      By {resource.author}
                    </Box>
                    <SpaceBetween direction="horizontal" size="s" alignItems="center">
                      <Badge color="blue">{resource.category.replace('_', ' ')}</Badge>
                      <Badge color="grey">{resource.readTime}</Badge>
                      <Badge color="green">👍 {resource.helpfulCount} found helpful</Badge>
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="s">
                      <Button 
                        variant="primary"
                        iconName="external"
                        onClick={() => handleRead(resource.title)}
                      >
                        Read Article
                      </Button>
                      <Button 
                        variant="normal"
                        loading={interacting}
                        onClick={() => handleSave(resource.id, resource.title)}
                      >
                        Save 📚
                      </Button>
                      <Button 
                        variant="normal"
                        loading={interacting}
                        onClick={() => handleLike(resource.id)}
                      >
                        Helpful 👍
                      </Button>
                    </SpaceBetween>
                  </SpaceBetween>
                </Box>
              );
            })}
          </Grid>
        )}
      </Container>

      <Container>
        <Header variant="h2">Resource Library</Header>
        {resourcesError && (
          <Alert type="error">
            Failed to load resources. Please try again later.
          </Alert>
        )}
        {resourcesLoading ? (
          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <LoadingCard key={i} height="250px" />
            ))}
          </Grid>
        ) : filteredResources.length === 0 ? (
          <Box textAlign="center" padding="xl">
            <SpaceBetween size="m">
              <Box fontSize="heading-xl">📚</Box>
              <Header variant="h3">No resources found</Header>
              <Box>
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No resources available at the moment.'}
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
              header: item => (
                <SpaceBetween direction="horizontal" size="s" alignItems="center">
                  <Box fontSize="heading-m">
                    {item.category === 'education' ? '📚' :
                     item.category === 'mental_health' ? '🧠' :
                     item.category === 'nutrition' ? '🥗' :
                     item.category === 'relationships' ? '💕' :
                     item.category === 'treatment' ? '💊' : '📖'}
                  </Box>
                  <Header variant="h3">{item.title}</Header>
                </SpaceBetween>
              ),
              sections: [
                {
                  content: item => (
                    <SpaceBetween size="s">
                      <Box>{item.content.substring(0, 150)}...</Box>
                      <Box fontSize="body-s">By {item.author}</Box>
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Badge color="blue">{item.category.replace('_', ' ')}</Badge>
                        <Badge color="grey">{item.readTime}</Badge>
                        <Badge color="green">👍 {item.helpfulCount}</Badge>
                      </SpaceBetween>
                      <SpaceBetween direction="horizontal" size="s">
                        <Button 
                          variant="primary"
                          iconName="external"
                          onClick={() => handleRead(item.title)}
                        >
                          Read Article
                        </Button>
                        <Button 
                          variant="normal"
                          loading={interacting}
                          onClick={() => handleSave(item.id, item.title)}
                        >
                          Save 📚
                        </Button>
                        <Button 
                          variant="normal"
                          loading={interacting}
                          onClick={() => handleLike(item.id)}
                        >
                          Helpful 👍
                        </Button>
                      </SpaceBetween>
                    </SpaceBetween>
                  )
                }
              ]
            }}
            items={filteredResources}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 },
              { minWidth: 800, cards: 3 }
            ]}
          />
        )}
      </Container>

      <Container>
        <Header variant="h2">Quick Access Tools</Header>
        <SpaceBetween direction="horizontal" size="m">
          <Box padding="l" className="kadir-nelson-gradient-warm">
            <SpaceBetween size="s">
              <Header variant="h3">📋 Symptom Tracker</Header>
              <Box>Keep track of your symptoms and patterns</Box>
              <Button onClick={() => showToast('Symptom Tracker opening... 📋', 'info')}>
                Open Tracker
              </Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-gradient-sage">
            <SpaceBetween size="s">
              <Header variant="h3">💊 Medication Reminders</Header>
              <Box>Set up reminders for your medications</Box>
              <Button onClick={() => showToast('Medication Reminders setup opening... 💊', 'info')}>
                Set Reminders
              </Button>
            </SpaceBetween>
          </Box>
          
          <Box padding="l" className="kadir-nelson-secondary">
            <SpaceBetween size="s">
              <Header variant="h3">🏥 Find Doctors</Header>
              <Box>Locate thyroid specialists in your area</Box>
              <Button onClick={() => showToast('Doctor search opening... 🏥', 'info')}>
                Search Doctors
              </Button>
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Container>

      <Container>
        <Header variant="h2">Community Contributions</Header>
        <Box padding="l" className="kadir-nelson-gradient-earth">
          <SpaceBetween size="s">
            <Box>
              <strong>Maya K.</strong> shared: "This meditation technique from the anxiety guide really works! Try the 4-7-8 breathing method."
            </Box>
            <Box>
              <strong>Keisha R.</strong> recommended: "The nutrition guide helped me identify trigger foods. Feeling so much better!"
            </Box>
            <Box>
              <strong>Sarah J.</strong> added: "The support network article gave me the words to explain my condition to my family. Thank you!"
            </Box>
          </SpaceBetween>
        </Box>
      </Container>
      </SpaceBetween>
    </div>
  );
}