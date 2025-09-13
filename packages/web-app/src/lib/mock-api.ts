// Mock API infrastructure for MADMall platform

import {
  User,
  Circle,
  Post,
  ComedyClip,
  Product,
  Article,
  Story,
  ActivityItem,
  PlatformStats,
  MallSection,
  ApiResponse,
  PaginatedResponse,
  CircleFilters,
  ComedyFilters,
  ProductFilters,
  ArticleFilters,
  StoryFilters,
  ImageAsset,
} from './types';

// Seed demo data
const seedUsers: User[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    joinedAt: '2022-01-15T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    joinedAt: '2022-02-20T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@example.com',
    joinedAt: '2022-03-10T00:00:00Z',
  },
  {
    id: '4',
    firstName: 'Diana',
    lastName: 'Prince',
    email: 'diana@example.com',
    joinedAt: '2022-04-05T00:00:00Z',
  },
  {
    id: '5',
    firstName: 'Ethan',
    lastName: 'Hunt',
    email: 'ethan@example.com',
    joinedAt: '2022-05-15T00:00:00Z',
  },
];

const seedCircles: Circle[] = [
  {
    id: '1',
    name: 'Art Lovers',
    recentActivity: '2023-09-01T12:00:00Z',
  },
  {
    id: '2',
    name: 'Tech Enthusiasts',
    recentActivity: '2023-09-10T12:00:00Z',
  },
  {
    id: '3',
    name: 'Fitness Fanatics',
    recentActivity: '2023-09-11T10:30:00Z',
  },
  {
    id: '4',
    name: 'Travel Addicts',
    recentActivity: '2023-09-12T09:45:00Z',
  },
  {
    id: '5',
    name: 'Foodies',
    recentActivity: '2023-09-13T15:15:00Z',
  },
];

const seedPosts: Post[] = [
  {
    id: '1',
    title: 'First Post',
    content: 'This is the content of the first post.',
    createdAt: '2023-09-15T08:00:00Z',
    circleId: '1',
  },
  {
    id: '2',
    title: 'Welcome to Art Lovers',
    content: 'Let\'s share our favorite artworks!',
    createdAt: '2023-09-16T09:00:00Z',
    circleId: '1',
  },
  {
    id: '3',
    title: 'Latest Tech Gadgets',
    content: 'Discussing the latest tech trends.',
    createdAt: '2023-09-17T10:00:00Z',
    circleId: '2',
  },
];

const seedArticles: Article[] = [
  {
    id: '1',
    title: 'Latest Trends in Tech',
    publishedAt: '2023-09-05T10:00:00Z',
    content: 'Article content goes here...',
  },
  {
    id: '2',
    title: 'Health Benefits of Yoga',
    publishedAt: '2023-09-06T12:00:00Z',
    content: 'Exploring the physical and mental health benefits of yoga...',
  },
];

const seedStories: Story[] = [
  {
    id: '1',
    title: 'A Day in the Life',
    publishedAt: '2023-09-07T14:00:00Z',
    content: 'Story content goes here...',
    hashtags: ['life', 'daily', 'experience'],
  },
  {
    id: '2',
    title: 'Travel Adventures',
    publishedAt: '2023-09-08T09:00:00Z',
    content: 'Experience the beauty of traveling...',
    hashtags: ['travel', 'adventure', 'nature'],
  },
];

const seedActivities: ActivityItem[] = [
  {
    id: '1',
    userId: '1',
    action: 'joined',
    circleName: 'Art Lovers',
    timestamp: '2023-09-15T11:00:00Z',
  },
  {
    id: '2',
    userId: '2',
    action: 'left',
    circleName: 'Tech Enthusiasts',
    timestamp: '2023-09-01T10:00:00Z',
  },
  {
    id: '3',
    userId: '3',
    action: 'posted',
    postTitle: 'First Post',
    timestamp: '2023-09-16T12:30:00Z',
  },
];

