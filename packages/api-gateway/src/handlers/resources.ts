import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetResourcesOutput, 
  GetFeaturedResourcesOutput
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Get resources handler
 * Maps to GET /api/resources endpoint from Express server
 */
export const getResourcesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const category = event.queryStringParameters?.category;
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const resources = await mockDataService.getResourceArticles(category, limit);
    
    const response: GetResourcesOutput = {
      resources: resources.map(resource => ({
        id: resource.id,
        title: resource.title,
        content: resource.content,
        excerpt: resource.excerpt,
        author: {
          id: resource.author.id,
          displayName: resource.author.displayName,
          avatar: resource.author.avatar,
          isVerified: resource.author.isVerified
        },
        category: resource.category,
        tags: resource.tags || [],
        readTime: resource.readTime || 5,
        difficulty: resource.difficulty || 'beginner',
        culturalRelevance: resource.culturalRelevance || [],
        therapeuticValue: resource.therapeuticValue || [],
        views: resource.views || 0,
        saves: resource.saves || 0,
        helpfulVotes: resource.helpfulVotes || 0,
        isFeatured: resource.isFeatured || false,
        publishedAt: new Date(resource.publishedAt),
        createdAt: new Date(resource.createdAt),
        updatedAt: new Date(resource.updatedAt)
      })),
      pagination: {
        totalCount: resources.length,
        itemCount: resources.length,
        nextToken: undefined
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Get resources handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve resources',
        requestId: event.requestContext?.requestId
      })
    };
  }
};

/**
 * Get featured resources handler
 * Maps to GET /api/resources/featured endpoint from Express server
 */
export const getFeaturedResourcesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const limit = parseInt(event.queryStringParameters?.limit || '4');
    const resources = await mockDataService.getFeaturedResources(limit);
    
    const response: GetFeaturedResourcesOutput = {
      resources: resources.map(resource => ({
        id: resource.id,
        title: resource.title,
        content: resource.content,
        excerpt: resource.excerpt,
        author: {
          id: resource.author.id,
          displayName: resource.author.displayName,
          avatar: resource.author.avatar,
          isVerified: resource.author.isVerified
        },
        category: resource.category,
        tags: resource.tags || [],
        readTime: resource.readTime || 5,
        difficulty: resource.difficulty || 'beginner',
        culturalRelevance: resource.culturalRelevance || [],
        therapeuticValue: resource.therapeuticValue || [],
        views: resource.views || 0,
        saves: resource.saves || 0,
        helpfulVotes: resource.helpfulVotes || 0,
        isFeatured: resource.isFeatured || false,
        publishedAt: new Date(resource.publishedAt),
        createdAt: new Date(resource.createdAt),
        updatedAt: new Date(resource.updatedAt)
      }))
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Get featured resources handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve featured resources',
        requestId: event.requestContext?.requestId
      })
    };
  }
};