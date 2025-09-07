/**
 * User API Types
 * Types for user-related API operations
 */

import { User, UserProfile, UserPreferences, UserStats, UserActivity } from '../domain/user';
import { PaginationRequest, ListResponse } from './common';

// User retrieval requests
export interface GetUserRequest {
  userId: string;
  includeStats?: boolean;
  includeActivity?: boolean;
}

export interface GetUsersRequest extends PaginationRequest {
  search?: string;
  filters?: {
    diagnosisStage?: string[];
    location?: string;
    joinedAfter?: string;
    isActive?: boolean;
  };
}

export interface GetUserActivityRequest extends PaginationRequest {
  userId: string;
  activityTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// User creation and updates
export interface CreateUserRequest {
  email: string;
  profile: Omit<UserProfile, 'joinDate' | 'lastActive'>;
  preferences?: Partial<UserPreferences>;
  primaryGoals: string[];
}

export interface UpdateUserRequest {
  userId: string;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
  primaryGoals?: string[];
}

export interface UpdateUserStatusRequest {
  userId: string;
  isActive: boolean;
  reason?: string;
}

// User responses
export interface GetUserResponse {
  user: User;
  stats?: UserStats;
  recentActivity?: UserActivity[];
}

export interface GetUsersResponse extends ListResponse<User> {
  facets?: {
    diagnosisStages: { value: string; count: number }[];
    locations: { value: string; count: number }[];
    joinedRanges: { value: string; count: number }[];
  };
}

export interface CreateUserResponse {
  user: User;
}

export interface UpdateUserResponse {
  user: User;
}

export interface GetUserActivityResponse extends ListResponse<UserActivity> {}

// User connections and relationships
export interface FollowUserRequest {
  userId: string;
  targetUserId: string;
}

export interface UnfollowUserRequest {
  userId: string;
  targetUserId: string;
}

export interface GetUserFollowersRequest extends PaginationRequest {
  userId: string;
}

export interface GetUserFollowingRequest extends PaginationRequest {
  userId: string;
}

export interface BlockUserRequest {
  userId: string;
  targetUserId: string;
  reason?: string;
}

export interface UnblockUserRequest {
  userId: string;
  targetUserId: string;
}

export interface ReportUserRequest {
  userId: string;
  targetUserId: string;
  reason: 'harassment' | 'spam' | 'inappropriate_content' | 'impersonation' | 'other';
  description?: string;
  evidence?: string[];
}

// User connection responses
export interface UserConnectionResponse {
  success: boolean;
  message: string;
}

export interface GetUserConnectionsResponse extends ListResponse<User> {}

// User preferences and settings
export interface UpdateNotificationPreferencesRequest {
  userId: string;
  preferences: {
    email: {
      circleActivity: boolean;
      directMessages: boolean;
      weeklyDigest: boolean;
      systemUpdates: boolean;
    };
    push: {
      circleActivity: boolean;
      directMessages: boolean;
      mentions: boolean;
      systemUpdates: boolean;
    };
    inApp: {
      circleActivity: boolean;
      directMessages: boolean;
      mentions: boolean;
      systemUpdates: boolean;
    };
  };
}

export interface UpdatePrivacySettingsRequest {
  userId: string;
  settings: {
    profileVisibility: 'public' | 'circles_only' | 'private';
    showRealName: boolean;
    allowDirectMessages: boolean;
    shareHealthJourney: boolean;
    allowSearchEngineIndexing: boolean;
    allowDataAnalytics: boolean;
  };
}

// User onboarding
export interface CompleteOnboardingRequest {
  userId: string;
  onboardingData: {
    diagnosisStage: string;
    primaryGoals: string[];
    supportNeeds: string[];
    culturalBackground: string[];
    communicationStyle: string;
    circleInterests: string[];
    contentPreferences: string[];
  };
}

export interface GetOnboardingProgressRequest {
  userId: string;
}

export interface OnboardingProgressResponse {
  userId: string;
  completed: boolean;
  steps: {
    step: string;
    completed: boolean;
    completedAt?: string;
  }[];
  nextStep?: string;
}

// User verification and moderation
export interface VerifyUserRequest {
  userId: string;
  verificationType: 'identity' | 'healthcare_professional' | 'community_leader';
  evidence: string[];
  notes?: string;
}

export interface ModerateUserRequest {
  userId: string;
  action: 'warn' | 'suspend' | 'ban' | 'restore';
  reason: string;
  duration?: number; // in days for temporary actions
  notes?: string;
}

export interface UserModerationResponse {
  success: boolean;
  action: string;
  effectiveUntil?: string;
  message: string;
}

// User analytics and insights
export interface GetUserInsightsRequest {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics?: string[];
}

export interface UserInsightsResponse {
  userId: string;
  period: string;
  insights: {
    engagementScore: number;
    communityImpact: number;
    wellnessProgress: number;
    connectionStrength: number;
    contentQuality: number;
  };
  trends: {
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }[];
  recommendations: {
    type: string;
    title: string;
    description: string;
    actionUrl?: string;
  }[];
}