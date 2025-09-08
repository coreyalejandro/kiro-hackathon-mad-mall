import { BedrockWorkflowOrchestrator } from '../workflows/orchestrator';
import { WorkflowDefinition } from '../types/workflow-types';
import { AgentContext, BaseAgent, AgentExecutionResult } from '../types/agent-types';

// Mock agent for testing
class MockAgent implements BaseAgent {
  constructor(
    public readonly config: any,
    private mockResponse: any = { success: true, data: 'mock result' }
  ) {}

  validateInput(input: unknown): any {
    return input;
  }

  async execute(_input: any, context: AgentContext): Promise<AgentExecutionResult> {
    return {
      agentId: this.config.agentId,
      context,
      response: this.mockResponse,
      executionTime: 100,
      tokensUsed: 50,
    };
  }
}

describe('BedrockWorkflowOrchestrator', () => {
  let orchestrator: BedrockWorkflowOrchestrator;
  let mockContext: AgentContext;

  beforeEach(() => {
    orchestrator = new BedrockWorkflowOrchestrator();
    mockContext = {
      sessionId: 'test-session',
      correlationId: 'test-correlation',
      timestamp: new Date(),
      userId: 'test-user',
    };
  });

  describe('workflow registration and execution', () => {
    it('should register and execute a simple workflow', async () => {
      // Register a mock agent
      const mockAgent = new MockAgent({ agentId: 'test-agent' });
      orchestrator.registerAgent('test-agent', mockAgent);

      // Define a simple workflow
      const workflow: WorkflowDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A simple test workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Test Step',
            agentId: 'test-agent',
            inputMapping: {
              message: 'input.message',
            },
            outputMapping: {
              'data': 'result',
            },
          },
        ],
      };

      orchestrator.registerWorkflow(workflow);

      // Execute the workflow
      const result = await orchestrator.executeWorkflow(
        'test-workflow',
        { message: 'Hello, world!' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.completedSteps).toContain('step1');
      expect(result.output.result).toBe('mock result');
    });

    it('should handle workflow execution errors', async () => {
      // Create a mock agent that throws an error
      class ErrorAgent implements BaseAgent {
        constructor(public readonly config: any) {}
        
        validateInput(input: unknown): any {
          return input;
        }
        
        async execute(_input: any, _context: AgentContext): Promise<AgentExecutionResult> {
          throw new Error('Mock agent error');
        }
      }

      const errorAgent = new ErrorAgent({ agentId: 'error-agent' });
      orchestrator.registerAgent('error-agent', errorAgent);

      const workflow: WorkflowDefinition = {
        id: 'error-workflow',
        name: 'Error Workflow',
        description: 'A workflow that fails',
        version: '1.0.0',
        steps: [
          {
            id: 'error-step',
            name: 'Error Step',
            agentId: 'error-agent',
            retryPolicy: {
              maxRetries: 0, // No retries for faster test
              backoffMultiplier: 1,
              initialDelay: 100,
            },
          },
        ],
        errorHandling: {
          onError: 'stop',
          maxExecutionTime: 60000,
        },
      };

      orchestrator.registerWorkflow(workflow);

      const result = await orchestrator.executeWorkflow(
        'error-workflow',
        {},
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Mock agent error');
      expect(result.failedStep).toBe('error-step');
    });

    it('should execute conditional steps correctly', async () => {
      const mockAgent = new MockAgent({ agentId: 'conditional-agent' });
      orchestrator.registerAgent('conditional-agent', mockAgent);

      const workflow: WorkflowDefinition = {
        id: 'conditional-workflow',
        name: 'Conditional Workflow',
        description: 'A workflow with conditional steps',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Always Execute',
            agentId: 'conditional-agent',
            outputMapping: {
              'data': 'shouldExecuteNext',
            },
          },
          {
            id: 'step2',
            name: 'Conditional Step',
            agentId: 'conditional-agent',
            // Simple condition that should always be true for this test
            condition: 'true',
          },
        ],
      };

      orchestrator.registerWorkflow(workflow);

      const result = await orchestrator.executeWorkflow(
        'conditional-workflow',
        {},
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.completedSteps).toContain('step1');
      expect(result.completedSteps).toContain('step2');
    });
  });

  describe('workflow status and management', () => {
    it('should track workflow execution status', async () => {
      const mockAgent = new MockAgent({ agentId: 'status-agent' });
      orchestrator.registerAgent('status-agent', mockAgent);

      const workflow: WorkflowDefinition = {
        id: 'status-workflow',
        name: 'Status Workflow',
        description: 'A workflow for status tracking',
        version: '1.0.0',
        steps: [
          {
            id: 'status-step',
            name: 'Status Step',
            agentId: 'status-agent',
          },
        ],
      };

      orchestrator.registerWorkflow(workflow);

      const result = await orchestrator.executeWorkflow(
        'status-workflow',
        {},
        mockContext
      );

      const status = await orchestrator.getWorkflowStatus(result.executionId);
      expect(status).toBeDefined();
      expect(status?.workflowId).toBe('status-workflow');
      expect(status?.success).toBe(true);
    });

    it('should handle non-existent workflow execution', async () => {
      try {
        await orchestrator.executeWorkflow(
          'non-existent-workflow',
          {},
          mockContext
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Workflow not found');
      }
    });

    it('should cancel workflow execution', async () => {
      // Test cancelling a non-existent execution
      const cancelled = await orchestrator.cancelWorkflow('fake-execution-id');
      expect(cancelled).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should list registered workflows and agents', () => {
      const mockAgent = new MockAgent({ agentId: 'list-agent' });
      orchestrator.registerAgent('list-agent', mockAgent);

      const workflow: WorkflowDefinition = {
        id: 'list-workflow',
        name: 'List Workflow',
        description: 'A workflow for listing',
        version: '1.0.0',
        steps: [],
      };

      orchestrator.registerWorkflow(workflow);

      const workflows = orchestrator.getWorkflows();
      const agents = orchestrator.getAgents();

      expect(workflows).toHaveLength(1);
      expect(workflows[0].id).toBe('list-workflow');
      expect(agents).toContain('list-agent');
    });

    it('should clean up completed executions', () => {
      // This is a simple test for the cleanup method
      expect(() => orchestrator.clearCompletedExecutions()).not.toThrow();
    });
  });
});