import { z } from 'zod';

// Base agent configuration
export const AgentConfigSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  description: z.string(),
  modelId: z.string(),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1000),
  topP: z.number().min(0).max(1).default(0.9),
  stopSequences: z.array(z.string()).optional(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Agent execution context
export const AgentContextSchema = z.object({
  userId: z.string().optional(),
  tenantId: z.string().optional(),
  sessionId: z.string(),
  correlationId: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type AgentContext = z.infer<typeof AgentContextSchema>;

// Agent response
export const AgentResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  reasoning: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type AgentResponse<T = any> = z.infer<typeof AgentResponseSchema> & {
  data?: T;
};

// Agent execution result
export interface AgentExecutionResult<T = any> {
  agentId: string;
  context: AgentContext;
  response: AgentResponse<T>;
  executionTime: number;
  tokensUsed: number;
}

// Base agent interface
export interface BaseAgent<TInput = any, TOutput = any> {
  readonly config: AgentConfig;
  execute(input: TInput, context: AgentContext): Promise<AgentExecutionResult<TOutput>>;
  validateInput(input: unknown): TInput;
}