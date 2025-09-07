import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetHighlightsOutput,
  StoryType,
  StoryStatus,
  ContentModerationStatus,
  CircleType,
  CirclePrivacyLevel,
  ModerationLevel,
  BusinessType,
  BusinessStatus
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Get today's highlights handler
 * Maps to GET /api/highlights endpoint from Express server
 */
export const getHighlightsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const highlights = await mockDataService.getTodaysHighlights();
    
    const response: GetHighlightsOutput = {
      highlights: {
        featuredStory: {
          id: highlights.featuredStory.id,
          title: highlights.featuredStory.title,
          content: highlights.featuredStory.content,
          excerpt: highlights.featuredStory.excerpt,
          author: {
            id: highlights.featuredStory.author.id,
            displayName: highlights.featuredStory.author.displayName,
            avatar: highlights.featuredStory.author.avatar,
            isVerified: highlights.featuredStory.author.isVerified
          },
          type: highlights.featuredStory.type as StoryType,
          status: StoryStatus.PUBLISHED,
          themes: highlights.featuredStory.themes || [],
          tags: highlights.featuredStory.tags || [],
          circleId: highlights.featuredStory.circleId,
          engagement: {
            likes: highlights.featuredStory.engagement?.likes || 0,
            comments: highlights.featuredStory.engagement?.comments || 0,
            shares: highlights.featuredStory.engagement?.shares || 0,
            saves: highlights.featuredStory.engagement?.saves || 0,
            views: highlights.featuredStory.engagement?.views || 0,
            helpfulVotes: highlights.featuredStory.engagement?.helpfulVotes || 0
          },
          metadata: {
            readTime: highlights.featuredStory.metadata?.readTime || 5,
            wordCount: highlights.featuredStory.metadata?.wordCount || 500,
            culturalElements: highlights.featuredStory.metadata?.culturalElements || [],
            therapeuticValue: highlights.featuredStory.metadata?.therapeuticValue || [],
            triggerWarnings: highlights.featuredStory.metadata?.triggerWarnings,
            ageAppropriate: highlights.featuredStory.metadata?.ageAppropriate ?? true
          },
          moderationStatus: ContentModerationStatus.APPROVED,
          moderationNotes: highlights.featuredStory.moderationNotes,
          featuredAt: highlights.featuredStory.featuredAt ? new Date(highlights.featuredStory.featuredAt) : undefined,
          publishedAt: highlights.featuredStory.publishedAt ? new Date(highlights.featuredStory.publishedAt) : undefined,
          createdAt: new Date(highlights.featuredStory.createdAt),
          updatedAt: new Date(highlights.featuredStory.updatedAt)
        },
        trendingCircle: {
          id: highlights.trendingCircle.id,
          name: highlights.trendingCircle.name,
          description: highlights.trendingCircle.description,
          type: highlights.trendingCircle.type as CircleType,
          privacyLevel: highlights.trendingCircle.privacyLevel as CirclePrivacyLevel || CirclePrivacyLevel.PUBLIC,
          settings: {
            isPrivate: highlights.trendingCircle.settings?.isPrivate ?? false,
            requireApproval: highlights.trendingCircle.settings?.requireApproval ?? false,
            maxMembers: highlights.trendingCircle.settings?.maxMembers,
            culturalFocus: highlights.trendingCircle.settings?.culturalFocus || [],
            allowGuestPosts: highlights.trendingCircle.settings?.allowGuestPosts ?? true,
            moderationLevel: highlights.trendingCircle.settings?.moderationLevel as ModerationLevel || ModerationLevel.MODERATE,
            contentGuidelines: highlights.trendingCircle.settings?.contentGuidelines,
            meetingSchedule: highlights.trendingCircle.settings?.meetingSchedule
          },
          members: highlights.trendingCircle.members || [],
          moderators: highlights.trendingCircle.moderators || [],
          tags: highlights.trendingCircle.tags || [],
          coverImage: highlights.trendingCircle.coverImage,
          stats: {
            memberCount: highlights.trendingCircle.stats?.memberCount || 0,
            activeMembers: highlights.trendingCircle.stats?.activeMembers || 0,
            postsThisWeek: highlights.trendingCircle.stats?.postsThisWeek || 0,
            postsThisMonth: highlights.trendingCircle.stats?.postsThisMonth || 0,
            engagementRate: highlights.trendingCircle.stats?.engagementRate || 0,
            averageResponseTime: highlights.trendingCircle.stats?.averageResponseTime || 0
          },
          createdBy: highlights.trendingCircle.createdBy,
          createdAt: new Date(highlights.trendingCircle.createdAt),
          updatedAt: new Date(highlights.trendingCircle.updatedAt),
          isActive: highlights.trendingCircle.isActive ?? true
        },
        newBusinessSpotlight: {
          id: highlights.newBusinessSpotlight.id,
          profile: {
            name: highlights.newBusinessSpotlight.profile.name,
            description: highlights.newBusinessSpotlight.profile.description,
            mission: highlights.newBusinessSpotlight.profile.mission,
            foundedYear: highlights.newBusinessSpotlight.profile.foundedYear,
            founderStory: highlights.newBusinessSpotlight.profile.founderStory,
            website: highlights.newBusinessSpotlight.profile.website,
            socialMedia: highlights.newBusinessSpotlight.profile.socialMedia || {},
            contact: {
              email: highlights.newBusinessSpotlight.profile.contact.email,
              phone: highlights.newBusinessSpotlight.profile.contact.phone,
              address: highlights.newBusinessSpotlight.profile.contact.address
            },
            logo: highlights.newBusinessSpotlight.profile.logo,
            coverImage: highlights.newBusinessSpotlight.profile.coverImage,
            gallery: highlights.newBusinessSpotlight.profile.gallery || []
          },
          type: highlights.newBusinessSpotlight.type as BusinessType,
          status: highlights.newBusinessSpotlight.status as BusinessStatus || BusinessStatus.ACTIVE,
          certifications: highlights.newBusinessSpotlight.certifications || [],
          specialties: highlights.newBusinessSpotlight.specialties || [],
          servicesOffered: highlights.newBusinessSpotlight.servicesOffered || [],
          targetAudience: highlights.newBusinessSpotlight.targetAudience || [],
          culturalCompetencies: highlights.newBusinessSpotlight.culturalCompetencies || [],
          metrics: {
            rating: highlights.newBusinessSpotlight.metrics?.rating || 0,
            reviewCount: highlights.newBusinessSpotlight.metrics?.reviewCount || 0,
            trustScore: highlights.newBusinessSpotlight.metrics?.trustScore || 0,
            responseRate: highlights.newBusinessSpotlight.metrics?.responseRate || 0,
            averageResponseTime: highlights.newBusinessSpotlight.metrics?.averageResponseTime || 0,
            repeatCustomerRate: highlights.newBusinessSpotlight.metrics?.repeatCustomerRate || 0
          },
          ownerId: highlights.newBusinessSpotlight.ownerId,
          verifiedAt: highlights.newBusinessSpotlight.verifiedAt ? new Date(highlights.newBusinessSpotlight.verifiedAt) : undefined,
          featuredUntil: highlights.newBusinessSpotlight.featuredUntil ? new Date(highlights.newBusinessSpotlight.featuredUntil) : undefined,
          createdAt: new Date(highlights.newBusinessSpotlight.createdAt),
          updatedAt: new Date(highlights.newBusinessSpotlight.updatedAt)
        },
        communityMilestone: highlights.communityMilestone,
        dailyWellnessTip: highlights.dailyWellnessTip,
        upcomingEvents: highlights.upcomingEvents?.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : undefined,
          organizer: event.organizer,
          circleId: event.circleId,
          isVirtual: event.isVirtual,
          location: event.location,
          maxAttendees: event.maxAttendees,
          currentAttendees: event.currentAttendees
        })) || []
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
    console.error('Get highlights handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve today\'s highlights',
        requestId: event.requestContext?.requestId
      })
    };
  }
};