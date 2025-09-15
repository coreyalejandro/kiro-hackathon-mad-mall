// Mock API used by client-side pages and React Query hooks
import {
  ApiResponse,
  Article,
  ArticleFilters,
  Circle,
  CircleFilters,
  ComedyClip,
  ComedyFilters,
  PaginatedResponse,
  PlatformStats,
  Product,
  ProductFilters,
  Story,
  StoryFilters,
  ActivityItem,
  Post
} from './types';
import {
  generateBulkData,
  generateActivityItem,
  generateMallSections,
  generateStory
} from './synthetic-data';
import { enhanceWithCoTData } from './cot-data-generator';

// Types and storage helpers
type DataStore = ReturnType<typeof generateBulkData> & {
  reliefRatings: Array<{ id: string; clipId: string; userId: string; rating: number; notes?: string; timestamp: string }>;
  userProfile: { firstName: string; lastName: string; bio: string; notifications: { email: boolean; sms: boolean } };
};

const STORAGE_KEY = 'madmall-data';

const persist = (current: DataStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore quota/SSR issues
  }
};

const initialize = (): DataStore => {
  const fresh = generateBulkData();
  const enhanced = enhanceWithCoTData(fresh);
  return {
    ...enhanced,
    reliefRatings: [],
    userProfile: {
      firstName: 'Aaliyah',
      lastName: 'Johnson',
      bio: 'Graves warrior. Wellness seeker. Sisterhood believer.',
      notifications: { email: true, sms: false }
    }
  };
};

const load = (): DataStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const store = initialize();
      persist(store);
      return store;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.reliefRatings) parsed.reliefRatings = [];
    if (!parsed.userProfile) parsed.userProfile = {
      firstName: 'Aaliyah',
      lastName: 'Johnson',
      bio: 'Graves warrior. Wellness seeker. Sisterhood believer.',
      notifications: { email: true, sms: false }
    };
    return parsed as DataStore;
  } catch {
    const store = initialize();
    persist(store);
    return store;
  }
};

// Store initialization with SSR support
let store: DataStore;
if (typeof window !== 'undefined') {
  store = load();
} else {
  // SSR-safe fallback (not persisted)
  store = initialize();
}

// Helper to update store (combines both approaches)
const setStore = (data: DataStore) => {
  store = data;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

// Pagination helper
function paginate<T>(items: T[], page = 1, limit = 20): PaginatedResponse<T> {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: items.slice(start, end),
    pagination: { page, limit, total, hasMore: end < total },
    success: true,
    timestamp: new Date()
  } as PaginatedResponse<T>;
}

// Success response helper
function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { data, success: true, message, timestamp: new Date() };
}

