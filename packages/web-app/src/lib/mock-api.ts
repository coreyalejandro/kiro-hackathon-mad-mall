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
  return {
    ...fresh,
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

<<<<<<< HEAD
let store: DataStore;
if (typeof window !== 'undefined') {
  store = load();
} else {
  // SSR-safe fallback (not persisted)
  store = initialize();
}

function paginate<T>(items: T[], page = 1, limit = 20): PaginatedResponse<T> {
  const total = items.length;
=======
const setStore = (data: DataStore) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('madmall-data', JSON.stringify(data));
  }
};

// Helpers
const paginate = <T>(items: T[], page = 1, limit = 20): T[] => {
>>>>>>> 8085799 (chore: sync local changes before rebase)
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: items.slice(start, end),
    pagination: { page, limit, total, hasMore: end < total },
    success: true,
    timestamp: new Date()
  } as PaginatedResponse<T>;
}

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { data, success: true, message, timestamp: new Date() };
}

export const api = {
<<<<<<< HEAD
  // Platform overview
  getMallSections: async (): Promise<ApiResponse<ReturnType<typeof generateMallSections>>> => ok(store.mallSections),
  getCommunityActivity: async (limit = 20): Promise<ApiResponse<ActivityItem[]>> => {
    const items = [...store.activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return ok(items.slice(0, limit));
  },
  getPlatformStats: async (): Promise<ApiResponse<PlatformStats>> => ok(store.platformStats),

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
  getCircle: async (id: string): Promise<ApiResponse<Circle>> => ok(store.circles.find((c) => c.id === id) as Circle),
  getCirclePosts: async (circleId: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> => {
    const posts = store.posts
      .filter((p) => p.circleId === circleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
=======
  // Home / Dashboard
  getMallSections: (): MallSection[] => {
    const store = getStore();
    return store.mallSections;
  },
  getCommunityActivity: (limit = 20): ActivityItem[] => {
    const store = getStore();
    return store.activities.slice(0, limit);
  },
  getPlatformStats: (): PlatformStats => {
    const store = getStore();
    return store.platformStats;
  },

  // Circles
  getCircles: (filters?: CircleFilters, page = 1, limit = 20): Circle[] => {
    const store = getStore();
    let results = [...(store.circles as unknown as Circle[])];
    if ((filters as any)?.activityLevel) {
      results = results.filter((c: any) => c.activityLevel === (filters as any).activityLevel);
    }
    if ((filters as any)?.tags?.length) {
      results = results.filter((c: any) => (c.tags || []).some((t: string) => (filters as any).tags.includes(t)));
    }
    return paginate(results, page, limit);
  },
  getCircle: (id: string): Circle | undefined => {
    const store = getStore();
    return (store.circles as unknown as Circle[]).find((c: any) => c.id === id);
  },
  getCirclePosts: (circleId: string, page = 1, limit = 20): any[] => {
    const store = getStore();
    const posts = store.posts.filter((p: any) => p.circleId === circleId);
>>>>>>> 8085799 (chore: sync local changes before rebase)
    return paginate(posts, page, limit);
  },

  // Comedy
<<<<<<< HEAD
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
  getComedyClip: async (id: string): Promise<ApiResponse<ComedyClip>> => ok(store.comedyClips.find((c) => c.id === id) as ComedyClip),
  getComedyCategories: async (): Promise<ApiResponse<string[]>> => ok(Array.from(new Set(store.comedyClips.map((c) => c.category)))),
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
    store.activities.unshift({ ...generateActivityItem(), type: 'relief_rating', content: `found relief watching "${clip.title}"` });
    persist(store);
    return ok({ average });
  },

  // Marketplace
  getProducts: async (_filters?: ProductFilters, page = 1, limit = 20) => paginate([...store.products], page, limit),
  getProduct: async (id: string): Promise<ApiResponse<Product>> => ok(store.products.find((p) => p.id === id) as Product),
  getProductCategories: async (): Promise<ApiResponse<string[]>> => ok(Array.from(new Set(store.products.map((p) => p.category)))),
  toggleWishlist: async (_productId: string, _userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    store.activities.unshift({ ...generateActivityItem(), type: 'wishlist', content: 'added an item to wishlist' });
    persist(store);
    return ok({ success: true });
  },

=======
  getComedyClips: (filters?: any, page = 1, limit = 20): ComedyClip[] => {
    const store = getStore();
    let clips = [...store.comedyClips];
    if (filters?.category) {
      clips = clips.filter(c => c.category === filters.category);
    }
    return paginate(clips, page, limit);
  },
  getComedyClip: (id: string): ComedyClip | undefined => {
    const store = getStore();
    return store.comedyClips.find(c => c.id === id);
  },
  getComedyCategories: (): { data: string[] } => {
    const store = getStore();
    const categories = Array.from(new Set(store.comedyClips.map(c => c.category)));
    return { data: categories };
  },

  // Marketplace
  getProducts: (filters?: any, page = 1, limit = 20): Product[] => {
    const store = getStore();
    let products = [...store.products];
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }
    return paginate(products, page, limit);
  },
  getProduct: (id: string): Product | undefined => {
    const store = getStore();
    return store.products.find(p => p.id === id);
  },
  getProductCategories: (): { data: string[] } => {
    const store = getStore();
    const cats = Array.from(new Set(store.products.map(p => p.category)));
    return { data: cats };
  },
>>>>>>> 8085799 (chore: sync local changes before rebase)
  // Resource Hub
  getArticles: async (_filters?: ArticleFilters, page = 1, limit = 20) => paginate([...store.articles], page, limit),
  getArticle: async (id: string): Promise<ApiResponse<Article>> => ok(store.articles.find((a) => a.id === id) as Article),
  getArticleCategories: async (): Promise<ApiResponse<string[]>> => ok(Array.from(new Set(store.articles.map((a) => a.category)))),
  getArticleFormats: async (): Promise<ApiResponse<string[]>> => ok(['article', 'video', 'podcast']),
  getArticleCredibilityLevels: async (): Promise<ApiResponse<string[]>> => ok(['peer-reviewed', 'expert', 'community']),
  toggleBookmark: async (_articleId: string, _userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    store.activities.unshift({ ...generateActivityItem(), type: 'bookmark', content: 'saved an article' });
    persist(store);
    return ok({ success: true });
  },

  // Stories
  getStories: async (_filters?: StoryFilters, page = 1, limit = 20) => paginate([...store.stories], page, limit),
  getStory: async (id: string): Promise<ApiResponse<Story>> => ok(store.stories.find((s) => s.id === id) as Story),
  getStoryTags: async (): Promise<ApiResponse<string[]>> => ok(Array.from(new Set(store.stories.flatMap((s) => s.tags)))),
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
    store.activities.unshift({ ...generateActivityItem(), type: 'story', content: `shared their story "${created.title}"` });
    persist(store);
    return ok(created);
  },
  trackStoryEngagement: async (_storyId: string, _type: 'view' | 'like' | 'share' | 'comment'): Promise<ApiResponse<{ success: boolean }>> => ok({ success: true }),

  // Search
  searchAll: async (query: string, limit = 10): Promise<ApiResponse<{ clips: ComedyClip[]; products: Product[]; articles: Article[]; stories: Story[] }>> => {
    const q = query.toLowerCase();
    const clips = store.comedyClips.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)).slice(0, limit);
    const products = store.products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)).slice(0, limit);
    const articles = store.articles.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)).slice(0, limit);
    const stories = store.stories.filter((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)).slice(0, limit);
    return ok({ clips, products, articles, stories });
  },

  // Circle interactions (no-op updates for demo)
  joinCircle: async (_circleId: string, _userId: string): Promise<ApiResponse<{ success: boolean }>> => ok({ success: true }),
  leaveCircle: async (_circleId: string, _userId: string): Promise<ApiResponse<{ success: boolean }>> => ok({ success: true }),
  createCirclePost: async (circleId: string, userId: string, content: string): Promise<ApiResponse<{ success: boolean }>> => {
    store.posts.unshift({ id: `post-${Math.random().toString(36).slice(2)}`, userId, circleId, content, createdAt: new Date(), likes: 0, comments: 0, isAnonymous: false });
    store.activities.unshift({ ...generateActivityItem(), type: 'post', content: 'shared an update' });
    persist(store);
    return ok({ success: true });
  },

  // Profile
  getUserProfile: async (): Promise<ApiResponse<{ firstName: string; lastName: string; bio: string; notifications: { email: boolean; sms: boolean } }>> => ok(store.userProfile),
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
    } catch {}
  },
