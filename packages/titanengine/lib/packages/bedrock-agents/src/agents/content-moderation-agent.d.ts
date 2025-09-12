import { AbstractBaseAgent } from './base-agent';
import { ContentModerationInput, ContentModerationResult } from '../types/validation-types';
import { AgentContext, AgentResponse } from '../types/agent-types';
export declare class ContentModerationAgent extends AbstractBaseAgent<ContentModerationInput, ContentModerationResult> {
    constructor(region?: string);
    validateInput(input: unknown): ContentModerationInput;
    protected processInput(input: ContentModerationInput, _context: AgentContext): Promise<AgentResponse<ContentModerationResult>>;
    private createModerationSystemPrompt;
    private createModerationPrompt;
    private calculateOverallConfidence;
    moderateInRealTime(content: string, userId?: string, context?: AgentContext): Promise<{
        allowed: boolean;
        reason?: string;
        action: string;
    }>;
    moderateBatch(contents: Array<{
        id: string;
        content: string;
        type?: string;
    }>, context: AgentContext): Promise<Array<{
        id: string;
        result: ContentModerationResult;
    }>>;
    detectCrisisIndicators(content: string, context: AgentContext): Promise<{
        hasCrisisIndicators: boolean;
        urgency: 'low' | 'medium' | 'high' | 'critical';
        indicators: string[];
    }>;
}
