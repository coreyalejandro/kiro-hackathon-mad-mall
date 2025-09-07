import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetStatsOutput, CommunityStats } from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Community stats handler
 * Maps to GET /api/stats endpoint from Express server
 */
export const statsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const stats = await mockDataService.getCommunityStats();
    
    const response: GetStatsOutput = {
      stats: {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        totalCircles: stats.totalCircles,
        totalStories: stats.totalStories,
        totalBusinesses: stats.totalBusinesses,
        totalProducts: stats.totalProducts,
        storiesThisWeek: stats.storiesThisWeek,
        newMembersThisWeek: stats.newMembersThisWeek,
        engagementRate: stats.engagementRate,
        averageSessionTime: stats.averageSessionTime
      },
      timestamp: new Date()
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
    console.error('Stats handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve community stats',
        requestId: event.requestContext?.requestId
      })
    };
  }
};