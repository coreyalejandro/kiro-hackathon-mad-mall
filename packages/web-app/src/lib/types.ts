// Core data types for MADMall platform

export interface User {
  id: string;
  name: string;
  avatar: string;
  joinedAt: Date;
  location: string;
  interests: string[];
  isVerified: boolean;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  tags: string[];
  recentActivity: Date;
  moderators: string[];
  rules: string[];
  activityLevel: 'low' | 'medium' | 'high';
  color: string;
}

export interface Post {
  id: string;
  userId: string;
  circleId: string;
  content: string;
  createdAt: Date;
  likes: number;
  comments: number;
  isAnonymous: boolean;
}

export interface ComedyClip {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  category: string;
  tags: string[];
  averageReliefRating: number;
  viewCount: number;
  creator: {
    name: string;
    avatar: string;
  };
}

export interface ReliefRating {
  id: string;
  clipId: string;
  userId: string;
  rating: number; // 1-5
  timestamp: Date;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  business: {
    name: string;
    ownerName: string;
    story: string;
    logoUrl: string;
    isBlackOwned: boolean;
  };
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    credentials: string;
    avatar: string;
  };
  category: string;
  format: 'article' | 'video' | 'podcast';
  credibility: 'peer-reviewed' | 'expert' | 'community';
  tags: string[];
  readingTime: number;
  publishedAt: Date;
  rating: number;
  bookmarkCount: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'audio';
  audioUrl?: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  publishedAt: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  isAnonymous: boolean;
}

export interface ImageAsset {
  id: string;
  url: string;
  category: string;
  alt: string;
}

export interface ActivityItem {
  id: string;
  type: 'post' | 'join' | 'story' | 'relief_rating' | 'bookmark' | 'wishlist';
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  engagement: {
    likes: number;
    comments: number;
  };
  targetId?: string;
  targetType?: string;
}

export interface PlatformStats {
  totalMembers: number;
  activeCircles: number;
  wellnessMoments: number;
  reliefRatings: number;
  storiesShared: number;
  businessesSupported: number;
}

export interface MallSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  memberCount?: number;
  activityLevel: 'low' | 'medium' | 'high';
  color: string;
  stats?: {
    label: string;
    value: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  success: boolean;
  timestamp: Date;
}

// Filter and search types
export interface CircleFilters {
  search?: string;
  tags?: string[];
  activityLevel?: 'low' | 'medium' | 'high';
  memberCount?: 'small' | 'medium' | 'large';
}

export interface ComedyFilters {
  category?: string;
  tags?: string[];
  duration?: 'short' | 'medium' | 'long';
  reliefRating?: number;
}

export interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  blackOwned?: boolean;
}

export interface ArticleFilters {
  category?: string;
  format?: string;
  credibility?: string;
  tags?: string[];
  readingTime?: 'short' | 'medium' | 'long';
  author?: string;
}

export interface StoryFilters {
  type?: 'text' | 'audio';
  tags?: string[];
  timeframe?: 'day' | 'week' | 'month' | 'all';
}