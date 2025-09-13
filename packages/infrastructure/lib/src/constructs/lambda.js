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
        // Store alias reference so API Gateway integrates with the live alias
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
}
exports.LambdaConstruct = LambdaConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnN0cnVjdHMvbGFtYmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUF1QztBQUN2Qyx1REFVZ0M7QUFDaEMsaURBTTZCO0FBSTdCLG1EQUErRDtBQUMvRCw2Q0FBNEQ7QUFDNUQsK0RBQTJGO0FBQzNGLHVEQUF3RDtBQUN4RCx1REFBd0Q7QUFDeEQsdUVBQXFGO0FBOEVyRixNQUFhLGVBQWdCLFNBQVEsc0JBQVM7SUFLNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEyQjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBTEgsY0FBUyxHQUEyQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBTzVELE1BQU0sRUFDSixXQUFXLEVBQ1gsR0FBRyxFQUNILGFBQWEsRUFDYixXQUFXLEVBQ1gsTUFBTSxFQUNOLDhCQUE4QixHQUFHLEVBQUUsR0FDcEMsR0FBRyxLQUFLLENBQUM7UUFFViw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU1RSxvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHO1lBQzlCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQzFDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSztZQUN4QixtQ0FBbUMsRUFBRSxHQUFHO1lBQ3hDLEdBQUcsOEJBQThCO1NBQ2xDLENBQUM7UUFFRixpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFdBQW1CLEVBQUUsV0FBa0Is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QUU7WUFDeEQsS0FBSztZQUNMLGdCQUFnQixFQUFFLHVDQUFzQixDQUFDLHlCQUF5QjtZQUNsRSxZQUFZLEVBQUU7Z0JBQ1osZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsaUJBQWlCLEVBQUUsSUFBSTtnQkFDdkIsaUJBQWlCLEVBQUUsSUFBSTthQUN4QjtTQUNGLENBQUMsQ0FBQztRQUVILHNFQUFzRTtRQUN0RSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFaEMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU0sV0FBVyxDQUFDLElBQVk7UUFDN0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU8sYUFBYSxDQUFDLEVBQWE7UUFDakMsSUFBSSxpQkFBSSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNsQyxRQUFRLEVBQUUscUJBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNuRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLG1DQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3JDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNGO0FBdlRELDBDQXVUQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHtcbiAgRnVuY3Rpb24gYXMgTGFtYmRhRnVuY3Rpb24sXG4gIElGdW5jdGlvbixcbiAgUnVudGltZSxcbiAgQ29kZSxcbiAgQXJjaGl0ZWN0dXJlLFxuICBUcmFjaW5nLFxuICBMb2dnaW5nRm9ybWF0LFxuICBTeXN0ZW1Mb2dMZXZlbCxcbiAgQXBwbGljYXRpb25Mb2dMZXZlbCxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQge1xuICBSb2xlLFxuICBTZXJ2aWNlUHJpbmNpcGFsLFxuICBQb2xpY3lTdGF0ZW1lbnQsXG4gIEVmZmVjdCxcbiAgTWFuYWdlZFBvbGljeSxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBWcGMsIFNlY3VyaXR5R3JvdXAgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCB7IEtleSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1rbXMnO1xuaW1wb3J0IHsgTG9nR3JvdXAsIFJldGVudGlvbkRheXMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgUmVtb3ZhbFBvbGljeSwgVGFncyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IExhbWJkYURlcGxveW1lbnRDb25maWcsIExhbWJkYURlcGxveW1lbnRHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlZGVwbG95JztcbmltcG9ydCB7IEFsaWFzLCBWZXJzaW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBSdWxlLCBTY2hlZHVsZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMnO1xuaW1wb3J0IHsgTGFtYmRhRnVuY3Rpb24gYXMgRXZlbnRMYW1iZGFUYXJnZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZXZlbnRzLXRhcmdldHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExhbWJkYUNvbnN0cnVjdFByb3BzIHtcbiAgLyoqXG4gICAqIEVudmlyb25tZW50IG5hbWUgKGRldiwgc3RhZ2luZywgcHJvZClcbiAgICovXG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogVlBDIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAqL1xuICB2cGM6IFZwYztcbiAgXG4gIC8qKlxuICAgKiBTZWN1cml0eSBncm91cCBmb3IgTGFtYmRhIGZ1bmN0aW9uc1xuICAgKi9cbiAgc2VjdXJpdHlHcm91cDogU2VjdXJpdHlHcm91cDtcbiAgXG4gIC8qKlxuICAgKiBEeW5hbW9EQiB0YWJsZSBmb3IgZGF0YSBhY2Nlc3NcbiAgICovXG4gIGR5bmFtb1RhYmxlOiBUYWJsZTtcbiAgXG4gIC8qKlxuICAgKiBLTVMga2V5IGZvciBlbmNyeXB0aW9uXG4gICAqL1xuICBrbXNLZXk6IEtleTtcbiAgXG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgKi9cbiAgYWRkaXRpb25hbEVudmlyb25tZW50VmFyaWFibGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYW1iZGFGdW5jdGlvbkNvbmZpZyB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBuYW1lIHN1ZmZpeFxuICAgKi9cbiAgbmFtZTogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGRlc2NyaXB0aW9uXG4gICAqL1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIFBhdGggdG8gdGhlIGZ1bmN0aW9uIGNvZGVcbiAgICovXG4gIGNvZGVQYXRoOiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogRnVuY3Rpb24gaGFuZGxlclxuICAgKi9cbiAgaGFuZGxlcjogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIE1lbW9yeSBhbGxvY2F0aW9uIGluIE1CXG4gICAqIEBkZWZhdWx0IDUxMlxuICAgKi9cbiAgbWVtb3J5U2l6ZT86IG51bWJlcjtcbiAgXG4gIC8qKlxuICAgKiBUaW1lb3V0IGluIHNlY29uZHNcbiAgICogQGRlZmF1bHQgMzBcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIFxuICAvKipcbiAgICogQWRkaXRpb25hbCBJQU0gcG9saWN5IHN0YXRlbWVudHNcbiAgICovXG4gIGFkZGl0aW9uYWxQb2xpY3lTdGF0ZW1lbnRzPzogUG9saWN5U3RhdGVtZW50W107XG4gIFxuICAvKipcbiAgICogRnVuY3Rpb24tc3BlY2lmaWMgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAqL1xuICBlbnZpcm9ubWVudFZhcmlhYmxlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmV4cG9ydCBjbGFzcyBMYW1iZGFDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZnVuY3Rpb25zOiBNYXA8c3RyaW5nLCBJRnVuY3Rpb24+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHJlYWRvbmx5IGJhc2VSb2xlOiBSb2xlO1xuICBwcml2YXRlIHJlYWRvbmx5IGJhc2VFbnZpcm9ubWVudFZhcmlhYmxlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTGFtYmRhQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3Qge1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICB2cGMsXG4gICAgICBzZWN1cml0eUdyb3VwLFxuICAgICAgZHluYW1vVGFibGUsXG4gICAgICBrbXNLZXksXG4gICAgICBhZGRpdGlvbmFsRW52aXJvbm1lbnRWYXJpYWJsZXMgPSB7fSxcbiAgICB9ID0gcHJvcHM7XG5cbiAgICAvLyBDcmVhdGUgYmFzZSBJQU0gcm9sZSBmb3IgTGFtYmRhIGZ1bmN0aW9uc1xuICAgIHRoaXMuYmFzZVJvbGUgPSB0aGlzLmNyZWF0ZUJhc2VMYW1iZGFSb2xlKGVudmlyb25tZW50LCBkeW5hbW9UYWJsZSwga21zS2V5KTtcblxuICAgIC8vIFNldCB1cCBiYXNlIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgIHRoaXMuYmFzZUVudmlyb25tZW50VmFyaWFibGVzID0ge1xuICAgICAgTk9ERV9FTlY6IGVudmlyb25tZW50LFxuICAgICAgRU5WSVJPTk1FTlQ6IGVudmlyb25tZW50LFxuICAgICAgRFlOQU1PREJfVEFCTEVfTkFNRTogZHluYW1vVGFibGUudGFibGVOYW1lLFxuICAgICAgS01TX0tFWV9JRDoga21zS2V5LmtleUlkLFxuICAgICAgQVdTX05PREVKU19DT05ORUNUSU9OX1JFVVNFX0VOQUJMRUQ6ICcxJyxcbiAgICAgIC4uLmFkZGl0aW9uYWxFbnZpcm9ubWVudFZhcmlhYmxlcyxcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGNvbW1vbiBMYW1iZGEgZnVuY3Rpb25zXG4gICAgdGhpcy5jcmVhdGVDb21tb25GdW5jdGlvbnMoZW52aXJvbm1lbnQsIHZwYywgc2VjdXJpdHlHcm91cCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUJhc2VMYW1iZGFSb2xlKGVudmlyb25tZW50OiBzdHJpbmcsIGR5bmFtb1RhYmxlOiBUYWJsZSwga21zS2V5OiBLZXkpOiBSb2xlIHtcbiAgICBjb25zdCByb2xlID0gbmV3IFJvbGUodGhpcywgJ0Jhc2VMYW1iZGFSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbCgnbGFtYmRhLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIGRlc2NyaXB0aW9uOiBgQmFzZSByb2xlIGZvciBNQURNYWxsICR7ZW52aXJvbm1lbnR9IExhbWJkYSBmdW5jdGlvbnNgLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZScpLFxuICAgICAgICBNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQVdTWFJheURhZW1vbldyaXRlQWNjZXNzJyksXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgcGVybWlzc2lvbnNcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdkeW5hbW9kYjpHZXRJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlB1dEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6VXBkYXRlSXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpEZWxldGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlF1ZXJ5JyxcbiAgICAgICAgJ2R5bmFtb2RiOlNjYW4nLFxuICAgICAgICAnZHluYW1vZGI6QmF0Y2hHZXRJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOkJhdGNoV3JpdGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOkNvbmRpdGlvbkNoZWNrSXRlbScsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIGR5bmFtb1RhYmxlLnRhYmxlQXJuLFxuICAgICAgICBgJHtkeW5hbW9UYWJsZS50YWJsZUFybn0vaW5kZXgvKmAsXG4gICAgICBdLFxuICAgIH0pKTtcblxuICAgIC8vIEtNUyBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2ttczpEZWNyeXB0JyxcbiAgICAgICAgJ2ttczpEZXNjcmliZUtleScsXG4gICAgICAgICdrbXM6RW5jcnlwdCcsXG4gICAgICAgICdrbXM6R2VuZXJhdGVEYXRhS2V5JyxcbiAgICAgICAgJ2ttczpSZUVuY3J5cHQqJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtrbXNLZXkua2V5QXJuXSxcbiAgICB9KSk7XG5cbiAgICAvLyBTZWNyZXRzIE1hbmFnZXIgcGVybWlzc2lvbnNcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZScsXG4gICAgICAgICdzZWNyZXRzbWFuYWdlcjpEZXNjcmliZVNlY3JldCcsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6c2VjcmV0c21hbmFnZXI6KjoqOnNlY3JldDptYWRtYWxsLyR7ZW52aXJvbm1lbnR9LypgXSxcbiAgICB9KSk7XG5cbiAgICAvLyBDbG91ZFdhdGNoIExvZ3MgcGVybWlzc2lvbnNcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdsb2dzOkNyZWF0ZUxvZ0dyb3VwJyxcbiAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtgYXJuOmF3czpsb2dzOio6Kjpsb2ctZ3JvdXA6L2F3cy9sYW1iZGEvbWFkbWFsbC0ke2Vudmlyb25tZW50fS0qYF0sXG4gICAgfSkpO1xuXG4gICAgLy8gQmVkcm9jayBwZXJtaXNzaW9uc1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWwnLFxuICAgICAgICAnYmVkcm9jazpJbnZva2VBZ2VudCcsXG4gICAgICAgICdiZWRyb2NrOkdldEFnZW50JyxcbiAgICAgICAgJ2JlZHJvY2s6TGlzdEFnZW50cycsXG4gICAgICAgICdiZWRyb2NrOkdldEtub3dsZWRnZUJhc2UnLFxuICAgICAgICAnYmVkcm9jazpSZXRyaWV2ZUFuZEdlbmVyYXRlJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLCAvLyBCZWRyb2NrIHJlc291cmNlcyBhcmUgcmVnaW9uLXNwZWNpZmljXG4gICAgfSkpO1xuXG4gICAgVGFncy5vZihyb2xlKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1sYW1iZGEtYmFzZS1yb2xlYCk7XG4gICAgVGFncy5vZihyb2xlKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgcmV0dXJuIHJvbGU7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNvbW1vbkZ1bmN0aW9ucyhlbnZpcm9ubWVudDogc3RyaW5nLCB2cGM6IFZwYywgc2VjdXJpdHlHcm91cDogU2VjdXJpdHlHcm91cCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbW1vbkZ1bmN0aW9uczogTGFtYmRhRnVuY3Rpb25Db25maWdbXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3VzZXItc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVXNlciBtYW5hZ2VtZW50IHNlcnZpY2UgZnVuY3Rpb25zJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL3VzZXInLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMzAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY2lyY2xlLXNlcnZpY2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NpcmNsZSBtYW5hZ2VtZW50IHNlcnZpY2UgZnVuY3Rpb25zJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL2NpcmNsZScsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzdG9yeS1zZXJ2aWNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTdG9yeSBtYW5hZ2VtZW50IHNlcnZpY2UgZnVuY3Rpb25zJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9hcGktZ2F0ZXdheS9kaXN0L2hhbmRsZXJzL3N0b3J5JyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDMwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2J1c2luZXNzLXNlcnZpY2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0J1c2luZXNzIG1hbmFnZW1lbnQgc2VydmljZSBmdW5jdGlvbnMnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvYnVzaW5lc3MnLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgICAgdGltZW91dDogMzAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAncmVzb3VyY2Utc2VydmljZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVzb3VyY2UgbWFuYWdlbWVudCBzZXJ2aWNlIGZ1bmN0aW9ucycsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vYXBpLWdhdGV3YXkvZGlzdC9oYW5kbGVycy9yZXNvdXJjZScsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdhdXRoLXNlcnZpY2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0F1dGhlbnRpY2F0aW9uIGFuZCBhdXRob3JpemF0aW9uIHNlcnZpY2UnLFxuICAgICAgICBjb2RlUGF0aDogJy4uL2FwaS1nYXRld2F5L2Rpc3QvaGFuZGxlcnMvYXV0aCcsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgICB0aW1lb3V0OiAxNSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICd0aXRhbi1lbmdpbmUnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RpdGFuRW5naW5lIGltYWdlIHByb2Nlc3Npbmcgc2VydmljZScsXG4gICAgICAgIGNvZGVQYXRoOiAnLi4vdGl0YW5lbmdpbmUvZGlzdCcsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcbiAgICAgICAgdGltZW91dDogNjAsXG4gICAgICAgIGVudmlyb25tZW50VmFyaWFibGVzOiB7XG4gICAgICAgICAgUEVYRUxTX0FQSV9LRVk6ICcke2F3czpzZWNyZXRzbWFuYWdlcjptYWRtYWxsLycgKyBlbnZpcm9ubWVudCArICcvcGV4ZWxzOlNlY3JldFN0cmluZzphcGlLZXl9JyxcbiAgICAgICAgICBVTlNQTEFTSF9BQ0NFU1NfS0VZOiAnJHthd3M6c2VjcmV0c21hbmFnZXI6bWFkbWFsbC8nICsgZW52aXJvbm1lbnQgKyAnL3Vuc3BsYXNoOlNlY3JldFN0cmluZzphY2Nlc3NLZXl9JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdiZWRyb2NrLWFnZW50LW9yY2hlc3RyYXRvcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQmVkcm9jayBhZ2VudCB3b3JrZmxvdyBvcmNoZXN0cmF0aW9uJyxcbiAgICAgICAgY29kZVBhdGg6ICcuLi9iZWRyb2NrLWFnZW50cy9kaXN0JyxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgIHRpbWVvdXQ6IDEyMCxcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIGNvbW1vbkZ1bmN0aW9ucy5mb3JFYWNoKGNvbmZpZyA9PiB7XG4gICAgICBjb25zdCBmbiA9IHRoaXMuY3JlYXRlRnVuY3Rpb24oY29uZmlnLCBlbnZpcm9ubWVudCwgdnBjLCBzZWN1cml0eUdyb3VwKTtcbiAgICAgIGlmIChjb25maWcubmFtZSA9PT0gJ3RpdGFuLWVuZ2luZScpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZUF1ZGl0KGZuKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVGdW5jdGlvbihcbiAgICBjb25maWc6IExhbWJkYUZ1bmN0aW9uQ29uZmlnLFxuICAgIGVudmlyb25tZW50OiBzdHJpbmcsXG4gICAgdnBjOiBWcGMsXG4gICAgc2VjdXJpdHlHcm91cDogU2VjdXJpdHlHcm91cFxuICApOiBJRnVuY3Rpb24ge1xuICAgIGNvbnN0IHtcbiAgICAgIG5hbWUsXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIGNvZGVQYXRoLFxuICAgICAgaGFuZGxlcixcbiAgICAgIG1lbW9yeVNpemUgPSA1MTIsXG4gICAgICB0aW1lb3V0ID0gMzAsXG4gICAgICBhZGRpdGlvbmFsUG9saWN5U3RhdGVtZW50cyA9IFtdLFxuICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXMgPSB7fSxcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgY29uc3QgZnVuY3Rpb25OYW1lID0gYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tJHtuYW1lfWA7XG5cbiAgICAvLyBDcmVhdGUgQ2xvdWRXYXRjaCBMb2cgR3JvdXBcbiAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBMb2dHcm91cCh0aGlzLCBgJHtuYW1lfUxvZ0dyb3VwYCwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBgL2F3cy9sYW1iZGEvJHtmdW5jdGlvbk5hbWV9YCxcbiAgICAgIHJldGVudGlvbjogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJldGVudGlvbkRheXMuT05FX01PTlRIIDogUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBmdW5jdGlvbi1zcGVjaWZpYyByb2xlIGlmIGFkZGl0aW9uYWwgcGVybWlzc2lvbnMgYXJlIG5lZWRlZFxuICAgIGxldCBmdW5jdGlvblJvbGUgPSB0aGlzLmJhc2VSb2xlO1xuICAgIGlmIChhZGRpdGlvbmFsUG9saWN5U3RhdGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBmdW5jdGlvblJvbGUgPSBuZXcgUm9sZSh0aGlzLCBgJHtuYW1lfVJvbGVgLCB7XG4gICAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBgUm9sZSBmb3IgJHtmdW5jdGlvbk5hbWV9YCxcbiAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFWUENBY2Nlc3NFeGVjdXRpb25Sb2xlJyksXG4gICAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FXU1hSYXlEYWVtb25Xcml0ZUFjY2VzcycpLFxuICAgICAgICBdLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBhZGRpdGlvbmFsIHBvbGljaWVzXG4gICAgICBhZGRpdGlvbmFsUG9saWN5U3RhdGVtZW50cy5mb3JFYWNoKHN0YXRlbWVudCA9PiB7XG4gICAgICAgIGZ1bmN0aW9uUm9sZS5hZGRUb1BvbGljeShzdGF0ZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvblxuICAgIGNvbnN0IGxhbWJkYUZ1bmN0aW9uID0gbmV3IExhbWJkYUZ1bmN0aW9uKHRoaXMsIGAke25hbWV9RnVuY3Rpb25gLCB7XG4gICAgICBmdW5jdGlvbk5hbWUsXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzIwX1gsXG4gICAgICBhcmNoaXRlY3R1cmU6IEFyY2hpdGVjdHVyZS5BUk1fNjQsXG4gICAgICBjb2RlOiBDb2RlLmZyb21Bc3NldChjb2RlUGF0aCksXG4gICAgICBoYW5kbGVyLFxuICAgICAgbWVtb3J5U2l6ZSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHModGltZW91dCksXG4gICAgICByb2xlOiBmdW5jdGlvblJvbGUsXG4gICAgICB2cGMsXG4gICAgICBzZWN1cml0eUdyb3VwczogW3NlY3VyaXR5R3JvdXBdLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgLi4udGhpcy5iYXNlRW52aXJvbm1lbnRWYXJpYWJsZXMsXG4gICAgICAgIC4uLmVudmlyb25tZW50VmFyaWFibGVzLFxuICAgICAgfSxcbiAgICAgIHRyYWNpbmc6IFRyYWNpbmcuQUNUSVZFLFxuICAgICAgbG9nZ2luZ0Zvcm1hdDogTG9nZ2luZ0Zvcm1hdC5KU09OLFxuICAgICAgc3lzdGVtTG9nTGV2ZWw6IFN5c3RlbUxvZ0xldmVsLklORk8sXG4gICAgICBhcHBsaWNhdGlvbkxvZ0xldmVsOiBBcHBsaWNhdGlvbkxvZ0xldmVsLklORk8sXG4gICAgICBsb2dHcm91cCxcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0YWdzXG4gICAgVGFncy5vZihsYW1iZGFGdW5jdGlvbikuYWRkKCdOYW1lJywgZnVuY3Rpb25OYW1lKTtcbiAgICBUYWdzLm9mKGxhbWJkYUZ1bmN0aW9uKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuICAgIFRhZ3Mub2YobGFtYmRhRnVuY3Rpb24pLmFkZCgnU2VydmljZScsIG5hbWUpO1xuXG4gICAgLy8gQ3JlYXRlIHZlcnNpb24gYW5kIGFsaWFzIGZvciBibHVlL2dyZWVuIGRlcGxveW1lbnRzXG4gICAgY29uc3QgdmVyc2lvbiA9IG5ldyBWZXJzaW9uKHRoaXMsIGAke25hbWV9VmVyc2lvbmAsIHtcbiAgICAgIGxhbWJkYTogbGFtYmRhRnVuY3Rpb24sXG4gICAgfSk7XG4gICAgY29uc3QgYWxpYXMgPSBuZXcgQWxpYXModGhpcywgYCR7bmFtZX1BbGlhc2AsIHtcbiAgICAgIGFsaWFzTmFtZTogJ2xpdmUnLFxuICAgICAgdmVyc2lvbixcbiAgICB9KTtcblxuICAgIC8vIENvbmZpZ3VyZSBDb2RlRGVwbG95IGNhbmFyeSBkZXBsb3ltZW50IGZvciBzYWZlIHJlbGVhc2VzXG4gICAgbmV3IExhbWJkYURlcGxveW1lbnRHcm91cCh0aGlzLCBgJHtuYW1lfURlcGxveW1lbnRHcm91cGAsIHtcbiAgICAgIGFsaWFzLFxuICAgICAgZGVwbG95bWVudENvbmZpZzogTGFtYmRhRGVwbG95bWVudENvbmZpZy5DQU5BUllfMTBQRVJDRU5UXzVNSU5VVEVTLFxuICAgICAgYXV0b1JvbGxiYWNrOiB7XG4gICAgICAgIGZhaWxlZERlcGxveW1lbnQ6IHRydWUsXG4gICAgICAgIHN0b3BwZWREZXBsb3ltZW50OiB0cnVlLFxuICAgICAgICBkZXBsb3ltZW50SW5BbGFybTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBTdG9yZSBhbGlhcyByZWZlcmVuY2Ugc28gQVBJIEdhdGV3YXkgaW50ZWdyYXRlcyB3aXRoIHRoZSBsaXZlIGFsaWFzXG4gICAgdGhpcy5mdW5jdGlvbnMuc2V0KG5hbWUsIGFsaWFzKTtcblxuICAgIHJldHVybiBhbGlhcztcbiAgfVxuXG4gIHB1YmxpYyBnZXRGdW5jdGlvbihuYW1lOiBzdHJpbmcpOiBJRnVuY3Rpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmZ1bmN0aW9ucy5nZXQobmFtZSk7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQXVkaXQoZm46IElGdW5jdGlvbikge1xuICAgIG5ldyBSdWxlKHRoaXMsICdOaWdodGx5SW1hZ2VBdWRpdCcsIHtcbiAgICAgIHNjaGVkdWxlOiBTY2hlZHVsZS5jcm9uKHsgbWludXRlOiAnMCcsIGhvdXI6ICcwJyB9KSxcbiAgICAgIHRhcmdldHM6IFtuZXcgRXZlbnRMYW1iZGFUYXJnZXQoZm4pXSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxGdW5jdGlvbnMoKTogSUZ1bmN0aW9uW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZnVuY3Rpb25zLnZhbHVlcygpKTtcbiAgfVxufSJdfQ==