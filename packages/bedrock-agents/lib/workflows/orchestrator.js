"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockWorkflowOrchestrator = void 0;
const uuid_1 = require("uuid");
class BedrockWorkflowOrchestrator {
    constructor() {
        this.workflows = new Map();
        this.agents = new Map();
        this.executions = new Map();
        // Initialize with empty maps
    }
    // Register a workflow definition
    registerWorkflow(definition) {
        this.workflows.set(definition.id, definition);
    }
    // Register an agent for use in workflows
    registerAgent(agentId, agent) {
        this.agents.set(agentId, agent);
    }
    // Execute a workflow
    async executeWorkflow(workflowId, input, context) {
        const executionId = (0, uuid_1.v4)();
        const startTime = new Date();
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        const executionContext = {
            workflowId,
            executionId,
            agentContext: context,
            input,
            variables: {},
            stepResults: {},
            startTime,
        };
        const result = {
            workflowId,
            executionId,
            success: false,
            output: {},
            executionTime: 0,
            stepResults: {},
            completedSteps: [],
        };
        // Store initial execution state
        this.executions.set(executionId, result);
        try {
            // Execute workflow steps
            for (const step of workflow.steps) {
                // Check if step should be executed based on condition
                if (step.condition && !this.evaluateCondition(step.condition, executionContext)) {
                    continue;
                }
                executionContext.currentStep = step.id;
                try {
                    const stepResult = await this.executeStep(step, executionContext);
                    executionContext.stepResults[step.id] = stepResult;
                    result.stepResults[step.id] = stepResult;
                    result.completedSteps.push(step.id);
                    // Apply output mapping to variables
                    if (step.outputMapping && stepResult.response.success) {
                        this.applyOutputMapping(step.outputMapping, stepResult.response.data, executionContext);
                    }
                }
                catch (error) {
                    result.failedStep = step.id;
                    result.error = error instanceof Error ? error.message : 'Unknown step execution error';
                    // Handle error based on workflow error handling policy
                    if (workflow.errorHandling?.onError === 'stop') {
                        break;
                    }
                    else if (workflow.errorHandling?.onError === 'fallback' && workflow.errorHandling.fallbackSteps) {
                        // Execute fallback steps
                        for (const fallbackStepId of workflow.errorHandling.fallbackSteps) {
                            const fallbackStep = workflow.steps.find(s => s.id === fallbackStepId);
                            if (fallbackStep) {
                                try {
                                    const fallbackResult = await this.executeStep(fallbackStep, executionContext);
                                    executionContext.stepResults[fallbackStep.id] = fallbackResult;
                                    result.stepResults[fallbackStep.id] = fallbackResult;
                                    result.completedSteps.push(fallbackStep.id);
                                }
                                catch (fallbackError) {
                                    // If fallback also fails, stop execution
                                    break;
                                }
                            }
                        }
                    }
                    // For 'continue' and 'retry', we continue to next step
                }
                // Check execution timeout
                const currentTime = Date.now();
                const maxExecutionTime = workflow.errorHandling?.maxExecutionTime || 300000; // 5 minutes default
                if (currentTime - startTime.getTime() > maxExecutionTime) {
                    result.error = 'Workflow execution timeout';
                    break;
                }
            }
            // Determine overall success
            result.success = result.completedSteps.length > 0 && !result.error;
            result.output = executionContext.variables;
            result.executionTime = Date.now() - startTime.getTime();
            // Update stored execution result
            this.executions.set(executionId, result);
            return result;
        }
        catch (error) {
            result.error = error instanceof Error ? error.message : 'Unknown workflow execution error';
            result.executionTime = Date.now() - startTime.getTime();
            this.executions.set(executionId, result);
            return result;
        }
    }
    // Execute a single workflow step
    async executeStep(step, context) {
        const agent = this.agents.get(step.agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${step.agentId}`);
        }
        // Prepare input for the agent
        let stepInput = context.input;
        if (step.inputMapping) {
            stepInput = this.applyInputMapping(step.inputMapping, context);
        }
        // Execute with retry policy
        const retryPolicy = step.retryPolicy || {
            maxRetries: 3,
            backoffMultiplier: 2,
            initialDelay: 1000,
        };
        let lastError = null;
        let delay = retryPolicy.initialDelay;
        for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
            try {
                return await agent.execute(stepInput, context.agentContext);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (attempt < retryPolicy.maxRetries) {
                    await this.sleep(delay);
                    delay *= retryPolicy.backoffMultiplier;
                }
            }
        }
        throw lastError || new Error('Step execution failed after retries');
    }
    // Apply input mapping to transform context data for agent input
    applyInputMapping(mapping, context) {
        const result = {};
        for (const [targetKey, sourcePath] of Object.entries(mapping)) {
            const value = this.getValueByPath(sourcePath, context);
            if (value !== undefined) {
                result[targetKey] = value;
            }
        }
        return result;
    }
    // Apply output mapping to store agent results in context variables
    applyOutputMapping(mapping, agentOutput, context) {
        for (const [sourcePath, targetKey] of Object.entries(mapping)) {
            const value = this.getValueByPath(sourcePath, { data: agentOutput });
            if (value !== undefined) {
                context.variables[targetKey] = value;
            }
        }
    }
    // Get value from object by dot notation path
    getValueByPath(path, obj) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    // Evaluate condition expression (simple implementation)
    evaluateCondition(condition, context) {
        try {
            // Simple condition evaluation - in production, use a proper expression evaluator
            // This is a basic implementation for common patterns
            // Replace variable references with actual values
            let evaluableCondition = condition;
            const variablePattern = /\$\{([^}]+)\}/g;
            evaluableCondition = evaluableCondition.replace(variablePattern, (_match, varPath) => {
                const value = this.getValueByPath(varPath, context);
                return JSON.stringify(value);
            });
            // Basic evaluation (in production, use a safe expression evaluator)
            return new Function('return ' + evaluableCondition)();
        }
        catch (error) {
            // If condition evaluation fails, default to true to continue execution
            return true;
        }
    }
    // Get workflow execution status
    async getWorkflowStatus(executionId) {
        return this.executions.get(executionId) || null;
    }
    // Cancel workflow execution
    async cancelWorkflow(executionId) {
        const execution = this.executions.get(executionId);
        if (execution) {
            execution.error = 'Workflow cancelled by user';
            execution.success = false;
            return true;
        }
        return false;
    }
    // Get all registered workflows
    getWorkflows() {
        return Array.from(this.workflows.values());
    }
    // Get all registered agents
    getAgents() {
        return Array.from(this.agents.keys());
    }
    // Utility method for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Clear completed executions (cleanup method)
    clearCompletedExecutions(olderThanMs = 3600000) {
        const cutoffTime = Date.now() - olderThanMs;
        for (const [executionId, result] of this.executions.entries()) {
            if (result.executionTime > 0 &&
                (result.stepResults[Object.keys(result.stepResults)[0]]?.context.timestamp.getTime() || 0) < cutoffTime) {
                this.executions.delete(executionId);
            }
        }
    }
}
exports.BedrockWorkflowOrchestrator = BedrockWorkflowOrchestrator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JjaGVzdHJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3dvcmtmbG93cy9vcmNoZXN0cmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQW9DO0FBVXBDLE1BQWEsMkJBQTJCO0lBS3RDO1FBSlEsY0FBUyxHQUFvQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3ZELFdBQU0sR0FBMkIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQyxlQUFVLEdBQXlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFHbkUsNkJBQTZCO0lBQy9CLENBQUM7SUFFRCxpQ0FBaUM7SUFDakMsZ0JBQWdCLENBQUMsVUFBOEI7UUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLGFBQWEsQ0FBQyxPQUFlLEVBQUUsS0FBZ0I7UUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxxQkFBcUI7SUFDckIsS0FBSyxDQUFDLGVBQWUsQ0FDbkIsVUFBa0IsRUFDbEIsS0FBMEIsRUFDMUIsT0FBcUI7UUFFckIsTUFBTSxXQUFXLEdBQUcsSUFBQSxTQUFNLEdBQUUsQ0FBQztRQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRTdCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELE1BQU0sZ0JBQWdCLEdBQTZCO1lBQ2pELFVBQVU7WUFDVixXQUFXO1lBQ1gsWUFBWSxF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QUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsOENBQThDO0lBQzlDLHdCQUF3QixDQUFDLGNBQXNCLE9BQU87UUFDcEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUU1QyxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1lBQzlELElBQUksTUFBTSxDQUFDLGFBQWEsR0FBRyxDQUFDO2dCQUN4QixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDO2dCQUM1RyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0QyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7Q0FDRjtBQWxSRCxrRUFrUkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcbmltcG9ydCB7XG4gIFdvcmtmbG93RGVmaW5pdGlvbixcbiAgV29ya2Zsb3dTdGVwLFxuICBXb3JrZmxvd0V4ZWN1dGlvbkNvbnRleHQsXG4gIFdvcmtmbG93RXhlY3V0aW9uUmVzdWx0LFxuICBXb3JrZmxvd09yY2hlc3RyYXRvcixcbn0gZnJvbSAnLi4vdHlwZXMvd29ya2Zsb3ctdHlwZXMnO1xuaW1wb3J0IHsgQWdlbnRDb250ZXh0LCBCYXNlQWdlbnQsIEFnZW50RXhlY3V0aW9uUmVzdWx0IH0gZnJvbSAnLi4vdHlwZXMvYWdlbnQtdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgQmVkcm9ja1dvcmtmbG93T3JjaGVzdHJhdG9yIGltcGxlbWVudHMgV29ya2Zsb3dPcmNoZXN0cmF0b3Ige1xuICBwcml2YXRlIHdvcmtmbG93czogTWFwPHN0cmluZywgV29ya2Zsb3dEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBhZ2VudHM6IE1hcDxzdHJpbmcsIEJhc2VBZ2VudD4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgZXhlY3V0aW9uczogTWFwPHN0cmluZywgV29ya2Zsb3dFeGVjdXRpb25SZXN1bHQ+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIEluaXRpYWxpemUgd2l0aCBlbXB0eSBtYXBzXG4gIH1cblxuICAvLyBSZWdpc3RlciBhIHdvcmtmbG93IGRlZmluaXRpb25cbiAgcmVnaXN0ZXJXb3JrZmxvdyhkZWZpbml0aW9uOiBXb3JrZmxvd0RlZmluaXRpb24pOiB2b2lkIHtcbiAgICB0aGlzLndvcmtmbG93cy5zZXQoZGVmaW5pdGlvbi5pZCwgZGVmaW5pdGlvbik7XG4gIH1cblxuICAvLyBSZWdpc3RlciBhbiBhZ2VudCBmb3IgdXNlIGluIHdvcmtmbG93c1xuICByZWdpc3RlckFnZW50KGFnZW50SWQ6IHN0cmluZywgYWdlbnQ6IEJhc2VBZ2VudCk6IHZvaWQge1xuICAgIHRoaXMuYWdlbnRzLnNldChhZ2VudElkLCBhZ2VudCk7XG4gIH1cblxuICAvLyBFeGVjdXRlIGEgd29ya2Zsb3dcbiAgYXN5bmMgZXhlY3V0ZVdvcmtmbG93KFxuICAgIHdvcmtmbG93SWQ6IHN0cmluZyxcbiAgICBpbnB1dDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxXb3JrZmxvd0V4ZWN1dGlvblJlc3VsdD4ge1xuICAgIGNvbnN0IGV4ZWN1dGlvbklkID0gdXVpZHY0KCk7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcblxuICAgIGNvbnN0IHdvcmtmbG93ID0gdGhpcy53b3JrZmxvd3MuZ2V0KHdvcmtmbG93SWQpO1xuICAgIGlmICghd29ya2Zsb3cpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2Zsb3cgbm90IGZvdW5kOiAke3dvcmtmbG93SWR9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhlY3V0aW9uQ29udGV4dDogV29ya2Zsb3dFeGVjdXRpb25Db250ZXh0ID0ge1xuICAgICAgd29ya2Zsb3dJZCxcbiAgICAgIGV4ZWN1dGlvbklkLFxuICAgICAgYWdlbnRDb250ZXh0OiBjb250ZXh0LFxuICAgICAgaW5wdXQsXG4gICAgICB2YXJpYWJsZXM6IHt9LFxuICAgICAgc3RlcFJlc3VsdHM6IHt9LFxuICAgICAgc3RhcnRUaW1lLFxuICAgIH07XG5cbiAgICBjb25zdCByZXN1bHQ6IFdvcmtmbG93RXhlY3V0aW9uUmVzdWx0ID0ge1xuICAgICAgd29ya2Zsb3dJZCxcbiAgICAgIGV4ZWN1dGlvbklkLFxuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBvdXRwdXQ6IHt9LFxuICAgICAgZXhlY3V0aW9uVGltZTogMCxcbiAgICAgIHN0ZXBSZXN1bHRzOiB7fSxcbiAgICAgIGNvbXBsZXRlZFN0ZXBzOiBbXSxcbiAgICB9O1xuXG4gICAgLy8gU3RvcmUgaW5pdGlhbCBleGVjdXRpb24gc3RhdGVcbiAgICB0aGlzLmV4ZWN1dGlvbnMuc2V0KGV4ZWN1dGlvbklkLCByZXN1bHQpO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEV4ZWN1dGUgd29ya2Zsb3cgc3RlcHNcbiAgICAgIGZvciAoY29uc3Qgc3RlcCBvZiB3b3JrZmxvdy5zdGVwcykge1xuICAgICAgICAvLyBDaGVjayBpZiBzdGVwIHNob3VsZCBiZSBleGVjdXRlZCBiYXNlZCBvbiBjb25kaXRpb25cbiAgICAgICAgaWYgKHN0ZXAuY29uZGl0aW9uICYmICF0aGlzLmV2YWx1YXRlQ29uZGl0aW9uKHN0ZXAuY29uZGl0aW9uLCBleGVjdXRpb25Db250ZXh0KSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZXhlY3V0aW9uQ29udGV4dC5jdXJyZW50U3RlcCA9IHN0ZXAuaWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBzdGVwUmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlU3RlcChzdGVwLCBleGVjdXRpb25Db250ZXh0KTtcbiAgICAgICAgICBleGVjdXRpb25Db250ZXh0LnN0ZXBSZXN1bHRzW3N0ZXAuaWRdID0gc3RlcFJlc3VsdDtcbiAgICAgICAgICByZXN1bHQuc3RlcFJlc3VsdHNbc3RlcC5pZF0gPSBzdGVwUmVzdWx0O1xuICAgICAgICAgIHJlc3VsdC5jb21wbGV0ZWRTdGVwcy5wdXNoKHN0ZXAuaWQpO1xuXG4gICAgICAgICAgLy8gQXBwbHkgb3V0cHV0IG1hcHBpbmcgdG8gdmFyaWFibGVzXG4gICAgICAgICAgaWYgKHN0ZXAub3V0cHV0TWFwcGluZyAmJiBzdGVwUmVzdWx0LnJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlPdXRwdXRNYXBwaW5nKHN0ZXAub3V0cHV0TWFwcGluZywgc3RlcFJlc3VsdC5yZXNwb25zZS5kYXRhLCBleGVjdXRpb25Db250ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVzdWx0LmZhaWxlZFN0ZXAgPSBzdGVwLmlkO1xuICAgICAgICAgIHJlc3VsdC5lcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gc3RlcCBleGVjdXRpb24gZXJyb3InO1xuXG4gICAgICAgICAgLy8gSGFuZGxlIGVycm9yIGJhc2VkIG9uIHdvcmtmbG93IGVycm9yIGhhbmRsaW5nIHBvbGljeVxuICAgICAgICAgIGlmICh3b3JrZmxvdy5lcnJvckhhbmRsaW5nPy5vbkVycm9yID09PSAnc3RvcCcpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAod29ya2Zsb3cuZXJyb3JIYW5kbGluZz8ub25FcnJvciA9PT0gJ2ZhbGxiYWNrJyAmJiB3b3JrZmxvdy5lcnJvckhhbmRsaW5nLmZhbGxiYWNrU3RlcHMpIHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgZmFsbGJhY2sgc3RlcHNcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmFsbGJhY2tTdGVwSWQgb2Ygd29ya2Zsb3cuZXJyb3JIYW5kbGluZy5mYWxsYmFja1N0ZXBzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrU3RlcCA9IHdvcmtmbG93LnN0ZXBzLmZpbmQocyA9PiBzLmlkID09PSBmYWxsYmFja1N0ZXBJZCk7XG4gICAgICAgICAgICAgIGlmIChmYWxsYmFja1N0ZXApIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tSZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVTdGVwKGZhbGxiYWNrU3RlcCwgZXhlY3V0aW9uQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgICBleGVjdXRpb25Db250ZXh0LnN0ZXBSZXN1bHRzW2ZhbGxiYWNrU3RlcC5pZF0gPSBmYWxsYmFja1Jlc3VsdDtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdC5zdGVwUmVzdWx0c1tmYWxsYmFja1N0ZXAuaWRdID0gZmFsbGJhY2tSZXN1bHQ7XG4gICAgICAgICAgICAgICAgICByZXN1bHQuY29tcGxldGVkU3RlcHMucHVzaChmYWxsYmFja1N0ZXAuaWQpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGZhbGxiYWNrRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIC8vIElmIGZhbGxiYWNrIGFsc28gZmFpbHMsIHN0b3AgZXhlY3V0aW9uXG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gRm9yICdjb250aW51ZScgYW5kICdyZXRyeScsIHdlIGNvbnRpbnVlIHRvIG5leHQgc3RlcFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZXhlY3V0aW9uIHRpbWVvdXRcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBtYXhFeGVjdXRpb25UaW1lID0gd29ya2Zsb3cuZXJyb3JIYW5kbGluZz8ubWF4RXhlY3V0aW9uVGltZSB8fCAzMDAwMDA7IC8vIDUgbWludXRlcyBkZWZhdWx0XG4gICAgICAgIGlmIChjdXJyZW50VGltZSAtIHN0YXJ0VGltZS5nZXRUaW1lKCkgPiBtYXhFeGVjdXRpb25UaW1lKSB7XG4gICAgICAgICAgcmVzdWx0LmVycm9yID0gJ1dvcmtmbG93IGV4ZWN1dGlvbiB0aW1lb3V0JztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgb3ZlcmFsbCBzdWNjZXNzXG4gICAgICByZXN1bHQuc3VjY2VzcyA9IHJlc3VsdC5jb21wbGV0ZWRTdGVwcy5sZW5ndGggPiAwICYmICFyZXN1bHQuZXJyb3I7XG4gICAgICByZXN1bHQub3V0cHV0ID0gZXhlY3V0aW9uQ29udGV4dC52YXJpYWJsZXM7XG4gICAgICByZXN1bHQuZXhlY3V0aW9uVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpO1xuXG4gICAgICAvLyBVcGRhdGUgc3RvcmVkIGV4ZWN1dGlvbiByZXN1bHRcbiAgICAgIHRoaXMuZXhlY3V0aW9ucy5zZXQoZXhlY3V0aW9uSWQsIHJlc3VsdCk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJlc3VsdC5lcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gd29ya2Zsb3cgZXhlY3V0aW9uIGVycm9yJztcbiAgICAgIHJlc3VsdC5leGVjdXRpb25UaW1lID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLmV4ZWN1dGlvbnMuc2V0KGV4ZWN1dGlvbklkLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvLyBFeGVjdXRlIGEgc2luZ2xlIHdvcmtmbG93IHN0ZXBcbiAgcHJpdmF0ZSBhc3luYyBleGVjdXRlU3RlcChcbiAgICBzdGVwOiBXb3JrZmxvd1N0ZXAsXG4gICAgY29udGV4dDogV29ya2Zsb3dFeGVjdXRpb25Db250ZXh0XG4gICk6IFByb21pc2U8QWdlbnRFeGVjdXRpb25SZXN1bHQ+IHtcbiAgICBjb25zdCBhZ2VudCA9IHRoaXMuYWdlbnRzLmdldChzdGVwLmFnZW50SWQpO1xuICAgIGlmICghYWdlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQWdlbnQgbm90IGZvdW5kOiAke3N0ZXAuYWdlbnRJZH1gKTtcbiAgICB9XG5cbiAgICAvLyBQcmVwYXJlIGlucHV0IGZvciB0aGUgYWdlbnRcbiAgICBsZXQgc3RlcElucHV0OiBhbnkgPSBjb250ZXh0LmlucHV0O1xuICAgIGlmIChzdGVwLmlucHV0TWFwcGluZykge1xuICAgICAgc3RlcElucHV0ID0gdGhpcy5hcHBseUlucHV0TWFwcGluZyhzdGVwLmlucHV0TWFwcGluZywgY29udGV4dCk7XG4gICAgfVxuXG4gICAgLy8gRXhlY3V0ZSB3aXRoIHJldHJ5IHBvbGljeVxuICAgIGNvbnN0IHJldHJ5UG9saWN5ID0gc3RlcC5yZXRyeVBvbGljeSB8fCB7XG4gICAgICBtYXhSZXRyaWVzOiAzLFxuICAgICAgYmFja29mZk11bHRpcGxpZXI6IDIsXG4gICAgICBpbml0aWFsRGVsYXk6IDEwMDAsXG4gICAgfTtcblxuICAgIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGRlbGF5ID0gcmV0cnlQb2xpY3kuaW5pdGlhbERlbGF5O1xuXG4gICAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPD0gcmV0cnlQb2xpY3kubWF4UmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgYWdlbnQuZXhlY3V0ZShzdGVwSW5wdXQsIGNvbnRleHQuYWdlbnRDb250ZXh0KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxhc3RFcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcignVW5rbm93biBlcnJvcicpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGF0dGVtcHQgPCByZXRyeVBvbGljeS5tYXhSZXRyaWVzKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zbGVlcChkZWxheSk7XG4gICAgICAgICAgZGVsYXkgKj0gcmV0cnlQb2xpY3kuYmFja29mZk11bHRpcGxpZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBsYXN0RXJyb3IgfHwgbmV3IEVycm9yKCdTdGVwIGV4ZWN1dGlvbiBmYWlsZWQgYWZ0ZXIgcmV0cmllcycpO1xuICB9XG5cbiAgLy8gQXBwbHkgaW5wdXQgbWFwcGluZyB0byB0cmFuc2Zvcm0gY29udGV4dCBkYXRhIGZvciBhZ2VudCBpbnB1dFxuICBwcml2YXRlIGFwcGx5SW5wdXRNYXBwaW5nKFxuICAgIG1hcHBpbmc6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gICAgY29udGV4dDogV29ya2Zsb3dFeGVjdXRpb25Db250ZXh0XG4gICk6IGFueSB7XG4gICAgY29uc3QgcmVzdWx0OiBhbnkgPSB7fTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IFt0YXJnZXRLZXksIHNvdXJjZVBhdGhdIG9mIE9iamVjdC5lbnRyaWVzKG1hcHBpbmcpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWVCeVBhdGgoc291cmNlUGF0aCwgY29udGV4dCk7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXN1bHRbdGFyZ2V0S2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gQXBwbHkgb3V0cHV0IG1hcHBpbmcgdG8gc3RvcmUgYWdlbnQgcmVzdWx0cyBpbiBjb250ZXh0IHZhcmlhYmxlc1xuICBwcml2YXRlIGFwcGx5T3V0cHV0TWFwcGluZyhcbiAgICBtYXBwaW5nOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxuICAgIGFnZW50T3V0cHV0OiBhbnksXG4gICAgY29udGV4dDogV29ya2Zsb3dFeGVjdXRpb25Db250ZXh0XG4gICk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgW3NvdXJjZVBhdGgsIHRhcmdldEtleV0gb2YgT2JqZWN0LmVudHJpZXMobWFwcGluZykpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZUJ5UGF0aChzb3VyY2VQYXRoLCB7IGRhdGE6IGFnZW50T3V0cHV0IH0pO1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29udGV4dC52YXJpYWJsZXNbdGFyZ2V0S2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEdldCB2YWx1ZSBmcm9tIG9iamVjdCBieSBkb3Qgbm90YXRpb24gcGF0aFxuICBwcml2YXRlIGdldFZhbHVlQnlQYXRoKHBhdGg6IHN0cmluZywgb2JqOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBwYXRoLnNwbGl0KCcuJykucmVkdWNlKChjdXJyZW50LCBrZXkpID0+IHtcbiAgICAgIHJldHVybiBjdXJyZW50ICYmIGN1cnJlbnRba2V5XSAhPT0gdW5kZWZpbmVkID8gY3VycmVudFtrZXldIDogdW5kZWZpbmVkO1xuICAgIH0sIG9iaik7XG4gIH1cblxuICAvLyBFdmFsdWF0ZSBjb25kaXRpb24gZXhwcmVzc2lvbiAoc2ltcGxlIGltcGxlbWVudGF0aW9uKVxuICBwcml2YXRlIGV2YWx1YXRlQ29uZGl0aW9uKGNvbmRpdGlvbjogc3RyaW5nLCBjb250ZXh0OiBXb3JrZmxvd0V4ZWN1dGlvbkNvbnRleHQpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgLy8gU2ltcGxlIGNvbmRpdGlvbiBldmFsdWF0aW9uIC0gaW4gcHJvZHVjdGlvbiwgdXNlIGEgcHJvcGVyIGV4cHJlc3Npb24gZXZhbHVhdG9yXG4gICAgICAvLyBUaGlzIGlzIGEgYmFzaWMgaW1wbGVtZW50YXRpb24gZm9yIGNvbW1vbiBwYXR0ZXJuc1xuICAgICAgXG4gICAgICAvLyBSZXBsYWNlIHZhcmlhYmxlIHJlZmVyZW5jZXMgd2l0aCBhY3R1YWwgdmFsdWVzXG4gICAgICBsZXQgZXZhbHVhYmxlQ29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgY29uc3QgdmFyaWFibGVQYXR0ZXJuID0gL1xcJFxceyhbXn1dKylcXH0vZztcbiAgICAgIFxuICAgICAgZXZhbHVhYmxlQ29uZGl0aW9uID0gZXZhbHVhYmxlQ29uZGl0aW9uLnJlcGxhY2UodmFyaWFibGVQYXR0ZXJuLCAoX21hdGNoLCB2YXJQYXRoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZUJ5UGF0aCh2YXJQYXRoLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBCYXNpYyBldmFsdWF0aW9uIChpbiBwcm9kdWN0aW9uLCB1c2UgYSBzYWZlIGV4cHJlc3Npb24gZXZhbHVhdG9yKVxuICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbigncmV0dXJuICcgKyBldmFsdWFibGVDb25kaXRpb24pKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIElmIGNvbmRpdGlvbiBldmFsdWF0aW9uIGZhaWxzLCBkZWZhdWx0IHRvIHRydWUgdG8gY29udGludWUgZXhlY3V0aW9uXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBHZXQgd29ya2Zsb3cgZXhlY3V0aW9uIHN0YXR1c1xuICBhc3luYyBnZXRXb3JrZmxvd1N0YXR1cyhleGVjdXRpb25JZDogc3RyaW5nKTogUHJvbWlzZTxXb3JrZmxvd0V4ZWN1dGlvblJlc3VsdCB8IG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5leGVjdXRpb25zLmdldChleGVjdXRpb25JZCkgfHwgbnVsbDtcbiAgfVxuXG4gIC8vIENhbmNlbCB3b3JrZmxvdyBleGVjdXRpb25cbiAgYXN5bmMgY2FuY2VsV29ya2Zsb3coZXhlY3V0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGV4ZWN1dGlvbiA9IHRoaXMuZXhlY3V0aW9ucy5nZXQoZXhlY3V0aW9uSWQpO1xuICAgIGlmIChleGVjdXRpb24pIHtcbiAgICAgIGV4ZWN1dGlvbi5lcnJvciA9ICdXb3JrZmxvdyBjYW5jZWxsZWQgYnkgdXNlcic7XG4gICAgICBleGVjdXRpb24uc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEdldCBhbGwgcmVnaXN0ZXJlZCB3b3JrZmxvd3NcbiAgZ2V0V29ya2Zsb3dzKCk6IFdvcmtmbG93RGVmaW5pdGlvbltdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLndvcmtmbG93cy52YWx1ZXMoKSk7XG4gIH1cblxuICAvLyBHZXQgYWxsIHJlZ2lzdGVyZWQgYWdlbnRzXG4gIGdldEFnZW50cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5hZ2VudHMua2V5cygpKTtcbiAgfVxuXG4gIC8vIFV0aWxpdHkgbWV0aG9kIGZvciBkZWxheXNcbiAgcHJpdmF0ZSBzbGVlcChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICB9XG5cbiAgLy8gQ2xlYXIgY29tcGxldGVkIGV4ZWN1dGlvbnMgKGNsZWFudXAgbWV0aG9kKVxuICBjbGVhckNvbXBsZXRlZEV4ZWN1dGlvbnMob2xkZXJUaGFuTXM6IG51bWJlciA9IDM2MDAwMDApOiB2b2lkIHsgLy8gMSBob3VyIGRlZmF1bHRcbiAgICBjb25zdCBjdXRvZmZUaW1lID0gRGF0ZS5ub3coKSAtIG9sZGVyVGhhbk1zO1xuICAgIFxuICAgIGZvciAoY29uc3QgW2V4ZWN1dGlvbklkLCByZXN1bHRdIG9mIHRoaXMuZXhlY3V0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChyZXN1bHQuZXhlY3V0aW9uVGltZSA+IDAgJiYgXG4gICAgICAgICAgKHJlc3VsdC5zdGVwUmVzdWx0c1tPYmplY3Qua2V5cyhyZXN1bHQuc3RlcFJlc3VsdHMpWzBdXT8uY29udGV4dC50aW1lc3RhbXAuZ2V0VGltZSgpIHx8IDApIDwgY3V0b2ZmVGltZSkge1xuICAgICAgICB0aGlzLmV4ZWN1dGlvbnMuZGVsZXRlKGV4ZWN1dGlvbklkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0iXX0=