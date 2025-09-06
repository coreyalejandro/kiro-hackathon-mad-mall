// Export all constructs for reuse in other packages
export * from './constructs/networking';
export * from './constructs/database';
export * from './constructs/lambda';
export * from './constructs/api-gateway';
export * from './constructs/authentication';
export * from './constructs/monitoring';

// Export stacks
export * from './stacks/main-stack';

// Export types and interfaces
export interface InfrastructureConfig {
  environment: string;
  region: string;
  account: string;
  domainName?: string;
  enableSocialLogin?: boolean;
  requireMfa?: boolean;
  alertEmails: string[];
  slackWebhookUrl?: string;
}

// Export utility functions
export const getEnvironmentConfig = (environment: string): Partial<InfrastructureConfig> => {
  const configs = {
    dev: {
      enableSocialLogin: false,
      requireMfa: false,
      alertEmails: ['dev-team@madmall.com'],
    },
    staging: {
      enableSocialLogin: true,
      requireMfa: false,
      alertEmails: ['staging-alerts@madmall.com'],
    },
    prod: {
      enableSocialLogin: true,
      requireMfa: true,
      alertEmails: ['alerts@madmall.com', 'engineering@madmall.com'],
    },
  };

  return configs[environment as keyof typeof configs] || configs.dev;
};