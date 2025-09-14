export type ImageCategory = 'wellness' | 'community' | 'empowerment' | 'joy';

export interface ImageRecord {
  id: number;
  source: 'generated' | 'unsplash' | 'upload';
  category: ImageCategory;
  filePath: string; // local path under public/images
  altText: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  culturalValidation?: CulturalValidation;
}

export interface FeedbackRecord {
  id: number;
  imageId: number;
  vote: 1 | -1;
  comment?: string;
  createdAt: string;
  reportReason?: ReportReason;
}

export interface GenerateRequest {
  category: ImageCategory;
  count: number;
  prompt?: string;
  useCulturalPrompts?: boolean;
}

export interface SelectRequest {
  context: 'home' | 'about' | 'wellness' | 'concourse' | 'peerCircles' | 'comedyLounge' | 'marketplace' | 'storyBooth' | 'resourceHub';
  category?: ImageCategory;
}

export interface ValidationDecision {
  approved: boolean;
  reasons?: string[];
  culturalValidation?: CulturalValidation;
}

// Kiro's Cultural Validation Framework
export interface CulturalValidation {
  respectfulRepresentation: boolean;
  empoweringContext: boolean;
  avoidsSterotypes: boolean;
  culturallyRelevant: boolean;
  communityApproved: boolean;
  overallScore: number;
  recommendations: string[];
  demographicValidation: DemographicValidation;
}

export interface DemographicValidation {
  isBlackWoman: boolean;
  confidence: number;
  ageEstimate: AgeRange;
  appropriatenessScore: number;
}

export interface AgeRange {
  min: number;
  max: number;
  estimated: number;
}

export type ReportReason = 'inappropriate_demographics' | 'cultural_insensitivity' | 'stereotypical' | 'not_empowering' | 'poor_quality' | 'other';

// Kiro's Cultural Prompt Categories
export interface CulturalPrompts {
  wellness: string[];
  community: string[];
  empowerment: string[];
  joy: string[];
}
