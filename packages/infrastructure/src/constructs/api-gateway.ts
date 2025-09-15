import { Construct } from 'constructs';
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  AccessLogFormat,
  LogGroupLogDestination,
  Cors,
  CorsOptions,
  ThrottleSettings,
  RequestValidator,
  DomainName,
  BasePathMapping,
  SecurityPolicy,
  CognitoUserPoolsAuthorizer,
  AuthorizationType,
  MockIntegration,
  PassthroughBehavior,
} from 'aws-cdk-lib/aws-apigateway';
import { Function as LambdaFunction, IFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { RemovalPolicy, Tags } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Period } from 'aws-cdk-lib/aws-apigateway';
import { Duration } from 'aws-cdk-lib';

export interface ApiGatewayConstructProps {
  /**
   * Environment name (dev, staging, prod)
   */
  environment: string;
  
  /**
   * Lambda functions to integrate with API Gateway
   */
  lambdaFunctions: Map<string, IFunction>;
  
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

export class ApiGatewayConstruct extends Construct {
  public readonly restApi: RestApi;
  public readonly domainName?: DomainName;
  public readonly certificate?: Certificate;
  private readonly authorizer: CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    const {
      environment,
      lambdaFunctions,
      domainName,
      hostedZone,
      corsOptions,
      throttleSettings,
      userPool,
    } = props;

    // Create access log group
    const accessLogGroup = new LogGroup(this, 'ApiGatewayAccessLogs', {
      logGroupName: `/aws/apigateway/madmall-${environment}-access-logs`,
      retention: environment === 'prod' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create execution log group
    new LogGroup(this, 'ApiGatewayExecutionLogs', {
      logGroupName: `/aws/apigateway/madmall-${environment}-execution-logs`,
      retention: environment === 'prod' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Set up SSL certificate if custom domain is provided
    if (domainName && hostedZone) {
      this.certificate = new Certificate(this, 'ApiCertificate', {
        domainName,
        validation: CertificateValidation.fromDns(hostedZone),
      });

      this.domainName = new DomainName(this, 'ApiDomainName', {
        domainName,
        certificate: this.certificate,
        securityPolicy: SecurityPolicy.TLS_1_2,
        endpointType: EndpointType.REGIONAL,
      });
    }

    // Create REST API
    this.restApi = new RestApi(this, 'RestApi', {
      restApiName: `madmall-${environment}-api`,
      description: `MADMall ${environment} REST API`,
      endpointTypes: [EndpointType.REGIONAL],
      deployOptions: {
        stageName: environment,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: environment !== 'prod',
        metricsEnabled: true,
        tracingEnabled: true,
        accessLogDestination: new LogGroupLogDestination(accessLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        throttlingBurstLimit: throttleSettings?.burstLimit || 2000,
        throttlingRateLimit: throttleSettings?.rateLimit || 1000,
      },
      defaultCorsPreflightOptions: corsOptions || this.getDefaultCorsOptions(),
      cloudWatchRole: true,
    });

    // Create Cognito authorizer
    this.authorizer = new CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
      cognitoUserPools: [userPool],
      authorizerName: `madmall-${environment}-cognito-authorizer`,
    });

    // Create base path mapping if custom domain is configured
    if (this.domainName) {
      new BasePathMapping(this, 'BasePathMapping', {
        domainName: this.domainName,
        restApi: this.restApi,
        stage: this.restApi.deploymentStage,
      });

      // Create DNS record
      if (hostedZone) {
        new ARecord(this, 'ApiAliasRecord', {
          zone: hostedZone,
          recordName: domainName!.split('.')[0],
          target: RecordTarget.fromAlias(new ApiGatewayDomain(this.domainName)),
        });
      }
    }

    // Create request validators
    this.createRequestValidators();

    // Create API resources and methods
    this.createApiResources(lambdaFunctions);

    // Public health endpoint for monitoring (no auth)
    const health = this.restApi.root.addResource('health');
    health.addMethod(
      'GET',
      new MockIntegration({
        passthroughBehavior: PassthroughBehavior.NEVER,
        requestTemplates: { 'application/json': '{"statusCode": 200}' },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': '{"status":"healthy","service":"MADMall API"}',
            },
          },
        ],
      }),
      {
        authorizationType: AuthorizationType.NONE,
        methodResponses: [{ statusCode: '200' }],
      }
    );

    // Add tags
    Tags.of(this.restApi).add('Name', `madmall-${environment}-api`);
    Tags.of(this.restApi).add('Environment', environment);
  }

