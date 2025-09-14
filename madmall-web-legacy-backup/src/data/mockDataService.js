/**
 * Mock Data Service
 * Provides realistic synthetic data generated using CoT-Self-Instruct methodology
 * This replaces the console.log placeholders with actual interactive data
 */

import SyntheticDataGenerator from './generators/syntheticDataGenerator.js';

class MockDataService {
  constructor() {
    this.generator = new SyntheticDataGenerator();
    this.data = null;
    this.initialized = false;
  }

  /**
   * Initialize the data service with generated content
   */
  async initialize() {
    if (this.initialized) return this.data;
    
    console.log('🚀 Initializing Mock Data Service with CoT-Self-Instruct...');
    this.data = this.generator.generateAllContent();
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

  /**
   * Get user stories for Story Booth
   */
  async getUserStories(limit = 10) {
    await this.initialize();
    return this.data.userStories
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get featured stories (highest engagement)
   */
  async getFeaturedStories(limit = 3) {
    await this.initialize();
    return this.data.userStories
      .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
      .slice(0, limit);
  }

  /**
   * Get comedy content for Comedy Lounge
   */
  async getComedyContent(category = null, limit = 10) {
    await this.initialize();
    let content = this.data.comedyContent;
    
    if (category) {
      content = content.filter(item => item.category === category);
    }
    
    return content
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get featured comedy (highest ratings)
   */
  async getFeaturedComedy(limit = 3) {
    await this.initialize();
    return this.data.comedyContent
      .sort((a, b) => parseFloat(b.reliefRating) - parseFloat(a.reliefRating))
      .slice(0, limit);
  }

  /**
   * Get peer circle discussions
   */
  async getPeerDiscussions(circleId = null, limit = 10) {
    await this.initialize();
    let discussions = this.data.peerDiscussions;
    
    if (circleId) {
      discussions = discussions.filter(item => item.circleId === circleId);
    }
    
    return discussions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get active discussions (most recent activity)
   */
  async getActiveDiscussions(limit = 5) {
    await this.initialize();
    return this.data.peerDiscussions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get resource articles
   */
  async getResourceArticles(category = null, limit = 10) {
    await this.initialize();
    let articles = this.data.resourceArticles;
    
    if (category) {
      articles = articles.filter(item => item.category === category);
    }
    
    return articles
      .sort((a, b) => b.helpfulVotes - a.helpfulVotes)
      .slice(0, limit);
  }

  /**
   * Get featured resources (most helpful)
   */
  async getFeaturedResources(limit = 4) {
    await this.initialize();
    return this.data.resourceArticles
      .sort((a, b) => b.helpfulVotes - a.helpfulVotes)
      .slice(0, limit);
  }

  /**
   * Get product reviews for Marketplace
   */
  async getProductReviews(category = null, limit = 10) {
    await this.initialize();
    let reviews = this.data.productReviews;
    
    if (category) {
      reviews = reviews.filter(item => item.category === category);
    }
    
    return reviews
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, limit);
  }

  /**
   * Get featured products (highest rated)
   */
  async getFeaturedProducts(limit = 6) {
    await this.initialize();
    return this.data.productReviews
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, limit);
  }

  /**
   * Get user profiles
   */
  async getUserProfiles(limit = 10) {
    await this.initialize();
    return this.data.userProfiles
      .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
      .slice(0, limit);
  }

  /**
   * Get community stats for dashboard
   */
  async getCommunityStats() {
    await this.initialize();
    
    const totalMembers = this.data.userProfiles.length;
    const activeDiscussions = this.data.peerDiscussions.filter(d => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(d.timestamp) > dayAgo;
    }).length;
    
    const newStoriesThisWeek = this.data.userStories.filter(s => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(s.timestamp) > weekAgo;
    }).length;
    
    const featuredBrands = [...new Set(this.data.productReviews.map(r => r.brand))].length;
    
    return {
      totalMembers,
      activeDiscussions,
      newStoriesThisWeek,
      featuredBrands,
      totalResources: this.data.resourceArticles.length,
      comedyClips: this.data.comedyContent.length
    };
  }

  /**
   * Get today's highlights for Concourse
   */
  async getTodaysHighlights() {
    await this.initialize();
    
    const recentDiscussion = this.data.peerDiscussions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    const topComedy = this.data.comedyContent
      .sort((a, b) => parseFloat(b.reliefRating) - parseFloat(a.reliefRating))[0];
    
    const featuredBrand = this.data.productReviews
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))[0];
    