// Generate bulk data function
const generateBulkData = () => ({
  users: seedUsers,
  circles: seedCircles,
  posts: seedPosts,
  articles: seedArticles,
  stories: seedStories,
  activities: seedActivities,
});

// MockAPI class definition
class MockAPI {
  private static dataStore: ReturnType<typeof generateBulkData> | null = null;

  // Initialize data store
  static initializeDataStore(): void {
    if (!this.dataStore) {
      this.dataStore = generateBulkData();
      console.log('Data store initialized with seed data');
    }
  }

  // Regenerate data and save to localStorage
  static regenerateData(): void {
    this.dataStore = generateBulkData();
    localStorage.setItem('madmall-data', JSON.stringify(this.dataStore));
    console.log('Data has been regenerated and saved to localStorage');
  }

  // Clear the in-memory data store
  static clearData(): void {
    localStorage.removeItem('madmall-data');
    this.dataStore = null;
    console.log('Local data cleared');
  }

  // Individual API methods
  static getUsers(): User[] {
    this.initializeDataStore();
    return this.dataStore?.users || [];
  }

  static getCircles(): Circle[] {
    this.initializeDataStore();
    return this.dataStore?.circles || [];
  }

  static getCircle(circleId: string): Circle | undefined {
    this.initializeDataStore();
    return this.dataStore?.circles.find(circle => circle.id === circleId);
  }

  static joinCircle(circleId: string, userId: string): void {
    // Implement joining circle logic
    console.log(`User ${userId} joined circle ${circleId}`);
  }

  static leaveCircle(circleId: string, userId: string): void {
    // Implement leaving circle logic
    console.log(`User ${userId} left circle ${circleId}`);
  }

  static createCirclePost(circleId: string, post: Post): void {
    // Implement creating new post logic for a circle
    console.log(`Post created in circle ${circleId}:`, post);
  }

  static getCirclePosts(circleId: string): Post[] {
    // Return posts for a specific circle
    return this.dataStore?.posts.filter(post => post.circleId === circleId) || [];
  }

  static getProducts(): Product[] {
    // Implement retrieval of products
    return [];
  }

  static getProduct(productId: string): Product | undefined {
    // Return single product details
    return undefined;
  }

  static getArticles(): Article[] {
    this.initializeDataStore();
    return this.dataStore?.articles || [];
  }

  static getArticle(articleId: string): Article | undefined {
    this.initializeDataStore();
    return this.dataStore?.articles.find(article => article.id === articleId);
  }

  static getStories(): Story[] {
    this.initializeDataStore();
    return this.dataStore?.stories || [];
  }

  static getStory(storyId: string): Story | undefined {
    this.initializeDataStore();
    return this.dataStore?.stories.find(story => story.id === storyId);
  }

  static getActivities(): ActivityItem[] {
    this.initializeDataStore();
    return this.dataStore?.activities || [];
  }

  static toggleWishlist(productId: string): void {
    // Logic for toggling wishlist
    console.log(`Wishlist status toggled for product ${productId}`);
  }

  static toggleBookmark(articleId: string): void {
    // Logic for toggling bookmark
    console.log(`Bookmark status toggled for article ${articleId}`);
  }

  static submitReliefRating(activityId: string, rating: number): void {
    // Logic for submitting a relief rating
    console.log(`Relief rating ${rating} submitted for activity ${activityId}`);
  }

  static searchAll(query: string): any[] {
    // Logic for searching through data
    console.log(`Search executed for query: ${query}`);
    return []; // Return search results
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
  leaveCircle: MockAPI.leaveCircle,
  createCirclePost: MockAPI.createCirclePost,
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
  getArticleFormats: MockAPI.getArticleFormats,
  getArticleCredibilityLevels: MockAPI.getArticleCredibilityLevels,

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
  regenerateData: MockAPI.regenerateData,
};

// Export the initialization method
export const initializeMockApi = () => {
  MockAPI.initializeDataStore();
};
