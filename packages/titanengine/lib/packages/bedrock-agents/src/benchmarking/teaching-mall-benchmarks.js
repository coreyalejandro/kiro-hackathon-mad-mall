"use strict";
/**
 * Teaching Mall Benchmarking Integration
 *
 * Integrates Sierra-style benchmarking with the Teaching Mall concept
 * where AI agents learn and improve through collaborative evaluation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingMallBenchmarkSystem = void 0;
const sierra_cultural_benchmark_1 = require("./sierra-cultural-benchmark");
const orchestrator_1 = require("../workflows/orchestrator");
class TeachingMallBenchmarkSystem {
    constructor() {
        this.teachingSessions = new Map();
        this.benchmarkEngine = new sierra_cultural_benchmark_1.SierraCulturalBenchmarkEngine();
        this.orchestrator = new orchestrator_1.BedrockWorkflowOrchestrator();
    }
    registerAgent(agentId, agent) {
        this.benchmarkEngine.registerAgent(agentId, agent);
        this.orchestrator.registerAgent(agentId, agent);
    }
    /**
     * Conduct a Teaching Mall benchmark session where agents collaborate
     * and learn from each other while being evaluated
     */
    async conductTeachingMallSession(leadAgentId, consultingAgentIds, benchmarkSuite, context) {
        const sessionId = `teaching-mall-${Date.now()}`;
        const session = {
            sessionId,
            timestamp: new Date(),
            participants: {
                leadAgent: leadAgentId,
                consultingAgents: consultingAgentIds,
                evaluatorAgents: [...consultingAgentIds, 'cultural-validation-agent'] // Cultural agent always evaluates
            },
            benchmarkSuite,
            collaborativeResults: [],
            learningOutcomes: [],
            teachingMoments: []
        };
        console.log(`🏛️  Starting Teaching Mall Benchmark Session: ${sessionId}`);
        console.log(`Lead Agent: ${leadAgentId}`);
        console.log(`Consulting Agents: ${consultingAgentIds.join(', ')}`);
        // Run individual benchmarks for each agent
        const allAgentIds = [leadAgentId, ...consultingAgentIds];
        for (const agentId of allAgentIds) {
            console.log(`\n📊 Benchmarking ${agentId}...`);
            const individualResults = await this.benchmarkEngine.runBenchmarkSuite(agentId, benchmarkSuite, context);
            // Convert to collaborative results with peer evaluations
            for (const result of individualResults) {
                const collaborativeResult = await this.enhanceWithCollaboration(result, allAgentIds.filter(id => id !== agentId), context);
                session.collaborativeResults.push(collaborativeResult);
            }
        }
        // Conduct peer teaching and evaluation
        session.teachingMoments = await this.facilitateTeachingMoments(allAgentIds, session.collaborativeResults, context);
        // Generate learning outcomes
        session.learningOutcomes = await this.generateLearningOutcomes(session.collaborativeResults, session.teachingMoments);
        this.teachingSessions.set(sessionId, session);
        console.log(`\n✅ Teaching Mall Session Complete: ${sessionId}`);
        console.log(`Teaching Moments: ${session.teachingMoments.length}`);
        console.log(`Learning Outcomes Generated: ${session.learningOutcomes.length}`);
        return session;
    }
    /**
     * Enhance individual benchmark results with peer collaboration
     */
    async enhanceWithCollaboration(individualResult, peerAgentIds, context) {
        const peerEvaluations = [];
        // Get peer evaluations from other agents
        for (const peerAgentId of peerAgentIds) {
            const peerEvaluation = await this.getPeerEvaluation(peerAgentId, individualResult, context);
            peerEvaluations.push(peerEvaluation);
        }
        // Calculate collaboration metrics
        const collaborationScore = this.calculateCollaborationScore(peerEvaluations);
        const teachingContribution = this.calculateTeachingContribution(peerEvaluations);
        const learningReceptivity = this.calculateLearningReceptivity(individualResult, peerEvaluations);
        return {
            ...individualResult,
            peerEvaluations,
            collaborationScore,
            teachingContribution,
            learningReceptivity
        };
    }
    /**
     * Get peer evaluation from another agent
     */
    async getPeerEvaluation(evaluatorAgentId, targetResult, _context) {
        // In a real implementation, this would use the evaluator agent to assess the target's performance
        // For now, we'll simulate peer evaluation based on the results
        const culturalScore = targetResult.culturalEvaluation?.appropriateness || 0.5;
        const overallScore = targetResult.scores.overall;
        return {
            evaluatorAgentId,
            targetAgentId: targetResult.agentId,
            culturalCompetencyFeedback: this.generateCulturalFeedback(culturalScore),
            collaborationFeedback: this.generateCollaborationFeedback(overallScore),
            teachingQuality: Math.min(1, overallScore + 0.1), // Slight bonus for teaching
            learningDemonstrated: culturalScore,
            improvementSuggestions: this.generateImprovementSuggestions(targetResult)
        };
    }
    /**
     * Facilitate teaching moments between agents
     */
    async facilitateTeachingMoments(agentIds, results, context) {
        const teachingMoments = [];
        // Find opportunities for teaching based on performance differences
        for (let i = 0; i < agentIds.length; i++) {
            for (let j = 0; j < agentIds.length; j++) {
                if (i === j)
                    continue;
                const teacherResults = results.filter(r => r.agentId === agentIds[i]);
                const studentResults = results.filter(r => r.agentId === agentIds[j]);
                if (teacherResults.length === 0 || studentResults.length === 0)
                    continue;
                const teacherCulturalScore = this.getAverageCulturalScore(teacherResults);
                const studentCulturalScore = this.getAverageCulturalScore(studentResults);
                // If teacher has significantly better cultural competency, create teaching moment
                if (teacherCulturalScore - studentCulturalScore > 0.2) {
                    const teachingMoment = await this.createTeachingMoment(agentIds[i], // teacher
                    agentIds[j], // student
                    'cultural_competency', teacherCulturalScore, studentCulturalScore, context);
                    teachingMoments.push(teachingMoment);
                }
            }
        }
        return teachingMoments;
    }
    /**
     * Create a specific teaching moment between two agents
     */
    async createTeachingMoment(teacherAgentId, studentAgentId, topic, teacherScore, studentScore, _context) {
        // Simulate teaching interaction
        const teachingMethods = ['demonstration', 'correction', 'guidance', 'validation'];
        const method = teachingMethods[Math.floor(Math.random() * teachingMethods.length)];
        const effectiveness = Math.min(1, (teacherScore - studentScore) * 2);
        return {
            teacherAgentId,
            studentAgentId,
            topic,
            teachingMethod: method,
            culturalContext: 'Black women\'s healthcare experiences',
            effectiveness,
            studentResponse: this.generateStudentResponse(method, effectiveness)
        };
    }
    /**
     * Generate learning outcomes for each agent based on the session
     */
    async generateLearningOutcomes(results, teachingMoments) {
        const outcomesByAgent = new Map();
        // Initialize outcomes for each agent
        const agentIds = [...new Set(results.map(r => r.agentId))];
        for (const agentId of agentIds) {
            outcomesByAgent.set(agentId, {
                agentId,
                skillsImproved: [],
                culturalInsights: [],
                collaborationLessons: [],
                nextLearningGoals: [],
                confidenceGrowth: 0
            });
        }
        // Analyze results for learning outcomes
        for (const result of results) {
            const outcome = outcomesByAgent.get(result.agentId);
            // Identify skills that improved
            if (result.scores.culturalCompetency > 0.8) {
                outcome.skillsImproved.push('Cultural sensitivity in healthcare contexts');
            }
            if (result.collaborationScore > 0.7) {
                outcome.skillsImproved.push('Collaborative problem-solving');
            }
            // Extract cultural insights from peer feedback
            result.peerEvaluations.forEach(evaluation => {
                if (evaluation.culturalCompetencyFeedback.includes('strength')) {
                    outcome.culturalInsights.push('Demonstrated cultural awareness in peer interactions');
                }
            });
            // Set confidence growth based on overall performance
            outcome.confidenceGrowth = Math.max(outcome.confidenceGrowth, result.scores.overall - 0.5);
        }
        // Analyze teaching moments for additional learning
        for (const moment of teachingMoments) {
            const studentOutcome = outcomesByAgent.get(moment.studentAgentId);
            const teacherOutcome = outcomesByAgent.get(moment.teacherAgentId);
            if (studentOutcome && moment.effectiveness > 0.6) {
                studentOutcome.collaborationLessons.push(`Learned ${moment.topic} through ${moment.teachingMethod} from ${moment.teacherAgentId}`);
                studentOutcome.nextLearningGoals.push(`Continue developing ${moment.topic} skills`);
            }
            if (teacherOutcome) {
                teacherOutcome.skillsImproved.push('Peer mentoring and knowledge transfer');
                teacherOutcome.collaborationLessons.push(`Successfully taught ${moment.topic} to peer agent`);
            }
        }
        return Array.from(outcomesByAgent.values());
    }
    /**
     * Generate a comprehensive Teaching Mall report
     */
    async generateTeachingMallReport(sessionId) {
        const session = this.teachingSessions.get(sessionId);
        if (!session) {
            throw new Error(`Teaching Mall session not found: ${sessionId}`);
        }
        // Calculate agent rankings
        const agentRankings = this.calculateAgentRankings(session.collaborativeResults);
        // Analyze collaboration patterns
        const collaborationInsights = this.analyzeCollaborationPatterns(session);
        // Evaluate teaching effectiveness
        const teachingEffectiveness = this.evaluateTeachingEffectiveness(session.teachingMoments);
        // Generate improvement plans
        const recommendedImprovements = this.generateImprovementPlans(session);
        return {
            session,
            agentRankings,
            collaborationInsights,
            teachingEffectiveness,
            recommendedImprovements
        };
    }
    // Helper methods
    calculateCollaborationScore(peerEvaluations) {
        if (peerEvaluations.length === 0)
            return 0.5;
        return peerEvaluations.reduce((sum, evaluation) => sum + evaluation.teachingQuality, 0) / peerEvaluations.length;
    }
    calculateTeachingContribution(peerEvaluations) {
        if (peerEvaluations.length === 0)
            return 0.5;
        return peerEvaluations.reduce((sum, evaluation) => sum + evaluation.teachingQuality, 0) / peerEvaluations.length;
    }
    calculateLearningReceptivity(result, peerEvaluations) {
        const baseReceptivity = result.scores.overall;
        const peerLearningScore = peerEvaluations.length > 0
            ? peerEvaluations.reduce((sum, evaluation) => sum + evaluation.learningDemonstrated, 0) / peerEvaluations.length
            : 0.5;
        return (baseReceptivity + peerLearningScore) / 2;
    }
    getAverageCulturalScore(results) {
        if (results.length === 0)
            return 0;
        return results.reduce((sum, r) => sum + r.scores.culturalCompetency, 0) / results.length;
    }
    generateCulturalFeedback(score) {
        if (score > 0.8)
            return 'Demonstrates strong cultural competency and sensitivity';
        if (score > 0.6)
            return 'Shows good cultural awareness with room for improvement';
        return 'Needs significant improvement in cultural competency';
    }
    generateCollaborationFeedback(score) {
        if (score > 0.8)
            return 'Excellent collaborative partner, contributes meaningfully to team outcomes';
        if (score > 0.6)
            return 'Good team player with effective communication';
        return 'Could improve collaborative skills and peer interaction';
    }
    generateImprovementSuggestions(result) {
        const suggestions = [];
        if (result.scores.culturalCompetency < 0.7) {
            suggestions.push('Focus on cultural sensitivity training and community engagement');
        }
        if (result.scores.safety < 0.8) {
            suggestions.push('Review safety protocols and harm prevention strategies');
        }
        if (result.scores.accuracy < 0.7) {
            suggestions.push('Improve response accuracy through additional training data');
        }
        return suggestions;
    }
    generateStudentResponse(method, effectiveness) {
        const responses = {
            demonstration: effectiveness > 0.7 ? 'I see how that approach is more culturally sensitive' : 'I need more examples to understand',
            correction: effectiveness > 0.7 ? 'Thank you for the correction, I understand now' : 'I\'m still unclear on the right approach',
            guidance: effectiveness > 0.7 ? 'That guidance helps me see the cultural nuances' : 'I need more specific direction',
            validation: effectiveness > 0.7 ? 'I appreciate the validation of my cultural awareness' : 'I\'m not sure I fully grasp the concept'
        };
        return responses[method];
    }
    calculateAgentRankings(results) {
        const agentScores = new Map();
        results.forEach(result => {
            if (!agentScores.has(result.agentId)) {
                agentScores.set(result.agentId, []);
            }
            agentScores.get(result.agentId).push(result.scores.overall);
        });
        return Array.from(agentScores.entries())
            .map(([agentId, scores]) => ({
            agentId,
            averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
            rank: 0 // Will be set after sorting
        }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((ranking, index) => ({ ...ranking, rank: index + 1 }));
    }
    analyzeCollaborationPatterns(_session) {
        // Analyze how well agents worked together
        return [
            {
                pattern: 'Cultural Mentorship',
                description: 'Cultural Validation Agent effectively mentored other agents in cultural competency',
                strength: 0.8,
                recommendation: 'Continue leveraging cultural expertise for peer teaching'
            }
        ];
    }
    evaluateTeachingEffectiveness(teachingMoments) {
        const avgEffectiveness = teachingMoments.length > 0
            ? teachingMoments.reduce((sum, moment) => sum + moment.effectiveness, 0) / teachingMoments.length
            : 0;
        return {
            overallEffectiveness: avgEffectiveness,
            totalTeachingMoments: teachingMoments.length,
            mostEffectiveMethod: this.getMostEffectiveTeachingMethod(teachingMoments),
            improvementAreas: avgEffectiveness < 0.7 ? ['Increase teaching moment frequency', 'Improve teaching methods'] : []
        };
    }
    getMostEffectiveTeachingMethod(moments) {
        const methodEffectiveness = new Map();
        moments.forEach(moment => {
            if (!methodEffectiveness.has(moment.teachingMethod)) {
                methodEffectiveness.set(moment.teachingMethod, []);
            }
            methodEffectiveness.get(moment.teachingMethod).push(moment.effectiveness);
        });
        let bestMethod = 'demonstration';
        let bestScore = 0;
        methodEffectiveness.forEach((scores, method) => {
            const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            if (avgScore > bestScore) {
                bestScore = avgScore;
                bestMethod = method;
            }
        });
        return bestMethod;
    }
    generateImprovementPlans(session) {
        return session.learningOutcomes.map(outcome => ({
            agentId: outcome.agentId,
            currentStrengths: outcome.skillsImproved,
            improvementAreas: outcome.nextLearningGoals,
            recommendedActions: [
                'Participate in more collaborative benchmarking sessions',
                'Focus on peer teaching opportunities',
                'Engage with cultural competency training modules'
            ],
            mentorshipOpportunities: outcome.collaborationLessons.length > 0
                ? ['Peer mentoring program', 'Cultural competency workshops']
                : ['Seek mentorship from high-performing cultural agents']
        }));
    }
}
exports.TeachingMallBenchmarkSystem = TeachingMallBenchmarkSystem;
//# sourceMappingURL=teaching-mall-benchmarks.js.map