import { AbstractBaseAgent } from './base-agent';
import { WellnessCoachingInput, WellnessCoachingResponse, WellnessAssessmentInput, WellnessMetrics, CrisisIndicators } from '../types/wellness-types';
import { AgentContext, AgentResponse } from '../types/agent-types';
export declare class WellnessCoachAgent extends AbstractBaseAgent<WellnessCoachingInput, WellnessCoachingResponse> {
    constructor(region?: string);
    validateInput(input: unknown): WellnessCoachingInput;
    protected processInput(input: WellnessCoachingInput, context: AgentContext): Promise<AgentResponse<WellnessCoachingResponse>>;
    private createWellnessCoachSystemPrompt;
    private createWellnessCoachPrompt;
    private handleCrisisResponse;
    assessWellness(input: WellnessAssessmentInput, context: AgentContext): Promise<WellnessMetrics>;
    assessCrisisRisk(userMessage: string, context: AgentContext): Promise<CrisisIndicators>;
    trackGoalProgress(_userId: string, goalId: string, progressUpdate: string, context: AgentContext): Promise<{
        updatedProgress: number;
        encouragement: string;
        nextSteps: string[];
    }>;
}
