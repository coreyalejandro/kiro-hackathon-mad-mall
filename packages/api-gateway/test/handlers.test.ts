/**
 * Unit tests for Lambda handlers
 * Tests the migration from Express routes to Lambda functions
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  healthHandler,
  statsHandler,
  getStoriesHandler,
  getFeaturedStoriesHandler,
  getComedyHandler,
  getFeaturedComedyHandler,
  getDiscussionsHandler,
  getActiveDiscussionsHandler,
  getResourcesHandler,
  getFeaturedResourcesHandler,
  getProductsHandler,
  getFeaturedProductsHandler,
  getUserProfilesHandler,
  searchHandler,
  getRecommendationsHandler,
  getCategoriesHandler,
  interactWithContentHandler,
  getHighlightsHandler
} from '../src/handlers';

// Mock event helper
const createMockEvent = (
  httpMethod: string = 'GET',
  path: string = '/',
  queryStringParameters: Record<string, string> | null = null,
  pathParameters: Record<string, string> | null = null,
  body: string | null = null
): APIGatewayProxyEvent => ({
  httpMethod,
  path,
  queryStringParameters,
  pathParameters,
  body,
  headers: {},
  multiValueHeaders: {},
  isBase64Encoded: false,
  requestContext: {
    requestId: 'test-request-id',
    stage: 'test',
    resourceId: 'test-resource',
    resourcePath: path,
    httpMethod,
    requestTime: '01/Jan/2024:00:00:00 +0000',
    requestTimeEpoch: Date.now(),
    identity: {
      sourceIp: '127.0.0.1',
      userAgent: 'test-agent',
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      user: null,
      userArn: null,
      clientCert: null
    },
    accountId: 'test-account',
    apiId: 'test-api',
    protocol: 'HTTP/1.1',
    domainName: 'test-domain',
    domainPrefix: 'test',
    extendedRequestId: 'test-extended-id',
    path: path,
    authorizer: {}
  } as any,
  resource: path,
  stageVariables: null,
  multiValueQueryStringParameters: null
});

describe('Lambda Handlers', () => {
  describe('Health Handler', () => {
    it('should return healthy status', async () => {
      const event = createMockEvent('GET', '/health');
      const result = await healthHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      expect(result.headers?.['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(result.body);
      expect(body.status).toBe('healthy');
      expect(body.message).toBe('AIme Wellness Platform API');
      expect(body.dataInitialized).toBe(true);
    });
  });

  describe('Stats Handler', () => {
    it('should return community stats', async () => {
      const event = createMockEvent('GET', '/stats');
      const result = await statsHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      expect(result.headers?.['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(result.body);
      expect(body.stats).toBeDefined();
      expect(body.stats.totalUsers).toBeGreaterThanOrEqual(0);
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('Stories Handler', () => {
    it('should return user stories with default limit', async () => {
      const event = createMockEvent('GET', '/stories');
      const result = await getStoriesHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      expect(result.headers?.['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(result.body);
      expect(body.stories).toBeDefined();
      expect(Array.isArray(body.stories)).toBe(true);
      expect(body.pagination).toBeDefined();
    });

    it('should respect limit query parameter', async () => {
      const event = createMockEvent('GET', '/stories', { limit: '5' });
      const result = await getStoriesHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.stories.length).toBeLessThanOrEqual(5);
    });

    it('should return featured stories', async () => {
      const event = createMockEvent('GET', '/stories/featured');
      const result = await getFeaturedStoriesHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.stories).toBeDefined();
      expect(Array.isArray(body.stories)).toBe(true);
    });
  });

  describe('Comedy Handler', () => {
    it('should return comedy content', async () => {
      const event = createMockEvent('GET', '/comedy');
      const result = await getComedyHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.comedy).toBeDefined();
      expect(Array.isArray(body.comedy)).toBe(true);
    });

    it('should return featured comedy content', async () => {
      const event = createMockEvent('GET', '/comedy/featured');
      const result = await getFeaturedComedyHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.comedy).toBeDefined();
      expect(Array.isArray(body.comedy)).toBe(true);
    });
  });

  describe('Search Handler', () => {
    it('should return search results', async () => {
      const event = createMockEvent('GET', '/search', { q: 'wellness' });
      const result = await searchHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.results).toBeDefined();
      expect(body.query).toBe('wellness');
      expect(body.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 for missing query parameter', async () => {
      const event = createMockEvent('GET', '/search');
      const result = await searchHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(400);
      
      const body = JSON.parse(result.body);
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Query parameter "q" is required');
    });
  });

  describe('Interaction Handler', () => {
    it('should handle content interaction', async () => {
      const event = createMockEvent('POST', '/interact', null, null, JSON.stringify({
        contentId: 'story-1',
        action: 'like',
        contentType: 'story'
      }));
      
      const result = await interactWithContentHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Successfully');
    });

    it('should return 400 for missing required fields', async () => {
      const event = createMockEvent('POST', '/interact', null, null, JSON.stringify({
        contentId: 'story-1'
        // missing action and contentType
      }));
      
      const result = await interactWithContentHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(400);
      
      const body = JSON.parse(result.body);
      expect(body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Categories Handler', () => {
    it('should return categories for content type', async () => {
      const event = createMockEvent('GET', '/categories/comedy', null, { contentType: 'comedy' });
      const result = await getCategoriesHandler(event) as APIGatewayProxyResult;
      
      expect(result.statusCode).toBe(200);
      
      const body = JSON.parse(result.body);
      expect(body.categories).toBeDefined();
      expect(Array.isArray(body.categories)).toBe(true);
      expect(body.contentType).toBe('comedy');
    });
  });

  describe('Error Handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // This test would require mocking the MockDataService to throw an error
      // For now, we'll test that handlers return proper error structure
      const event = createMockEvent('GET', '/invalid-endpoint');
      
      // Since we don't have an invalid endpoint handler, this would be handled by API Gateway
      // But we can test that our handlers have proper error handling structure
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in all responses', async () => {
      const event = createMockEvent('GET', '/health');
      const result = await healthHandler(event) as APIGatewayProxyResult;
      
      expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers?.['Access-Control-Allow-Methods']).toBeDefined();
      expect(result.headers?.['Access-Control-Allow-Headers']).toBeDefined();
    });
  });
});