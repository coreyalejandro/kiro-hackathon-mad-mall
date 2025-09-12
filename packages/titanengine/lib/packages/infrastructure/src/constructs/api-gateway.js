"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayConstruct = void 0;
const constructs_1 = require("constructs");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_certificatemanager_1 = require("aws-cdk-lib/aws-certificatemanager");
const aws_route53_1 = require("aws-cdk-lib/aws-route53");
const aws_route53_targets_1 = require("aws-cdk-lib/aws-route53-targets");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_apigateway_2 = require("aws-cdk-lib/aws-apigateway");
const aws_cdk_lib_2 = require("aws-cdk-lib");
class ApiGatewayConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { environment, lambdaFunctions, domainName, hostedZone, corsOptions, throttleSettings, userPool, } = props;
        // Create access log group
        const accessLogGroup = new aws_logs_1.LogGroup(this, 'ApiGatewayAccessLogs', {
            logGroupName: `/aws/apigateway/madmall-${environment}-access-logs`,
            retention: environment === 'prod' ? aws_logs_1.RetentionDays.ONE_MONTH : aws_logs_1.RetentionDays.ONE_WEEK,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        // Create execution log group
        const executionLogGroup = new aws_logs_1.LogGroup(this, 'ApiGatewayExecutionLogs', {
            logGroupName: `/aws/apigateway/madmall-${environment}-execution-logs`,
            retention: environment === 'prod' ? aws_logs_1.RetentionDays.ONE_MONTH : aws_logs_1.RetentionDays.ONE_WEEK,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        // Set up SSL certificate if custom domain is provided
        if (domainName && hostedZone) {
            this.certificate = new aws_certificatemanager_1.Certificate(this, 'ApiCertificate', {
                domainName,
                validation: aws_certificatemanager_1.CertificateValidation.fromDns(hostedZone),
            });
            this.domainName = new aws_apigateway_1.DomainName(this, 'ApiDomainName', {
                domainName,
                certificate: this.certificate,
                securityPolicy: aws_apigateway_1.SecurityPolicy.TLS_1_2,
                endpointType: aws_apigateway_1.EndpointType.REGIONAL,
            });
        }
        // Create REST API
        this.restApi = new aws_apigateway_1.RestApi(this, 'RestApi', {
            restApiName: `madmall-${environment}-api`,
            description: `MADMall ${environment} REST API`,
            endpointTypes: [aws_apigateway_1.EndpointType.REGIONAL],
            deployOptions: {
                stageName: environment,
                loggingLevel: aws_apigateway_1.MethodLoggingLevel.INFO,
                dataTraceEnabled: environment !== 'prod',
                metricsEnabled: true,
                tracingEnabled: true,
                accessLogDestination: new aws_apigateway_1.LogGroupLogDestination(accessLogGroup),
                accessLogFormat: aws_apigateway_1.AccessLogFormat.jsonWithStandardFields({
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
        this.authorizer = new aws_apigateway_1.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
            cognitoUserPools: [userPool],
            authorizerName: `madmall-${environment}-cognito-authorizer`,
        });
        // Create base path mapping if custom domain is configured
        if (this.domainName) {
            new aws_apigateway_1.BasePathMapping(this, 'BasePathMapping', {
                domainName: this.domainName,
                restApi: this.restApi,
                stage: this.restApi.deploymentStage,
            });
            // Create DNS record
            if (hostedZone) {
                new aws_route53_1.ARecord(this, 'ApiAliasRecord', {
                    zone: hostedZone,
                    recordName: domainName.split('.')[0],
                    target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.ApiGatewayDomain(this.domainName)),
                });
            }
        }
        // Create request validators
        this.createRequestValidators();
        // Create API resources and methods
        this.createApiResources(lambdaFunctions);
        // Public health endpoint for monitoring (no auth)
        const health = this.restApi.root.addResource('health');
        health.addMethod('GET', new aws_apigateway_1.MockIntegration({
            passthroughBehavior: aws_apigateway_1.PassthroughBehavior.NEVER,
            requestTemplates: { 'application/json': '{"statusCode": 200}' },
            integrationResponses: [
                {
                    statusCode: '200',
                    responseTemplates: {
                        'application/json': '{"status":"healthy","service":"MADMall API"}',
                    },
                },
            ],
        }), {
            authorizationType: aws_apigateway_1.AuthorizationType.NONE,
            methodResponses: [{ statusCode: '200' }],
        });
        // Add tags
        aws_cdk_lib_1.Tags.of(this.restApi).add('Name', `madmall-${environment}-api`);
        aws_cdk_lib_1.Tags.of(this.restApi).add('Environment', environment);
    }
    getDefaultCorsOptions() {
        return {
            allowOrigins: aws_apigateway_1.Cors.ALL_ORIGINS,
            allowMethods: aws_apigateway_1.Cors.ALL_METHODS,
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
            maxAge: aws_cdk_lib_2.Duration.hours(1),
        };
    }
    createRequestValidators() {
        // Body validator
        new aws_apigateway_1.RequestValidator(this, 'BodyValidator', {
            restApi: this.restApi,
            requestValidatorName: 'body-validator',
            validateRequestBody: true,
            validateRequestParameters: false,
        });
        // Parameters validator
        new aws_apigateway_1.RequestValidator(this, 'ParametersValidator', {
            restApi: this.restApi,
            requestValidatorName: 'parameters-validator',
            validateRequestBody: false,
            validateRequestParameters: true,
        });
        // Full validator
        new aws_apigateway_1.RequestValidator(this, 'FullValidator', {
            restApi: this.restApi,
            requestValidatorName: 'full-validator',
            validateRequestBody: true,
            validateRequestParameters: true,
        });
    }
    createApiResources(lambdaFunctions) {
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
                'ai': {
                    methods: ['POST'],
                    function: 'bedrock-agent-orchestrator',
                    proxy: true,
                },
            },
        };
        this.buildApiResources(this.restApi.root, apiStructure, lambdaFunctions);
    }
    buildApiResources(parent, structure, lambdaFunctions) {
        Object.entries(structure).forEach(([path, config]) => {
            const resource = parent.addResource(path);
            if (config.function && config.methods) {
                const lambdaFunction = lambdaFunctions.get(config.function);
                if (lambdaFunction) {
                    if (config.proxy) {
                        // Add proxy integration for all methods
                        resource.addProxy({
                            defaultIntegration: new aws_apigateway_3.LambdaIntegration(lambdaFunction, {
                                requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
                                proxy: true,
                            }),
                            anyMethod: true,
                            defaultMethodOptions: {
                                authorizationType: aws_apigateway_1.AuthorizationType.COGNITO,
                                authorizer: this.authorizer,
                            },
                        });
                    }
                    else {
                        // Add specific methods
                        config.methods.forEach((method) => {
                            resource.addMethod(method, new aws_apigateway_3.LambdaIntegration(lambdaFunction, {
                                requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
                                proxy: true,
                            }), {
                                authorizationType: aws_apigateway_1.AuthorizationType.COGNITO,
                                authorizer: this.authorizer,
                            });
                        });
                    }
                }
            }
            else {
                // Recursively build nested resources
                this.buildApiResources(resource, config, lambdaFunctions);
            }
        });
    }
    /**
     * Add custom throttling settings to specific resources
     */
    addResourceThrottling(resourcePath, settings) {
        const resource = this.restApi.root.resourceForPath(resourcePath);
        if (resource) {
            // Note: Resource-level throttling would be implemented through usage plans
            // This is a placeholder for the interface
        }
    }
    /**
     * Create usage plans for API key management
     */
    createUsagePlans() {
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
                quota: { limit: plan.quota.limit, period: aws_apigateway_2.Period.MONTH },
            });
            usagePlan.addApiStage({
                stage: this.restApi.deploymentStage,
            });
        });
    }
}
exports.ApiGatewayConstruct = ApiGatewayConstruct;
// Import LambdaIntegration
const aws_apigateway_3 = require("aws-cdk-lib/aws-apigateway");
//# sourceMappingURL=api-gateway.js.map