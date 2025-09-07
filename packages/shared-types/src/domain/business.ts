/**
 * Business Domain Models
 * Business listings, products, and marketplace types
 */

import { ContentModerationStatus } from './story';

export type BusinessType = 
  | 'wellness_center'
  | 'healthcare_provider'
  | 'supplement_brand'
  | 'fitness_studio'
  | 'mental_health_service'
  | 'nutrition_service'
  | 'beauty_wellness'
  | 'lifestyle_brand'
  | 'educational_service';

export type BusinessStatus = 
  | 'active'
  | 'pending_verification'
  | 'suspended'
  | 'inactive';

export type CertificationType = 
  | 'black_owned'
  | 'woman_owned'
  | 'minority_owned'
  | 'certified_organic'
  | 'fda_approved'
  | 'clinical_tested'
  | 'culturally_competent';

export interface BusinessProfile {
  name: string;
  description: string;
  mission?: string;
  foundedYear?: number;
  founderStory?: string;
  website?: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  logo?: string;
  coverImage?: string;
  gallery: string[];
}

export interface BusinessMetrics {
  rating: number;
  reviewCount: number;
  trustScore: number;
  responseRate: number;
  averageResponseTime: number;
  repeatCustomerRate: number;
}

export interface Business {
  id: string;
  profile: BusinessProfile;
  type: BusinessType;
  status: BusinessStatus;
  certifications: CertificationType[];
  specialties: string[];
  servicesOffered: string[];
  targetAudience: string[];
  culturalCompetencies: string[];
  metrics: BusinessMetrics;
  ownerId: string;
  verifiedAt?: Date;
  featuredUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: {
    amount: number;
    currency: string;
    originalPrice?: number;
    discountPercentage?: number;
  };
  images: string[];
  specifications?: Record<string, string>;
  ingredients?: string[];
  benefits: string[];
  culturalRelevance: string[];
  certifications: string[];
  availability: {
    inStock: boolean;
    quantity?: number;
    restockDate?: Date;
  };
  shipping: {
    freeShipping: boolean;
    shippingCost?: number;
    estimatedDelivery: string;
    internationalShipping: boolean;
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReview {
  id: string;
  productId: string;
  businessId: string;
  reviewer: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  culturalRelevance: string[];
  therapeuticBenefits: string[];
  wouldRecommend: boolean;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  images?: string[];
  moderationStatus: ContentModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  reviewer: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  rating: number;
  title?: string;
  content: string;
  serviceUsed?: string;
  culturalCompetency: number;
  accessibility: number;
  wouldRecommend: boolean;
  helpfulVotes: number;
  businessResponse?: {
    content: string;
    respondedAt: Date;
    responderId: string;
  };
  moderationStatus: ContentModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ContentModerationStatus exported from story.ts