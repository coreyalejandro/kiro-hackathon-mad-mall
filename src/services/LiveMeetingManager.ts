import { EventEmitter } from 'events';
import { 
  AgentCommunicationBus, 
  CollaborationSession, 
  AgentMessage, 
  AgentParticipant,
  CollaborationContext 
} from './src/services/titanEngine/realtime-collaboration/AgentCommunicationBus';
import { 
  ClaudeAgent, 
  KiroAgent, 
  GeminiAgent, 
  AmazonQAgent, 
  AgentInterface 
} from './src/services/titanEngine/realtime-collaboration/AgentInterfaces';

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

export class LiveMeetingManager extends EventEmitter {
  private communicationBus: AgentCommunicationBus;
  private agents: Map<string, AgentInterface>;
  private activeSessions: Map<string, LiveMeetingState> = new Map();
  private meetingHistory: Map<string, AgentMessage[]> = new Map();

  constructor() {
    super();
    this.communicationBus = new AgentCommunicationBus();
    this.agents = new Map();
    this.initializeAgents();
    this.setupEventListeners();
  }

  private initializeAgents(): void {
    const claudeAgent = new ClaudeAgent();
    const kiroAgent = new KiroAgent();
    const geminiAgent = new GeminiAgent();
    const amazonQAgent = new AmazonQAgent();

    this.agents.set('claude', claudeAgent);
    this.agents.set('kiro', kiroAgent);
    this.agents.set('gemini', geminiAgent);
    this.agents.set('amazon_q', amazonQAgent);

    console.log('🤖 Initialized all agent interfaces');
  }

  private setupEventListeners(): void {
    this.communicationBus.on('messageReceived', async (event) => {
      await this.handleAgentMessage(event);
    });

    this.communicationBus.on('sessionStarted', (session) => {
      this.createMeetingState(session);
    });

    this.communicationBus.on('sessionEnded', (session) => {
      this.endMeetingState(session.sessionId);
    });
  }

  async startLiveMeeting(
    topic: string,
    participants: string[],
    meetingType: 'brainstorm' | 'problem_solving' | 'design_review' | 'decision_making' = 'brainstorm',
    context?: Partial<CollaborationContext>
  ): Promise<string> {
    
    console.log(`🏛️ Starting live multi-agent meeting`);
    console.log(`📋 Topic: ${topic}`);
    console.log(`👥 Participants: ${participants.join(', ')}`);
    console.log(`🎯 Type: ${meetingType}`);

    // Create collaboration session
    const sessionId = await this.communicationBus.createCollaborationSession(
      topic,
      participants,
      meetingType,
      {
        topic,
        backgroundInfo: context?.backgroundInfo || `Live meeting on: ${topic}`,
        objectives: context?.objectives || [`Collaborate on ${topic}`, 'Reach consensus on approach', 'Define next steps'],
        constraints: context?.constraints || ['Real-time discussion', 'All participants contribute'],
        culturalConsiderations: context?.culturalConsiderations || [
          'Ensure cultural competency in all recommendations',
          'Center Black women\'s wellness needs',
          'Maintain community-focused approach'
        ],
        timeConstraints: context?.timeConstraints || 30
      }
    );

    // Start the session
    await this.communicationBus.startSession(sessionId);

    // Initialize meeting facilitator
    await this.initializeMeetingFacilitator(sessionId);

    this.emit('meetingStarted', { sessionId, topic, participants });
    return sessionId;
  }

  private async initializeMeetingFacilitator(sessionId: string): Promise<void> {
    const session = this.communicationBus.getSessionState(sessionId);
    if (!session) return;

    // Kiro leads all meetings as Platform Architect & Wellness Leader
    const kiroAgent = session.participants.find(p => p.agentId === 'kiro');
    const firstSpeaker = kiroAgent || await this.communicationBus.determineNextSpeaker(sessionId);
    
    if (firstSpeaker) {
      console.log(`🎙️ ${firstSpeaker.agentId} will lead the discussion`);
      
      // Get initial response from Kiro or selected first speaker
      setTimeout(async () => {
        await this.requestAgentResponse(sessionId, firstSpeaker.agentId);
      }, 1000);
    }
  }

