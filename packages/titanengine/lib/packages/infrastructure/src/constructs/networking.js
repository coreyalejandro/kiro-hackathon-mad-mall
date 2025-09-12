"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkingConstruct = void 0;
const constructs_1 = require("constructs");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class NetworkingConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { environment, cidr = '10.0.0.0/16', maxAzs = 3, enableNatGateway = true, enableFlowLogs = true, } = props;
        // Create VPC with public and private subnets
        this.vpc = new aws_ec2_1.Vpc(this, 'Vpc', {
            ipAddresses: { cidrBlock: cidr },
            maxAzs,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            natGateways: enableNatGateway ? maxAzs : 0,
            natGatewayProvider: enableNatGateway
                ? aws_ec2_1.NatProvider.gateway()
                : undefined,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: aws_ec2_1.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Private',
                    subnetType: aws_ec2_1.SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                    cidrMask: 28,
                    name: 'Isolated',
                    subnetType: aws_ec2_1.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });
        // Add tags to VPC
        aws_cdk_lib_1.Tags.of(this.vpc).add('Name', `madmall-${environment}-vpc`);
        aws_cdk_lib_1.Tags.of(this.vpc).add('Environment', environment);
        // Create VPC Flow Logs
        if (enableFlowLogs) {
            const flowLogGroup = new aws_logs_1.LogGroup(this, 'VpcFlowLogGroup', {
                logGroupName: `/aws/vpc/flowlogs/${environment}`,
                retention: aws_logs_1.RetentionDays.ONE_MONTH,
                removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            });
            this.vpc.addFlowLog('FlowLog', {
                destination: aws_ec2_1.FlowLogDestination.toCloudWatchLogs(flowLogGroup),
                trafficType: aws_ec2_1.FlowLogTrafficType.ALL,
            });
        }
        // Create security groups
        this.createSecurityGroups(environment);
        // Create VPC endpoints for AWS services
        this.createVpcEndpoints();
    }
    createSecurityGroups(environment) {
        // Security group for Lambda functions
        this.lambdaSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'LambdaSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for Lambda functions',
            allowAllOutbound: true,
        });
        aws_cdk_lib_1.Tags.of(this.lambdaSecurityGroup).add('Name', `madmall-${environment}-lambda-sg`);
        // Security group for RDS/DynamoDB access
        this.rdsSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'DatabaseSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for database access',
            allowAllOutbound: false,
        });
        // Allow Lambda to access database
        this.rdsSecurityGroup.addIngressRule(this.lambdaSecurityGroup, aws_ec2_1.Port.tcp(443), 'HTTPS access from Lambda functions');
        aws_cdk_lib_1.Tags.of(this.rdsSecurityGroup).add('Name', `madmall-${environment}-db-sg`);
        // Security group for Application Load Balancer
        this.albSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'AlbSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for Application Load Balancer',
            allowAllOutbound: true,
        });
        // Allow HTTP and HTTPS traffic from internet
        this.albSecurityGroup.addIngressRule(aws_ec2_1.Peer.anyIpv4(), aws_ec2_1.Port.tcp(80), 'HTTP access from internet');
        this.albSecurityGroup.addIngressRule(aws_ec2_1.Peer.anyIpv4(), aws_ec2_1.Port.tcp(443), 'HTTPS access from internet');
        aws_cdk_lib_1.Tags.of(this.albSecurityGroup).add('Name', `madmall-${environment}-alb-sg`);
        // Security group for VPC endpoints
        this.vpcEndpointSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'VpcEndpointSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for VPC endpoints',
            allowAllOutbound: false,
        });
        // Allow HTTPS access from Lambda security group
        this.vpcEndpointSecurityGroup.addIngressRule(this.lambdaSecurityGroup, aws_ec2_1.Port.tcp(443), 'HTTPS access from Lambda functions');
        aws_cdk_lib_1.Tags.of(this.vpcEndpointSecurityGroup).add('Name', `madmall-${environment}-vpce-sg`);
    }
    createVpcEndpoints() {
        // Gateway endpoints (no additional cost)
        new aws_ec2_1.GatewayVpcEndpoint(this, 'S3Endpoint', {
            vpc: this.vpc,
            service: aws_ec2_1.GatewayVpcEndpointAwsService.S3,
        });
        new aws_ec2_1.GatewayVpcEndpoint(this, 'DynamoDbEndpoint', {
            vpc: this.vpc,
            service: aws_ec2_1.GatewayVpcEndpointAwsService.DYNAMODB,
        });
        // Interface endpoints for critical services
        const interfaceEndpoints = [
            { service: aws_ec2_1.InterfaceVpcEndpointAwsService.LAMBDA, name: 'Lambda' },
            { service: aws_ec2_1.InterfaceVpcEndpointAwsService.SECRETS_MANAGER, name: 'SecretsManager' },
            { service: aws_ec2_1.InterfaceVpcEndpointAwsService.KMS, name: 'Kms' },
            { service: aws_ec2_1.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS, name: 'CloudWatchLogs' },
            { service: aws_ec2_1.InterfaceVpcEndpointAwsService.XRAY, name: 'XRay' },
        ];
        interfaceEndpoints.forEach(({ service, name }) => {
            new aws_ec2_1.InterfaceVpcEndpoint(this, `${name}Endpoint`, {
                vpc: this.vpc,
                service,
                securityGroups: [this.vpcEndpointSecurityGroup],
                privateDnsEnabled: true,
                subnets: {
                    subnetType: aws_ec2_1.SubnetType.PRIVATE_WITH_EGRESS,
                },
            });
        });
    }
}
exports.NetworkingConstruct = NetworkingConstruct;
//# sourceMappingURL=networking.js.map