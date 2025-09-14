/**
 * Environment variable utilities for different deployment environments
 * Note: When running in the browser, Next.js statically replaces
 * usages of process.env.NEXT_PUBLIC_* at build time. Avoid dynamic
 * lookups like process.env[name] in client bundles.
 */

function validateUrl(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL`);
  }
  return value;
}

// Read with static property access so Next can inline values into the client bundle
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const NEXT_PUBLIC_API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

// Prefer public URL for browser usage; allow server-only TITAN_ENGINE_URL as last fallback
const NEXT_PUBLIC_TITANENGINE_URL =
  process.env.NEXT_PUBLIC_TITANENGINE_URL ||
  process.env.NEXT_PUBLIC_TITAN_ENGINE_URL ||
  process.env.TITAN_ENGINE_URL;

const NEXT_PUBLIC_AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || '';
const NEXT_PUBLIC_AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '';

export const env = {
  // API Configuration
  API_URL: validateUrl('NEXT_PUBLIC_API_URL', NEXT_PUBLIC_API_URL),
  API_VERSION: NEXT_PUBLIC_API_VERSION,

  // TitanEngine Configuration
  TITAN_ENGINE_URL: validateUrl(
    'NEXT_PUBLIC_TITANENGINE_URL',
    NEXT_PUBLIC_TITANENGINE_URL
  ),

  // Authentication
  AUTH_DOMAIN: NEXT_PUBLIC_AUTH_DOMAIN,
  AUTH_CLIENT_ID: NEXT_PUBLIC_AUTH_CLIENT_ID,

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
