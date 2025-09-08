/**
 * Shared Types Package
 * Main entry point for all shared TypeScript definitions
 */

// Domain models
export * from './domain';

// API contract types
export * from './api';

// Event schemas
export * from './events';

// Configuration types
export * from './config';

// Database types
export * from './database';

// Package metadata
export const PACKAGE_VERSION = '0.0.0';
export const PACKAGE_NAME = '@madmall/shared-types';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Generic ID types
export type EntityId = string;
export type UserId = string;
export type CircleId = string;
export type StoryId = string;
export type ResourceId = string;
export type BusinessId = string;
export type ProductId = string;

// Timestamp types
export type ISODateString = string;
export type UnixTimestamp = number;

// Common enums
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// Utility type helpers
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

// Brand types for type safety
export type Brand<T, B> = T & { __brand: B };

export type UsernameString = Brand<string, 'Username'>;
export type EmailString = Brand<string, 'Email'>;
export type PasswordString = Brand<string, 'Password'>;
export type UrlString = Brand<string, 'Url'>;

// Result type for error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Async result type
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Common response wrapper
export interface ResponseWrapper<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// Error types
export interface BaseError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError extends BaseError {
  field: string;
  value?: any;
}

export interface BusinessError extends BaseError {
  businessRule: string;
}

export interface SystemError extends BaseError {
  systemComponent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}