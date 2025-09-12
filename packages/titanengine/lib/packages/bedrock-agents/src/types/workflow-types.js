"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionContextSchema = exports.WorkflowDefinitionSchema = exports.WorkflowStepSchema = void 0;
const zod_1 = require("zod");
// Workflow step definition
exports.WorkflowStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    agentId: zod_1.z.string(),
    inputMapping: zod_1.z.record(zod_1.z.string()).optional(),
    outputMapping: zod_1.z.record(zod_1.z.string()).optional(),
    condition: zod_1.z.string().optional(), // JavaScript expression for conditional execution
    retryPolicy: zod_1.z.object({
        maxRetries: zod_1.z.number().default(3),
        backoffMultiplier: zod_1.z.number().default(2),
        initialDelay: zod_1.z.number().default(1000),
    }).optional(),
});
// Workflow definition
exports.WorkflowDefinitionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    version: zod_1.z.string(),
    steps: zod_1.z.array(exports.WorkflowStepSchema),
    errorHandling: zod_1.z.object({
        onError: zod_1.z.enum(['stop', 'continue', 'retry', 'fallback']),
        fallbackSteps: zod_1.z.array(zod_1.z.string()).optional(),
        maxExecutionTime: zod_1.z.number().default(300000), // 5 minutes
    }).optional(),
});
// Workflow execution context
exports.WorkflowExecutionContextSchema = zod_1.z.object({
    workflowId: zod_1.z.string(),
    executionId: zod_1.z.string(),
    agentContext: zod_1.z.any(), // AgentContext type
    input: zod_1.z.record(zod_1.z.any()),
    variables: zod_1.z.record(zod_1.z.any()).default({}),
    stepResults: zod_1.z.record(zod_1.z.any()).default({}),
    startTime: zod_1.z.date(),
    currentStep: zod_1.z.string().optional(),
});
//# sourceMappingURL=workflow-types.js.map