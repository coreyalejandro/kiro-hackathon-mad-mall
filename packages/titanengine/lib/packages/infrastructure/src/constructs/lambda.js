"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaConstruct = void 0;
const constructs_1 = require("constructs");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_codedeploy_1 = require("aws-cdk-lib/aws-codedeploy");
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
        // Create version and alias for blue/green deployments
        const version = new aws_codedeploy_1.Version(this, `${name}Version`, {
            lambda: lambdaFunction,
        });
        const alias = new aws_codedeploy_1.Alias(this, `${name}Alias`, {
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
        // Store alias reference so API Gateway integrates with the live alias
        this.functions.set(name, alias);
        return alias;
    }
    getFunction(name) {
        return this.functions.get(name);
    }
    getAllFunctions() {
        return Array.from(this.functions.values());
    }
}
exports.LambdaConstruct = LambdaConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vaW5mcmFzdHJ1Y3R1cmUvc3JjL2NvbnN0cnVjdHMvbGFtYmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUF1QztBQUN2Qyx1REFVZ0M7QUFDaEMsaURBTTZCO0FBSTdCLG1EQUErRDtBQUMvRCw2Q0FBNEQ7QUFDNUQsK0RBQTJIO0FBOEUzSCxNQUFhLGVBQWdCLFNBQVEsc0JBQVM7SUFLNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEyQjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBTEgsY0FBUyxHQUEyQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBTzVELE1BQU0sRUFDSixXQUFXLEVBQ1gsR0FBRyxFQUNILGFBQWEsRUFDYixXQUFXLEVBQ1gsTUFBTSxFQUNOLDhCQUE4QixHQUFHLEVBQUUsR0FDcEMsR0FBRyxLQUFLLENBQUM7UUFFViw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU1RSxvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHO1lBQzlCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQzFDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSztZQUN4QixtQ0FBbUMsRUFBRSxHQUFHO1lBQ3hDLEdBQUcsOEJBQThCO1NBQ2xDLENBQUM7UUFFRixpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFdBQW1CLEVBQUUsV0FBa0IsRUFBRSxNQUFXO1FBQy9F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QUFFLElBQUk7YUFDeEI7U0FDRixDQUFDLENBQUM7UUFFSCxzRUFBc0U7UUFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWhDLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVNLFdBQVcsQ0FBQyxJQUFZO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLGVBQWU7UUFDcEIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0Y7QUE3U0QsMENBNlNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQge1xuICBGdW5jdGlvbiBhcyBMYW1iZGFGdW5jdGlvbixcbiAgSUZ1bmN0aW9uLFxuICBSdW50aW1lLFxuICBDb2RlLFxuICBBcmNoaXRlY3R1cmUsXG4gIFRyYWNpbmcsXG4gIExvZ2dpbmdGb3JtYXQsXG4gIFN5c3RlbUxvZ0xldmVsLFxuICBBcHBsaWNhdGlvbkxvZ0xldmVsLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7XG4gIFJvbGUsXG4gIFNlcnZpY2VQcmluY2lwYWwsXG4gIFBvbGljeVN0YXRlbWVudCxcbiAgRWZmZWN0LFxuICBNYW5hZ2VkUG9saWN5LFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFZwYywgU2VjdXJpdHlHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgVGFibGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgS2V5IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5pbXBvcnQgeyBMb2dHcm91cCwgUmV0ZW50aW9uRGF5cyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCB7IER1cmF0aW9uLCBSZW1vdmFsUG9saWN5LCBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQWxpYXMsIFZlcnNpb24sIFRyYWZmaWNSb3V0aW5nLCBMYW1iZGFEZXBsb3ltZW50Q29uZmlnLCBMYW1iZGFEZXBsb3ltZW50R3JvdXAgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29kZWRlcGxveSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGFtYmRhQ29uc3RydWN0UHJvcHMge1xuICAvKipcbiAgICogRW52aXJvbm1lbnQgbmFtZSAoZGV2LCBzdGFnaW5nLCBwcm9kKVxuICAgKi9cbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBWUEMgZm9yIExhbWJkYSBmdW5jdGlvbnNcbiAgICovXG4gIHZwYzogVnBjO1xuICBcbiAgLyoqXG4gICAqIFNlY3VyaXR5IGdyb3VwIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAqL1xuICBzZWN1cml0eUdyb3VwOiBTZWN1cml0eUdyb3VwO1xuICBcbiAgLyoqXG4gICAqIER5bmFtb0RCIHRhYmxlIGZvciBkYXRhIGFjY2Vzc1xuICAgKi9cbiAgZHluYW1vVGFibGU6IFRhYmxlO1xuICBcbiAgLyoqXG4gICAqIEtNUyBrZXkgZm9yIGVuY3J5cHRpb25cbiAgICovXG4gIGttc0tleTogS2V5O1xuICBcbiAgLyoqXG4gICAqIEFkZGl0aW9uYWwgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAqL1xuICBhZGRpdGlvbmFsRW52aXJvbm1lbnRWYXJpYWJsZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhbWJkYUZ1bmN0aW9uQ29uZmlnIHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIG5hbWUgc3VmZml4XG4gICAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogRnVuY3Rpb24gZGVzY3JpcHRpb25cbiAgICovXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogUGF0aCB0byB0aGUgZnVuY3Rpb24gY29kZVxuICAgKi9cbiAgY29kZVBhdGg6IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBGdW5jdGlvbiBoYW5kbGVyXG4gICAqL1xuICBoYW5kbGVyOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogTWVtb3J5IGFsbG9jYXRpb24gaW4gTUJcbiAgICogQGRlZmF1bHQgNTEyXG4gICAqL1xuICBtZW1vcnlTaXplPzogbnVtYmVyO1xuICBcbiAgLyoqXG4gICAqIFRpbWVvdXQgaW4gc2Vjb25kc1xuICAgKiBAZGVmYXVsdCAzMFxuICAgKi9cbiAgdGltZW91dD86IG51bWJlcjtcbiAgXG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIElBTSBwb2xpY3kgc3RhdGVtZW50c1xuICAgKi9cbiAgYWRkaXRpb25hbFBvbGljeVN0YXRlbWVudHM/OiBQb2xpY3lTdGF0ZW1lbnRbXTtcbiAgXG4gIC8qKlxuICAgKiBGdW5jdGlvbi1zcGVjaWZpYyBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICovXG4gIGVudmlyb25tZW50VmFyaWFibGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGNsYXNzIExhbWJkYUNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBmdW5jdGlvbnM6IE1hcDxzdHJpbmcsIElGdW5jdGlvbj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZVJvbGU6IFJvbGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZUVudmlyb25tZW50VmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBMYW1iZGFDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIHZwYyxcbiAgICAgIHNlY3VyaXR5R3JvdXAsXG4gICAgICBkeW5hbW9UYWJsZSxcbiAgICAgIGttc0tleSxcbiAgICAgIGFkZGl0aW9uYWxFbnZpcm9ubWVudFZhcmlhYmxlcyA9IHt9LFxuICAgIH0gPSBwcm9wcztcblxuICAgIC8vIENyZWF0ZSBiYXNlIElBTSByb2xlIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAgdGhpcy5iYXNlUm9sZSA9IHRoaXMuY3JlYXRlQmFzZUxhbWJkYVJvbGUoZW52aXJvbm1lbnQsIGR5bmFtb1RhYmxlLCBrbXNLZXkpO1xuXG4gICAgLy8gU2V0IHVwIGJhc2UgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAgdGhpcy5iYXNlRW52aXJvbm1lbnRWYXJpYWJsZXMgPSB7XG4gICAgICBOT0RFX0VOVjogZW52aXJvbm1lbnQsXG4gICAgICBFTlZJUk9OTUVOVDogZW52aXJvbm1lbnQsXG4gICAgICBEWU5BTU9EQl9UQUJMRV9OQU1FOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICBLTVNfS0VZX0lEOiBrbXNLZXkua2V5SWQsXG4gICAgICBBV1NfTk9ERUpTX0NPTk5FQ1RJT05fUkVVU0VfRU5BQkxFRDogJzEnLFxuICAgICAgLi4uYWRkaXRpb25hbEVudmlyb25tZW50VmFyaWFibGVzLFxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY29tbW9uIExhbWJkYSBmdW5jdGlvbnNcbiAgICB0aGlzLmNyZWF0ZUNvbW1vbkZ1bmN0aW9ucyhlbnZpcm9ubWVudCwgdnBjLCBzZWN1cml0eUdyb3VwKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQmFzZUxhbWJkYVJvbGUoZW52aXJvbm1lbnQ6IHN0cmluZywgZHluYW1vVGFibGU6IFRhYmxlLCBrbXNLZXk6IEtleSk6IFJvbGUge1xuICAgIGNvbnN0IHJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnQmFzZUxhbWJkYVJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgZGVzY3JpcHRpb246IGBCYXNlIHJvbGUgZm9yIE1BRE1hbGwgJHtlbnZpcm9ubWVudH0gTGFtYmRhIGZ1bmN0aW9uc2AsXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFWUENBY2Nlc3NFeGVjdXRpb25Sb2xlJyksXG4gICAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBV1NYUmF5RGFlbW9uV3JpdGVBY2Nlc3MnKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBEeW5hbW9EQiBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2R5bmFtb2RiOkdldEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6UHV0SXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpVcGRhdGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOkRlbGV0ZUl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6UXVlcnknLFxuICAgICAgICAnZHluYW1vZGI6U2NhbicsXG4gICAgICAgICdkeW5hbW9kYjpCYXRjaEdldEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6QmF0Y2hXcml0ZUl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6Q29uZGl0aW9uQ2hlY2tJdGVtJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgZHluYW1vVGFibGUudGFibGVBcm4sXG4gICAgICAgIGAke2R5bmFtb1RhYmxlLnRhYmxlQXJufS9pbmRleC8qYCxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gS01TIHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAna21zOkRlY3J5cHQnLFxuICAgICAgICAna21zOkRlc2NyaWJlS2V5JyxcbiAgICAgICAgJ2ttczpFbmNyeXB0JyxcbiAgICAgICAgJ2ttczpHZW5lcmF0ZURhdGFLZXknLFxuICAgICAgICAna21zOlJlRW5jcnlwdConLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW2ttc0tleS5rZXlBcm5dLFxuICAgIH0pKTtcblxuICAgIC8vIFNlY3JldHMgTWFuYWdlciBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ3NlY3JldHNtYW5hZ2VyOkdldFNlY3JldFZhbHVlJyxcbiAgICAgICAgJ3NlY3JldHNtYW5hZ2VyOkRlc2NyaWJlU2VjcmV0JyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtgYXJuOmF3czpzZWNyZXRzbWFuYWdlcjoqOio6c2VjcmV0Om1hZG1hbGwvJHtlbnZpcm9ubWVudH0vKmBdLFxuICAgIH0pKTtcblxuICAgIC8vIENsb3VkV2F0Y2ggTG9ncyBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxuICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmxvZ3M6KjoqOmxvZy1ncm91cDovYXdzL2xhbWJkYS9tYWRtYWxsLSR7ZW52aXJvbm1lbnR9LSpgXSxcbiAgICB9KSk7XG5cbiAgICAvLyBCZWRyb2NrIHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnYmVkcm9jazpJbnZva2VNb2RlbCcsXG4gICAgICAgICdiZWRyb2NrOkludm9rZUFnZW50JyxcbiAgICAgICAgJ2JlZHJvY2s6R2V0QWdlbnQnLFxuICAgICAgICAnYmVkcm9jazpMaXN0QWdlbnRzJyxcbiAgICAgICAgJ2JlZHJvY2s6R2V0S25vd2xlZGdlQmFzZScsXG4gICAgICAgICdiZWRyb2NrOlJldHJpZXZlQW5kR2VuZXJhdGUnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sIC8vIEJlZHJvY2sgcmVzb3VyY2VzIGFyZSByZWdpb24tc3BlY2lmaWNcbiAgICB9KSk7XG5cbiAgICBUYWdzLm9mKHJvbGUpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWxhbWJkYS1iYXNlLXJvbGVgKTtcbiAgICBUYWdzLm9mKHJvbGUpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cbiAgICByZXR1cm4gcm9sZTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ29tbW9uRnVuY3Rpb25zKGVudmlyb25tZW50OiBzdHJpbmcsIHZwYzogVnBjLCBzZWN1cml0eUdyb3VwOiBTZWN1cml0eUdyb3VwKTogdm9pZCB7XG4gICAgY29uc3QgY29tbW9uRnVuY3Rpb25zOiBMYW1iZGFGdW5jdGlvbkNvbmZpZ1tdID0gW1xuICAgICAge1xuICAgICAgICBuYW1lOiAndXNlci1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdVc2VyIG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvdXNlcicsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjaXJjbGUtc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2lyY2xlIG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvY2lyY2xlJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDMwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3N0b3J5LXNlcnZpY2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1N0b3J5IG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvc3RvcnknLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMzAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnYnVzaW5lc3Mtc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQnVzaW5lc3MgbWFuYWdlbWVudCBzZXJ2aWNlIGZ1bmN0aW9ucycsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy9idXNpbmVzcycsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdyZXNvdXJjZS1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXNvdXJjZSBtYW5hZ2VtZW50IHNlcnZpY2UgZnVuY3Rpb25zJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL3Jlc291cmNlJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDMwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2F1dGgtc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQXV0aGVudGljYXRpb24gYW5kIGF1dGhvcml6YXRpb24gc2VydmljZScsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy9hdXRoJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICAgIHRpbWVvdXQ6IDE1LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3RpdGFuLWVuZ2luZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGl0YW5FbmdpbmUgaW1hZ2UgcHJvY2Vzc2luZyBzZXJ2aWNlJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi90aXRhbmVuZ2luZS9kaXN0JyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiAxMDI0LFxuICAgICAgICB0aW1lb3V0OiA2MCxcbiAgICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IHtcbiAgICAgICAgICBQRVhFTFNfQVBJX0tFWTogJyR7YXdzOnNlY3JldHNtYW5hZ2VyOm1hZG1hbGwvJyArIGVudmlyb25tZW50ICsgJy9wZXhlbHM6U2VjcmV0U3RyaW5nOmFwaUtleX0nLFxuICAgICAgICAgIFVOU1BMQVNIX0FDQ0VTU19LRVk6ICcke2F3czpzZWNyZXRzbWFuYWdlcjptYWRtYWxsLycgKyBlbnZpcm9ubWVudCArICcvdW5zcGxhc2g6U2VjcmV0U3RyaW5nOmFjY2Vzc0tleX0nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2JlZHJvY2stYWdlbnQtb3JjaGVzdHJhdG9yJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdCZWRyb2NrIGFnZW50IHdvcmtmbG93IG9yY2hlc3RyYXRpb24nLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2JlZHJvY2stYWdlbnRzL2Rpc3QnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMTIwLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgY29tbW9uRnVuY3Rpb25zLmZvckVhY2goY29uZmlnID0+IHtcbiAgICAgIHRoaXMuY3JlYXRlRnVuY3Rpb24oY29uZmlnLCBlbnZpcm9ubWVudCwgdnBjLCBzZWN1cml0eUdyb3VwKTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVGdW5jdGlvbihcbiAgICBjb25maWc6IExhbWJkYUZ1bmN0aW9uQ29uZmlnLFxuICAgIGVudmlyb25tZW50OiBzdHJpbmcsXG4gICAgdnBjOiBWcGMsXG4gICAgc2VjdXJpdHlHcm91cDogU2VjdXJpdHlHcm91cFxuICApOiBJRnVuY3Rpb24ge1xuICAgIGNvbnN0IHtcbiAgICAgIG5hbWUsXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIGNvZGVQYXRoLFxuICAgICAgaGFuZGxlcixcbiAgICAgIG1lbW9yeVNpemUgPSA1MTIsXG4gICAgICB0aW1lb3V0ID0gMzAsXG4gICAgICBhZGRpdGlvbmFsUG9saWN5U3RhdGVtZW50cyA9IFtdLFxuICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXMgPSB7fSxcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgY29uc3QgZnVuY3Rpb25OYW1lID0gYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tJHtuYW1lfWA7XG5cbiAgICAvLyBDcmVhdGUgQ2xvdWRXYXRjaCBMb2cgR3JvdXBcbiAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBMb2dHcm91cCh0aGlzLCBgJHtuYW1lfUxvZ0dyb3VwYCwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBgL2F3cy9sYW1iZGEvJHtmdW5jdGlvbk5hbWV9YCxcbiAgICAgIHJldGVudGlvbjogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJldGVudGlvbkRheXMuT05FX01PTlRIIDogUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBmdW5jdGlvbi1zcGVjaWZpYyByb2xlIGlmIGFkZGl0aW9uYWwgcGVybWlzc2lvbnMgYXJlIG5lZWRlZFxuICAgIGxldCBmdW5jdGlvblJvbGUgPSB0aGlzLmJhc2VSb2xlO1xuICAgIGlmIChhZGRpdGlvbmFsUG9saWN5U3RhdGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBmdW5jdGlvblJvbGUgPSBuZXcgUm9sZSh0aGlzLCBgJHtuYW1lfVJvbGVgLCB7XG4gICAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBgUm9sZSBmb3IgJHtmdW5jdGlvbk5hbWV9YCxcbiAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFWUENBY2Nlc3NFeGVjdXRpb25Sb2xlJyksXG4gICAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FXU1hSYXlEYWVtb25Xcml0ZUFjY2VzcycpLFxuICAgICAgICBdLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBhZGRpdGlvbmFsIHBvbGljaWVzXG4gICAgICBhZGRpdGlvbmFsUG9saWN5U3RhdGVtZW50cy5mb3JFYWNoKHN0YXRlbWVudCA9PiB7XG4gICAgICAgIGZ1bmN0aW9uUm9sZS5hZGRUb1BvbGljeShzdGF0ZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvblxuICAgIGNvbnN0IGxhbWJkYUZ1bmN0aW9uID0gbmV3IExhbWJkYUZ1bmN0aW9uKHRoaXMsIGAke25hbWV9RnVuY3Rpb25gLCB7XG4gICAgICBmdW5jdGlvbk5hbWUsXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzIwX1gsXG4gICAgICBhcmNoaXRlY3R1cmU6IEFyY2hpdGVjdHVyZS5BUk1fNjQsXG4gICAgICBjb2RlOiBDb2RlLmZyb21Bc3NldChjb2RlUGF0aCksXG4gICAgICBoYW5kbGVyLFxuICAgICAgbWVtb3J5U2l6ZSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHModGltZW91dCksXG4gICAgICByb2xlOiBmdW5jdGlvblJvbGUsXG4gICAgICB2cGMsXG4gICAgICBzZWN1cml0eUdyb3VwczogW3NlY3VyaXR5R3JvdXBdLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgLi4udGhpcy5iYXNlRW52aXJvbm1lbnRWYXJpYWJsZXMsXG4gICAgICAgIC4uLmVudmlyb25tZW50VmFyaWFibGVzLFxuICAgICAgfSxcbiAgICAgIHRyYWNpbmc6IFRyYWNpbmcuQUNUSVZFLFxuICAgICAgbG9nZ2luZ0Zvcm1hdDogTG9nZ2luZ0Zvcm1hdC5KU09OLFxuICAgICAgc3lzdGVtTG9nTGV2ZWw6IFN5c3RlbUxvZ0xldmVsLklORk8sXG4gICAgICBhcHBsaWNhdGlvbkxvZ0xldmVsOiBBcHBsaWNhdGlvbkxvZ0xldmVsLklORk8sXG4gICAgICBsb2dHcm91cCxcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0YWdzXG4gICAgVGFncy5vZihsYW1iZGFGdW5jdGlvbikuYWRkKCdOYW1lJywgZnVuY3Rpb25OYW1lKTtcbiAgICBUYWdzLm9mKGxhbWJkYUZ1bmN0aW9uKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuICAgIFRhZ3Mub2YobGFtYmRhRnVuY3Rpb24pLmFkZCgnU2VydmljZScsIG5hbWUpO1xuXG4gICAgLy8gQ3JlYXRlIHZlcnNpb24gYW5kIGFsaWFzIGZvciBibHVlL2dyZWVuIGRlcGxveW1lbnRzXG4gICAgY29uc3QgdmVyc2lvbiA9IG5ldyBWZXJzaW9uKHRoaXMsIGAke25hbWV9VmVyc2lvbmAsIHtcbiAgICAgIGxhbWJkYTogbGFtYmRhRnVuY3Rpb24sXG4gICAgfSk7XG4gICAgY29uc3QgYWxpYXMgPSBuZXcgQWxpYXModGhpcywgYCR7bmFtZX1BbGlhc2AsIHtcbiAgICAgIGFsaWFzTmFtZTogJ2xpdmUnLFxuICAgICAgdmVyc2lvbixcbiAgICB9KTtcblxuICAgIC8vIENvbmZpZ3VyZSBDb2RlRGVwbG95IGNhbmFyeSBkZXBsb3ltZW50IGZvciBzYWZlIHJlbGVhc2VzXG4gICAgbmV3IExhbWJkYURlcGxveW1lbnRHcm91cCh0aGlzLCBgJHtuYW1lfURlcGxveW1lbnRHcm91cGAsIHtcbiAgICAgIGFsaWFzLFxuICAgICAgZGVwbG95bWVudENvbmZpZzogTGFtYmRhRGVwbG95bWVudENvbmZpZy5DQU5BUllfMTBQRVJDRU5UXzVNSU5VVEVTLFxuICAgICAgYXV0b1JvbGxiYWNrOiB7XG4gICAgICAgIGZhaWxlZERlcGxveW1lbnQ6IHRydWUsXG4gICAgICAgIHN0b3BwZWREZXBsb3ltZW50OiB0cnVlLFxuICAgICAgICBkZXBsb3ltZW50SW5BbGFybTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBTdG9yZSBhbGlhcyByZWZlcmVuY2Ugc28gQVBJIEdhdGV3YXkgaW50ZWdyYXRlcyB3aXRoIHRoZSBsaXZlIGFsaWFzXG4gICAgdGhpcy5mdW5jdGlvbnMuc2V0KG5hbWUsIGFsaWFzKTtcblxuICAgIHJldHVybiBhbGlhcztcbiAgfVxuXG4gIHB1YmxpYyBnZXRGdW5jdGlvbihuYW1lOiBzdHJpbmcpOiBJRnVuY3Rpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmZ1bmN0aW9ucy5nZXQobmFtZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsRnVuY3Rpb25zKCk6IElGdW5jdGlvbltdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmZ1bmN0aW9ucy52YWx1ZXMoKSk7XG4gIH1cbn0iXX0=