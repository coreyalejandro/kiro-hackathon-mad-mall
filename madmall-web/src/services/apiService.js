/**
 * API Service for connecting to the CoT-Self-Instruct generated data backend
 * Replaces console.log calls with actual API interactions
 */

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generic fetch with error handling and caching
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${url}${JSON.stringify(options)}`;
    
    // Check cache first (for GET requests)
    if (!options.method || options.method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.fetch('/health');
  }

  /**
   * Community stats for dashboard
   */
  async getCommunityStats() {
    return this.fetch('/stats');
  }

  /**
   * Today's highlights for Concourse
   */
  async getTodaysHighlights() {
    return this.fetch('/highlights');
  }

  /**
   * User Stories API calls
   */
  async getUserStories(limit = 10) {
    return this.fetch(`/stories?limit=${limit}`);
  }

  async getFeaturedStories(limit = 3) {
    return this.fetch(`/stories/featured?limit=${limit}`);
  }

  /**
   * Comedy Content API calls
   */
  async getComedyContent(category = null, limit = 10) {
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : '';
    return this.fetch(`/comedy?limit=${limit}${categoryParam}`);
  }

  async getFeaturedComedy(limit = 3) {
    return this.fetch(`/comedy/featured?limit=${limit}`);
  }

  /**
   * Peer Discussions API calls
   */
  async getPeerDiscussions(circleId = null, limit = 10) {
    const circleParam = circleId ? `&circleId=${encodeURIComponent(circleId)}` : '';
    return this.fetch(`/discussions?limit=${limit}${circleParam}`);
  }

  async getActiveDiscussions(limit = 5) {
    return this.fetch(`/discussions/active?limit=${limit}`);
  }

  /**
   * Resource Articles API calls
   */
  async getResourceArticles(category = null, limit = 10) {
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : '';
    return this.fetch(`/resources?limit=${limit}${categoryParam}`);
  }

  async getFeaturedResources(limit = 4) {
    return this.fetch(`/resources/featured?limit=${limit}`);
  }

  /**
   * Product Reviews API calls
   */
  async getProductReviews(category = null, limit = 10) {
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : '';
    return this.fetch(`/products?limit=${limit}${categoryParam}`);
  }

  async getFeaturedProducts(limit = 6) {
    return this.fetch(`/products/featured?limit=${limit}`);
  }

  /**
   * User Profiles API calls
   */
  async getUserProfiles(limit = 10) {
    return this.fetch(`/users?limit=${limit}`);
  }

  /**
   * Search functionality
   */
  async search(query, contentType = 'all', limit = 20) {
    const params = new URLSearchParams({
      q: query,
      type: contentType,
      limit: limit.toString()
    });
    return this.fetch(`/search?${params}`);
  }

  /**
   * Get categories for filtering
   */
  async getCategories(contentType) {
    return this.fetch(`/categories/${contentType}`);
  }

  /**
   * User interactions (like, save, share)
   */
  async interactWithContent(contentId, action, contentType) {
    return this.fetch('/interact', {
      method: 'POST',
      body: JSON.stringify({
        contentId,
        action,
        contentType
      })
    });
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId = 'default', contentType = 'all', limit = 5) {
    const params = new URLSearchParams({
      userId,
      type: contentType,
      limit: limit.toString()
    });
    return this.fetch(`/recommendations?${params}`);
  }

  /**
   * Convenience methods for common UI interactions
   */
  async likeContent(contentId, contentType) {
    return this.interactWithContent(contentId, 'like', contentType);
  }

  async saveContent(contentId, contentType) {
    return this.interactWithContent(contentId, 'save', contentType);
  }

  async shareContent(contentId, contentType) {
    return this.interactWithContent(contentId, 'share', contentType);
  }

  async watchContent(contentId, contentType) {
    return this.interactWithContent(contentId, 'watch', contentType);
  }

  async readContent(contentId, contentType) {
    return this.interactWithContent(contentId, 'read', contentType);
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats (useful for debugging)
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;