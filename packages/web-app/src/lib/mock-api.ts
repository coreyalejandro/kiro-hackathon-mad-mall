// Mock API infrastructure for MADMall platform
import { 
  User, Circle, Post, ComedyClip, Product, Article, Story,
  ActivityItem, PlatformStats, MallSection, ApiResponse, PaginatedResponse,
  CircleFilters, ComedyFilters, ProductFilters, ArticleFilters, StoryFilters,
  ImageAsset
} from './types';
import { generateBulkData } from './synthetic-data';

// In-memory data store
let dataStore: ReturnType<typeof generateBulkData> | null = null;

// Initialize data store
const initializeDataStore = () => {
  if (!dataStore) {
    // Try to load from localStorage first
    const stored = localStorage.getItem('madmall-data');
    if (stored) {
      try {
        dataStore = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (dataStore) {
          dataStore.users.forEach(user => {
            user.joinedAt = new Date(user.joinedAt);
          });
          dataStore.circles.forEach(circle => {
            circle.recentActivity = new Date(circle.recentActivity);
          });
          dataStore.posts.forEach(post => {
            post.createdAt = new Date(post.createdAt);
          });
          dataStore.articles.forEach(article => {
            article.publishedAt = new Date(article.publishedAt);
          });
          dataStore.stories.forEach(story => {
            story.publishedAt = new Date(story.publishedAt);
          });
          dataStore.activities.forEach(activity => {
            activity.timestamp = new Date(activity.timestamp);
          });
        }
      } catch (error) {
        console.warn('Failed to load stored data, generating new data');
        dataStore = generateBulkData();
      }
    } else {
      dataStore = generateBulkData();
    }
    
    // Save to localStorage
    localStorage.setItem('madmall-data', JSON.stringify(dataStore));
  }
  return dataStore;
};

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  data,
  success: true,
  message,
  timestamp: new Date()
});

const createPaginatedResponse = <T>(
  data: T[], 
  page: number, 
  limit: number, 
  total: number
): PaginatedResponse<T> => ({
  data: data.slice((page - 1) * limit, page * limit),
  pagination: {
    page,
    limit,
    total,
    hasMore: page * limit < total
  },
  success: true,
  timestamp: new Date()
});

const filterCircles = (circles: Circle[], filters: CircleFilters): Circle[] => {
  return circles.filter(circle => {
    if (filters.search && !circle.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !circle.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.tags && filters.tags.length > 0 && 
        !filters.tags.some(tag => circle.tags.includes(tag))) {
      return false;
    }
    if (filters.activityLevel && circle.activityLevel !== filters.activityLevel) {
      return false;
    }
    if (filters.memberCount) {
      const count = circle.memberCount;
      if (filters.memberCount === 'small' && count > 50) return false;
      if (filters.memberCount === 'medium' && (count <= 50 || count > 200)) return false;
      if (filters.memberCount === 'large' && count <= 200) return false;
    }
    return true;
  });
};

const filterComedyClips = (clips: ComedyClip[], filters: ComedyFilters): ComedyClip[] => {
  return clips.filter(clip => {
    if (filters.category && clip.category !== filters.category) return false;
    if (filters.tags && filters.tags.length > 0 && 
        !filters.tags.some(tag => clip.tags.includes(tag))) return false;
    if (filters.duration) {
      const duration = clip.duration;
      if (filters.duration === 'short' && duration > 60) return false;
      if (filters.duration === 'medium' && (duration <= 60 || duration > 180)) return false;
      if (filters.duration === 'long' && duration <= 180) return false;
    }
    if (filters.reliefRating && clip.averageReliefRating < filters.reliefRating) return false;
    return true;
  });
};

const filterProducts = (products: Product[], filters: ProductFilters): Product[] => {
  return products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.priceRange) {
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false;
      }
    }
    if (filters.tags && filters.tags.length > 0 && 
        !filters.tags.some(tag => product.tags.includes(tag))) return false;
    if (filters.blackOwned !== undefined && product.business.isBlackOwned !== filters.blackOwned) {
      return false;
    }
    return true;
  });
};

const filterArticles = (articles: Article[], filters: ArticleFilters): Article[] => {
  return articles.filter(article => {
    if (filters.category && article.category !== filters.category) return false;
    if (filters.tags && filters.tags.length > 0 && 
        !filters.tags.some(tag => article.tags.includes(tag))) return false;
    if (filters.readingTime) {
      const time = article.readingTime;
      if (filters.readingTime === 'short' && time > 5) return false;
      if (filters.readingTime === 'medium' && (time <= 5 || time > 10)) return false;
      if (filters.readingTime === 'long' && time <= 10) return false;
    }
    if (filters.author && !article.author.name.toLowerCase().includes(filters.author.toLowerCase())) {
      return false;
    }
    return true;
  });
};

