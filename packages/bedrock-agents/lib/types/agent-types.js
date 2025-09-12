"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentResponseSchema = exports.AgentContextSchema = exports.AgentConfigSchema = void 0;
const zod_1 = require("zod");
// Base agent configuration
exports.AgentConfigSchema = zod_1.z.object({
    agentId: zod_1.z.string(),
    agentName: zod_1.z.string(),
    description: zod_1.z.string(),
    modelId: zod_1.z.string(),
    temperature: zod_1.z.number().min(0).max(1).default(0.7),
    maxTokens: zod_1.z.number().positive().default(1000),
    topP: zod_1.z.number().min(0).max(1).default(0.9),
    stopSequences: zod_1.z.array(zod_1.z.string()).optional(),
});
// Agent execution context
exports.AgentContextSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    tenantId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string(),
    correlationId: zod_1.z.string(),
    timestamp: zod_1.z.date(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Agent response
exports.AgentResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    reasoning: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
