import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { LiveMeetingManager } from './LiveMeetingManager';
import { AgentMessage } from './AgentCommunicationBus';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize the meeting manager
const meetingManager = new LiveMeetingManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a meeting room
  socket.on('joinMeeting', (sessionId: string) => {
    socket.join(sessionId);
    const meetingState = meetingManager.getMeetingState(sessionId);
    const history = meetingManager.getMeetingHistory(sessionId);
    
    socket.emit('meetingJoined', {
      sessionId,
      meetingState,
      history
    });
    
    console.log(`👥 Client ${socket.id} joined meeting ${sessionId}`);
  });

  // Start a new meeting
  socket.on('startMeeting', async (data: {
    topic: string;
    participants: string[];
    meetingType?: 'brainstorm' | 'problem_solving' | 'design_review' | 'decision_making';
    context?: any;
  }) => {
    try {
      const sessionId = await meetingManager.startLiveMeeting(
        data.topic,
        data.participants,
        data.meetingType || 'brainstorm',
        data.context
      );
      
      socket.join(sessionId);
      socket.emit('meetingStarted', { sessionId });
      
      console.log(`🚀 Meeting started: ${sessionId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to start meeting', error });
    }
  });

  // Start predefined scenario
  socket.on('startScenario', async (scenarioIndex: number) => {
    try {
      const sessionId = await meetingManager.startPredefinedScenario(scenarioIndex);
      socket.join(sessionId);
      socket.emit('meetingStarted', { sessionId });
      
      console.log(`🎬 Scenario ${scenarioIndex} started: ${sessionId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to start scenario', error });
    }
  });

  // Send user message
  socket.on('sendMessage', async (data: {
    sessionId: string;
    content: string;
    directTo?: string[];
  }) => {
    try {
      await meetingManager.addUserMessage(data.sessionId, data.content, data.directTo);
      console.log(`💬 User message sent to ${data.sessionId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message', error });
    }
  });

  // Request specific agent response
  socket.on('requestAgentResponse', async (data: {
    sessionId: string;
    agentId: string;
  }) => {
    try {
      await meetingManager.requestAgentResponse(data.sessionId, data.agentId);
      console.log(`🎯 Requested response from ${data.agentId} in ${data.sessionId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to request agent response', error });
    }
  });

  // End meeting
  socket.on('endMeeting', async (sessionId: string) => {
    try {
      await meetingManager.endMeeting(sessionId);
      io.to(sessionId).emit('meetingEnded', { sessionId });
      console.log(`🏁 Meeting ended: ${sessionId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to end meeting', error });
    }
  });

  // Get meeting state
  socket.on('getMeetingState', (sessionId: string) => {
    const meetingState = meetingManager.getMeetingState(sessionId);
    const history = meetingManager.getMeetingHistory(sessionId);
    
    socket.emit('meetingState', {
      sessionId,
      meetingState,
      history
    });
  });

  // Get predefined scenarios
  socket.on('getScenarios', () => {
    const scenarios = meetingManager.getPredefinedScenarios();
    socket.emit('scenarios', scenarios);
  });

  // Get active meetings
  socket.on('getActiveMeetings', () => {
    const activeMeetings = meetingManager.getActiveMeetings();
    socket.emit('activeMeetings', activeMeetings);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Meeting manager event listeners for broadcasting to clients
meetingManager.on('meetingStarted', (data) => {
  io.to(data.sessionId).emit('meetingStarted', data);
});

meetingManager.on('agentSpoke', (data) => {
  io.to(data.sessionId).emit('agentMessage', {
    sessionId: data.sessionId,
    agent: data.agent,
    message: data.message,
    timestamp: Date.now()
  });
});

meetingManager.on('consensusUpdate', (data) => {
  io.to(data.sessionId).emit('consensusUpdate', data);
});

meetingManager.on('meetingEnded', (data) => {
  io.to(data.sessionId).emit('meetingEnded', data);
});

// REST API endpoints
app.get('/api/meetings/active', (req, res) => {
  const activeMeetings = meetingManager.getActiveMeetings();
  res.json(activeMeetings);
});

app.get('/api/meetings/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const meetingState = meetingManager.getMeetingState(sessionId);
  const history = meetingManager.getMeetingHistory(sessionId);
  
  if (!meetingState) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  
  return res.json({
    meetingState,
    history
  });
});

app.get('/api/scenarios', (req, res) => {
  const scenarios = meetingManager.getPredefinedScenarios();
  res.json(scenarios);
});

app.post('/api/meetings', async (req, res) => {
  try {
    const { topic, participants, meetingType, context } = req.body;
    
    if (!topic || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'Topic and participants array are required' });
    }
    
    const sessionId = await meetingManager.startLiveMeeting(
      topic,
      participants,
      meetingType || 'brainstorm',
      context
    );
    
    return res.json({ sessionId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start meeting' });
  }
});

app.post('/api/meetings/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, directTo } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    await meetingManager.addUserMessage(sessionId, content, directTo);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/meetings/:sessionId/request-response', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    await meetingManager.requestAgentResponse(sessionId, agentId);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to request agent response' });
  }
});

app.delete('/api/meetings/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await meetingManager.endMeeting(sessionId);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to end meeting' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeMeetings: meetingManager.getActiveMeetings().length
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🏛️ Real-time Agent Collaboration Server running on port ${PORT}`);
  console.log(`🌐 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`📡 HTTP API endpoint: http://localhost:${PORT}`);
  console.log(`🤖 Agents ready: Claude, Kiro, Gemini, Amazon Q`);
});

export { app, server, io, meetingManager };