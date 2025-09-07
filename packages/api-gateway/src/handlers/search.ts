import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  SearchOutput, 
  GetRecommendationsOutput,
  GetCategoriesOutput,
  ContentType
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Search handler
 * Maps to GET /api/search endpoint from Express server
 */
export const searchHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.queryStringParameters?.q;
    
    if (!query) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Query parameter "q" is required'
        })
      };
    }

    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const type = event.queryStringParameters?.type || 'all';
    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const results = await mockDataService.search(query, type, limit);
    
    const response: SearchOutput = {
      results: results.map(result => ({
        id: result.id,
        type: result.type as ContentType,
        title: result.title,
        description: result.description,
        score: result.score || 1.0,
        metadata: result.metadata || {},
        url: result.url,
        thumbnail: result.thumbnail,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt)
      })),
      totalCount: results.length,
      query: query,
      searchTime: 0.1,
      suggestions: []
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
    console.error('Search handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Search failed',
        requestId: event.requestContext?.requestId
      })
    };
  }
};

/**
 * Get recommendations handler
 * Maps to GET /api/recommendations endpoint from Express server
 */
export const getRecommendationsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const userId = event.queryStringParameters?.userId || 'default';
    const type = event.queryStringParameters?.type || 'all';
    const limit = parseInt(event.queryStringParameters?.limit || '5');
    const recommendations = await mockDataService.getRecommendations(userId, type, limit);
    
    const response: GetRecommendationsOutput = {
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        type: rec.type as ContentType,
        title: rec.title,
        description: rec.description,
        score: rec.score || 1.0,
        metadata: rec.metadata || {},
        url: rec.url,
        thumbnail: rec.thumbnail,
        createdAt: new Date(rec.createdAt),
        updatedAt: new Date(rec.updatedAt)
      })),
      recommendationType: 'personalized',
      confidence: 0.85
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
    console.error('Get recommendations handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve recommendations',
        requestId: event.requestContext?.requestId
      })
    };
  }
};

/**
 * Get categories handler
 * Maps to GET /api/categories/:contentType endpoint from Express server
 */
export const getCategoriesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const contentType = event.pathParameters?.contentType;
    
    if (!contentType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          code: 'VALIDATION_ERROR',
          message: 'Content type parameter is required'
        })
      };
    }

    const categories = await mockDataService.getCategories(contentType);
    
    const response: GetCategoriesOutput = {
      categories: categories,
      contentType: contentType
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
    console.error('Get categories handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve categories',
        requestId: event.requestContext?.requestId
      })
    };
  }
};