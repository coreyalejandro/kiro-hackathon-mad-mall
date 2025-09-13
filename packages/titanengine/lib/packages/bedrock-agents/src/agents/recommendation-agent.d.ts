import { AbstractBaseAgent } from './base-agent';
import { RecommendationRequest, RecommendationResult, UserProfile, ConnectionRecommendation } from '../types/recommendation-types';
import { AgentContext, AgentResponse } from '../types/agent-types';
export declare class RecommendationAgent extends AbstractBaseAgent<RecommendationRequest, RecommendationResult> {
    constructor(region?: string);
    validateInput(input: unknown): RecommendationRequest;
    protected processInput(input: RecommendationRequest, _context: AgentContext): Promise<AgentResponse<RecommendationResult>>;
    private createRecommendationSystemPrompt;
    private createRecommendationPrompt;
    recommendCircles(userProfile: UserProfile, context: AgentContext, maxResults?: number): Promise<RecommendationResult>;
    recommendConnections(userProfile: UserProfile, availableUsers: UserProfile[], context: AgentContext): Promise<ConnectionRecommendation[]>;
    recommendContent(userProfile: UserProfile, availableContent: Array<{
        id: string;
        title: string;
        description: string;
        category: string;
        tags: string[];
    }>, context: AgentContext): Promise<RecommendationResult>;
    recommendWellnessActivities(userProfile: UserProfile, currentMood: 'low' | 'medium' | 'high', timeAvailable: number, // minutes
    context: AgentContext): Promise<RecommendationResult>;
    explainRecommendation(recommendationId: string, userProfile: UserProfile, context: AgentContext): Promise<string>;
}
