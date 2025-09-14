// React Query hooks for MADMall platform
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './mock-api';
import { 
  CircleFilters, ComedyFilters, ProductFilters, 
  ArticleFilters, StoryFilters 
} from './types';

// Query keys
export const queryKeys = {
  mallSections: ['mall-sections'] as const,
  communityActivity: (limit?: number) => ['community-activity', limit] as const,
  platformStats: ['platform-stats'] as const,
  
  circles: (filters?: CircleFilters, page?: number, limit?: number) => 
    ['circles', filters, page, limit] as const,
  circle: (id: string) => ['circle', id] as const,
  circlePosts: (circleId: string, page?: number, limit?: number) => 
    ['circle-posts', circleId, page, limit] as const,
  
  comedyClips: (filters?: ComedyFilters, page?: number, limit?: number) => 
    ['comedy-clips', filters, page, limit] as const,
  comedyClip: (id: string) => ['comedy-clip', id] as const,
  comedyCategories: ['comedy-categories'] as const,
  
  products: (filters?: ProductFilters, page?: number, limit?: number) => 
    ['products', filters, page, limit] as const,
  product: (id: string) => ['product', id] as const,
  productCategories: ['product-categories'] as const,
  
  articles: (filters?: ArticleFilters, page?: number, limit?: number) =>
    ['articles', filters, page, limit] as const,
  article: (id: string) => ['article', id] as const,
  articleCategories: ['article-categories'] as const,
  articleFormats: ['article-formats'] as const,
  articleCredibilityLevels: ['article-credibility-levels'] as const,
  
  stories: (filters?: StoryFilters, page?: number, limit?: number) => 
    ['stories', filters, page, limit] as const,
  story: (id: string) => ['story', id] as const,
  storyTags: ['story-tags'] as const,
  
  search: (query: string, limit?: number) => ['search', query, limit] as const,
};

