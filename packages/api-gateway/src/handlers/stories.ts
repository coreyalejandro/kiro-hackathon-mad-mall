import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetStoriesOutput, 
  GetFeaturedStoriesOutput,
  StoryType,
  StoryStatus,
  ContentModerationStatus
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Get stories handler
 * Maps to GET /api/stories endpoint from Express server
 */
export const getStoriesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const stories = await mockDataService.getUserStories(limit);
    
    const response: GetStoriesOutput = {
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        content: story.content,
        excerpt: story.excerpt,
        author: {
          id: story.author.id,
          displayName: story.author.displayName,
          avatar: story.author.avatar,
          isVerified: story.author.isVerified
        },
        type: story.type as StoryType,
        status: StoryStatus.PUBLISHED,
        themes: story.themes || [],
        tags: story.tags || [],
        circleId: story.circleId,
        engagement: {
          likes: story.engagement?.likes || 0,
          comments: story.engagement?.comments || 0,
          shares: story.engagement?.shares || 0,
          saves: story.engagement?.saves || 0,
          views: story.engagement?.views || 0,
          helpfulVotes: story.engagement?.helpfulVotes || 0
        },
        metadata: {
          readTime: story.metadata?.readTime || 5,
          wordCount: story.metadata?.wordCount || 500,
          culturalElements: story.metadata?.culturalElements || [],
          therapeuticValue: story.metadata?.therapeuticValue || [],
          triggerWarnings: story.metadata?.triggerWarnings,
          ageAppropriate: story.metadata?.ageAppropriate ?? true
        },
        moderationStatus: ContentModerationStatus.APPROVED,
        moderationNotes: story.moderationNotes,
        featuredAt: story.featuredAt ? new Date(story.featuredAt) : undefined,
        publishedAt: story.publishedAt ? new Date(story.publishedAt) : undefined,
        createdAt: new Date(story.createdAt),
        updatedAt: new Date(story.updatedAt)
      })),
      pagination: {
        totalCount: stories.length,
        itemCount: stories.length,
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
    console.error('Get stories handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve stories',
        requestId: event.requestContext?.requestId
      })
    };
  }
};

/**
 * Get featured stories handler
 * Maps to GET /api/stories/featured endpoint from Express server
 */
export const getFeaturedStoriesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const limit = parseInt(event.queryStringParameters?.limit || '3');
    const stories = await mockDataService.getFeaturedStories(limit);
    
    const response: GetFeaturedStoriesOutput = {
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        content: story.content,
        excerpt: story.excerpt,
        author: {
          id: story.author.id,
          displayName: story.author.displayName,
          avatar: story.author.avatar,
          isVerified: story.author.isVerified
        },
        type: story.type as StoryType,
        status: StoryStatus.PUBLISHED,
        themes: story.themes || [],
        tags: story.tags || [],
        circleId: story.circleId,
        engagement: {
          likes: story.engagement?.likes || 0,
          comments: story.engagement?.comments || 0,
          shares: story.engagement?.shares || 0,
          saves: story.engagement?.saves || 0,
          views: story.engagement?.views || 0,
          helpfulVotes: story.engagement?.helpfulVotes || 0
        },
        metadata: {
          readTime: story.metadata?.readTime || 5,
          wordCount: story.metadata?.wordCount || 500,
          culturalElements: story.metadata?.culturalElements || [],
          therapeuticValue: story.metadata?.therapeuticValue || [],
          triggerWarnings: story.metadata?.triggerWarnings,
          ageAppropriate: story.metadata?.ageAppropriate ?? true
        },
        moderationStatus: ContentModerationStatus.APPROVED,
        moderationNotes: story.moderationNotes,
        featuredAt: story.featuredAt ? new Date(story.featuredAt) : undefined,
        publishedAt: story.publishedAt ? new Date(story.publishedAt) : undefined,
        createdAt: new Date(story.createdAt),
        updatedAt: new Date(story.updatedAt)
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
    console.error('Get featured stories handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve featured stories',
        requestId: event.requestContext?.requestId
      })
    };
  }
};