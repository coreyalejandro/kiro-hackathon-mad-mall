/**
 * User DAO Tests
 * Unit tests for User DAO implementation
 */

import { UserDynamoDAO } from '../user-dao';
import { DynamoDBService } from '../../services/dynamodb-service';
import { DynamoDBUser } from '@madmall/shared-types/database';

// Mock DynamoDB service
jest.mock('../../services/dynamodb-service');

describe('UserDynamoDAO', () => {
  let userDAO: UserDynamoDAO;
  let mockDynamoService: jest.Mocked<DynamoDBService>;

  beforeEach(() => {
    mockDynamoService = new DynamoDBService({
      region: 'us-east-1',
      tableName: 'test-table',
    }) as jest.Mocked<DynamoDBService>;

    userDAO = new UserDynamoDAO(mockDynamoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with proper keys and timestamps', async () => {
      const userData = {
        userId: 'user123',
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Test user',
          culturalBackground: ['African American'],
          communicationStyle: 'direct_supportive' as const,
          diagnosisStage: 'newly_diagnosed' as const,
          supportNeeds: ['emotional_support'] as const,
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
        preferences: {
          profileVisibility: 'circles_only' as const,
          showRealName: true,
          allowDirectMessages: true,
          shareHealthJourney: true,
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true,
          circleNotifications: true,
          contentPreferences: [],
          circleInterests: [],
        },
        settings: {
          theme: 'auto' as const,
          language: 'en',
          timezone: 'UTC',
          accessibility: {
            highContrast: false,
            largeText: false,
            screenReader: false,
            reducedMotion: false,
          },
        },
        primaryGoals: ['emotional_support'] as const,
        isVerified: false,
        isActive: true,
      };

      const expectedUser: DynamoDBUser = {
        ...userData,
        PK: 'USER#user123',
        SK: 'PROFILE',
        GSI1PK: 'EMAIL#test@example.com',
        GSI1SK: 'USER#user123',
        GSI4PK: 'TENANT#default#USERS',
        GSI4SK: expect.stringMatching(/^CREATED#\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        entityType: 'USER',
        version: 1,
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      };

      mockDynamoService.getItem.mockResolvedValue(null); // No existing user
      mockDynamoService.putItem.mockResolvedValue(expectedUser);

      const result = await userDAO.create(userData);

      expect(mockDynamoService.putItem).toHaveBeenCalledWith(
        expect.objectContaining({
          PK: 'USER#user123',
          SK: 'PROFILE',
          GSI1PK: 'EMAIL#test@example.com',
          GSI1SK: 'USER#user123',
          entityType: 'USER',
          version: 1,
        })
      );

      expect(result).toEqual(expectedUser);
    });

    it('should throw error if user with email already exists', async () => {
      const userData = {
        userId: 'user123',
        email: 'existing@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          culturalBackground: [],
          communicationStyle: 'direct_supportive' as const,
          diagnosisStage: 'newly_diagnosed' as const,
          supportNeeds: [],
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
        preferences: {
          profileVisibility: 'circles_only' as const,
          showRealName: true,
          allowDirectMessages: true,
          shareHealthJourney: true,
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true,
          circleNotifications: true,
          contentPreferences: [],
          circleInterests: [],
        },
        settings: {
          theme: 'auto' as const,
          language: 'en',
          timezone: 'UTC',
          accessibility: {
            highContrast: false,
            largeText: false,
            screenReader: false,
            reducedMotion: false,
          },
        },
        primaryGoals: [],
        isVerified: false,
        isActive: true,
      };

      // Mock existing user
      mockDynamoService.query.mockResolvedValue({
        items: [{ userId: 'existing123', email: 'existing@example.com' }],
        count: 1,
      });

      await expect(userDAO.create(userData)).rejects.toThrow('User with email existing@example.com already exists');
    });
  });

  describe('getByEmail', () => {
    it('should retrieve user by email using GSI1', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        PK: 'USER#user123',
        SK: 'PROFILE',
      };

      mockDynamoService.query.mockResolvedValue({
        items: [mockUser],
        count: 1,
      });

      const result = await userDAO.getByEmail('test@example.com');

      expect(mockDynamoService.query).toHaveBeenCalledWith(
        'GSI1PK = :pk',
        expect.objectContaining({
          indexName: 'GSI1',
          limit: 1,
          expressionAttributeValues: { ':pk': 'EMAIL#test@example.com' },
        })
      );

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockDynamoService.query.mockResolvedValue({
        items: [],
        count: 0,
      });

      const result = await userDAO.getByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateLastActive', () => {
    it('should update user last active timestamp', async () => {
      mockDynamoService.updateItem.mockResolvedValue({});

      await userDAO.updateLastActive('user123');

      expect(mockDynamoService.updateItem).toHaveBeenCalledWith(
        'USER#user123',
        'PROFILE',
        expect.objectContaining({
          updateExpression: 'SET #profile.#lastActive = :lastActive, #updatedAt = :updatedAt',
          expressionAttributeNames: {
            '#profile': 'profile',
            '#lastActive': 'lastActive',
            '#updatedAt': 'updatedAt',
          },
          expressionAttributeValues: expect.objectContaining({
            ':lastActive': expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            ':updatedAt': expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
          }),
        })
      );
    });
  });

  describe('incrementStats', () => {
    it('should increment user statistics', async () => {
      mockDynamoService.updateItem.mockResolvedValue({});

      await userDAO.incrementStats('user123', {
        storiesShared: 1,
        circlesJoined: 2,
        helpfulVotes: 5,
      });

      expect(mockDynamoService.updateItem).toHaveBeenCalledWith(
        'USER#user123',
        'PROFILE',
        expect.objectContaining({
          updateExpression: expect.stringContaining('SET'),
          expressionAttributeNames: expect.objectContaining({
            '#stats': 'stats',
            '#updatedAt': 'updatedAt',
          }),
          expressionAttributeValues: expect.objectContaining({
            ':storiesShared': 1,
            ':circlesJoined': 2,
            ':helpfulVotes': 5,
            ':zero': 0,
          }),
        })
      );
    });
  });
});