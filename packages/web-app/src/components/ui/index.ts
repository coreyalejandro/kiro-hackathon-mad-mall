// UI Components - Migrated from Vite to Next.js with SSR optimization
export { default as AuthForm } from './AuthForm';
export { default as CommunityImage } from './CommunityImage';
export { default as CommunityTestimonials } from './CommunityTestimonials';
export { default as FeaturedBrands } from './FeaturedBrands';
export { default as FeaturedBusinesses } from './FeaturedBusinesses';
export { default as FeaturedCircles } from './FeaturedCircles';
export { default as HeroSection } from './HeroSection';
export { default as InteractiveStats } from './InteractiveStats';
export { default as LoadingCard } from './LoadingCard';
export { default as OnboardingFlow } from './OnboardingFlow';
export { default as SearchWithFilters } from './SearchWithFilters';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as ToastNotification } from './ToastNotification';
export { default as UserProfile } from './UserProfile';

// Re-export types for convenience
export type { 
  LoginRequest, 
  RegisterRequest,
  User,
  UserProfile as UserProfileType,
  UserPreferences,
  DiagnosisStage,
  CommunicationStyle,
  UserGoal,
  SupportNeed
} from '@madmall/shared-types';