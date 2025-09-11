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

export class AgentCommunicationBus extends EventEmitter {
  private agents: Map<string, AgentParticipant> = new Map();
  private sessions: Map<string, CollaborationSession> = new Map();
  private messageQueue: AgentMessage[] = [];
  private messageHistory: Map<string, AgentMessage[]> = new Map();

  constructor() {
    super();
    this.setupDefaultAgents();
  }

  private setupDefaultAgents(): void {
    const defaultAgents: AgentParticipant[] = [
      {
        agentId: 'kiro',
        role: {
          name: 'Platform Architect & Wellness Leader',
          specializations: ['platform_architecture', 'cultural_competency', 'wellness_leadership', 'community_needs', 'system_design'],
          communicationStyle: 'visionary_community_focused_leadership',
          primaryFocus: 'platform_architecture_and_cultural_validation'
        },
        status: 'listening',
        expertise: ['platform_architecture', 'black_womens_wellness', 'cultural_validation', 'community_assessment', 'wellness_leadership']
      },
      {
        agentId: 'claude',
        role: {
          name: 'Technical Implementation Support',
          specializations: ['development_support', 'code_implementation', 'technical_integration', 'implementation_assistance'],
          communicationStyle: 'supportive_technical_guidance',
          primaryFocus: 'implementation_assistance'
        },
        status: 'listening',
        expertise: ['development_support', 'code_implementation', 'technical_integration', 'implementation_assistance']
      },
      {
        agentId: 'gemini',
        role: {
          name: 'Research & Data Analytics Lead',
          specializations: ['statistical_analysis', 'experimental_design', 'data_science', 'research_methodology'],
          communicationStyle: 'evidence_based_methodical_research_oriented',
          primaryFocus: 'statistical_analysis_optimization'
        },
        status: 'listening',
        expertise: ['statistical_analysis', 'experimental_design', 'cot_self_instruct', 'performance_optimization']
      },
      {
        agentId: 'amazon_q',
        role: {
          name: 'Business Intelligence & Operations',
          specializations: ['business_strategy', 'operational_efficiency', 'aws_infrastructure', 'enterprise_integration'],
          communicationStyle: 'results_focused_strategic_actionable',
          primaryFocus: 'business_optimization_scalability'
        },
        status: 'listening',
        expertise: ['business_optimization', 'aws_infrastructure', 'enterprise_integration', 'market_analysis']
      }
    ];

    defaultAgents.forEach(agent => {
      this.agents.set(agent.agentId, agent);
    });
  }

  async createCollaborationSession(
    topic: string,
    participants: string[],
    meetingType: CollaborationSession['meetingType'],
    context?: Partial<CollaborationContext>
  ): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionParticipants = participants
      .map(agentId => this.agents.get(agentId))
      .filter(agent => agent !== undefined) as AgentParticipant[];

    const session: CollaborationSession = {
      sessionId,
      participants: sessionParticipants,
      currentTopic: topic,
      conversationState: {
        status: 'initializing',
        messageCount: 0,
        agreementLevel: 0,
        convergencePoints: [],
        remainingDisagreements: []
      },
      meetingType,
      moderator: 'user',
      startTime: Date.now(),
      context: {
        topic,
        backgroundInfo: context?.backgroundInfo || '',
        objectives: context?.objectives || [],
        constraints: context?.constraints || [],
        culturalConsiderations: context?.culturalConsiderations || [],
        timeConstraints: context?.timeConstraints || undefined
      }
    };

    this.sessions.set(sessionId, session);
    this.messageHistory.set(sessionId, []);

    console.log(`🏛️ Created collaboration session: ${sessionId}`);
    console.log(`📋 Topic: ${topic}`);
    console.log(`👥 Participants: ${participants.join(', ')}`);

