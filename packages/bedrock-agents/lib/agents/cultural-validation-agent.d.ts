import { AbstractBaseAgent } from './base-agent';
import { ContentValidationInput, CulturalValidationResult, ValidationIssue } from '../types/validation-types';
import { AgentContext, AgentResponse } from '../types/agent-types';
export declare class CulturalValidationAgent extends AbstractBaseAgent<ContentValidationInput, CulturalValidationResult> {
    constructor(region?: string);
    validateInput(input: unknown): ContentValidationInput;
    protected processInput(input: ContentValidationInput, _context: AgentContext): Promise<AgentResponse<CulturalValidationResult>>;
    private createCulturalValidationSystemPrompt;
    private createCulturalValidationPrompt;
    validateMultipleContents(contents: ContentValidationInput[], context: AgentContext): Promise<CulturalValidationResult[]>;
    generateAlternatives(originalContent: string, issues: ValidationIssue[], culturalContext: any, context: AgentContext): Promise<string[]>;
}
//# sourceMappingURL=cultural-validation-agent.d.ts.map