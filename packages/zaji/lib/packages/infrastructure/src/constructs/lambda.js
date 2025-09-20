"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaConstruct = void 0;
const constructs_1 = require("constructs");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_codedeploy_1 = require("aws-cdk-lib/aws-codedeploy");
const aws_lambda_2 = require("aws-cdk-lib/aws-lambda");
const aws_events_1 = require("aws-cdk-lib/aws-events");
const aws_events_targets_1 = require("aws-cdk-lib/aws-events-targets");
class LambdaConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.functions = new Map();
        this.concreteFunctions = new Map();
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
                name: 'upload-handler',
                description: 'Image upload and processing service',
                codePath: '../api-gateway/dist/handlers/upload',
                handler: 'index.handler',
                memorySize: 1024,
                timeout: 60,
                environmentVariables: {
                    USER_CONTENT_BUCKET_NAME: process.env.USER_CONTENT_BUCKET_NAME || '',
                    CONTENT_KMS_KEY_ID: process.env.CONTENT_KMS_KEY_ID || '',
                },
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
            const fn = this.createFunction(config, environment, vpc, securityGroup);
            if (config.name === 'titan-engine') {
                this.scheduleAudit(fn);
            }
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
        // Create version and alias for blue/green deployments
        const version = new aws_lambda_2.Version(this, `${name}Version`, {
            lambda: lambdaFunction,
        });
        const alias = new aws_lambda_2.Alias(this, `${name}Alias`, {
            aliasName: 'live',
            version,
        });
        // Configure CodeDeploy canary deployment for safe releases
        new aws_codedeploy_1.LambdaDeploymentGroup(this, `${name}DeploymentGroup`, {
            alias,
            deploymentConfig: aws_codedeploy_1.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
            autoRollback: {
                failedDeployment: true,
                stoppedDeployment: true,
                deploymentInAlarm: true,
            },
        });
        // Store both the concrete function (for monitoring) and alias (for API Gateway)
        this.concreteFunctions.set(name, lambdaFunction);
        this.functions.set(name, alias);
        return alias;
    }
    getFunction(name) {
        return this.functions.get(name);
    }
    scheduleAudit(fn) {
        new aws_events_1.Rule(this, 'NightlyImageAudit', {
            schedule: aws_events_1.Schedule.cron({ minute: '0', hour: '0' }),
            targets: [new aws_events_targets_1.LambdaFunction(fn)],
        });
    }
    getAllFunctions() {
        return Array.from(this.functions.values());
    }
    getAllConcreteFunctions() {
        return Array.from(this.concreteFunctions.values());
    }
}
exports.LambdaConstruct = LambdaConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vaW5mcmFzdHJ1Y3R1cmUvc3JjL2NvbnN0cnVjdHMvbGFtYmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUF1QztBQUN2Qyx1REFVZ0M7QUFDaEMsaURBTTZCO0FBSTdCLG1EQUErRDtBQUMvRCw2Q0FBNEQ7QUFDNUQsK0RBQTJGO0FBQzNGLHVEQUF3RDtBQUN4RCx1REFBd0Q7QUFDeEQsdUVBQXFGO0FBOEVyRixNQUFhLGVBQWdCLFNBQVEsc0JBQVM7SUFNNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEyQjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBTkgsY0FBUyxHQUEyQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzdDLHNCQUFpQixHQUFnQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBTzFFLE1BQU0sRUFDSixXQUFXLEVBQ1gsR0FBRyxFQUNILGFBQWEsRUFDYixXQUFXLEVBQ1gsTUFBTSxFQUNOLDhCQUE4QixHQUFHLEVBQUUsR0FDcEMsR0FBRyxLQUFLLENBQUM7UUFFViw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU1RSxvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHO1lBQzlCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQzFDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSztZQUN4QixtQ0FBbUMsRUFBRSxHQUFHO1lBQ3hDLEdBQUcsOEJBQThCO1NBQ2xDLENBQUM7UUFFRixpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVB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RUFBRSxDQUFDO1lBQ25ELE9BQU8sRUFBRSxDQUFDLElBQUksbUNBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDckMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLGVBQWU7UUFDcEIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sdUJBQXVCO1FBQzVCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0Y7QUF6VUQsMENBeVVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQge1xuICBGdW5jdGlvbiBhcyBMYW1iZGFGdW5jdGlvbixcbiAgSUZ1bmN0aW9uLFxuICBSdW50aW1lLFxuICBDb2RlLFxuICBBcmNoaXRlY3R1cmUsXG4gIFRyYWNpbmcsXG4gIExvZ2dpbmdGb3JtYXQsXG4gIFN5c3RlbUxvZ0xldmVsLFxuICBBcHBsaWNhdGlvbkxvZ0xldmVsLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7XG4gIFJvbGUsXG4gIFNlcnZpY2VQcmluY2lwYWwsXG4gIFBvbGljeVN0YXRlbWVudCxcbiAgRWZmZWN0LFxuICBNYW5hZ2VkUG9saWN5LFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFZwYywgU2VjdXJpdHlHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgVGFibGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgS2V5IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5pbXBvcnQgeyBMb2dHcm91cCwgUmV0ZW50aW9uRGF5cyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCB7IER1cmF0aW9uLCBSZW1vdmFsUG9saWN5LCBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgTGFtYmRhRGVwbG95bWVudENvbmZpZywgTGFtYmRhRGVwbG95bWVudEdyb3VwIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVkZXBsb3knO1xuaW1wb3J0IHsgQWxpYXMsIFZlcnNpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IFJ1bGUsIFNjaGVkdWxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWV2ZW50cyc7XG5pbXBvcnQgeyBMYW1iZGFGdW5jdGlvbiBhcyBFdmVudExhbWJkYVRhcmdldCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGFtYmRhQ29uc3RydWN0UHJvcHMge1xuICAvKipcbiAgICogRW52aXJvbm1lbnQgbmFtZSAoZGV2LCBzdGFnaW5nLCBwcm9kKVxuICAgKi9cbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBWUEMgZm9yIExhbWJkYSBmdW5jdGlvbnNcbiAgICovXG4gIHZwYzogVnBjO1xuICBcbiAgLyoqXG4gICAqIFNlY3VyaXR5IGdyb3VwIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAqL1xuICBzZWN1cml0eUdyb3VwOiBTZWN1cml0eUdyb3VwO1xuICBcbiAgLyoqXG4gICAqIER5bmFtb0RCIHRhYmxlIGZvciBkYXRhIGFjY2Vzc1xuICAgKi9cbiAgZHluYW1vVGFibGU6IFRhYmxlO1xuICBcbiAgLyoqXG4gICAqIEtNUyBrZXkgZm9yIGVuY3J5cHRpb25cbiAgICovXG4gIGttc0tleTogS2V5O1xuICBcbiAgLyoqXG4gICAqIEFkZGl0aW9uYWwgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAqL1xuICBhZGRpdGlvbmFsRW52aXJvbm1lbnRWYXJpYWJsZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhbWJkYUZ1bmN0aW9uQ29uZmlnIHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIG5hbWUgc3VmZml4XG4gICAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogRnVuY3Rpb24gZGVzY3JpcHRpb25cbiAgICovXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogUGF0aCB0byB0aGUgZnVuY3Rpb24gY29kZVxuICAgKi9cbiAgY29kZVBhdGg6IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBGdW5jdGlvbiBoYW5kbGVyXG4gICAqL1xuICBoYW5kbGVyOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogTWVtb3J5IGFsbG9jYXRpb24gaW4gTUJcbiAgICogQGRlZmF1bHQgNTEyXG4gICAqL1xuICBtZW1vcnlTaXplPzogbnVtYmVyO1xuICBcbiAgLyoqXG4gICAqIFRpbWVvdXQgaW4gc2Vjb25kc1xuICAgKiBAZGVmYXVsdCAzMFxuICAgKi9cbiAgdGltZW91dD86IG51bWJlcjtcbiAgXG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIElBTSBwb2xpY3kgc3RhdGVtZW50c1xuICAgKi9cbiAgYWRkaXRpb25hbFBvbGljeVN0YXRlbWVudHM/OiBQb2xpY3lTdGF0ZW1lbnRbXTtcbiAgXG4gIC8qKlxuICAgKiBGdW5jdGlvbi1zcGVjaWZpYyBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICovXG4gIGVudmlyb25tZW50VmFyaWFibGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGNsYXNzIExhbWJkYUNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBmdW5jdGlvbnM6IE1hcDxzdHJpbmcsIElGdW5jdGlvbj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgY29uY3JldGVGdW5jdGlvbnM6IE1hcDxzdHJpbmcsIExhbWJkYUZ1bmN0aW9uPiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSByZWFkb25seSBiYXNlUm9sZTogUm9sZTtcbiAgcHJpdmF0ZSByZWFkb25seSBiYXNlRW52aXJvbm1lbnRWYXJpYWJsZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IExhbWJkYUNvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgdnBjLFxuICAgICAgc2VjdXJpdHlHcm91cCxcbiAgICAgIGR5bmFtb1RhYmxlLFxuICAgICAga21zS2V5LFxuICAgICAgYWRkaXRpb25hbEVudmlyb25tZW50VmFyaWFibGVzID0ge30sXG4gICAgfSA9IHByb3BzO1xuXG4gICAgLy8gQ3JlYXRlIGJhc2UgSUFNIHJvbGUgZm9yIExhbWJkYSBmdW5jdGlvbnNcbiAgICB0aGlzLmJhc2VSb2xlID0gdGhpcy5jcmVhdGVCYXNlTGFtYmRhUm9sZShlbnZpcm9ubWVudCwgZHluYW1vVGFibGUsIGttc0tleSk7XG5cbiAgICAvLyBTZXQgdXAgYmFzZSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICB0aGlzLmJhc2VFbnZpcm9ubWVudFZhcmlhYmxlcyA9IHtcbiAgICAgIE5PREVfRU5WOiBlbnZpcm9ubWVudCxcbiAgICAgIEVOVklST05NRU5UOiBlbnZpcm9ubWVudCxcbiAgICAgIERZTkFNT0RCX1RBQkxFX05BTUU6IGR5bmFtb1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIEtNU19LRVlfSUQ6IGttc0tleS5rZXlJZCxcbiAgICAgIEFXU19OT0RFSlNfQ09OTkVDVElPTl9SRVVTRV9FTkFCTEVEOiAnMScsXG4gICAgICAuLi5hZGRpdGlvbmFsRW52aXJvbm1lbnRWYXJpYWJsZXMsXG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBjb21tb24gTGFtYmRhIGZ1bmN0aW9uc1xuICAgIHRoaXMuY3JlYXRlQ29tbW9uRnVuY3Rpb25zKGVudmlyb25tZW50LCB2cGMsIHNlY3VyaXR5R3JvdXApO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVCYXNlTGFtYmRhUm9sZShlbnZpcm9ubWVudDogc3RyaW5nLCBkeW5hbW9UYWJsZTogVGFibGUsIGttc0tleTogS2V5KTogUm9sZSB7XG4gICAgY29uc3Qgcm9sZSA9IG5ldyBSb2xlKHRoaXMsICdCYXNlTGFtYmRhUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICBkZXNjcmlwdGlvbjogYEJhc2Ugcm9sZSBmb3IgTUFETWFsbCAke2Vudmlyb25tZW50fSBMYW1iZGEgZnVuY3Rpb25zYCxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYVZQQ0FjY2Vzc0V4ZWN1dGlvblJvbGUnKSxcbiAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FXU1hSYXlEYWVtb25Xcml0ZUFjY2VzcycpLFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnZHluYW1vZGI6R2V0SXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpQdXRJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlVwZGF0ZUl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6RGVsZXRlSXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpRdWVyeScsXG4gICAgICAgICdkeW5hbW9kYjpTY2FuJyxcbiAgICAgICAgJ2R5bmFtb2RiOkJhdGNoR2V0SXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpCYXRjaFdyaXRlSXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpDb25kaXRpb25DaGVja0l0ZW0nLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW1xuICAgICAgICBkeW5hbW9UYWJsZS50YWJsZUFybixcbiAgICAgICAgYCR7ZHluYW1vVGFibGUudGFibGVBcm59L2luZGV4LypgLFxuICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICAvLyBLTVMgcGVybWlzc2lvbnNcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdrbXM6RGVjcnlwdCcsXG4gICAgICAgICdrbXM6RGVzY3JpYmVLZXknLFxuICAgICAgICAna21zOkVuY3J5cHQnLFxuICAgICAgICAna21zOkdlbmVyYXRlRGF0YUtleScsXG4gICAgICAgICdrbXM6UmVFbmNyeXB0KicsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBba21zS2V5LmtleUFybl0sXG4gICAgfSkpO1xuXG4gICAgLy8gU2VjcmV0cyBNYW5hZ2VyIHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnc2VjcmV0c21hbmFnZXI6R2V0U2VjcmV0VmFsdWUnLFxuICAgICAgICAnc2VjcmV0c21hbmFnZXI6RGVzY3JpYmVTZWNyZXQnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOnNlY3JldHNtYW5hZ2VyOio6KjpzZWNyZXQ6bWFkbWFsbC8ke2Vudmlyb25tZW50fS8qYF0sXG4gICAgfSkpO1xuXG4gICAgLy8gQ2xvdWRXYXRjaCBMb2dzIHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXG4gICAgICAgICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbScsXG4gICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6bG9nczoqOio6bG9nLWdyb3VwOi9hd3MvbGFtYmRhL21hZG1hbGwtJHtlbnZpcm9ubWVudH0tKmBdLFxuICAgIH0pKTtcblxuICAgIC8vIEJlZHJvY2sgcGVybWlzc2lvbnNcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdiZWRyb2NrOkludm9rZU1vZGVsJyxcbiAgICAgICAgJ2JlZHJvY2s6SW52b2tlQWdlbnQnLFxuICAgICAgICAnYmVkcm9jazpHZXRBZ2VudCcsXG4gICAgICAgICdiZWRyb2NrOkxpc3RBZ2VudHMnLFxuICAgICAgICAnYmVkcm9jazpHZXRLbm93bGVkZ2VCYXNlJyxcbiAgICAgICAgJ2JlZHJvY2s6UmV0cmlldmVBbmRHZW5lcmF0ZScsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSwgLy8gQmVkcm9jayByZXNvdXJjZXMgYXJlIHJlZ2lvbi1zcGVjaWZpY1xuICAgIH0pKTtcblxuICAgIFRhZ3Mub2Yocm9sZSkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tbGFtYmRhLWJhc2Utcm9sZWApO1xuICAgIFRhZ3Mub2Yocm9sZSkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuICAgIHJldHVybiByb2xlO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVDb21tb25GdW5jdGlvbnMoZW52aXJvbm1lbnQ6IHN0cmluZywgdnBjOiBWcGMsIHNlY3VyaXR5R3JvdXA6IFNlY3VyaXR5R3JvdXApOiB2b2lkIHtcbiAgICBjb25zdCBjb21tb25GdW5jdGlvbnM6IExhbWJkYUZ1bmN0aW9uQ29uZmlnW10gPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICd1c2VyLXNlcnZpY2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1VzZXIgbWFuYWdlbWVudCBzZXJ2aWNlIGZ1bmN0aW9ucycsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy91c2VyJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDMwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NpcmNsZS1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDaXJjbGUgbWFuYWdlbWVudCBzZXJ2aWNlIGZ1bmN0aW9ucycsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy9jaXJjbGUnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMzAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc3Rvcnktc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3RvcnkgbWFuYWdlbWVudCBzZXJ2aWNlIGZ1bmN0aW9ucycsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy9zdG9yeScsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdidXNpbmVzcy1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdCdXNpbmVzcyBtYW5hZ2VtZW50IHNlcnZpY2UgZnVuY3Rpb25zJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL2J1c2luZXNzJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDMwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3Jlc291cmNlLXNlcnZpY2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1Jlc291cmNlIG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvcmVzb3VyY2UnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMzAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnYXV0aC1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBdXRoZW50aWNhdGlvbiBhbmQgYXV0aG9yaXphdGlvbiBzZXJ2aWNlJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL2F1dGgnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgICAgdGltZW91dDogMTUsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAndXBsb2FkLWhhbmRsZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0ltYWdlIHVwbG9hZCBhbmQgcHJvY2Vzc2luZyBzZXJ2aWNlJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL3VwbG9hZCcsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcbiAgICAgICAgdGltZW91dDogNjAsXG4gICAgICAgIGVudmlyb25tZW50VmFyaWFibGVzOiB7XG4gICAgICAgICAgVVNFUl9DT05URU5UX0JVQ0tFVF9OQU1FOiBwcm9jZXNzLmVudi5VU0VSX0NPTlRFTlRfQlVDS0VUX05BTUUgfHwgJycsXG4gICAgICAgICAgQ09OVEVOVF9LTVNfS0VZX0lEOiBwcm9jZXNzLmVudi5DT05URU5UX0tNU19LRVlfSUQgfHwgJycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAndGl0YW4tZW5naW5lJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaXRhbkVuZ2luZSBpbWFnZSBwcm9jZXNzaW5nIHNlcnZpY2UnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL3RpdGFuZW5naW5lL2Rpc3QnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gICAgICAgIHRpbWVvdXQ6IDYwLFxuICAgICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczoge1xuICAgICAgICAgIFBFWEVMU19BUElfS0VZOiAnJHthd3M6c2VjcmV0c21hbmFnZXI6bWFkbWFsbC8nICsgZW52aXJvbm1lbnQgKyAnL3BleGVsczpTZWNyZXRTdHJpbmc6YXBpS2V5fScsXG4gICAgICAgICAgVU5TUExBU0hfQUNDRVNTX0tFWTogJyR7YXdzOnNlY3JldHNtYW5hZ2VyOm1hZG1hbGwvJyArIGVudmlyb25tZW50ICsgJy91bnNwbGFzaDpTZWNyZXRTdHJpbmc6YWNjZXNzS2V5fScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnYmVkcm9jay1hZ2VudC1vcmNoZXN0cmF0b3InLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0JlZHJvY2sgYWdlbnQgd29ya2Zsb3cgb3JjaGVzdHJhdGlvbicsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYmVkcm9jay1hZ2VudHMvZGlzdCcsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAxMjAsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBjb21tb25GdW5jdGlvbnMuZm9yRWFjaChjb25maWcgPT4ge1xuICAgICAgY29uc3QgZm4gPSB0aGlzLmNyZWF0ZUZ1bmN0aW9uKGNvbmZpZywgZW52aXJvbm1lbnQsIHZwYywgc2VjdXJpdHlHcm91cCk7XG4gICAgICBpZiAoY29uZmlnLm5hbWUgPT09ICd0aXRhbi1lbmdpbmUnKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVBdWRpdChmbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgY3JlYXRlRnVuY3Rpb24oXG4gICAgY29uZmlnOiBMYW1iZGFGdW5jdGlvbkNvbmZpZyxcbiAgICBlbnZpcm9ubWVudDogc3RyaW5nLFxuICAgIHZwYzogVnBjLFxuICAgIHNlY3VyaXR5R3JvdXA6IFNlY3VyaXR5R3JvdXBcbiAgKTogSUZ1bmN0aW9uIHtcbiAgICBjb25zdCB7XG4gICAgICBuYW1lLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBjb2RlUGF0aCxcbiAgICAgIGhhbmRsZXIsXG4gICAgICBtZW1vcnlTaXplID0gNTEyLFxuICAgICAgdGltZW91dCA9IDMwLFxuICAgICAgYWRkaXRpb25hbFBvbGljeVN0YXRlbWVudHMgPSBbXSxcbiAgICAgIGVudmlyb25tZW50VmFyaWFibGVzID0ge30sXG4gICAgfSA9IGNvbmZpZztcblxuICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LSR7bmFtZX1gO1xuXG4gICAgLy8gQ3JlYXRlIENsb3VkV2F0Y2ggTG9nIEdyb3VwXG4gICAgY29uc3QgbG9nR3JvdXAgPSBuZXcgTG9nR3JvdXAodGhpcywgYCR7bmFtZX1Mb2dHcm91cGAsIHtcbiAgICAgIGxvZ0dyb3VwTmFtZTogYC9hd3MvbGFtYmRhLyR7ZnVuY3Rpb25OYW1lfWAsXG4gICAgICByZXRlbnRpb246IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZXRlbnRpb25EYXlzLk9ORV9NT05USCA6IFJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgZnVuY3Rpb24tc3BlY2lmaWMgcm9sZSBpZiBhZGRpdGlvbmFsIHBlcm1pc3Npb25zIGFyZSBuZWVkZWRcbiAgICBsZXQgZnVuY3Rpb25Sb2xlID0gdGhpcy5iYXNlUm9sZTtcbiAgICBpZiAoYWRkaXRpb25hbFBvbGljeVN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgZnVuY3Rpb25Sb2xlID0gbmV3IFJvbGUodGhpcywgYCR7bmFtZX1Sb2xlYCwge1xuICAgICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFJvbGUgZm9yICR7ZnVuY3Rpb25OYW1lfWAsXG4gICAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZScpLFxuICAgICAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBV1NYUmF5RGFlbW9uV3JpdGVBY2Nlc3MnKSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgYWRkaXRpb25hbCBwb2xpY2llc1xuICAgICAgYWRkaXRpb25hbFBvbGljeVN0YXRlbWVudHMuZm9yRWFjaChzdGF0ZW1lbnQgPT4ge1xuICAgICAgICBmdW5jdGlvblJvbGUuYWRkVG9Qb2xpY3koc3RhdGVtZW50KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBMYW1iZGEgZnVuY3Rpb25cbiAgICBjb25zdCBsYW1iZGFGdW5jdGlvbiA9IG5ldyBMYW1iZGFGdW5jdGlvbih0aGlzLCBgJHtuYW1lfUZ1bmN0aW9uYCwge1xuICAgICAgZnVuY3Rpb25OYW1lLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgYXJjaGl0ZWN0dXJlOiBBcmNoaXRlY3R1cmUuQVJNXzY0LFxuICAgICAgY29kZTogQ29kZS5mcm9tQXNzZXQoY29kZVBhdGgpLFxuICAgICAgaGFuZGxlcixcbiAgICAgIG1lbW9yeVNpemUsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKHRpbWVvdXQpLFxuICAgICAgcm9sZTogZnVuY3Rpb25Sb2xlLFxuICAgICAgdnBjLFxuICAgICAgc2VjdXJpdHlHcm91cHM6IFtzZWN1cml0eUdyb3VwXSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIC4uLnRoaXMuYmFzZUVudmlyb25tZW50VmFyaWFibGVzLFxuICAgICAgICAuLi5lbnZpcm9ubWVudFZhcmlhYmxlcyxcbiAgICAgIH0sXG4gICAgICB0cmFjaW5nOiBUcmFjaW5nLkFDVElWRSxcbiAgICAgIGxvZ2dpbmdGb3JtYXQ6IExvZ2dpbmdGb3JtYXQuSlNPTixcbiAgICAgIHN5c3RlbUxvZ0xldmVsOiBTeXN0ZW1Mb2dMZXZlbC5JTkZPLFxuICAgICAgYXBwbGljYXRpb25Mb2dMZXZlbDogQXBwbGljYXRpb25Mb2dMZXZlbC5JTkZPLFxuICAgICAgbG9nR3JvdXAsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgdGFnc1xuICAgIFRhZ3Mub2YobGFtYmRhRnVuY3Rpb24pLmFkZCgnTmFtZScsIGZ1bmN0aW9uTmFtZSk7XG4gICAgVGFncy5vZihsYW1iZGFGdW5jdGlvbikuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcbiAgICBUYWdzLm9mKGxhbWJkYUZ1bmN0aW9uKS5hZGQoJ1NlcnZpY2UnLCBuYW1lKTtcblxuICAgIC8vIENyZWF0ZSB2ZXJzaW9uIGFuZCBhbGlhcyBmb3IgYmx1ZS9ncmVlbiBkZXBsb3ltZW50c1xuICAgIGNvbnN0IHZlcnNpb24gPSBuZXcgVmVyc2lvbih0aGlzLCBgJHtuYW1lfVZlcnNpb25gLCB7XG4gICAgICBsYW1iZGE6IGxhbWJkYUZ1bmN0aW9uLFxuICAgIH0pO1xuICAgIGNvbnN0IGFsaWFzID0gbmV3IEFsaWFzKHRoaXMsIGAke25hbWV9QWxpYXNgLCB7XG4gICAgICBhbGlhc05hbWU6ICdsaXZlJyxcbiAgICAgIHZlcnNpb24sXG4gICAgfSk7XG5cbiAgICAvLyBDb25maWd1cmUgQ29kZURlcGxveSBjYW5hcnkgZGVwbG95bWVudCBmb3Igc2FmZSByZWxlYXNlc1xuICAgIG5ldyBMYW1iZGFEZXBsb3ltZW50R3JvdXAodGhpcywgYCR7bmFtZX1EZXBsb3ltZW50R3JvdXBgLCB7XG4gICAgICBhbGlhcyxcbiAgICAgIGRlcGxveW1lbnRDb25maWc6IExhbWJkYURlcGxveW1lbnRDb25maWcuQ0FOQVJZXzEwUEVSQ0VOVF81TUlOVVRFUyxcbiAgICAgIGF1dG9Sb2xsYmFjazoge1xuICAgICAgICBmYWlsZWREZXBsb3ltZW50OiB0cnVlLFxuICAgICAgICBzdG9wcGVkRGVwbG95bWVudDogdHJ1ZSxcbiAgICAgICAgZGVwbG95bWVudEluQWxhcm06IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gU3RvcmUgYm90aCB0aGUgY29uY3JldGUgZnVuY3Rpb24gKGZvciBtb25pdG9yaW5nKSBhbmQgYWxpYXMgKGZvciBBUEkgR2F0ZXdheSlcbiAgICB0aGlzLmNvbmNyZXRlRnVuY3Rpb25zLnNldChuYW1lLCBsYW1iZGFGdW5jdGlvbik7XG4gICAgdGhpcy5mdW5jdGlvbnMuc2V0KG5hbWUsIGFsaWFzKTtcblxuICAgIHJldHVybiBhbGlhcztcbiAgfVxuXG4gIHB1YmxpYyBnZXRGdW5jdGlvbihuYW1lOiBzdHJpbmcpOiBJRnVuY3Rpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmZ1bmN0aW9ucy5nZXQobmFtZSk7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQXVkaXQoZm46IElGdW5jdGlvbikge1xuICAgIG5ldyBSdWxlKHRoaXMsICdOaWdodGx5SW1hZ2VBdWRpdCcsIHtcbiAgICAgIHNjaGVkdWxlOiBTY2hlZHVsZS5jcm9uKHsgbWludXRlOiAnMCcsIGhvdXI6ICcwJyB9KSxcbiAgICAgIHRhcmdldHM6IFtuZXcgRXZlbnRMYW1iZGFUYXJnZXQoZm4pXSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxGdW5jdGlvbnMoKTogSUZ1bmN0aW9uW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZnVuY3Rpb25zLnZhbHVlcygpKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxDb25jcmV0ZUZ1bmN0aW9ucygpOiBMYW1iZGFGdW5jdGlvbltdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNvbmNyZXRlRnVuY3Rpb25zLnZhbHVlcygpKTtcbiAgfVxufSJdfQ==