const filterStories = (stories: Story[], filters: StoryFilters): Story[] => {
  return stories.filter(story => {
    if (filters.type && story.type !== filters.type) return false;
    if (filters.tags && filters.tags.length > 0 && 
        !filters.tags.some(tag => story.tags.includes(tag))) return false;
    if (filters.timeframe && filters.timeframe !== 'all') {
      const now = new Date();
      const storyDate = new Date(story.publishedAt);
      const daysDiff = (now.getTime() - storyDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (filters.timeframe === 'day' && daysDiff > 1) return false;
      if (filters.timeframe === 'week' && daysDiff > 7) return false;
      if (filters.timeframe === 'month' && daysDiff > 30) return false;
    }
    return true;
  });
};

// Mock API endpoints
export class MockAPI {
  // Mall sections and homepage
  static async getMallSections(): Promise<ApiResponse<MallSection[]>> {
    await delay(100);
    const data = initializeDataStore();
    return createApiResponse(data.mallSections);
  }

  static async getCommunityActivity(limit = 20): Promise<ApiResponse<ActivityItem[]>> {
    await delay(150);
    const data = initializeDataStore();
    const sortedActivities = data.activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    return createApiResponse(sortedActivities);
  }

  static async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    await delay(100);
    const data = initializeDataStore();
    return createApiResponse(data.platformStats);
  }

  // Peer Circles
  static async getCircles(
    filters: CircleFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Circle>> {
    await delay(200);
    const data = initializeDataStore();
    const filteredCircles = filterCircles(data.circles, filters);
    const sortedCircles = filteredCircles.sort((a, b) => 
      new Date(b.recentActivity).getTime() - new Date(a.recentActivity).getTime()
    );
    return createPaginatedResponse(sortedCircles, page, limit, filteredCircles.length);
  }

  static async getCircle(id: string): Promise<ApiResponse<Circle | null>> {
    await delay(100);
    const data = initializeDataStore();
    const circle = data.circles.find(c => c.id === id);
    return createApiResponse(circle || null);
  }

  static async joinCircle(circleId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    await delay(300);
    const data = initializeDataStore();
    const circle = data.circles.find(c => c.id === circleId);
    if (circle) {
      circle.memberCount += 1;
      // Save updated data
      localStorage.setItem('madmall-data', JSON.stringify(data));
    }
    return createApiResponse({ success: !!circle });
  }

  static async getCirclePosts(
    circleId: string, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Post>> {
    await delay(200);
    const data = initializeDataStore();
    const circlePosts = data.posts
      .filter(post => post.circleId === circleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return createPaginatedResponse(circlePosts, page, limit, circlePosts.length);
  }

  // Comedy Lounge
  static async getComedyClips(
    filters: ComedyFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<ComedyClip>> {
    await delay(200);
    const data = initializeDataStore();
    const filteredClips = filterComedyClips(data.comedyClips, filters);
    const sortedClips = filteredClips.sort((a, b) => b.averageReliefRating - a.averageReliefRating);
    return createPaginatedResponse(sortedClips, page, limit, filteredClips.length);
  }

  static async getComedyClip(id: string): Promise<ApiResponse<ComedyClip | null>> {
    await delay(100);
    const data = initializeDataStore();
    const clip = data.comedyClips.find(c => c.id === id);
    return createApiResponse(clip || null);
  }

  static async getComedyCategories(): Promise<ApiResponse<string[]>> {
    await delay(50);
    const data = initializeDataStore();
    const categories = [...new Set(data.comedyClips.map(clip => clip.category))];
    return createApiResponse(categories);
  }

  // Marketplace
  static async getProducts(
    filters: ProductFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Product>> {
    await delay(200);
    const data = initializeDataStore();
    const filteredProducts = filterProducts(data.products, filters);
    const sortedProducts = filteredProducts.sort((a, b) => b.rating - a.rating);
    return createPaginatedResponse(sortedProducts, page, limit, filteredProducts.length);
  }

  static async getProduct(id: string): Promise<ApiResponse<Product | null>> {
    await delay(100);
    const data = initializeDataStore();
    const product = data.products.find(p => p.id === id);
    return createApiResponse(product || null);
  }

  static async getProductCategories(): Promise<ApiResponse<string[]>> {
    await delay(50);
    const data = initializeDataStore();
    const categories = [...new Set(data.products.map(product => product.category))];
    return createApiResponse(categories);
  }

  // Resource Hub
  static async getArticles(
    filters: ArticleFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Article>> {
    await delay(200);
    const data = initializeDataStore();
    const filteredArticles = filterArticles(data.articles, filters);
    const sortedArticles = filteredArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return createPaginatedResponse(sortedArticles, page, limit, filteredArticles.length);
  }

  static async getArticle(id: string): Promise<ApiResponse<Article | null>> {
    await delay(100);
    const data = initializeDataStore();
    const article = data.articles.find(a => a.id === id);
    return createApiResponse(article || null);
  }

  static async getArticleCategories(): Promise<ApiResponse<string[]>> {
    await delay(50);
    const data = initializeDataStore();
    const categories = [...new Set(data.articles.map(article => article.category))];
    return createApiResponse(categories);
  }

  // Story Booth
  static async getStories(
    filters: StoryFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Story>> {
    await delay(200);
    const data = initializeDataStore();
    const filteredStories = filterStories(data.stories, filters);
    const sortedStories = filteredStories.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return createPaginatedResponse(sortedStories, page, limit, filteredStories.length);
  }

  static async getStory(id: string): Promise<ApiResponse<Story | null>> {
    await delay(100);
    const data = initializeDataStore();
    const story = data.stories.find(s => s.id === id);
    return createApiResponse(story || null);
  }

  static async getStoryTags(): Promise<ApiResponse<string[]>> {
    await delay(50);
    const data = initializeDataStore();
    const tags = [...new Set(data.stories.flatMap(story => story.tags))];
    return createApiResponse(tags);
  }

  // Images
  static async getImages(
    category?: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ImageAsset>> {
    await delay(100);
    const data = initializeDataStore();
    const images = category
      ? data.images.filter(img => img.category === category)
      : data.images;
    return createPaginatedResponse(images, page, limit, images.length);
  }

  // User interactions
  static async toggleWishlist(productId: string, userId: string): Promise<ApiResponse<{ isWishlisted: boolean }>> {
    await delay(200);
    // In a real app, this would update user's wishlist
    const isWishlisted = Math.random() > 0.5; // Mock toggle
    return createApiResponse({ isWishlisted });
  }

  static async toggleBookmark(articleId: string, userId: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    await delay(200);
    // In a real app, this would update user's bookmarks
    const isBookmarked = Math.random() > 0.5; // Mock toggle
    return createApiResponse({ isBookmarked });
  }

  static async submitReliefRating(
    clipId: string, 
    userId: string, 
    rating: number, 
    notes?: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    await delay(300);
    // In a real app, this would save the rating and update clip's average
    return createApiResponse({ success: true });
  }

  // Search
  static async searchAll(query: string, limit = 10): Promise<ApiResponse<{
    circles: Circle[];
    comedyClips: ComedyClip[];
    products: Product[];
    articles: Article[];
    stories: Story[];
  }>> {
    await delay(300);
    const data = initializeDataStore();
    const lowerQuery = query.toLowerCase();

    const circles = data.circles
      .filter(c => c.name.toLowerCase().includes(lowerQuery) || 
                   c.description.toLowerCase().includes(lowerQuery))
      .slice(0, limit);

    const comedyClips = data.comedyClips
      .filter(c => c.title.toLowerCase().includes(lowerQuery) || 
                   c.description.toLowerCase().includes(lowerQuery))
      .slice(0, limit);

    const products = data.products
      .filter(p => p.name.toLowerCase().includes(lowerQuery) || 
                   p.description.toLowerCase().includes(lowerQuery))
      .slice(0, limit);

    const articles = data.articles
      .filter(a => a.title.toLowerCase().includes(lowerQuery) || 
                   a.excerpt.toLowerCase().includes(lowerQuery))
      .slice(0, limit);

    const stories = data.stories
      .filter(s => s.title.toLowerCase().includes(lowerQuery) || 
                   s.content.toLowerCase().includes(lowerQuery))
      .slice(0, limit);

    return createApiResponse({
      circles,
      comedyClips,
      products,
      articles,
      stories
    });
  }

  // Utility methods
  static clearData(): void {
    localStorage.removeItem('madmall-data');
    dataStore = null;
  }

  static regenerateData(): void {
    dataStore = generateBulkData();
    localStorage.setItem('madmall-data', JSON.stringify(dataStore));
  }
}

// Export individual API functions for easier use
export const api = {
  // Homepage
  getMallSections: MockAPI.getMallSections,
  getCommunityActivity: MockAPI.getCommunityActivity,
  getPlatformStats: MockAPI.getPlatformStats,
  
  // Circles
  getCircles: MockAPI.getCircles,
  getCircle: MockAPI.getCircle,
  joinCircle: MockAPI.joinCircle,
  getCirclePosts: MockAPI.getCirclePosts,
  
  // Comedy
  getComedyClips: MockAPI.getComedyClips,
  getComedyClip: MockAPI.getComedyClip,
  getComedyCategories: MockAPI.getComedyCategories,
  
  // Marketplace
  getProducts: MockAPI.getProducts,
  getProduct: MockAPI.getProduct,
  getProductCategories: MockAPI.getProductCategories,
  
  // Resources
  getArticles: MockAPI.getArticles,
  getArticle: MockAPI.getArticle,
  getArticleCategories: MockAPI.getArticleCategories,
  
  // Stories
  getStories: MockAPI.getStories,
  getStory: MockAPI.getStory,
  getStoryTags: MockAPI.getStoryTags,

  // Images
  getImages: MockAPI.getImages,

  // Interactions
  toggleWishlist: MockAPI.toggleWishlist,
  toggleBookmark: MockAPI.toggleBookmark,
  submitReliefRating: MockAPI.submitReliefRating,
  
  // Search
  searchAll: MockAPI.searchAll,
  
  // Utility
  clearData: MockAPI.clearData,
  regenerateData: MockAPI.regenerateData
};