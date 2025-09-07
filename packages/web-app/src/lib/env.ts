/**
 * Environment variable utilities for different deployment environments
 */

export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  
  // TitanEngine Configuration
  TITANENGINE_URL: process.env.NEXT_PUBLIC_TITANENGINE_URL || 'http://localhost:3002',
  
  // Authentication
  AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN || '',
  AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  
  // Environment Detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Get the full API URL with version
 */
export function getApiUrl(endpoint: string = ''): string {
  const baseUrl = `${env.API_URL}/${env.API_VERSION}`;
  return endpoint ? `${baseUrl}/${endpoint.replace(/^\//, '')}` : baseUrl;
}

/**
 * Get TitanEngine URL with endpoint
 */
export function getTitanEngineUrl(endpoint: string = ''): string {
  return endpoint ? `${env.TITANENGINE_URL}/${endpoint.replace(/^\//, '')}` : env.TITANENGINE_URL;
}

/**
 * Debug logging utility
 */
export function debugLog(...args: any[]): void {
  if (env.ENABLE_DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}