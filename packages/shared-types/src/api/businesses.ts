/**
 * Business API Contract Types
 * Types for business-related API operations following Smithy patterns
 */

import { Business, BusinessType, BusinessStatus, Product, ProductReview, BusinessReview } from '../domain/business';
import { ApiResponse, PaginationRequest, ListResponse, SearchRequest, SearchResponse } from './common';

// Business CRUD Operations
export interface CreateBusinessRequest {
  name: string;
  description: string;
  type: BusinessType;
  website?: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  specialties: string[];
  servicesOffered: string[];
  targetAudience: string[];
  culturalCompetencies: string[];
}

export interface CreateBusinessResponse extends ApiResponse<Business> {}

export interface GetBusinessRequest {
  id: string;
  includeProducts?: boolean;
  includeReviews?: boolean;
}

export interface GetBusinessResponse extends ApiResponse<Business> {}

export interface UpdateBusinessRequest {
  id: string;
  name?: string;
  description?: string;
  website?: string;
  phone?: string;
  specialties?: string[];
  servicesOffered?: string[];
  culturalCompetencies?: string[];
}

export interface UpdateBusinessResponse extends ApiResponse<Business> {}

// Business List and Search
export interface ListBusinessesRequest extends PaginationRequest {
  type?: BusinessType;
  status?: BusinessStatus;
  location?: {
    city?: string;
    state?: string;
    radius?: number;
  };
  specialties?: string[];
  certifications?: string[];
}

export interface ListBusinessesResponse extends ApiResponse<ListResponse<Business>> {}

export interface SearchBusinessesRequest extends SearchRequest {
  types?: BusinessType[];
  location?: {
    city?: string;
    state?: string;
    radius?: number;
  };
  specialties?: string[];
  certifications?: string[];
  rating?: {
    min?: number;
    max?: number;
  };
}

export interface SearchBusinessesResponse extends ApiResponse<SearchResponse<Business>> {}

// Product Operations
export interface CreateProductRequest {
  businessId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: {
    amount: number;
    currency: string;
    originalPrice?: number;
  };
  images: string[];
  specifications?: Record<string, string>;
  ingredients?: string[];
  benefits: string[];
  culturalRelevance: string[];
  certifications: string[];
}

export interface CreateProductResponse extends ApiResponse<Product> {}

export interface GetProductRequest {
  id: string;
  includeReviews?: boolean;
}

export interface GetProductResponse extends ApiResponse<Product> {}

export interface ListProductsRequest extends PaginationRequest {
  businessId?: string;
  category?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  inStock?: boolean;
  culturalRelevance?: string[];
}

export interface ListProductsResponse extends ApiResponse<ListResponse<Product>> {}

// Review Operations
export interface CreateBusinessReviewRequest {
  businessId: string;
  rating: number;
  title?: string;
  content: string;
  serviceUsed?: string;
  culturalCompetency: number;
  accessibility: number;
  wouldRecommend: boolean;
}

export interface CreateBusinessReviewResponse extends ApiResponse<BusinessReview> {}

export interface CreateProductReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  culturalRelevance: string[];
  therapeuticBenefits: string[];
  wouldRecommend: boolean;
  images?: string[];
}

export interface CreateProductReviewResponse extends ApiResponse<ProductReview> {}

export interface GetReviewsRequest extends PaginationRequest {
  businessId?: string;
  productId?: string;
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

export interface GetReviewsResponse extends ApiResponse<ListResponse<BusinessReview | ProductReview>> {}

// Business Verification
export interface SubmitVerificationRequest {
  businessId: string;
  documents: {
    type: 'business_license' | 'tax_id' | 'certification' | 'insurance';
    url: string;
    description?: string;
  }[];
  additionalInfo?: string;
}

export interface SubmitVerificationResponse extends ApiResponse<{ verificationId: string }> {}

// Business Analytics
export interface GetBusinessAnalyticsRequest {
  businessId: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

export interface BusinessAnalytics {
  profile_views: number;
  contact_clicks: number;
  product_views: number;
  review_count: number;
  average_rating: number;
  conversion_rate: number;
  top_products: {
    id: string;
    name: string;
    views: number;
    sales?: number;
  }[];
  demographics: {
    age_groups: Record<string, number>;
    locations: Record<string, number>;
  };
  timeline: {
    date: string;
    views: number;
    contacts: number;
  }[];
}

export interface GetBusinessAnalyticsResponse extends ApiResponse<BusinessAnalytics> {}