/**
 * User Domain Events
 * Events related to user lifecycle and activities
 */

import { DomainEvent, IntegrationEvent } from './base';
import { UserProfile, UserPreferences } from '../domain/user';

// User lifecycle events
export interface UserRegisteredEvent extends DomainEvent<{
  userId: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  registrationSource: 'web' | 'mobile' | 'social';
  referralCode?: string;
}> {
  type: 'user.registered';
}

export interface UserEmailVerifiedEvent extends DomainEvent<{
  userId: string;
  email: string;
  verifiedAt: string;
}> {
  type: 'user.email_verified';
}

export interface UserProfileUpdatedEvent extends DomainEvent<{
  userId: string;
  previousProfile: UserProfile;
  newProfile: UserProfile;
  changedFields: string[];
}> {
  type: 'user.profile_updated';
}

export interface UserPreferencesUpdatedEvent extends DomainEvent<{
  userId: string;
  previousPreferences: UserPreferences;
  newPreferences: UserPreferences;
  changedFields: string[];
}> {
  type: 'user.preferences_updated';
}

export interface UserDeactivatedEvent extends DomainEvent<{
  userId: string;
  reason?: string;
  deactivatedBy: string;
  deactivatedAt: string;
}> {
  type: 'user.deactivated';
}

export interface UserReactivatedEvent extends DomainEvent<{
  userId: string;
  reactivatedBy: string;
  reactivatedAt: string;
}> {
  type: 'user.reactivated';
}

export interface UserDeletedEvent extends DomainEvent<{
  userId: string;
  email: string;
  reason?: string;
  deletedAt: string;
  dataRetentionDays: number;
}> {
  type: 'user.deleted';
}

// User activity events
export interface UserLoggedInEvent extends IntegrationEvent<{
  userId: string;
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    deviceId?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  loginMethod: 'password' | 'social' | 'mfa';
}> {
  type: 'user.logged_in';
}

export interface UserLoggedOutEvent extends IntegrationEvent<{
  userId: string;
  sessionId: string;
  logoutReason: 'user_initiated' | 'session_expired' | 'forced';
}> {
  type: 'user.logged_out';
}

export interface UserOnboardingCompletedEvent extends DomainEvent<{
  userId: string;
  onboardingData: {
    diagnosisStage: string;
    primaryGoals: string[];
    supportNeeds: string[];
    culturalBackground: string[];
    communicationStyle: string;
  };
  completedAt: string;
  timeToComplete: number; // in minutes
}> {
  type: 'user.onboarding_completed';
}

// User engagement events
export interface UserEngagementEvent extends IntegrationEvent<{
  userId: string;
  action: 'page_view' | 'content_interaction' | 'feature_usage';
  entityType?: string;
  entityId?: string;
  duration?: number; // in seconds
  metadata?: Record<string, any>;
}> {
  type: 'user.engagement';
}

export interface UserMilestoneAchievedEvent extends IntegrationEvent<{
  userId: string;
  milestone: 'first_story' | 'first_circle_join' | 'week_streak' | 'month_streak' | 'helpful_contributor';
  achievedAt: string;
  metadata?: Record<string, any>;
}> {
  type: 'user.milestone_achieved';
}

// User connection events
export interface UserFollowedEvent extends DomainEvent<{
  followerId: string;
  followeeId: string;
  followedAt: string;
}> {
  type: 'user.followed';
}

export interface UserUnfollowedEvent extends DomainEvent<{
  followerId: string;
  followeeId: string;
  unfollowedAt: string;
}> {
  type: 'user.unfollowed';
}

export interface UserBlockedEvent extends DomainEvent<{
  blockerId: string;
  blockedUserId: string;
  reason?: string;
  blockedAt: string;
}> {
  type: 'user.blocked';
}

export interface UserUnblockedEvent extends DomainEvent<{
  blockerId: string;
  unblockedUserId: string;
  unblockedAt: string;
}> {
  type: 'user.unblocked';
}

// User moderation events
export interface UserReportedEvent extends IntegrationEvent<{
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description?: string;
  evidence?: string[];
  reportedAt: string;
}> {
  type: 'user.reported';
}

export interface UserModeratedEvent extends DomainEvent<{
  userId: string;
  moderatorId: string;
  action: 'warned' | 'suspended' | 'banned' | 'restored';
  reason: string;
  duration?: number; // in days
  effectiveUntil?: string;
  notes?: string;
}> {
  type: 'user.moderated';
}

// User verification events
export interface UserVerificationRequestedEvent extends IntegrationEvent<{
  userId: string;
  verificationType: 'identity' | 'healthcare_professional' | 'community_leader';
  evidence: string[];
  requestedAt: string;
}> {
  type: 'user.verification_requested';
}

export interface UserVerifiedEvent extends DomainEvent<{
  userId: string;
  verificationType: string;
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
}> {
  type: 'user.verified';
}

export interface UserVerificationRejectedEvent extends DomainEvent<{
  userId: string;
  verificationType: string;
  rejectedBy: string;
  rejectedAt: string;
  reason: string;
}> {
  type: 'user.verification_rejected';
}

// Union type for all user events
export type UserEvent = 
  | UserRegisteredEvent
  | UserEmailVerifiedEvent
  | UserProfileUpdatedEvent
  | UserPreferencesUpdatedEvent
  | UserDeactivatedEvent
  | UserReactivatedEvent
  | UserDeletedEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | UserOnboardingCompletedEvent
  | UserEngagementEvent
  | UserMilestoneAchievedEvent
  | UserFollowedEvent
  | UserUnfollowedEvent
  | UserBlockedEvent
  | UserUnblockedEvent
  | UserReportedEvent
  | UserModeratedEvent
  | UserVerificationRequestedEvent
  | UserVerifiedEvent
  | UserVerificationRejectedEvent;