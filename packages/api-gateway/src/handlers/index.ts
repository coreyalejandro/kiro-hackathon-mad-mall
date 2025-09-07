/**
 * Lambda Handler Exports
 * Centralized exports for all Lambda handlers implementing Smithy-generated interfaces
 */

// Health and System handlers
export { healthHandler } from './health';
export { statsHandler } from './stats';
export { getHighlightsHandler } from './highlights';

// Story handlers
export { getStoriesHandler, getFeaturedStoriesHandler } from './stories';

// Comedy handlers
export { getComedyHandler, getFeaturedComedyHandler } from './comedy';

// Discussion handlers
export { getDiscussionsHandler, getActiveDiscussionsHandler } from './discussions';

// Resource handlers
export { getResourcesHandler, getFeaturedResourcesHandler } from './resources';

// Product handlers
export { getProductsHandler, getFeaturedProductsHandler } from './products';

// User handlers
export { getUserProfilesHandler } from './users';

// Search and recommendation handlers
export { searchHandler, getRecommendationsHandler, getCategoriesHandler } from './search';

// Interaction handlers
export { interactWithContentHandler } from './interactions';