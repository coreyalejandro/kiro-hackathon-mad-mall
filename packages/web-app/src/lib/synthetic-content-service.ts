// Synthetic Content Service - Integrates data generators with components
import { generateBulkData, generateCircle, generateProduct, generateStory, generateComedyClip, generateArticle } from './synthetic-data';
import { cotDataGenerator } from './cot-data-generator';

// Enhanced synthetic content with CoT reasoning and deduplication
export class SyntheticContentService {
  private static instance: SyntheticContentService;
  private cache: Map<string, any> = new Map();
  private usedContent: Map<string, Set<string>> = new Map(); // Track used content IDs
  private contentGenerators: Map<string, () => any> = new Map(); // Store generators for each type

  static getInstance(): SyntheticContentService {
    if (!SyntheticContentService.instance) {
      SyntheticContentService.instance = new SyntheticContentService();
    }
    return SyntheticContentService.instance;
  }

  constructor() {
    // Initialize content generators
    this.contentGenerators.set('circle', () => generateCircle());
    this.contentGenerators.set('product', () => generateProduct());
    this.contentGenerators.set('story', () => generateStory());
    this.contentGenerators.set('comedy', () => generateComedyClip());
    this.contentGenerators.set('article', () => generateArticle());
    
    // Initialize used content tracking
    this.usedContent.set('circles', new Set());
    this.usedContent.set('businesses', new Set());
    this.usedContent.set('stories', new Set());
    this.usedContent.set('comedy', new Set());
    this.usedContent.set('articles', new Set());
  }

  // Generate unique content ensuring no duplicates
  private generateUniqueContent(type: string, count: number, maxAttempts: number = 50): any[] {
    const used = this.usedContent.get(type) || new Set();
    const generator = this.contentGenerators.get(type);
    if (!generator) throw new Error(`No generator found for type: ${type}`);

    const uniqueContent: any[] = [];
    let attempts = 0;

    while (uniqueContent.length < count && attempts < maxAttempts) {
      const content = generator();
      const contentId = content.id || content.title || content.name || JSON.stringify(content);
      
      if (!used.has(contentId)) {
        used.add(contentId);
        uniqueContent.push(content);
      }
      attempts++;
    }

    // If we couldn't generate enough unique content, fill with what we have
    if (uniqueContent.length < count) {
      console.warn(`Could only generate ${uniqueContent.length} unique ${type} items out of ${count} requested`);
    }

    return uniqueContent;
  }

  // Generate culturally authentic peer circles
  async getPeerCircles(count: number = 12): Promise<any[]> {
    // Always generate fresh unique content to prevent repeats
    const circles = this.generateUniqueContent('circle', count);
    
    // Enhance with CoT reasoning for cultural authenticity
    const enhancedCircles = circles.map(circle => ({
      ...circle,
      culturalContext: {
        primaryAudience: 'Black women with Graves disease',
        culturalValues: ['sisterhood', 'resilience', 'community support'],
        authenticLanguage: true,
        inclusivePractices: true
      },
      engagement: {
        ...circle.engagement,
        culturalRelevance: Math.random() * 0.3 + 0.7, // 70-100% relevance
        communityTrust: Math.random() * 0.2 + 0.8 // 80-100% trust
      }
    }));

    return enhancedCircles;
  }

  // Generate culturally authentic business listings
  async getBusinesses(count: number = 8): Promise<any[]> {
    // Always generate fresh unique content to prevent repeats
    const products = this.generateUniqueContent('product', count);
    
    const businesses = products.map(product => ({
      id: product.id,
      name: product.business.name,
      owner: product.business.ownerName,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      rating: product.rating,
      reviews: product.reviewCount,
      isBlackOwned: product.business.isBlackOwned,
      story: product.business.story,
      tags: product.tags,
      affiliateUrl: product.affiliateUrl
    }));

    return businesses;
  }

  // Generate culturally authentic wellness stories
  async getWellnessStories(count: number = 6): Promise<any[]> {
    // Always generate fresh unique content to prevent repeats
    const stories = [];
    const themes = ['diagnosis', 'community', 'healing', 'advocacy', 'support', 'resilience', 'empowerment', 'wellness'];
    
    for (let i = 0; i < count; i++) {
      const theme = themes[i % themes.length];
      const cotStory = cotDataGenerator.generateStory(theme);
      stories.push({
        ...cotStory.data,
        culturalValidation: cotStory.culturalValidation,
        confidence: cotStory.confidence,
        reasoning: cotStory.reasoning
      });
    }

    return stories;
  }

