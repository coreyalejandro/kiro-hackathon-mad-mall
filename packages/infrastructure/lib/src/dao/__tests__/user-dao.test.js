"use strict";
/**
 * User DAO Tests
 * Unit tests for User DAO implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const user_dao_1 = require("../user-dao");
const dynamodb_service_1 = require("../../services/dynamodb-service");
// Mock DynamoDB service
jest.mock('../../services/dynamodb-service');
describe('UserDynamoDAO', () => {
    let userDAO;
    let mockDynamoService;
    beforeEach(() => {
        mockDynamoService = new dynamodb_service_1.DynamoDBService({
            region: 'us-east-1',
            tableName: 'test-table',
        });
        userDAO = new user_dao_1.UserDynamoDAO(mockDynamoService);
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
                    communicationStyle: 'direct_supportive',
                    diagnosisStage: 'newly_diagnosed',
                    supportNeeds: ['emotional_support'],
                    joinDate: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                },
                preferences: {
                    profileVisibility: 'circles_only',
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
                    theme: 'auto',
                    language: 'en',
                    timezone: 'UTC',
                    accessibility: {
                        highContrast: false,
                        largeText: false,
                        screenReader: false,
                        reducedMotion: false,
                    },
                },
                primaryGoals: ['emotional_support'],
                isVerified: false,
                isActive: true,
            };
            const expectedUser = {
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
            expect(mockDynamoService.putItem).toHaveBeenCalledWith(expect.objectContaining({
                PK: 'USER#user123',
                SK: 'PROFILE',
                GSI1PK: 'EMAIL#test@example.com',
                GSI1SK: 'USER#user123',
                entityType: 'USER',
                version: 1,
            }));
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
                    communicationStyle: 'direct_supportive',
                    diagnosisStage: 'newly_diagnosed',
                    supportNeeds: [],
                    joinDate: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                },
                preferences: {
                    profileVisibility: 'circles_only',
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
                    theme: 'auto',
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
            expect(mockDynamoService.query).toHaveBeenCalledWith('GSI1PK = :pk', expect.objectContaining({
                indexName: 'GSI1',
                limit: 1,
                expressionAttributeValues: { ':pk': 'EMAIL#test@example.com' },
            }));
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
            expect(mockDynamoService.updateItem).toHaveBeenCalledWith('USER#user123', 'PROFILE', expect.objectContaining({
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
            }));
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
            expect(mockDynamoService.updateItem).toHaveBeenCalledWith('USER#user123', 'PROFILE', expect.objectContaining({
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
            }));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1kYW8udGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kYW8vX190ZXN0c19fL3VzZXItZGFvLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFFSCwwQ0FBNEM7QUFDNUMsc0VBQWtFO0FBR2xFLHdCQUF3QjtBQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFFN0MsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7SUFDN0IsSUFBSSxPQUFzQixDQUFDO0lBQzNCLElBQUksaUJBQStDLENBQUM7SUFFcEQsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLGlCQUFpQixHQUFHLElBQUksa0NBQWUsQ0FBQztZQUN0QyxNQUFNLEVBQUUsV0FBVztZQUNuQixTQUFTLEVBQUUsWUFBWTtTQUN4QixDQUFpQyxDQUFDO1FBRW5DLE9BQU8sR0FBRyxJQUFJLHdCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtRQUN0QixFQUFFLENBQUMsMERBQTBELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDeEUsTUFBTSxRQUFRLEdBQUc7Z0JBQ2YsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLEtBQUssRUFBRSxrQkFBa0I7Z0JBQ3pCLE9BQU8sRUFBRTtvQkFDUCxTQUFTLEVBQUUsTUFBTTtvQkFDakIsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsR0FBRyxFQUFFLFdBQVc7b0JBQ2hCLGtCQUFrQixFQUFFLENBQUMsa0JBQWtCLENBQUM7b0JBQ3hDLGtCQUFrQixFQUFFLG1CQUE0QjtvQkFDaEQsY0FBYyxFQUFFLGlCQUEwQjtvQkFDMUMsWUFB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LE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxvQkFBb0IsQ0FDdkQsY0FBYyxFQUNkLFNBQVMsRUFDVCxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ3RCLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hELHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDaEQsUUFBUSxFQUFFLE9BQU87b0JBQ2pCLFlBQVksRUFBRSxXQUFXO2lCQUMxQixDQUFDO2dCQUNGLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDakQsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDbkIsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDbkIsZUFBZSxFQUFFLENBQUM7b0JBQ2xCLE9BQU8sRUFBRSxDQUFDO2lCQUNYLENBQUM7YUFDSCxDQUFDLENBQ0gsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVXNlciBEQU8gVGVzdHNcbiAqIFVuaXQgdGVzdHMgZm9yIFVzZXIgREFPIGltcGxlbWVudGF0aW9uXG4gKi9cblxuaW1wb3J0IHsgVXNlckR5bmFtb0RBTyB9IGZyb20gJy4uL3VzZXItZGFvJztcbmltcG9ydCB7IER5bmFtb0RCU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2R5bmFtb2RiLXNlcnZpY2UnO1xuaW1wb3J0IHsgRHluYW1vREJVc2VyIH0gZnJvbSAnQG1hZG1hbGwvc2hhcmVkLXR5cGVzL2RhdGFiYXNlJztcblxuLy8gTW9jayBEeW5hbW9EQiBzZXJ2aWNlXG5qZXN0Lm1vY2soJy4uLy4uL3NlcnZpY2VzL2R5bmFtb2RiLXNlcnZpY2UnKTtcblxuZGVzY3JpYmUoJ1VzZXJEeW5hbW9EQU8nLCAoKSA9PiB7XG4gIGxldCB1c2VyREFPOiBVc2VyRHluYW1vREFPO1xuICBsZXQgbW9ja0R5bmFtb1NlcnZpY2U6IGplc3QuTW9ja2VkPER5bmFtb0RCU2VydmljZT47XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgbW9ja0R5bmFtb1NlcnZpY2UgPSBuZXcgRHluYW1vREJTZXJ2aWNlKHtcbiAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsXG4gICAgICB0YWJsZU5hbWU6ICd0ZXN0LXRhYmxlJyxcbiAgICB9KSBhcyBqZXN0Lk1vY2tlZDxEeW5hbW9EQlNlcnZpY2U+O1xuXG4gICAgdXNlckRBTyA9IG5ldyBVc2VyRHluYW1vREFPKG1vY2tEeW5hbW9TZXJ2aWNlKTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBqZXN0LmNsZWFyQWxsTW9ja3MoKTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NyZWF0ZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBhIG5ldyB1c2VyIHdpdGggcHJvcGVyIGtleXMgYW5kIHRpbWVzdGFtcHMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB1c2VyRGF0YSA9IHtcbiAgICAgICAgdXNlcklkOiAndXNlcjEyMycsXG4gICAgICAgIGVtYWlsOiAndGVzdEBleGFtcGxlLmNvbScsXG4gICAgICAgIHByb2ZpbGU6IHtcbiAgICAgICAgICBmaXJzdE5hbWU6ICdKb2huJyxcbiAgICAgICAgICBsYXN0TmFtZTogJ0RvZScsXG4gICAgICAgICAgYmlvOiAnVGVzdCB1c2VyJyxcbiAgICAgICAgICBjdWx0dXJhbEJhY2tncm91bmQ6IFsnQWZyaWNhbiBBbWVyaWNhbiddLFxuICAgICAgICAgIGNvbW11bmljYXRpb25TdHlsZTogJ2RpcmVjdF9zdXBwb3J0aXZlJyBhcyBjb25zdCxcbiAgICAgICAgICBkaWFnbm9zaXNTdGFnZTogJ25ld2x5X2RpYWdub3NlZCcgYXMgY29uc3QsXG4gICAgICAgICAgc3VwcG9ydE5lZWRzOiBbJ2Vtb3Rpb25hbF9zdXBwb3J0J10gYXMgY29uc3QsXG4gICAgICAgICAgam9pbkRhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICBsYXN0QWN0aXZlOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH0sXG4gICAgICAgIHByZWZlcmVuY2VzOiB7XG4gICAgICAgICAgcHJvZmlsZVZpc2liaWxpdHk6ICdjaXJjbGVzX29ubHknIGFzIGNvbnN0LFxuICAgICAgICAgIHNob3dSZWFsTmFtZTogdHJ1ZSxcbiAgICAgICAgICBhbGxvd0RpcmVjdE1lc3NhZ2VzOiB0cnVlLFxuICAgICAgICAgIHNoYXJlSGVhbHRoSm91cm5leTogdHJ1ZSxcbiAgICAgICAgICBlbWFpbE5vdGlmaWNhdGlvbnM6IHRydWUsXG4gICAgICAgICAgcHVzaE5vdGlmaWNhdGlvbnM6IHRydWUsXG4gICAgICAgICAgd2Vla2x5RGlnZXN0OiB0cnVlLFxuICAgICAgICAgIGNpcmNsZU5vdGlmaWNhdGlvbnM6IHRydWUsXG4gICAgICAgICAgY29udGVudFByZWZlcmVuY2VzOiBbXSxcbiAgICAgICAgICBjaXJjbGVJbnRlcmVzdHM6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgIHRoZW1lOiAnYXV0bycgYXMgY29uc3QsXG4gICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICAgICAgdGltZXpvbmU6ICdVVEMnLFxuICAgICAgICAgIGFjY2Vzc2liaWxpdHk6IHtcbiAgICAgICAgICAgIGhpZ2hDb250cmFzdDogZmFsc2UsXG4gICAgICAgICAgICBsYXJnZVRleHQ6IGZhbHNlLFxuICAgICAgICAgICAgc2NyZWVuUmVhZGVyOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZHVjZWRNb3Rpb246IGZhbHNlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHByaW1hcnlHb2FsczogWydlbW90aW9uYWxfc3VwcG9ydCddIGFzIGNvbnN0LFxuICAgICAgICBpc1ZlcmlmaWVkOiBmYWxzZSxcbiAgICAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBleHBlY3RlZFVzZXI6IER5bmFtb0RCVXNlciA9IHtcbiAgICAgICAgLi4udXNlckRhdGEsXG4gICAgICAgIFBLOiAnVVNFUiN1c2VyMTIzJyxcbiAgICAgICAgU0s6ICdQUk9GSUxFJyxcbiAgICAgICAgR1NJMVBLOiAnRU1BSUwjdGVzdEBleGFtcGxlLmNvbScsXG4gICAgICAgIEdTSTFTSzogJ1VTRVIjdXNlcjEyMycsXG4gICAgICAgIEdTSTRQSzogJ1RFTkFOVCNkZWZhdWx0I1VTRVJTJyxcbiAgICAgICAgR1NJNFNLOiBleHBlY3Quc3RyaW5nTWF0Y2hpbmcoL15DUkVBVEVEI1xcZHs0fS1cXGR7Mn0tXFxkezJ9VFxcZHsyfTpcXGR7Mn06XFxkezJ9XFwuXFxkezN9WiQvKSxcbiAgICAgICAgZW50aXR5VHlwZTogJ1VTRVInLFxuICAgICAgICB2ZXJzaW9uOiAxLFxuICAgICAgICBjcmVhdGVkQXQ6IGV4cGVjdC5zdHJpbmdNYXRjaGluZygvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9VFxcZHsyfTpcXGR7Mn06XFxkezJ9XFwuXFxkezN9WiQvKSxcbiAgICAgICAgdXBkYXRlZEF0OiBleHBlY3Quc3RyaW5nTWF0Y2hpbmcoL15cXGR7NH0tXFxkezJ9LVxcZHsyfVRcXGR7Mn06XFxkezJ9OlxcZHsyfVxcLlxcZHszfVokLyksXG4gICAgICB9O1xuXG4gICAgICBtb2NrRHluYW1vU2VydmljZS5nZXRJdGVtLm1vY2tSZXNvbHZlZFZhbHVlKG51bGwpOyAvLyBObyBleGlzdGluZyB1c2VyXG4gICAgICBtb2NrRHluYW1vU2VydmljZS5wdXRJdGVtLm1vY2tSZXNvbHZlZFZhbHVlKGV4cGVjdGVkVXNlcik7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHVzZXJEQU8uY3JlYXRlKHVzZXJEYXRhKTtcblxuICAgICAgZXhwZWN0KG1vY2tEeW5hbW9TZXJ2aWNlLnB1dEl0ZW0pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFxuICAgICAgICBleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgICAgICAgUEs6ICdVU0VSI3VzZXIxMjMnLFxuICAgICAgICAgIFNLOiAnUFJPRklMRScsXG4gICAgICAgICAgR1NJMVBLOiAnRU1BSUwjdGVzdEBleGFtcGxlLmNvbScsXG4gICAgICAgICAgR1NJMVNLOiAnVVNFUiN1c2VyMTIzJyxcbiAgICAgICAgICBlbnRpdHlUeXBlOiAnVVNFUicsXG4gICAgICAgICAgdmVyc2lvbjogMSxcbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRVc2VyKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgdGhyb3cgZXJyb3IgaWYgdXNlciB3aXRoIGVtYWlsIGFscmVhZHkgZXhpc3RzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgdXNlckRhdGEgPSB7XG4gICAgICAgIHVzZXJJZDogJ3VzZXIxMjMnLFxuICAgICAgICBlbWFpbDogJ2V4aXN0aW5nQGV4YW1wbGUuY29tJyxcbiAgICAgICAgcHJvZmlsZToge1xuICAgICAgICAgIGZpcnN0TmFtZTogJ0pvaG4nLFxuICAgICAgICAgIGxhc3ROYW1lOiAnRG9lJyxcbiAgICAgICAgICBjdWx0dXJhbEJhY2tncm91bmQ6IFtdLFxuICAgICAgICAgIGNvbW11bmljYXRpb25TdHlsZTogJ2RpcmVjdF9zdXBwb3J0aXZlJyBhcyBjb25zdCxcbiAgICAgICAgICBkaWFnbm9zaXNTdGFnZTogJ25ld2x5X2RpYWdub3NlZCcgYXMgY29uc3QsXG4gICAgICAgICAgc3VwcG9ydE5lZWRzOiBbXSxcbiAgICAgICAgICBqb2luRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgIGxhc3RBY3RpdmU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJlZmVyZW5jZXM6IHtcbiAgICAgICAgICBwcm9maWxlVmlzaWJpbGl0eTogJ2NpcmNsZXNfb25seScgYXMgY29uc3QsXG4gICAgICAgICAgc2hvd1JlYWxOYW1lOiB0cnVlLFxuICAgICAgICAgIGFsbG93RGlyZWN0TWVzc2FnZXM6IHRydWUsXG4gICAgICAgICAgc2hhcmVIZWFsdGhKb3VybmV5OiB0cnVlLFxuICAgICAgICAgIGVtYWlsTm90aWZpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgICBwdXNoTm90aWZpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgICB3ZWVrbHlEaWdlc3Q6IHRydWUsXG4gICAgICAgICAgY2lyY2xlTm90aWZpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgICBjb250ZW50UHJlZmVyZW5jZXM6IFtdLFxuICAgICAgICAgIGNpcmNsZUludGVyZXN0czogW10sXG4gICAgICAgIH0sXG4gICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgdGhlbWU6ICdhdXRvJyBhcyBjb25zdCxcbiAgICAgICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgICAgICB0aW1lem9uZTogJ1VUQycsXG4gICAgICAgICAgYWNjZXNzaWJpbGl0eToge1xuICAgICAgICAgICAgaGlnaENvbnRyYXN0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhcmdlVGV4dDogZmFsc2UsXG4gICAgICAgICAgICBzY3JlZW5SZWFkZXI6IGZhbHNlLFxuICAgICAgICAgICAgcmVkdWNlZE1vdGlvbjogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJpbWFyeUdvYWxzOiBbXSxcbiAgICAgICAgaXNWZXJpZmllZDogZmFsc2UsXG4gICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgfTtcblxuICAgICAgLy8gTW9jayBleGlzdGluZyB1c2VyXG4gICAgICBtb2NrRHluYW1vU2VydmljZS5xdWVyeS5tb2NrUmVzb2x2ZWRWYWx1ZSh7XG4gICAgICAgIGl0ZW1zOiBbeyB1c2VySWQ6ICdleGlzdGluZzEyMycsIGVtYWlsOiAnZXhpc3RpbmdAZXhhbXBsZS5jb20nIH1dLFxuICAgICAgICBjb3VudDogMSxcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBleHBlY3QodXNlckRBTy5jcmVhdGUodXNlckRhdGEpKS5yZWplY3RzLnRvVGhyb3coJ1VzZXIgd2l0aCBlbWFpbCBleGlzdGluZ0BleGFtcGxlLmNvbSBhbHJlYWR5IGV4aXN0cycpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZ2V0QnlFbWFpbCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHJpZXZlIHVzZXIgYnkgZW1haWwgdXNpbmcgR1NJMScsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IG1vY2tVc2VyID0ge1xuICAgICAgICB1c2VySWQ6ICd1c2VyMTIzJyxcbiAgICAgICAgZW1haWw6ICd0ZXN0QGV4YW1wbGUuY29tJyxcbiAgICAgICAgUEs6ICdVU0VSI3VzZXIxMjMnLFxuICAgICAgICBTSzogJ1BST0ZJTEUnLFxuICAgICAgfTtcblxuICAgICAgbW9ja0R5bmFtb1NlcnZpY2UucXVlcnkubW9ja1Jlc29sdmVkVmFsdWUoe1xuICAgICAgICBpdGVtczogW21vY2tVc2VyXSxcbiAgICAgICAgY291bnQ6IDEsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXNlckRBTy5nZXRCeUVtYWlsKCd0ZXN0QGV4YW1wbGUuY29tJyk7XG5cbiAgICAgIGV4cGVjdChtb2NrRHluYW1vU2VydmljZS5xdWVyeSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoXG4gICAgICAgICdHU0kxUEsgPSA6cGsnLFxuICAgICAgICBleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgICAgICAgaW5kZXhOYW1lOiAnR1NJMScsXG4gICAgICAgICAgbGltaXQ6IDEsXG4gICAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogeyAnOnBrJzogJ0VNQUlMI3Rlc3RAZXhhbXBsZS5jb20nIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKG1vY2tVc2VyKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIG51bGwgaWYgdXNlciBub3QgZm91bmQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBtb2NrRHluYW1vU2VydmljZS5xdWVyeS5tb2NrUmVzb2x2ZWRWYWx1ZSh7XG4gICAgICAgIGl0ZW1zOiBbXSxcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXNlckRBTy5nZXRCeUVtYWlsKCdub25leGlzdGVudEBleGFtcGxlLmNvbScpO1xuXG4gICAgICBleHBlY3QocmVzdWx0KS50b0JlTnVsbCgpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgndXBkYXRlTGFzdEFjdGl2ZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHVwZGF0ZSB1c2VyIGxhc3QgYWN0aXZlIHRpbWVzdGFtcCcsIGFzeW5jICgpID0+IHtcbiAgICAgIG1vY2tEeW5hbW9TZXJ2aWNlLnVwZGF0ZUl0ZW0ubW9ja1Jlc29sdmVkVmFsdWUoe30pO1xuXG4gICAgICBhd2FpdCB1c2VyREFPLnVwZGF0ZUxhc3RBY3RpdmUoJ3VzZXIxMjMnKTtcblxuICAgICAgZXhwZWN0KG1vY2tEeW5hbW9TZXJ2aWNlLnVwZGF0ZUl0ZW0pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFxuICAgICAgICAnVVNFUiN1c2VyMTIzJyxcbiAgICAgICAgJ1BST0ZJTEUnLFxuICAgICAgICBleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgICAgICAgdXBkYXRlRXhwcmVzc2lvbjogJ1NFVCAjcHJvZmlsZS4jbGFzdEFjdGl2ZSA9IDpsYXN0QWN0aXZlLCAjdXBkYXRlZEF0ID0gOnVwZGF0ZWRBdCcsXG4gICAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAnI3Byb2ZpbGUnOiAncHJvZmlsZScsXG4gICAgICAgICAgICAnI2xhc3RBY3RpdmUnOiAnbGFzdEFjdGl2ZScsXG4gICAgICAgICAgICAnI3VwZGF0ZWRBdCc6ICd1cGRhdGVkQXQnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgICAgICAgICAgJzpsYXN0QWN0aXZlJzogZXhwZWN0LnN0cmluZ01hdGNoaW5nKC9eXFxkezR9LVxcZHsyfS1cXGR7Mn1UXFxkezJ9OlxcZHsyfTpcXGR7Mn1cXC5cXGR7M31aJC8pLFxuICAgICAgICAgICAgJzp1cGRhdGVkQXQnOiBleHBlY3Quc3RyaW5nTWF0Y2hpbmcoL15cXGR7NH0tXFxkezJ9LVxcZHsyfVRcXGR7Mn06XFxkezJ9OlxcZHsyfVxcLlxcZHszfVokLyksXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnaW5jcmVtZW50U3RhdHMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBpbmNyZW1lbnQgdXNlciBzdGF0aXN0aWNzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgbW9ja0R5bmFtb1NlcnZpY2UudXBkYXRlSXRlbS5tb2NrUmVzb2x2ZWRWYWx1ZSh7fSk7XG5cbiAgICAgIGF3YWl0IHVzZXJEQU8uaW5jcmVtZW50U3RhdHMoJ3VzZXIxMjMnLCB7XG4gICAgICAgIHN0b3JpZXNTaGFyZWQ6IDEsXG4gICAgICAgIGNpcmNsZXNKb2luZWQ6IDIsXG4gICAgICAgIGhlbHBmdWxWb3RlczogNSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QobW9ja0R5bmFtb1NlcnZpY2UudXBkYXRlSXRlbSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoXG4gICAgICAgICdVU0VSI3VzZXIxMjMnLFxuICAgICAgICAnUFJPRklMRScsXG4gICAgICAgIGV4cGVjdC5vYmplY3RDb250YWluaW5nKHtcbiAgICAgICAgICB1cGRhdGVFeHByZXNzaW9uOiBleHBlY3Quc3RyaW5nQ29udGFpbmluZygnU0VUJyksXG4gICAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgICAgICAgICAnI3N0YXRzJzogJ3N0YXRzJyxcbiAgICAgICAgICAgICcjdXBkYXRlZEF0JzogJ3VwZGF0ZWRBdCcsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgICAgICAgICAgJzpzdG9yaWVzU2hhcmVkJzogMSxcbiAgICAgICAgICAgICc6Y2lyY2xlc0pvaW5lZCc6IDIsXG4gICAgICAgICAgICAnOmhlbHBmdWxWb3Rlcyc6IDUsXG4gICAgICAgICAgICAnOnplcm8nOiAwLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG59KTsiXX0=