  private createMeetingState(session: CollaborationSession): void {
    const meetingState: LiveMeetingState = {
      sessionId: session.sessionId,
      isActive: true,
      participants: session.participants.map(p => p.agentId),
      messageCount: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      consensus: {
        level: 0,
        status: 'building'
      }
    };

    this.activeSessions.set(session.sessionId, meetingState);
    this.meetingHistory.set(session.sessionId, []);
  }

  private async handleAgentMessage(event: { sessionId: string; message: AgentMessage; session: CollaborationSession }): Promise<void> {
    const { sessionId, message, session } = event;
    const meetingState = this.activeSessions.get(sessionId);
    
    if (!meetingState) return;

    // Update meeting state
    meetingState.messageCount++;
    meetingState.lastActivity = Date.now();
    meetingState.currentSpeaker = message.from.agentId;

    // Add to history
    const history = this.meetingHistory.get(sessionId) || [];
    history.push(message);
    this.meetingHistory.set(sessionId, history);

    // Emit for UI updates
    this.emit('agentSpoke', { sessionId, agent: message.from.agentId, message: message.content });

    // Evaluate consensus
    await this.evaluateAndUpdateConsensus(sessionId);

    // Determine next steps
    await this.facilitateNextResponse(sessionId);
  }

  private async evaluateAndUpdateConsensus(sessionId: string): Promise<void> {
    const consensus = await this.communicationBus.evaluateConsensus(sessionId);
    const meetingState = this.activeSessions.get(sessionId);
    
    if (meetingState) {
      meetingState.consensus.level = consensus.agreementLevel;
      meetingState.consensus.status = consensus.agreementLevel > 0.8 ? 'achieved' : 
                                     consensus.agreementLevel < 0.4 ? 'disagreement' : 'building';
      
      this.emit('consensusUpdate', { sessionId, consensus });
      
      if (consensus.agreementLevel > 0.85) {
        console.log(`✅ High consensus achieved (${Math.round(consensus.agreementLevel * 100)}%)`);
      }
    }
  }

  private async facilitateNextResponse(sessionId: string): Promise<void> {
    const session = this.communicationBus.getSessionState(sessionId);
    const history = this.meetingHistory.get(sessionId) || [];
    
    if (!session || history.length === 0) return;

    const lastMessage = history[history.length - 1];
    if (!lastMessage) return;
    
    // If someone was directly referenced, they should respond
    if (lastMessage.referencedAgents?.length) {
      const referencedAgent = lastMessage.referencedAgents[0];
      if (referencedAgent) {
        console.log(`🎯 ${referencedAgent} was referenced, requesting response`);
        
        setTimeout(async () => {
          await this.requestAgentResponse(sessionId, referencedAgent);
        }, 2000);
        return;
      }
    }

    // Determine next speaker based on conversation flow
    const nextSpeaker = await this.communicationBus.determineNextSpeaker(sessionId);
    
    if (nextSpeaker && nextSpeaker.agentId !== lastMessage.from.agentId) {
      console.log(`🎙️ Next speaker: ${nextSpeaker.agentId}`);
      
      setTimeout(async () => {
        await this.requestAgentResponse(sessionId, nextSpeaker.agentId);
      }, 3000);
    }
  }

  async requestAgentResponse(sessionId: string, agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    const session = this.communicationBus.getSessionState(sessionId);
    const history = this.meetingHistory.get(sessionId) || [];
    
    if (!agent || !session) {
      console.error(`❌ Agent ${agentId} or session ${sessionId} not found`);
      return;
    }

    try {
      console.log(`🤖 Requesting response from ${agentId}...`);
      
      // Generate response based on current context
      const response = await agent.generateResponse(session.context, history);
      
      // Broadcast the response
      await this.communicationBus.broadcastMessage(sessionId, response);
      
    } catch (error) {
      console.error(`❌ Error getting response from ${agentId}:`, error);
    }
  }

  async addUserMessage(sessionId: string, content: string, directTo?: string[]): Promise<void> {
    const userMessage: AgentMessage = {
      id: `user_${Date.now()}`,
      from: {
        agentId: 'claude', // Representing user input through Claude interface
        role: { name: 'User', specializations: [], communicationStyle: 'direct', primaryFocus: 'facilitation' },
        status: 'active',
        expertise: []
      },
      to: directTo || undefined,
      timestamp: Date.now(),
      messageType: directTo ? 'question' : 'clarification',
      content: `**User:** ${content}`,
      referencedAgents: directTo || undefined
    };

    await this.communicationBus.broadcastMessage(sessionId, userMessage);
    
    // If directed to specific agents, trigger their responses
    if (directTo?.length) {
      for (const agentId of directTo) {
        setTimeout(async () => {
          await this.requestAgentResponse(sessionId, agentId);
        }, 1000);
      }
    }
  }

