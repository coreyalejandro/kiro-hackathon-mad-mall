'use client';

import { useEffect, useState } from 'react';
import { Container, ContentLayout, Header, SpaceBetween, Button, Grid, Box, Badge, Cards } from '@cloudscape-design/components';
import { syntheticContentService } from '@/lib/synthetic-content-service';

export function ResourceHubContent() {
  const [resources, setResources] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const [resourcesData, articlesData] = await Promise.all([
          syntheticContentService.getResourceHubContent(),
          syntheticContentService.getEducationalArticles(5)
        ]);
        setResources(resourcesData);
        setArticles(articlesData);
      } catch (error) {
        console.error('Failed to load resources:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const handleAccessResource = (resourceTitle: string, resourceUrl: string) => {
    console.log(`Accessing resource: ${resourceTitle}`);
    if (resourceUrl.startsWith('http')) {
      window.open(resourceUrl, '_blank');
    } else {
      // TODO: Implement internal navigation
    }
  };

  if (loading) {
    return (
      <ContentLayout 
        header={
          <Header variant="h1" description="Access mental health resources and wellness tools">
            Resource Hub
          </Header>
        }
      >
        <Container>
          <Box textAlign="center" padding="xl">
            Loading resources...
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
          description="Access mental health resources and wellness tools"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="normal" iconName="external">Browse All</Button>
              <Button variant="primary" iconName="add-plus">Add Resource</Button>
            </SpaceBetween>
          }
        >
          Resource Hub
        </Header>
      }
    >
      <Container>
        <SpaceBetween size="l">
          {/* Featured Resources */}
          <Box>
            <Box variant="h2" margin={{ bottom: 'm' }}>
              Featured Resources
            </Box>
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
              {resources?.featured.map((resource: any) => (
                <Box
                  key={resource.title}
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
                        📚
                      </Box>
                    </Box>

                    <SpaceBetween size="s">
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        <Badge color={resource.isBlackOwned ? "green" : "blue"}>
                          {resource.isBlackOwned ? "Black-Owned" : "Community"}
                        </Badge>
                        <Badge color="grey">{resource.category}</Badge>
                      </SpaceBetween>
                      
                      <Box variant="h3" fontSize="heading-s" fontWeight="bold" margin={{ bottom: "xs" }}>
                        {resource.title}
                      </Box>
                      
                      <Box fontSize="body-s" color="text-body-secondary">
                        {resource.description}
                      </Box>
                    </SpaceBetween>

                    <Button 
                      variant="primary"
                      iconName="external"
                      onClick={() => handleAccessResource(resource.title, resource.url)}
                    >
                      Access Resource
                    </Button>
                  </SpaceBetween>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* Educational Articles */}
          <Box>
            <Box variant="h2" margin={{ bottom: 'm' }}>
              Educational Articles
            </Box>
            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
              {articles.map((article) => (
                <Box
                  key={article.id}
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
                        📖
                      </Box>
                    </Box>

                    <SpaceBetween size="s">
                      <Box variant="h3" fontSize="heading-s" fontWeight="bold" margin={{ bottom: "xs" }}>
                        {article.title}
                      </Box>
                      
                      <Box fontSize="body-s" color="text-body-secondary" margin={{ bottom: "s" }}>
                        by {article.author.name}
                      </Box>
                      
                      <Box fontSize="body-s" color="text-body-secondary" margin={{ bottom: "s" }}>
                        {article.description}
                      </Box>
                      
                      <SpaceBetween direction="horizontal" size="s" alignItems="center">
                        {article.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} color="blue">{tag}</Badge>
                        ))}
                      </SpaceBetween>
                      
                      <Box color="text-status-info" margin={{ bottom: "s" }}>
                        👀 {article.engagement?.views || article.bookmarkCount || 0} • ⭐ {article.rating || 0}
                      </Box>
                    </SpaceBetween>

                    <Button 
                      variant="primary"
                      onClick={() => handleAccessResource(article.title, '#')}
                    >
                      Read Article
                    </Button>
                  </SpaceBetween>
                </Box>
              ))}
            </Grid>
          </Box>
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}
