/**
 * User Domain Models
 * Core user-related types and interfaces for the MADMall platform
 */

export type DiagnosisStage = 
  | 'newly_diagnosed'
  | 'adjusting'
  | 'managing_well'
  | 'experienced'
  | 'complications'
  | 'remission';

export type CommunicationStyle = 
  | 'direct_supportive'
  | 'gentle_encouraging'
  | 'humor_based'
  | 'spiritual_grounded'
  | 'no_preference';

export type ProfileVisibility = 
  | 'public'
  | 'circles_only'
  | 'private';

export type UserGoal = 
  | 'emotional_support'
  | 'health_education'
  | 'community_connection'
  | 'stress_relief'
  | 'share_story'
  | 'healthcare_advocacy'
  | 'wellness_products';

export type SupportNeed = 
  | 'newly_diagnosed_support'
  | 'anxiety_management'
  | 'medication_management'
  | 'workplace_wellness'
  | 'family_relationships'
  | 'healthcare_advocacy'
  | 'nutrition_lifestyle'
  | 'self_care';

export interface UserProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  culturalBackground: string[];
  communicationStyle: CommunicationStyle;
  diagnosisStage: DiagnosisStage;
  supportNeeds: SupportNeed[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  joinDate: Date;
  lastActive: Date;
}

export interface UserPreferences {
  profileVisibility: ProfileVisibility;
  showRealName: boolean;
  allowDirectMessages: boolean;
  shareHealthJourney: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  circleNotifications: boolean;
  contentPreferences: string[];
  circleInterests: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  settings: UserSettings;
  primaryGoals: UserGoal[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface UserStats {
  storiesShared: number;
  circlesJoined: number;
  commentsPosted: number;
  helpfulVotes: number;
  daysActive: number;
  streakDays: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'story_shared' | 'circle_joined' | 'comment_posted' | 'resource_saved' | 'product_reviewed';
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}