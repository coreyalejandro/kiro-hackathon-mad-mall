import { Construct } from 'constructs';
import {
  Table,
  TableProps,
  AttributeType,
  BillingMode,
  ProjectionType,
  StreamViewType,
  PointInTimeRecoveryProps,
} from 'aws-cdk-lib/aws-dynamodb';
import { Key, KeySpec, KeyUsage } from 'aws-cdk-lib/aws-kms';
import { RemovalPolicy, Tags } from 'aws-cdk-lib';

export interface DatabaseConstructProps {
  /**
   * Environment name (dev, staging, prod)
   */
  environment: string;
  
  /**
   * Whether to enable point-in-time recovery
   * @default true
   */
  enablePointInTimeRecovery?: boolean;
  
  /**
   * Whether to enable DynamoDB streams
   * @default true
   */
  enableStreams?: boolean;
  
  /**
   * Removal policy for the table
   * @default RemovalPolicy.RETAIN for prod, RemovalPolicy.DESTROY for others
   */
  removalPolicy?: RemovalPolicy;
}

export class DatabaseConstruct extends Construct {
  public readonly mainTable: Table;
  public readonly kmsKey: Key;

  constructor(scope: Construct, id: string, props: DatabaseConstructProps) {
    super(scope, id);

    const {
      environment,
      enablePointInTimeRecovery = true,
      enableStreams = true,
      removalPolicy = environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    } = props;

    // Create KMS key for DynamoDB encryption
    this.kmsKey = new Key(this, 'DatabaseKmsKey', {
      description: `KMS key for MADMall ${environment} DynamoDB encryption`,
      keyUsage: KeyUsage.ENCRYPT_DECRYPT,
      keySpec: KeySpec.SYMMETRIC_DEFAULT,
      enableKeyRotation: true,
      removalPolicy,
    });

    Tags.of(this.kmsKey).add('Name', `madmall-${environment}-dynamodb-key`);
    Tags.of(this.kmsKey).add('Environment', environment);

    // Create the main DynamoDB table with single-table design
    this.mainTable = new Table(this, 'MainTable', {
      tableName: `madmall-${environment}-main`,
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: {
        kmsKey: this.kmsKey,
      },
      pointInTimeRecovery: enablePointInTimeRecovery,
      stream: enableStreams ? StreamViewType.NEW_AND_OLD_IMAGES : undefined,
      removalPolicy,
      deletionProtection: environment === 'prod',
    });

    // Add Global Secondary Indexes (GSIs)
    this.addGlobalSecondaryIndexes();

    // Add tags
    Tags.of(this.mainTable).add('Name', `madmall-${environment}-main-table`);
    Tags.of(this.mainTable).add('Environment', environment);
    Tags.of(this.mainTable).add('Purpose', 'Single-table design for MADMall platform');
  }

  private addGlobalSecondaryIndexes(): void {
    // GSI1: For alternate access patterns (e.g., email lookups, type-based queries)
    this.mainTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'GSI1PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    });

    // GSI2: For time-based queries and sorting
    this.mainTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: {
        name: 'GSI2PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI2SK',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    });

    // GSI3: For status-based queries and filtering
    this.mainTable.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: {
        name: 'GSI3PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI3SK',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.KEYS_ONLY,
    });

    // GSI4: For tenant-based queries (multi-tenancy support)
    this.mainTable.addGlobalSecondaryIndex({
      indexName: 'GSI4',
      partitionKey: {
        name: 'GSI4PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI4SK',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: ['entityType', 'status', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Get access patterns documentation for the single-table design
   */
  public getAccessPatterns(): Record<string, string> {
    return {
      // Primary table access patterns
      'getUserById': 'PK = USER#{userId}, SK = PROFILE',
      'getUserCircles': 'PK = USER#{userId}, SK begins_with CIRCLE#',
      'getCircleById': 'PK = CIRCLE#{circleId}, SK = METADATA',
      'getCircleMembers': 'PK = CIRCLE#{circleId}, SK begins_with MEMBER#',
      'getStoryById': 'PK = STORY#{storyId}, SK = METADATA',
      'getStoryComments': 'PK = STORY#{storyId}, SK begins_with COMMENT#',
      'getBusinessById': 'PK = BUSINESS#{businessId}, SK = METADATA',
      'getResourceById': 'PK = RESOURCE#{resourceId}, SK = METADATA',
      
      // GSI1 access patterns (alternate keys)
      'getUserByEmail': 'GSI1PK = EMAIL#{email}, GSI1SK = USER#{userId}',
      'getCirclesByType': 'GSI1PK = CIRCLE_TYPE#{type}, GSI1SK = CREATED#{createdAt}',
      'getBusinessesByCategory': 'GSI1PK = BUSINESS_CATEGORY#{category}, GSI1SK = NAME#{name}',
      'getResourcesByType': 'GSI1PK = RESOURCE_TYPE#{type}, GSI1SK = CREATED#{createdAt}',
      
      // GSI2 access patterns (time-based)
      'getRecentStories': 'GSI2PK = STORY_FEED, GSI2SK = CREATED#{createdAt}',
      'getUserActivity': 'GSI2PK = USER_ACTIVITY#{userId}, GSI2SK = TIMESTAMP#{timestamp}',
      'getCircleActivity': 'GSI2PK = CIRCLE_ACTIVITY#{circleId}, GSI2SK = TIMESTAMP#{timestamp}',
      
      // GSI3 access patterns (status-based)
      'getPendingApprovals': 'GSI3PK = STATUS#PENDING, GSI3SK = CREATED#{createdAt}',
      'getActiveCircles': 'GSI3PK = CIRCLE_STATUS#ACTIVE, GSI3SK = UPDATED#{updatedAt}',
      'getPublishedStories': 'GSI3PK = STORY_STATUS#PUBLISHED, GSI3SK = CREATED#{createdAt}',
      
      // GSI4 access patterns (tenant-based)
      'getTenantUsers': 'GSI4PK = TENANT#{tenantId}#USERS, GSI4SK = CREATED#{createdAt}',
      'getTenantCircles': 'GSI4PK = TENANT#{tenantId}#CIRCLES, GSI4SK = CREATED#{createdAt}',
      'getTenantResources': 'GSI4PK = TENANT#{tenantId}#RESOURCES, GSI4SK = CREATED#{createdAt}',
    };
  }
}