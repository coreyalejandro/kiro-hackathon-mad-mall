/**
 * Authentication API Types
 * Types for authentication and authorization operations
 */

import { User, UserProfile, UserPreferences } from '../domain/user';

// Authentication requests
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
  marketingConsent?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// Authentication responses
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  isFirstLogin: boolean;
  requiresOnboarding: boolean;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  verificationRequired: boolean;
}

export interface ForgotPasswordResponse {
  message: string;
  resetTokenSent: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

export interface VerifyEmailResponse {
  message: string;
  verified: boolean;
}

// Token types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  expiresAt: string;
  scope: string[];
}

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  iat: number;
  exp: number;
  scope: string[];
  sessionId: string;
}

// Device and session info
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  deviceId?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

// Profile and preferences updates
export interface UpdateProfileRequest {
  profile: Partial<UserProfile>;
}

export interface UpdatePreferencesRequest {
  preferences: Partial<UserPreferences>;
}

export interface UpdateProfileResponse {
  user: User;
}

export interface UpdatePreferencesResponse {
  user: User;
}

// Account management
export interface DeactivateAccountRequest {
  reason?: string;
  feedback?: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}

export interface AccountActionResponse {
  success: boolean;
  message: string;
}

// Two-factor authentication
export interface EnableMfaRequest {
  method: 'sms' | 'email' | 'authenticator';
  phoneNumber?: string;
}

export interface EnableMfaResponse {
  secret?: string; // for authenticator apps
  qrCode?: string; // for authenticator apps
  backupCodes: string[];
}

export interface VerifyMfaRequest {
  code: string;
  method: 'sms' | 'email' | 'authenticator';
}

export interface DisableMfaRequest {
  password: string;
  code: string;
}

// Social authentication
export interface SocialAuthRequest {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  deviceInfo?: DeviceInfo;
}

export interface SocialAuthResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
  requiresOnboarding: boolean;
}

// Permission and role types
export type Permission = 
  | 'read:profile'
  | 'write:profile'
  | 'read:circles'
  | 'write:circles'
  | 'moderate:circles'
  | 'read:stories'
  | 'write:stories'
  | 'moderate:stories'
  | 'read:resources'
  | 'write:resources'
  | 'moderate:resources'
  | 'admin:users'
  | 'admin:system';

export type Role = 
  | 'user'
  | 'moderator'
  | 'admin'
  | 'super_admin';

export interface UserPermissions {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  circlePermissions: {
    circleId: string;
    role: 'member' | 'moderator' | 'admin';
    permissions: Permission[];
  }[];
}