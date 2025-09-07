import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetDiscussionsOutput, 
  GetActiveDiscussionsOutput,
  ContentModerationStatus
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Get discussions handler
 * Maps to GET /api/discussions endpoint from Express server
 */
export const getDiscussionsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const circleId = event.queryStringParameters?.circleId;
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const discussions = await mockDataService.getPeerDiscussions(circleId, limit);
    
    const response: GetDiscussionsOutput = {
      discussions: discussions.map(discussion => ({
        id: discussion.id,
        title: discussion.title,
        content: discussion.content,
        author: {
          id: discussion.author.id,
          displayName: discussion.author.displayName,
          avatar: discussion.author.avatar,
          isVerified: discussion.author.isVerified
        },
        circleId: discussion.circleId,
        tags: discussion.tags || [],
        replies: discussion.replies || 0,
        lastActivity: new Date(discussion.lastActivity),
        isPinned: discussion.isPinned || false,
        isLocked: discussion.isLocked || false,
        moderationStatus: ContentModerationStatus.APPROVED,
        createdAt: new Date(discussion.createdAt),
        updatedAt: new Date(discussion.updatedAt)
      })),
      pagination: {
        totalCount: discussions.length,
        itemCount: discussions.length,
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
    console.error('Get discussions handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve discussions',
        requestId: event.requestContext?.requestId
      })
    };
  }
};

/**
 * Get active discussions handler
 * Maps to GET /api/discussions/active endpoint from Express server
 */
export const getActiveDiscussionsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const limit = parseInt(event.queryStringParameters?.limit || '5');
    const discussions = await mockDataService.getActiveDiscussions(limit);
    
    const response: GetActiveDiscussionsOutput = {
      discussions: discussions.map(discussion => ({
        id: discussion.id,
        title: discussion.title,
        content: discussion.content,
        author: {
          id: discussion.author.id,
          displayName: discussion.author.displayName,
          avatar: discussion.author.avatar,
          isVerified: discussion.author.isVerified
        },
        circleId: discussion.circleId,
        tags: discussion.tags || [],
        replies: discussion.replies || 0,
        lastActivity: new Date(discussion.lastActivity),
        isPinned: discussion.isPinned || false,
        isLocked: discussion.isLocked || false,
        moderationStatus: ContentModerationStatus.APPROVED,
        createdAt: new Date(discussion.createdAt),
        updatedAt: new Date(discussion.updatedAt)
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
    console.error('Get active discussions handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve active discussions',
        requestId: event.requestContext?.requestId
      })
    };
  }
};