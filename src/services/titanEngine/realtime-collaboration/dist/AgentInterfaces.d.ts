import { AgentMessage, CollaborationContext } from './AgentCommunicationBus';
export interface AgentCapabilities {
    canAnalyze: string[];
    canRecommend: string[];
    canValidate: string[];
    canGenerate: string[];
    culturalCompetencies: string[];
    technicalSkills: string[];
}
export interface ExpertiseAssessment {
    relevance: number;
    confidence: number;
    specializations: string[];
    recommendedRole: 'lead' | 'contributor' | 'validator' | 'observer';
}
export interface AgentFeedback {
    agreement: number;
    concerns: string[];
    suggestions: string[];
    culturalValidation?: number;
    nextSteps: string[];
}
export interface ConsensusEvaluation {
    overallAgreement: number;
    pointsOfConsensus: string[];
    areasOfDisagreement: string[];
    recommendedActions: string[];
}
export interface AgentInterface {
    agentId: string;
    capabilities: AgentCapabilities;
    receiveMessage(message: AgentMessage): Promise<void>;
    generateResponse(context: CollaborationContext, previousMessages: AgentMessage[]): Promise<AgentMessage>;
    provideFeedback(topic: string, otherAgentMessages: AgentMessage[]): Promise<AgentFeedback>;
    analyzeExpertise(topic: string): Promise<ExpertiseAssessment>;
    suggestCollaborators(topic: string): Promise<string[]>;
    evaluateConsensus(discussion: AgentMessage[]): Promise<ConsensusEvaluation>;
}
export declare class ClaudeAgent implements AgentInterface {
    agentId: string;
    capabilities: AgentCapabilities;
    receiveMessage(message: AgentMessage): Promise<void>;
    generateResponse(context: CollaborationContext, previousMessages: AgentMessage[]): Promise<AgentMessage>;
    private analyzeTechnicalRequirements;
    provideFeedback(topic: string, messages: AgentMessage[]): Promise<AgentFeedback>;
    analyzeExpertise(topic: string): Promise<ExpertiseAssessment>;
    suggestCollaborators(topic: string): Promise<string[]>;
    evaluateConsensus(discussion: AgentMessage[]): Promise<ConsensusEvaluation>;
}
export declare class KiroAgent implements AgentInterface {
    agentId: string;
    capabilities: AgentCapabilities;
    receiveMessage(message: AgentMessage): Promise<void>;
    generateResponse(context: CollaborationContext, previousMessages: AgentMessage[]): Promise<AgentMessage>;
    private assessCulturalImplications;
    provideFeedback(topic: string, messages: AgentMessage[]): Promise<AgentFeedback>;
    analyzeExpertise(topic: string): Promise<ExpertiseAssessment>;
    suggestCollaborators(topic: string): Promise<string[]>;
    evaluateConsensus(discussion: AgentMessage[]): Promise<ConsensusEvaluation>;
}
export declare class GeminiAgent implements AgentInterface {
    agentId: string;
    capabilities: AgentCapabilities;
    receiveMessage(message: AgentMessage): Promise<void>;
    generateResponse(context: CollaborationContext, previousMessages: AgentMessage[]): Promise<AgentMessage>;
    private analyzeDataPatterns;
    provideFeedback(topic: string, messages: AgentMessage[]): Promise<AgentFeedback>;
    analyzeExpertise(topic: string): Promise<ExpertiseAssessment>;
    suggestCollaborators(topic: string): Promise<string[]>;
    evaluateConsensus(discussion: AgentMessage[]): Promise<ConsensusEvaluation>;
}
export declare class AmazonQAgent implements AgentInterface {
    agentId: string;
    capabilities: AgentCapabilities;
    receiveMessage(message: AgentMessage): Promise<void>;
    generateResponse(context: CollaborationContext, previousMessages: AgentMessage[]): Promise<AgentMessage>;
    private analyzeBusinessImplications;
    provideFeedback(topic: string, messages: AgentMessage[]): Promise<AgentFeedback>;
    analyzeExpertise(topic: string): Promise<ExpertiseAssessment>;
    suggestCollaborators(topic: string): Promise<string[]>;
    evaluateConsensus(discussion: AgentMessage[]): Promise<ConsensusEvaluation>;
}
//# sourceMappingURL=AgentInterfaces.d.ts.map