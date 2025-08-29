/**
 * React Hook for API Data Fetching
 * Provides easy access to CoT-Self-Instruct generated data with loading states
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService.js';

/**
 * Generic hook for API data fetching
 */
export function useApiData(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Hook for community stats
 */
export function useCommunityStats() {
  return useApiData(() => apiService.getCommunityStats());
}

/**
 * Hook for today's highlights
 */
export function useTodaysHighlights() {
  return useApiData(() => apiService.getTodaysHighlights());
}

/**
 * Hook for user stories
 */
export function useUserStories(limit = 10) {
  return useApiData(() => apiService.getUserStories(limit), [limit]);
}

/**
 * Hook for featured stories
 */
export function useFeaturedStories(limit = 3) {
  return useApiData(() => apiService.getFeaturedStories(limit), [limit]);
}

/**
 * Hook for comedy content
 */
export function useComedyContent(category = null, limit = 10) {
  return useApiData(() => apiService.getComedyContent(category, limit), [category, limit]);
}

/**
 * Hook for featured comedy
 */
export function useFeaturedComedy(limit = 3) {
  return useApiData(() => apiService.getFeaturedComedy(limit), [limit]);
}

/**
 * Hook for peer discussions
 */
export function usePeerDiscussions(circleId = null, limit = 10) {
  return useApiData(() => apiService.getPeerDiscussions(circleId, limit), [circleId, limit]);
}

/**
 * Hook for active discussions
 */
export function useActiveDiscussions(limit = 5) {
  return useApiData(() => apiService.getActiveDiscussions(limit), [limit]);
}

/**
 * Hook for resource articles
 */
export function useResourceArticles(category = null, limit = 10) {
  return useApiData(() => apiService.getResourceArticles(category, limit), [category, limit]);
}

/**
 * Hook for featured resources
 */
export function useFeaturedResources(limit = 4) {
  return useApiData(() => apiService.getFeaturedResources(limit), [limit]);
}

/**
 * Hook for resource content (alias for resource articles)
 */
export function useResourceContent(category = null, limit = 10) {
  return useApiData(() => apiService.getResourceArticles(category, limit), [category, limit]);
}

/**
 * Hook for product reviews
 */
export function useProductReviews(category = null, limit = 10) {
  return useApiData(() => apiService.getProductReviews(category, limit), [category, limit]);
}

/**
 * Hook for featured products
 */
export function useFeaturedProducts(limit = 6) {
  return useApiData(() => apiService.getFeaturedProducts(limit), [limit]);
}

/**
 * Hook for user profiles
 */
export function useUserProfiles(limit = 10) {
  return useApiData(() => apiService.getUserProfiles(limit), [limit]);
}

/**
 * Hook for search functionality
 */
export function useSearch(query, contentType = 'all', limit = 20) {
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);
      const results = await apiService.search(searchQuery, contentType, limit);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err.message);
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }, [contentType, limit]);

  useEffect(() => {
    if (query) {
      const timeoutId = setTimeout(() => {
        search(query);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [query, search]);

  return { 
    searchResults, 
    searching, 
    searchError, 
    search: (newQuery) => search(newQuery) 
  };
}

/**
 * Hook for content interactions
 */
export function useContentInteraction() {
  const [interacting, setInteracting] = useState(false);
  const [interactionError, setInteractionError] = useState(null);

  const interact = useCallback(async (contentId, action, contentType) => {
    try {
      setInteracting(true);
      setInteractionError(null);
      const result = await apiService.interactWithContent(contentId, action, contentType);
      return result;
    } catch (err) {
      setInteractionError(err.message);
      console.error('Interaction error:', err);
      throw err;
    } finally {
      setInteracting(false);
    }
  }, []);

  const likeContent = useCallback((contentId, contentType) => {
    return interact(contentId, 'like', contentType);
  }, [interact]);

  const saveContent = useCallback((contentId, contentType) => {
    return interact(contentId, 'save', contentType);
  }, [interact]);

  const shareContent = useCallback((contentId, contentType) => {
    return interact(contentId, 'share', contentType);
  }, [interact]);

  const watchContent = useCallback((contentId, contentType) => {
    return interact(contentId, 'watch', contentType);
  }, [interact]);

  const readContent = useCallback((contentId, contentType) => {
    return interact(contentId, 'read', contentType);
  }, [interact]);

  return {
    interacting,
    interactionError,
    likeContent,
    saveContent,
    shareContent,
    watchContent,
    readContent
  };
}

/**
 * Hook for recommendations
 */
export function useRecommendations(userId = 'default', contentType = 'all', limit = 5) {
  return useApiData(() => apiService.getRecommendations(userId, contentType, limit), [userId, contentType, limit]);
}

/**
 * Hook for categories
 */
export function useCategories(contentType) {
  return useApiData(() => apiService.getCategories(contentType), [contentType]);
}