#!/usr/bin/env node
import 'source-map-support/register';
import { App, Environment } from 'aws-cdk-lib';
import { MainStack } from './stacks/main-stack';

const app = new App();

// Get environment configuration from context or environment variables
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Environment-specific configuration
const environmentConfig = {
  dev: {
    apiDomainName: undefined, // Use default API Gateway domain
    authDomainName: undefined, // Use default Cognito domain
    callbackUrls: [
      'http://localhost:3000/auth/callback',
      'http://localhost:5173/auth/callback',
    ],
    logoutUrls: [
      'http://localhost:3000/auth/logout',
      'http://localhost:5173/auth/logout',
    ],
    alertEmails: ['dev-team@madmall.com'],
    enableSocialLogin: false, // Disabled for dev to avoid OAuth setup complexity
    requireMfa: false,
  },
  staging: {
    apiDomainName: 'api-staging.madmall.com',
    authDomainName: 'auth-staging.madmall.com',
    callbackUrls: [
      'https://staging.madmall.com/auth/callback',
    ],
    logoutUrls: [
      'https://staging.madmall.com/auth/logout',
    ],
    alertEmails: ['staging-alerts@madmall.com'],
    enableSocialLogin: true,
    requireMfa: false,
  },
  prod: {
    apiDomainName: 'api.madmall.com',
    authDomainName: 'auth.madmall.com',
    callbackUrls: [
      'https://madmall.com/auth/callback',
      'https://www.madmall.com/auth/callback',
    ],
    logoutUrls: [
      'https://madmall.com/auth/logout',
      'https://www.madmall.com/auth/logout',
    ],
    alertEmails: [
      'alerts@madmall.com',
      'engineering@madmall.com',
    ],
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    enableSocialLogin: true,
    requireMfa: true,
  },
};

// Get configuration for the current environment
const config = environmentConfig[environment as keyof typeof environmentConfig];

if (!config) {
  throw new Error(`Unknown environment: ${environment}. Supported environments: dev, staging, prod`);
}

// AWS environment configuration
const env: Environment = {
  account,
  region,
};

// Create the main stack
new MainStack(app, `MADMallStack-${environment}`, {
  env,
  environment,
  stackName: `madmall-${environment}`,
  description: `MADMall ${environment} infrastructure stack`,
  tags: {
    Project: 'MADMall',
    Environment: environment,
    ManagedBy: 'AWS-CDK',
    Repository: 'madmall-aws-pdk-migration',
  },
  ...config,
});

// Add global tags to all resources
app.node.applyAspect({
  visit: (node) => {
    if (node.node.id !== 'Tree') {
      const tags = node.node.tryGetContext('tags') || {};
      Object.entries(tags).forEach(([key, value]) => {
        if (typeof value === 'string') {
          node.node.addMetadata(`tag:${key}`, value);
        }
      });
    }
  },
});

// Synthesize the app
app.synth();