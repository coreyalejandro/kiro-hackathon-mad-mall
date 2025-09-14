# DynamoDB Data Layer

This directory contains the complete DynamoDB data layer implementation for the MADMall platform, featuring a single-table design with comprehensive CRUD operations, data validation, and migration utilities.

## Architecture Overview

### Single-Table Design

The implementation uses DynamoDB's single-table design pattern for optimal performance and cost efficiency:

- **Primary Table**: `madmall-{environment}-main`
- **Partition Key (PK)**: Entity identifier with type prefix
- **Sort Key (SK)**: Entity metadata or relationship identifier
- **Global Secondary Indexes (GSI1-GSI4)**: Alternate access patterns

### Key Patterns

```typescript
// User patterns
USER#${userId} | PROFILE                    // User profile data
USER#${userId} | CIRCLE#${circleId}        // User's circle memberships

// Circle patterns  
CIRCLE#${circleId} | METADATA              // Circle metadata
CIRCLE#${circleId} | MEMBER#${userId}      // Circle member relationships

// Story patterns
STORY#${storyId} | METADATA                // Story content and metadata
STORY#${storyId} | COMMENT#${commentId}    // Story comments

// Business patterns
BUSINESS#${businessId} | METADATA          // Business profile data

// Resource patterns
RESOURCE#${resourceId} | METADATA          // Resource content and metadata
```

### Global Secondary Indexes

1. **GSI1**: Alternate key lookups (email, type-based queries)
2. **GSI2**: Time-based queries and feeds
3. **GSI3**: Status-based filtering
4. **GSI4**: Multi-tenant data isolation

## Core Components

### 1. DynamoDB Service (`dynamodb-service.ts`)

Central service managing DynamoDB connections and operations:

```typescript
const service = new DynamoDBService({
  region: 'us-east-1',
  tableName: 'madmall-prod-main',
  maxRetries: 5,
  timeout: 5000,
  connectionPoolSize: 100,
});

// Health check
const isHealthy = await service.healthCheck();

// Get metrics
const metrics = service.getMetrics();
```

**Features:**
- Connection pooling and management
- Automatic retry logic with exponential backoff
- Comprehensive error handling and logging
- Performance metrics and monitoring
- Support for transactions and batch operations

### 2. Base DAO (`base-dao.ts`)

Abstract base class providing common CRUD operations:

```typescript
abstract class BaseDynamoDAO<T extends BaseEntity> {
  async create(item: Omit<T, 'createdAt' | 'updatedAt' | 'version'>): Promise<T>
  async getById(pk: string, sk: string): Promise<T | null>
  async update(pk: string, sk: string, updates: Partial<T>): Promise<T>
  async delete(pk: string, sk: string): Promise<void>
  async query(pk: string, options?: QueryOptions): Promise<QueryResult<T>>
  async queryGSI(indexName: string, pk: string, sk?: string): Promise<QueryResult<T>>
  async batchGet(keys: Array<{pk: string; sk: string}>): Promise<T[]>
  async batchWrite(items: T[]): Promise<void>
  async transaction(items: TransactionItem[]): Promise<void>
}
```

**Features:**
- Optimistic locking with version control
- Automatic timestamp management
- Data validation integration
- Batch operation support
- Transaction support

### 3. Entity-Specific DAOs

#### User DAO (`user-dao.ts`)

```typescript
const userDAO = new UserDynamoDAO(dynamoService);

// Create user
const user = await userDAO.create({
  userId: 'user123',
  email: 'user@example.com',
  profile: { /* profile data */ },
  preferences: { /* preferences */ },
  settings: { /* settings */ },
});

// Get by email
const user = await userDAO.getByEmail('user@example.com');

// Get user's circles
const circles = await userDAO.getUserCircles('user123');

// Update activity
await userDAO.updateLastActive('user123');

// Increment stats
await userDAO.incrementStats('user123', {
  storiesShared: 1,
  helpfulVotes: 5,
});
```

