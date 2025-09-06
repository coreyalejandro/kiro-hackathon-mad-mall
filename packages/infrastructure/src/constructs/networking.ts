import { Construct } from 'constructs';
import {
  Vpc,
  VpcProps,
  SubnetType,
  SecurityGroup,
  Port,
  Peer,
  NatProvider,
  FlowLogDestination,
  FlowLogTrafficType,
  InterfaceVpcEndpoint,
  InterfaceVpcEndpointAwsService,
  GatewayVpcEndpoint,
  GatewayVpcEndpointAwsService,
} from 'aws-cdk-lib/aws-ec2';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { RemovalPolicy, Tags } from 'aws-cdk-lib';

export interface NetworkingConstructProps {
  /**
   * Environment name (dev, staging, prod)
   */
  environment: string;
  
  /**
   * CIDR block for the VPC
   * @default '10.0.0.0/16'
   */
  cidr?: string;
  
  /**
   * Maximum number of AZs to use
   * @default 3
   */
  maxAzs?: number;
  
  /**
   * Whether to create NAT gateways
   * @default true
   */
  enableNatGateway?: boolean;
  
  /**
   * Whether to enable VPC flow logs
   * @default true
   */
  enableFlowLogs?: boolean;
}

export class NetworkingConstruct extends Construct {
  public readonly vpc: Vpc;
  public readonly lambdaSecurityGroup: SecurityGroup;
  public readonly rdsSecurityGroup: SecurityGroup;
  public readonly albSecurityGroup: SecurityGroup;
  public readonly vpcEndpointSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkingConstructProps) {
    super(scope, id);

    const {
      environment,
      cidr = '10.0.0.0/16',
      maxAzs = 3,
      enableNatGateway = true,
      enableFlowLogs = true,
    } = props;

    // Create VPC with public and private subnets
    this.vpc = new Vpc(this, 'Vpc', {
      ipAddresses: { cidrBlock: cidr },
      maxAzs,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: enableNatGateway ? maxAzs : 0,
      natGatewayProvider: enableNatGateway 
        ? NatProvider.gateway() 
        : undefined,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'Isolated',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Add tags to VPC
    Tags.of(this.vpc).add('Name', `madmall-${environment}-vpc`);
    Tags.of(this.vpc).add('Environment', environment);

    // Create VPC Flow Logs
    if (enableFlowLogs) {
      const flowLogGroup = new LogGroup(this, 'VpcFlowLogGroup', {
        logGroupName: `/aws/vpc/flowlogs/${environment}`,
        retention: RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      this.vpc.addFlowLog('FlowLog', {
        destination: FlowLogDestination.toCloudWatchLogs(flowLogGroup),
        trafficType: FlowLogTrafficType.ALL,
      });
    }

    // Create security groups
    this.createSecurityGroups(environment);

    // Create VPC endpoints for AWS services
    this.createVpcEndpoints();
  }

  private createSecurityGroups(environment: string): void {
    // Security group for Lambda functions
    this.lambdaSecurityGroup = new SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,
    });

    Tags.of(this.lambdaSecurityGroup).add('Name', `madmall-${environment}-lambda-sg`);

    // Security group for RDS/DynamoDB access
    this.rdsSecurityGroup = new SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for database access',
      allowAllOutbound: false,
    });

    // Allow Lambda to access database
    this.rdsSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      Port.tcp(443),
      'HTTPS access from Lambda functions'
    );

    Tags.of(this.rdsSecurityGroup).add('Name', `madmall-${environment}-db-sg`);

    // Security group for Application Load Balancer
    this.albSecurityGroup = new SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    // Allow HTTP and HTTPS traffic from internet
    this.albSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      'HTTP access from internet'
    );

    this.albSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(443),
      'HTTPS access from internet'
    );

    Tags.of(this.albSecurityGroup).add('Name', `madmall-${environment}-alb-sg`);

    // Security group for VPC endpoints
    this.vpcEndpointSecurityGroup = new SecurityGroup(this, 'VpcEndpointSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for VPC endpoints',
      allowAllOutbound: false,
    });

    // Allow HTTPS access from Lambda security group
    this.vpcEndpointSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      Port.tcp(443),
      'HTTPS access from Lambda functions'
    );

    Tags.of(this.vpcEndpointSecurityGroup).add('Name', `madmall-${environment}-vpce-sg`);
  }

  private createVpcEndpoints(): void {
    // Gateway endpoints (no additional cost)
    new GatewayVpcEndpoint(this, 'S3Endpoint', {
      vpc: this.vpc,
      service: GatewayVpcEndpointAwsService.S3,
    });

    new GatewayVpcEndpoint(this, 'DynamoDbEndpoint', {
      vpc: this.vpc,
      service: GatewayVpcEndpointAwsService.DYNAMODB,
    });

    // Interface endpoints for critical services
    const interfaceEndpoints = [
      { service: InterfaceVpcEndpointAwsService.LAMBDA, name: 'Lambda' },
      { service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER, name: 'SecretsManager' },
      { service: InterfaceVpcEndpointAwsService.KMS, name: 'Kms' },
      { service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS, name: 'CloudWatchLogs' },
      { service: InterfaceVpcEndpointAwsService.XRAY, name: 'XRay' },
    ];

    interfaceEndpoints.forEach(({ service, name }) => {
      new InterfaceVpcEndpoint(this, `${name}Endpoint`, {
        vpc: this.vpc,
        service,
        securityGroups: [this.vpcEndpointSecurityGroup],
        privateDnsEnabled: true,
        subnets: {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      });
    });
  }
}