import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkingConstruct } from '../src/constructs/networking';

describe('NetworkingConstruct', () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
  });

  test('creates VPC with correct configuration', () => {
    new NetworkingConstruct(stack, 'TestNetworking', {
      environment: 'test',
      cidr: '10.0.0.0/16',
      maxAzs: 2,
    });

    const template = Template.fromStack(stack);

    // Check VPC creation
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
    });

    // Check subnet creation
    template.resourceCountIs('AWS::EC2::Subnet', 6); // 2 AZs * 3 subnet types

    // Check security groups
    template.resourceCountIs('AWS::EC2::SecurityGroup', 4);
  });

  test('creates VPC endpoints', () => {
    new NetworkingConstruct(stack, 'TestNetworking', {
      environment: 'test',
    });

    const template = Template.fromStack(stack);

    // Check gateway endpoints
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      ServiceName: {
        'Fn::Sub': 'com.amazonaws.${AWS::Region}.s3',
      },
      VpcEndpointType: 'Gateway',
    });

    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      ServiceName: {
        'Fn::Sub': 'com.amazonaws.${AWS::Region}.dynamodb',
      },
      VpcEndpointType: 'Gateway',
    });

    // Check interface endpoints
    template.resourceCountIs('AWS::EC2::VPCEndpoint', 7); // 2 gateway + 5 interface
  });

  test('creates flow logs when enabled', () => {
    new NetworkingConstruct(stack, 'TestNetworking', {
      environment: 'test',
      enableFlowLogs: true,
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::EC2::FlowLog', {
      ResourceType: 'VPC',
      TrafficType: 'ALL',
    });

    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/aws/vpc/flowlogs/test',
    });
  });

  test('disables NAT gateways when specified', () => {
    new NetworkingConstruct(stack, 'TestNetworking', {
      environment: 'test',
      enableNatGateway: false,
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::NatGateway', 0);
  });
});