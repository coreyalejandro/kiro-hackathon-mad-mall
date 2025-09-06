import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseConstruct } from '../src/constructs/database';

describe('DatabaseConstruct', () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
  });

  test('creates DynamoDB table with correct configuration', () => {
    new DatabaseConstruct(stack, 'TestDatabase', {
      environment: 'test',
    });

    const template = Template.fromStack(stack);

    // Check table creation
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'madmall-test-main',
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'GSI1PK', AttributeType: 'S' },
        { AttributeName: 'GSI1SK', AttributeType: 'S' },
        { AttributeName: 'GSI2PK', AttributeType: 'S' },
        { AttributeName: 'GSI2SK', AttributeType: 'S' },
        { AttributeName: 'GSI3PK', AttributeType: 'S' },
        { AttributeName: 'GSI3SK', AttributeType: 'S' },
        { AttributeName: 'GSI4PK', AttributeType: 'S' },
        { AttributeName: 'GSI4SK', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
    });
  });

  test('creates Global Secondary Indexes', () => {
    new DatabaseConstruct(stack, 'TestDatabase', {
      environment: 'test',
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'GSI2',
          KeySchema: [
            { AttributeName: 'GSI2PK', KeyType: 'HASH' },
            { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'GSI3',
          KeySchema: [
            { AttributeName: 'GSI3PK', KeyType: 'HASH' },
            { AttributeName: 'GSI3SK', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
        {
          IndexName: 'GSI4',
          KeySchema: [
            { AttributeName: 'GSI4PK', KeyType: 'HASH' },
            { AttributeName: 'GSI4SK', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'INCLUDE',
            NonKeyAttributes: ['entityType', 'status', 'createdAt', 'updatedAt'],
          },
        },
      ],
    });
  });

  test('creates KMS key for encryption', () => {
    new DatabaseConstruct(stack, 'TestDatabase', {
      environment: 'test',
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::KMS::Key', {
      Description: 'KMS key for MADMall test DynamoDB encryption',
      EnableKeyRotation: true,
      KeyUsage: 'ENCRYPT_DECRYPT',
    });
  });

  test('enables point-in-time recovery when specified', () => {
    new DatabaseConstruct(stack, 'TestDatabase', {
      environment: 'test',
      enablePointInTimeRecovery: true,
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true,
      },
    });
  });

  test('enables streams when specified', () => {
    new DatabaseConstruct(stack, 'TestDatabase', {
      environment: 'test',
      enableStreams: true,
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
    });
  });

  test('provides correct access patterns', () => {
    const database = new DatabaseConstruct(stack, 'TestDatabase', {
      environment: 'test',
    });

    const accessPatterns = database.getAccessPatterns();

    expect(accessPatterns).toHaveProperty('getUserById');
    expect(accessPatterns).toHaveProperty('getUserByEmail');
    expect(accessPatterns).toHaveProperty('getCirclesByType');
    expect(accessPatterns).toHaveProperty('getRecentStories');
    expect(accessPatterns).toHaveProperty('getPendingApprovals');
    expect(accessPatterns).toHaveProperty('getTenantUsers');

    expect(accessPatterns.getUserById).toBe('PK = USER#{userId}, SK = PROFILE');
    expect(accessPatterns.getUserByEmail).toBe('GSI1PK = EMAIL#{email}, GSI1SK = USER#{userId}');
  });
});