"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingManager = exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const LiveMeetingManager_1 = require("./LiveMeetingManager");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize the meeting manager
const meetingManager = new LiveMeetingManager_1.LiveMeetingManager();
exports.meetingManager = meetingManager;
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    // Join a meeting room
    socket.on('joinMeeting', (sessionId) => {
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
    socket.on('startMeeting', async (data) => {
        try {
            const sessionId = await meetingManager.startLiveMeeting(data.topic, data.participants, data.meetingType || 'brainstorm', data.context);
            socket.join(sessionId);
            socket.emit('meetingStarted', { sessionId });
            console.log(`🚀 Meeting started: ${sessionId}`);
        }
        catch (error) {
            socket.emit('error', { message: 'Failed to start meeting', error });
        }
    });
    // Start predefined scenario
    socket.on('startScenario', async (scenarioIndex) => {
        try {
            const sessionId = await meetingManager.startPredefinedScenario(scenarioIndex);
            socket.join(sessionId);
            socket.emit('meetingStarted', { sessionId });
            console.log(`🎬 Scenario ${scenarioIndex} started: ${sessionId}`);
        }
        catch (error) {
            socket.emit('error', { message: 'Failed to start scenario', error });
        }
    });
    // Send user message
    socket.on('sendMessage', async (data) => {
        try {
            await meetingManager.addUserMessage(data.sessionId, data.content, data.directTo);
            console.log(`💬 User message sent to ${data.sessionId}`);
        }
        catch (error) {
            socket.emit('error', { message: 'Failed to send message', error });
        }
    });
    // Request specific agent response
    socket.on('requestAgentResponse', async (data) => {
        try {
            await meetingManager.requestAgentResponse(data.sessionId, data.agentId);
            console.log(`🎯 Requested response from ${data.agentId} in ${data.sessionId}`);
        }
        catch (error) {
            socket.emit('error', { message: 'Failed to request agent response', error });
        }
    });
    // End meeting
    socket.on('endMeeting', async (sessionId) => {
        try {
            await meetingManager.endMeeting(sessionId);
            io.to(sessionId).emit('meetingEnded', { sessionId });
            console.log(`🏁 Meeting ended: ${sessionId}`);
        }
        catch (error) {
            socket.emit('error', { message: 'Failed to end meeting', error });
        }
    });
    // Get meeting state
    socket.on('getMeetingState', (sessionId) => {
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
        const sessionId = await meetingManager.startLiveMeeting(topic, participants, meetingType || 'brainstorm', context);
        return res.json({ sessionId });
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to request agent response' });
    }
});
app.delete('/api/meetings/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        await meetingManager.endMeeting(sessionId);
        return res.json({ success: true });
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map