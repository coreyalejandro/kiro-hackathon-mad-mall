#!/bin/bash

# MADMall API Gateway Code Generation Script
# Generates TypeScript clients and OpenAPI specifications from Smithy models

set -e

echo "🔨 Building Smithy models..."

# Clean previous builds
rm -rf build/ lib/ generated/

# Create output directories
mkdir -p build lib generated

# For now, create mock generated files since Smithy CLI is not available in npm
echo "📦 Generating mock TypeScript client..."

# Create mock TypeScript client
cat > lib/index.ts << 'EOF'
/**
 * Generated TypeScript client for MADMall API
 * This is a mock implementation - replace with actual Smithy-generated code
 */

export interface MADMallAPIClientConfig {
  endpoint: string;
  region?: string;
  credentials?: any;
}

export class MADMallAPIClient {
  private config: MADMallAPIClientConfig;

  constructor(config: MADMallAPIClientConfig) {
    this.config = config;
  }

  // User operations
  async createUser(input: any): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  async getUser(input: { userId: string }): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  // Circle operations
  async createCircle(input: any): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  async getCircle(input: { circleId: string }): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  // Story operations
  async createStory(input: any): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  async getStory(input: { storyId: string }): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  async getFeaturedStories(input?: { limit?: number }): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  // Business operations
  async createBusiness(input: any): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  async getBusiness(input: { businessId: string }): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  // System operations
  async getHealth(): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }

  async search(input: { query: string; type?: string; limit?: number }): Promise<any> {
    throw new Error('Not implemented - replace with Smithy-generated code');
  }
}

export * from './types';
EOF

# Create mock types file
cat > lib/types.ts << 'EOF'
/**
 * Generated TypeScript types for MADMall API
 * This is a mock implementation - replace with actual Smithy-generated types
 */

// User types
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  settings: UserSettings;
  primaryGoals: UserGoal[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  culturalBackground: string[];
  communicationStyle: CommunicationStyle;
  diagnosisStage: DiagnosisStage;
  supportNeeds: SupportNeed[];
  location?: UserLocation;
  joinDate: Date;
  lastActive: Date;
}

export interface UserPreferences {
  profileVisibility: ProfileVisibility;
  showRealName: boolean;
  allowDirectMessages: boolean;
  shareHealthJourney: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  circleNotifications: boolean;
  contentPreferences: string[];
  circleInterests: string[];
}

export interface UserSettings {
  theme: string;
  language: string;
  timezone: string;
  accessibility: AccessibilitySettings;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
}

export interface UserLocation {
  city?: string;
  state?: string;
  country?: string;
}

// Enums
export type DiagnosisStage = 'newly_diagnosed' | 'adjusting' | 'managing_well' | 'experienced' | 'complications' | 'remission';
export type CommunicationStyle = 'direct_supportive' | 'gentle_encouraging' | 'humor_based' | 'spiritual_grounded' | 'no_preference';
export type ProfileVisibility = 'public' | 'circles_only' | 'private';
export type UserGoal = 'emotional_support' | 'health_education' | 'community_connection' | 'stress_relief' | 'share_story' | 'healthcare_advocacy' | 'wellness_products';
export type SupportNeed = 'newly_diagnosed_support' | 'anxiety_management' | 'medication_management' | 'workplace_wellness' | 'family_relationships' | 'healthcare_advocacy' | 'nutrition_lifestyle' | 'self_care';

// Common types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
}

export interface PaginationInput {
  limit?: number;
  nextToken?: string;
}

export interface PaginationOutput {
  nextToken?: string;
  totalCount: number;
  itemCount: number;
}

export type ContentType = 'story' | 'discussion' | 'resource' | 'product' | 'business' | 'comedy' | 'user' | 'circle';
export type InteractionType = 'like' | 'unlike' | 'save' | 'unsave' | 'share' | 'report' | 'helpful' | 'not_helpful';
EOF

# Create package.json for the client
cat > lib/package.json << EOF
{
  "name": "@madmall/api-client",
  "version": "1.0.0",
  "description": "Generated TypeScript client for MADMall API",
  "main": "index.js",
  "types": "index.d.ts",
  "dependencies": {}
}
EOF

echo "📋 Generating mock OpenAPI specification..."

# Create mock OpenAPI spec
cat > generated/openapi.json << 'EOF'
{
  "openapi": "3.0.2",
  "info": {
    "title": "MADMall Social Wellness Platform API",
    "description": "Enterprise-grade API for the MADMall social wellness platform",
    "version": "1.0.0",
    "contact": {
      "name": "MADMall API Team",
      "email": "api@madmall.com"
    }
  },
  "servers": [
    {
      "url": "https://api.madmall.com/v1",
      "description": "Production API"
    },
    {
      "url": "https://api-staging.madmall.com/v1",
      "description": "Staging API"
    }
  ],
  "paths": {
    "/health": {
      "get": {
        "summary": "Health check endpoint",
        "operationId": "GetHealth",
        "responses": {
          "200": {
            "description": "Health status"
          }
        }
      }
    },
    "/users": {
      "post": {
        "summary": "Create a new user",
        "operationId": "CreateUser",
        "responses": {
          "201": {
            "description": "User created successfully"
          }
        }
      }
    }
  }
}
EOF

echo "✅ Code generation complete!"
echo "📦 Mock TypeScript client: lib/"
echo "📋 Mock OpenAPI spec: generated/"
echo ""
echo "🔁 Syncing OpenAPI to docs..."
mkdir -p ../docs
cp -f generated/openapi.json ../docs/openapi.json || true
echo "📄 OpenAPI copied to packages/docs/openapi.json"
echo ""
echo "⚠️  Note: These are mock implementations."
echo "   To generate actual code from Smithy models:"
echo "   1. Install Smithy CLI: https://smithy.io/2.0/guides/smithy-cli/cli_installation.html"
echo "   2. Update this script to use actual Smithy commands"
echo ""
echo "🎉 Build complete!"