  // Generate culturally authentic comedy content
  async getComedyContent(count: number = 8): Promise<any[]> {
    // Always generate fresh unique content to prevent repeats
    const comedyClips = [];
    for (let i = 0; i < count; i++) {
      const cotComedy = cotDataGenerator.generateComedyClip();
      comedyClips.push({
        ...cotComedy.data,
        culturalValidation: cotComedy.culturalValidation,
        confidence: cotComedy.confidence,
        reasoning: cotComedy.reasoning
      });
    }

    return comedyClips;
  }

  // Generate educational articles
  async getEducationalArticles(count: number = 5): Promise<any[]> {
    // Always generate fresh unique content to prevent repeats
    const articles = [];
    const topics = ['self-advocacy', 'nutrition', 'mental-health', 'workplace', 'family', 'medication', 'lifestyle', 'support-systems'];
    
    for (let i = 0; i < count; i++) {
      const topic = topics[i % topics.length];
      const cotArticle = cotDataGenerator.generateArticle(topic);
      articles.push({
        ...cotArticle.data,
        culturalValidation: cotArticle.culturalValidation,
        confidence: cotArticle.confidence,
        reasoning: cotArticle.reasoning
      });
    }

    return articles;
  }

  // Generate resource hub content
  async getResourceHubContent(): Promise<any> {
    const cacheKey = 'resource-hub';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const resources = {
      featured: [
        {
          title: 'Graves Disease Foundation',
          description: 'Comprehensive resources and support for Graves disease patients',
          url: 'https://www.thyroid.org/graves-disease/',
          category: 'Medical Information',
          isBlackOwned: false,
          culturalRelevance: 0.8
        },
        {
          title: 'Black Women\'s Health Imperative',
          description: 'Health advocacy and resources specifically for Black women',
          url: 'https://bwhi.org/',
          category: 'Health Advocacy',
          isBlackOwned: true,
          culturalRelevance: 1.0
        },
        {
          title: 'Thyroid Support Group - Sisters Circle',
          description: 'Peer support group for Black women with thyroid conditions',
          url: '#',
          category: 'Peer Support',
          isBlackOwned: true,
          culturalRelevance: 1.0
        }
      ],
      categories: [
        {
          name: 'Medical Resources',
          resources: [
            { title: 'Understanding Graves Disease', type: 'article', url: '#' },
            { title: 'Medication Guide', type: 'guide', url: '#' },
            { title: 'Finding the Right Doctor', type: 'article', url: '#' }
          ]
        },
        {
          name: 'Mental Health Support',
          resources: [
            { title: 'Coping with Chronic Illness', type: 'article', url: '#' },
            { title: 'Therapy Resources', type: 'directory', url: '#' },
            { title: 'Mindfulness for Healing', type: 'guide', url: '#' }
          ]
        },
        {
          name: 'Community & Advocacy',
          resources: [
            { title: 'Patient Advocacy Guide', type: 'guide', url: '#' },
            { title: 'Workplace Accommodations', type: 'article', url: '#' },
            { title: 'Family Education Materials', type: 'resource', url: '#' }
          ]
        }
      ]
    };

    this.cache.set(cacheKey, resources);
    return resources;
  }

  // Generate platform statistics
  async getPlatformStats(): Promise<any> {
    const cacheKey = 'platform-stats';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const stats = {
      totalMembers: 2847,
      activeCircles: 23,
      storiesShared: 156,
      businessesSupported: 45,
      comedyClips: 89,
      articlesPublished: 67,
      culturalAuthenticityScore: 0.94,
      communityTrustScore: 0.91,
      engagementRate: 0.78
    };

    this.cache.set(cacheKey, stats);
    return stats;
  }

  // Clear cache and reset used content tracking (useful for development)
  clearCache(): void {
    this.cache.clear();
    this.usedContent.forEach(usedSet => usedSet.clear());
  }

  // Reset used content tracking for a specific type
  resetUsedContent(type: string): void {
    const used = this.usedContent.get(type);
    if (used) {
      used.clear();
    }
  }

  // Get statistics about content generation
  getContentStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.usedContent.forEach((usedSet, type) => {
      stats[type] = usedSet.size;
    });
    return stats;
  }
}

// Export singleton instance
export const syntheticContentService = SyntheticContentService.getInstance();
