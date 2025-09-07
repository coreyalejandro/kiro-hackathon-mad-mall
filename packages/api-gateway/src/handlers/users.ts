import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetUserProfilesOutput,
  DiagnosisStage,
  CommunicationStyle,
  ProfileVisibility
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Get user profiles handler
 * Maps to GET /api/users endpoint from Express server
 */
export const getUserProfilesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const users = await mockDataService.getUserProfiles(limit);
    
    const response: GetUserProfilesOutput = {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        profile: {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          bio: user.profile.bio,
          culturalBackground: user.profile.culturalBackground || [],
          communicationStyle: user.profile.communicationStyle as CommunicationStyle || CommunicationStyle.NO_PREFERENCE,
          diagnosisStage: user.profile.diagnosisStage as DiagnosisStage || DiagnosisStage.NEWLY_DIAGNOSED,
          supportNeeds: user.profile.supportNeeds || [],
          location: user.profile.location,
          joinDate: new Date(user.profile.joinDate),
          lastActive: new Date(user.profile.lastActive)
        },
        preferences: {
          profileVisibility: user.preferences?.profileVisibility as ProfileVisibility || ProfileVisibility.CIRCLES_ONLY,
          showRealName: user.preferences?.showRealName ?? true,
          allowDirectMessages: user.preferences?.allowDirectMessages ?? true,
          shareHealthJourney: user.preferences?.shareHealthJourney ?? false,
          emailNotifications: user.preferences?.emailNotifications ?? true,
          pushNotifications: user.preferences?.pushNotifications ?? true,
          weeklyDigest: user.preferences?.weeklyDigest ?? true,
          circleNotifications: user.preferences?.circleNotifications ?? true,
          contentPreferences: user.preferences?.contentPreferences || [],
          circleInterests: user.preferences?.circleInterests || []
        },
        settings: {
          theme: user.settings?.theme || 'auto',
          language: user.settings?.language || 'en',
          timezone: user.settings?.timezone || 'UTC',
          accessibility: {
            highContrast: user.settings?.accessibility?.highContrast ?? false,
            largeText: user.settings?.accessibility?.largeText ?? false,
            screenReader: user.settings?.accessibility?.screenReader ?? false,
            reducedMotion: user.settings?.accessibility?.reducedMotion ?? false
          }
        },
        primaryGoals: user.primaryGoals || [],
        isVerified: user.isVerified ?? false,
        isActive: user.isActive ?? true,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        version: user.version || 1,
        stats: user.stats ? {
          storiesShared: user.stats.storiesShared || 0,
          circlesJoined: user.stats.circlesJoined || 0,
          commentsPosted: user.stats.commentsPosted || 0,
          helpfulVotes: user.stats.helpfulVotes || 0,
          daysActive: user.stats.daysActive || 0,
          streakDays: user.stats.streakDays || 0
        } : undefined
      })),
      pagination: {
        totalCount: users.length,
        itemCount: users.length,
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
    console.error('Get user profiles handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user profiles',
        requestId: event.requestContext?.requestId
      })
    };
  }
};