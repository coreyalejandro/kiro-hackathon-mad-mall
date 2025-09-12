"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaConstruct = void 0;
const constructs_1 = require("constructs");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class LambdaConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.functions = new Map();
        const { environment, vpc, securityGroup, dynamoTable, kmsKey, additionalEnvironmentVariables = {}, } = props;
        // Create base IAM role for Lambda functions
        this.baseRole = this.createBaseLambdaRole(environment, dynamoTable, kmsKey);
        // Set up base environment variables
        this.baseEnvironmentVariables = {
            NODE_ENV: environment,
            ENVIRONMENT: environment,
            DYNAMODB_TABLE_NAME: dynamoTable.tableName,
            KMS_KEY_ID: kmsKey.keyId,
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            ...additionalEnvironmentVariables,
        };
        // Create common Lambda functions
        this.createCommonFunctions(environment, vpc, securityGroup);
    }
    createBaseLambdaRole(environment, dynamoTable, kmsKey) {
        const role = new aws_iam_1.Role(this, 'BaseLambdaRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com'),
            description: `Base role for MADMall ${environment} Lambda functions`,
            managedPolicies: [
                aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
                aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
            ],
        });
        // DynamoDB permissions
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:BatchGetItem',
                'dynamodb:BatchWriteItem',
                'dynamodb:ConditionCheckItem',
            ],
            resources: [
                dynamoTable.tableArn,
                `${dynamoTable.tableArn}/index/*`,
            ],
        }));
        // KMS permissions
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                'kms:Decrypt',
                'kms:DescribeKey',
                'kms:Encrypt',
                'kms:GenerateDataKey',
                'kms:ReEncrypt*',
            ],
            resources: [kmsKey.keyArn],
        }));
        // Secrets Manager permissions
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                'secretsmanager:GetSecretValue',
                'secretsmanager:DescribeSecret',
            ],
            resources: [`arn:aws:secretsmanager:*:*:secret:madmall/${environment}/*`],
        }));
        // CloudWatch Logs permissions
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
            ],
            resources: [`arn:aws:logs:*:*:log-group:/aws/lambda/madmall-${environment}-*`],
        }));
        // Bedrock permissions
        role.addToPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeAgent',
                'bedrock:GetAgent',
                'bedrock:ListAgents',
                'bedrock:GetKnowledgeBase',
                'bedrock:RetrieveAndGenerate',
            ],
            resources: ['*'], // Bedrock resources are region-specific
        }));
        aws_cdk_lib_1.Tags.of(role).add('Name', `madmall-${environment}-lambda-base-role`);
        aws_cdk_lib_1.Tags.of(role).add('Environment', environment);
        return role;
    }
    createCommonFunctions(environment, vpc, securityGroup) {
        const commonFunctions = [
            {
                name: 'user-service',
                description: 'User management service functions',
                codePath: '../api-gateway/dist/handlers/user',
                handler: 'index.handler',
                memorySize: 512,
                timeout: 30,
            },
            {
                name: 'circle-service',
                description: 'Circle management service functions',
                codePath: '../api-gateway/dist/handlers/circle',
                handler: 'index.handler',
                memorySize: 512,
                timeout: 30,
            },
            {
                name: 'story-service',
                description: 'Story management service functions',
                codePath: '../api-gateway/dist/handlers/story',
                handler: 'index.handler',
                memorySize: 512,
                timeout: 30,
            },
            {
                name: 'business-service',
                description: 'Business management service functions',
                codePath: '../api-gateway/dist/handlers/business',
                handler: 'index.handler',
                memorySize: 512,
                timeout: 30,
            },
            {
                name: 'resource-service',
                description: 'Resource management service functions',
                codePath: '../api-gateway/dist/handlers/resource',
                handler: 'index.handler',
                memorySize: 512,
                timeout: 30,
            },
            {
                name: 'auth-service',
                description: 'Authentication and authorization service',
                codePath: '../api-gateway/dist/handlers/auth',
                handler: 'index.handler',
                memorySize: 256,
                timeout: 15,
            },
            {
                name: 'titan-engine',
                description: 'TitanEngine image processing service',
                codePath: '../titanengine/dist',
                handler: 'index.handler',
                memorySize: 1024,
                timeout: 60,
                environmentVariables: {
                    PEXELS_API_KEY: '${aws:secretsmanager:madmall/' + environment + '/pexels:SecretString:apiKey}',
                    UNSPLASH_ACCESS_KEY: '${aws:secretsmanager:madmall/' + environment + '/unsplash:SecretString:accessKey}',
                },
            },
            {
                name: 'bedrock-agent-orchestrator',
                description: 'Bedrock agent workflow orchestration',
                codePath: '../bedrock-agents/dist',
                handler: 'index.handler',
                memorySize: 512,
                timeout: 120,
            },
        ];
        commonFunctions.forEach(config => {
            this.createFunction(config, environment, vpc, securityGroup);
        });
    }
    createFunction(config, environment, vpc, securityGroup) {
        const { name, description, codePath, handler, memorySize = 512, timeout = 30, additionalPolicyStatements = [], environmentVariables = {}, } = config;
        const functionName = `madmall-${environment}-${name}`;
        // Create CloudWatch Log Group
        const logGroup = new aws_logs_1.LogGroup(this, `${name}LogGroup`, {
            logGroupName: `/aws/lambda/${functionName}`,
            retention: environment === 'prod' ? aws_logs_1.RetentionDays.ONE_MONTH : aws_logs_1.RetentionDays.ONE_WEEK,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        // Create function-specific role if additional permissions are needed
        let functionRole = this.baseRole;
        if (additionalPolicyStatements.length > 0) {
            functionRole = new aws_iam_1.Role(this, `${name}Role`, {
                assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com'),
                description: `Role for ${functionName}`,
                managedPolicies: [
                    aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
                    aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
                ],
            });
            // Add additional policies
            additionalPolicyStatements.forEach(statement => {
                functionRole.addToPolicy(statement);
            });
        }
        // Create Lambda function
        const lambdaFunction = new aws_lambda_1.Function(this, `${name}Function`, {
            functionName,
            description,
            runtime: aws_lambda_1.Runtime.NODEJS_20_X,
            architecture: aws_lambda_1.Architecture.ARM_64,
            code: aws_lambda_1.Code.fromAsset(codePath),
            handler,
            memorySize,
            timeout: aws_cdk_lib_1.Duration.seconds(timeout),
            role: functionRole,
            vpc,
            securityGroups: [securityGroup],
            environment: {
                ...this.baseEnvironmentVariables,
                ...environmentVariables,
            },
            tracing: aws_lambda_1.Tracing.ACTIVE,
            loggingFormat: aws_lambda_1.LoggingFormat.JSON,
            systemLogLevel: aws_lambda_1.SystemLogLevel.INFO,
            applicationLogLevel: aws_lambda_1.ApplicationLogLevel.INFO,
            logGroup,
        });
        // Add tags
        aws_cdk_lib_1.Tags.of(lambdaFunction).add('Name', functionName);
        aws_cdk_lib_1.Tags.of(lambdaFunction).add('Environment', environment);
        aws_cdk_lib_1.Tags.of(lambdaFunction).add('Service', name);
        // Store function reference
        this.functions.set(name, lambdaFunction);
        return lambdaFunction;
    }
    getFunction(name) {
        return this.functions.get(name);
    }
    getAllFunctions() {
        return Array.from(this.functions.values());
    }
}
exports.LambdaConstruct = LambdaConstruct;
//# sourceMappingURL=lambda.js.map