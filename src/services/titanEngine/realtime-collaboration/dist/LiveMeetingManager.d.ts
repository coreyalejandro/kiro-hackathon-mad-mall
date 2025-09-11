import { EventEmitter } from 'events';
import { AgentMessage, CollaborationContext } from './AgentCommunicationBus';
export interface LiveMeetingState {
    sessionId: string;
    isActive: boolean;
    currentSpeaker?: string;
    participants: string[];
    messageCount: number;
    startTime: number;
    lastActivity: number;
    consensus: {
        level: number;
        status: 'building' | 'achieved' | 'disagreement';
    };
}
export interface MeetingScenario {
    title: string;
    description: string;
    context: CollaborationContext;
    expectedParticipants: string[];
    estimatedDuration: number;
}
export declare class LiveMeetingManager extends EventEmitter {
    private communicationBus;
    private agents;
    private activeSessions;
    private meetingHistory;
    constructor();
    private initializeAgents;
    private setupEventListeners;
    startLiveMeeting(topic: string, participants: string[], meetingType?: 'brainstorm' | 'problem_solving' | 'design_review' | 'decision_making', context?: Partial<CollaborationContext>): Promise<string>;
    private initializeMeetingFacilitator;
    private createMeetingState;
    private handleAgentMessage;
    private evaluateAndUpdateConsensus;
    private facilitateNextResponse;
    requestAgentResponse(sessionId: string, agentId: string): Promise<void>;
    addUserMessage(sessionId: string, content: string, directTo?: string[]): Promise<void>;
    getMeetingState(sessionId: string): LiveMeetingState | undefined;
    getMeetingHistory(sessionId: string): AgentMessage[];
    getActiveMeetings(): LiveMeetingState[];
    private endMeetingState;
    endMeeting(sessionId: string): Promise<void>;
    getPredefinedScenarios(): MeetingScenario[];
    startPredefinedScenario(scenarioIndex: number): Promise<string>;
}
//# sourceMappingURL=LiveMeetingManager.d.ts.map