/**
 * Generated TypeScript types for MADMall API
 * This is a mock implementation - replace with actual Smithy-generated types
 */

// User types
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

export interface UserProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  culturalBackground: string[];
  communicationStyle: CommunicationStyle;
  diagnosisStage: DiagnosisStage;
  supportNeeds: SupportNeed[];
  location?: UserLocation;
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
  theme: string;
  language: string;
  timezone: string;
  accessibility: AccessibilitySettings;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
}

export interface UserLocation {
  city?: string;
  state?: string;
  country?: string;
}

// Enums
export type DiagnosisStage = 'newly_diagnosed' | 'adjusting' | 'managing_well' | 'experienced' | 'complications' | 'remission';
export type CommunicationStyle = 'direct_supportive' | 'gentle_encouraging' | 'humor_based' | 'spiritual_grounded' | 'no_preference';
export type ProfileVisibility = 'public' | 'circles_only' | 'private';
export type UserGoal = 'emotional_support' | 'health_education' | 'community_connection' | 'stress_relief' | 'share_story' | 'healthcare_advocacy' | 'wellness_products';
export type SupportNeed = 'newly_diagnosed_support' | 'anxiety_management' | 'medication_management' | 'workplace_wellness' | 'family_relationships' | 'healthcare_advocacy' | 'nutrition_lifestyle' | 'self_care';

// Common types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
}

export interface PaginationInput {
  limit?: number;
  nextToken?: string;
}

export interface PaginationOutput {
  nextToken?: string;
  totalCount: number;
  itemCount: number;
}

export type ContentType = 'story' | 'discussion' | 'resource' | 'product' | 'business' | 'comedy' | 'user' | 'circle';
export type InteractionType = 'like' | 'unlike' | 'save' | 'unsave' | 'share' | 'report' | 'helpful' | 'not_helpful';
