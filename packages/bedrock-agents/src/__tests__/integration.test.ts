import {
  CulturalValidationAgent,
  ContentModerationAgent,
  RecommendationAgent,
  WellnessCoachAgent,
  BedrockWorkflowOrchestrator,
  predefinedWorkflows,
  ConfigManager,
} from '../index';
import { AgentContext } from '../types/agent-types';

describe('Bedrock Agents Integration', () => {
  let mockContext: AgentContext;

  beforeEach(() => {
    mockContext = {
      sessionId: 'integration-test-session',
      correlationId: 'integration-test-correlation',
      timestamp: new Date(),
      userId: 'integration-test-user',
    };
  });

  describe('Agent Instantiation', () => {
    it('should create all agents successfully', () => {
      expect(() => new CulturalValidationAgent()).not.toThrow();
      expect(() => new ContentModerationAgent()).not.toThrow();
      expect(() => new RecommendationAgent()).not.toThrow();
      expect(() => new WellnessCoachAgent()).not.toThrow();
    });

    it('should create workflow orchestrator successfully', () => {
      expect(() => new BedrockWorkflowOrchestrator()).not.toThrow();
    });

    it('should have predefined workflows available', () => {
      expect(predefinedWorkflows).toBeDefined();
      expect(Array.isArray(predefinedWorkflows)).toBe(true);
      expect(predefinedWorkflows.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Management', () => {
    it('should create config manager successfully', () => {
      const configManager = ConfigManager.getInstance();
      expect(configManager).toBeDefined();
      
      const config = configManager.getConfig();
      expect(config.aws.region).toBeDefined();
      expect(config.agents.defaultModelId).toBeDefined();
    });

    it('should validate configuration', () => {
      const configManager = ConfigManager.getInstance();
      expect(() => configManager.validateConfig()).not.toThrow();
    });
  });

  describe('Workflow Integration', () => {
    it('should register agents and workflows in orchestrator', () => {
      const orchestrator = new BedrockWorkflowOrchestrator();
      
      // Register all agents
      orchestrator.registerAgent('cultural-validation-agent', new CulturalValidationAgent());
      orchestrator.registerAgent('content-moderation-agent', new ContentModerationAgent());
      orchestrator.registerAgent('recommendation-agent', new RecommendationAgent());
      orchestrator.registerAgent('wellness-coach-agent', new WellnessCoachAgent());

      // Register predefined workflows
      predefinedWorkflows.forEach(workflow => {
        orchestrator.registerWorkflow(workflow);
      });

      const registeredAgents = orchestrator.getAgents();
      const registeredWorkflows = orchestrator.getWorkflows();

      expect(registeredAgents).toContain('cultural-validation-agent');
      expect(registeredAgents).toContain('content-moderation-agent');
      expect(registeredAgents).toContain('recommendation-agent');
      expect(registeredAgents).toContain('wellness-coach-agent');

      expect(registeredWorkflows.length).toBe(predefinedWorkflows.length);
    });
  });

  describe('Agent Configuration', () => {
    it('should have correct agent configurations', () => {
      const culturalAgent = new CulturalValidationAgent();
      const moderationAgent = new ContentModerationAgent();
      const recommendationAgent = new RecommendationAgent();
      const wellnessAgent = new WellnessCoachAgent();

      expect(culturalAgent.config.agentId).toBe('cultural-validation-agent');
      expect(moderationAgent.config.agentId).toBe('content-moderation-agent');
      expect(recommendationAgent.config.agentId).toBe('recommendation-agent');
      expect(wellnessAgent.config.agentId).toBe('wellness-coach-agent');

      // Check that all agents have valid model configurations
      [culturalAgent, moderationAgent, recommendationAgent, wellnessAgent].forEach(agent => {
        expect(agent.config.modelId).toBeDefined();
        expect(agent.config.temperature).toBeGreaterThanOrEqual(0);
        expect(agent.config.temperature).toBeLessThanOrEqual(1);
        expect(agent.config.maxTokens).toBeGreaterThan(0);
        expect(agent.config.topP).toBeGreaterThanOrEqual(0);
        expect(agent.config.topP).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Type Safety', () => {
    it('should have proper TypeScript types exported', () => {
      // This test ensures that all types are properly exported and accessible
      const culturalAgent = new CulturalValidationAgent();
      
      // Test that we can access the config type
      const config = culturalAgent.config;
      expect(typeof config.agentId).toBe('string');
      expect(typeof config.temperature).toBe('number');
      
      // Test that context type is properly structured
      expect(typeof mockContext.sessionId).toBe('string');
      expect(typeof mockContext.correlationId).toBe('string');
      expect(mockContext.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', () => {
      const culturalAgent = new CulturalValidationAgent();
      
      // Test input validation
      expect(() => culturalAgent.validateInput({})).toThrow();
      expect(() => culturalAgent.validateInput(null)).toThrow();
      expect(() => culturalAgent.validateInput(undefined)).toThrow();
    });
  });
});