    return {
      activeDiscussion: recentDiscussion,
      comedyRelief: topComedy,
      featuredBrand: featuredBrand
    };
  }

  /**
   * Search functionality across all content
   */
  async search(query, contentType = 'all', limit = 20) {
    await this.initialize();
    
    const searchTerm = query.toLowerCase();
    let results = [];
    
    if (contentType === 'all' || contentType === 'stories') {
      const storyResults = this.data.userStories
        .filter(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          item.themes.some(theme => theme.includes(searchTerm))
        )
        .map(item => ({ ...item, type: 'story' }));
      results.push(...storyResults);
    }
    
    if (contentType === 'all' || contentType === 'comedy') {
      const comedyResults = this.data.comedyContent
        .filter(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
        )
        .map(item => ({ ...item, type: 'comedy' }));
      results.push(...comedyResults);
    }
    
    if (contentType === 'all' || contentType === 'discussions') {
      const discussionResults = this.data.peerDiscussions
        .filter(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
        )
        .map(item => ({ ...item, type: 'discussion' }));
      results.push(...discussionResults);
    }
    
    if (contentType === 'all' || contentType === 'resources') {
      const resourceResults = this.data.resourceArticles
        .filter(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.summary.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
        )
        .map(item => ({ ...item, type: 'resource' }));
      results.push(...resourceResults);
    }
    
    if (contentType === 'all' || contentType === 'products') {
      const productResults = this.data.productReviews
        .filter(item => 
          item.productName.toLowerCase().includes(searchTerm) ||
          item.brand.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
        )
        .map(item => ({ ...item, type: 'product' }));
      results.push(...productResults);
    }
    
    return results
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get content by category for filtering
   */
  async getCategories(contentType) {
    await this.initialize();
    
    switch (contentType) {
      case 'comedy':
        return [...new Set(this.data.comedyContent.map(item => item.category))];
      case 'discussions':
        return [...new Set(this.data.peerDiscussions.map(item => item.category))];
      case 'resources':
        return [...new Set(this.data.resourceArticles.map(item => item.category))];
      case 'products':
        return [...new Set(this.data.productReviews.map(item => item.category))];
      default:
        return [];
    }
  }

  /**
   * Simulate user interactions (like, save, share)
   */
  async interactWithContent(contentId, action, contentType) {
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
  async getRecommendations(userId, contentType = 'all', limit = 5) {
    await this.initialize();
    
    // Simple recommendation: return highest rated/most engaging content
    let recommendations = [];
    
    if (contentType === 'all' || contentType === 'stories') {
      const topStories = this.data.userStories
        .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
        .slice(0, 2);
      recommendations.push(...topStories.map(item => ({ ...item, type: 'story' })));
    }
    
    if (contentType === 'all' || contentType === 'comedy') {
      const topComedy = this.data.comedyContent
        .sort((a, b) => parseFloat(b.reliefRating) - parseFloat(a.reliefRating))
        .slice(0, 2);
      recommendations.push(...topComedy.map(item => ({ ...item, type: 'comedy' })));
    }
    
    if (contentType === 'all' || contentType === 'resources') {
      const topResources = this.data.resourceArticles
        .sort((a, b) => b.helpfulVotes - a.helpfulVotes)
        .slice(0, 1);
      recommendations.push(...topResources.map(item => ({ ...item, type: 'resource' })));
    }
    
    return recommendations.slice(0, limit);
  }
}

// Create singleton instance
const mockDataService = new MockDataService();

export default mockDataService;