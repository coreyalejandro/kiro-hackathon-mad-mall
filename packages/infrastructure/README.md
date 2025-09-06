# MADMall Infrastructure Package

This package contains AWS CDK constructs and stacks for deploying the MADMall platform infrastructure on AWS.

## Overview

The infrastructure package provides enterprise-grade AWS resources including:

- **Networking**: VPC, subnets, security groups, and VPC endpoints
- **Database**: DynamoDB single-table design with GSIs and encryption
- **Compute**: Lambda functions with proper IAM roles and VPC configuration
- **API Gateway**: RESTful API with custom domains, throttling, and CORS
- **Authentication**: Cognito User Pools with MFA and social login support
- **Monitoring**: CloudWatch dashboards, alarms, and X-Ray tracing

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   API Gateway   │    │ Lambda Functions│
│                 │───▶│                 │───▶│                 │
│ Next.js, Mobile │    │ REST API + CORS │    │ Business Logic  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Cognito Auth    │    │   CloudWatch    │    │   DynamoDB      │
│                 │    │                 │    │                 │
│ User Pools + MFA│    │ Monitoring      │    │ Single Table    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

### Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Bootstrap CDK (first time only)
cdk bootstrap
```

### Deployment

```bash
# Deploy to development environment
cdk deploy --context environment=dev

# Deploy to staging environment
cdk deploy --context environment=staging

# Deploy to production environment
cdk deploy --context environment=prod
```

### Environment Configuration

The infrastructure supports three environments with different configurations:

#### Development (`dev`)
- Local development URLs
- Minimal monitoring
- No MFA required
- No social login
- Single AZ deployment

#### Staging (`staging`)
- Staging domain names
- Enhanced monitoring
- Social login enabled
- Multi-AZ deployment
- Production-like configuration

#### Production (`prod`)
- Production domain names
- Full monitoring and alerting
- MFA required
- Social login enabled
- Multi-AZ with high availability
- Enhanced security features

## Constructs

### NetworkingConstruct

Creates VPC infrastructure with:
- Public, private, and isolated subnets
- NAT gateways for outbound internet access
- Security groups with least privilege access
- VPC endpoints for AWS services
- VPC flow logs for security monitoring

```typescript
const networking = new NetworkingConstruct(this, 'Networking', {
  environment: 'prod',
  cidr: '10.0.0.0/16',
  maxAzs: 3,
  enableNatGateway: true,
  enableFlowLogs: true,
});
```

### DatabaseConstruct

Creates DynamoDB infrastructure with:
- Single-table design with multiple GSIs
- KMS encryption at rest
- Point-in-time recovery
- DynamoDB streams for event sourcing
- Backup policies

```typescript
const database = new DatabaseConstruct(this, 'Database', {
  environment: 'prod',
  enablePointInTimeRecovery: true,
  enableStreams: true,
});
```

### LambdaConstruct

Creates Lambda functions with:
- Proper IAM roles and policies
- VPC configuration
- Environment variables
- CloudWatch logging
- X-Ray tracing

```typescript
const lambda = new LambdaConstruct(this, 'Lambda', {
  environment: 'prod',
  vpc: networking.vpc,
  securityGroup: networking.lambdaSecurityGroup,
  dynamoTable: database.mainTable,
  kmsKey: database.kmsKey,
});
```

### ApiGatewayConstruct

Creates API Gateway with:
- RESTful API structure
- Custom domain support
- CORS configuration
- Request throttling
- Usage plans and API keys

```typescript
const apiGateway = new ApiGatewayConstruct(this, 'ApiGateway', {
  environment: 'prod',
  lambdaFunctions: lambda.functions,
  domainName: 'api.madmall.com',
  corsOptions: { allowOrigins: ['https://madmall.com'] },
});
```

### AuthenticationConstruct

Creates Cognito authentication with:
- User pools with custom attributes
- MFA support (SMS and TOTP)
- Social login providers
- Identity pools for AWS resource access
- Custom domains for hosted UI

```typescript
const auth = new AuthenticationConstruct(this, 'Authentication', {
  environment: 'prod',
  customDomain: 'auth.madmall.com',
  callbackUrls: ['https://madmall.com/auth/callback'],
  logoutUrls: ['https://madmall.com/auth/logout'],
  enableSocialLogin: true,
  requireMfa: true,
});
```

### MonitoringConstruct

Creates monitoring infrastructure with:
- CloudWatch dashboards
- Alarms for critical metrics
- SNS notifications
- Log-based metrics
- Cost optimization tracking

```typescript
const monitoring = new MonitoringConstruct(this, 'Monitoring', {
  environment: 'prod',
  lambdaFunctions: lambda.getAllFunctions(),
  restApi: apiGateway.restApi,
  dynamoTable: database.mainTable,
  userPool: auth.userPool,
  alertEmails: ['alerts@madmall.com'],
});
```

## DynamoDB Access Patterns

The single-table design supports the following access patterns:

### Primary Table
- `getUserById`: `PK = USER#{userId}, SK = PROFILE`
- `getUserCircles`: `PK = USER#{userId}, SK begins_with CIRCLE#`
- `getCircleById`: `PK = CIRCLE#{circleId}, SK = METADATA`
- `getCircleMembers`: `PK = CIRCLE#{circleId}, SK begins_with MEMBER#`

