import { WorkflowDefinition, WorkflowExecutionResult, WorkflowOrchestrator } from '../types/workflow-types';
import { AgentContext, BaseAgent } from '../types/agent-types';
export declare class BedrockWorkflowOrchestrator implements WorkflowOrchestrator {
    private workflows;
    private agents;
    private executions;
    constructor();
    registerWorkflow(definition: WorkflowDefinition): void;
    registerAgent(agentId: string, agent: BaseAgent): void;
    executeWorkflow(workflowId: string, input: Record<string, any>, context: AgentContext): Promise<WorkflowExecutionResult>;
    private executeStep;
    private applyInputMapping;
    private applyOutputMapping;
    private getValueByPath;
    private evaluateCondition;
    getWorkflowStatus(executionId: string): Promise<WorkflowExecutionResult | null>;
    cancelWorkflow(executionId: string): Promise<boolean>;
    getWorkflows(): WorkflowDefinition[];
    getAgents(): string[];
    private sleep;
    clearCompletedExecutions(olderThanMs?: number): void;
}
//# sourceMappingURL=orchestrator.d.ts.map