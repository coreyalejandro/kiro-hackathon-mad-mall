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
        new aws_logs_1.LogGroup(this, 'ApiGatewayExecutionLogs', {
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
    addResourceThrottling(resourcePath, _settings) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWdhdGV3YXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uc3RydWN0cy9hcGktZ2F0ZXdheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBdUM7QUFDdkMsK0RBaUJvQztBQUVwQyxtREFBK0Q7QUFDL0QsK0VBQXdGO0FBQ3hGLHlEQUE0RTtBQUM1RSx5RUFBbUU7QUFDbkUsNkNBQWtEO0FBRWxELCtEQUFvRDtBQUNwRCw2Q0FBdUM7QUF3Q3ZDLE1BQWEsbUJBQW9CLFNBQVEsc0JBQVM7SUFNaEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUErQjtRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFDSixXQUFXLEVBQ1gsZUFBZSxFQUNmLFVBQVUsRUFDVixVQUFVLEVBQ1YsV0FBVyxFQUNYLGdCQUFnQixFQUNoQixRQUFRLEdBQ1QsR0FBRyxLQUFLLENBQUM7UUFFViwwQkFBMEI7UUFDMUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxtQkFBUSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUNoRSxZQUFZLEVBQUUsMkJBQTJCLFdBQVcsY0FBYztZQUNsRSxTQUFTLEVBQUUsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHdCQUFhLENBQUMsUUFBUTtZQUNwRixhQUFhLEVBQUUsMkJBQWEsQ0FBQyxPQUFPO1NBQ3JDLENBQUMsQ0FBQztRQUVILDZCQUE2QjtRQUM3QixJQUFJLG1CQUFRLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFO1lBQzVDLFlBQVksRUFBRSwyQkFBMkIsV0FBVyxpQkFBaUI7WUFDckUsU0FBUyxFQUFFLFdBQVcsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLHdCQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx3QkFBYSxDQUFDLFFBQVE7WUFDcEYsYUFB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QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEvVUQsa0RBK1VDO0FBRUQsMkJBQTJCO0FBQzNCLCtEQUErRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHtcbiAgUmVzdEFwaSxcbiAgRW5kcG9pbnRUeXBlLFxuICBNZXRob2RMb2dnaW5nTGV2ZWwsXG4gIEFjY2Vzc0xvZ0Zvcm1hdCxcbiAgTG9nR3JvdXBMb2dEZXN0aW5hdGlvbixcbiAgQ29ycyxcbiAgQ29yc09wdGlvbnMsXG4gIFRocm90dGxlU2V0dGluZ3MsXG4gIFJlcXVlc3RWYWxpZGF0b3IsXG4gIERvbWFpbk5hbWUsXG4gIEJhc2VQYXRoTWFwcGluZyxcbiAgU2VjdXJpdHlQb2xpY3ksXG4gIENvZ25pdG9Vc2VyUG9vbHNBdXRob3JpemVyLFxuICBBdXRob3JpemF0aW9uVHlwZSxcbiAgTW9ja0ludGVncmF0aW9uLFxuICBQYXNzdGhyb3VnaEJlaGF2aW9yLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgeyBGdW5jdGlvbiBhcyBMYW1iZGFGdW5jdGlvbiwgSUZ1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBMb2dHcm91cCwgUmV0ZW50aW9uRGF5cyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCB7IENlcnRpZmljYXRlLCBDZXJ0aWZpY2F0ZVZhbGlkYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCB7IEhvc3RlZFpvbmUsIEFSZWNvcmQsIFJlY29yZFRhcmdldCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IEFwaUdhdGV3YXlEb21haW4gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1My10YXJnZXRzJztcbmltcG9ydCB7IFJlbW92YWxQb2xpY3ksIFRhZ3MgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBVc2VyUG9vbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2duaXRvJztcbmltcG9ydCB7IFBlcmlvZCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaUdhdGV3YXlDb25zdHJ1Y3RQcm9wcyB7XG4gIC8qKlxuICAgKiBFbnZpcm9ubWVudCBuYW1lIChkZXYsIHN0YWdpbmcsIHByb2QpXG4gICAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIExhbWJkYSBmdW5jdGlvbnMgdG8gaW50ZWdyYXRlIHdpdGggQVBJIEdhdGV3YXlcbiAgICovXG4gIGxhbWJkYUZ1bmN0aW9uczogTWFwPHN0cmluZywgSUZ1bmN0aW9uPjtcbiAgXG4gIC8qKlxuICAgKiBDdXN0b20gZG9tYWluIG5hbWUgZm9yIHRoZSBBUElcbiAgICogQGV4YW1wbGUgJ2FwaS5tYWRtYWxsLmNvbSdcbiAgICovXG4gIGRvbWFpbk5hbWU/OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogSG9zdGVkIHpvbmUgZm9yIHRoZSBkb21haW5cbiAgICovXG4gIGhvc3RlZFpvbmU/OiBIb3N0ZWRab25lO1xuICBcbiAgLyoqXG4gICAqIENPUlMgY29uZmlndXJhdGlvblxuICAgKi9cbiAgY29yc09wdGlvbnM/OiBDb3JzT3B0aW9ucztcbiAgXG4gIC8qKlxuICAgKiBUaHJvdHRsaW5nIHNldHRpbmdzXG4gICAqL1xuICB0aHJvdHRsZVNldHRpbmdzPzogVGhyb3R0bGVTZXR0aW5ncztcblxuICAvKipcbiAgICogQ29nbml0byBVc2VyIFBvb2wgZm9yIEFQSSBhdXRob3JpemF0aW9uXG4gICAqL1xuICB1c2VyUG9vbDogVXNlclBvb2w7XG59XG5cbmV4cG9ydCBjbGFzcyBBcGlHYXRld2F5Q29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IHJlc3RBcGk6IFJlc3RBcGk7XG4gIHB1YmxpYyByZWFkb25seSBkb21haW5OYW1lPzogRG9tYWluTmFtZTtcbiAgcHVibGljIHJlYWRvbmx5IGNlcnRpZmljYXRlPzogQ2VydGlmaWNhdGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgYXV0aG9yaXplcjogQ29nbml0b1VzZXJQb29sc0F1dGhvcml6ZXI7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaUdhdGV3YXlDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGxhbWJkYUZ1bmN0aW9ucyxcbiAgICAgIGRvbWFpbk5hbWUsXG4gICAgICBob3N0ZWRab25lLFxuICAgICAgY29yc09wdGlvbnMsXG4gICAgICB0aHJvdHRsZVNldHRpbmdzLFxuICAgICAgdXNlclBvb2wsXG4gICAgfSA9IHByb3BzO1xuXG4gICAgLy8gQ3JlYXRlIGFjY2VzcyBsb2cgZ3JvdXBcbiAgICBjb25zdCBhY2Nlc3NMb2dHcm91cCA9IG5ldyBMb2dHcm91cCh0aGlzLCAnQXBpR2F0ZXdheUFjY2Vzc0xvZ3MnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2FwaWdhdGV3YXkvbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hY2Nlc3MtbG9nc2AsXG4gICAgICByZXRlbnRpb246IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZXRlbnRpb25EYXlzLk9ORV9NT05USCA6IFJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgZXhlY3V0aW9uIGxvZyBncm91cFxuICAgIG5ldyBMb2dHcm91cCh0aGlzLCAnQXBpR2F0ZXdheUV4ZWN1dGlvbkxvZ3MnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2FwaWdhdGV3YXkvbWFkbWFsbC0ke2Vudmlyb25tZW50fS1leGVjdXRpb24tbG9nc2AsXG4gICAgICByZXRlbnRpb246IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZXRlbnRpb25EYXlzLk9ORV9NT05USCA6IFJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICAvLyBTZXQgdXAgU1NMIGNlcnRpZmljYXRlIGlmIGN1c3RvbSBkb21haW4gaXMgcHJvdmlkZWRcbiAgICBpZiAoZG9tYWluTmFtZSAmJiBob3N0ZWRab25lKSB7XG4gICAgICB0aGlzLmNlcnRpZmljYXRlID0gbmV3IENlcnRpZmljYXRlKHRoaXMsICdBcGlDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgZG9tYWluTmFtZSxcbiAgICAgICAgdmFsaWRhdGlvbjogQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoaG9zdGVkWm9uZSksXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5kb21haW5OYW1lID0gbmV3IERvbWFpbk5hbWUodGhpcywgJ0FwaURvbWFpbk5hbWUnLCB7XG4gICAgICAgIGRvbWFpbk5hbWUsXG4gICAgICAgIGNlcnRpZmljYXRlOiB0aGlzLmNlcnRpZmljYXRlLFxuICAgICAgICBzZWN1cml0eVBvbGljeTogU2VjdXJpdHlQb2xpY3kuVExTXzFfMixcbiAgICAgICAgZW5kcG9pbnRUeXBlOiBFbmRwb2ludFR5cGUuUkVHSU9OQUwsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgUkVTVCBBUElcbiAgICB0aGlzLnJlc3RBcGkgPSBuZXcgUmVzdEFwaSh0aGlzLCAnUmVzdEFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hcGlgLFxuICAgICAgZGVzY3JpcHRpb246IGBNQURNYWxsICR7ZW52aXJvbm1lbnR9IFJFU1QgQVBJYCxcbiAgICAgIGVuZHBvaW50VHlwZXM6IFtFbmRwb2ludFR5cGUuUkVHSU9OQUxdLFxuICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICBzdGFnZU5hbWU6IGVudmlyb25tZW50LFxuICAgICAgICBsb2dnaW5nTGV2ZWw6IE1ldGhvZExvZ2dpbmdMZXZlbC5JTkZPLFxuICAgICAgICBkYXRhVHJhY2VFbmFibGVkOiBlbnZpcm9ubWVudCAhPT0gJ3Byb2QnLFxuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgdHJhY2luZ0VuYWJsZWQ6IHRydWUsXG4gICAgICAgIGFjY2Vzc0xvZ0Rlc3RpbmF0aW9uOiBuZXcgTG9nR3JvdXBMb2dEZXN0aW5hdGlvbihhY2Nlc3NMb2dHcm91cCksXG4gICAgICAgIGFjY2Vzc0xvZ0Zvcm1hdDogQWNjZXNzTG9nRm9ybWF0Lmpzb25XaXRoU3RhbmRhcmRGaWVsZHMoe1xuICAgICAgICAgIGNhbGxlcjogdHJ1ZSxcbiAgICAgICAgICBodHRwTWV0aG9kOiB0cnVlLFxuICAgICAgICAgIGlwOiB0cnVlLFxuICAgICAgICAgIHByb3RvY29sOiB0cnVlLFxuICAgICAgICAgIHJlcXVlc3RUaW1lOiB0cnVlLFxuICAgICAgICAgIHJlc291cmNlUGF0aDogdHJ1ZSxcbiAgICAgICAgICByZXNwb25zZUxlbmd0aDogdHJ1ZSxcbiAgICAgICAgICBzdGF0dXM6IHRydWUsXG4gICAgICAgICAgdXNlcjogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICAgIHRocm90dGxpbmdCdXJzdExpbWl0OiB0aHJvdHRsZVNldHRpbmdzPy5idXJzdExpbWl0IHx8IDIwMDAsXG4gICAgICAgIHRocm90dGxpbmdSYXRlTGltaXQ6IHRocm90dGxlU2V0dGluZ3M/LnJhdGVMaW1pdCB8fCAxMDAwLFxuICAgICAgfSxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczogY29yc09wdGlvbnMgfHwgdGhpcy5nZXREZWZhdWx0Q29yc09wdGlvbnMoKSxcbiAgICAgIGNsb3VkV2F0Y2hSb2xlOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIENvZ25pdG8gYXV0aG9yaXplclxuICAgIHRoaXMuYXV0aG9yaXplciA9IG5ldyBDb2duaXRvVXNlclBvb2xzQXV0aG9yaXplcih0aGlzLCAnQXBpQXV0aG9yaXplcicsIHtcbiAgICAgIGNvZ25pdG9Vc2VyUG9vbHM6IFt1c2VyUG9vbF0sXG4gICAgICBhdXRob3JpemVyTmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tY29nbml0by1hdXRob3JpemVyYCxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBiYXNlIHBhdGggbWFwcGluZyBpZiBjdXN0b20gZG9tYWluIGlzIGNvbmZpZ3VyZWRcbiAgICBpZiAodGhpcy5kb21haW5OYW1lKSB7XG4gICAgICBuZXcgQmFzZVBhdGhNYXBwaW5nKHRoaXMsICdCYXNlUGF0aE1hcHBpbmcnLCB7XG4gICAgICAgIGRvbWFpbk5hbWU6IHRoaXMuZG9tYWluTmFtZSxcbiAgICAgICAgcmVzdEFwaTogdGhpcy5yZXN0QXBpLFxuICAgICAgICBzdGFnZTogdGhpcy5yZXN0QXBpLmRlcGxveW1lbnRTdGFnZSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDcmVhdGUgRE5TIHJlY29yZFxuICAgICAgaWYgKGhvc3RlZFpvbmUpIHtcbiAgICAgICAgbmV3IEFSZWNvcmQodGhpcywgJ0FwaUFsaWFzUmVjb3JkJywge1xuICAgICAgICAgIHpvbmU6IGhvc3RlZFpvbmUsXG4gICAgICAgICAgcmVjb3JkTmFtZTogZG9tYWluTmFtZSEuc3BsaXQoJy4nKVswXSxcbiAgICAgICAgICB0YXJnZXQ6IFJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IEFwaUdhdGV3YXlEb21haW4odGhpcy5kb21haW5OYW1lKSksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSByZXF1ZXN0IHZhbGlkYXRvcnNcbiAgICB0aGlzLmNyZWF0ZVJlcXVlc3RWYWxpZGF0b3JzKCk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIHJlc291cmNlcyBhbmQgbWV0aG9kc1xuICAgIHRoaXMuY3JlYXRlQXBpUmVzb3VyY2VzKGxhbWJkYUZ1bmN0aW9ucyk7XG5cbiAgICAvLyBQdWJsaWMgaGVhbHRoIGVuZHBvaW50IGZvciBtb25pdG9yaW5nIChubyBhdXRoKVxuICAgIGNvbnN0IGhlYWx0aCA9IHRoaXMucmVzdEFwaS5yb290LmFkZFJlc291cmNlKCdoZWFsdGgnKTtcbiAgICBoZWFsdGguYWRkTWV0aG9kKFxuICAgICAgJ0dFVCcsXG4gICAgICBuZXcgTW9ja0ludGVncmF0aW9uKHtcbiAgICAgICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICAgICAgcmVxdWVzdFRlbXBsYXRlczogeyAnYXBwbGljYXRpb24vanNvbic6ICd7XCJzdGF0dXNDb2RlXCI6IDIwMH0nIH0sXG4gICAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICAgICAgICByZXNwb25zZVRlbXBsYXRlczoge1xuICAgICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJzdGF0dXNcIjpcImhlYWx0aHlcIixcInNlcnZpY2VcIjpcIk1BRE1hbGwgQVBJXCJ9JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogQXV0aG9yaXphdGlvblR5cGUuTk9ORSxcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbeyBzdGF0dXNDb2RlOiAnMjAwJyB9XSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQWRkIHRhZ3NcbiAgICBUYWdzLm9mKHRoaXMucmVzdEFwaSkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYXBpYCk7XG4gICAgVGFncy5vZih0aGlzLnJlc3RBcGkpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG4gIH1cblxuICBwcml2YXRlIGdldERlZmF1bHRDb3JzT3B0aW9ucygpOiBDb3JzT3B0aW9ucyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFsbG93T3JpZ2luczogQ29ycy5BTExfT1JJR0lOUyxcbiAgICAgIGFsbG93TWV0aG9kczogQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgIGFsbG93SGVhZGVyczogW1xuICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAnQXV0aG9yaXphdGlvbicsXG4gICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAgICAgICAnWC1BbXotVXNlci1BZ2VudCcsXG4gICAgICAgICdYLUNvcnJlbGF0aW9uLUlkJyxcbiAgICAgIF0sXG4gICAgICBleHBvc2VIZWFkZXJzOiBbXG4gICAgICAgICdYLUNvcnJlbGF0aW9uLUlkJyxcbiAgICAgICAgJ1gtUmVxdWVzdC1JZCcsXG4gICAgICBdLFxuICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgIG1heEFnZTogRHVyYXRpb24uaG91cnMoMSksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVxdWVzdFZhbGlkYXRvcnMoKTogdm9pZCB7XG4gICAgLy8gQm9keSB2YWxpZGF0b3JcbiAgICBuZXcgUmVxdWVzdFZhbGlkYXRvcih0aGlzLCAnQm9keVZhbGlkYXRvcicsIHtcbiAgICAgIHJlc3RBcGk6IHRoaXMucmVzdEFwaSxcbiAgICAgIHJlcXVlc3RWYWxpZGF0b3JOYW1lOiAnYm9keS12YWxpZGF0b3InLFxuICAgICAgdmFsaWRhdGVSZXF1ZXN0Qm9keTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlUmVxdWVzdFBhcmFtZXRlcnM6IGZhbHNlLFxuICAgIH0pO1xuXG4gICAgLy8gUGFyYW1ldGVycyB2YWxpZGF0b3JcbiAgICBuZXcgUmVxdWVzdFZhbGlkYXRvcih0aGlzLCAnUGFyYW1ldGVyc1ZhbGlkYXRvcicsIHtcbiAgICAgIHJlc3RBcGk6IHRoaXMucmVzdEFwaSxcbiAgICAgIHJlcXVlc3RWYWxpZGF0b3JOYW1lOiAncGFyYW1ldGVycy12YWxpZGF0b3InLFxuICAgICAgdmFsaWRhdGVSZXF1ZXN0Qm9keTogZmFsc2UsXG4gICAgICB2YWxpZGF0ZVJlcXVlc3RQYXJhbWV0ZXJzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gRnVsbCB2YWxpZGF0b3JcbiAgICBuZXcgUmVxdWVzdFZhbGlkYXRvcih0aGlzLCAnRnVsbFZhbGlkYXRvcicsIHtcbiAgICAgIHJlc3RBcGk6IHRoaXMucmVzdEFwaSxcbiAgICAgIHJlcXVlc3RWYWxpZGF0b3JOYW1lOiAnZnVsbC12YWxpZGF0b3InLFxuICAgICAgdmFsaWRhdGVSZXF1ZXN0Qm9keTogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlUmVxdWVzdFBhcmFtZXRlcnM6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUFwaVJlc291cmNlcyhsYW1iZGFGdW5jdGlvbnM6IE1hcDxzdHJpbmcsIElGdW5jdGlvbj4pOiB2b2lkIHtcbiAgICAvLyBDcmVhdGUgQVBJIHN0cnVjdHVyZSBiYXNlZCBvbiBzZXJ2aWNlIGRvbWFpbnNcbiAgICBjb25zdCBhcGlTdHJ1Y3R1cmUgPSB7XG4gICAgICAndjEnOiB7XG4gICAgICAgICd1c2Vycyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXSxcbiAgICAgICAgICBmdW5jdGlvbjogJ3VzZXItc2VydmljZScsXG4gICAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgICdjaXJjbGVzJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURSddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAnY2lyY2xlLXNlcnZpY2UnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnc3Rvcmllcyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXSxcbiAgICAgICAgICBmdW5jdGlvbjogJ3N0b3J5LXNlcnZpY2UnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnYnVzaW5lc3Nlcyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXSxcbiAgICAgICAgICBmdW5jdGlvbjogJ2J1c2luZXNzLXNlcnZpY2UnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAncmVzb3VyY2VzJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURSddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAncmVzb3VyY2Utc2VydmljZScsXG4gICAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgICdhdXRoJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnUE9TVCddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAnYXV0aC1zZXJ2aWNlJyxcbiAgICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgJ2ltYWdlcyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJ10sXG4gICAgICAgICAgZnVuY3Rpb246ICd0aXRhbi1lbmdpbmUnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAndXBsb2FkJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnUE9TVCddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAndXBsb2FkLWhhbmRsZXInLFxuICAgICAgICB9LFxuICAgICAgICAndXBsb2FkL2NvbmZpcm0nOiB7XG4gICAgICAgICAgbWV0aG9kczogWydQT1NUJ10sXG4gICAgICAgICAgZnVuY3Rpb246ICd1cGxvYWQtaGFuZGxlcicsXG4gICAgICAgIH0sXG4gICAgICAgICd1cGxvYWQvYnVsayc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ1BPU1QnXSxcbiAgICAgICAgICBmdW5jdGlvbjogJ3VwbG9hZC1oYW5kbGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ2FpJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnUE9TVCddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAnYmVkcm9jay1hZ2VudC1vcmNoZXN0cmF0b3InLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgdGhpcy5idWlsZEFwaVJlc291cmNlcyh0aGlzLnJlc3RBcGkucm9vdCwgYXBpU3RydWN0dXJlLCBsYW1iZGFGdW5jdGlvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEFwaVJlc291cmNlcyhcbiAgICBwYXJlbnQ6IGFueSxcbiAgICBzdHJ1Y3R1cmU6IGFueSxcbiAgICBsYW1iZGFGdW5jdGlvbnM6IE1hcDxzdHJpbmcsIElGdW5jdGlvbj5cbiAgKTogdm9pZCB7XG4gICAgT2JqZWN0LmVudHJpZXMoc3RydWN0dXJlKS5mb3JFYWNoKChbcGF0aCwgY29uZmlnXTogW3N0cmluZywgYW55XSkgPT4ge1xuICAgICAgY29uc3QgcmVzb3VyY2UgPSBwYXJlbnQuYWRkUmVzb3VyY2UocGF0aCk7XG5cbiAgICAgIGlmIChjb25maWcuZnVuY3Rpb24gJiYgY29uZmlnLm1ldGhvZHMpIHtcbiAgICAgICAgY29uc3QgbGFtYmRhRnVuY3Rpb24gPSBsYW1iZGFGdW5jdGlvbnMuZ2V0KGNvbmZpZy5mdW5jdGlvbik7XG4gICAgICAgIGlmIChsYW1iZGFGdW5jdGlvbikge1xuICAgICAgICAgIGlmIChjb25maWcucHJveHkpIHtcbiAgICAgICAgICAgIC8vIEFkZCBwcm94eSBpbnRlZ3JhdGlvbiBmb3IgYWxsIG1ldGhvZHNcbiAgICAgICAgICAgIHJlc291cmNlLmFkZFByb3h5KHtcbiAgICAgICAgICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhRnVuY3Rpb24sIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7ICdhcHBsaWNhdGlvbi9qc29uJzogJ3sgXCJzdGF0dXNDb2RlXCI6IFwiMjAwXCIgfScgfSxcbiAgICAgICAgICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGFueU1ldGhvZDogdHJ1ZSxcbiAgICAgICAgICAgICAgZGVmYXVsdE1ldGhvZE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogQXV0aG9yaXphdGlvblR5cGUuQ09HTklUTyxcbiAgICAgICAgICAgICAgICBhdXRob3JpemVyOiB0aGlzLmF1dGhvcml6ZXIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQWRkIHNwZWNpZmljIG1ldGhvZHNcbiAgICAgICAgICAgIGNvbmZpZy5tZXRob2RzLmZvckVhY2goKG1ldGhvZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIHJlc291cmNlLmFkZE1ldGhvZChtZXRob2QsIG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFGdW5jdGlvbiwge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHsgJ2FwcGxpY2F0aW9uL2pzb24nOiAneyBcInN0YXR1c0NvZGVcIjogXCIyMDBcIiB9JyB9LFxuICAgICAgICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICAgICAgICB9KSwge1xuICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBBdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgICAgICAgICAgIGF1dGhvcml6ZXI6IHRoaXMuYXV0aG9yaXplcixcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGJ1aWxkIG5lc3RlZCByZXNvdXJjZXNcbiAgICAgICAgdGhpcy5idWlsZEFwaVJlc291cmNlcyhyZXNvdXJjZSwgY29uZmlnLCBsYW1iZGFGdW5jdGlvbnMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBjdXN0b20gdGhyb3R0bGluZyBzZXR0aW5ncyB0byBzcGVjaWZpYyByZXNvdXJjZXNcbiAgICovXG4gIHB1YmxpYyBhZGRSZXNvdXJjZVRocm90dGxpbmcocmVzb3VyY2VQYXRoOiBzdHJpbmcsIF9zZXR0aW5nczogVGhyb3R0bGVTZXR0aW5ncyk6IHZvaWQge1xuICAgIGNvbnN0IHJlc291cmNlID0gdGhpcy5yZXN0QXBpLnJvb3QucmVzb3VyY2VGb3JQYXRoKHJlc291cmNlUGF0aCk7XG4gICAgaWYgKHJlc291cmNlKSB7XG4gICAgICAvLyBOb3RlOiBSZXNvdXJjZS1sZXZlbCB0aHJvdHRsaW5nIHdvdWxkIGJlIGltcGxlbWVudGVkIHRocm91Z2ggdXNhZ2UgcGxhbnNcbiAgICAgIC8vIFRoaXMgaXMgYSBwbGFjZWhvbGRlciBmb3IgdGhlIGludGVyZmFjZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdXNhZ2UgcGxhbnMgZm9yIEFQSSBrZXkgbWFuYWdlbWVudFxuICAgKi9cbiAgcHVibGljIGNyZWF0ZVVzYWdlUGxhbnMoKTogdm9pZCB7XG4gICAgY29uc3QgcGxhbnMgPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdiYXNpYycsXG4gICAgICAgIHRocm90dGxlOiB7IHJhdGVMaW1pdDogMTAwLCBidXJzdExpbWl0OiAyMDAgfSxcbiAgICAgICAgcXVvdGE6IHsgbGltaXQ6IDEwMDAwLCBwZXJpb2Q6ICdNT05USCcgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdwcmVtaXVtJyxcbiAgICAgICAgdGhyb3R0bGU6IHsgcmF0ZUxpbWl0OiA1MDAsIGJ1cnN0TGltaXQ6IDEwMDAgfSxcbiAgICAgICAgcXVvdGE6IHsgbGltaXQ6IDEwMDAwMCwgcGVyaW9kOiAnTU9OVEgnIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnZW50ZXJwcmlzZScsXG4gICAgICAgIHRocm90dGxlOiB7IHJhdGVMaW1pdDogMjAwMCwgYnVyc3RMaW1pdDogNTAwMCB9LFxuICAgICAgICBxdW90YTogeyBsaW1pdDogMTAwMDAwMCwgcGVyaW9kOiAnTU9OVEgnIH0sXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBwbGFucy5mb3JFYWNoKHBsYW4gPT4ge1xuICAgICAgY29uc3QgdXNhZ2VQbGFuID0gdGhpcy5yZXN0QXBpLmFkZFVzYWdlUGxhbihgJHtwbGFuLm5hbWV9UGxhbmAsIHtcbiAgICAgICAgbmFtZTogYG1hZG1hbGwtJHtwbGFuLm5hbWV9YCxcbiAgICAgICAgZGVzY3JpcHRpb246IGBNQURNYWxsICR7cGxhbi5uYW1lfSB1c2FnZSBwbGFuYCxcbiAgICAgICAgdGhyb3R0bGU6IHBsYW4udGhyb3R0bGUsXG4gICAgICAgIHF1b3RhOiB7IGxpbWl0OiBwbGFuLnF1b3RhLmxpbWl0LCBwZXJpb2Q6IFBlcmlvZC5NT05USCB9LFxuICAgICAgfSk7XG5cbiAgICAgIHVzYWdlUGxhbi5hZGRBcGlTdGFnZSh7XG4gICAgICAgIHN0YWdlOiB0aGlzLnJlc3RBcGkuZGVwbG95bWVudFN0YWdlLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gSW1wb3J0IExhbWJkYUludGVncmF0aW9uXG5pbXBvcnQgeyBMYW1iZGFJbnRlZ3JhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JzsiXX0=