export const api = {
  // Platform overview
  getMallSections: async (): Promise<ApiResponse<ReturnType<typeof generateMallSections>>> =>
    ok(store.mallSections),

  getCommunityActivity: async (limit = 20): Promise<ApiResponse<ActivityItem[]>> => {
    const items = [...store.activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return ok(items.slice(0, limit));
  },

  getPlatformStats: async (): Promise<ApiResponse<PlatformStats>> =>
    ok(store.platformStats),

  // Circles
  getCircles: async (filters?: CircleFilters, page = 1, limit = 20) => {
    let circles = [...store.circles];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      circles = circles.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    if (filters?.tags?.length) {
      circles = circles.filter((c) => c.tags.some((t) => filters.tags!.includes(t)));
    }
    return paginate(circles, page, limit);
  },

  getCircle: async (id: string): Promise<ApiResponse<Circle>> =>
    ok(store.circles.find((c) => c.id === id) as Circle),

  getCirclePosts: async (circleId: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> => {
    const posts = store.posts
      .filter((p) => p.circleId === circleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(posts, page, limit);
  },

  // Comedy
  getComedyClips: async (filters?: ComedyFilters, page = 1, limit = 20) => {
    let clips = [...store.comedyClips];
    if (filters?.category) clips = clips.filter((c) => c.category === filters.category);
    if (filters?.tags?.length) clips = clips.filter((c) => c.tags.some((t) => filters.tags!.includes(t)));
    if (filters?.duration) {
      clips = clips.filter((c) => {
        if (filters.duration === 'short') return c.duration <= 60;
        if (filters.duration === 'medium') return c.duration > 60 && c.duration <= 180;
        return c.duration > 180;
      });
    }
    if (typeof filters?.reliefRating === 'number') {
      clips = clips.filter((c) => c.averageReliefRating >= (filters!.reliefRating as number));
    }
    clips.sort(
      (a, b) => b.viewCount + b.averageReliefRating * 100 - (a.viewCount + a.averageReliefRating * 100)
    );
    return paginate(clips, page, limit);
  },

  getComedyClip: async (id: string): Promise<ApiResponse<ComedyClip>> =>
    ok(store.comedyClips.find((c) => c.id === id) as ComedyClip),

  getComedyCategories: async (): Promise<ApiResponse<string[]>> =>
    ok(Array.from(new Set(store.comedyClips.map((c) => c.category)))),

  submitReliefRating: async (clipId: string, userId: string, rating: number, notes?: string): Promise<ApiResponse<{ average: number }>> => {
    const clip = store.comedyClips.find((c) => c.id === clipId);
    if (!clip) return ok({ average: 0 }, 'clip not found');

    const entry = {
      id: `relief-${Math.random().toString(36).slice(2)}`,
      clipId,
      userId,
      rating,
      notes,
      timestamp: new Date().toISOString()
    };
    store.reliefRatings.push(entry);

    const ratings = store.reliefRatings.filter((r) => r.clipId === clipId).map((r) => r.rating);
    const average = Math.round((ratings.reduce((s, v) => s + v, 0) / ratings.length) * 10) / 10;
    clip.averageReliefRating = average;
    store.platformStats.reliefRatings += 1;
    store.activities.unshift({
      ...generateActivityItem(),
      type: 'relief_rating',
      content: `found relief watching "${clip.title}"`
    });
    persist(store);
    return ok({ average });
  },

  // Marketplace
  getProducts: async (filters?: ProductFilters, page = 1, limit = 20) => {
    let products = [...store.products];
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters?.priceRange) {
      products = products.filter(p => {
        const price = p.price;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }
    return paginate(products, page, limit);
  },

  getProduct: async (id: string): Promise<ApiResponse<Product>> =>
    ok(store.products.find((p) => p.id === id) as Product),

  getProductCategories: async (): Promise<ApiResponse<string[]>> =>
    ok(Array.from(new Set(store.products.map((p) => p.category)))),

  toggleWishlist: async (productId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    store.activities.unshift({
      ...generateActivityItem(),
      type: 'wishlist',
      content: 'added an item to wishlist'
    });
    persist(store);
    return ok({ success: true });
  },

  // Resource Hub
  getArticles: async (filters?: ArticleFilters, page = 1, limit = 20) => {
    let articles = [...store.articles];
    if (filters?.category) {
      articles = articles.filter(a => a.category === filters.category);
    }
    if (filters?.format) {
      articles = articles.filter(a => a.format === filters.format);
    }
    if (filters?.credibility) {
      articles = articles.filter(a => a.credibility === filters.credibility);
    }
    return paginate(articles, page, limit);
  },

  getArticle: async (id: string): Promise<ApiResponse<Article>> =>
    ok(store.articles.find((a) => a.id === id) as Article),

  getArticleCategories: async (): Promise<ApiResponse<string[]>> =>
    ok(Array.from(new Set(store.articles.map((a) => a.category)))),

  getArticleFormats: async (): Promise<ApiResponse<string[]>> =>
    ok(['article', 'video', 'podcast']),

  getArticleCredibilityLevels: async (): Promise<ApiResponse<string[]>> =>
    ok(['peer-reviewed', 'expert', 'community']),

  toggleBookmark: async (articleId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    store.activities.unshift({
      ...generateActivityItem(),
      type: 'bookmark',
      content: 'saved an article'
    });
    persist(store);
    return ok({ success: true });
  },

  // Stories
  getStories: async (filters?: StoryFilters, page = 1, limit = 20) => {
    let stories = [...store.stories];
    if (filters?.type) {
      stories = stories.filter(s => s.type === filters.type);
    }
    if (filters?.tags?.length) {
      stories = stories.filter(s => s.tags.some(t => filters.tags!.includes(t)));
    }
    return paginate(stories, page, limit);
  },

  getStory: async (id: string): Promise<ApiResponse<Story>> =>
    ok(store.stories.find((s) => s.id === id) as Story),

  getStoryTags: async (): Promise<ApiResponse<string[]>> =>
    ok(Array.from(new Set(store.stories.flatMap((s) => s.tags)))),

  uploadStory: async ({
    title,
    content,
    type,
    audioUrl,
    videoUrl,
    isAnonymous = false
  }: {
    title: string;
    content: string;
    type: 'text' | 'audio' | 'video';
    audioUrl?: string;
    videoUrl?: string;
    isAnonymous?: boolean;
  }): Promise<ApiResponse<Story>> => {
    const created = generateStory();
    created.title = title;
    created.content = content;
    created.type = type;
    created.audioUrl = audioUrl;
    created.videoUrl = videoUrl;
    created.isAnonymous = isAnonymous;
    store.stories.unshift(created);
    store.activities.unshift({
      ...generateActivityItem(),
      type: 'story',
      content: `shared their story "${created.title}"`
    });
    persist(store);
    return ok(created);
  },

  trackStoryEngagement: async (
    storyId: string,
    type: 'view' | 'like' | 'share' | 'comment'
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const story = store.stories.find(s => s.id === storyId);
    if (story) {
      switch (type) {
        case 'view': story.engagement.views++; break;
        case 'like': story.engagement.likes++; break;
        case 'share': story.engagement.shares++; break;
        case 'comment': story.engagement.comments++; break;
      }
      persist(store);
    }
    return ok({ success: true });
  },

  // Search
  searchAll: async (query: string, limit = 10): Promise<ApiResponse<{
    clips: ComedyClip[];
    products: Product[];
    articles: Article[];
    stories: Story[]
  }>> => {
    const q = query.toLowerCase();
    const clips = store.comedyClips
      .filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .slice(0, limit);
    const products = store.products
      .filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, limit);
    const articles = store.articles
      .filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q))
      .slice(0, limit);
    const stories = store.stories
      .filter((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
      .slice(0, limit);
    return ok({ clips, products, articles, stories });
  },

  // Circle interactions
  joinCircle: async (circleId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const circle = store.circles.find(c => c.id === circleId);
    if (circle) {
      circle.memberCount++;
      store.activities.unshift({
        ...generateActivityItem(),
        type: 'join',
        content: `joined ${circle.name}`
      });
      persist(store);
    }
    return ok({ success: true });
  },

  leaveCircle: async (circleId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const circle = store.circles.find(c => c.id === circleId);
    if (circle && circle.memberCount > 0) {
      circle.memberCount--;
      persist(store);
    }
    return ok({ success: true });
  },

  createCirclePost: async (
    circleId: string,
    userId: string,
    content: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const post: Post = {
      id: `post-${Math.random().toString(36).slice(2)}`,
      userId,
      circleId,
      content,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      isAnonymous: false
    };
    store.posts.unshift(post);
    store.activities.unshift({
      ...generateActivityItem(),
      type: 'post',
      content: 'shared an update'
    });
    persist(store);
    return ok({ success: true });
  },

  // Profile
  getUserProfile: async (): Promise<ApiResponse<{
    firstName: string;
    lastName: string;
    bio: string;
    notifications: { email: boolean; sms: boolean }
  }>> => ok(store.userProfile),

  updateUserProfile: async (
    profile: { firstName: string; lastName: string; bio: string },
    notifications: { email: boolean; sms: boolean }
  ): Promise<ApiResponse<{ success: boolean }>> => {
    store.userProfile = { ...profile, notifications };
    persist(store);
    return ok({ success: true });
  },

  // Admin utilities
  clearData: async (): Promise<void> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      store = initialize();
    } catch {
      // Ignore errors
    }
  },

  regenerateData: async (): Promise<void> => {
    const fresh = generateBulkData();
    const enhanced = enhanceWithCoTData(fresh);
    store = {
      ...enhanced,
      reliefRatings: [],
      userProfile: store.userProfile
    };
    persist(store);
  }
};

export default api;