// Homepage queries
export const useMallSections = () => {
  return useQuery({
    queryKey: queryKeys.mallSections,
    queryFn: api.getMallSections,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCommunityActivity = (limit = 20) => {
  return useQuery({
    queryKey: queryKeys.communityActivity(limit),
    queryFn: () => api.getCommunityActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: queryKeys.platformStats,
    queryFn: api.getPlatformStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Peer Circles queries
export const useCircles = (filters?: CircleFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.circles(filters, page, limit),
    queryFn: () => api.getCircles(filters, page, limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // For pagination
  });
};

export const useCircle = (id: string) => {
  return useQuery({
    queryKey: queryKeys.circle(id),
    queryFn: () => api.getCircle(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
};

export const useCirclePosts = (circleId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.circlePosts(circleId, page, limit),
    queryFn: () => api.getCirclePosts(circleId, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!circleId,
    keepPreviousData: true,
  });
};

// Comedy Lounge queries
export const useComedyClips = (filters?: ComedyFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.comedyClips(filters, page, limit),
    queryFn: () => api.getComedyClips(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
  });
};

export const useComedyClip = (id: string) => {
  return useQuery({
    queryKey: queryKeys.comedyClip(id),
    queryFn: () => api.getComedyClip(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  });
};

export const useComedyCategories = () => {
  return useQuery({
    queryKey: queryKeys.comedyCategories,
    queryFn: api.getComedyCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Marketplace queries
export const useProducts = (filters?: ProductFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.products(filters, page, limit),
    queryFn: () => api.getProducts(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => api.getProduct(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: queryKeys.productCategories,
    queryFn: api.getProductCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Resource Hub queries
export const useArticles = (filters?: ArticleFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.articles(filters, page, limit),
    queryFn: () => api.getArticles(filters, page, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    keepPreviousData: true,
  });
};

export const useArticle = (id: string) => {
  return useQuery({
    queryKey: queryKeys.article(id),
    queryFn: () => api.getArticle(id),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!id,
  });
};

export const useArticleCategories = () => {
  return useQuery({
    queryKey: queryKeys.articleCategories,
    queryFn: api.getArticleCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useArticleFormats = () => {
  return useQuery({
    queryKey: queryKeys.articleFormats,
    queryFn: api.getArticleFormats,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useArticleCredibilityLevels = () => {
  return useQuery({
    queryKey: queryKeys.articleCredibilityLevels,
    queryFn: api.getArticleCredibilityLevels,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Story Booth queries
export const useStories = (filters?: StoryFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.stories(filters, page, limit),
    queryFn: () => {
      const items = api.getStories(filters, page, limit);
      return {
        data: items,
        pagination: {
          page,
          limit,
          total: undefined as unknown as number, // not tracked in mock
          hasMore: items.length === limit,
        },
        success: true,
        timestamp: new Date(),
      } as any;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
  });
};

export const useStory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.story(id),
    queryFn: () => api.getStory(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  });
};

export const useStoryTags = () => {
  return useQuery({
    queryKey: queryKeys.storyTags,
    queryFn: api.getStoryTags,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Search queries
export const useSearch = (query: string, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.search(query, limit),
    queryFn: () => api.searchAll(query, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: query.length > 2, // Only search if query is longer than 2 characters
  });
};

// Mutations
export const useJoinCircle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ circleId, userId }: { circleId: string; userId: string }) =>
      api.joinCircle(circleId, userId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch circles queries
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      queryClient.invalidateQueries({ queryKey: ['circle', variables.circleId] });
      queryClient.invalidateQueries({ queryKey: ['community-activity'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
};

export const useLeaveCircle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ circleId, userId }: { circleId: string; userId: string }) =>
      api.leaveCircle(circleId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      queryClient.invalidateQueries({ queryKey: ['circle', variables.circleId] });
      queryClient.invalidateQueries({ queryKey: ['community-activity'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
};

export const useCreateCirclePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ circleId, userId, content }: { circleId: string; userId: string; content: string }) =>
      api.createCirclePost(circleId, userId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['circle-posts', variables.circleId] });
      queryClient.invalidateQueries({ queryKey: ['community-activity'] });
    },
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, userId }: { productId: string; userId: string }) =>
      api.toggleWishlist(productId, userId),
    onSuccess: () => {
      // Invalidate community activity to show wishlist updates
      queryClient.invalidateQueries({ queryKey: ['community-activity'] });
    },
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ articleId, userId }: { articleId: string; userId: string }) =>
      api.toggleBookmark(articleId, userId),
    onSuccess: () => {
      // Invalidate community activity to show bookmark updates
      queryClient.invalidateQueries({ queryKey: ['community-activity'] });
    },
  });
};

export const useUploadStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      content,
      type,
      audioUrl,
      videoUrl,
      isAnonymous,
    }: {
      title: string;
      content: string;
      type: 'text' | 'audio' | 'video';
      audioUrl?: string;
      videoUrl?: string;
      isAnonymous?: boolean;
    }) =>
      api.uploadStory({ title, content, type, audioUrl, videoUrl, isAnonymous }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

export const useTrackStoryEngagement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      type,
    }: {
      storyId: string;
      type: 'view' | 'like' | 'share' | 'comment';
    }) => api.trackStoryEngagement(storyId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
};

export const useSubmitReliefRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      clipId, 
      userId, 
      rating, 
      notes 
    }: { 
      clipId: string; 
      userId: string; 
      rating: number; 
      notes?: string; 
    }) => api.submitReliefRating(clipId, userId, rating, notes),
    onSuccess: (data, variables) => {
      // Invalidate comedy clips to update average ratings
      queryClient.invalidateQueries({ queryKey: ['comedy-clips'] });
      queryClient.invalidateQueries({ queryKey: ['comedy-clip', variables.clipId] });
      queryClient.invalidateQueries({ queryKey: ['community-activity'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
};

// Utility hooks
export const useInvalidateAllQueries = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries();
  };
};

export const useClearCache = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.clear();
    api.clearData();
  };
};

export const useRegenerateData = () => {
  const queryClient = useQueryClient();
  
  return () => {
    api.regenerateData();
    queryClient.invalidateQueries();
  };
};