#### Circle DAO (`circle-dao.ts`)

```typescript
const circleDAO = new CircleDynamoDAO(dynamoService);

// Create circle
const circle = await circleDAO.create({
  circleId: 'circle123',
  name: 'Support Circle',
  type: 'support_group',
  createdBy: 'user123',
  /* other fields */
});

// Add member
await circleDAO.addMember('circle123', 'user456', 'member');

// Get members
const members = await circleDAO.getMembers('circle123');

// Update stats
await circleDAO.updateStats('circle123', {
  memberCount: 1,
  postsThisWeek: 5,
});
```

### 4. Query Builder (`query-builder.ts`)

Fluent interface for building complex DynamoDB queries:

```typescript
const query = QueryBuilder
  .byPartitionKey('PK', 'USER#user123')
  .beginsWith('SK', 'CIRCLE#')
  .filterCondition('status', 'EQ', 'active')
  .project('circleId', 'role', 'joinedAt')
  .limit(20)
  .sortDesc()
  .build();

const result = await dynamoService.query(query.keyConditionExpression, query);
```

### 5. Data Validation (`validation.ts`)

Comprehensive validation for all entity types:

```typescript
// Validate user entity
const validation = DataValidator.validateUser(user);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
}

// Validate DynamoDB keys
const keyValidation = DataValidator.validateKeys(entity);

// Validate data consistency
const consistencyValidation = DataValidator.validateConsistency(entity);
```

## Migration System

### Migration Service (`migration-service.ts`)

Comprehensive data migration from existing systems:

```typescript
const migrationService = new MigrationService(dynamoService);
const sqliteSource = new SQLiteDataSource('./data.sqlite');

migrationService.setDataSource(sqliteSource);

const plan = MigrationService.createMADMallMigrationPlan();
const config: MigrationConfig = {
  sourceType: 'sqlite',
  targetTable: 'madmall-prod-main',
  batchSize: 25,
  parallelism: 4,
  dryRun: false,
  validateData: true,
  backupBeforeMigration: true,
  continueOnError: false,
  logLevel: 'info',
};

const results = await migrationService.executeMigrationPlan(plan, config);
```

### SQLite Data Source (`sqlite-data-source.ts`)

Data source implementation for migrating from SQLite:

```typescript
const dataSource = new SQLiteDataSource('./titanEngine.sqlite');

// Analyze existing structure
const analysis = await dataSource.analyzeDatabaseStructure();

// Get suggested mappings
console.log(analysis.suggestedMappings);

// Export data for backup
const userData = await dataSource.exportTableToJSON('users');
```

### Pre-built Migration Mappings

The system includes pre-configured mappings for MADMall entities:

```typescript
// Available in migration-types.ts
const mappings = MADMallMigrationMappings;

// Includes mappings for:
// - users -> DynamoDBUser
// - circles -> DynamoDBCircle  
// - stories -> DynamoDBStory
// - businesses -> DynamoDBBusiness
// - resources -> DynamoDBResource
```

## Usage Examples

### Setting Up the DAO Factory

```typescript
import { createDAOFactory } from './dao';

// Environment-specific setup
const daoFactory = createDAOFactory('production');

// Custom configuration
const customFactory = createCustomDAOFactory({
  region: 'us-west-2',
  tableName: 'custom-table',
  endpoint: 'http://localhost:8000', // For local development
});

// Access DAOs
const { userDAO, circleDAO } = daoFactory;
```

### Creating and Managing Users

