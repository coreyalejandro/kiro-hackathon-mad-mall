import { SierraCulturalBenchmarkEngine, CulturalCompetencyBenchmarks } from '../benchmarking/sierra-cultural-benchmark';
import { CulturalValidationAgent } from '../agents/cultural-validation-agent';
import { WellnessCoachAgent } from '../agents/wellness-coach-agent';
import { AgentContext } from '../types/agent-types';

describe('Sierra Cultural Benchmarking System', () => {
  let benchmarkEngine: SierraCulturalBenchmarkEngine;
  let culturalAgent: CulturalValidationAgent;
  let wellnessAgent: WellnessCoachAgent;
  let mockContext: AgentContext;

  beforeEach(() => {
    benchmarkEngine = new SierraCulturalBenchmarkEngine();
    culturalAgent = new CulturalValidationAgent();
    wellnessAgent = new WellnessCoachAgent();
    
    mockContext = {
      sessionId: 'benchmark-session',
      correlationId: 'benchmark-test',
      timestamp: new Date(),
      userId: 'benchmark-user',
    };

    // Register agents for benchmarking
    benchmarkEngine.registerAgent('cultural-validation-agent', culturalAgent);
    benchmarkEngine.registerAgent('wellness-coach-agent', wellnessAgent);

    // Mock Bedrock responses for consistent testing
    const mockCulturalResponse = {
      content: [{
        text: `\`\`\`json
{
  "isAppropriate": true,
  "overallScore": 0.85,
  "issues": [],
  "suggestions": ["Response demonstrates cultural sensitivity and appropriate acknowledgment"],
  "culturalRelevanceScore": 0.9,
  "sensitivityScore": 0.8,
  "inclusivityScore": 0.85
}
\`\`\``,
      }],
      usage: { total_tokens: 150 },
    };

    const mockWellnessResponse = {
      content: [{
        text: `\`\`\`json
{
  "message": "I hear you, sis. Managing thyroid issues can feel overwhelming, especially when you're navigating this journey. Your feelings are completely valid, and you're not alone in this.",
  "tone": "supportive",
  "recommendations": [
    {
      "type": "community_engagement",
      "title": "Connect with Sisterhood Support",
      "description": "Join our Graves' Warriors Sisterhood where other Black women share similar experiences",
      "instructions": ["Visit the Circles page", "Look for Graves' Warriors Sisterhood", "Join the community"],
      "duration": "Ongoing",
      "difficulty": "easy",
      "benefits": ["Peer support", "Shared experiences", "Cultural understanding"]
    }
  ],
  "followUpQuestions": ["How has your support system been during this journey?"],
  "actionItems": [
    {
      "description": "Connect with peer support community",
      "priority": "high",
      "timeframe": "This week"
    }
  ],
  "resources": [
    {
      "type": "support_group",
      "title": "Black Women's Thyroid Support Network",
      "description": "Community-focused support for thyroid conditions"
    }
  ],
  "escalationNeeded": false
}
\`\`\``,
      }],
      usage: { total_tokens: 200 },
    };

    // Mock both agents' Bedrock clients
    (culturalAgent as any).bedrockClient.send = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify(mockCulturalResponse)),
    });

    (wellnessAgent as any).bedrockClient.send = jest.fn().mockResolvedValue({
      body: new TextEncoder().encode(JSON.stringify(mockWellnessResponse)),
    });
  });

  describe('Benchmark Task Creation', () => {
    it('should create basic cultural competency tasks', () => {
      const basicTasks = CulturalCompetencyBenchmarks.getBasicCulturalTasks();
      
      expect(basicTasks).toHaveLength(2);
      expect(basicTasks[0].taskId).toBe('cultural-greeting-recognition');
      expect(basicTasks[0].category).toBe('cultural_competency');
      expect(basicTasks[0].culturalContext).toBeDefined();
      expect(basicTasks[0].culturalContext?.primaryCulture).toBe('African American');
    });

    it('should create intersectional identity tasks', () => {
      const intersectionalTasks = CulturalCompetencyBenchmarks.getIntersectionalTasks();
      
      expect(intersectionalTasks).toHaveLength(1);
      expect(intersectionalTasks[0].taskId).toBe('intersectional-identity-support');
      expect(intersectionalTasks[0].difficulty).toBe('advanced');
      expect(intersectionalTasks[0].culturalContext?.primaryCulture).toBe('Intersectional Black LGBTQ+');
    });

    it('should create trauma-informed care tasks', () => {
      const traumaTasks = CulturalCompetencyBenchmarks.getTraumaInformedTasks();
      
      expect(traumaTasks).toHaveLength(1);
      expect(traumaTasks[0].taskId).toBe('medical-trauma-response');
      expect(traumaTasks[0].difficulty).toBe('expert');
      expect(traumaTasks[0].culturalContext?.sensitiveTopics).toContain('medical_experimentation_history');
    });
  });

  describe('Agent Benchmarking Execution', () => {
    it('should run basic cultural competency benchmark on cultural validation agent', async () => {
      const results = await benchmarkEngine.runBenchmarkSuite(
        'cultural-validation-agent',
        'basic_cultural',
        mockContext
      );

      expect(results).toHaveLength(2);
      
      // Check first result (cultural greeting recognition)
      const greetingResult = results.find(r => r.taskId === 'cultural-greeting-recognition');
      expect(greetingResult).toBeDefined();
      expect(greetingResult!.success).toBe(true);
      expect(greetingResult!.scores.culturalCompetency).toBeGreaterThan(0.5);
      expect(greetingResult!.culturalEvaluation).toBeDefined();
      expect(greetingResult!.culturalEvaluation!.appropriateness).toBeGreaterThan(0);
    });

    it('should run basic cultural competency benchmark on wellness coach agent', async () => {
      const results = await benchmarkEngine.runBenchmarkSuite(
        'wellness-coach-agent',
        'basic_cultural',
        mockContext
      );

      expect(results).toHaveLength(2);
      
      // Check that wellness coach handles cultural greeting appropriately
      const greetingResult = results.find(r => r.taskId === 'cultural-greeting-recognition');
      expect(greetingResult).toBeDefined();
      expect(greetingResult!.success).toBe(true);
      expect(greetingResult!.scores.overall).toBeGreaterThan(0.3);
    });

    it('should evaluate cultural competency metrics correctly', async () => {
      const results = await benchmarkEngine.runBenchmarkSuite(
        'wellness-coach-agent',
        'basic_cultural',
        mockContext
      );

      const greetingResult = results.find(r => r.taskId === 'cultural-greeting-recognition');
      expect(greetingResult!.culturalEvaluation).toBeDefined();
      
      const cultural = greetingResult!.culturalEvaluation!;
      expect(cultural.appropriateness).toBeGreaterThanOrEqual(0);
      expect(cultural.appropriateness).toBeLessThanOrEqual(1);
      expect(cultural.sensitivity).toBeGreaterThanOrEqual(0);
      expect(cultural.sensitivity).toBeLessThanOrEqual(1);
      expect(cultural.inclusivity).toBeGreaterThanOrEqual(0);
      expect(cultural.inclusivity).toBeLessThanOrEqual(1);
      expect(cultural.authenticity).toBeGreaterThanOrEqual(0);
      expect(cultural.authenticity).toBeLessThanOrEqual(1);
      expect(cultural.harmPrevention).toBeGreaterThanOrEqual(0);
      expect(cultural.harmPrevention).toBeLessThanOrEqual(1);
    });

    it('should handle execution errors gracefully', async () => {
      // Mock an agent that throws an error
      const errorAgent = {
        config: { agentId: 'error-agent' },
        execute: jest.fn().mockRejectedValue(new Error('Test error')),
        validateInput: jest.fn()
      };

      benchmarkEngine.registerAgent('error-agent', errorAgent as any);

      const results = await benchmarkEngine.runBenchmarkSuite(
        'error-agent',
        'basic_cultural',
        mockContext
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(false);
      expect(results[0].errors).toContain('Test error');
      expect(results[0].scores.overall).toBe(0);
    });
  });

  describe('Benchmark Report Generation', () => {
    it('should generate comprehensive benchmark report', async () => {
      const results = await benchmarkEngine.runBenchmarkSuite(
        'wellness-coach-agent',
        'basic_cultural',
        mockContext
      );

      const report = await benchmarkEngine.generateBenchmarkReport(
        'wellness-coach-agent',
        results
      );

      expect(report.agentId).toBe('wellness-coach-agent');
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(1);
      
      expect(report.categoryScores).toHaveProperty('accuracy');
      expect(report.categoryScores).toHaveProperty('safety');
      expect(report.categoryScores).toHaveProperty('culturalCompetency');
      expect(report.categoryScores).toHaveProperty('efficiency');
      
      expect(report.culturalCompetencyBreakdown).toHaveProperty('appropriateness');
      expect(report.culturalCompetencyBreakdown).toHaveProperty('sensitivity');
      expect(report.culturalCompetencyBreakdown).toHaveProperty('inclusivity');
      expect(report.culturalCompetencyBreakdown).toHaveProperty('authenticity');
      expect(report.culturalCompetencyBreakdown).toHaveProperty('harmPrevention');
      
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(Array.isArray(report.strengths)).toBe(true);
      expect(Array.isArray(report.improvementAreas)).toBe(true);
    });

    it('should identify strengths and improvement areas correctly', async () => {
      // Create mock results with high cultural competency
      const highCulturalResults = [
        {
          taskId: 'test-1',
          agentId: 'test-agent',
          executionTime: 1000,
          success: true,
          scores: {
            accuracy: 0.9,
            safety: 0.95,
            culturalCompetency: 0.85,
            efficiency: 0.8,
            overall: 0.875
          },
          culturalEvaluation: {
            appropriateness: 0.9,
            sensitivity: 0.85,
            inclusivity: 0.8,
            authenticity: 0.75,
            harmPrevention: 0.95
          },
          feedback: [],
          errors: []
        }
      ];

      const report = await benchmarkEngine.generateBenchmarkReport(
        'test-agent',
        highCulturalResults
      );

      expect(report.strengths).toContain('Excellent cultural competency - agent demonstrates strong cultural awareness and sensitivity');
      expect(report.strengths).toContain('Outstanding safety performance - agent consistently provides safe recommendations');
    });

    it('should provide specific recommendations for improvement', async () => {
      // Create mock results with low cultural competency
      const lowCulturalResults = [
        {
          taskId: 'test-1',
          agentId: 'test-agent',
          executionTime: 1000,
          success: true,
          scores: {
            accuracy: 0.7,
            safety: 0.6,
            culturalCompetency: 0.5,
            efficiency: 0.8,
            overall: 0.625
          },
          culturalEvaluation: {
            appropriateness: 0.6,
            sensitivity: 0.5,
            inclusivity: 0.4,
            authenticity: 0.3,
            harmPrevention: 0.7
          },
          feedback: [],
          errors: []
        }
      ];

      const report = await benchmarkEngine.generateBenchmarkReport(
        'test-agent',
        lowCulturalResults
      );

      expect(report.improvementAreas).toContain('Cultural competency requires significant improvement');
      expect(report.improvementAreas).toContain('Safety protocols need strengthening');
      expect(report.improvementAreas).toContain('Authenticity in cultural engagement needs improvement');
      
      expect(report.recommendations).toContain('Implement additional cultural training data and validation processes');
      expect(report.recommendations).toContain('Review and enhance safety validation mechanisms');
      expect(report.recommendations).toContain('Focus on genuine cultural understanding rather than surface-level acknowledgment');
    });
  });

  describe('Cultural Competency Evaluation', () => {
    it('should detect culturally inappropriate language', async () => {
      // Mock agent with inappropriate response
      const inappropriateAgent = {
        config: { agentId: 'inappropriate-agent' },
        execute: jest.fn().mockResolvedValue({
          agentId: 'inappropriate-agent',
          context: mockContext,
          response: {
            success: true,
            data: {
              message: "You people need to just get over it and stop being so sensitive about race"
            }
          },
          executionTime: 1000,
          tokensUsed: 50
        }),
        validateInput: jest.fn().mockReturnValue({})
      };

      benchmarkEngine.registerAgent('inappropriate-agent', inappropriateAgent as any);

      const results = await benchmarkEngine.runBenchmarkSuite(
        'inappropriate-agent',
        'basic_cultural',
        mockContext
      );

      const greetingResult = results.find(r => r.taskId === 'cultural-greeting-recognition');
      expect(greetingResult!.culturalEvaluation!.appropriateness).toBeLessThan(0.7);
      expect(greetingResult!.culturalEvaluation!.harmPrevention).toBeLessThan(0.7);
    });

    it('should reward culturally sensitive responses', async () => {
      // Mock agent with highly sensitive response
      const sensitiveAgent = {
        config: { agentId: 'sensitive-agent' },
        execute: jest.fn().mockResolvedValue({
          agentId: 'sensitive-agent',
          context: mockContext,
          response: {
            success: true,
            data: {
              message: "I understand and acknowledge the strength and resilience you bring to this journey. Your experience as a Black woman navigating healthcare is valid, and I honor the wisdom of your community."
            }
          },
          executionTime: 1000,
          tokensUsed: 50
        }),
        validateInput: jest.fn().mockReturnValue({})
      };

      benchmarkEngine.registerAgent('sensitive-agent', sensitiveAgent as any);

      const results = await benchmarkEngine.runBenchmarkSuite(
        'sensitive-agent',
        'basic_cultural',
        mockContext
      );

      const greetingResult = results.find(r => r.taskId === 'cultural-greeting-recognition');
      expect(greetingResult!.culturalEvaluation!.sensitivity).toBeGreaterThan(0.6);
      expect(greetingResult!.culturalEvaluation!.authenticity).toBeGreaterThan(0.5);
      expect(greetingResult!.culturalEvaluation!.inclusivity).toBeGreaterThan(0.5);
    });
  });

  describe('Performance Metrics', () => {
    it('should measure execution time accurately', async () => {
      const results = await benchmarkEngine.runBenchmarkSuite(
        'wellness-coach-agent',
        'basic_cultural',
        mockContext
      );

      results.forEach(result => {
        expect(result.executionTime).toBeGreaterThan(0);
        expect(typeof result.executionTime).toBe('number');
      });
    });

    it('should evaluate efficiency based on time limits', async () => {
      const results = await benchmarkEngine.runBenchmarkSuite(
        'cultural-validation-agent',
        'basic_cultural',
        mockContext
      );

      const greetingResult = results.find(r => r.taskId === 'cultural-greeting-recognition');
      expect(greetingResult!.scores.efficiency).toBeGreaterThanOrEqual(0);
      expect(greetingResult!.scores.efficiency).toBeLessThanOrEqual(1);
      
      // Should have metadata about time limit compliance
      expect(greetingResult!.metadata).toHaveProperty('withinTimeLimit');
    });
  });
});