<<<<<<< HEAD
  regenerateData: async (): Promise<void> => {
    const fresh = generateBulkData();
    store = { ...fresh, reliefRatings: [], userProfile: store.userProfile };
    persist(store);
  }
};
=======

  // Stories
  getStories: (filters?: any, page = 1, limit = 20): Story[] => {
    const store = getStore();
    let stories = [...store.stories];
    if (filters?.type) {
      stories = stories.filter(s => s.type === filters.type);
    }
    return paginate(stories, page, limit);
  },
  getStory: (id: string): Story | undefined => {
    const store = getStore();
    return store.stories.find(s => s.id === id);
  },
  getStoryTags: (): { data: string[] } => {
    const store = getStore();
    const tags = Array.from(new Set(store.stories.flatMap(s => s.tags)));
    return { data: tags };
  },

  // Search (simple)
  searchAll: (query: string, limit = 10): any[] => {
    const store = getStore();
    const q = query.toLowerCase();
    const results = [
      ...(store.circles as any[]).filter(c => (c.name || '').toLowerCase().includes(q)),
      ...store.comedyClips.filter(c => c.title.toLowerCase().includes(q)),
      ...store.products.filter(p => p.name.toLowerCase().includes(q)),
      ...store.articles.filter(a => a.title.toLowerCase().includes(q)),
      ...store.stories.filter(s => s.title.toLowerCase().includes(q)),
    ];
    return results.slice(0, limit);
  },

  // Mutations (mock)
  joinCircle: (circleId: string, userId: string) => ({ circleId, userId, status: 'joined' } as const),
  leaveCircle: (circleId: string, userId: string) => ({ circleId, userId, status: 'left' } as const),
  createCirclePost: (circleId: string, userId: string, content: string) => {
    const store = getStore();
    const post: any = {
      id: `post-${Math.random().toString(36).slice(2)}`,
      userId,
      circleId,
      content,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      isAnonymous: false,
    };
    store.posts.unshift(post);
    setStore(store);
    return post;
  },
  toggleWishlist: (productId: string, userId: string) => ({ productId, userId, wishlisted: true }),
  toggleBookmark: (articleId: string, userId: string) => ({ articleId, userId, bookmarked: true }),
  uploadStory: ({ title, content, type, audioUrl, videoUrl, isAnonymous }: any) => {
    const store = getStore();
    const story: Story = {
      id: `story-${Math.random().toString(36).slice(2)}`,
      title,
      content,
      type,
      audioUrl,
      videoUrl,
      author: { name: 'You', avatar: '' },
      tags: [],
      publishedAt: new Date(),
      engagement: { likes: 0, comments: 0, shares: 0, views: 0, saves: 0, helpfulVotes: 0 },
      isAnonymous: !!isAnonymous,
    };
    store.stories.unshift(story);
    setStore(store);
    return story;
  },
  trackStoryEngagement: (storyId: string, type: 'view' | 'like' | 'share' | 'comment') => ({ storyId, type }),
  submitReliefRating: (clipId: string, userId: string, rating: number, notes?: string) => ({ clipId, userId, rating, notes }),

  // Data maintenance
  clearData: () => { if (typeof window !== 'undefined') localStorage.removeItem('madmall-data'); },
  regenerateData: () => { const data = generateBulkData(); setStore(data); },
} as const;
>>>>>>> 8085799 (chore: sync local changes before rebase)

export default api;
