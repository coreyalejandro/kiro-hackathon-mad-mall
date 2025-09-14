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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29ya2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2luZnJhc3RydWN0dXJlL3NyYy9jb25zdHJ1Y3RzL25ldHdvcmtpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBQ3ZDLGlEQWM2QjtBQUM3QixtREFBK0Q7QUFDL0QsNkNBQWtEO0FBaUNsRCxNQUFhLG1CQUFvQixTQUFRLHNCQUFTO0lBT2hELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBK0I7UUFDdkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEVBQ0osV0FBVyxFQUNYLElBQUksR0FBRyxhQUFhLEVBQ3BCLE1BQU0sR0FBRyxDQUFDLEVBQ1YsZ0JBQWdCLEdBQUcsSUFBSSxFQUN2QixjQUFjLEdBQUcsSUFBSSxHQUN0QixHQUFHLEtBQUssQ0FBQztRQUVWLDZDQUE2QztRQUM3QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksYUFBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDOUIsV0FBVyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBUztZQUN2QyxNQUFNO1lBQ04sa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLGtCQUFrQixFQUFFLGdCQUFnQjtnQkFDbEMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsT0FBTyxFQUFFO2dCQUN2QixDQUFDLENBQUMsU0FBUztZQUNiLG1CQUFtQixFQUFFO2dCQUNuQjtvQkFDRSxRQUFRLEVBQUUsRUFBRTtvQkFDWixJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUUsb0JBQVUsQ0FBQyxNQUFNO2lCQUM5QjtnQkFDRDtvQkFDRSxRQUFRLEVBQUUsRUFBRTtvQkFDWixJQUFJ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QVE7U0FDL0MsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLE1BQU0sa0JBQWtCLEdBQUc7WUFDekIsRUFBRSxPQUFPLEVBQUUsd0NBQThCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDbEUsRUFBRSxPQUFPLEVBQUUsd0NBQThCLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNuRixFQUFFLE9BQU8sRUFBRSx3Q0FBOEIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUM1RCxFQUFFLE9BQU8sRUFBRSx3Q0FBOEIsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ25GLEVBQUUsT0FBTyxFQUFFLHdDQUE4QixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1NBQy9ELENBQUM7UUFFRixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1lBQy9DLElBQUksOEJBQW9CLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxVQUFVLEVBQUU7Z0JBQ2hELEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFDYixPQUFPO2dCQUNQLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztnQkFDL0MsaUJBQWlCLEVBQUUsSUFBSTtnQkFDdkIsT0FBTyxFQUFFO29CQUNQLFVBQVUsRUFBRSxvQkFBVSxDQUFDLG1CQUFtQjtpQkFDM0M7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTFLRCxrREEwS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7XG4gIFZwYyxcbiAgVnBjUHJvcHMsXG4gIFN1Ym5ldFR5cGUsXG4gIFNlY3VyaXR5R3JvdXAsXG4gIFBvcnQsXG4gIFBlZXIsXG4gIE5hdFByb3ZpZGVyLFxuICBGbG93TG9nRGVzdGluYXRpb24sXG4gIEZsb3dMb2dUcmFmZmljVHlwZSxcbiAgSW50ZXJmYWNlVnBjRW5kcG9pbnQsXG4gIEludGVyZmFjZVZwY0VuZHBvaW50QXdzU2VydmljZSxcbiAgR2F0ZXdheVZwY0VuZHBvaW50LFxuICBHYXRld2F5VnBjRW5kcG9pbnRBd3NTZXJ2aWNlLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IExvZ0dyb3VwLCBSZXRlbnRpb25EYXlzIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSwgVGFncyB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuZXhwb3J0IGludGVyZmFjZSBOZXR3b3JraW5nQ29uc3RydWN0UHJvcHMge1xuICAvKipcbiAgICogRW52aXJvbm1lbnQgbmFtZSAoZGV2LCBzdGFnaW5nLCBwcm9kKVxuICAgKi9cbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBDSURSIGJsb2NrIGZvciB0aGUgVlBDXG4gICAqIEBkZWZhdWx0ICcxMC4wLjAuMC8xNidcbiAgICovXG4gIGNpZHI/OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogTWF4aW11bSBudW1iZXIgb2YgQVpzIHRvIHVzZVxuICAgKiBAZGVmYXVsdCAzXG4gICAqL1xuICBtYXhBenM/OiBudW1iZXI7XG4gIFxuICAvKipcbiAgICogV2hldGhlciB0byBjcmVhdGUgTkFUIGdhdGV3YXlzXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGVuYWJsZU5hdEdhdGV3YXk/OiBib29sZWFuO1xuICBcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW5hYmxlIFZQQyBmbG93IGxvZ3NcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgZW5hYmxlRmxvd0xvZ3M/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgTmV0d29ya2luZ0NvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSB2cGM6IFZwYztcbiAgcHVibGljIGxhbWJkYVNlY3VyaXR5R3JvdXA6IFNlY3VyaXR5R3JvdXA7XG4gIHB1YmxpYyByZHNTZWN1cml0eUdyb3VwOiBTZWN1cml0eUdyb3VwO1xuICBwdWJsaWMgYWxiU2VjdXJpdHlHcm91cDogU2VjdXJpdHlHcm91cDtcbiAgcHVibGljIHZwY0VuZHBvaW50U2VjdXJpdHlHcm91cDogU2VjdXJpdHlHcm91cDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTmV0d29ya2luZ0NvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgY2lkciA9ICcxMC4wLjAuMC8xNicsXG4gICAgICBtYXhBenMgPSAzLFxuICAgICAgZW5hYmxlTmF0R2F0ZXdheSA9IHRydWUsXG4gICAgICBlbmFibGVGbG93TG9ncyA9IHRydWUsXG4gICAgfSA9IHByb3BzO1xuXG4gICAgLy8gQ3JlYXRlIFZQQyB3aXRoIHB1YmxpYyBhbmQgcHJpdmF0ZSBzdWJuZXRzXG4gICAgdGhpcy52cGMgPSBuZXcgVnBjKHRoaXMsICdWcGMnLCB7XG4gICAgICBpcEFkZHJlc3NlczogeyBjaWRyQmxvY2s6IGNpZHIgfSBhcyBhbnksXG4gICAgICBtYXhBenMsXG4gICAgICBlbmFibGVEbnNIb3N0bmFtZXM6IHRydWUsXG4gICAgICBlbmFibGVEbnNTdXBwb3J0OiB0cnVlLFxuICAgICAgbmF0R2F0ZXdheXM6IGVuYWJsZU5hdEdhdGV3YXkgPyBtYXhBenMgOiAwLFxuICAgICAgbmF0R2F0ZXdheVByb3ZpZGVyOiBlbmFibGVOYXRHYXRld2F5IFxuICAgICAgICA/IE5hdFByb3ZpZGVyLmdhdGV3YXkoKSBcbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgICAgbmFtZTogJ1B1YmxpYycsXG4gICAgICAgICAgc3VibmV0VHlwZTogU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgICAgbmFtZTogJ1ByaXZhdGUnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGNpZHJNYXNrOiAyOCxcbiAgICAgICAgICBuYW1lOiAnSXNvbGF0ZWQnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURV9JU09MQVRFRCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgdGFncyB0byBWUENcbiAgICBUYWdzLm9mKHRoaXMudnBjKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS12cGNgKTtcbiAgICBUYWdzLm9mKHRoaXMudnBjKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gQ3JlYXRlIFZQQyBGbG93IExvZ3NcbiAgICBpZiAoZW5hYmxlRmxvd0xvZ3MpIHtcbiAgICAgIGNvbnN0IGZsb3dMb2dHcm91cCA9IG5ldyBMb2dHcm91cCh0aGlzLCAnVnBjRmxvd0xvZ0dyb3VwJywge1xuICAgICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL3ZwYy9mbG93bG9ncy8ke2Vudmlyb25tZW50fWAsXG4gICAgICAgIHJldGVudGlvbjogUmV0ZW50aW9uRGF5cy5PTkVfTU9OVEgsXG4gICAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnZwYy5hZGRGbG93TG9nKCdGbG93TG9nJywge1xuICAgICAgICBkZXN0aW5hdGlvbjogRmxvd0xvZ0Rlc3RpbmF0aW9uLnRvQ2xvdWRXYXRjaExvZ3MoZmxvd0xvZ0dyb3VwKSxcbiAgICAgICAgdHJhZmZpY1R5cGU6IEZsb3dMb2dUcmFmZmljVHlwZS5BTEwsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgc2VjdXJpdHkgZ3JvdXBzXG4gICAgdGhpcy5jcmVhdGVTZWN1cml0eUdyb3VwcyhlbnZpcm9ubWVudCk7XG5cbiAgICAvLyBDcmVhdGUgVlBDIGVuZHBvaW50cyBmb3IgQVdTIHNlcnZpY2VzXG4gICAgdGhpcy5jcmVhdGVWcGNFbmRwb2ludHMoKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlU2VjdXJpdHlHcm91cHMoZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIFNlY3VyaXR5IGdyb3VwIGZvciBMYW1iZGEgZnVuY3Rpb25zXG4gICAgdGhpcy5sYW1iZGFTZWN1cml0eUdyb3VwID0gbmV3IFNlY3VyaXR5R3JvdXAodGhpcywgJ0xhbWJkYVNlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGM6IHRoaXMudnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgTGFtYmRhIGZ1bmN0aW9ucycsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgVGFncy5vZih0aGlzLmxhbWJkYVNlY3VyaXR5R3JvdXApLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWxhbWJkYS1zZ2ApO1xuXG4gICAgLy8gU2VjdXJpdHkgZ3JvdXAgZm9yIFJEUy9EeW5hbW9EQiBhY2Nlc3NcbiAgICB0aGlzLnJkc1NlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCAnRGF0YWJhc2VTZWN1cml0eUdyb3VwJywge1xuICAgICAgdnBjOiB0aGlzLnZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIGRhdGFiYXNlIGFjY2VzcycsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiBmYWxzZSxcbiAgICB9KTtcblxuICAgIC8vIEFsbG93IExhbWJkYSB0byBhY2Nlc3MgZGF0YWJhc2VcbiAgICB0aGlzLnJkc1NlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICB0aGlzLmxhbWJkYVNlY3VyaXR5R3JvdXAsXG4gICAgICBQb3J0LnRjcCg0NDMpLFxuICAgICAgJ0hUVFBTIGFjY2VzcyBmcm9tIExhbWJkYSBmdW5jdGlvbnMnXG4gICAgKTtcblxuICAgIFRhZ3Mub2YodGhpcy5yZHNTZWN1cml0eUdyb3VwKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1kYi1zZ2ApO1xuXG4gICAgLy8gU2VjdXJpdHkgZ3JvdXAgZm9yIEFwcGxpY2F0aW9uIExvYWQgQmFsYW5jZXJcbiAgICB0aGlzLmFsYlNlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCAnQWxiU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgIHZwYzogdGhpcy52cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBBcHBsaWNhdGlvbiBMb2FkIEJhbGFuY2VyJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBBbGxvdyBIVFRQIGFuZCBIVFRQUyB0cmFmZmljIGZyb20gaW50ZXJuZXRcbiAgICB0aGlzLmFsYlNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBQZWVyLmFueUlwdjQoKSxcbiAgICAgIFBvcnQudGNwKDgwKSxcbiAgICAgICdIVFRQIGFjY2VzcyBmcm9tIGludGVybmV0J1xuICAgICk7XG5cbiAgICB0aGlzLmFsYlNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBQZWVyLmFueUlwdjQoKSxcbiAgICAgIFBvcnQudGNwKDQ0MyksXG4gICAgICAnSFRUUFMgYWNjZXNzIGZyb20gaW50ZXJuZXQnXG4gICAgKTtcblxuICAgIFRhZ3Mub2YodGhpcy5hbGJTZWN1cml0eUdyb3VwKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hbGItc2dgKTtcblxuICAgIC8vIFNlY3VyaXR5IGdyb3VwIGZvciBWUEMgZW5kcG9pbnRzXG4gICAgdGhpcy52cGNFbmRwb2ludFNlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCAnVnBjRW5kcG9pbnRTZWN1cml0eUdyb3VwJywge1xuICAgICAgdnBjOiB0aGlzLnZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIFZQQyBlbmRwb2ludHMnLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogZmFsc2UsXG4gICAgfSk7XG5cbiAgICAvLyBBbGxvdyBIVFRQUyBhY2Nlc3MgZnJvbSBMYW1iZGEgc2VjdXJpdHkgZ3JvdXBcbiAgICB0aGlzLnZwY0VuZHBvaW50U2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShcbiAgICAgIHRoaXMubGFtYmRhU2VjdXJpdHlHcm91cCxcbiAgICAgIFBvcnQudGNwKDQ0MyksXG4gICAgICAnSFRUUFMgYWNjZXNzIGZyb20gTGFtYmRhIGZ1bmN0aW9ucydcbiAgICApO1xuXG4gICAgVGFncy5vZih0aGlzLnZwY0VuZHBvaW50U2VjdXJpdHlHcm91cCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdnBjZS1zZ2ApO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVWcGNFbmRwb2ludHMoKTogdm9pZCB7XG4gICAgLy8gR2F0ZXdheSBlbmRwb2ludHMgKG5vIGFkZGl0aW9uYWwgY29zdClcbiAgICBuZXcgR2F0ZXdheVZwY0VuZHBvaW50KHRoaXMsICdTM0VuZHBvaW50Jywge1xuICAgICAgdnBjOiB0aGlzLnZwYyxcbiAgICAgIHNlcnZpY2U6IEdhdGV3YXlWcGNFbmRwb2ludEF3c1NlcnZpY2UuUzMsXG4gICAgfSk7XG5cbiAgICBuZXcgR2F0ZXdheVZwY0VuZHBvaW50KHRoaXMsICdEeW5hbW9EYkVuZHBvaW50Jywge1xuICAgICAgdnBjOiB0aGlzLnZwYyxcbiAgICAgIHNlcnZpY2U6IEdhdGV3YXlWcGNFbmRwb2ludEF3c1NlcnZpY2UuRFlOQU1PREIsXG4gICAgfSk7XG5cbiAgICAvLyBJbnRlcmZhY2UgZW5kcG9pbnRzIGZvciBjcml0aWNhbCBzZXJ2aWNlc1xuICAgIGNvbnN0IGludGVyZmFjZUVuZHBvaW50cyA9IFtcbiAgICAgIHsgc2VydmljZTogSW50ZXJmYWNlVnBjRW5kcG9pbnRBd3NTZXJ2aWNlLkxBTUJEQSwgbmFtZTogJ0xhbWJkYScgfSxcbiAgICAgIHsgc2VydmljZTogSW50ZXJmYWNlVnBjRW5kcG9pbnRBd3NTZXJ2aWNlLlNFQ1JFVFNfTUFOQUdFUiwgbmFtZTogJ1NlY3JldHNNYW5hZ2VyJyB9LFxuICAgICAgeyBzZXJ2aWNlOiBJbnRlcmZhY2VWcGNFbmRwb2ludEF3c1NlcnZpY2UuS01TLCBuYW1lOiAnS21zJyB9LFxuICAgICAgeyBzZXJ2aWNlOiBJbnRlcmZhY2VWcGNFbmRwb2ludEF3c1NlcnZpY2UuQ0xPVURXQVRDSF9MT0dTLCBuYW1lOiAnQ2xvdWRXYXRjaExvZ3MnIH0sXG4gICAgICB7IHNlcnZpY2U6IEludGVyZmFjZVZwY0VuZHBvaW50QXdzU2VydmljZS5YUkFZLCBuYW1lOiAnWFJheScgfSxcbiAgICBdO1xuXG4gICAgaW50ZXJmYWNlRW5kcG9pbnRzLmZvckVhY2goKHsgc2VydmljZSwgbmFtZSB9KSA9PiB7XG4gICAgICBuZXcgSW50ZXJmYWNlVnBjRW5kcG9pbnQodGhpcywgYCR7bmFtZX1FbmRwb2ludGAsIHtcbiAgICAgICAgdnBjOiB0aGlzLnZwYyxcbiAgICAgICAgc2VydmljZSxcbiAgICAgICAgc2VjdXJpdHlHcm91cHM6IFt0aGlzLnZwY0VuZHBvaW50U2VjdXJpdHlHcm91cF0sXG4gICAgICAgIHByaXZhdGVEbnNFbmFibGVkOiB0cnVlLFxuICAgICAgICBzdWJuZXRzOiB7XG4gICAgICAgICAgc3VibmV0VHlwZTogU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn0iXX0=