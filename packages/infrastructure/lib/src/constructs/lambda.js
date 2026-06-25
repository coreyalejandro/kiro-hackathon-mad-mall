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
                name: 'zaji-engine',
                description: 'Zaji image processing service',
                codePath: '../zaji/dist',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnN0cnVjdHMvbGFtYmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUF1QztBQUN2Qyx1REFVZ0M7QUFDaEMsaURBTTZCO0FBSTdCLG1EQUErRDtBQUMvRCw2Q0FBNEQ7QUFDNUQsK0RBQTJGO0FBQzNGLHVEQUF3RDtBQUN4RCx1REFBd0Q7QUFDeEQsdUVBQXFGO0FBOEVyRixNQUFhLGVBQWdCLFNBQVEsc0JBQVM7SUFNNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEyQjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBTkgsY0FBUyxHQUEyQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzdDLHNCQUFpQixHQUFnQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBTzFFLE1BQU0sRUFDSixXQUFXLEVBQ1gsR0FBRyxFQUNILGFBQWEsRUFDYixXQUFXLEVBQ1gsTUFBTSxFQUNOLDhCQUE4QixHQUFHLEVBQUUsR0FDcEMsR0FBRyxLQUFLLENBQUM7UUFFViw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU1RSxvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHO1lBQzlCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQzFDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSztZQUN4QixtQ0FBbUMsRUFBRSxHQUFHO1lBQ3hDLEdBQUcsOEJBQThCO1NBQ2xDLENBQUM7UUFFRixpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDOUQs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Q0FBQyxJQUFJLG1DQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3JDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLHVCQUF1QjtRQUM1QixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztDQUNGO0FBelVELDBDQXlVQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHtcbiAgRnVuY3Rpb24gYXMgTGFtYmRhRnVuY3Rpb24sXG4gIElGdW5jdGlvbixcbiAgUnVudGltZSxcbiAgQ29kZSxcbiAgQXJjaGl0ZWN0dXJlLFxuICBUcmFjaW5nLFxuICBMb2dnaW5nRm9ybWF0LFxuICBTeXN0ZW1Mb2dMZXZlbCxcbiAgQXBwbGljYXRpb25Mb2dMZXZlbCxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQge1xuICBSb2xlLFxuICBTZXJ2aWNlUHJpbmNpcGFsLFxuICBQb2xpY3lTdGF0ZW1lbnQsXG4gIEVmZmVjdCxcbiAgTWFuYWdlZFBvbGljeSxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBWcGMsIFNlY3VyaXR5R3JvdXAgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCB7IEtleSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1rbXMnO1xuaW1wb3J0IHsgTG9nR3JvdXAsIFJldGVudGlvbkRheXMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgUmVtb3ZhbFBvbGljeSwgVGFncyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IExhbWJkYURlcGxveW1lbnRDb25maWcsIExhbWJkYURlcGxveW1lbnRHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlZGVwbG95JztcbmltcG9ydCB7IEFsaWFzLCBWZXJzaW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBSdWxlLCBTY2hlZHVsZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMnO1xuaW1wb3J0IHsgTGFtYmRhRnVuY3Rpb24gYXMgRXZlbnRMYW1iZGFUYXJnZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZXZlbnRzLXRhcmdldHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExhbWJkYUNvbnN0cnVjdFByb3BzIHtcbiAgLyoqXG4gICAqIEVudmlyb25tZW50IG5hbWUgKGRldiwgc3RhZ2luZywgcHJvZClcbiAgICovXG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogVlBDIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAqL1xuICB2cGM6IFZwYztcbiAgXG4gIC8qKlxuICAgKiBTZWN1cml0eSBncm91cCBmb3IgTGFtYmRhIGZ1bmN0aW9uc1xuICAgKi9cbiAgc2VjdXJpdHlHcm91cDogU2VjdXJpdHlHcm91cDtcbiAgXG4gIC8qKlxuICAgKiBEeW5hbW9EQiB0YWJsZSBmb3IgZGF0YSBhY2Nlc3NcbiAgICovXG4gIGR5bmFtb1RhYmxlOiBUYWJsZTtcbiAgXG4gIC8qKlxuICAgKiBLTVMga2V5IGZvciBlbmNyeXB0aW9uXG4gICAqL1xuICBrbXNLZXk6IEtleTtcbiAgXG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgKi9cbiAgYWRkaXRpb25hbEVudmlyb25tZW50VmFyaWFibGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYW1iZGFGdW5jdGlvbkNvbmZpZyB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBuYW1lIHN1ZmZpeFxuICAgKi9cbiAgbmFtZTogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGRlc2NyaXB0aW9uXG4gICAqL1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIFBhdGggdG8gdGhlIGZ1bmN0aW9uIGNvZGVcbiAgICovXG4gIGNvZGVQYXRoOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogRnVuY3Rpb24gaGFuZGxlclxuICAgKi9cbiAgaGFuZGxlcjogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIE1lbW9yeSBhbGxvY2F0aW9uIGluIE1CXG4gICAqIEBkZWZhdWx0IDUxMlxuICAgKi9cbiAgbWVtb3J5U2l6ZT86IG51bWJlcjtcbiAgXG4gIC8qKlxuICAgKiBUaW1lb3V0IGluIHNlY29uZHNcbiAgICogQGRlZmF1bHQgMzBcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIFxuICAvKipcbiAgICogQWRkaXRpb25hbCBJQU0gcG9saWN5IHN0YXRlbWVudHNcbiAgICovXG4gIGFkZGl0aW9uYWxQb2xpY3lTdGF0ZW1lbnRzPzogUG9saWN5U3RhdGVtZW50W107XG4gIFxuICAvKipcbiAgICogRnVuY3Rpb24tc3BlY2lmaWMgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAqL1xuICBlbnZpcm9ubWVudFZhcmlhYmxlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmV4cG9ydCBjbGFzcyBMYW1iZGFDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZnVuY3Rpb25zOiBNYXA8c3RyaW5nLCBJRnVuY3Rpb24+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbmNyZXRlRnVuY3Rpb25zOiBNYXA8c3RyaW5nLCBMYW1iZGFGdW5jdGlvbj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZVJvbGU6IFJvbGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZUVudmlyb25tZW50VmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBMYW1iZGFDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIHZwYyxcbiAgICAgIHNlY3VyaXR5R3JvdXAsXG4gICAgICBkeW5hbW9UYWJsZSxcbiAgICAgIGttc0tleSxcbiAgICAgIGFkZGl0aW9uYWxFbnZpcm9ubWVudFZhcmlhYmxlcyA9IHt9LFxuICAgIH0gPSBwcm9wcztcblxuICAgIC8vIENyZWF0ZSBiYXNlIElBTSByb2xlIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAgdGhpcy5iYXNlUm9sZSA9IHRoaXMuY3JlYXRlQmFzZUxhbWJkYVJvbGUoZW52aXJvbm1lbnQsIGR5bmFtb1RhYmxlLCBrbXNLZXkpO1xuXG4gICAgLy8gU2V0IHVwIGJhc2UgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAgdGhpcy5iYXNlRW52aXJvbm1lbnRWYXJpYWJsZXMgPSB7XG4gICAgICBOT0RFX0VOVjogZW52aXJvbm1lbnQsXG4gICAgICBFTlZJUk9OTUVOVDogZW52aXJvbm1lbnQsXG4gICAgICBEWU5BTU9EQl9UQUJMRV9OQU1FOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICBLTVNfS0VZX0lEOiBrbXNLZXkua2V5SWQsXG4gICAgICBBV1NfTk9ERUpTX0NPTk5FQ1RJT05fUkVVU0VfRU5BQkxFRDogJzEnLFxuICAgICAgLi4uYWRkaXRpb25hbEVudmlyb25tZW50VmFyaWFibGVzLFxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY29tbW9uIExhbWJkYSBmdW5jdGlvbnNcbiAgICB0aGlzLmNyZWF0ZUNvbW1vbkZ1bmN0aW9ucyhlbnZpcm9ubWVudCwgdnBjLCBzZWN1cml0eUdyb3VwKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQmFzZUxhbWJkYVJvbGUoZW52aXJvbm1lbnQ6IHN0cmluZywgZHluYW1vVGFibGU6IFRhYmxlLCBrbXNLZXk6IEtleSk6IFJvbGUge1xuICAgIGNvbnN0IHJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnQmFzZUxhbWJkYVJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgZGVzY3JpcHRpb246IGBCYXNlIHJvbGUgZm9yIE1BRE1hbGwgJHtlbnZpcm9ubWVudH0gTGFtYmRhIGZ1bmN0aW9uc2AsXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFWUENBY2Nlc3NFeGVjdXRpb25Sb2xlJyksXG4gICAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBV1NYUmF5RGFlbW9uV3JpdGVBY2Nlc3MnKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBEeW5hbW9EQiBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2R5bmFtb2RiOkdldEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6UHV0SXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpVcGRhdGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOkRlbGV0ZUl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6UXVlcnknLFxuICAgICAgICAnZHluYW1vZGI6U2NhbicsXG4gICAgICAgICdkeW5hbW9kYjpCYXRjaEdldEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6QmF0Y2hXcml0ZUl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6Q29uZGl0aW9uQ2hlY2tJdGVtJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgZHluYW1vVGFibGUudGFibGVBcm4sXG4gICAgICAgIGAke2R5bmFtb1RhYmxlLnRhYmxlQXJufS9pbmRleC8qYCxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gS01TIHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAna21zOkRlY3J5cHQnLFxuICAgICAgICAna21zOkRlc2NyaWJlS2V5JyxcbiAgICAgICAgJ2ttczpFbmNyeXB0JyxcbiAgICAgICAgJ2ttczpHZW5lcmF0ZURhdGFLZXknLFxuICAgICAgICAna21zOlJlRW5jcnlwdConLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW2ttc0tleS5rZXlBcm5dLFxuICAgIH0pKTtcblxuICAgIC8vIFNlY3JldHMgTWFuYWdlciBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ3NlY3JldHNtYW5hZ2VyOkdldFNlY3JldFZhbHVlJyxcbiAgICAgICAgJ3NlY3JldHNtYW5hZ2VyOkRlc2NyaWJlU2VjcmV0JyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtgYXJuOmF3czpzZWNyZXRzbWFuYWdlcjoqOio6c2VjcmV0Om1hZG1hbGwvJHtlbnZpcm9ubWVudH0vKmBdLFxuICAgIH0pKTtcblxuICAgIC8vIENsb3VkV2F0Y2ggTG9ncyBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxuICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmxvZ3M6KjoqOmxvZy1ncm91cDovYXdzL2xhbWJkYS9tYWRtYWxsLSR7ZW52aXJvbm1lbnR9LSpgXSxcbiAgICB9KSk7XG5cbiAgICAvLyBCZWRyb2NrIHBlcm1pc3Npb25zXG4gICAgcm9sZS5hZGRUb1BvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnYmVkcm9jazpJbnZva2VNb2RlbCcsXG4gICAgICAgICdiZWRyb2NrOkludm9rZUFnZW50JyxcbiAgICAgICAgJ2JlZHJvY2s6R2V0QWdlbnQnLFxuICAgICAgICAnYmVkcm9jazpMaXN0QWdlbnRzJyxcbiAgICAgICAgJ2JlZHJvY2s6R2V0S25vd2xlZGdlQmFzZScsXG4gICAgICAgICdiZWRyb2NrOlJldHJpZXZlQW5kR2VuZXJhdGUnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sIC8vIEJlZHJvY2sgcmVzb3VyY2VzIGFyZSByZWdpb24tc3BlY2lmaWNcbiAgICB9KSk7XG5cbiAgICBUYWdzLm9mKHJvbGUpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWxhbWJkYS1iYXNlLXJvbGVgKTtcbiAgICBUYWdzLm9mKHJvbGUpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cbiAgICByZXR1cm4gcm9sZTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ29tbW9uRnVuY3Rpb25zKGVudmlyb25tZW50OiBzdHJpbmcsIHZwYzogVnBjLCBzZWN1cml0eUdyb3VwOiBTZWN1cml0eUdyb3VwKTogdm9pZCB7XG4gICAgY29uc3QgY29tbW9uRnVuY3Rpb25zOiBMYW1iZGFGdW5jdGlvbkNvbmZpZ1tdID0gW1xuICAgICAge1xuICAgICAgICBuYW1lOiAndXNlci1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdVc2VyIG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvdXNlcicsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjaXJjbGUtc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2lyY2xlIG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvY2lyY2xlJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDMwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3N0b3J5LXNlcnZpY2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1N0b3J5IG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvc3RvcnknLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMzAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnYnVzaW5lc3Mtc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQnVzaW5lc3MgbWFuYWdlbWVudCBzZXJ2aWNlIGZ1bmN0aW9ucycsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy9idXNpbmVzcycsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdyZXNvdXJjZS1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXNvdXJjZSBtYW5hZ2VtZW50IHNlcnZpY2UgZnVuY3Rpb25zJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL3Jlc291cmNlJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDMwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2F1dGgtc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQXV0aGVudGljYXRpb24gYW5kIGF1dGhvcml6YXRpb24gc2VydmljZScsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy9hdXRoJyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICAgIHRpbWVvdXQ6IDE1LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3VwbG9hZC1oYW5kbGVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdJbWFnZSB1cGxvYWQgYW5kIHByb2Nlc3Npbmcgc2VydmljZScsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy91cGxvYWQnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gICAgICAgIHRpbWVvdXQ6IDYwLFxuICAgICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczoge1xuICAgICAgICAgIFVTRVJfQ09OVEVOVF9CVUNLRVRfTkFNRTogcHJvY2Vzcy5lbnYuVVNFUl9DT05URU5UX0JVQ0tFVF9OQU1FIHx8ICcnLFxuICAgICAgICAgIENPTlRFTlRfS01TX0tFWV9JRDogcHJvY2Vzcy5lbnYuQ09OVEVOVF9LTVNfS0VZX0lEIHx8ICcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3phamktZW5naW5lJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdaYWppIGltYWdlIHByb2Nlc3Npbmcgc2VydmljZScsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vemFqaS9kaXN0JyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiAxMDI0LFxuICAgICAgICB0aW1lb3V0OiA2MCxcbiAgICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IHtcbiAgICAgICAgICBQRVhFTFNfQVBJX0tFWTogJyR7YXdzOnNlY3JldHNtYW5hZ2VyOm1hZG1hbGwvJyArIGVudmlyb25tZW50ICsgJy9wZXhlbHM6U2VjcmV0U3RyaW5nOmFwaUtleX0nLFxuICAgICAgICAgIFVOU1BMQVNIX0FDQ0VTU19LRVk6ICcke2F3czpzZWNyZXRzbWFuYWdlcjptYWRtYWxsLycgKyBlbnZpcm9ubWVudCArICcvdW5zcGxhc2g6U2VjcmV0U3RyaW5nOmFjY2Vzc0tleX0nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2JlZHJvY2stYWdlbnQtb3JjaGVzdHJhdG9yJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdCZWRyb2NrIGFnZW50IHdvcmtmbG93IG9yY2hlc3RyYXRpb24nLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2JlZHJvY2stYWdlbnRzL2Rpc3QnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMTIwLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgY29tbW9uRnVuY3Rpb25zLmZvckVhY2goY29uZmlnID0+IHtcbiAgICAgIGNvbnN0IGZuID0gdGhpcy5jcmVhdGVGdW5jdGlvbihjb25maWcsIGVudmlyb25tZW50LCB2cGMsIHNlY3VyaXR5R3JvdXApO1xuICAgICAgaWYgKGNvbmZpZy5uYW1lID09PSAndGl0YW4tZW5naW5lJykge1xuICAgICAgICB0aGlzLnNjaGVkdWxlQXVkaXQoZm4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGNyZWF0ZUZ1bmN0aW9uKFxuICAgIGNvbmZpZzogTGFtYmRhRnVuY3Rpb25Db25maWcsXG4gICAgZW52aXJvbm1lbnQ6IHN0cmluZyxcbiAgICB2cGM6IFZwYyxcbiAgICBzZWN1cml0eUdyb3VwOiBTZWN1cml0eUdyb3VwXG4gICk6IElGdW5jdGlvbiB7XG4gICAgY29uc3Qge1xuICAgICAgbmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgY29kZVBhdGgsXG4gICAgICBoYW5kbGVyLFxuICAgICAgbWVtb3J5U2l6ZSA9IDUxMixcbiAgICAgIHRpbWVvdXQgPSAzMCxcbiAgICAgIGFkZGl0aW9uYWxQb2xpY3lTdGF0ZW1lbnRzID0gW10sXG4gICAgICBlbnZpcm9ubWVudFZhcmlhYmxlcyA9IHt9LFxuICAgIH0gPSBjb25maWc7XG5cbiAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS0ke25hbWV9YDtcblxuICAgIC8vIENyZWF0ZSBDbG91ZFdhdGNoIExvZyBHcm91cFxuICAgIGNvbnN0IGxvZ0dyb3VwID0gbmV3IExvZ0dyb3VwKHRoaXMsIGAke25hbWV9TG9nR3JvdXBgLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2xhbWJkYS8ke2Z1bmN0aW9uTmFtZX1gLFxuICAgICAgcmV0ZW50aW9uOiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmV0ZW50aW9uRGF5cy5PTkVfTU9OVEggOiBSZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGZ1bmN0aW9uLXNwZWNpZmljIHJvbGUgaWYgYWRkaXRpb25hbCBwZXJtaXNzaW9ucyBhcmUgbmVlZGVkXG4gICAgbGV0IGZ1bmN0aW9uUm9sZSA9IHRoaXMuYmFzZVJvbGU7XG4gICAgaWYgKGFkZGl0aW9uYWxQb2xpY3lTdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZ1bmN0aW9uUm9sZSA9IG5ldyBSb2xlKHRoaXMsIGAke25hbWV9Um9sZWAsIHtcbiAgICAgICAgYXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbCgnbGFtYmRhLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgICAgZGVzY3JpcHRpb246IGBSb2xlIGZvciAke2Z1bmN0aW9uTmFtZX1gLFxuICAgICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgICBNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYVZQQ0FjY2Vzc0V4ZWN1dGlvblJvbGUnKSxcbiAgICAgICAgICBNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQVdTWFJheURhZW1vbldyaXRlQWNjZXNzJyksXG4gICAgICAgIF0sXG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGFkZGl0aW9uYWwgcG9saWNpZXNcbiAgICAgIGFkZGl0aW9uYWxQb2xpY3lTdGF0ZW1lbnRzLmZvckVhY2goc3RhdGVtZW50ID0+IHtcbiAgICAgICAgZnVuY3Rpb25Sb2xlLmFkZFRvUG9saWN5KHN0YXRlbWVudCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgTGFtYmRhIGZ1bmN0aW9uXG4gICAgY29uc3QgbGFtYmRhRnVuY3Rpb24gPSBuZXcgTGFtYmRhRnVuY3Rpb24odGhpcywgYCR7bmFtZX1GdW5jdGlvbmAsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgIGFyY2hpdGVjdHVyZTogQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgIGNvZGU6IENvZGUuZnJvbUFzc2V0KGNvZGVQYXRoKSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICBtZW1vcnlTaXplLFxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcyh0aW1lb3V0KSxcbiAgICAgIHJvbGU6IGZ1bmN0aW9uUm9sZSxcbiAgICAgIHZwYyxcbiAgICAgIHNlY3VyaXR5R3JvdXBzOiBbc2VjdXJpdHlHcm91cF0sXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAuLi50aGlzLmJhc2VFbnZpcm9ubWVudFZhcmlhYmxlcyxcbiAgICAgICAgLi4uZW52aXJvbm1lbnRWYXJpYWJsZXMsXG4gICAgICB9LFxuICAgICAgdHJhY2luZzogVHJhY2luZy5BQ1RJVkUsXG4gICAgICBsb2dnaW5nRm9ybWF0OiBMb2dnaW5nRm9ybWF0LkpTT04sXG4gICAgICBzeXN0ZW1Mb2dMZXZlbDogU3lzdGVtTG9nTGV2ZWwuSU5GTyxcbiAgICAgIGFwcGxpY2F0aW9uTG9nTGV2ZWw6IEFwcGxpY2F0aW9uTG9nTGV2ZWwuSU5GTyxcbiAgICAgIGxvZ0dyb3VwLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIHRhZ3NcbiAgICBUYWdzLm9mKGxhbWJkYUZ1bmN0aW9uKS5hZGQoJ05hbWUnLCBmdW5jdGlvbk5hbWUpO1xuICAgIFRhZ3Mub2YobGFtYmRhRnVuY3Rpb24pLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG4gICAgVGFncy5vZihsYW1iZGFGdW5jdGlvbikuYWRkKCdTZXJ2aWNlJywgbmFtZSk7XG5cbiAgICAvLyBDcmVhdGUgdmVyc2lvbiBhbmQgYWxpYXMgZm9yIGJsdWUvZ3JlZW4gZGVwbG95bWVudHNcbiAgICBjb25zdCB2ZXJzaW9uID0gbmV3IFZlcnNpb24odGhpcywgYCR7bmFtZX1WZXJzaW9uYCwge1xuICAgICAgbGFtYmRhOiBsYW1iZGFGdW5jdGlvbixcbiAgICB9KTtcbiAgICBjb25zdCBhbGlhcyA9IG5ldyBBbGlhcyh0aGlzLCBgJHtuYW1lfUFsaWFzYCwge1xuICAgICAgYWxpYXNOYW1lOiAnbGl2ZScsXG4gICAgICB2ZXJzaW9uLFxuICAgIH0pO1xuXG4gICAgLy8gQ29uZmlndXJlIENvZGVEZXBsb3kgY2FuYXJ5IGRlcGxveW1lbnQgZm9yIHNhZmUgcmVsZWFzZXNcbiAgICBuZXcgTGFtYmRhRGVwbG95bWVudEdyb3VwKHRoaXMsIGAke25hbWV9RGVwbG95bWVudEdyb3VwYCwge1xuICAgICAgYWxpYXMsXG4gICAgICBkZXBsb3ltZW50Q29uZmlnOiBMYW1iZGFEZXBsb3ltZW50Q29uZmlnLkNBTkFSWV8xMFBFUkNFTlRfNU1JTlVURVMsXG4gICAgICBhdXRvUm9sbGJhY2s6IHtcbiAgICAgICAgZmFpbGVkRGVwbG95bWVudDogdHJ1ZSxcbiAgICAgICAgc3RvcHBlZERlcGxveW1lbnQ6IHRydWUsXG4gICAgICAgIGRlcGxveW1lbnRJbkFsYXJtOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIFN0b3JlIGJvdGggdGhlIGNvbmNyZXRlIGZ1bmN0aW9uIChmb3IgbW9uaXRvcmluZykgYW5kIGFsaWFzIChmb3IgQVBJIEdhdGV3YXkpXG4gICAgdGhpcy5jb25jcmV0ZUZ1bmN0aW9ucy5zZXQobmFtZSwgbGFtYmRhRnVuY3Rpb24pO1xuICAgIHRoaXMuZnVuY3Rpb25zLnNldChuYW1lLCBhbGlhcyk7XG5cbiAgICByZXR1cm4gYWxpYXM7XG4gIH1cblxuICBwdWJsaWMgZ2V0RnVuY3Rpb24obmFtZTogc3RyaW5nKTogSUZ1bmN0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5mdW5jdGlvbnMuZ2V0KG5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZUF1ZGl0KGZuOiBJRnVuY3Rpb24pIHtcbiAgICBuZXcgUnVsZSh0aGlzLCAnTmlnaHRseUltYWdlQXVkaXQnLCB7XG4gICAgICBzY2hlZHVsZTogU2NoZWR1bGUuY3Jvbih7IG1pbnV0ZTogJzAnLCBob3VyOiAnMCcgfSksXG4gICAgICB0YXJnZXRzOiBbbmV3IEV2ZW50TGFtYmRhVGFyZ2V0KGZuKV0sXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsRnVuY3Rpb25zKCk6IElGdW5jdGlvbltdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmZ1bmN0aW9ucy52YWx1ZXMoKSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsQ29uY3JldGVGdW5jdGlvbnMoKTogTGFtYmRhRnVuY3Rpb25bXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jb25jcmV0ZUZ1bmN0aW9ucy52YWx1ZXMoKSk7XG4gIH1cbn0iXX0=