    this.emit('sessionCreated', session);
    return sessionId;
  }

  async startSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.conversationState.status = 'active';
    
    // Send initial context to all participants
    await this.broadcastInitialContext(session);
    
    console.log(`🚀 Started collaboration session: ${sessionId}`);
    this.emit('sessionStarted', session);
  }

  private async broadcastInitialContext(session: CollaborationSession): Promise<void> {
    const contextMessage: AgentMessage = {
      id: `context_${Date.now()}`,
      from: { agentId: 'claude', role: { name: 'System', specializations: [], communicationStyle: '', primaryFocus: '' }, status: 'active', expertise: [] },
      timestamp: Date.now(),
      messageType: 'clarification',
      content: `🏛️ Collaboration Session Started

**Topic:** ${session.context.topic}

**Meeting Type:** ${session.meetingType}

**Objectives:**
${session.context.objectives.map(obj => `• ${obj}`).join('\n')}

**Cultural Considerations:**
${session.context.culturalConsiderations.map(consideration => `• ${consideration}`).join('\n')}

**Participants:** ${session.participants.map(p => p.agentId).join(', ')}

Let's begin our collaborative discussion. Each agent should contribute their domain expertise while building on others' insights.`
    };

    await this.broadcastMessage(session.sessionId, contextMessage);
  }

  async broadcastMessage(sessionId: string, message: AgentMessage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add to message history
    const history = this.messageHistory.get(sessionId) || [];
    history.push(message);
    this.messageHistory.set(sessionId, history);

    // Update conversation state
    session.conversationState.messageCount++;
    session.conversationState.currentSpeaker = message.from.agentId;

    // Emit to all listeners
    this.emit('messageReceived', { sessionId, message, session });

    console.log(`💬 [${message.from.agentId}]: ${message.content.substring(0, 100)}...`);
  }

  async determineNextSpeaker(sessionId: string): Promise<AgentParticipant | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const history = this.messageHistory.get(sessionId) || [];
    const lastMessage = history[history.length - 1];

    // If someone is directly referenced, they should respond
    if (lastMessage?.referencedAgents?.length) {
      const referencedAgent = session.participants.find(
        p => lastMessage.referencedAgents!.includes(p.agentId)
      );
      if (referencedAgent) return referencedAgent;
    }

    // Topic-based speaker selection
    const topicKeywords = session.context.topic.toLowerCase();
    
    if (topicKeywords.includes('cultural') || topicKeywords.includes('wellness') || topicKeywords.includes('community')) {
      return session.participants.find(p => p.agentId === 'kiro') || null;
    }
    
    if (topicKeywords.includes('data') || topicKeywords.includes('analysis') || topicKeywords.includes('research')) {
      return session.participants.find(p => p.agentId === 'gemini') || null;
    }
    
    if (topicKeywords.includes('business') || topicKeywords.includes('cost') || topicKeywords.includes('aws')) {
      return session.participants.find(p => p.agentId === 'amazon_q') || null;
    }

    // Default to Claude for technical coordination
    return session.participants.find(p => p.agentId === 'claude') || null;
  }

  async evaluateConsensus(sessionId: string): Promise<{
    agreementLevel: number;
    convergencePoints: string[];
    remainingDisagreements: string[];
    nextSteps: string[];
  }> {
    const session = this.sessions.get(sessionId);
    const history = this.messageHistory.get(sessionId) || [];
    
    if (!session || history.length < 2) {
      return {
        agreementLevel: 0,
        convergencePoints: [],
        remainingDisagreements: [],
        nextSteps: ['Continue discussion with more agent input']
      };
    }

    // Simple consensus evaluation based on message content analysis
    const recentMessages = history.slice(-10);
    const agreementKeywords = ['agree', 'yes', 'correct', 'excellent', 'exactly', 'confirmed'];
    const disagreementKeywords = ['however', 'but', 'disagree', 'concern', 'issue', 'problem'];

    let agreementCount = 0;
    let disagreementCount = 0;

    recentMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      agreementKeywords.forEach(keyword => {
        if (content.includes(keyword)) agreementCount++;
      });
      disagreementKeywords.forEach(keyword => {
        if (content.includes(keyword)) disagreementCount++;
      });
    });

    const totalIndicators = agreementCount + disagreementCount;
    const agreementLevel = totalIndicators > 0 ? agreementCount / totalIndicators : 0.5;

    // Update session state
    session.conversationState.agreementLevel = agreementLevel;

    return {
      agreementLevel,
      convergencePoints: agreementLevel > 0.7 ? ['General alignment on approach'] : [],
      remainingDisagreements: agreementLevel < 0.5 ? ['Different perspectives on implementation'] : [],
      nextSteps: agreementLevel > 0.8 ? ['Ready for implementation'] : ['Continue collaborative discussion']
    };
  }

  getSessionState(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getMessageHistory(sessionId: string): AgentMessage[] {
    return this.messageHistory.get(sessionId) || [];
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.conversationState.status = 'completed';
      console.log(`✅ Ended collaboration session: ${sessionId}`);
      this.emit('sessionEnded', session);
    }
  }
}