  getMeetingState(sessionId: string): LiveMeetingState | undefined {
    return this.activeSessions.get(sessionId);
  }

  getMeetingHistory(sessionId: string): AgentMessage[] {
    return this.meetingHistory.get(sessionId) || [];
  }

  getActiveMeetings(): LiveMeetingState[] {
    return Array.from(this.activeSessions.values()).filter(state => state.isActive);
  }

  private endMeetingState(sessionId: string): void {
    const meetingState = this.activeSessions.get(sessionId);
    if (meetingState) {
      meetingState.isActive = false;
      console.log(`📝 Meeting ${sessionId} ended after ${meetingState.messageCount} messages`);
      this.emit('meetingEnded', meetingState);
    }
  }

  async endMeeting(sessionId: string): Promise<void> {
    console.log(`🏁 Ending meeting: ${sessionId}`);
    await this.communicationBus.endSession(sessionId);
  }

  // Predefined meeting scenarios
  getPredefinedScenarios(): MeetingScenario[] {
    return [
      {
        title: 'MADMall Feature Planning',
        description: 'Collaborative planning for new MADMall features with all agent perspectives',
        context: {
          topic: 'AI-powered wellness goal tracking feature development',
          backgroundInfo: 'Planning next major feature for MADMall platform',
          objectives: [
            'Define feature requirements and scope',
            'Ensure cultural appropriateness and community focus',
            'Plan technical implementation strategy',
            'Establish success metrics and testing approach'
          ],
          constraints: ['Must integrate with existing TitanEngine', 'Budget considerations'],
          culturalConsiderations: [
            'Community-oriented rather than individual-focused goals',
            'Culturally relevant wellness approaches',
            'Integration with existing community support systems'
          ]
        },
        expectedParticipants: ['claude', 'kiro', 'gemini', 'amazon_q'],
        estimatedDuration: 25
      },
      {
        title: 'Cultural Validation Optimization',
        description: 'Improve cultural validation algorithms through multi-agent collaboration',
        context: {
          topic: 'Optimizing cultural validation scores and algorithms',
          backgroundInfo: 'Cultural validation scores need improvement',
          objectives: [
            'Identify areas for cultural validation improvement',
            'Design experiments to test enhancements',
            'Plan implementation strategy',
            'Establish validation methodology'
          ],
          constraints: ['Must maintain existing functionality', 'Real-time performance requirements'],
          culturalConsiderations: [
            'Authentic representation of Black women\'s experiences',
            'Community input and validation',
            'Intersectionality considerations'
          ]
        },
        expectedParticipants: ['kiro', 'gemini', 'claude', 'amazon_q'],
        estimatedDuration: 30
      },
      {
        title: 'Technical Architecture Review',
        description: 'Comprehensive review of MADMall technical architecture',
        context: {
          topic: 'MADMall platform technical architecture assessment',
          backgroundInfo: 'Regular technical architecture review and optimization',
          objectives: [
            'Assess current architecture performance',
            'Identify optimization opportunities',
            'Plan scalability improvements',
            'Address any technical debt'
          ],
          constraints: ['Zero downtime requirements', 'Budget limitations'],
          culturalConsiderations: [
            'Ensure accessibility and inclusivity',
            'Performance in underserved communities',
            'Privacy and data protection'
          ]
        },
        expectedParticipants: ['claude', 'amazon_q', 'gemini', 'kiro'],
        estimatedDuration: 35
      }
    ];
  }

  async startPredefinedScenario(scenarioIndex: number): Promise<string> {
    const scenarios = this.getPredefinedScenarios();
    const scenario = scenarios[scenarioIndex];
    
    if (!scenario) {
      throw new Error(`Scenario ${scenarioIndex} not found`);
    }

    return await this.startLiveMeeting(
      scenario.context.topic,
      scenario.expectedParticipants,
      'problem_solving',
      scenario.context
    );
  }
}