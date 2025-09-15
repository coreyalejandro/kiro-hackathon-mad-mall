import { Construct } from 'constructs';
import {
  Function as LambdaFunction,
  IFunction,
  Runtime,
  Code,
  Architecture,
  Tracing,
  LoggingFormat,
  SystemLogLevel,
  ApplicationLogLevel,
} from 'aws-cdk-lib/aws-lambda';
import {
  Role,
  ServicePrincipal,
  PolicyStatement,
  Effect,
  ManagedPolicy,
} from 'aws-cdk-lib/aws-iam';
import { Vpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Key } from 'aws-cdk-lib/aws-kms';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Duration, RemovalPolicy, Tags } from 'aws-cdk-lib';
import { LambdaDeploymentConfig, LambdaDeploymentGroup } from 'aws-cdk-lib/aws-codedeploy';
import { Alias, Version } from 'aws-cdk-lib/aws-lambda';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction as EventLambdaTarget } from 'aws-cdk-lib/aws-events-targets';

export interface LambdaConstructProps {
  /**
   * Environment name (dev, staging, prod)
   */
  environment: string;
  
  /**
   * VPC for Lambda functions
   */
  vpc: Vpc;
  
  /**
   * Security group for Lambda functions
   */
  securityGroup: SecurityGroup;
  
  /**
   * DynamoDB table for data access
   */
  dynamoTable: Table;
  
  /**
   * KMS key for encryption
   */
  kmsKey: Key;
  
  /**
   * Additional environment variables
   */
  additionalEnvironmentVariables?: Record<string, string>;
}

export interface LambdaFunctionConfig {
  /**
   * Function name suffix
   */
  name: string;
  
  /**
   * Function description
   */
  description: string;
  
  /**
   * Path to the function code
   */
  codePath: string;
  
  /**
   * Function handler
   */
  handler: string;
  
  /**
   * Memory allocation in MB
   * @default 512
   */
  memorySize?: number;
  
  /**
   * Timeout in seconds
   * @default 30
   */
  timeout?: number;
  
  /**
   * Additional IAM policy statements
   */
  additionalPolicyStatements?: PolicyStatement[];
  
  /**
   * Function-specific environment variables
   */
  environmentVariables?: Record<string, string>;
}

export class LambdaConstruct extends Construct {
  public readonly functions: Map<string, IFunction> = new Map();
  private readonly concreteFunctions: Map<string, LambdaFunction> = new Map();
  private readonly baseRole: Role;
  private readonly baseEnvironmentVariables: Record<string, string>;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const {
      environment,
      vpc,
      securityGroup,
      dynamoTable,
      kmsKey,
      additionalEnvironmentVariables = {},
    } = props;

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

  private createBaseLambdaRole(environment: string, dynamoTable: Table, kmsKey: Key): Role {
    const role = new Role(this, 'BaseLambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      description: `Base role for MADMall ${environment} Lambda functions`,
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
      ],
    });

    // DynamoDB permissions
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
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
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
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
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
      ],
      resources: [`arn:aws:secretsmanager:*:*:secret:madmall/${environment}/*`],
    }));

    // CloudWatch Logs permissions
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: [`arn:aws:logs:*:*:log-group:/aws/lambda/madmall-${environment}-*`],
    }));

    // Bedrock permissions
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
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

    Tags.of(role).add('Name', `madmall-${environment}-lambda-base-role`);
    Tags.of(role).add('Environment', environment);

    return role;
  }

  private createCommonFunctions(environment: string, vpc: Vpc, securityGroup: SecurityGroup): void {
    const commonFunctions: LambdaFunctionConfig[] = [
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

  public createFunction(
    config: LambdaFunctionConfig,
    environment: string,
    vpc: Vpc,
    securityGroup: SecurityGroup
  ): IFunction {
    const {
      name,
      description,
      codePath,
      handler,
      memorySize = 512,
      timeout = 30,
      additionalPolicyStatements = [],
      environmentVariables = {},
    } = config;

    const functionName = `madmall-${environment}-${name}`;

    // Create CloudWatch Log Group
    const logGroup = new LogGroup(this, `${name}LogGroup`, {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: environment === 'prod' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create function-specific role if additional permissions are needed
    let functionRole = this.baseRole;
    if (additionalPolicyStatements.length > 0) {
      functionRole = new Role(this, `${name}Role`, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: `Role for ${functionName}`,
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
          ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
        ],
      });

      // Add additional policies
      additionalPolicyStatements.forEach(statement => {
        functionRole.addToPolicy(statement);
      });
    }

    // Create Lambda function
    const lambdaFunction = new LambdaFunction(this, `${name}Function`, {
      functionName,
      description,
      runtime: Runtime.NODEJS_20_X,
      architecture: Architecture.ARM_64,
      code: Code.fromAsset(codePath),
      handler,
      memorySize,
      timeout: Duration.seconds(timeout),
      role: functionRole,
      vpc,
      securityGroups: [securityGroup],
      environment: {
        ...this.baseEnvironmentVariables,
        ...environmentVariables,
      },
      tracing: Tracing.ACTIVE,
      loggingFormat: LoggingFormat.JSON,
      systemLogLevel: SystemLogLevel.INFO,
      applicationLogLevel: ApplicationLogLevel.INFO,
      logGroup,
    });

    // Add tags
    Tags.of(lambdaFunction).add('Name', functionName);
    Tags.of(lambdaFunction).add('Environment', environment);
    Tags.of(lambdaFunction).add('Service', name);

    // Create version and alias for blue/green deployments
    const version = new Version(this, `${name}Version`, {
      lambda: lambdaFunction,
    });
    const alias = new Alias(this, `${name}Alias`, {
      aliasName: 'live',
      version,
    });

    // Configure CodeDeploy canary deployment for safe releases
    new LambdaDeploymentGroup(this, `${name}DeploymentGroup`, {
      alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
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

  public getFunction(name: string): IFunction | undefined {
    return this.functions.get(name);
  }

  private scheduleAudit(fn: IFunction) {
    new Rule(this, 'NightlyImageAudit', {
      schedule: Schedule.cron({ minute: '0', hour: '0' }),
      targets: [new EventLambdaTarget(fn)],
    });
  }

  public getAllFunctions(): IFunction[] {
    return Array.from(this.functions.values());
  }

  public getAllConcreteFunctions(): LambdaFunction[] {
    return Array.from(this.concreteFunctions.values());
  }
}