/**
 * Mock Data Service for Lambda Handlers
 * TypeScript version of the mock data service for use in Lambda functions
 * Provides realistic synthetic data generated using CoT-Self-Instruct methodology
 */

interface UserStory {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  type: string;
  themes?: string[];
  tags?: string[];
  circleId?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
    helpfulVotes: number;
  };
  metadata?: {
    readTime: number;
    wordCount: number;
    culturalElements: string[];
    therapeuticValue: string[];
    triggerWarnings?: string[];
    ageAppropriate: boolean;
  };
  moderationNotes?: string;
  featuredAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComedyContent {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  category: string;
  tags?: string[];
  contentType: string;
  culturalStyle: string;
  appropriatenessRating: string;
  likes: number;
  shares: number;
  views: number;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  circleId: string;
  tags?: string[];
  replies: number;
  lastActivity: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Resource {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  category: string;
  tags?: string[];
  readTime: number;
  difficulty: string;
  culturalRelevance: string[];
  therapeuticValue: string[];
  views: number;
  saves: number;
  helpfulVotes: number;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  businessId?: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price?: {
    amount: number;
    currency: string;
    originalPrice?: number;
    discountPercentage?: number;
  };
  images?: string[];
  specifications?: Record<string, string>;
  ingredients?: string[];
  benefits?: string[];
  culturalRelevance?: string[];
  certifications?: string[];
  availability?: {
    inStock: boolean;
    quantity?: number;
    restockDate?: string;
  };
  shipping?: {
    freeShipping: boolean;
    shippingCost?: number;
    estimatedDelivery: string;
    internationalShipping: boolean;
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    bio?: string;
    culturalBackground: string[];
    communicationStyle: string;
    diagnosisStage: string;
    supportNeeds: string[];
    location?: {
      city: string;
      state: string;
      country: string;
    };
    joinDate: string;
    lastActive: string;
  };
  preferences?: {
    profileVisibility: string;
    showRealName: boolean;
    allowDirectMessages: boolean;
    shareHealthJourney: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    circleNotifications: boolean;
    contentPreferences: string[];
    circleInterests: string[];
  };
  settings?: {
    theme: string;
    language: string;
    timezone: string;
    accessibility?: {
      highContrast: boolean;
      largeText: boolean;
      screenReader: boolean;
      reducedMotion: boolean;
    };
  };
  primaryGoals?: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  stats?: {
    storiesShared: number;
    circlesJoined: number;
    commentsPosted: number;
    helpfulVotes: number;
    daysActive: number;
    streakDays: number;
  };
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score?: number;
  metadata?: Record<string, any>;
  url?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export class MockDataService {
  private data: any = null;
  private initialized: boolean = false;

  /**
   * Initialize the data service with generated content
   */
  async initialize(): Promise<any> {
    if (this.initialized) return this.data;
    
    console.log('🚀 Initializing Mock Data Service with CoT-Self-Instruct...');
    
    // Generate mock data (simplified version for Lambda)
    this.data = this.generateMockData();
    this.initialized = true;
    
    console.log('📊 Generated data summary:', {
      userStories: this.data.userStories.length,
      comedyContent: this.data.comedyContent.length,
      peerDiscussions: this.data.peerDiscussions.length,
      resourceArticles: this.data.resourceArticles.length,
      productReviews: this.data.productReviews.length,
      userProfiles: this.data.userProfiles.length
    });
    
    return this.data;
  }

  private generateMockData() {
    const now = new Date().toISOString();
    
    return {
      userStories: this.generateUserStories(),
      comedyContent: this.generateComedyContent(),
      peerDiscussions: this.generateDiscussions(),
      resourceArticles: this.generateResources(),
      productReviews: this.generateProducts(),
      userProfiles: this.generateUserProfiles()
    };
  }

  private generateUserStories(): UserStory[] {
    return [
      {
        id: 'story-1',
        title: 'Finding Strength in Community',
        content: 'When I was first diagnosed, I felt so alone. But finding this community changed everything...',
        excerpt: 'A story about finding hope and support in unexpected places.',
        author: {
          id: 'user-1',
          displayName: 'Maya Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          isVerified: true
        },
        type: 'personal_experience',
        themes: ['community', 'support', 'healing'],
        tags: ['inspiration', 'community'],
        engagement: {
          likes: 45,
          comments: 12,
          shares: 8,
          saves: 23,
          views: 156,
          helpfulVotes: 34
        },
        metadata: {
          readTime: 5,
          wordCount: 450,
          culturalElements: ['African American experience'],
          therapeuticValue: ['emotional support', 'community building'],
          ageAppropriate: true
        },
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'story-2',
        title: 'My Journey with Traditional Healing',
        content: 'Combining modern medicine with ancestral wisdom has been transformative...',
        excerpt: 'Exploring the balance between traditional and modern approaches to wellness.',
        author: {
          id: 'user-2',
          displayName: 'Keisha Williams',
          avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
          isVerified: true
        },
        type: 'advice_sharing',
        themes: ['traditional healing', 'wellness', 'culture'],
        tags: ['healing', 'tradition', 'wellness'],
        engagement: {
          likes: 67,
          comments: 18,
          shares: 15,
          saves: 41,
          views: 203,
          helpfulVotes: 52
        },
        metadata: {
          readTime: 7,
          wordCount: 620,
          culturalElements: ['Traditional African healing', 'Holistic wellness'],
          therapeuticValue: ['cultural healing', 'integrative medicine'],
          ageAppropriate: true
        },
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private generateComedyContent(): ComedyContent[] {
    return [
      {
        id: 'comedy-1',
        title: 'When Your Doctor Says "It\'s Just Stress"',
        content: 'You know that look doctors give you when they can\'t figure out what\'s wrong? *mimics doctor face*',
        author: {
          id: 'user-3',
          displayName: 'Marcus Thompson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          isVerified: true
        },
        category: 'Healthcare Humor',
        tags: ['doctors', 'stress', 'relatable'],
        contentType: 'stand-up',
        culturalStyle: 'observational',
        appropriatenessRating: 'family-friendly',
        likes: 89,
        shares: 34,
        views: 245,
        isFeatured: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private generateDiscussions(): Discussion[] {
    return [
      {
        id: 'discussion-1',
        title: 'Best Apps for Meditation and Mindfulness',
        content: 'I\'ve been trying different meditation apps and wanted to share what\'s working for me...',
        author: {
          id: 'user-4',
          displayName: 'Jasmine Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          isVerified: false
        },
        circleId: 'circle-wellness',
        tags: ['meditation', 'apps', 'mindfulness'],
        replies: 23,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isPinned: false,
        isLocked: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private generateResources(): Resource[] {
    return [
      {
        id: 'resource-1',
        title: 'Understanding Cultural Trauma and Healing',
        content: 'Cultural trauma affects entire communities and can be passed down through generations...',
        excerpt: 'A comprehensive guide to understanding and addressing cultural trauma.',
        author: {
          id: 'expert-1',
          displayName: 'Dr. Aisha Patel',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
          isVerified: true
        },
        category: 'Mental Health',
        tags: ['trauma', 'culture', 'healing', 'therapy'],
        readTime: 12,
        difficulty: 'intermediate',
        culturalRelevance: ['Cultural competency', 'Trauma-informed care'],
        therapeuticValue: ['education', 'awareness', 'healing'],
        views: 456,
        saves: 78,
        helpfulVotes: 92,
        isFeatured: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private generateProducts(): Product[] {
    return [
      {
        id: 'product-1',
        businessId: 'business-1',
        name: 'Ancestral Healing Tea Blend',
        description: 'A carefully crafted blend of traditional herbs used for centuries in African healing practices.',
        category: 'Wellness Products',
        subcategory: 'Herbal Teas',
        price: {
          amount: 24.99,
          currency: 'USD',
          originalPrice: 29.99,
          discountPercentage: 17
        },
        images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'],
        ingredients: ['Rooibos', 'Honeybush', 'African Potato', 'Buchu'],
        benefits: ['Stress relief', 'Digestive support', 'Immune boost'],
        culturalRelevance: ['Traditional African medicine', 'Ancestral wisdom'],
        certifications: ['Organic', 'Fair Trade'],
        availability: {
          inStock: true,
          quantity: 50
        },
        shipping: {
          freeShipping: true,
          estimatedDelivery: '3-5 business days',
          internationalShipping: false
        },
        rating: 4.8,
        reviewCount: 127,
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private generateUserProfiles(): UserProfile[] {
    return [
      {
        id: 'user-1',
        email: 'maya.johnson@example.com',
        profile: {
          firstName: 'Maya',
          lastName: 'Johnson',
          bio: 'Wellness advocate and community builder passionate about holistic healing.',
          culturalBackground: ['African American'],
          communicationStyle: 'gentle_encouraging',
          diagnosisStage: 'managing_well',
          supportNeeds: ['emotional_support', 'community_connection'],
          location: {
            city: 'Atlanta',
            state: 'GA',
            country: 'USA'
          },
          joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        preferences: {
          profileVisibility: 'circles_only',
          showRealName: true,
          allowDirectMessages: true,
          shareHealthJourney: true,
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true,
          circleNotifications: true,
          contentPreferences: ['wellness', 'community', 'healing'],
          circleInterests: ['support_groups', 'wellness_focus']
        },
        settings: {
          theme: 'auto',
          language: 'en',
          timezone: 'America/New_York',
          accessibility: {
            highContrast: false,
            largeText: false,
            screenReader: false,
            reducedMotion: false
          }
        },
        primaryGoals: ['emotional_support', 'community_connection'],
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        version: 1,
        stats: {
          storiesShared: 3,
          circlesJoined: 5,
          commentsPosted: 47,
          helpfulVotes: 89,
          daysActive: 156,
          streakDays: 12
        }
      }
    ];
  }

  /**
   * Get user stories for Story Booth
   */
  async getUserStories(limit: number = 10): Promise<UserStory[]> {
    await this.initialize();
    return this.data.userStories
      .sort((a: UserStory, b: UserStory) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get featured stories (highest engagement)
   */
  async getFeaturedStories(limit: number = 3): Promise<UserStory[]> {
    await this.initialize();
    return this.data.userStories
      .sort((a: UserStory, b: UserStory) => {
        const aEngagement = (a.engagement?.likes || 0) + (a.engagement?.comments || 0) + (a.engagement?.shares || 0);
        const bEngagement = (b.engagement?.likes || 0) + (b.engagement?.comments || 0) + (b.engagement?.shares || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, limit);
  }

  /**
   * Get comedy content for Comedy Lounge
   */
  async getComedyContent(category?: string, limit: number = 10): Promise<ComedyContent[]> {
    await this.initialize();
    let content = this.data.comedyContent;
    
    if (category) {
      content = content.filter((item: ComedyContent) => item.category === category);
    }
    
    return content
      .sort((a: ComedyContent, b: ComedyContent) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get featured comedy (highest ratings)
   */
  async getFeaturedComedy(limit: number = 3): Promise<ComedyContent[]> {
    await this.initialize();
    return this.data.comedyContent
      .sort((a: ComedyContent, b: ComedyContent) => b.likes - a.likes)
      .slice(0, limit);
  }

  /**
   * Get peer circle discussions
   */
  async getPeerDiscussions(circleId?: string, limit: number = 10): Promise<Discussion[]> {
    await this.initialize();
    let discussions = this.data.peerDiscussions;
    
    if (circleId) {
      discussions = discussions.filter((item: Discussion) => item.circleId === circleId);
    }
    
    return discussions
      .sort((a: Discussion, b: Discussion) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, limit);
  }

  /**
   * Get active discussions (most recent activity)
   */
  async getActiveDiscussions(limit: number = 5): Promise<Discussion[]> {
    await this.initialize();
    return this.data.peerDiscussions
      .sort((a: Discussion, b: Discussion) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, limit);
  }

  /**
   * Get resource articles
   */
  async getResourceArticles(category?: string, limit: number = 10): Promise<Resource[]> {
    await this.initialize();
    let articles = this.data.resourceArticles;
    
    if (category) {
      articles = articles.filter((item: Resource) => item.category === category);
    }
    
    return articles
      .sort((a: Resource, b: Resource) => b.helpfulVotes - a.helpfulVotes)
      .slice(0, limit);
  }

  /**
   * Get featured resources (most helpful)
   */
  async getFeaturedResources(limit: number = 4): Promise<Resource[]> {
    await this.initialize();
    return this.data.resourceArticles
      .sort((a: Resource, b: Resource) => b.helpfulVotes - a.helpfulVotes)
      .slice(0, limit);
  }

  /**
   * Get product reviews for Marketplace
   */
  async getProductReviews(category?: string, limit: number = 10): Promise<Product[]> {
    await this.initialize();
    let reviews = this.data.productReviews;
    
    if (category) {
      reviews = reviews.filter((item: Product) => item.category === category);
    }
    
    return reviews
      .sort((a: Product, b: Product) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get featured products (highest rated)
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    await this.initialize();
    return this.data.productReviews
      .sort((a: Product, b: Product) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get user profiles
   */
  async getUserProfiles(limit: number = 10): Promise<UserProfile[]> {
    await this.initialize();
    return this.data.userProfiles
      .sort((a: UserProfile, b: UserProfile) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get community stats for dashboard
   */
  async getCommunityStats(): Promise<any> {
    await this.initialize();
    
    const totalUsers = this.data.userProfiles.length;
    const activeUsers = this.data.userProfiles.filter((u: UserProfile) => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(u.profile.lastActive) > dayAgo;
    }).length;
    
    const totalCircles = 15; // Mock value
    const totalStories = this.data.userStories.length;
    const totalBusinesses = 8; // Mock value
    const totalProducts = this.data.productReviews.length;
    
    const storiesThisWeek = this.data.userStories.filter((s: UserStory) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(s.createdAt) > weekAgo;
    }).length;
    
    const newMembersThisWeek = this.data.userProfiles.filter((u: UserProfile) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(u.createdAt) > weekAgo;
    }).length;
    
    return {
      totalUsers,
      activeUsers,
      totalCircles,
      totalStories,
      totalBusinesses,
      totalProducts,
      storiesThisWeek,
      newMembersThisWeek,
      engagementRate: 0.75,
      averageSessionTime: 1800 // 30 minutes in seconds
    };
  }

  /**
   * Get today's highlights for Concourse
   */
  async getTodaysHighlights(): Promise<any> {
    await this.initialize();
    
    const featuredStory = this.data.userStories[0];
    const trendingCircle = {
      id: 'circle-1',
      name: 'Wellness Warriors',
      description: 'A supportive community for those on their wellness journey',
      type: 'wellness_focus',
      privacyLevel: 'public',
      settings: {
        isPrivate: false,
        requireApproval: false,
        allowGuestPosts: true,
        moderationLevel: 'moderate'
      },
      members: [],
      moderators: ['user-1'],
      tags: ['wellness', 'support', 'community'],
      stats: {
        memberCount: 234,
        activeMembers: 89,
        postsThisWeek: 45,
        postsThisMonth: 156,
        engagementRate: 0.82,
        averageResponseTime: 3600
      },
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };
    
    const newBusinessSpotlight = {
      id: 'business-1',
      profile: {
        name: 'Ancestral Wellness Co.',
        description: 'Traditional healing products rooted in African wisdom',
        mission: 'To bridge ancient wisdom with modern wellness needs',
        foundedYear: 2023,
        founderStory: 'Founded by a team of herbalists and wellness practitioners...',
        website: 'https://ancestralwellness.co',
        socialMedia: {
          instagram: 'https://instagram.com/ancestralwellness',
          facebook: 'https://facebook.com/ancestralwellness'
        },
        contact: {
          email: 'hello@ancestralwellness.co',
          phone: '+1-555-0123'
        },
        gallery: []
      },
      type: 'wellness_center',
      status: 'active',
      certifications: ['black_owned', 'certified_organic'],
      specialties: ['herbal medicine', 'traditional healing'],
      servicesOffered: ['herbal consultations', 'wellness products'],
      targetAudience: ['wellness seekers', 'traditional medicine enthusiasts'],
      culturalCompetencies: ['African traditional medicine'],
      metrics: {
        rating: 4.9,
        reviewCount: 87,
        trustScore: 0.95,
        responseRate: 0.98,
        averageResponseTime: 1800,
        repeatCustomerRate: 0.78
      },
      ownerId: 'user-5',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    return {
      featuredStory,
      trendingCircle,
      newBusinessSpotlight,
      communityMilestone: '🎉 We\'ve reached 1,000 members in our wellness community!',
      dailyWellnessTip: 'Take 5 minutes today to practice deep breathing. Your mind and body will thank you.',
      upcomingEvents: [
        {
          id: 'event-1',
          title: 'Virtual Wellness Circle',
          description: 'Join us for a supportive discussion about managing stress',
          type: 'wellness',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          organizer: 'Maya Johnson',
          isVirtual: true,
          maxAttendees: 20,
          currentAttendees: 12
        }
      ]
    };
  }

  /**
   * Search functionality across all content
   */
  async search(query: string, contentType: string = 'all', limit: number = 20): Promise<SearchResult[]> {
    await this.initialize();
    
    const searchTerm = query.toLowerCase();
    let results: SearchResult[] = [];
    
    if (contentType === 'all' || contentType === 'stories') {
      const storyResults = this.data.userStories
        .filter((item: UserStory) => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          (item.themes && item.themes.some(theme => theme.includes(searchTerm)))
        )
        .map((item: UserStory) => ({
          id: item.id,
          type: 'story',
          title: item.title,
          description: item.excerpt || item.content.substring(0, 150) + '...',
          score: 1.0,
          metadata: { author: item.author.displayName },
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
      results.push(...storyResults);
    }
    
    // Add other content types as needed...
    
    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get content by category for filtering
   */
  async getCategories(contentType: string): Promise<string[]> {
    await this.initialize();
    
    switch (contentType) {
      case 'comedy':
        return [...new Set(this.data.comedyContent.map((item: ComedyContent) => item.category))] as string[];
      case 'discussions':
        return [...new Set(this.data.peerDiscussions.map((item: any) => item.category || 'General'))] as string[];
      case 'resources':
        return [...new Set(this.data.resourceArticles.map((item: Resource) => item.category))] as string[];
      case 'products':
        return [...new Set(this.data.productReviews.map((item: Product) => item.category))] as string[];
      default:
        return [];
    }
  }

  /**
   * Simulate user interactions (like, save, share)
   */
  async interactWithContent(contentId: string, action: string, contentType: string): Promise<any> {
    // In a real app, this would update a database
    // For now, we'll just log the interaction
    console.log(`User ${action} ${contentType} ${contentId}`);
    
    // Simulate success response
    return {
      success: true,
      message: `Successfully ${action}d content`,
      contentId,
      action,
      contentType
    };
  }

  /**
   * Get personalized recommendations (simplified)
   */
  async getRecommendations(userId: string, contentType: string = 'all', limit: number = 5): Promise<SearchResult[]> {
    await this.initialize();
    
    // Simple recommendation: return highest rated/most engaging content
    let recommendations: SearchResult[] = [];
    
    if (contentType === 'all' || contentType === 'stories') {
      const topStories = this.data.userStories
        .sort((a: UserStory, b: UserStory) => {
          const aEngagement = (a.engagement?.likes || 0) + (a.engagement?.comments || 0);
          const bEngagement = (b.engagement?.likes || 0) + (b.engagement?.comments || 0);
          return bEngagement - aEngagement;
        })
        .slice(0, 2);
      recommendations.push(...topStories.map((item: UserStory) => ({
        id: item.id,
        type: 'story',
        title: item.title,
        description: item.excerpt || item.content.substring(0, 150) + '...',
        score: 0.9,
        metadata: { author: item.author.displayName },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })));
    }
    
    return recommendations.slice(0, limit);
  }
}