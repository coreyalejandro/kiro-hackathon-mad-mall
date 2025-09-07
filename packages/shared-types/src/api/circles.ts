/**
 * Circle API Types
 * Types for circle-related API operations
 */

import { Circle, CircleMember, CircleInvitation, CircleJoinRequest } from '../domain/circle';
import { PaginationRequest, ListResponse } from './common';

// Circle retrieval requests
export interface GetCircleRequest {
  circleId: string;
  includeMembers?: boolean;
  includeStats?: boolean;
}

export interface GetCirclesRequest extends PaginationRequest {
  search?: string;
  filters?: {
    type?: string[];
    privacyLevel?: string[];
    tags?: string[];
    memberCount?: {
      min?: number;
      max?: number;
    };
    createdAfter?: string;
    isActive?: boolean;
  };
  userId?: string; // for user's circles
}

export interface GetCircleMembersRequest extends PaginationRequest {
  circleId: string;
  role?: string;
  status?: string;
  search?: string;
}

// Circle creation and updates
export interface CreateCircleRequest {
  name: string;
  description: string;
  type: string;
  privacyLevel: string;
  settings: {
    isPrivate: boolean;
    requireApproval: boolean;
    maxMembers?: number;
    culturalFocus?: string[];
    allowGuestPosts: boolean;
    moderationLevel: 'light' | 'moderate' | 'strict';
    contentGuidelines?: string;
  };
  tags: string[];
  coverImage?: string;
}

export interface UpdateCircleRequest {
  circleId: string;
  name?: string;
  description?: string;
  settings?: Partial<Circle['settings']>;
  tags?: string[];
  coverImage?: string;
}

export interface UpdateCircleStatusRequest {
  circleId: string;
  isActive: boolean;
  reason?: string;
}

// Circle responses
export interface GetCircleResponse {
  circle: Circle;
  userMembership?: CircleMember;
  canJoin: boolean;
  joinRequirement?: 'open' | 'approval' | 'invitation' | 'closed';
}

export interface GetCirclesResponse extends ListResponse<Circle> {
  facets?: {
    types: { value: string; count: number }[];
    privacyLevels: { value: string; count: number }[];
    tags: { value: string; count: number }[];
    memberRanges: { value: string; count: number }[];
  };
}

export interface CreateCircleResponse {
  circle: Circle;
}

export interface UpdateCircleResponse {
  circle: Circle;
}

export interface GetCircleMembersResponse extends ListResponse<CircleMember & { user: { id: string; displayName: string; avatar?: string } }> {}

// Circle membership operations
export interface JoinCircleRequest {
  circleId: string;
  userId: string;
  message?: string;
}

export interface LeaveCircleRequest {
  circleId: string;
  userId: string;
  reason?: string;
}

export interface UpdateMemberRoleRequest {
  circleId: string;
  userId: string;
  newRole: 'member' | 'moderator' | 'admin';
  reason?: string;
}

export interface RemoveMemberRequest {
  circleId: string;
  userId: string;
  reason: string;
  notifyMember?: boolean;
}

export interface BanMemberRequest {
  circleId: string;
  userId: string;
  reason: string;
  duration?: number; // in days, undefined for permanent
}

// Circle membership responses
export interface CircleMembershipResponse {
  success: boolean;
  message: string;
  membership?: CircleMember;
  requiresApproval?: boolean;
}

// Circle invitations
export interface CreateInvitationRequest {
  circleId: string;
  inviterId: string;
  inviteeId?: string;
  inviteeEmail?: string;
  message?: string;
  expiresIn?: number; // days
}

export interface RespondToInvitationRequest {
  invitationId: string;
  response: 'accept' | 'decline';
  message?: string;
}

export interface GetInvitationsRequest extends PaginationRequest {
  circleId?: string;
  userId?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface CancelInvitationRequest {
  invitationId: string;
  reason?: string;
}

// Circle invitation responses
export interface CreateInvitationResponse {
  invitation: CircleInvitation;
}

export interface GetInvitationsResponse extends ListResponse<CircleInvitation> {}

export interface InvitationActionResponse {
  success: boolean;
  message: string;
}

// Circle join requests
export interface GetJoinRequestsRequest extends PaginationRequest {
  circleId: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ReviewJoinRequestRequest {
  requestId: string;
  action: 'approve' | 'reject';
  message?: string;
}

export interface GetJoinRequestsResponse extends ListResponse<CircleJoinRequest & { user: { id: string; displayName: string; avatar?: string } }> {}

export interface JoinRequestActionResponse {
  success: boolean;
  message: string;
  membership?: CircleMember;
}

// Circle moderation
export interface ModerateCircleRequest {
  circleId: string;
  action: 'feature' | 'unfeature' | 'suspend' | 'restore' | 'archive';
  reason: string;
  duration?: number; // in days for temporary actions
  notes?: string;
}

export interface ReportCircleRequest {
  circleId: string;
  reporterId: string;
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'misinformation' | 'other';
  description?: string;
  evidence?: string[];
}

export interface CircleModerationResponse {
  success: boolean;
  action: string;
  effectiveUntil?: string;
  message: string;
}

// Circle analytics
export interface GetCircleAnalyticsRequest {
  circleId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics?: string[];
}

export interface CircleAnalyticsResponse {
  circleId: string;
  period: string;
  metrics: {
    memberGrowth: number;
    engagementRate: number;
    postFrequency: number;
    responseRate: number;
    retentionRate: number;
  };
  trends: {
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }[];
  topContributors: {
    userId: string;
    displayName: string;
    contributionScore: number;
  }[];
}

// Circle recommendations
export interface GetCircleRecommendationsRequest {
  userId: string;
  limit?: number;
  excludeJoined?: boolean;
}

export interface CircleRecommendationsResponse {
  recommendations: {
    circle: Circle;
    score: number;
    reasons: string[];
  }[];
}