import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowExecutionContext,
  WorkflowExecutionResult,
  WorkflowOrchestrator,
} from '../types/workflow-types';
import { AgentContext, BaseAgent, AgentExecutionResult } from '../types/agent-types';

export class BedrockWorkflowOrchestrator implements WorkflowOrchestrator {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private agents: Map<string, BaseAgent> = new Map();
  private executions: Map<string, WorkflowExecutionResult> = new Map();

  constructor() {
    // Initialize with empty maps
  }

  // Register a workflow definition
  registerWorkflow(definition: WorkflowDefinition): void {
    this.workflows.set(definition.id, definition);
  }

  // Register an agent for use in workflows
  registerAgent(agentId: string, agent: BaseAgent): void {
    this.agents.set(agentId, agent);
  }

  // Execute a workflow
  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    context: AgentContext
  ): Promise<WorkflowExecutionResult> {
    const executionId = uuidv4();
    const startTime = new Date();

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionContext: WorkflowExecutionContext = {
      workflowId,
      executionId,
      agentContext: context,
      input,
      variables: {},
      stepResults: {},
      startTime,
    };

    const result: WorkflowExecutionResult = {
      workflowId,
      executionId,
      success: false,
      output: {},
      executionTime: 0,
      stepResults: {},
      completedSteps: [],
    };

    // Store initial execution state
    this.executions.set(executionId, result);

    try {
      // Execute workflow steps
      for (const step of workflow.steps) {
        // Check if step should be executed based on condition
        if (step.condition && !this.evaluateCondition(step.condition, executionContext)) {
          continue;
        }

        executionContext.currentStep = step.id;

        try {
          const stepResult = await this.executeStep(step, executionContext);
          executionContext.stepResults[step.id] = stepResult;
          result.stepResults[step.id] = stepResult;
          result.completedSteps.push(step.id);

          // Apply output mapping to variables
          if (step.outputMapping && stepResult.response.success) {
            this.applyOutputMapping(step.outputMapping, stepResult.response.data, executionContext);
          }
        } catch (error) {
          result.failedStep = step.id;
          result.error = error instanceof Error ? error.message : 'Unknown step execution error';

          // Handle error based on workflow error handling policy
          if (workflow.errorHandling?.onError === 'stop') {
            break;
          } else if (workflow.errorHandling?.onError === 'fallback' && workflow.errorHandling.fallbackSteps) {
            // Execute fallback steps
            for (const fallbackStepId of workflow.errorHandling.fallbackSteps) {
              const fallbackStep = workflow.steps.find(s => s.id === fallbackStepId);
              if (fallbackStep) {
                try {
                  const fallbackResult = await this.executeStep(fallbackStep, executionContext);
                  executionContext.stepResults[fallbackStep.id] = fallbackResult;
                  result.stepResults[fallbackStep.id] = fallbackResult;
                  result.completedSteps.push(fallbackStep.id);
                } catch (fallbackError) {
                  // If fallback also fails, stop execution
                  break;
                }
              }
            }
          }
          // For 'continue' and 'retry', we continue to next step
        }

        // Check execution timeout
        const currentTime = Date.now();
        const maxExecutionTime = workflow.errorHandling?.maxExecutionTime || 300000; // 5 minutes default
        if (currentTime - startTime.getTime() > maxExecutionTime) {
          result.error = 'Workflow execution timeout';
          break;
        }
      }

      // Determine overall success
      result.success = result.completedSteps.length > 0 && !result.error;
      result.output = executionContext.variables;
      result.executionTime = Date.now() - startTime.getTime();

      // Update stored execution result
      this.executions.set(executionId, result);

      return result;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown workflow execution error';
      result.executionTime = Date.now() - startTime.getTime();
      this.executions.set(executionId, result);
      return result;
    }
  }

  // Execute a single workflow step
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowExecutionContext
  ): Promise<AgentExecutionResult> {
    const agent = this.agents.get(step.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${step.agentId}`);
    }

    // Prepare input for the agent
    let stepInput: any = context.input;
    if (step.inputMapping) {
      stepInput = this.applyInputMapping(step.inputMapping, context);
    }

    // Execute with retry policy
    const retryPolicy = step.retryPolicy || {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    };

    let lastError: Error | null = null;
    let delay = retryPolicy.initialDelay;

    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        return await agent.execute(stepInput, context.agentContext);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retryPolicy.maxRetries) {
          await this.sleep(delay);
          delay *= retryPolicy.backoffMultiplier;
        }
      }
    }

    throw lastError || new Error('Step execution failed after retries');
  }

  // Apply input mapping to transform context data for agent input
  private applyInputMapping(
    mapping: Record<string, string>,
    context: WorkflowExecutionContext
  ): any {
    const result: any = {};
    
    for (const [targetKey, sourcePath] of Object.entries(mapping)) {
      const value = this.getValueByPath(sourcePath, context);
      if (value !== undefined) {
        result[targetKey] = value;
      }
    }
    
    return result;
  }

  // Apply output mapping to store agent results in context variables
  private applyOutputMapping(
    mapping: Record<string, string>,
    agentOutput: any,
    context: WorkflowExecutionContext
  ): void {
    for (const [sourcePath, targetKey] of Object.entries(mapping)) {
      const value = this.getValueByPath(sourcePath, { data: agentOutput });
      if (value !== undefined) {
        context.variables[targetKey] = value;
      }
    }
  }

  // Get value from object by dot notation path
  private getValueByPath(path: string, obj: any): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Evaluate condition expression (simple implementation)
  private evaluateCondition(condition: string, context: WorkflowExecutionContext): boolean {
    try {
      // Simple condition evaluation - in production, use a proper expression evaluator
      // This is a basic implementation for common patterns
      
      // Replace variable references with actual values
      let evaluableCondition = condition;
      const variablePattern = /\$\{([^}]+)\}/g;
      
      evaluableCondition = evaluableCondition.replace(variablePattern, (_match, varPath) => {
        const value = this.getValueByPath(varPath, context);
        return JSON.stringify(value);
      });

      // Basic evaluation (in production, use a safe expression evaluator)
      return new Function('return ' + evaluableCondition)();
    } catch (error) {
      // If condition evaluation fails, default to true to continue execution
      return true;
    }
  }

  // Get workflow execution status
  async getWorkflowStatus(executionId: string): Promise<WorkflowExecutionResult | null> {
    return this.executions.get(executionId) || null;
  }

  // Cancel workflow execution
  async cancelWorkflow(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.error = 'Workflow cancelled by user';
      execution.success = false;
      return true;
    }
    return false;
  }

  // Get all registered workflows
  getWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  // Get all registered agents
  getAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  // Utility method for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear completed executions (cleanup method)
  clearCompletedExecutions(olderThanMs: number = 3600000): void { // 1 hour default
    const cutoffTime = Date.now() - olderThanMs;
    
    for (const [executionId, result] of this.executions.entries()) {
      if (result.executionTime > 0 && 
          (result.stepResults[Object.keys(result.stepResults)[0]]?.context.timestamp.getTime() || 0) < cutoffTime) {
        this.executions.delete(executionId);
      }
    }
  }
}