### GSI1 (Alternate Keys)
- `getUserByEmail`: `GSI1PK = EMAIL#{email}, GSI1SK = USER#{userId}`
- `getCirclesByType`: `GSI1PK = CIRCLE_TYPE#{type}, GSI1SK = CREATED#{createdAt}`

### GSI2 (Time-based)
- `getRecentStories`: `GSI2PK = STORY_FEED, GSI2SK = CREATED#{createdAt}`
- `getUserActivity`: `GSI2PK = USER_ACTIVITY#{userId}, GSI2SK = TIMESTAMP#{timestamp}`

### GSI3 (Status-based)
- `getPendingApprovals`: `GSI3PK = STATUS#PENDING, GSI3SK = CREATED#{createdAt}`
- `getActiveCircles`: `GSI3PK = CIRCLE_STATUS#ACTIVE, GSI3SK = UPDATED#{updatedAt}`

### GSI4 (Tenant-based)
- `getTenantUsers`: `GSI4PK = TENANT#{tenantId}#USERS, GSI4SK = CREATED#{createdAt}`
- `getTenantCircles`: `GSI4PK = TENANT#{tenantId}#CIRCLES, GSI4SK = CREATED#{createdAt}`

## Security Features

### Network Security
- VPC with private subnets for Lambda functions
- Security groups with least privilege access
- VPC endpoints to avoid internet traffic
- WAF integration for API protection

### Data Security
- KMS encryption for DynamoDB and S3
- Secrets Manager for sensitive configuration
- IAM roles with minimal required permissions
- CloudTrail for audit logging

### Authentication Security
- Cognito User Pools with strong password policies
- MFA support (SMS and TOTP)
- JWT token validation
- Social login with OAuth 2.0

## Monitoring and Alerting

### CloudWatch Dashboards
- API Gateway metrics (requests, latency, errors)
- Lambda function metrics (invocations, duration, errors)
- DynamoDB metrics (read/write capacity, throttles)
- Cognito metrics (sign-ins, sign-ups, failures)

### Alarms
- High error rates (API Gateway and Lambda)
- High latency (API Gateway and Lambda)
- DynamoDB throttling
- Lambda function failures

### Notifications
- SNS topics for alert distribution
- Email notifications for critical alerts
- Slack integration for team notifications

## Cost Optimization

### Resource Optimization
- Lambda functions with ARM64 architecture
- DynamoDB on-demand billing
- S3 Intelligent Tiering
- CloudWatch log retention policies

### Monitoring
- Cost budgets and anomaly detection
- Resource tagging for cost allocation
- Usage plans for API rate limiting
- Auto-scaling policies

## Development

### Local Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build

# Watch for changes
pnpm watch
```

### Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test networking.test.ts
```

### CDK Commands

```bash
# List all stacks
cdk list

# Show differences
cdk diff

# Synthesize CloudFormation template
cdk synth

# Deploy stack
cdk deploy

# Destroy stack
cdk destroy
```

## Troubleshooting

### Common Issues

1. **Bootstrap Error**: Run `cdk bootstrap` in the target AWS account/region
2. **Permission Denied**: Ensure AWS credentials have sufficient permissions
3. **Domain Validation**: Verify domain ownership for custom domains
4. **Resource Limits**: Check AWS service limits for your account

### Debugging

```bash
# Enable CDK debug logging
export CDK_DEBUG=true

# Verbose CDK output
cdk deploy --verbose

# Show CloudFormation events
cdk deploy --events
```

## Contributing

1. Follow the existing code structure and patterns
2. Add unit tests for new constructs
3. Update documentation for new features
4. Use TypeScript strict mode
5. Follow AWS CDK best practices

## License

This project is licensed under the MIT License - see the LICENSE file for details.