/**
 * Resource Domain Models
 * Educational content, articles, and wellness resources
 */

import { ContentModerationStatus } from './story';

export type ResourceType = 
  | 'article'
  | 'video'
  | 'podcast'
  | 'infographic'
  | 'checklist'
  | 'guide'
  | 'research_paper'
  | 'webinar'
  | 'tool'
  | 'template';

export type ResourceCategory = 
  | 'education'
  | 'self_care'
  | 'medical_advocacy'
  | 'nutrition'
  | 'mental_health'
  | 'fitness'
  | 'relationships'
  | 'workplace'
  | 'financial_wellness'
  | 'spiritual_wellness';

export type ResourceDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type ResourceStatus = 
  | 'draft'
  | 'published'
  | 'archived'
  | 'under_review'
  | 'featured';

export interface ResourceAuthor {
  id: string;
  name: string;
  credentials?: string[];
  bio?: string;
  avatar?: string;
  isVerified: boolean;
  specialties: string[];
}

export interface ResourceMetadata {
  readTime?: number;
  watchTime?: number;
  listenTime?: number;
  difficulty: ResourceDifficulty;
  prerequisites?: string[];
  learningObjectives: string[];
  culturalConsiderations: string[];
  therapeuticValue: string[];
  evidenceBased: boolean;
  lastReviewed?: Date;
  reviewedBy?: string;
}

export interface ResourceEngagement {
  views: number;
  likes: number;
  saves: number;
  shares: number;
  helpfulVotes: number;
  completions?: number;
  averageRating: number;
  ratingCount: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  content?: string;
  summary: string;
  type: ResourceType;
  category: ResourceCategory;
  subcategories: string[];
  status: ResourceStatus;
  author: ResourceAuthor;
  contributors?: ResourceAuthor[];
  metadata: ResourceMetadata;
  engagement: ResourceEngagement;
  tags: string[];
  relatedResources: string[];
  externalUrl?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  isPublic: boolean;
  isPremium: boolean;
  price?: {
    amount: number;
    currency: string;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceComment {
  id: string;
  resourceId: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
    credentials?: string[];
  };
  content: string;
  rating?: number;
  parentCommentId?: string;
  likes: number;
  replies: ResourceComment[];
  isEdited: boolean;
  moderationStatus: ContentModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceCollection {
  id: string;
  name: string;
  description: string;
  curatorId: string;
  resourceIds: string[];
  tags: string[];
  isPublic: boolean;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceProgress {
  id: string;
  userId: string;
  resourceId: string;
  progress: number; // 0-100
  completed: boolean;
  timeSpent: number; // in minutes
  lastAccessed: Date;
  notes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ContentModerationStatus exported from story.ts