```typescript
// Create new user
const newUser = await userDAO.create({
  userId: generateId(),
  email: 'jane@example.com',
  profile: {
    firstName: 'Jane',
    lastName: 'Smith',
    culturalBackground: ['Latina'],
    communicationStyle: 'gentle_encouraging',
    diagnosisStage: 'managing_well',
    supportNeeds: ['emotional_support', 'health_education'],
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  preferences: {
    profileVisibility: 'circles_only',
    emailNotifications: true,
    // ... other preferences
  },
  settings: {
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',
    accessibility: {
      highContrast: false,
      largeText: true,
      screenReader: false,
      reducedMotion: false,
    },
  },
  primaryGoals: ['emotional_support', 'community_connection'],
  isVerified: false,
  isActive: true,
});

// Update user profile
await userDAO.updateProfile(newUser.userId, {
  bio: 'Wellness advocate and community supporter',
  supportNeeds: ['emotional_support', 'health_education', 'stress_relief'],
});

// Track user activity
await userDAO.updateLastActive(newUser.userId);
await userDAO.incrementStats(newUser.userId, {
  storiesShared: 1,
  helpfulVotes: 3,
});
```

### Managing Circles and Memberships

```typescript
// Create support circle
const circle = await circleDAO.create({
  circleId: generateId(),
  name: 'Newly Diagnosed Support',
  description: 'A safe space for those newly diagnosed',
  type: 'support_group',
  privacyLevel: 'private',
  settings: {
    isPrivate: true,
    requireApproval: true,
    maxMembers: 50,
    culturalFocus: ['African American', 'Latina'],
    moderationLevel: 'moderate',
  },
  moderators: [],
  tags: ['support', 'newly-diagnosed', 'cultural-competent'],
  stats: {
    memberCount: 0,
    activeMembers: 0,
    postsThisWeek: 0,
    postsThisMonth: 0,
    engagementRate: 0,
    averageResponseTime: 0,
  },
  createdBy: newUser.userId,
  isActive: true,
  status: 'ACTIVE',
});

// Add members
await circleDAO.addMember(circle.circleId, 'user456', 'member');
await circleDAO.addMember(circle.circleId, 'user789', 'moderator');

// Get circle members
const members = await circleDAO.getMembers(circle.circleId);

// Update circle statistics
await circleDAO.updateStats(circle.circleId, {
  postsThisWeek: 5,
  engagementRate: 0.85,
});
```

### Complex Queries

```typescript
// Search users by criteria
const users = await userDAO.searchUsers({
  culturalBackground: ['African American', 'Latina'],
  diagnosisStage: 'newly_diagnosed',
  supportNeeds: ['emotional_support'],
  location: { state: 'CA', country: 'US' },
}, {
  limit: 20,
  scanIndexForward: false, // Most recent first
});

// Get active circles by type
const supportCircles = await circleDAO.getByType('support_group', {
  filterExpression: '#isActive = :active',
  expressionAttributeNames: { '#isActive': 'isActive' },
  expressionAttributeValues: { ':active': true },
  limit: 10,
});

// Get user's circle memberships
const userCircles = await userDAO.getUserCircles('user123', {
  filterExpression: '#status = :status',
  expressionAttributeNames: { '#status': 'status' },
  expressionAttributeValues: { ':status': 'active' },
});
```

### Batch Operations

```typescript
// Batch get multiple users
const userIds = ['user1', 'user2', 'user3'];
const keys = userIds.map(id => ({ pk: `USER#${id}`, sk: 'PROFILE' }));
const users = await userDAO.batchGet(keys);

