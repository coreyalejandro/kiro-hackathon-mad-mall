import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { BaseAgent, AgentConfig, AgentContext, AgentExecutionResult, AgentResponse } from '../types/agent-types';
export declare abstract class AbstractBaseAgent<TInput = any, TOutput = any> implements BaseAgent<TInput, TOutput> {
    protected readonly bedrockClient: BedrockRuntimeClient;
    readonly config: AgentConfig;
    constructor(config: AgentConfig, region?: string);
    abstract validateInput(input: unknown): TInput;
    protected abstract processInput(input: TInput, context: AgentContext): Promise<AgentResponse<TOutput>>;
    execute(input: TInput, context: AgentContext): Promise<AgentExecutionResult<TOutput>>;
    protected invokeBedrockModel(prompt: string, systemPrompt?: string): Promise<{
        response: string;
        tokensUsed: number;
    }>;
    protected createSystemPrompt(basePrompt: string, context: AgentContext): string;
    protected parseStructuredResponse<T>(response: string, schema: any): T;
}
//# sourceMappingURL=base-agent.d.ts.map