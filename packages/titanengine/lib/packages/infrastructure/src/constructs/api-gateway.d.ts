import { Construct } from 'constructs';
import { RestApi, CorsOptions, ThrottleSettings, DomainName } from 'aws-cdk-lib/aws-apigateway';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
export interface ApiGatewayConstructProps {
    /**
     * Environment name (dev, staging, prod)
     */
    environment: string;
    /**
     * Lambda functions to integrate with API Gateway
     */
    lambdaFunctions: Map<string, LambdaFunction>;
    /**
     * Custom domain name for the API
     * @example 'api.madmall.com'
     */
    domainName?: string;
    /**
     * Hosted zone for the domain
     */
    hostedZone?: HostedZone;
    /**
     * CORS configuration
     */
    corsOptions?: CorsOptions;
    /**
     * Throttling settings
     */
    throttleSettings?: ThrottleSettings;
    /**
     * Cognito User Pool for API authorization
     */
    userPool: UserPool;
}
export declare class ApiGatewayConstruct extends Construct {
    readonly restApi: RestApi;
    readonly domainName?: DomainName;
    readonly certificate?: Certificate;
    private readonly authorizer;
    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps);
    private getDefaultCorsOptions;
    private createRequestValidators;
    private createApiResources;
    private buildApiResources;
    /**
     * Add custom throttling settings to specific resources
     */
    addResourceThrottling(resourcePath: string, settings: ThrottleSettings): void;
    /**
     * Create usage plans for API key management
     */
    createUsagePlans(): void;
}
