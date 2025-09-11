import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
export interface AgentMessage {
    id: string;
    from: AgentParticipant;
    to?: string[] | undefined;
    timestamp: number;
    messageType: 'question' | 'suggestion' | 'analysis' | 'clarification' | 'decision' | 'collaboration_request';
    content: string;
    referencedAgents?: string[] | undefined;
    attachments?: AgentAttachment[];
    culturalValidation?: number;
    confidenceScore?: number;
}
export interface AgentParticipant {
    agentId: 'claude' | 'kiro' | 'gemini' | 'amazon_q';
    role: AgentRole;
    status: 'active' | 'listening' | 'processing' | 'responding';
    expertise: string[];
    currentContribution?: AgentMessage;
    connection?: WebSocket;
}
export interface AgentRole {
    name: string;
    specializations: string[];
    communicationStyle: string;
    primaryFocus: string;
}
export interface AgentAttachment {
    type: 'statistical_analysis' | 'architecture_diagram' | 'cultural_assessment' | 'business_metrics';
    data: any;
    metadata?: Record<string, any>;
}
export interface CollaborationSession {
    sessionId: string;
    participants: AgentParticipant[];
    currentTopic: string;
    conversationState: ConversationState;
    meetingType: 'brainstorm' | 'problem_solving' | 'design_review' | 'decision_making';
    moderator: 'user' | string;
    startTime: number;
    context: CollaborationContext;
}
export interface ConversationState {
    status: 'initializing' | 'active' | 'paused' | 'completed';
    currentSpeaker?: string;
    messageCount: number;
    agreementLevel: number;
    convergencePoints: string[];
    remainingDisagreements: string[];
}
export interface CollaborationContext {
    topic: string;
    backgroundInfo: string;
    objectives: string[];
    constraints: string[];
    culturalConsiderations: string[];
    timeConstraints?: number | undefined;
}
export declare class AgentCommunicationBus extends EventEmitter {
    private agents;
    private sessions;
    private messageQueue;
    private messageHistory;
    constructor();
    private setupDefaultAgents;
    createCollaborationSession(topic: string, participants: string[], meetingType: CollaborationSession['meetingType'], context?: Partial<CollaborationContext>): Promise<string>;
    startSession(sessionId: string): Promise<void>;
    private broadcastInitialContext;
    broadcastMessage(sessionId: string, message: AgentMessage): Promise<void>;
    determineNextSpeaker(sessionId: string): Promise<AgentParticipant | null>;
    evaluateConsensus(sessionId: string): Promise<{
        agreementLevel: number;
        convergencePoints: string[];
        remainingDisagreements: string[];
        nextSteps: string[];
    }>;
    getSessionState(sessionId: string): CollaborationSession | undefined;
    getMessageHistory(sessionId: string): AgentMessage[];
    endSession(sessionId: string): Promise<void>;
}
//# sourceMappingURL=AgentCommunicationBus.d.ts.map