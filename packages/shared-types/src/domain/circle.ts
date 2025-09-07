/**
 * Circle Domain Models
 * Peer support circle types and interfaces
 */

export type CircleType = 
  | 'support_group'
  | 'interest_based'
  | 'location_based'
  | 'diagnosis_stage'
  | 'wellness_focus'
  | 'cultural_affinity';

export type CircleMemberRole = 
  | 'member'
  | 'moderator'
  | 'admin'
  | 'founder';

export type CircleMemberStatus = 
  | 'active'
  | 'pending'
  | 'inactive'
  | 'banned';

export type CirclePrivacyLevel = 
  | 'public'
  | 'private'
  | 'invite_only'
  | 'closed';

export interface CircleSettings {
  isPrivate: boolean;
  requireApproval: boolean;
  maxMembers?: number;
  culturalFocus?: string[];
  allowGuestPosts: boolean;
  moderationLevel: 'light' | 'moderate' | 'strict';
  contentGuidelines?: string;
  meetingSchedule?: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'as_needed';
    dayOfWeek?: number;
    time?: string;
    timezone?: string;
  };
}

export interface CircleMember {
  userId: string;
  role: CircleMemberRole;
  status: CircleMemberStatus;
  joinedAt: Date;
  lastActive: Date;
  contributionScore: number;
  badges: string[];
  notes?: string;
}

export interface CircleStats {
  memberCount: number;
  activeMembers: number;
  postsThisWeek: number;
  postsThisMonth: number;
  engagementRate: number;
  averageResponseTime: number;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  type: CircleType;
  privacyLevel: CirclePrivacyLevel;
  settings: CircleSettings;
  members: CircleMember[];
  moderators: string[];
  tags: string[];
  coverImage?: string;
  stats: CircleStats;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CircleInvitation {
  id: string;
  circleId: string;
  inviterId: string;
  inviteeId?: string;
  inviteeEmail?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface CircleJoinRequest {
  id: string;
  circleId: string;
  userId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}