  private getDefaultCorsOptions(): CorsOptions {
    return {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
      allowHeaders: [
        'Content-Type',
        'X-Amz-Date',
        'Authorization',
        'X-Api-Key',
        'X-Amz-Security-Token',
        'X-Amz-User-Agent',
        'X-Correlation-Id',
      ],
      exposeHeaders: [
        'X-Correlation-Id',
        'X-Request-Id',
      ],
      allowCredentials: true,
      maxAge: Duration.hours(1),
    };
  }

  private createRequestValidators(): void {
    // Body validator
    new RequestValidator(this, 'BodyValidator', {
      restApi: this.restApi,
      requestValidatorName: 'body-validator',
      validateRequestBody: true,
      validateRequestParameters: false,
    });

    // Parameters validator
    new RequestValidator(this, 'ParametersValidator', {
      restApi: this.restApi,
      requestValidatorName: 'parameters-validator',
      validateRequestBody: false,
      validateRequestParameters: true,
    });

    // Full validator
    new RequestValidator(this, 'FullValidator', {
      restApi: this.restApi,
      requestValidatorName: 'full-validator',
      validateRequestBody: true,
      validateRequestParameters: true,
    });
  }

  private createApiResources(lambdaFunctions: Map<string, IFunction>): void {
    // Create API structure based on service domains
    const apiStructure = {
      'v1': {
        'users': {
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          function: 'user-service',
          proxy: true,
        },
        'circles': {
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          function: 'circle-service',
          proxy: true,
        },
        'stories': {
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          function: 'story-service',
          proxy: true,
        },
        'businesses': {
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          function: 'business-service',
          proxy: true,
        },
        'resources': {
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          function: 'resource-service',
          proxy: true,
        },
        'auth': {
          methods: ['POST'],
          function: 'auth-service',
          proxy: true,
        },
        'images': {
          methods: ['GET', 'POST'],
          function: 'titan-engine',
          proxy: true,
        },
        'upload': {
          methods: ['POST'],
          function: 'upload-handler',
        },
        'upload/confirm': {
          methods: ['POST'],
          function: 'upload-handler',
        },
        'upload/bulk': {
          methods: ['POST'],
          function: 'upload-handler',
        },
        'ai': {
          methods: ['POST'],
          function: 'bedrock-agent-orchestrator',
          proxy: true,
        },
      },
    };

    this.buildApiResources(this.restApi.root, apiStructure, lambdaFunctions);
  }

  private buildApiResources(
    parent: any,
    structure: any,
    lambdaFunctions: Map<string, IFunction>
  ): void {
    Object.entries(structure).forEach(([path, config]: [string, any]) => {
      const resource = parent.addResource(path);

      if (config.function && config.methods) {
        const lambdaFunction = lambdaFunctions.get(config.function);
        if (lambdaFunction) {
          if (config.proxy) {
            // Add proxy integration for all methods
            resource.addProxy({
              defaultIntegration: new LambdaIntegration(lambdaFunction, {
                requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
                proxy: true,
              }),
              anyMethod: true,
              defaultMethodOptions: {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: this.authorizer,
              },
            });
          } else {
            // Add specific methods
            config.methods.forEach((method: string) => {
              resource.addMethod(method, new LambdaIntegration(lambdaFunction, {
                requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
                proxy: true,
              }), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: this.authorizer,
              });
            });
          }
        }
      } else {
        // Recursively build nested resources
        this.buildApiResources(resource, config, lambdaFunctions);
      }
    });
  }

  /**
   * Add custom throttling settings to specific resources
   */
  public addResourceThrottling(resourcePath: string, _settings: ThrottleSettings): void {
    const resource = this.restApi.root.resourceForPath(resourcePath);
    if (resource) {
      // Note: Resource-level throttling would be implemented through usage plans
      // This is a placeholder for the interface
    }
  }

  /**
   * Create usage plans for API key management
   */
  public createUsagePlans(): void {
    const plans = [
      {
        name: 'basic',
        throttle: { rateLimit: 100, burstLimit: 200 },
        quota: { limit: 10000, period: 'MONTH' },
      },
      {
        name: 'premium',
        throttle: { rateLimit: 500, burstLimit: 1000 },
        quota: { limit: 100000, period: 'MONTH' },
      },
      {
        name: 'enterprise',
        throttle: { rateLimit: 2000, burstLimit: 5000 },
        quota: { limit: 1000000, period: 'MONTH' },
      },
    ];

    plans.forEach(plan => {
      const usagePlan = this.restApi.addUsagePlan(`${plan.name}Plan`, {
        name: `madmall-${plan.name}`,
        description: `MADMall ${plan.name} usage plan`,
        throttle: plan.throttle,
        quota: { limit: plan.quota.limit, period: Period.MONTH },
      });

      usagePlan.addApiStage({
        stage: this.restApi.deploymentStage,
      });
    });
  }
}

// Import LambdaIntegration
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';