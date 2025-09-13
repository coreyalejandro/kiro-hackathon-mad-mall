/**
 * Environment variable utilities for different deployment environments
 */

function requireUrlEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      try {
        // eslint-disable-next-line no-new
        new URL(value);
      } catch {
        throw new Error(`Environment variable ${name} must be a valid URL`);
      }
      return value;
    }
  }
  throw new Error(`Missing required environment variable: ${names[0]}`);
}

export const env = {
  // API Configuration
  API_URL: requireUrlEnv('NEXT_PUBLIC_API_URL'),
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',

  // TitanEngine Configuration
  TITAN_ENGINE_URL: requireUrlEnv('TITAN_ENGINE_URL', 'NEXT_PUBLIC_TITANENGINE_URL', 'NEXT_PUBLIC_TITAN_ENGINE_URL'),

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
  return endpoint ? `${env.TITAN_ENGINE_URL}/${endpoint.replace(/^\//, '')}` : env.TITAN_ENGINE_URL;
}

/**
 * Debug logging utility
 */
export function debugLog(...args: any[]): void {
  if (env.ENABLE_DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}