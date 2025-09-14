export type ImageCategory = 'wellness' | 'community' | 'empowerment' | 'joy';

export interface ImageRecord {
  id: number;
  source: 'generated' | 'unsplash' | 'upload';
  category: ImageCategory;
  filePath: string;
  altText: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  url?: string; // Constructed URL for frontend use
}

export interface FeedbackRecord {
  id: number;
  imageId: number;
  vote: 1 | -1;
  comment?: string;
  createdAt: string;
}

export interface GenerateRequest {
  category: ImageCategory;
  count: number;
  prompt?: string;
}

export interface SelectRequest {
  context: 'home' | 'about' | 'wellness' | 'community' | 'empowerment';
  category?: ImageCategory;
  limit?: number;
}

export interface ValidationDecision {
  approved: boolean;
  reasons?: string[];
}

export interface CulturalValidation {
  authenticity: number; // 0-1 score
  dignity: number; // 0-1 score
  representation: number; // 0-1 score
  contextualFit: number; // 0-1 score
  overallScore: number; // 0-1 weighted average
  flags: string[]; // Cultural concerns
  recommendations: string[];
}

export interface DemographicValidation {
  primaryDemographic: string;
  confidence: number; // 0-1 confidence in demographic identification
  culturalMarkers: string[];
  potentialConcerns: string[];
}