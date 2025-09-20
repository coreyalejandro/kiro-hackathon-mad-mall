export * from './constructs/networking';
export * from './constructs/database';
export * from './constructs/lambda';
export * from './constructs/api-gateway';
export * from './constructs/authentication';
export * from './constructs/monitoring';
export * from './constructs/security';
export * from './stacks/main-stack';
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
export declare const getEnvironmentConfig: (environment: string) => Partial<InfrastructureConfig>;
