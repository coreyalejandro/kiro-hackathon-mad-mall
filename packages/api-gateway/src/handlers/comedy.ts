import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetComedyOutput, 
  GetFeaturedComedyOutput,
  ContentModerationStatus
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Get comedy content handler
 * Maps to GET /api/comedy endpoint from Express server
 */
export const getComedyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const category = event.queryStringParameters?.category;
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const comedy = await mockDataService.getComedyContent(category, limit);
    
    const response: GetComedyOutput = {
      comedy: comedy.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        author: {
          id: item.author.id,
          displayName: item.author.displayName,
          avatar: item.author.avatar,
          isVerified: item.author.isVerified
        },
        category: item.category,
        tags: item.tags || [],
        contentType: item.contentType,
        culturalStyle: item.culturalStyle,
        appropriatenessRating: item.appropriatenessRating,
        likes: item.likes || 0,
        shares: item.shares || 0,
        views: item.views || 0,
        isFeatured: item.isFeatured || false,
        publishedAt: new Date(item.publishedAt),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      })),
      pagination: {
        totalCount: comedy.length,
        itemCount: comedy.length,
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
    console.error('Get comedy handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve comedy content',
        requestId: event.requestContext?.requestId
      })
    };
  }
};

/**
 * Get featured comedy content handler
 * Maps to GET /api/comedy/featured endpoint from Express server
 */
export const getFeaturedComedyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const limit = parseInt(event.queryStringParameters?.limit || '3');
    const comedy = await mockDataService.getFeaturedComedy(limit);
    
    const response: GetFeaturedComedyOutput = {
      comedy: comedy.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        author: {
          id: item.author.id,
          displayName: item.author.displayName,
          avatar: item.author.avatar,
          isVerified: item.author.isVerified
        },
        category: item.category,
        tags: item.tags || [],
        contentType: item.contentType,
        culturalStyle: item.culturalStyle,
        appropriatenessRating: item.appropriatenessRating,
        likes: item.likes || 0,
        shares: item.shares || 0,
        views: item.views || 0,
        isFeatured: item.isFeatured || false,
        publishedAt: new Date(item.publishedAt),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
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
    console.error('Get featured comedy handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve featured comedy content',
        requestId: event.requestContext?.requestId
      })
    };
  }
};