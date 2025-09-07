/**
 * Tests for Smithy model validation and structure
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Smithy Models', () => {
  const modelsDir = join(__dirname, '..', 'models');

  test('should have all required model files', () => {
    const requiredFiles = [
      'main.smithy',
      'common.smithy',
      'errors.smithy',
      'user.smithy',
      'circle.smithy',
      'story.smithy',
      'business.smithy',
      'system.smithy'
    ];

    requiredFiles.forEach(file => {
      const filePath = join(modelsDir, file);
      expect(existsSync(filePath)).toBe(true);
    });
  });

  test('main.smithy should define MADMallAPI service', () => {
    const mainModel = readFileSync(join(modelsDir, 'main.smithy'), 'utf-8');
    
    expect(mainModel).toContain('service MADMallAPI');
    expect(mainModel).toContain('@restJson1');
    expect(mainModel).toContain('namespace com.madmall.api');
  });

  test('errors.smithy should define standard HTTP error structures', () => {
    const errorsModel = readFileSync(join(modelsDir, 'errors.smithy'), 'utf-8');
    
    const expectedErrors = [
      'ValidationError',
      'UnauthorizedError',
      'ForbiddenError',
      'NotFoundError',
      'ConflictError',
      'TooManyRequestsError',
      'InternalServerError'
    ];

    expectedErrors.forEach(error => {
      expect(errorsModel).toContain(`structure ${error}`);
    });
  });

  test('user.smithy should define user operations', () => {
    const userModel = readFileSync(join(modelsDir, 'user.smithy'), 'utf-8');
    
    const expectedOperations = [
      'CreateUser',
      'GetUser',
      'UpdateUser',
      'DeleteUser',
      'GetUserProfiles'
    ];

    expectedOperations.forEach(operation => {
      expect(userModel).toContain(`operation ${operation}`);
    });

    expect(userModel).toContain('structure User');
    expect(userModel).toContain('structure UserProfile');
    expect(userModel).toContain('structure UserPreferences');
  });

  test('circle.smithy should define circle operations', () => {
    const circleModel = readFileSync(join(modelsDir, 'circle.smithy'), 'utf-8');
    
    const expectedOperations = [
      'CreateCircle',
      'GetCircle',
      'UpdateCircle',
      'DeleteCircle',
      'JoinCircle',
      'LeaveCircle',
      'GetCircleMembers'
    ];

    expectedOperations.forEach(operation => {
      expect(circleModel).toContain(`operation ${operation}`);
    });

    expect(circleModel).toContain('structure Circle');
    expect(circleModel).toContain('structure CircleMember');
    expect(circleModel).toContain('structure CircleSettings');
  });

  test('story.smithy should define story operations', () => {
    const storyModel = readFileSync(join(modelsDir, 'story.smithy'), 'utf-8');
    
    const expectedOperations = [
      'CreateStory',
      'GetStory',
      'UpdateStory',
      'DeleteStory',
      'GetStories',
      'GetFeaturedStories'
    ];

    expectedOperations.forEach(operation => {
      expect(storyModel).toContain(`operation ${operation}`);
    });

    expect(storyModel).toContain('structure Story');
    expect(storyModel).toContain('structure StoryEngagement');
    expect(storyModel).toContain('structure StoryMetadata');
  });

  test('business.smithy should define business and product operations', () => {
    const businessModel = readFileSync(join(modelsDir, 'business.smithy'), 'utf-8');
    
    const expectedOperations = [
      'CreateBusiness',
      'GetBusiness',
      'UpdateBusiness',
      'DeleteBusiness',
      'GetBusinesses',
      'GetFeaturedBusinesses',
      'CreateProduct',
      'GetProduct',
      'UpdateProduct',
      'DeleteProduct',
      'GetProducts',
      'GetFeaturedProducts'
    ];

    expectedOperations.forEach(operation => {
      expect(businessModel).toContain(`operation ${operation}`);
    });

    expect(businessModel).toContain('structure Business');
    expect(businessModel).toContain('structure Product');
    expect(businessModel).toContain('structure BusinessProfile');
  });

  test('system.smithy should define system and content operations', () => {
    const systemModel = readFileSync(join(modelsDir, 'system.smithy'), 'utf-8');
    
    const expectedOperations = [
      'GetHealth',
      'GetStats',
      'GetHighlights',
      'Search',
      'GetRecommendations',
      'InteractWithContent'
    ];

    expectedOperations.forEach(operation => {
      expect(systemModel).toContain(`operation ${operation}`);
    });

    expect(systemModel).toContain('structure CommunityStats');
    expect(systemModel).toContain('structure SearchResponse');
    expect(systemModel).toContain('structure ContentInteractionInput');
  });

  test('common.smithy should define shared types', () => {
    const commonModel = readFileSync(join(modelsDir, 'common.smithy'), 'utf-8');
    
    const expectedTypes = [
      'DateTime',
      'Id',
      'Email',
      'Url',
      'PaginationInput',
      'PaginationOutput',
      'InteractionType',
      'ContentType',
      'SearchResultItem'
    ];

    expectedTypes.forEach(type => {
      expect(commonModel).toContain(type);
    });
  });

  test('smithy-build.json should be properly configured', () => {
    const buildConfig = JSON.parse(
      readFileSync(join(__dirname, '..', 'smithy-build.json'), 'utf-8')
    );

    expect(buildConfig.version).toBe('1.0');
    expect(buildConfig.sources).toContain('models');
    expect(buildConfig.plugins).toHaveProperty('typescript-codegen');
    expect(buildConfig.plugins).toHaveProperty('openapi');
    expect(buildConfig.plugins['typescript-codegen'].service).toBe('com.madmall.api#MADMallAPI');
  });
});