import { Construct } from 'constructs';
import { Vpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
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
export declare class NetworkingConstruct extends Construct {
    readonly vpc: Vpc;
    lambdaSecurityGroup: SecurityGroup;
    rdsSecurityGroup: SecurityGroup;
    albSecurityGroup: SecurityGroup;
    vpcEndpointSecurityGroup: SecurityGroup;
    constructor(scope: Construct, id: string, props: NetworkingConstructProps);
    private createSecurityGroups;
    private createVpcEndpoints;
}
