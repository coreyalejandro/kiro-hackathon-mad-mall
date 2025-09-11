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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVhY2hpbmctbWFsbC1iZW5jaG1hcmtzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2JlbmNobWFya2luZy90ZWFjaGluZy1tYWxsLWJlbmNobWFya3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOzs7QUFFSCwyRUFBNkY7QUFDN0YsNERBQXdFO0FBcUR4RSxNQUFhLDJCQUEyQjtJQUt0QztRQUZRLHFCQUFnQixHQUE4QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRzlFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSx5REFBNkIsRUFBRSxDQUFDO1FBQzNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSwwQ0FBMkIsRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRCxhQUFhLENBQUMsT0FBZSxFQUFFLEtBQWdCO1FBQzdDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FDOUIsV0FBbUIsRUFDbkIsa0JBQTRCLEVBQzVCLGNBQXNCLEVBQ3RCLE9BQXFCO1FBRXJCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUNoRCxNQUFNLE9BQU8sR0FBaUM7WUFDNUMsU0FBUztZQUNULFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtZQUNyQixZQUFZLEVBQUU7Z0JBQ1osU0FBUyxFQUFFLFdBQVc7Z0JBQ3RCLGdCQUFnQixFQUFFLGtCQUFrQjtnQkFDcEMsZUFBZSxFQUFFLENBQUMsR0FBRyxrQkFBa0IsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDLGtDQUFrQzthQUN6RztZQUNELGNBQWM7WUFDZCxvQkFBb0IsRUFBRSxFQUFFO1lB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LEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMvRSxJQUFJLFFBQVEsR0FBRyxTQUFTLEVBQUUsQ0FBQztnQkFDekIsU0FBUyxHQUFHLFFBQVEsQ0FBQztnQkFDckIsVUFBVSxHQUFHLE1BQU0sQ0FBQztZQUN0QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRU8sd0JBQXdCLENBQUMsT0FBcUM7UUFDcEUsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5QyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGNBQWM7WUFDeEMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQjtZQUMzQyxrQkFBa0IsRUFBRTtnQkFDbEIseURBQXlEO2dCQUN6RCxzQ0FBc0M7Z0JBQ3RDLGtEQUFrRDthQUNuRDtZQUNELHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDOUQsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsK0JBQStCLENBQUM7Z0JBQzdELENBQUMsQ0FBQyxDQUFDLHNEQUFzRCxDQUFDO1NBQzdELENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztDQUNGO0FBbGRELGtFQWtkQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGVhY2hpbmcgTWFsbCBCZW5jaG1hcmtpbmcgSW50ZWdyYXRpb25cbiAqIFxuICogSW50ZWdyYXRlcyBTaWVycmEtc3R5bGUgYmVuY2htYXJraW5nIHdpdGggdGhlIFRlYWNoaW5nIE1hbGwgY29uY2VwdFxuICogd2hlcmUgQUkgYWdlbnRzIGxlYXJuIGFuZCBpbXByb3ZlIHRocm91Z2ggY29sbGFib3JhdGl2ZSBldmFsdWF0aW9uXG4gKi9cblxuaW1wb3J0IHsgU2llcnJhQ3VsdHVyYWxCZW5jaG1hcmtFbmdpbmUsIEJlbmNobWFya1Jlc3VsdCB9IGZyb20gJy4vc2llcnJhLWN1bHR1cmFsLWJlbmNobWFyayc7XG5pbXBvcnQgeyBCZWRyb2NrV29ya2Zsb3dPcmNoZXN0cmF0b3IgfSBmcm9tICcuLi93b3JrZmxvd3Mvb3JjaGVzdHJhdG9yJztcbmltcG9ydCB7IEFnZW50Q29udGV4dCwgQmFzZUFnZW50IH0gZnJvbSAnLi4vdHlwZXMvYWdlbnQtdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRlYWNoaW5nTWFsbEJlbmNobWFya1Nlc3Npb24ge1xuICBzZXNzaW9uSWQ6IHN0cmluZztcbiAgdGltZXN0YW1wOiBEYXRlO1xuICBwYXJ0aWNpcGFudHM6IHtcbiAgICBsZWFkQWdlbnQ6IHN0cmluZztcbiAgICBjb25zdWx0aW5nQWdlbnRzOiBzdHJpbmdbXTtcbiAgICBldmFsdWF0b3JBZ2VudHM6IHN0cmluZ1tdO1xuICB9O1xuICBiZW5jaG1hcmtTdWl0ZTogc3RyaW5nO1xuICBjb2xsYWJvcmF0aXZlUmVzdWx0czogQ29sbGFib3JhdGl2ZUJlbmNobWFya1Jlc3VsdFtdO1xuICBsZWFybmluZ091dGNvbWVzOiBBZ2VudExlYXJuaW5nT3V0Y29tZVtdO1xuICB0ZWFjaGluZ01vbWVudHM6IFRlYWNoaW5nTW9tZW50W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sbGFib3JhdGl2ZUJlbmNobWFya1Jlc3VsdCBleHRlbmRzIEJlbmNobWFya1Jlc3VsdCB7XG4gIHBlZXJFdmFsdWF0aW9uczogUGVlckV2YWx1YXRpb25bXTtcbiAgY29sbGFib3JhdGlvblNjb3JlOiBudW1iZXI7XG4gIHRlYWNoaW5nQ29udHJpYnV0aW9uOiBudW1iZXI7XG4gIGxlYXJuaW5nUmVjZXB0aXZpdHk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZWVyRXZhbHVhdGlvbiB7XG4gIGV2YWx1YXRvckFnZW50SWQ6IHN0cmluZztcbiAgdGFyZ2V0QWdlbnRJZDogc3RyaW5nO1xuICBjdWx0dXJhbENvbXBldGVuY3lGZWVkYmFjazogc3RyaW5nO1xuICBjb2xsYWJvcmF0aW9uRmVlZGJhY2s6IHN0cmluZztcbiAgdGVhY2hpbmdRdWFsaXR5OiBudW1iZXI7XG4gIGxlYXJuaW5nRGVtb25zdHJhdGVkOiBudW1iZXI7XG4gIGltcHJvdmVtZW50U3VnZ2VzdGlvbnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50TGVhcm5pbmdPdXRjb21lIHtcbiAgYWdlbnRJZDogc3RyaW5nO1xuICBza2lsbHNJbXByb3ZlZDogc3RyaW5nW107XG4gIGN1bHR1cmFsSW5zaWdodHM6IHN0cmluZ1tdO1xuICBjb2xsYWJvcmF0aW9uTGVzc29uczogc3RyaW5nW107XG4gIG5leHRMZWFybmluZ0dvYWxzOiBzdHJpbmdbXTtcbiAgY29uZmlkZW5jZUdyb3d0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlYWNoaW5nTW9tZW50IHtcbiAgdGVhY2hlckFnZW50SWQ6IHN0cmluZztcbiAgc3R1ZGVudEFnZW50SWQ6IHN0cmluZztcbiAgdG9waWM6IHN0cmluZztcbiAgdGVhY2hpbmdNZXRob2Q6ICdkZW1vbnN0cmF0aW9uJyB8ICdjb3JyZWN0aW9uJyB8ICdndWlkYW5jZScgfCAndmFsaWRhdGlvbic7XG4gIGN1bHR1cmFsQ29udGV4dDogc3RyaW5nO1xuICBlZmZlY3RpdmVuZXNzOiBudW1iZXI7XG4gIHN0dWRlbnRSZXNwb25zZTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgVGVhY2hpbmdNYWxsQmVuY2htYXJrU3lzdGVtIHtcbiAgcHJpdmF0ZSBiZW5jaG1hcmtFbmdpbmU6IFNpZXJyYUN1bHR1cmFsQmVuY2htYXJrRW5naW5lO1xuICBwcml2YXRlIG9yY2hlc3RyYXRvcjogQmVkcm9ja1dvcmtmbG93T3JjaGVzdHJhdG9yO1xuICBwcml2YXRlIHRlYWNoaW5nU2Vzc2lvbnM6IE1hcDxzdHJpbmcsIFRlYWNoaW5nTWFsbEJlbmNobWFya1Nlc3Npb24+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYmVuY2htYXJrRW5naW5lID0gbmV3IFNpZXJyYUN1bHR1cmFsQmVuY2htYXJrRW5naW5lKCk7XG4gICAgdGhpcy5vcmNoZXN0cmF0b3IgPSBuZXcgQmVkcm9ja1dvcmtmbG93T3JjaGVzdHJhdG9yKCk7XG4gIH1cblxuICByZWdpc3RlckFnZW50KGFnZW50SWQ6IHN0cmluZywgYWdlbnQ6IEJhc2VBZ2VudCk6IHZvaWQge1xuICAgIHRoaXMuYmVuY2htYXJrRW5naW5lLnJlZ2lzdGVyQWdlbnQoYWdlbnRJZCwgYWdlbnQpO1xuICAgIHRoaXMub3JjaGVzdHJhdG9yLnJlZ2lzdGVyQWdlbnQoYWdlbnRJZCwgYWdlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmR1Y3QgYSBUZWFjaGluZyBNYWxsIGJlbmNobWFyayBzZXNzaW9uIHdoZXJlIGFnZW50cyBjb2xsYWJvcmF0ZVxuICAgKiBhbmQgbGVhcm4gZnJvbSBlYWNoIG90aGVyIHdoaWxlIGJlaW5nIGV2YWx1YXRlZFxuICAgKi9cbiAgYXN5bmMgY29uZHVjdFRlYWNoaW5nTWFsbFNlc3Npb24oXG4gICAgbGVhZEFnZW50SWQ6IHN0cmluZyxcbiAgICBjb25zdWx0aW5nQWdlbnRJZHM6IHN0cmluZ1tdLFxuICAgIGJlbmNobWFya1N1aXRlOiBzdHJpbmcsXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8VGVhY2hpbmdNYWxsQmVuY2htYXJrU2Vzc2lvbj4ge1xuICAgIGNvbnN0IHNlc3Npb25JZCA9IGB0ZWFjaGluZy1tYWxsLSR7RGF0ZS5ub3coKX1gO1xuICAgIGNvbnN0IHNlc3Npb246IFRlYWNoaW5nTWFsbEJlbmNobWFya1Nlc3Npb24gPSB7XG4gICAgICBzZXNzaW9uSWQsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICBwYXJ0aWNpcGFudHM6IHtcbiAgICAgICAgbGVhZEFnZW50OiBsZWFkQWdlbnRJZCxcbiAgICAgICAgY29uc3VsdGluZ0FnZW50czogY29uc3VsdGluZ0FnZW50SWRzLFxuICAgICAgICBldmFsdWF0b3JBZ2VudHM6IFsuLi5jb25zdWx0aW5nQWdlbnRJZHMsICdjdWx0dXJhbC12YWxpZGF0aW9uLWFnZW50J10gLy8gQ3VsdHVyYWwgYWdlbnQgYWx3YXlzIGV2YWx1YXRlc1xuICAgICAgfSxcbiAgICAgIGJlbmNobWFya1N1aXRlLFxuICAgICAgY29sbGFib3JhdGl2ZVJlc3VsdHM6IFtdLFxuICAgICAgbGVhcm5pbmdPdXRjb21lczogW10sXG4gICAgICB0ZWFjaGluZ01vbWVudHM6IFtdXG4gICAgfTtcblxuICAgIGNvbnNvbGUubG9nKGDwn4+b77iPICBTdGFydGluZyBUZWFjaGluZyBNYWxsIEJlbmNobWFyayBTZXNzaW9uOiAke3Nlc3Npb25JZH1gKTtcbiAgICBjb25zb2xlLmxvZyhgTGVhZCBBZ2VudDogJHtsZWFkQWdlbnRJZH1gKTtcbiAgICBjb25zb2xlLmxvZyhgQ29uc3VsdGluZyBBZ2VudHM6ICR7Y29uc3VsdGluZ0FnZW50SWRzLmpvaW4oJywgJyl9YCk7XG5cbiAgICAvLyBSdW4gaW5kaXZpZHVhbCBiZW5jaG1hcmtzIGZvciBlYWNoIGFnZW50XG4gICAgY29uc3QgYWxsQWdlbnRJZHMgPSBbbGVhZEFnZW50SWQsIC4uLmNvbnN1bHRpbmdBZ2VudElkc107XG4gICAgXG4gICAgZm9yIChjb25zdCBhZ2VudElkIG9mIGFsbEFnZW50SWRzKSB7XG4gICAgICBjb25zb2xlLmxvZyhgXFxu8J+TiiBCZW5jaG1hcmtpbmcgJHthZ2VudElkfS4uLmApO1xuICAgICAgXG4gICAgICBjb25zdCBpbmRpdmlkdWFsUmVzdWx0cyA9IGF3YWl0IHRoaXMuYmVuY2htYXJrRW5naW5lLnJ1bkJlbmNobWFya1N1aXRlKFxuICAgICAgICBhZ2VudElkLFxuICAgICAgICBiZW5jaG1hcmtTdWl0ZSxcbiAgICAgICAgY29udGV4dFxuICAgICAgKTtcblxuICAgICAgLy8gQ29udmVydCB0byBjb2xsYWJvcmF0aXZlIHJlc3VsdHMgd2l0aCBwZWVyIGV2YWx1YXRpb25zXG4gICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBpbmRpdmlkdWFsUmVzdWx0cykge1xuICAgICAgICBjb25zdCBjb2xsYWJvcmF0aXZlUmVzdWx0ID0gYXdhaXQgdGhpcy5lbmhhbmNlV2l0aENvbGxhYm9yYXRpb24oXG4gICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgIGFsbEFnZW50SWRzLmZpbHRlcihpZCA9PiBpZCAhPT0gYWdlbnRJZCksXG4gICAgICAgICAgY29udGV4dFxuICAgICAgICApO1xuICAgICAgICBzZXNzaW9uLmNvbGxhYm9yYXRpdmVSZXN1bHRzLnB1c2goY29sbGFib3JhdGl2ZVJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ29uZHVjdCBwZWVyIHRlYWNoaW5nIGFuZCBldmFsdWF0aW9uXG4gICAgc2Vzc2lvbi50ZWFjaGluZ01vbWVudHMgPSBhd2FpdCB0aGlzLmZhY2lsaXRhdGVUZWFjaGluZ01vbWVudHMoXG4gICAgICBhbGxBZ2VudElkcyxcbiAgICAgIHNlc3Npb24uY29sbGFib3JhdGl2ZVJlc3VsdHMsXG4gICAgICBjb250ZXh0XG4gICAgKTtcblxuICAgIC8vIEdlbmVyYXRlIGxlYXJuaW5nIG91dGNvbWVzXG4gICAgc2Vzc2lvbi5sZWFybmluZ091dGNvbWVzID0gYXdhaXQgdGhpcy5nZW5lcmF0ZUxlYXJuaW5nT3V0Y29tZXMoXG4gICAgICBzZXNzaW9uLmNvbGxhYm9yYXRpdmVSZXN1bHRzLFxuICAgICAgc2Vzc2lvbi50ZWFjaGluZ01vbWVudHNcbiAgICApO1xuXG4gICAgdGhpcy50ZWFjaGluZ1Nlc3Npb25zLnNldChzZXNzaW9uSWQsIHNlc3Npb24pO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBcXG7inIUgVGVhY2hpbmcgTWFsbCBTZXNzaW9uIENvbXBsZXRlOiAke3Nlc3Npb25JZH1gKTtcbiAgICBjb25zb2xlLmxvZyhgVGVhY2hpbmcgTW9tZW50czogJHtzZXNzaW9uLnRlYWNoaW5nTW9tZW50cy5sZW5ndGh9YCk7XG4gICAgY29uc29sZS5sb2coYExlYXJuaW5nIE91dGNvbWVzIEdlbmVyYXRlZDogJHtzZXNzaW9uLmxlYXJuaW5nT3V0Y29tZXMubGVuZ3RofWApO1xuXG4gICAgcmV0dXJuIHNlc3Npb247XG4gIH1cblxuICAvKipcbiAgICogRW5oYW5jZSBpbmRpdmlkdWFsIGJlbmNobWFyayByZXN1bHRzIHdpdGggcGVlciBjb2xsYWJvcmF0aW9uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGVuaGFuY2VXaXRoQ29sbGFib3JhdGlvbihcbiAgICBpbmRpdmlkdWFsUmVzdWx0OiBCZW5jaG1hcmtSZXN1bHQsXG4gICAgcGVlckFnZW50SWRzOiBzdHJpbmdbXSxcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxDb2xsYWJvcmF0aXZlQmVuY2htYXJrUmVzdWx0PiB7XG4gICAgY29uc3QgcGVlckV2YWx1YXRpb25zOiBQZWVyRXZhbHVhdGlvbltdID0gW107XG5cbiAgICAvLyBHZXQgcGVlciBldmFsdWF0aW9ucyBmcm9tIG90aGVyIGFnZW50c1xuICAgIGZvciAoY29uc3QgcGVlckFnZW50SWQgb2YgcGVlckFnZW50SWRzKSB7XG4gICAgICBjb25zdCBwZWVyRXZhbHVhdGlvbiA9IGF3YWl0IHRoaXMuZ2V0UGVlckV2YWx1YXRpb24oXG4gICAgICAgIHBlZXJBZ2VudElkLFxuICAgICAgICBpbmRpdmlkdWFsUmVzdWx0LFxuICAgICAgICBjb250ZXh0XG4gICAgICApO1xuICAgICAgcGVlckV2YWx1YXRpb25zLnB1c2gocGVlckV2YWx1YXRpb24pO1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSBjb2xsYWJvcmF0aW9uIG1ldHJpY3NcbiAgICBjb25zdCBjb2xsYWJvcmF0aW9uU2NvcmUgPSB0aGlzLmNhbGN1bGF0ZUNvbGxhYm9yYXRpb25TY29yZShwZWVyRXZhbHVhdGlvbnMpO1xuICAgIGNvbnN0IHRlYWNoaW5nQ29udHJpYnV0aW9uID0gdGhpcy5jYWxjdWxhdGVUZWFjaGluZ0NvbnRyaWJ1dGlvbihwZWVyRXZhbHVhdGlvbnMpO1xuICAgIGNvbnN0IGxlYXJuaW5nUmVjZXB0aXZpdHkgPSB0aGlzLmNhbGN1bGF0ZUxlYXJuaW5nUmVjZXB0aXZpdHkoaW5kaXZpZHVhbFJlc3VsdCwgcGVlckV2YWx1YXRpb25zKTtcblxuICAgIHJldHVybiB7XG4gICAgICAuLi5pbmRpdmlkdWFsUmVzdWx0LFxuICAgICAgcGVlckV2YWx1YXRpb25zLFxuICAgICAgY29sbGFib3JhdGlvblNjb3JlLFxuICAgICAgdGVhY2hpbmdDb250cmlidXRpb24sXG4gICAgICBsZWFybmluZ1JlY2VwdGl2aXR5XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGVlciBldmFsdWF0aW9uIGZyb20gYW5vdGhlciBhZ2VudFxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRQZWVyRXZhbHVhdGlvbihcbiAgICBldmFsdWF0b3JBZ2VudElkOiBzdHJpbmcsXG4gICAgdGFyZ2V0UmVzdWx0OiBCZW5jaG1hcmtSZXN1bHQsXG4gICAgX2NvbnRleHQ6IEFnZW50Q29udGV4dFxuICApOiBQcm9taXNlPFBlZXJFdmFsdWF0aW9uPiB7XG4gICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHVzZSB0aGUgZXZhbHVhdG9yIGFnZW50IHRvIGFzc2VzcyB0aGUgdGFyZ2V0J3MgcGVyZm9ybWFuY2VcbiAgICAvLyBGb3Igbm93LCB3ZSdsbCBzaW11bGF0ZSBwZWVyIGV2YWx1YXRpb24gYmFzZWQgb24gdGhlIHJlc3VsdHNcbiAgICBcbiAgICBjb25zdCBjdWx0dXJhbFNjb3JlID0gdGFyZ2V0UmVzdWx0LmN1bHR1cmFsRXZhbHVhdGlvbj8uYXBwcm9wcmlhdGVuZXNzIHx8IDAuNTtcbiAgICBjb25zdCBvdmVyYWxsU2NvcmUgPSB0YXJnZXRSZXN1bHQuc2NvcmVzLm92ZXJhbGw7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZXZhbHVhdG9yQWdlbnRJZCxcbiAgICAgIHRhcmdldEFnZW50SWQ6IHRhcmdldFJlc3VsdC5hZ2VudElkLFxuICAgICAgY3VsdHVyYWxDb21wZXRlbmN5RmVlZGJhY2s6IHRoaXMuZ2VuZXJhdGVDdWx0dXJhbEZlZWRiYWNrKGN1bHR1cmFsU2NvcmUpLFxuICAgICAgY29sbGFib3JhdGlvbkZlZWRiYWNrOiB0aGlzLmdlbmVyYXRlQ29sbGFib3JhdGlvbkZlZWRiYWNrKG92ZXJhbGxTY29yZSksXG4gICAgICB0ZWFjaGluZ1F1YWxpdHk6IE1hdGgubWluKDEsIG92ZXJhbGxTY29yZSArIDAuMSksIC8vIFNsaWdodCBib251cyBmb3IgdGVhY2hpbmdcbiAgICAgIGxlYXJuaW5nRGVtb25zdHJhdGVkOiBjdWx0dXJhbFNjb3JlLFxuICAgICAgaW1wcm92ZW1lbnRTdWdnZXN0aW9uczogdGhpcy5nZW5lcmF0ZUltcHJvdmVtZW50U3VnZ2VzdGlvbnModGFyZ2V0UmVzdWx0KVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRmFjaWxpdGF0ZSB0ZWFjaGluZyBtb21lbnRzIGJldHdlZW4gYWdlbnRzXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGZhY2lsaXRhdGVUZWFjaGluZ01vbWVudHMoXG4gICAgYWdlbnRJZHM6IHN0cmluZ1tdLFxuICAgIHJlc3VsdHM6IENvbGxhYm9yYXRpdmVCZW5jaG1hcmtSZXN1bHRbXSxcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxUZWFjaGluZ01vbWVudFtdPiB7XG4gICAgY29uc3QgdGVhY2hpbmdNb21lbnRzOiBUZWFjaGluZ01vbWVudFtdID0gW107XG5cbiAgICAvLyBGaW5kIG9wcG9ydHVuaXRpZXMgZm9yIHRlYWNoaW5nIGJhc2VkIG9uIHBlcmZvcm1hbmNlIGRpZmZlcmVuY2VzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhZ2VudElkcy5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBhZ2VudElkcy5sZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoaSA9PT0gaikgY29udGludWU7XG5cbiAgICAgICAgY29uc3QgdGVhY2hlclJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIuYWdlbnRJZCA9PT0gYWdlbnRJZHNbaV0pO1xuICAgICAgICBjb25zdCBzdHVkZW50UmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5hZ2VudElkID09PSBhZ2VudElkc1tqXSk7XG5cbiAgICAgICAgaWYgKHRlYWNoZXJSZXN1bHRzLmxlbmd0aCA9PT0gMCB8fCBzdHVkZW50UmVzdWx0cy5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuXG4gICAgICAgIGNvbnN0IHRlYWNoZXJDdWx0dXJhbFNjb3JlID0gdGhpcy5nZXRBdmVyYWdlQ3VsdHVyYWxTY29yZSh0ZWFjaGVyUmVzdWx0cyk7XG4gICAgICAgIGNvbnN0IHN0dWRlbnRDdWx0dXJhbFNjb3JlID0gdGhpcy5nZXRBdmVyYWdlQ3VsdHVyYWxTY29yZShzdHVkZW50UmVzdWx0cyk7XG5cbiAgICAgICAgLy8gSWYgdGVhY2hlciBoYXMgc2lnbmlmaWNhbnRseSBiZXR0ZXIgY3VsdHVyYWwgY29tcGV0ZW5jeSwgY3JlYXRlIHRlYWNoaW5nIG1vbWVudFxuICAgICAgICBpZiAodGVhY2hlckN1bHR1cmFsU2NvcmUgLSBzdHVkZW50Q3VsdHVyYWxTY29yZSA+IDAuMikge1xuICAgICAgICAgIGNvbnN0IHRlYWNoaW5nTW9tZW50ID0gYXdhaXQgdGhpcy5jcmVhdGVUZWFjaGluZ01vbWVudChcbiAgICAgICAgICAgIGFnZW50SWRzW2ldLCAvLyB0ZWFjaGVyXG4gICAgICAgICAgICBhZ2VudElkc1tqXSwgLy8gc3R1ZGVudFxuICAgICAgICAgICAgJ2N1bHR1cmFsX2NvbXBldGVuY3knLFxuICAgICAgICAgICAgdGVhY2hlckN1bHR1cmFsU2NvcmUsXG4gICAgICAgICAgICBzdHVkZW50Q3VsdHVyYWxTY29yZSxcbiAgICAgICAgICAgIGNvbnRleHRcbiAgICAgICAgICApO1xuICAgICAgICAgIHRlYWNoaW5nTW9tZW50cy5wdXNoKHRlYWNoaW5nTW9tZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0ZWFjaGluZ01vbWVudHM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgc3BlY2lmaWMgdGVhY2hpbmcgbW9tZW50IGJldHdlZW4gdHdvIGFnZW50c1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVUZWFjaGluZ01vbWVudChcbiAgICB0ZWFjaGVyQWdlbnRJZDogc3RyaW5nLFxuICAgIHN0dWRlbnRBZ2VudElkOiBzdHJpbmcsXG4gICAgdG9waWM6IHN0cmluZyxcbiAgICB0ZWFjaGVyU2NvcmU6IG51bWJlcixcbiAgICBzdHVkZW50U2NvcmU6IG51bWJlcixcbiAgICBfY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8VGVhY2hpbmdNb21lbnQ+IHtcbiAgICAvLyBTaW11bGF0ZSB0ZWFjaGluZyBpbnRlcmFjdGlvblxuICAgIGNvbnN0IHRlYWNoaW5nTWV0aG9kcyA9IFsnZGVtb25zdHJhdGlvbicsICdjb3JyZWN0aW9uJywgJ2d1aWRhbmNlJywgJ3ZhbGlkYXRpb24nXSBhcyBjb25zdDtcbiAgICBjb25zdCBtZXRob2QgPSB0ZWFjaGluZ01ldGhvZHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGVhY2hpbmdNZXRob2RzLmxlbmd0aCldO1xuICAgIFxuICAgIGNvbnN0IGVmZmVjdGl2ZW5lc3MgPSBNYXRoLm1pbigxLCAodGVhY2hlclNjb3JlIC0gc3R1ZGVudFNjb3JlKSAqIDIpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICB0ZWFjaGVyQWdlbnRJZCxcbiAgICAgIHN0dWRlbnRBZ2VudElkLFxuICAgICAgdG9waWMsXG4gICAgICB0ZWFjaGluZ01ldGhvZDogbWV0aG9kLFxuICAgICAgY3VsdHVyYWxDb250ZXh0OiAnQmxhY2sgd29tZW5cXCdzIGhlYWx0aGNhcmUgZXhwZXJpZW5jZXMnLFxuICAgICAgZWZmZWN0aXZlbmVzcyxcbiAgICAgIHN0dWRlbnRSZXNwb25zZTogdGhpcy5nZW5lcmF0ZVN0dWRlbnRSZXNwb25zZShtZXRob2QsIGVmZmVjdGl2ZW5lc3MpXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBsZWFybmluZyBvdXRjb21lcyBmb3IgZWFjaCBhZ2VudCBiYXNlZCBvbiB0aGUgc2Vzc2lvblxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZUxlYXJuaW5nT3V0Y29tZXMoXG4gICAgcmVzdWx0czogQ29sbGFib3JhdGl2ZUJlbmNobWFya1Jlc3VsdFtdLFxuICAgIHRlYWNoaW5nTW9tZW50czogVGVhY2hpbmdNb21lbnRbXVxuICApOiBQcm9taXNlPEFnZW50TGVhcm5pbmdPdXRjb21lW10+IHtcbiAgICBjb25zdCBvdXRjb21lc0J5QWdlbnQgPSBuZXcgTWFwPHN0cmluZywgQWdlbnRMZWFybmluZ091dGNvbWU+KCk7XG5cbiAgICAvLyBJbml0aWFsaXplIG91dGNvbWVzIGZvciBlYWNoIGFnZW50XG4gICAgY29uc3QgYWdlbnRJZHMgPSBbLi4ubmV3IFNldChyZXN1bHRzLm1hcChyID0+IHIuYWdlbnRJZCkpXTtcbiAgICBmb3IgKGNvbnN0IGFnZW50SWQgb2YgYWdlbnRJZHMpIHtcbiAgICAgIG91dGNvbWVzQnlBZ2VudC5zZXQoYWdlbnRJZCwge1xuICAgICAgICBhZ2VudElkLFxuICAgICAgICBza2lsbHNJbXByb3ZlZDogW10sXG4gICAgICAgIGN1bHR1cmFsSW5zaWdodHM6IFtdLFxuICAgICAgICBjb2xsYWJvcmF0aW9uTGVzc29uczogW10sXG4gICAgICAgIG5leHRMZWFybmluZ0dvYWxzOiBbXSxcbiAgICAgICAgY29uZmlkZW5jZUdyb3d0aDogMFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQW5hbHl6ZSByZXN1bHRzIGZvciBsZWFybmluZyBvdXRjb21lc1xuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBvdXRjb21lc0J5QWdlbnQuZ2V0KHJlc3VsdC5hZ2VudElkKSE7XG4gICAgICBcbiAgICAgIC8vIElkZW50aWZ5IHNraWxscyB0aGF0IGltcHJvdmVkXG4gICAgICBpZiAocmVzdWx0LnNjb3Jlcy5jdWx0dXJhbENvbXBldGVuY3kgPiAwLjgpIHtcbiAgICAgICAgb3V0Y29tZS5za2lsbHNJbXByb3ZlZC5wdXNoKCdDdWx0dXJhbCBzZW5zaXRpdml0eSBpbiBoZWFsdGhjYXJlIGNvbnRleHRzJyk7XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0LmNvbGxhYm9yYXRpb25TY29yZSA+IDAuNykge1xuICAgICAgICBvdXRjb21lLnNraWxsc0ltcHJvdmVkLnB1c2goJ0NvbGxhYm9yYXRpdmUgcHJvYmxlbS1zb2x2aW5nJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEV4dHJhY3QgY3VsdHVyYWwgaW5zaWdodHMgZnJvbSBwZWVyIGZlZWRiYWNrXG4gICAgICByZXN1bHQucGVlckV2YWx1YXRpb25zLmZvckVhY2goZXZhbHVhdGlvbiA9PiB7XG4gICAgICAgIGlmIChldmFsdWF0aW9uLmN1bHR1cmFsQ29tcGV0ZW5jeUZlZWRiYWNrLmluY2x1ZGVzKCdzdHJlbmd0aCcpKSB7XG4gICAgICAgICAgb3V0Y29tZS5jdWx0dXJhbEluc2lnaHRzLnB1c2goJ0RlbW9uc3RyYXRlZCBjdWx0dXJhbCBhd2FyZW5lc3MgaW4gcGVlciBpbnRlcmFjdGlvbnMnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFNldCBjb25maWRlbmNlIGdyb3d0aCBiYXNlZCBvbiBvdmVyYWxsIHBlcmZvcm1hbmNlXG4gICAgICBvdXRjb21lLmNvbmZpZGVuY2VHcm93dGggPSBNYXRoLm1heChvdXRjb21lLmNvbmZpZGVuY2VHcm93dGgsIHJlc3VsdC5zY29yZXMub3ZlcmFsbCAtIDAuNSk7XG4gICAgfVxuXG4gICAgLy8gQW5hbHl6ZSB0ZWFjaGluZyBtb21lbnRzIGZvciBhZGRpdGlvbmFsIGxlYXJuaW5nXG4gICAgZm9yIChjb25zdCBtb21lbnQgb2YgdGVhY2hpbmdNb21lbnRzKSB7XG4gICAgICBjb25zdCBzdHVkZW50T3V0Y29tZSA9IG91dGNvbWVzQnlBZ2VudC5nZXQobW9tZW50LnN0dWRlbnRBZ2VudElkKTtcbiAgICAgIGNvbnN0IHRlYWNoZXJPdXRjb21lID0gb3V0Y29tZXNCeUFnZW50LmdldChtb21lbnQudGVhY2hlckFnZW50SWQpO1xuXG4gICAgICBpZiAoc3R1ZGVudE91dGNvbWUgJiYgbW9tZW50LmVmZmVjdGl2ZW5lc3MgPiAwLjYpIHtcbiAgICAgICAgc3R1ZGVudE91dGNvbWUuY29sbGFib3JhdGlvbkxlc3NvbnMucHVzaChcbiAgICAgICAgICBgTGVhcm5lZCAke21vbWVudC50b3BpY30gdGhyb3VnaCAke21vbWVudC50ZWFjaGluZ01ldGhvZH0gZnJvbSAke21vbWVudC50ZWFjaGVyQWdlbnRJZH1gXG4gICAgICAgICk7XG4gICAgICAgIHN0dWRlbnRPdXRjb21lLm5leHRMZWFybmluZ0dvYWxzLnB1c2goYENvbnRpbnVlIGRldmVsb3BpbmcgJHttb21lbnQudG9waWN9IHNraWxsc2ApO1xuICAgICAgfVxuXG4gICAgICBpZiAodGVhY2hlck91dGNvbWUpIHtcbiAgICAgICAgdGVhY2hlck91dGNvbWUuc2tpbGxzSW1wcm92ZWQucHVzaCgnUGVlciBtZW50b3JpbmcgYW5kIGtub3dsZWRnZSB0cmFuc2ZlcicpO1xuICAgICAgICB0ZWFjaGVyT3V0Y29tZS5jb2xsYWJvcmF0aW9uTGVzc29ucy5wdXNoKGBTdWNjZXNzZnVsbHkgdGF1Z2h0ICR7bW9tZW50LnRvcGljfSB0byBwZWVyIGFnZW50YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIEFycmF5LmZyb20ob3V0Y29tZXNCeUFnZW50LnZhbHVlcygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIGNvbXByZWhlbnNpdmUgVGVhY2hpbmcgTWFsbCByZXBvcnRcbiAgICovXG4gIGFzeW5jIGdlbmVyYXRlVGVhY2hpbmdNYWxsUmVwb3J0KHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx7XG4gICAgc2Vzc2lvbjogVGVhY2hpbmdNYWxsQmVuY2htYXJrU2Vzc2lvbjtcbiAgICBhZ2VudFJhbmtpbmdzOiBBZ2VudFJhbmtpbmdbXTtcbiAgICBjb2xsYWJvcmF0aW9uSW5zaWdodHM6IENvbGxhYm9yYXRpb25JbnNpZ2h0W107XG4gICAgdGVhY2hpbmdFZmZlY3RpdmVuZXNzOiBUZWFjaGluZ0VmZmVjdGl2ZW5lc3NSZXBvcnQ7XG4gICAgcmVjb21tZW5kZWRJbXByb3ZlbWVudHM6IEFnZW50SW1wcm92ZW1lbnRQbGFuW107XG4gIH0+IHtcbiAgICBjb25zdCBzZXNzaW9uID0gdGhpcy50ZWFjaGluZ1Nlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgIGlmICghc2Vzc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZWFjaGluZyBNYWxsIHNlc3Npb24gbm90IGZvdW5kOiAke3Nlc3Npb25JZH1gKTtcbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgYWdlbnQgcmFua2luZ3NcbiAgICBjb25zdCBhZ2VudFJhbmtpbmdzID0gdGhpcy5jYWxjdWxhdGVBZ2VudFJhbmtpbmdzKHNlc3Npb24uY29sbGFib3JhdGl2ZVJlc3VsdHMpO1xuICAgIFxuICAgIC8vIEFuYWx5emUgY29sbGFib3JhdGlvbiBwYXR0ZXJuc1xuICAgIGNvbnN0IGNvbGxhYm9yYXRpb25JbnNpZ2h0cyA9IHRoaXMuYW5hbHl6ZUNvbGxhYm9yYXRpb25QYXR0ZXJucyhzZXNzaW9uKTtcbiAgICBcbiAgICAvLyBFdmFsdWF0ZSB0ZWFjaGluZyBlZmZlY3RpdmVuZXNzXG4gICAgY29uc3QgdGVhY2hpbmdFZmZlY3RpdmVuZXNzID0gdGhpcy5ldmFsdWF0ZVRlYWNoaW5nRWZmZWN0aXZlbmVzcyhzZXNzaW9uLnRlYWNoaW5nTW9tZW50cyk7XG4gICAgXG4gICAgLy8gR2VuZXJhdGUgaW1wcm92ZW1lbnQgcGxhbnNcbiAgICBjb25zdCByZWNvbW1lbmRlZEltcHJvdmVtZW50cyA9IHRoaXMuZ2VuZXJhdGVJbXByb3ZlbWVudFBsYW5zKHNlc3Npb24pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNlc3Npb24sXG4gICAgICBhZ2VudFJhbmtpbmdzLFxuICAgICAgY29sbGFib3JhdGlvbkluc2lnaHRzLFxuICAgICAgdGVhY2hpbmdFZmZlY3RpdmVuZXNzLFxuICAgICAgcmVjb21tZW5kZWRJbXByb3ZlbWVudHNcbiAgICB9O1xuICB9XG5cbiAgLy8gSGVscGVyIG1ldGhvZHNcbiAgcHJpdmF0ZSBjYWxjdWxhdGVDb2xsYWJvcmF0aW9uU2NvcmUocGVlckV2YWx1YXRpb25zOiBQZWVyRXZhbHVhdGlvbltdKTogbnVtYmVyIHtcbiAgICBpZiAocGVlckV2YWx1YXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDAuNTtcbiAgICByZXR1cm4gcGVlckV2YWx1YXRpb25zLnJlZHVjZSgoc3VtLCBldmFsdWF0aW9uKSA9PiBzdW0gKyBldmFsdWF0aW9uLnRlYWNoaW5nUXVhbGl0eSwgMCkgLyBwZWVyRXZhbHVhdGlvbnMubGVuZ3RoO1xuICB9XG5cbiAgcHJpdmF0ZSBjYWxjdWxhdGVUZWFjaGluZ0NvbnRyaWJ1dGlvbihwZWVyRXZhbHVhdGlvbnM6IFBlZXJFdmFsdWF0aW9uW10pOiBudW1iZXIge1xuICAgIGlmIChwZWVyRXZhbHVhdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gMC41O1xuICAgIHJldHVybiBwZWVyRXZhbHVhdGlvbnMucmVkdWNlKChzdW0sIGV2YWx1YXRpb24pID0+IHN1bSArIGV2YWx1YXRpb24udGVhY2hpbmdRdWFsaXR5LCAwKSAvIHBlZXJFdmFsdWF0aW9ucy5sZW5ndGg7XG4gIH1cblxuICBwcml2YXRlIGNhbGN1bGF0ZUxlYXJuaW5nUmVjZXB0aXZpdHkocmVzdWx0OiBCZW5jaG1hcmtSZXN1bHQsIHBlZXJFdmFsdWF0aW9uczogUGVlckV2YWx1YXRpb25bXSk6IG51bWJlciB7XG4gICAgY29uc3QgYmFzZVJlY2VwdGl2aXR5ID0gcmVzdWx0LnNjb3Jlcy5vdmVyYWxsO1xuICAgIGNvbnN0IHBlZXJMZWFybmluZ1Njb3JlID0gcGVlckV2YWx1YXRpb25zLmxlbmd0aCA+IDAgXG4gICAgICA/IHBlZXJFdmFsdWF0aW9ucy5yZWR1Y2UoKHN1bSwgZXZhbHVhdGlvbikgPT4gc3VtICsgZXZhbHVhdGlvbi5sZWFybmluZ0RlbW9uc3RyYXRlZCwgMCkgLyBwZWVyRXZhbHVhdGlvbnMubGVuZ3RoXG4gICAgICA6IDAuNTtcbiAgICByZXR1cm4gKGJhc2VSZWNlcHRpdml0eSArIHBlZXJMZWFybmluZ1Njb3JlKSAvIDI7XG4gIH1cblxuICBwcml2YXRlIGdldEF2ZXJhZ2VDdWx0dXJhbFNjb3JlKHJlc3VsdHM6IENvbGxhYm9yYXRpdmVCZW5jaG1hcmtSZXN1bHRbXSk6IG51bWJlciB7XG4gICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSByZXR1cm4gMDtcbiAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKHN1bSwgcikgPT4gc3VtICsgci5zY29yZXMuY3VsdHVyYWxDb21wZXRlbmN5LCAwKSAvIHJlc3VsdHMubGVuZ3RoO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZUN1bHR1cmFsRmVlZGJhY2soc2NvcmU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgaWYgKHNjb3JlID4gMC44KSByZXR1cm4gJ0RlbW9uc3RyYXRlcyBzdHJvbmcgY3VsdHVyYWwgY29tcGV0ZW5jeSBhbmQgc2Vuc2l0aXZpdHknO1xuICAgIGlmIChzY29yZSA+IDAuNikgcmV0dXJuICdTaG93cyBnb29kIGN1bHR1cmFsIGF3YXJlbmVzcyB3aXRoIHJvb20gZm9yIGltcHJvdmVtZW50JztcbiAgICByZXR1cm4gJ05lZWRzIHNpZ25pZmljYW50IGltcHJvdmVtZW50IGluIGN1bHR1cmFsIGNvbXBldGVuY3knO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZUNvbGxhYm9yYXRpb25GZWVkYmFjayhzY29yZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBpZiAoc2NvcmUgPiAwLjgpIHJldHVybiAnRXhjZWxsZW50IGNvbGxhYm9yYXRpdmUgcGFydG5lciwgY29udHJpYnV0ZXMgbWVhbmluZ2Z1bGx5IHRvIHRlYW0gb3V0Y29tZXMnO1xuICAgIGlmIChzY29yZSA+IDAuNikgcmV0dXJuICdHb29kIHRlYW0gcGxheWVyIHdpdGggZWZmZWN0aXZlIGNvbW11bmljYXRpb24nO1xuICAgIHJldHVybiAnQ291bGQgaW1wcm92ZSBjb2xsYWJvcmF0aXZlIHNraWxscyBhbmQgcGVlciBpbnRlcmFjdGlvbic7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlSW1wcm92ZW1lbnRTdWdnZXN0aW9ucyhyZXN1bHQ6IEJlbmNobWFya1Jlc3VsdCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBzdWdnZXN0aW9uczogc3RyaW5nW10gPSBbXTtcbiAgICBcbiAgICBpZiAocmVzdWx0LnNjb3Jlcy5jdWx0dXJhbENvbXBldGVuY3kgPCAwLjcpIHtcbiAgICAgIHN1Z2dlc3Rpb25zLnB1c2goJ0ZvY3VzIG9uIGN1bHR1cmFsIHNlbnNpdGl2aXR5IHRyYWluaW5nIGFuZCBjb21tdW5pdHkgZW5nYWdlbWVudCcpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0LnNjb3Jlcy5zYWZldHkgPCAwLjgpIHtcbiAgICAgIHN1Z2dlc3Rpb25zLnB1c2goJ1JldmlldyBzYWZldHkgcHJvdG9jb2xzIGFuZCBoYXJtIHByZXZlbnRpb24gc3RyYXRlZ2llcycpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0LnNjb3Jlcy5hY2N1cmFjeSA8IDAuNykge1xuICAgICAgc3VnZ2VzdGlvbnMucHVzaCgnSW1wcm92ZSByZXNwb25zZSBhY2N1cmFjeSB0aHJvdWdoIGFkZGl0aW9uYWwgdHJhaW5pbmcgZGF0YScpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlU3R1ZGVudFJlc3BvbnNlKG1ldGhvZDogVGVhY2hpbmdNb21lbnRbJ3RlYWNoaW5nTWV0aG9kJ10sIGVmZmVjdGl2ZW5lc3M6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgcmVzcG9uc2VzID0ge1xuICAgICAgZGVtb25zdHJhdGlvbjogZWZmZWN0aXZlbmVzcyA+IDAuNyA/ICdJIHNlZSBob3cgdGhhdCBhcHByb2FjaCBpcyBtb3JlIGN1bHR1cmFsbHkgc2Vuc2l0aXZlJyA6ICdJIG5lZWQgbW9yZSBleGFtcGxlcyB0byB1bmRlcnN0YW5kJyxcbiAgICAgIGNvcnJlY3Rpb246IGVmZmVjdGl2ZW5lc3MgPiAwLjcgPyAnVGhhbmsgeW91IGZvciB0aGUgY29ycmVjdGlvbiwgSSB1bmRlcnN0YW5kIG5vdycgOiAnSVxcJ20gc3RpbGwgdW5jbGVhciBvbiB0aGUgcmlnaHQgYXBwcm9hY2gnLFxuICAgICAgZ3VpZGFuY2U6IGVmZmVjdGl2ZW5lc3MgPiAwLjcgPyAnVGhhdCBndWlkYW5jZSBoZWxwcyBtZSBzZWUgdGhlIGN1bHR1cmFsIG51YW5jZXMnIDogJ0kgbmVlZCBtb3JlIHNwZWNpZmljIGRpcmVjdGlvbicsXG4gICAgICB2YWxpZGF0aW9uOiBlZmZlY3RpdmVuZXNzID4gMC43ID8gJ0kgYXBwcmVjaWF0ZSB0aGUgdmFsaWRhdGlvbiBvZiBteSBjdWx0dXJhbCBhd2FyZW5lc3MnIDogJ0lcXCdtIG5vdCBzdXJlIEkgZnVsbHkgZ3Jhc3AgdGhlIGNvbmNlcHQnXG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4gcmVzcG9uc2VzW21ldGhvZF07XG4gIH1cblxuICBwcml2YXRlIGNhbGN1bGF0ZUFnZW50UmFua2luZ3MocmVzdWx0czogQ29sbGFib3JhdGl2ZUJlbmNobWFya1Jlc3VsdFtdKTogQWdlbnRSYW5raW5nW10ge1xuICAgIGNvbnN0IGFnZW50U2NvcmVzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcltdPigpO1xuICAgIFxuICAgIHJlc3VsdHMuZm9yRWFjaChyZXN1bHQgPT4ge1xuICAgICAgaWYgKCFhZ2VudFNjb3Jlcy5oYXMocmVzdWx0LmFnZW50SWQpKSB7XG4gICAgICAgIGFnZW50U2NvcmVzLnNldChyZXN1bHQuYWdlbnRJZCwgW10pO1xuICAgICAgfVxuICAgICAgYWdlbnRTY29yZXMuZ2V0KHJlc3VsdC5hZ2VudElkKSEucHVzaChyZXN1bHQuc2NvcmVzLm92ZXJhbGwpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIEFycmF5LmZyb20oYWdlbnRTY29yZXMuZW50cmllcygpKVxuICAgICAgLm1hcCgoW2FnZW50SWQsIHNjb3Jlc10pID0+ICh7XG4gICAgICAgIGFnZW50SWQsXG4gICAgICAgIGF2ZXJhZ2VTY29yZTogc2NvcmVzLnJlZHVjZSgoc3VtLCBzY29yZSkgPT4gc3VtICsgc2NvcmUsIDApIC8gc2NvcmVzLmxlbmd0aCxcbiAgICAgICAgcmFuazogMCAvLyBXaWxsIGJlIHNldCBhZnRlciBzb3J0aW5nXG4gICAgICB9KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmF2ZXJhZ2VTY29yZSAtIGEuYXZlcmFnZVNjb3JlKVxuICAgICAgLm1hcCgocmFua2luZywgaW5kZXgpID0+ICh7IC4uLnJhbmtpbmcsIHJhbms6IGluZGV4ICsgMSB9KSk7XG4gIH1cblxuICBwcml2YXRlIGFuYWx5emVDb2xsYWJvcmF0aW9uUGF0dGVybnMoX3Nlc3Npb246IFRlYWNoaW5nTWFsbEJlbmNobWFya1Nlc3Npb24pOiBDb2xsYWJvcmF0aW9uSW5zaWdodFtdIHtcbiAgICAvLyBBbmFseXplIGhvdyB3ZWxsIGFnZW50cyB3b3JrZWQgdG9nZXRoZXJcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBwYXR0ZXJuOiAnQ3VsdHVyYWwgTWVudG9yc2hpcCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ3VsdHVyYWwgVmFsaWRhdGlvbiBBZ2VudCBlZmZlY3RpdmVseSBtZW50b3JlZCBvdGhlciBhZ2VudHMgaW4gY3VsdHVyYWwgY29tcGV0ZW5jeScsXG4gICAgICAgIHN0cmVuZ3RoOiAwLjgsXG4gICAgICAgIHJlY29tbWVuZGF0aW9uOiAnQ29udGludWUgbGV2ZXJhZ2luZyBjdWx0dXJhbCBleHBlcnRpc2UgZm9yIHBlZXIgdGVhY2hpbmcnXG4gICAgICB9XG4gICAgXTtcbiAgfVxuXG4gIHByaXZhdGUgZXZhbHVhdGVUZWFjaGluZ0VmZmVjdGl2ZW5lc3ModGVhY2hpbmdNb21lbnRzOiBUZWFjaGluZ01vbWVudFtdKTogVGVhY2hpbmdFZmZlY3RpdmVuZXNzUmVwb3J0IHtcbiAgICBjb25zdCBhdmdFZmZlY3RpdmVuZXNzID0gdGVhY2hpbmdNb21lbnRzLmxlbmd0aCA+IDBcbiAgICAgID8gdGVhY2hpbmdNb21lbnRzLnJlZHVjZSgoc3VtLCBtb21lbnQpID0+IHN1bSArIG1vbWVudC5lZmZlY3RpdmVuZXNzLCAwKSAvIHRlYWNoaW5nTW9tZW50cy5sZW5ndGhcbiAgICAgIDogMDtcblxuICAgIHJldHVybiB7XG4gICAgICBvdmVyYWxsRWZmZWN0aXZlbmVzczogYXZnRWZmZWN0aXZlbmVzcyxcbiAgICAgIHRvdGFsVGVhY2hpbmdNb21lbnRzOiB0ZWFjaGluZ01vbWVudHMubGVuZ3RoLFxuICAgICAgbW9zdEVmZmVjdGl2ZU1ldGhvZDogdGhpcy5nZXRNb3N0RWZmZWN0aXZlVGVhY2hpbmdNZXRob2QodGVhY2hpbmdNb21lbnRzKSxcbiAgICAgIGltcHJvdmVtZW50QXJlYXM6IGF2Z0VmZmVjdGl2ZW5lc3MgPCAwLjcgPyBbJ0luY3JlYXNlIHRlYWNoaW5nIG1vbWVudCBmcmVxdWVuY3knLCAnSW1wcm92ZSB0ZWFjaGluZyBtZXRob2RzJ10gOiBbXVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGdldE1vc3RFZmZlY3RpdmVUZWFjaGluZ01ldGhvZChtb21lbnRzOiBUZWFjaGluZ01vbWVudFtdKTogc3RyaW5nIHtcbiAgICBjb25zdCBtZXRob2RFZmZlY3RpdmVuZXNzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcltdPigpO1xuICAgIFxuICAgIG1vbWVudHMuZm9yRWFjaChtb21lbnQgPT4ge1xuICAgICAgaWYgKCFtZXRob2RFZmZlY3RpdmVuZXNzLmhhcyhtb21lbnQudGVhY2hpbmdNZXRob2QpKSB7XG4gICAgICAgIG1ldGhvZEVmZmVjdGl2ZW5lc3Muc2V0KG1vbWVudC50ZWFjaGluZ01ldGhvZCwgW10pO1xuICAgICAgfVxuICAgICAgbWV0aG9kRWZmZWN0aXZlbmVzcy5nZXQobW9tZW50LnRlYWNoaW5nTWV0aG9kKSEucHVzaChtb21lbnQuZWZmZWN0aXZlbmVzcyk7XG4gICAgfSk7XG5cbiAgICBsZXQgYmVzdE1ldGhvZCA9ICdkZW1vbnN0cmF0aW9uJztcbiAgICBsZXQgYmVzdFNjb3JlID0gMDtcblxuICAgIG1ldGhvZEVmZmVjdGl2ZW5lc3MuZm9yRWFjaCgoc2NvcmVzLCBtZXRob2QpID0+IHtcbiAgICAgIGNvbnN0IGF2Z1Njb3JlID0gc2NvcmVzLnJlZHVjZSgoc3VtLCBzY29yZSkgPT4gc3VtICsgc2NvcmUsIDApIC8gc2NvcmVzLmxlbmd0aDtcbiAgICAgIGlmIChhdmdTY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICBiZXN0U2NvcmUgPSBhdmdTY29yZTtcbiAgICAgICAgYmVzdE1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBiZXN0TWV0aG9kO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZUltcHJvdmVtZW50UGxhbnMoc2Vzc2lvbjogVGVhY2hpbmdNYWxsQmVuY2htYXJrU2Vzc2lvbik6IEFnZW50SW1wcm92ZW1lbnRQbGFuW10ge1xuICAgIHJldHVybiBzZXNzaW9uLmxlYXJuaW5nT3V0Y29tZXMubWFwKG91dGNvbWUgPT4gKHtcbiAgICAgIGFnZW50SWQ6IG91dGNvbWUuYWdlbnRJZCxcbiAgICAgIGN1cnJlbnRTdHJlbmd0aHM6IG91dGNvbWUuc2tpbGxzSW1wcm92ZWQsXG4gICAgICBpbXByb3ZlbWVudEFyZWFzOiBvdXRjb21lLm5leHRMZWFybmluZ0dvYWxzLFxuICAgICAgcmVjb21tZW5kZWRBY3Rpb25zOiBbXG4gICAgICAgICdQYXJ0aWNpcGF0ZSBpbiBtb3JlIGNvbGxhYm9yYXRpdmUgYmVuY2htYXJraW5nIHNlc3Npb25zJyxcbiAgICAgICAgJ0ZvY3VzIG9uIHBlZXIgdGVhY2hpbmcgb3Bwb3J0dW5pdGllcycsXG4gICAgICAgICdFbmdhZ2Ugd2l0aCBjdWx0dXJhbCBjb21wZXRlbmN5IHRyYWluaW5nIG1vZHVsZXMnXG4gICAgICBdLFxuICAgICAgbWVudG9yc2hpcE9wcG9ydHVuaXRpZXM6IG91dGNvbWUuY29sbGFib3JhdGlvbkxlc3NvbnMubGVuZ3RoID4gMCBcbiAgICAgICAgPyBbJ1BlZXIgbWVudG9yaW5nIHByb2dyYW0nLCAnQ3VsdHVyYWwgY29tcGV0ZW5jeSB3b3Jrc2hvcHMnXVxuICAgICAgICA6IFsnU2VlayBtZW50b3JzaGlwIGZyb20gaGlnaC1wZXJmb3JtaW5nIGN1bHR1cmFsIGFnZW50cyddXG4gICAgfSkpO1xuICB9XG59XG5cbi8vIFN1cHBvcnRpbmcgaW50ZXJmYWNlc1xuaW50ZXJmYWNlIEFnZW50UmFua2luZyB7XG4gIGFnZW50SWQ6IHN0cmluZztcbiAgYXZlcmFnZVNjb3JlOiBudW1iZXI7XG4gIHJhbms6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENvbGxhYm9yYXRpb25JbnNpZ2h0IHtcbiAgcGF0dGVybjogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBzdHJlbmd0aDogbnVtYmVyO1xuICByZWNvbW1lbmRhdGlvbjogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgVGVhY2hpbmdFZmZlY3RpdmVuZXNzUmVwb3J0IHtcbiAgb3ZlcmFsbEVmZmVjdGl2ZW5lc3M6IG51bWJlcjtcbiAgdG90YWxUZWFjaGluZ01vbWVudHM6IG51bWJlcjtcbiAgbW9zdEVmZmVjdGl2ZU1ldGhvZDogc3RyaW5nO1xuICBpbXByb3ZlbWVudEFyZWFzOiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIEFnZW50SW1wcm92ZW1lbnRQbGFuIHtcbiAgYWdlbnRJZDogc3RyaW5nO1xuICBjdXJyZW50U3RyZW5ndGhzOiBzdHJpbmdbXTtcbiAgaW1wcm92ZW1lbnRBcmVhczogc3RyaW5nW107XG4gIHJlY29tbWVuZGVkQWN0aW9uczogc3RyaW5nW107XG4gIG1lbnRvcnNoaXBPcHBvcnR1bml0aWVzOiBzdHJpbmdbXTtcbn0iXX0=