import { Construct } from 'constructs';
import { UserPool, UserPoolClient, UserPoolDomain } from 'aws-cdk-lib/aws-cognito';
import { IdentityPool } from 'aws-cdk-lib/aws-cognito-identitypool';
import { Role } from 'aws-cdk-lib/aws-iam';
export interface AuthenticationConstructProps {
    /**
     * Environment name (dev, staging, prod)
     */
    environment: string;
    /**
     * Custom domain for Cognito hosted UI
     * @example 'auth.madmall.com'
     */
    customDomain?: string;
    /**
     * Callback URLs for OAuth flows
     */
    callbackUrls: string[];
    /**
     * Logout URLs for OAuth flows
     */
    logoutUrls: string[];
    /**
     * Whether to enable social login providers
     * @default true
     */
    enableSocialLogin?: boolean;
    /**
     * Whether to require MFA
     * @default true for prod, false for others
     */
    requireMfa?: boolean;
}
export declare class AuthenticationConstruct extends Construct {
    readonly userPool: UserPool;
    readonly userPoolClient: UserPoolClient;
    readonly userPoolDomain: UserPoolDomain;
    readonly identityPool: IdentityPool;
    readonly authenticatedRole: Role;
    readonly unauthenticatedRole: Role;
    constructor(scope: Construct, id: string, props: AuthenticationConstructProps);
    private createUserPool;
    private createUserPoolClient;
    private createUserPoolDomain;
    private setupSocialLoginProviders;
    private createUserGroups;
    private createIdentityPool;
    private createAuthenticatedRole;
    private createUnauthenticatedRole;
}
