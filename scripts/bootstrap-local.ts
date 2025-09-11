import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, ResourceInUseException, UpdateTableCommand } from '@aws-sdk/client-dynamodb';
// eslint-disable-next-line import/no-extraneous-dependencies
import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const localstackUrl = process.env.LOCALSTACK_URL || 'http://localhost:4566';
const environment = process.env.ENVIRONMENT || 'development';

const tableName = process.env.DYNAMODB_TABLE_NAME || `madmall-${environment}-main`;
const contentBucket = process.env.USER_CONTENT_BUCKET || `madmall-${environment}-user-content`;

function createDynamoClient() {
  return new DynamoDBClient({ region, endpoint: localstackUrl });
}

function createS3Client() {
  return new S3Client({ region, endpoint: localstackUrl, forcePathStyle: true });
}

async function ensureDynamoTable(): Promise<void> {
  const dynamo = createDynamoClient();

  try {
    await dynamo.send(new DescribeTableCommand({ TableName: tableName }));
    // Table exists: ensure GSIs exist with expected names
    const gsiNames = ['GSI1', 'GSI2', 'GSI3', 'GSI4'];
    // Describe again to read indexes
    const desc = await dynamo.send(new DescribeTableCommand({ TableName: tableName }));
    const existing = new Set((desc.Table?.GlobalSecondaryIndexes || []).map((i: any) => i.IndexName as string));
    const missing = gsiNames.filter(n => !existing.has(n));
    if (missing.length > 0) {
      for (const indexName of missing) {
        await dynamo.send(new UpdateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: `${indexName}PK`, AttributeType: 'S' },
            { AttributeName: `${indexName}SK`, AttributeType: 'S' },
          ],
          GlobalSecondaryIndexUpdates: [
            {
              Create: {
                IndexName: indexName,
                KeySchema: [
                  { AttributeName: `${indexName}PK`, KeyType: 'HASH' },
                  { AttributeName: `${indexName}SK`, KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: indexName === 'GSI3' ? 'KEYS_ONLY' : (indexName === 'GSI4' ? 'INCLUDE' : 'ALL'), NonKeyAttributes: indexName === 'GSI4' ? ['SomeNonKeyAttribute'] : undefined },
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
              },
            },
          ],
        }));
        // eslint-disable-next-line no-console
        console.log(`Added missing index ${indexName} on ${tableName}`);
      }
    }
    // eslint-disable-next-line no-console
    console.log(`DynamoDB table ${tableName} already exists`);
    return;
  } catch (err: any) {
    if (err?.name !== 'ResourceNotFoundException') {
      // eslint-disable-next-line no-console
      console.warn('DescribeTable failed, proceeding to create if needed:', err?.message || err);
    }
  }

  try {
    await dynamo.send(new CreateTableCommand({
      TableName: tableName,
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
          Projection: { ProjectionType: 'INCLUDE', NonKeyAttributes: ['SomeNonKeyAttribute'] },
        },
      ],
    }));
    // eslint-disable-next-line no-console
    console.log(`Created DynamoDB table ${tableName}`);
  } catch (err: any) {
    if (!(err instanceof ResourceInUseException)) {
      throw err;
    }
  }
}

async function ensureBucket(): Promise<void> {
  const s3 = createS3Client();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: contentBucket }));
    // eslint-disable-next-line no-console
    console.log(`S3 bucket ${contentBucket} already exists`);
    return;
  } catch {
    // continue to create
  }

  await s3.send(new CreateBucketCommand({ Bucket: contentBucket }));
  // eslint-disable-next-line no-console
  console.log(`Created S3 bucket ${contentBucket}`);
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('Bootstrapping Local AWS resources via LocalStack...');
  await ensureDynamoTable();
  await ensureBucket();
  // eslint-disable-next-line no-console
  console.log('Bootstrap complete');
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Bootstrap failed:', err);
  process.exit(1);
});

