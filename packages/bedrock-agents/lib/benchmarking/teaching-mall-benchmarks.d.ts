/**
 * Teaching Mall Benchmarking Integration
 *
 * Integrates Sierra-style benchmarking with the Teaching Mall concept
 * where AI agents learn and improve through collaborative evaluation
 */
import { BenchmarkResult } from './sierra-cultural-benchmark';
import { AgentContext, BaseAgent } from '../types/agent-types';
export interface TeachingMallBenchmarkSession {
    sessionId: string;
    timestamp: Date;
    participants: {
        leadAgent: string;
        consultingAgents: string[];
        evaluatorAgents: string[];
    };
    benchmarkSuite: string;
    collaborativeResults: CollaborativeBenchmarkResult[];
    learningOutcomes: AgentLearningOutcome[];
    teachingMoments: TeachingMoment[];
}
export interface CollaborativeBenchmarkResult extends BenchmarkResult {
    peerEvaluations: PeerEvaluation[];
    collaborationScore: number;
    teachingContribution: number;
    learningReceptivity: number;
}
export interface PeerEvaluation {
    evaluatorAgentId: string;
    targetAgentId: string;
    culturalCompetencyFeedback: string;
    collaborationFeedback: string;
    teachingQuality: number;
    learningDemonstrated: number;
    improvementSuggestions: string[];
}
export interface AgentLearningOutcome {
    agentId: string;
    skillsImproved: string[];
    culturalInsights: string[];
    collaborationLessons: string[];
    nextLearningGoals: string[];
    confidenceGrowth: number;
}
export interface TeachingMoment {
    teacherAgentId: string;
    studentAgentId: string;
    topic: string;
    teachingMethod: 'demonstration' | 'correction' | 'guidance' | 'validation';
    culturalContext: string;
    effectiveness: number;
    studentResponse: string;
}
export declare class TeachingMallBenchmarkSystem {
    private benchmarkEngine;
    private orchestrator;
    private teachingSessions;
    constructor();
    registerAgent(agentId: string, agent: BaseAgent): void;
    /**
     * Conduct a Teaching Mall benchmark session where agents collaborate
     * and learn from each other while being evaluated
     */
    conductTeachingMallSession(leadAgentId: string, consultingAgentIds: string[], benchmarkSuite: string, context: AgentContext): Promise<TeachingMallBenchmarkSession>;
    /**
     * Enhance individual benchmark results with peer collaboration
     */
    private enhanceWithCollaboration;
    /**
     * Get peer evaluation from another agent
     */
    private getPeerEvaluation;
    /**
     * Facilitate teaching moments between agents
     */
    private facilitateTeachingMoments;
    /**
     * Create a specific teaching moment between two agents
     */
    private createTeachingMoment;
    /**
     * Generate learning outcomes for each agent based on the session
     */
    private generateLearningOutcomes;
    /**
     * Generate a comprehensive Teaching Mall report
     */
    generateTeachingMallReport(sessionId: string): Promise<{
        session: TeachingMallBenchmarkSession;
        agentRankings: AgentRanking[];
        collaborationInsights: CollaborationInsight[];
        teachingEffectiveness: TeachingEffectivenessReport;
        recommendedImprovements: AgentImprovementPlan[];
    }>;
    private calculateCollaborationScore;
    private calculateTeachingContribution;
    private calculateLearningReceptivity;
    private getAverageCulturalScore;
    private generateCulturalFeedback;
    private generateCollaborationFeedback;
    private generateImprovementSuggestions;
    private generateStudentResponse;
    private calculateAgentRankings;
    private analyzeCollaborationPatterns;
    private evaluateTeachingEffectiveness;
    private getMostEffectiveTeachingMethod;
    private generateImprovementPlans;
}
interface AgentRanking {
    agentId: string;
    averageScore: number;
    rank: number;
}
interface CollaborationInsight {
    pattern: string;
    description: string;
    strength: number;
    recommendation: string;
}
interface TeachingEffectivenessReport {
    overallEffectiveness: number;
    totalTeachingMoments: number;
    mostEffectiveMethod: string;
    improvementAreas: string[];
}
interface AgentImprovementPlan {
    agentId: string;
    currentStrengths: string[];
    improvementAreas: string[];
    recommendedActions: string[];
    mentorshipOpportunities: string[];
}
export {};
//# sourceMappingURL=teaching-mall-benchmarks.d.ts.map