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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWdhdGV3YXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uc3RydWN0cy9hcGktZ2F0ZXdheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBdUM7QUFDdkMsK0RBb0JvQztBQUVwQyxtREFBK0Q7QUFDL0QsK0VBQXdGO0FBQ3hGLHlEQUE0RTtBQUM1RSx5RUFBbUU7QUFDbkUsNkNBQWtEO0FBRWxELCtEQUE4RTtBQUM5RSw2Q0FBdUM7QUF3Q3ZDLE1BQWEsbUJBQW9CLFNBQVEsc0JBQVM7SUFNaEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUErQjtRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFDSixXQUFXLEVBQ1gsZUFBZSxFQUNmLFVBQVUsRUFDVixVQUFVLEVBQ1YsV0FBVyxFQUNYLGdCQUFnQixFQUNoQixRQUFRLEdBQ1QsR0FBRyxLQUFLLENBQUM7UUFFViwwQkFBMEI7UUFDMUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxtQkFBUSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUNoRSxZQUFZLEVBQUUsMkJBQTJCLFdBQVcsY0FBYztZQUNsRSxTQUFTLEVBQUUsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHdCQUFhLENBQUMsUUFBUTtZQUNwRixhQUFhLEVBQUUsMkJBQWEsQ0FBQyxPQUFPO1NBQ3JDLENBQUMsQ0FBQztRQUVILDZCQUE2QjtRQUM3QixNQUFNLGlCQUFpQixHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDdEUsWUFBWSxFQUFFLDJCQUEyQixXQUFXLGlCQUFpQjtZQUNyRSxTQUFTLEVBQUUsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHdCQUFhLENB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QUFJLEVBQUU7Z0JBQzlDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTthQUMxQztZQUNEO2dCQUNFLElBQUksRUFBRSxZQUFZO2dCQUNsQixRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7Z0JBQy9DLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTthQUMzQztTQUNGLENBQUM7UUFFRixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25CLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUM5RCxJQUFJLEVBQUUsV0FBVyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUM1QixXQUFXLEVBQUUsV0FBVyxJQUFJLENBQUMsSUFBSSxhQUFhO2dCQUM5QyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsdUJBQU0sQ0FBQyxLQUFLLEVBQUU7YUFDekQsQ0FBQyxDQUFDO1lBRUgsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZTthQUNwQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQW5VRCxrREFtVUM7QUFFRCwyQkFBMkI7QUFDM0IsK0RBQStEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQge1xuICBSZXN0QXBpLFxuICBSZXN0QXBpUHJvcHMsXG4gIEVuZHBvaW50VHlwZSxcbiAgTWV0aG9kTG9nZ2luZ0xldmVsLFxuICBBY2Nlc3NMb2dGb3JtYXQsXG4gIExvZ0dyb3VwTG9nRGVzdGluYXRpb24sXG4gIENvcnMsXG4gIENvcnNPcHRpb25zLFxuICBUaHJvdHRsZVNldHRpbmdzLFxuICBSZXF1ZXN0VmFsaWRhdG9yLFxuICBNb2RlbCxcbiAgSnNvblNjaGVtYVR5cGUsXG4gIERvbWFpbk5hbWUsXG4gIEJhc2VQYXRoTWFwcGluZyxcbiAgU2VjdXJpdHlQb2xpY3ksXG4gIENvZ25pdG9Vc2VyUG9vbHNBdXRob3JpemVyLFxuICBBdXRob3JpemF0aW9uVHlwZSxcbiAgTW9ja0ludGVncmF0aW9uLFxuICBQYXNzdGhyb3VnaEJlaGF2aW9yLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgeyBGdW5jdGlvbiBhcyBMYW1iZGFGdW5jdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgTG9nR3JvdXAsIFJldGVudGlvbkRheXMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgeyBDZXJ0aWZpY2F0ZSwgQ2VydGlmaWNhdGVWYWxpZGF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5pbXBvcnQgeyBIb3N0ZWRab25lLCBBUmVjb3JkLCBSZWNvcmRUYXJnZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgeyBBcGlHYXRld2F5RG9tYWluIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBSZW1vdmFsUG9saWN5LCBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgVXNlclBvb2wgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29nbml0byc7XG5pbXBvcnQgeyBVc2FnZVBsYW4sIFF1b3RhU2V0dGluZ3MsIFBlcmlvZCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaUdhdGV3YXlDb25zdHJ1Y3RQcm9wcyB7XG4gIC8qKlxuICAgKiBFbnZpcm9ubWVudCBuYW1lIChkZXYsIHN0YWdpbmcsIHByb2QpXG4gICAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIExhbWJkYSBmdW5jdGlvbnMgdG8gaW50ZWdyYXRlIHdpdGggQVBJIEdhdGV3YXlcbiAgICovXG4gIGxhbWJkYUZ1bmN0aW9uczogTWFwPHN0cmluZywgTGFtYmRhRnVuY3Rpb24+O1xuICBcbiAgLyoqXG4gICAqIEN1c3RvbSBkb21haW4gbmFtZSBmb3IgdGhlIEFQSVxuICAgKiBAZXhhbXBsZSAnYXBpLm1hZG1hbGwuY29tJ1xuICAgKi9cbiAgZG9tYWluTmFtZT86IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBIb3N0ZWQgem9uZSBmb3IgdGhlIGRvbWFpblxuICAgKi9cbiAgaG9zdGVkWm9uZT86IEhvc3RlZFpvbmU7XG4gIFxuICAvKipcbiAgICogQ09SUyBjb25maWd1cmF0aW9uXG4gICAqL1xuICBjb3JzT3B0aW9ucz86IENvcnNPcHRpb25zO1xuICBcbiAgLyoqXG4gICAqIFRocm90dGxpbmcgc2V0dGluZ3NcbiAgICovXG4gIHRocm90dGxlU2V0dGluZ3M/OiBUaHJvdHRsZVNldHRpbmdzO1xuXG4gIC8qKlxuICAgKiBDb2duaXRvIFVzZXIgUG9vbCBmb3IgQVBJIGF1dGhvcml6YXRpb25cbiAgICovXG4gIHVzZXJQb29sOiBVc2VyUG9vbDtcbn1cblxuZXhwb3J0IGNsYXNzIEFwaUdhdGV3YXlDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgcmVzdEFwaTogUmVzdEFwaTtcbiAgcHVibGljIHJlYWRvbmx5IGRvbWFpbk5hbWU/OiBEb21haW5OYW1lO1xuICBwdWJsaWMgcmVhZG9ubHkgY2VydGlmaWNhdGU/OiBDZXJ0aWZpY2F0ZTtcbiAgcHJpdmF0ZSByZWFkb25seSBhdXRob3JpemVyOiBDb2duaXRvVXNlclBvb2xzQXV0aG9yaXplcjtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQXBpR2F0ZXdheUNvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgbGFtYmRhRnVuY3Rpb25zLFxuICAgICAgZG9tYWluTmFtZSxcbiAgICAgIGhvc3RlZFpvbmUsXG4gICAgICBjb3JzT3B0aW9ucyxcbiAgICAgIHRocm90dGxlU2V0dGluZ3MsXG4gICAgICB1c2VyUG9vbCxcbiAgICB9ID0gcHJvcHM7XG5cbiAgICAvLyBDcmVhdGUgYWNjZXNzIGxvZyBncm91cFxuICAgIGNvbnN0IGFjY2Vzc0xvZ0dyb3VwID0gbmV3IExvZ0dyb3VwKHRoaXMsICdBcGlHYXRld2F5QWNjZXNzTG9ncycsIHtcbiAgICAgIGxvZ0dyb3VwTmFtZTogYC9hd3MvYXBpZ2F0ZXdheS9tYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFjY2Vzcy1sb2dzYCxcbiAgICAgIHJldGVudGlvbjogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJldGVudGlvbkRheXMuT05FX01PTlRIIDogUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBleGVjdXRpb24gbG9nIGdyb3VwXG4gICAgY29uc3QgZXhlY3V0aW9uTG9nR3JvdXAgPSBuZXcgTG9nR3JvdXAodGhpcywgJ0FwaUdhdGV3YXlFeGVjdXRpb25Mb2dzJywge1xuICAgICAgbG9nR3JvdXBOYW1lOiBgL2F3cy9hcGlnYXRld2F5L21hZG1hbGwtJHtlbnZpcm9ubWVudH0tZXhlY3V0aW9uLWxvZ3NgLFxuICAgICAgcmV0ZW50aW9uOiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmV0ZW50aW9uRGF5cy5PTkVfTU9OVEggOiBSZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgLy8gU2V0IHVwIFNTTCBjZXJ0aWZpY2F0ZSBpZiBjdXN0b20gZG9tYWluIGlzIHByb3ZpZGVkXG4gICAgaWYgKGRvbWFpbk5hbWUgJiYgaG9zdGVkWm9uZSkge1xuICAgICAgdGhpcy5jZXJ0aWZpY2F0ZSA9IG5ldyBDZXJ0aWZpY2F0ZSh0aGlzLCAnQXBpQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgIGRvbWFpbk5hbWUsXG4gICAgICAgIHZhbGlkYXRpb246IENlcnRpZmljYXRlVmFsaWRhdGlvbi5mcm9tRG5zKGhvc3RlZFpvbmUpLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZG9tYWluTmFtZSA9IG5ldyBEb21haW5OYW1lKHRoaXMsICdBcGlEb21haW5OYW1lJywge1xuICAgICAgICBkb21haW5OYW1lLFxuICAgICAgICBjZXJ0aWZpY2F0ZTogdGhpcy5jZXJ0aWZpY2F0ZSxcbiAgICAgICAgc2VjdXJpdHlQb2xpY3k6IFNlY3VyaXR5UG9saWN5LlRMU18xXzIsXG4gICAgICAgIGVuZHBvaW50VHlwZTogRW5kcG9pbnRUeXBlLlJFR0lPTkFMLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIFJFU1QgQVBJXG4gICAgdGhpcy5yZXN0QXBpID0gbmV3IFJlc3RBcGkodGhpcywgJ1Jlc3RBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYXBpYCxcbiAgICAgIGRlc2NyaXB0aW9uOiBgTUFETWFsbCAke2Vudmlyb25tZW50fSBSRVNUIEFQSWAsXG4gICAgICBlbmRwb2ludFR5cGVzOiBbRW5kcG9pbnRUeXBlLlJFR0lPTkFMXSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiBlbnZpcm9ubWVudCxcbiAgICAgICAgbG9nZ2luZ0xldmVsOiBNZXRob2RMb2dnaW5nTGV2ZWwuSU5GTyxcbiAgICAgICAgZGF0YVRyYWNlRW5hYmxlZDogZW52aXJvbm1lbnQgIT09ICdwcm9kJyxcbiAgICAgICAgbWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRyYWNpbmdFbmFibGVkOiB0cnVlLFxuICAgICAgICBhY2Nlc3NMb2dEZXN0aW5hdGlvbjogbmV3IExvZ0dyb3VwTG9nRGVzdGluYXRpb24oYWNjZXNzTG9nR3JvdXApLFxuICAgICAgICBhY2Nlc3NMb2dGb3JtYXQ6IEFjY2Vzc0xvZ0Zvcm1hdC5qc29uV2l0aFN0YW5kYXJkRmllbGRzKHtcbiAgICAgICAgICBjYWxsZXI6IHRydWUsXG4gICAgICAgICAgaHR0cE1ldGhvZDogdHJ1ZSxcbiAgICAgICAgICBpcDogdHJ1ZSxcbiAgICAgICAgICBwcm90b2NvbDogdHJ1ZSxcbiAgICAgICAgICByZXF1ZXN0VGltZTogdHJ1ZSxcbiAgICAgICAgICByZXNvdXJjZVBhdGg6IHRydWUsXG4gICAgICAgICAgcmVzcG9uc2VMZW5ndGg6IHRydWUsXG4gICAgICAgICAgc3RhdHVzOiB0cnVlLFxuICAgICAgICAgIHVzZXI6IHRydWUsXG4gICAgICAgIH0pLFxuICAgICAgICB0aHJvdHRsaW5nQnVyc3RMaW1pdDogdGhyb3R0bGVTZXR0aW5ncz8uYnVyc3RMaW1pdCB8fCAyMDAwLFxuICAgICAgICB0aHJvdHRsaW5nUmF0ZUxpbWl0OiB0aHJvdHRsZVNldHRpbmdzPy5yYXRlTGltaXQgfHwgMTAwMCxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IGNvcnNPcHRpb25zIHx8IHRoaXMuZ2V0RGVmYXVsdENvcnNPcHRpb25zKCksXG4gICAgICBjbG91ZFdhdGNoUm9sZTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBDb2duaXRvIGF1dGhvcml6ZXJcbiAgICB0aGlzLmF1dGhvcml6ZXIgPSBuZXcgQ29nbml0b1VzZXJQb29sc0F1dGhvcml6ZXIodGhpcywgJ0FwaUF1dGhvcml6ZXInLCB7XG4gICAgICBjb2duaXRvVXNlclBvb2xzOiBbdXNlclBvb2xdLFxuICAgICAgYXV0aG9yaXplck5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWNvZ25pdG8tYXV0aG9yaXplcmAsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYmFzZSBwYXRoIG1hcHBpbmcgaWYgY3VzdG9tIGRvbWFpbiBpcyBjb25maWd1cmVkXG4gICAgaWYgKHRoaXMuZG9tYWluTmFtZSkge1xuICAgICAgbmV3IEJhc2VQYXRoTWFwcGluZyh0aGlzLCAnQmFzZVBhdGhNYXBwaW5nJywge1xuICAgICAgICBkb21haW5OYW1lOiB0aGlzLmRvbWFpbk5hbWUsXG4gICAgICAgIHJlc3RBcGk6IHRoaXMucmVzdEFwaSxcbiAgICAgICAgc3RhZ2U6IHRoaXMucmVzdEFwaS5kZXBsb3ltZW50U3RhZ2UsXG4gICAgICB9KTtcblxuICAgICAgLy8gQ3JlYXRlIEROUyByZWNvcmRcbiAgICAgIGlmIChob3N0ZWRab25lKSB7XG4gICAgICAgIG5ldyBBUmVjb3JkKHRoaXMsICdBcGlBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgICB6b25lOiBob3N0ZWRab25lLFxuICAgICAgICAgIHJlY29yZE5hbWU6IGRvbWFpbk5hbWUhLnNwbGl0KCcuJylbMF0sXG4gICAgICAgICAgdGFyZ2V0OiBSZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyBBcGlHYXRld2F5RG9tYWluKHRoaXMuZG9tYWluTmFtZSkpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgcmVxdWVzdCB2YWxpZGF0b3JzXG4gICAgdGhpcy5jcmVhdGVSZXF1ZXN0VmFsaWRhdG9ycygpO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSByZXNvdXJjZXMgYW5kIG1ldGhvZHNcbiAgICB0aGlzLmNyZWF0ZUFwaVJlc291cmNlcyhsYW1iZGFGdW5jdGlvbnMpO1xuXG4gICAgLy8gUHVibGljIGhlYWx0aCBlbmRwb2ludCBmb3IgbW9uaXRvcmluZyAobm8gYXV0aClcbiAgICBjb25zdCBoZWFsdGggPSB0aGlzLnJlc3RBcGkucm9vdC5hZGRSZXNvdXJjZSgnaGVhbHRoJyk7XG4gICAgaGVhbHRoLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IE1vY2tJbnRlZ3JhdGlvbih7XG4gICAgICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IFBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHsgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyB9LFxuICAgICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgICAgcmVzcG9uc2VUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wic3RhdHVzXCI6XCJoZWFsdGh5XCIsXCJzZXJ2aWNlXCI6XCJNQURNYWxsIEFQSVwifScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IEF1dGhvcml6YXRpb25UeXBlLk5PTkUsXG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW3sgc3RhdHVzQ29kZTogJzIwMCcgfV0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIEFkZCB0YWdzXG4gICAgVGFncy5vZih0aGlzLnJlc3RBcGkpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFwaWApO1xuICAgIFRhZ3Mub2YodGhpcy5yZXN0QXBpKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREZWZhdWx0Q29yc09wdGlvbnMoKTogQ29yc09wdGlvbnMge1xuICAgIHJldHVybiB7XG4gICAgICBhbGxvd09yaWdpbnM6IENvcnMuQUxMX09SSUdJTlMsXG4gICAgICBhbGxvd01ldGhvZHM6IENvcnMuQUxMX01FVEhPRFMsXG4gICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICdYLUFtei1EYXRlJyxcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgJ1gtQW16LVNlY3VyaXR5LVRva2VuJyxcbiAgICAgICAgJ1gtQW16LVVzZXItQWdlbnQnLFxuICAgICAgICAnWC1Db3JyZWxhdGlvbi1JZCcsXG4gICAgICBdLFxuICAgICAgZXhwb3NlSGVhZGVyczogW1xuICAgICAgICAnWC1Db3JyZWxhdGlvbi1JZCcsXG4gICAgICAgICdYLVJlcXVlc3QtSWQnLFxuICAgICAgXSxcbiAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICBtYXhBZ2U6IER1cmF0aW9uLmhvdXJzKDEpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlcXVlc3RWYWxpZGF0b3JzKCk6IHZvaWQge1xuICAgIC8vIEJvZHkgdmFsaWRhdG9yXG4gICAgbmV3IFJlcXVlc3RWYWxpZGF0b3IodGhpcywgJ0JvZHlWYWxpZGF0b3InLCB7XG4gICAgICByZXN0QXBpOiB0aGlzLnJlc3RBcGksXG4gICAgICByZXF1ZXN0VmFsaWRhdG9yTmFtZTogJ2JvZHktdmFsaWRhdG9yJyxcbiAgICAgIHZhbGlkYXRlUmVxdWVzdEJvZHk6IHRydWUsXG4gICAgICB2YWxpZGF0ZVJlcXVlc3RQYXJhbWV0ZXJzOiBmYWxzZSxcbiAgICB9KTtcblxuICAgIC8vIFBhcmFtZXRlcnMgdmFsaWRhdG9yXG4gICAgbmV3IFJlcXVlc3RWYWxpZGF0b3IodGhpcywgJ1BhcmFtZXRlcnNWYWxpZGF0b3InLCB7XG4gICAgICByZXN0QXBpOiB0aGlzLnJlc3RBcGksXG4gICAgICByZXF1ZXN0VmFsaWRhdG9yTmFtZTogJ3BhcmFtZXRlcnMtdmFsaWRhdG9yJyxcbiAgICAgIHZhbGlkYXRlUmVxdWVzdEJvZHk6IGZhbHNlLFxuICAgICAgdmFsaWRhdGVSZXF1ZXN0UGFyYW1ldGVyczogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIEZ1bGwgdmFsaWRhdG9yXG4gICAgbmV3IFJlcXVlc3RWYWxpZGF0b3IodGhpcywgJ0Z1bGxWYWxpZGF0b3InLCB7XG4gICAgICByZXN0QXBpOiB0aGlzLnJlc3RBcGksXG4gICAgICByZXF1ZXN0VmFsaWRhdG9yTmFtZTogJ2Z1bGwtdmFsaWRhdG9yJyxcbiAgICAgIHZhbGlkYXRlUmVxdWVzdEJvZHk6IHRydWUsXG4gICAgICB2YWxpZGF0ZVJlcXVlc3RQYXJhbWV0ZXJzOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVBcGlSZXNvdXJjZXMobGFtYmRhRnVuY3Rpb25zOiBNYXA8c3RyaW5nLCBMYW1iZGFGdW5jdGlvbj4pOiB2b2lkIHtcbiAgICAvLyBDcmVhdGUgQVBJIHN0cnVjdHVyZSBiYXNlZCBvbiBzZXJ2aWNlIGRvbWFpbnNcbiAgICBjb25zdCBhcGlTdHJ1Y3R1cmUgPSB7XG4gICAgICAndjEnOiB7XG4gICAgICAgICd1c2Vycyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXSxcbiAgICAgICAgICBmdW5jdGlvbjogJ3VzZXItc2VydmljZScsXG4gICAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgICdjaXJjbGVzJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURSddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAnY2lyY2xlLXNlcnZpY2UnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnc3Rvcmllcyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXSxcbiAgICAgICAgICBmdW5jdGlvbjogJ3N0b3J5LXNlcnZpY2UnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnYnVzaW5lc3Nlcyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXSxcbiAgICAgICAgICBmdW5jdGlvbjogJ2J1c2luZXNzLXNlcnZpY2UnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAncmVzb3VyY2VzJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURSddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAncmVzb3VyY2Utc2VydmljZScsXG4gICAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgICdhdXRoJzoge1xuICAgICAgICAgIG1ldGhvZHM6IFsnUE9TVCddLFxuICAgICAgICAgIGZ1bmN0aW9uOiAnYXV0aC1zZXJ2aWNlJyxcbiAgICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgJ2ltYWdlcyc6IHtcbiAgICAgICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJ10sXG4gICAgICAgICAgZnVuY3Rpb246ICd0aXRhbi1lbmdpbmUnLFxuICAgICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnYWknOiB7XG4gICAgICAgICAgbWV0aG9kczogWydQT1NUJ10sXG4gICAgICAgICAgZnVuY3Rpb246ICdiZWRyb2NrLWFnZW50LW9yY2hlc3RyYXRvcicsXG4gICAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG5cbiAgICB0aGlzLmJ1aWxkQXBpUmVzb3VyY2VzKHRoaXMucmVzdEFwaS5yb290LCBhcGlTdHJ1Y3R1cmUsIGxhbWJkYUZ1bmN0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkQXBpUmVzb3VyY2VzKFxuICAgIHBhcmVudDogYW55LFxuICAgIHN0cnVjdHVyZTogYW55LFxuICAgIGxhbWJkYUZ1bmN0aW9uczogTWFwPHN0cmluZywgTGFtYmRhRnVuY3Rpb24+XG4gICk6IHZvaWQge1xuICAgIE9iamVjdC5lbnRyaWVzKHN0cnVjdHVyZSkuZm9yRWFjaCgoW3BhdGgsIGNvbmZpZ106IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgIGNvbnN0IHJlc291cmNlID0gcGFyZW50LmFkZFJlc291cmNlKHBhdGgpO1xuXG4gICAgICBpZiAoY29uZmlnLmZ1bmN0aW9uICYmIGNvbmZpZy5tZXRob2RzKSB7XG4gICAgICAgIGNvbnN0IGxhbWJkYUZ1bmN0aW9uID0gbGFtYmRhRnVuY3Rpb25zLmdldChjb25maWcuZnVuY3Rpb24pO1xuICAgICAgICBpZiAobGFtYmRhRnVuY3Rpb24pIHtcbiAgICAgICAgICBpZiAoY29uZmlnLnByb3h5KSB7XG4gICAgICAgICAgICAvLyBBZGQgcHJveHkgaW50ZWdyYXRpb24gZm9yIGFsbCBtZXRob2RzXG4gICAgICAgICAgICByZXNvdXJjZS5hZGRQcm94eSh7XG4gICAgICAgICAgICAgIGRlZmF1bHRJbnRlZ3JhdGlvbjogbmV3IExhbWJkYUludGVncmF0aW9uKGxhbWJkYUZ1bmN0aW9uLCB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdFRlbXBsYXRlczogeyAnYXBwbGljYXRpb24vanNvbic6ICd7IFwic3RhdHVzQ29kZVwiOiBcIjIwMFwiIH0nIH0sXG4gICAgICAgICAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBhbnlNZXRob2Q6IHRydWUsXG4gICAgICAgICAgICAgIGRlZmF1bHRNZXRob2RPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IEF1dGhvcml6YXRpb25UeXBlLkNPR05JVE8sXG4gICAgICAgICAgICAgICAgYXV0aG9yaXplcjogdGhpcy5hdXRob3JpemVyLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFkZCBzcGVjaWZpYyBtZXRob2RzXG4gICAgICAgICAgICBjb25maWcubWV0aG9kcy5mb3JFYWNoKChtZXRob2Q6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICByZXNvdXJjZS5hZGRNZXRob2QobWV0aG9kLCBuZXcgTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhRnVuY3Rpb24sIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7ICdhcHBsaWNhdGlvbi9qc29uJzogJ3sgXCJzdGF0dXNDb2RlXCI6IFwiMjAwXCIgfScgfSxcbiAgICAgICAgICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSksIHtcbiAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogQXV0aG9yaXphdGlvblR5cGUuQ09HTklUTyxcbiAgICAgICAgICAgICAgICBhdXRob3JpemVyOiB0aGlzLmF1dGhvcml6ZXIsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZWN1cnNpdmVseSBidWlsZCBuZXN0ZWQgcmVzb3VyY2VzXG4gICAgICAgIHRoaXMuYnVpbGRBcGlSZXNvdXJjZXMocmVzb3VyY2UsIGNvbmZpZywgbGFtYmRhRnVuY3Rpb25zKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgY3VzdG9tIHRocm90dGxpbmcgc2V0dGluZ3MgdG8gc3BlY2lmaWMgcmVzb3VyY2VzXG4gICAqL1xuICBwdWJsaWMgYWRkUmVzb3VyY2VUaHJvdHRsaW5nKHJlc291cmNlUGF0aDogc3RyaW5nLCBzZXR0aW5nczogVGhyb3R0bGVTZXR0aW5ncyk6IHZvaWQge1xuICAgIGNvbnN0IHJlc291cmNlID0gdGhpcy5yZXN0QXBpLnJvb3QucmVzb3VyY2VGb3JQYXRoKHJlc291cmNlUGF0aCk7XG4gICAgaWYgKHJlc291cmNlKSB7XG4gICAgICAvLyBOb3RlOiBSZXNvdXJjZS1sZXZlbCB0aHJvdHRsaW5nIHdvdWxkIGJlIGltcGxlbWVudGVkIHRocm91Z2ggdXNhZ2UgcGxhbnNcbiAgICAgIC8vIFRoaXMgaXMgYSBwbGFjZWhvbGRlciBmb3IgdGhlIGludGVyZmFjZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdXNhZ2UgcGxhbnMgZm9yIEFQSSBrZXkgbWFuYWdlbWVudFxuICAgKi9cbiAgcHVibGljIGNyZWF0ZVVzYWdlUGxhbnMoKTogdm9pZCB7XG4gICAgY29uc3QgcGxhbnMgPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdiYXNpYycsXG4gICAgICAgIHRocm90dGxlOiB7IHJhdGVMaW1pdDogMTAwLCBidXJzdExpbWl0OiAyMDAgfSxcbiAgICAgICAgcXVvdGE6IHsgbGltaXQ6IDEwMDAwLCBwZXJpb2Q6ICdNT05USCcgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdwcmVtaXVtJyxcbiAgICAgICAgdGhyb3R0bGU6IHsgcmF0ZUxpbWl0OiA1MDAsIGJ1cnN0TGltaXQ6IDEwMDAgfSxcbiAgICAgICAgcXVvdGE6IHsgbGltaXQ6IDEwMDAwMCwgcGVyaW9kOiAnTU9OVEgnIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnZW50ZXJwcmlzZScsXG4gICAgICAgIHRocm90dGxlOiB7IHJhdGVMaW1pdDogMjAwMCwgYnVyc3RMaW1pdDogNTAwMCB9LFxuICAgICAgICBxdW90YTogeyBsaW1pdDogMTAwMDAwMCwgcGVyaW9kOiAnTU9OVEgnIH0sXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBwbGFucy5mb3JFYWNoKHBsYW4gPT4ge1xuICAgICAgY29uc3QgdXNhZ2VQbGFuID0gdGhpcy5yZXN0QXBpLmFkZFVzYWdlUGxhbihgJHtwbGFuLm5hbWV9UGxhbmAsIHtcbiAgICAgICAgbmFtZTogYG1hZG1hbGwtJHtwbGFuLm5hbWV9YCxcbiAgICAgICAgZGVzY3JpcHRpb246IGBNQURNYWxsICR7cGxhbi5uYW1lfSB1c2FnZSBwbGFuYCxcbiAgICAgICAgdGhyb3R0bGU6IHBsYW4udGhyb3R0bGUsXG4gICAgICAgIHF1b3RhOiB7IGxpbWl0OiBwbGFuLnF1b3RhLmxpbWl0LCBwZXJpb2Q6IFBlcmlvZC5NT05USCB9LFxuICAgICAgfSk7XG5cbiAgICAgIHVzYWdlUGxhbi5hZGRBcGlTdGFnZSh7XG4gICAgICAgIHN0YWdlOiB0aGlzLnJlc3RBcGkuZGVwbG95bWVudFN0YWdlLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gSW1wb3J0IExhbWJkYUludGVncmF0aW9uXG5pbXBvcnQgeyBMYW1iZGFJbnRlZ3JhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JzsiXX0=