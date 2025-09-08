import { CulturalValidationAgent } from '../agents/cultural-validation-agent';
import { ContentValidationInput } from '../types/validation-types';
import { AgentContext } from '../types/agent-types';

describe('CulturalValidationAgent', () => {
  let agent: CulturalValidationAgent;
  let mockContext: AgentContext;

  beforeEach(() => {
    agent = new CulturalValidationAgent('us-east-1');
    mockContext = {
      sessionId: 'test-session',
      correlationId: 'test-correlation',
      timestamp: new Date(),
      userId: 'test-user',
    };

    // Mock the Bedrock client response
    const mockResponse = {
      content: [{
        text: `\`\`\`json
{
  "isAppropriate": true,
  "overallScore": 0.8,
  "issues": [],
  "suggestions": ["Content looks good"],
  "culturalRelevanceScore": 0.9,
  "sensitivityScore": 0.8,
  "inclusivityScore": 0.85
}
\`\`\``,
      }],
      usage: { total_tokens: 150 },
    };

    (agent as any).bedrockClient.send = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify(mockResponse)),
    });
  });

  describe('validateInput', () => {
    it('should validate correct input', () => {
      const input: ContentValidationInput = {
        content: 'This is a test message',
        contentType: 'text',
        culturalContext: {
          primaryCulture: 'American',
          secondaryCultures: [],
          region: 'North America',
          language: 'English',
          religiousConsiderations: [],
          sensitiveTopics: [],
        },
        targetAudience: {
          ageRange: { min: 18, max: 65 },
          diagnosisStage: 'newly_diagnosed',
          supportNeeds: ['emotional_support'],
        },
      };

      expect(() => agent.validateInput(input)).not.toThrow();
    });

    it('should throw error for invalid input', () => {
      const invalidInput = {
        content: 'Test',
        // Missing required fields
      };

      expect(() => agent.validateInput(invalidInput)).toThrow();
    });
  });

  describe('execute', () => {
    it('should successfully validate appropriate content', async () => {
      const input: ContentValidationInput = {
        content: 'Welcome to our supportive community!',
        contentType: 'text',
        culturalContext: {
          primaryCulture: 'American',
          secondaryCultures: [],
          region: 'North America',
          language: 'English',
          religiousConsiderations: [],
          sensitiveTopics: [],
        },
        targetAudience: {
          ageRange: { min: 18, max: 65 },
          diagnosisStage: 'newly_diagnosed',
          supportNeeds: ['emotional_support'],
        },
      };

      const result = await agent.execute(input, mockContext);

      // Debug logging
      if (!result.response.success) {
        console.log('Test failed with error:', result.response.error);
      }

      expect(result.response.success).toBe(true);
      expect(result.response.data).toBeDefined();
      expect(result.response.data?.isAppropriate).toBe(true);
      expect(result.agentId).toBe('cultural-validation-agent');
    });

    it('should handle validation errors gracefully', async () => {
      // Mock a Bedrock error
      (agent as any).bedrockClient.send = jest.fn().mockRejectedValue(
        new Error('Bedrock service error')
      );

      const input: ContentValidationInput = {
        content: 'Test content',
        contentType: 'text',
        culturalContext: {
          primaryCulture: 'American',
          secondaryCultures: [],
          region: 'North America',
          language: 'English',
          religiousConsiderations: [],
          sensitiveTopics: [],
        },
        targetAudience: {
          ageRange: { min: 18, max: 65 },
          diagnosisStage: 'newly_diagnosed',
          supportNeeds: ['emotional_support'],
        },
      };

      const result = await agent.execute(input, mockContext);

      expect(result.response.success).toBe(false);
      expect(result.response.error).toContain('Cultural validation failed');
    });
  });

  describe('validateMultipleContents', () => {
    it('should validate multiple contents', async () => {
      const contents: ContentValidationInput[] = [
        {
          content: 'First message',
          contentType: 'text',
          culturalContext: {
            primaryCulture: 'American',
            secondaryCultures: [],
            region: 'North America',
            language: 'English',
            religiousConsiderations: [],
            sensitiveTopics: [],
          },
          targetAudience: {
            ageRange: { min: 18, max: 65 },
            diagnosisStage: 'newly_diagnosed',
            supportNeeds: ['emotional_support'],
          },
        },
        {
          content: 'Second message',
          contentType: 'text',
          culturalContext: {
            primaryCulture: 'American',
            secondaryCultures: [],
            region: 'North America',
            language: 'English',
            religiousConsiderations: [],
            sensitiveTopics: [],
          },
          targetAudience: {
            ageRange: { min: 18, max: 65 },
            diagnosisStage: 'newly_diagnosed',
            supportNeeds: ['emotional_support'],
          },
        },
      ];

      const results = await agent.validateMultipleContents(contents, mockContext);

      expect(results).toHaveLength(2);
      expect(results[0].isAppropriate).toBe(true);
      expect(results[1].isAppropriate).toBe(true);
    });
  });
});