// Batch create multiple entities
const newUsers = [user1, user2, user3];
await userDAO.batchWrite(newUsers);
```

### Transactions

```typescript
// Transfer circle ownership
await circleDAO.transaction([
  {
    operation: 'update',
    key: { PK: `CIRCLE#${circleId}`, SK: 'METADATA' },
    updateExpression: 'SET createdBy = :newOwner',
    expressionAttributeValues: { ':newOwner': newOwnerId },
  },
  {
    operation: 'update', 
    key: { PK: `CIRCLE#${circleId}`, SK: `MEMBER#${oldOwnerId}` },
    updateExpression: 'SET #role = :role',
    expressionAttributeNames: { '#role': 'role' },
    expressionAttributeValues: { ':role': 'member' },
  },
  {
    operation: 'update',
    key: { PK: `CIRCLE#${circleId}`, SK: `MEMBER#${newOwnerId}` },
    updateExpression: 'SET #role = :role',
    expressionAttributeNames: { '#role': 'role' },
    expressionAttributeValues: { ':role': 'admin' },
  },
]);
```

## Performance Considerations

### Indexing Strategy

- **GSI1**: Email lookups, type-based queries
- **GSI2**: Time-based feeds and activity streams  
- **GSI3**: Status filtering and moderation queues
- **GSI4**: Multi-tenant data isolation

### Query Optimization

1. **Use specific partition keys** to avoid scans
2. **Leverage sort key patterns** for range queries
3. **Project only needed attributes** to reduce costs
4. **Use consistent read** only when necessary
5. **Implement pagination** for large result sets

### Cost Optimization

- **On-demand billing** for variable workloads
- **Provisioned capacity** for predictable traffic
- **Proper TTL usage** for temporary data
- **Efficient batch operations** to reduce API calls

## Monitoring and Observability

### Metrics Available

```typescript
const metrics = daoFactory.getMetrics();
console.log({
  activeConnections: metrics.activeConnections,
  totalRequests: metrics.totalRequests,
  successfulRequests: metrics.successfulRequests,
  failedRequests: metrics.failedRequests,
  averageLatency: metrics.averageLatency,
});
```

### Health Checks

```typescript
const isHealthy = await daoFactory.healthCheck();
if (!isHealthy) {
  console.error('DynamoDB connection unhealthy');
}
```

### Error Handling

All DAOs include comprehensive error handling with:
- Detailed error context and logging
- Retry logic for transient failures
- Validation error reporting
- Performance impact tracking

## Testing

### Unit Tests

```bash
# Run DAO tests
npm test -- --testPathPattern=dao

# Run specific DAO tests
npm test -- user-dao.test.ts
```

### Integration Tests

```bash
# Run with local DynamoDB
npm run test:integration
```

### Test Utilities

```typescript
// Mock DAO factory for testing
const mockFactory = createTestDAOFactory();
const mockUserDAO = mockFactory.userDAO;

// Verify operations
expect(mockUserDAO.create).toHaveBeenCalledWith(expectedUser);
```

## Migration Guide

### From Existing Systems

1. **Analyze source data structure**
2. **Configure migration mappings**
3. **Run validation and dry-run**
4. **Execute migration with monitoring**
5. **Verify data integrity**
6. **Update application connections**

### Example Migration

```typescript
// 1. Setup migration
const migrationService = new MigrationService(dynamoService);
const sqliteSource = new SQLiteDataSource('./legacy.db');

// 2. Analyze structure
const analysis = await sqliteSource.analyzeDatabaseStructure();

// 3. Execute migration
const results = await migrationService.executeMigrationPlan(
  MigrationService.createMADMallMigrationPlan(),
  migrationConfig
);

// 4. Verify results
results.forEach(result => {
  console.log(`${result.entityType}: ${result.successfulRecords}/${result.totalRecords} migrated`);
});
```

## Best Practices

### Data Modeling

1. **Design for access patterns** not normalization
2. **Use composite keys** for relationships
3. **Leverage GSIs** for alternate access patterns
4. **Implement proper TTL** for temporary data
5. **Plan for multi-tenancy** from the start

### Performance

1. **Batch operations** when possible
2. **Use projection expressions** to limit data transfer
3. **Implement caching** for frequently accessed data
4. **Monitor and optimize** query patterns
5. **Use consistent read** judiciously

### Security

1. **Encrypt data at rest** using KMS
2. **Use IAM roles** for access control
3. **Implement field-level encryption** for sensitive data
4. **Audit access patterns** and permissions
5. **Follow least privilege** principles

### Reliability

1. **Implement circuit breakers** for fault tolerance
2. **Use exponential backoff** for retries
3. **Monitor error rates** and latency
4. **Plan for disaster recovery**
5. **Test failure scenarios** regularly