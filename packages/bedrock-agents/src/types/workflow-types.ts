import { z } from 'zod';
import { AgentContext, AgentExecutionResult } from './agent-types';

// Workflow step definition
export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  agentId: z.string(),
  inputMapping: z.record(z.string()).optional(),
  outputMapping: z.record(z.string()).optional(),
  condition: z.string().optional(), // JavaScript expression for conditional execution
  retryPolicy: z.object({
    maxRetries: z.number().default(3),
    backoffMultiplier: z.number().default(2),
    initialDelay: z.number().default(1000),
  }).optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// Workflow definition
export const WorkflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  steps: z.array(WorkflowStepSchema),
  errorHandling: z.object({
    onError: z.enum(['stop', 'continue', 'retry', 'fallback']),
    fallbackSteps: z.array(z.string()).optional(),
    maxExecutionTime: z.number().default(300000), // 5 minutes
  }).optional(),
});

export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

// Workflow execution context
export const WorkflowExecutionContextSchema = z.object({
  workflowId: z.string(),
  executionId: z.string(),
  agentContext: z.any(), // AgentContext type
  input: z.record(z.any()),
  variables: z.record(z.any()).default({}),
  stepResults: z.record(z.any()).default({}),
  startTime: z.date(),
  currentStep: z.string().optional(),
});

export type WorkflowExecutionContext = z.infer<typeof WorkflowExecutionContextSchema> & {
  agentContext: AgentContext;
  stepResults: Record<string, AgentExecutionResult>;
};

// Workflow execution result
export interface WorkflowExecutionResult {
  workflowId: string;
  executionId: string;
  success: boolean;
  output: Record<string, any>;
  error?: string;
  executionTime: number;
  stepResults: Record<string, AgentExecutionResult>;
  completedSteps: string[];
  failedStep?: string;
}

// Workflow orchestrator interface
export interface WorkflowOrchestrator {
  registerWorkflow(definition: WorkflowDefinition): void;
  executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    context: AgentContext
  ): Promise<WorkflowExecutionResult>;
  getWorkflowStatus(executionId: string): Promise<WorkflowExecutionResult | null>;
  cancelWorkflow(executionId: string): Promise<boolean>;
}