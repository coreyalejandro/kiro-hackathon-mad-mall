/**
 * Comedy Domain Models
 * Comedy content and therapeutic humor types
 */

import { ContentModerationStatus } from './story';

export type ComedyType = 
  | 'video'
  | 'audio'
  | 'text'
  | 'meme'
  | 'gif'
  | 'interactive';

export type ComedyCategory = 
  | 'medication_management'
  | 'medical_humor'
  | 'daily_life'
  | 'family_dynamics'
  | 'workplace_humor'
  | 'dating_relationships'
  | 'self_care_fails'
  | 'doctor_visits'
  | 'symptom_struggles'
  | 'community_inside_jokes';

export type TherapeuticFocus = 
  | 'stress_relief'
  | 'anxiety_relief'
  | 'normalizing_experience'
  | 'community_bonding'
  | 'mood_lifting'
  | 'perspective_shift'
  | 'coping_mechanism'
  | 'empowerment';

export type ComedyStatus = 
  | 'draft'
  | 'published'
  | 'featured'
  | 'archived'
  | 'flagged'
  | 'removed';

export interface ComedyMetadata {
  duration?: number; // in seconds for video/audio
  wordCount?: number; // for text content
  culturalElements: string[];
  therapeuticFocus: TherapeuticFocus[];
  appropriateFor: string[]; // age groups, sensitivity levels
  triggerWarnings?: string[];
  accessibilityFeatures: {
    hasSubtitles?: boolean;
    hasTranscript?: boolean;
    hasAudioDescription?: boolean;
    isScreenReaderFriendly?: boolean;
  };
}

export interface ComedyEngagement {
  views: number;
  likes: number;
  laughReactions: number;
  shares: number;
  saves: number;
  comments: number;
  reliefRating: number; // 1-5 scale for therapeutic value
  ratingCount: number;
}

export interface ComedyCreator {
  id: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isComedian: boolean;
  specialties: string[];
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
}

export interface Comedy {
  id: string;
  title: string;
  description: string;
  content?: string; // for text-based comedy
  mediaUrl?: string; // for video/audio/image content
  thumbnailUrl?: string;
  type: ComedyType;
  category: ComedyCategory;
  status: ComedyStatus;
  creator: ComedyCreator;
  metadata: ComedyMetadata;
  engagement: ComedyEngagement;
  tags: string[];
  relatedContent: string[];
  circleId?: string; // if shared in a specific circle
  isExclusive: boolean; // premium/member-only content
  moderationStatus: ContentModerationStatus;
  moderationNotes?: string;
  featuredAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComedyComment {
  id: string;
  comedyId: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  parentCommentId?: string;
  likes: number;
  laughReactions: number;
  replies: ComedyComment[];
  isEdited: boolean;
  moderationStatus: ContentModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComedyPlaylist {
  id: string;
  name: string;
  description: string;
  curatorId: string;
  comedyIds: string[];
  tags: string[];
  isPublic: boolean;
  coverImage?: string;
  totalDuration?: number;
  averageReliefRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComedyReaction {
  id: string;
  userId: string;
  comedyId: string;
  type: 'like' | 'laugh' | 'love' | 'helpful' | 'save';
  createdAt: Date;
}

