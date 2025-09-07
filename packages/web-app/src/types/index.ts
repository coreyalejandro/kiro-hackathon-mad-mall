/**
 * Common types for the web application
 */

export interface PageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
}

export interface LayoutProps {
  children: React.ReactNode;
  params: Record<string, string>;
}

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface LoadingProps {
  className?: string;
}

// Navigation types
export interface NavigationItem {
  type: 'link' | 'divider';
  text?: string;
  href?: string;
  external?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types (basic - will be extended with shared-types)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface HeroSectionProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  pageName?: string;
  ctaButtons?: Array<{
    text: string;
    icon?: string;
    variant: 'primary' | 'secondary';
    onClick?: () => void;
  }>;
  imageContent?: React.ReactNode;
}