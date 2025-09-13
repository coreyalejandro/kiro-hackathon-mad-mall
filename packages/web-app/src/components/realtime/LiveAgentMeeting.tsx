'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface AgentMessage {
  id: string;
  from: { agentId: string };
  timestamp: number;
  content: string;
  messageType: string;
}

interface MeetingState {
  sessionId: string;
  isActive: boolean;
  currentSpeaker?: string;
  participants: string[];
  messageCount: number;
  consensus: {
    level: number;
    status: string;
  };
}

const AGENT_CONFIG = {
  claude: {
    name: 'Claude',
    emoji: '🤖',
    role: 'Technical Implementation Support',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  kiro: {
    name: 'Kiro',
    emoji: '💜',
    role: 'Platform Architect & Wellness Leader',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  gemini: {
    name: 'Gemini',
    emoji: '📊',
    role: 'Research & Data Analytics Lead',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  amazon_q: {
    name: 'Amazon Q',
    emoji: '💼',
    role: 'Business Intelligence & Operations',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  }
};

// Demo messages to show functionality
const DEMO_MESSAGES: AgentMessage[] = [
  {
    id: 'demo_1',
    from: { agentId: 'user' },
    timestamp: Date.now() - 60000,
    content: 'I want to discuss our Y Combinator application strategy. How should we position MADMall for maximum impact?',
    messageType: 'question'
  },
  {
    id: 'demo_2',
    from: { agentId: 'claude' },
    timestamp: Date.now() - 50000,
    content: 'From a technical perspective, MADMall has strong YC potential. Our real-time multi-agent collaboration system is genuinely innovative - no one else has built healthcare AI that enables live collaboration between specialized agents like this.\n\n**Key Technical Differentiators:**\n• First real-time multi-agent healthcare AI system\n• WebSocket-based agent coordination with consensus tracking\n• Culturally-competent AI algorithms validated for Black women\n• Scalable AWS infrastructure ready for rapid growth\n\nThe technical moat is substantial because recreating this multi-agent coordination would require months of development.',
    messageType: 'analysis'
  },
  {
    id: 'demo_3',
    from: { agentId: 'kiro' },
    timestamp: Date.now() - 40000,
    content: 'From a cultural wellness perspective, our YC application should center the community impact and authentic representation. This isn\'t just another healthcare AI - this is the first platform designed BY and FOR Black women\'s wellness needs.\n\n**Cultural Value Propositions:**\n• Community-centered approach vs. individual-focused metrics\n• Deployment in trusted spaces (beauty supply stores, churches)\n• Cultural validation algorithms that actually understand context\n• Holistic wellness including spiritual and community factors\n\nYC investors will see this addresses a $60B market with genuine cultural authenticity - not just tech trying to serve everyone.',
    messageType: 'analysis'
  },
  {
    id: 'demo_4',
    from: { agentId: 'user' },
    timestamp: Date.now() - 30000,
    content: 'Perfect insights from both of you! How should we structure our pitch to highlight both the technical innovation AND the cultural impact?',
    messageType: 'question'
  },
  {
    id: 'demo_5',
    from: { agentId: 'claude' },
    timestamp: Date.now() - 20000,
    content: 'I recommend a dual narrative structure:\n\n**Opening Hook:** "Black women have 3x higher maternal mortality - existing healthcare AI fails them"\n**Technical Innovation:** "We built the first real-time multi-agent healthcare AI collaboration system"\n**Cultural Impact:** "Deployed in community spaces where trust already exists"\n**Market Opportunity:** "$60B market with clear path to profitability"\n\nThe key is showing YC that we\'ve solved both the technical complexity AND the cultural authenticity challenge.',
    messageType: 'suggestion'
  },
  {
    id: 'demo_6',
    from: { agentId: 'kiro' },
    timestamp: Date.now() - 10000,
    content: 'Yes, and we need to emphasize that this isn\'t just better technology - it\'s technology that understands and respects community. Our agents don\'t just provide medical advice; they provide culturally-appropriate wellness guidance that aligns with how Black women actually approach health.\n\nFor YC, the story is: "We\'re not just building AI for healthcare - we\'re building AI that truly serves underserved communities with authentic cultural competency."',
    messageType: 'suggestion'
  }
];

export default function LiveAgentMeeting() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [meetingState, setMeetingState] = useState<MeetingState | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize socket connection to real collaboration server
    const newSocket = io('http://localhost:3001', {
      autoConnect: false
    });

    newSocket.on('connect', () => {
      console.log('Connected to real collaboration server');
      setIsConnected(true);
      setIsConnecting(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setIsConnected(false);
      setIsInMeeting(false);
    });

    newSocket.on('meetingStarted', (data: { sessionId: string }) => {
      console.log('Real meeting started:', data.sessionId);
      setSessionId(data.sessionId);
      setIsInMeeting(true);
    });

    newSocket.on('agentMessage', (data: {
      sessionId: string;
      agent: string;
      message: string;
      timestamp: number;
    }) => {
      const agentMessage: AgentMessage = {
        id: `${data.agent}_${data.timestamp}`,
        from: { agentId: data.agent },
        timestamp: data.timestamp,
        content: data.message,
        messageType: 'response'
      };
      setMessages(prev => [...prev, agentMessage]);
    });

    newSocket.on('consensusUpdate', (data: {
      sessionId: string;
      consensus: { agreementLevel: number; status: string };
    }) => {
      setMeetingState(prev => prev ? {
        ...prev,
        consensus: {
          level: data.consensus.agreementLevel,
          status: data.consensus.status
        }
      } : null);
    });

    newSocket.on('meetingEnded', () => {
      setIsInMeeting(false);
      setSessionId(null);
      console.log('Real meeting ended');
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
      setIsConnecting(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const connectToServer = () => {
    if (socket && !socket.connected) {
      setIsConnecting(true);
      socket.connect();
    }
  };


  const startQuickMeeting = async (participants: string[], topic: string) => {
    if (!socket || !socket.connected) {
      alert('Please connect to server first');
      return;
    }

    setMessages([]);
    setMeetingState(null);

    socket.emit('startMeeting', {
      topic,
      participants,
      meetingType: 'problem_solving',
      context: {
        objectives: [
          'Real-time collaborative discussion',
          'Get immediate input from all agents',
          'Reach actionable conclusions'
        ],
        culturalConsiderations: [
          'Ensure cultural competency in all recommendations',
          'Center Black women\'s wellness needs',
          'Maintain community-focused approach'
        ]
      }
    });
  };

  const sendMessage = () => {
    if (!socket || !sessionId || !userMessage.trim()) return;

    const directTo = selectedAgents.length > 0 ? selectedAgents : undefined;
    
    // Add user message to display immediately
    const userMsg: AgentMessage = {
      id: `user_${Date.now()}`,
      from: { agentId: 'user' },
      timestamp: Date.now(),
      content: userMessage,
      messageType: 'question'
    };
    setMessages(prev => [...prev, userMsg]);

    socket.emit('sendMessage', {
      sessionId,
      content: userMessage,
      directTo
    });

    setUserMessage('');
    setSelectedAgents([]);
  };

  const requestAgentResponse = (agentId: string) => {
    if (!socket || !sessionId) return;

    socket.emit('requestAgentResponse', {
      sessionId,
      agentId
    });
  };

  const endMeeting = () => {
    if (!socket || !sessionId) return;

    socket.emit('endMeeting', sessionId);
  };

  const loadDemoConversation = () => {
    setMessages(DEMO_MESSAGES);
    setMeetingState({
      sessionId: 'demo_session_yc',
      isActive: true,
      participants: ['claude', 'kiro'],
      messageCount: 6,
      consensus: { level: 0.87, status: 'building' }
    });
    setIsInMeeting(true);
    setIsDemoMode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  🏛️ MADMall Live Agent Meeting
                </h1>
                <p className="text-purple-100 mt-2 text-lg">
                  Real-time collaboration with Claude, Kiro, Gemini, and Amazon Q
                </p>
              </div>
              {isDemoMode && (
                <div className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg font-semibold">
                  🎬 Demo Mode
                </div>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${socket?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-gray-800">
                    {socket?.connected ? 'Connected & Ready' : 'Disconnected'}
                  </span>
                  {sessionId && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Session: {sessionId.slice(-8)}
                    </span>
                  )}
                </div>
                
                {!socket?.connected && (
                  <button
                    onClick={connectToServer}
                    disabled={isConnecting}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect to Server'}
                  </button>
                )}
                {!isInMeeting && socket?.connected && (
                  <button
                    onClick={loadDemoConversation}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    🎬 Load Demo Conversation
                  </button>
                )}
              </div>
              
              {meetingState && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700">Consensus:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${meetingState.consensus.level * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {Math.round(meetingState.consensus.level * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {meetingState.participants.map(agentId => (
                      <div key={agentId} className="flex items-center gap-1">
                        <span className="text-lg">
                          {AGENT_CONFIG[agentId as keyof typeof AGENT_CONFIG]?.emoji}
                        </span>
                      </div>
                    ))}
                    <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                      {meetingState.participants.length} agents
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Start Buttons */}
          {!isInMeeting && (
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 Start a Live Meeting:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => startQuickMeeting(['claude', 'kiro'], 'Y Combinator Application Strategy Discussion')}
                  className="group p-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🤖💜</span>
                    <div className="font-bold text-xl">Claude + Kiro</div>
                  </div>
                  <div className="text-purple-100">
                    Technical architecture + Cultural wellness expertise
                  </div>
                  <div className="text-sm text-purple-200 mt-2">
                    Perfect for strategic planning and cultural validation
                  </div>
                </button>
                
                <button
                  onClick={() => startQuickMeeting(['claude', 'kiro', 'gemini', 'amazon_q'], 'Complete Platform Strategy Session')}
                  className="group p-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-xl text-white transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🤖💜📊💼</span>
                    <div className="font-bold text-xl">All Agents</div>
                  </div>
                  <div className="text-blue-100">
                    Complete multi-perspective analysis
                  </div>
                  <div className="text-sm text-blue-200 mt-2">
                    Technical, cultural, research, and business insights
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-16">
                <div className="text-6xl mb-4">🏛️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready for Live Collaboration</h3>
                <p className="text-lg">Start a meeting to begin collaborating with AI agents</p>
              </div>
            ) : (
              messages.map((message) => {
                const config = AGENT_CONFIG[message.from.agentId as keyof typeof AGENT_CONFIG];
                const isUser = message.from.agentId === 'user';
                const isSystem = message.from.agentId === 'system';
                
                return (
                  <div key={message.id} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ${
                      isUser ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                      isSystem ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                      `bg-gradient-to-r ${config?.color || 'from-gray-400 to-gray-500'}`
                    }`}>
                      {isUser ? '👤' : 
                       isSystem ? '🏛️' :
                       config?.emoji || '🤖'}
                    </div>
                    <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : ''}`}>
                        <span className="font-bold text-lg text-gray-900">
                          {isUser ? 'You' : 
                           isSystem ? 'Meeting System' :
                           config?.name || message.from.agentId}
                        </span>
                        {!isUser && !isSystem && config && (
                          <span className={`text-sm px-2 py-1 rounded-full bg-opacity-20 ${config.textColor} bg-current`}>
                            {config.role}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        isUser ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                        isSystem ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200' :
                        'bg-white border border-gray-200'
                      }`}>
                        <div className={`whitespace-pre-wrap ${isUser || isSystem ? 'text-current' : 'text-gray-800'}`}>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {isInMeeting && (
            <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-blue-50">
              {/* Agent Selection */}
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-800 mb-3 block">
                  🎯 Direct message to specific agents (optional):
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(AGENT_CONFIG).map(([agentId, config]) => (
                    <button
                      key={agentId}
                      onClick={() => {
                        if (selectedAgents.includes(agentId)) {
                          setSelectedAgents(prev => prev.filter(id => id !== agentId));
                        } else {
                          setSelectedAgents(prev => [...prev, agentId]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                        selectedAgents.includes(agentId)
                          ? `bg-gradient-to-r ${config.color} text-white border-transparent shadow-lg transform scale-105`
                          : `bg-white ${config.textColor} ${config.borderColor} hover:bg-gray-50`
                      }`}
                    >
                      {config.emoji} {config.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a question or start a discussion..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                />
                <button
                  onClick={sendMessage}
                  disabled={!userMessage.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  Send
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {Object.entries(AGENT_CONFIG).map(([agentId, config]) => (
                    <button
                      key={agentId}
                      onClick={() => requestAgentResponse(agentId)}
                      className={`text-sm px-3 py-1 rounded-full bg-white ${config.textColor} ${config.borderColor} border hover:bg-gray-50 transition-colors`}
                    >
                      Ask {config.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={endMeeting}
                  className="text-sm px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors"
                >
                  End Meeting
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      🏛️ Welcome to MADMall Live Agent Meetings
                    </h2>
                    <p className="text-purple-100 mt-1">
                      The world's first real-time multi-agent healthcare AI collaboration system
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOnboarding(false)}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* How It Works */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      🚀 How It Works
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <div className="font-semibold text-gray-800">Start a Meeting</div>
                          <div className="text-sm text-gray-600">Choose "Claude + Kiro" for focused discussion or "All Agents" for complete analysis</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <div className="font-semibold text-gray-800">Ask Questions</div>
                          <div className="text-sm text-gray-600">Type your message and watch agents collaborate in real-time</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <div className="font-semibold text-gray-800">Direct Targeting</div>
                          <div className="text-sm text-gray-600">Select specific agents to get targeted expertise</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                        <div>
                          <div className="font-semibold text-gray-800">Watch Consensus</div>
                          <div className="text-sm text-gray-600">See real-time agreement levels as agents collaborate</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meet Your AI Team */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      🤖 Meet Your AI Team
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl">🤖</div>
                        <div>
                          <div className="font-bold text-blue-800">Claude</div>
                          <div className="text-sm text-blue-600">System Architect & Coordinator</div>
                          <div className="text-xs text-blue-500">Technical architecture, implementation planning</div>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl">💜</div>
                        <div>
                          <div className="font-bold text-purple-800">Kiro</div>
                          <div className="text-sm text-purple-600">Wellness Domain Expert & Advocate</div>
                          <div className="text-xs text-purple-500">Cultural competency, community-centered care</div>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl">📊</div>
                        <div>
                          <div className="font-bold text-green-800">Gemini</div>
                          <div className="text-sm text-green-600">Research & Data Analytics Lead</div>
                          <div className="text-xs text-green-500">Statistical analysis, experimental design</div>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl">💼</div>
                        <div>
                          <div className="font-bold text-orange-800">Amazon Q</div>
                          <div className="text-sm text-orange-600">Business Intelligence & Operations</div>
                          <div className="text-xs text-orange-500">Business strategy, operational efficiency</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    ✨ Key Features
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex gap-2">
                      <span className="text-purple-600">🎯</span>
                      <div>
                        <div className="font-semibold">Agent Targeting</div>
                        <div className="text-gray-600">Direct questions to specific agents</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600">📊</span>
                      <div>
                        <div className="font-semibold">Consensus Tracking</div>
                        <div className="text-gray-600">Real-time agreement monitoring</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-600">⚡</span>
                      <div>
                        <div className="font-semibold">Live Responses</div>
                        <div className="text-gray-600">Agents respond in real-time</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Questions */}
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    💡 Try These Sample Questions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Strategy & Planning:</div>
                      <ul className="text-gray-600 space-y-1">
                        <li>• "What are our biggest competitive advantages?"</li>
                        <li>• "How should we approach Y Combinator?"</li>
                        <li>• "What's our go-to-market strategy?"</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Technical & Cultural:</div>
                      <ul className="text-gray-600 space-y-1">
                        <li>• "How do we ensure cultural competency?"</li>
                        <li>• "What's our technical architecture?"</li>
                        <li>• "How do we validate our approach?"</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Get Started */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowOnboarding(false)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🚀 Start Your First Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        {isDemoMode && !showOnboarding && (
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">🎬 Demo Mode Active</h3>
                <p className="text-yellow-700">
                  This shows a sample Y Combinator strategy conversation. Try sending a message to see live agent responses!
                </p>
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📚 View Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}