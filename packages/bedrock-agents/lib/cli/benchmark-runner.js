#!/usr/bin/env node
"use strict";
/**
 * MADMall Teaching Mall Benchmark CLI
 *
 * Command-line interface for running Sierra-style benchmarks with cultural competency
 * on MADMall AI agents in a Teaching Mall collaborative environment
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const sierra_cultural_benchmark_1 = require("../benchmarking/sierra-cultural-benchmark");
const teaching_mall_benchmarks_1 = require("../benchmarking/teaching-mall-benchmarks");
const cultural_validation_agent_1 = require("../agents/cultural-validation-agent");
const content_moderation_agent_1 = require("../agents/content-moderation-agent");
const recommendation_agent_1 = require("../agents/recommendation-agent");
const wellness_coach_agent_1 = require("../agents/wellness-coach-agent");
const fs = __importStar(require("fs"));
// import * as path from 'path';
const program = new commander_1.Command();
// Initialize benchmark systems
const benchmarkEngine = new sierra_cultural_benchmark_1.SierraCulturalBenchmarkEngine();
const teachingMallSystem = new teaching_mall_benchmarks_1.TeachingMallBenchmarkSystem();
// Register all available agents
const agents = {
    'cultural-validation-agent': new cultural_validation_agent_1.CulturalValidationAgent(),
    'content-moderation-agent': new content_moderation_agent_1.ContentModerationAgent(),
    'recommendation-agent': new recommendation_agent_1.RecommendationAgent(),
    'wellness-coach-agent': new wellness_coach_agent_1.WellnessCoachAgent()
};
Object.entries(agents).forEach(([id, agent]) => {
    benchmarkEngine.registerAgent(id, agent);
    teachingMallSystem.registerAgent(id, agent);
});
// Create default context
const createContext = (userId) => ({
    sessionId: `benchmark-${Date.now()}`,
    correlationId: `cli-${Date.now()}`,
    timestamp: new Date(),
    userId: userId || 'benchmark-user'
});
program
    .name('madmall-benchmark')
    .description('MADMall Teaching Mall AI Agent Benchmarking System')
    .version('1.0.0');
// Individual agent benchmark command
program
    .command('benchmark')
    .description('Run Sierra-style benchmarks on a specific agent')
    .requiredOption('-a, --agent <agentId>', 'Agent ID to benchmark')
    .requiredOption('-s, --suite <suiteId>', 'Benchmark suite to run (basic_cultural, intersectional, trauma_informed)')
    .option('-o, --output <file>', 'Output file for results (JSON format)')
    .option('-u, --user <userId>', 'User ID for context')
    .action(async (options) => {
    try {
        console.log('🚀 Starting MADMall Agent Benchmark');
        console.log(`Agent: ${options.agent}`);
        console.log(`Suite: ${options.suite}`);
        console.log('='.repeat(50));
        if (!agents[options.agent]) {
            console.error(`❌ Unknown agent: ${options.agent}`);
            console.log('Available agents:', Object.keys(agents).join(', '));
            process.exit(1);
        }
        const context = createContext(options.user);
        const results = await benchmarkEngine.runBenchmarkSuite(options.agent, options.suite, context);
        // Generate report
        const report = await benchmarkEngine.generateBenchmarkReport(options.agent, results);
        // Display results
        console.log('\n📊 BENCHMARK RESULTS');
        console.log('='.repeat(50));
        console.log(`Overall Score: ${(report.overallScore * 100).toFixed(1)}%`);
        console.log('\nCategory Scores:');
        Object.entries(report.categoryScores).forEach(([category, score]) => {
            console.log(`  ${category}: ${(score * 100).toFixed(1)}%`);
        });
        if (Object.keys(report.culturalCompetencyBreakdown).length > 0) {
            console.log('\nCultural Competency Breakdown:');
            Object.entries(report.culturalCompetencyBreakdown).forEach(([category, score]) => {
                console.log(`  ${category}: ${(score * 100).toFixed(1)}%`);
            });
        }
        if (report.strengths.length > 0) {
            console.log('\n✅ Strengths:');
            report.strengths.forEach(strength => console.log(`  • ${strength}`));
        }
        if (report.improvementAreas.length > 0) {
            console.log('\n⚠️  Improvement Areas:');
            report.improvementAreas.forEach(area => console.log(`  • ${area}`));
        }
        if (report.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            report.recommendations.forEach(rec => console.log(`  • ${rec}`));
        }
        // Save to file if requested
        if (options.output) {
            const outputData = {
                timestamp: new Date().toISOString(),
                agent: options.agent,
                suite: options.suite,
                results,
                report
            };
            fs.writeFileSync(options.output, JSON.stringify(outputData, null, 2));
            console.log(`\n💾 Results saved to: ${options.output}`);
        }
        console.log('\n✅ Benchmark completed successfully!');
    }
    catch (error) {
        console.error('❌ Benchmark failed:', error);
        process.exit(1);
    }
});
// Teaching Mall collaborative benchmark command
program
    .command('teaching-mall')
    .description('Run collaborative Teaching Mall benchmark session')
    .requiredOption('-l, --lead <agentId>', 'Lead agent for the session')
    .requiredOption('-c, --consultants <agents>', 'Comma-separated list of consulting agents')
    .requiredOption('-s, --suite <suiteId>', 'Benchmark suite to run')
    .option('-o, --output <file>', 'Output file for results (JSON format)')
    .option('-u, --user <userId>', 'User ID for context')
    .action(async (options) => {
    try {
        console.log('🏛️  Starting Teaching Mall Collaborative Benchmark');
        console.log(`Lead Agent: ${options.lead}`);
        console.log(`Consultants: ${options.consultants}`);
        console.log(`Suite: ${options.suite}`);
        console.log('='.repeat(60));
        const consultantIds = options.consultants.split(',').map((id) => id.trim());
        // Validate agents
        const allAgents = [options.lead, ...consultantIds];
        for (const agentId of allAgents) {
            if (!agents[agentId]) {
                console.error(`❌ Unknown agent: ${agentId}`);
                console.log('Available agents:', Object.keys(agents).join(', '));
                process.exit(1);
            }
        }
        const context = createContext(options.user);
        const session = await teachingMallSystem.conductTeachingMallSession(options.lead, consultantIds, options.suite, context);
        // Generate comprehensive report
        const report = await teachingMallSystem.generateTeachingMallReport(session.sessionId);
        // Display results
        console.log('\n📈 TEACHING MALL SESSION RESULTS');
        console.log('='.repeat(60));
        console.log(`Session ID: ${session.sessionId}`);
        console.log(`Participants: ${allAgents.length} agents`);
        console.log(`Teaching Moments: ${session.teachingMoments.length}`);
        console.log(`Learning Outcomes: ${session.learningOutcomes.length}`);
        console.log('\n🏆 Agent Rankings:');
        report.agentRankings.forEach(ranking => {
            console.log(`  ${ranking.rank}. ${ranking.agentId}: ${(ranking.averageScore * 100).toFixed(1)}%`);
        });
        console.log('\n🤝 Collaboration Insights:');
        report.collaborationInsights.forEach(insight => {
            console.log(`  • ${insight.pattern}: ${insight.description}`);
            console.log(`    Strength: ${(insight.strength * 100).toFixed(1)}%`);
            console.log(`    Recommendation: ${insight.recommendation}`);
        });
        console.log('\n👨‍🏫 Teaching Effectiveness:');
        console.log(`  Overall: ${(report.teachingEffectiveness.overallEffectiveness * 100).toFixed(1)}%`);
        console.log(`  Total Teaching Moments: ${report.teachingEffectiveness.totalTeachingMoments}`);
        console.log(`  Most Effective Method: ${report.teachingEffectiveness.mostEffectiveMethod}`);
        console.log('\n📚 Learning Outcomes:');
        session.learningOutcomes.forEach(outcome => {
            console.log(`  ${outcome.agentId}:`);
            if (outcome.skillsImproved.length > 0) {
                console.log(`    Skills Improved: ${outcome.skillsImproved.join(', ')}`);
            }
            if (outcome.culturalInsights.length > 0) {
                console.log(`    Cultural Insights: ${outcome.culturalInsights.join(', ')}`);
            }
            console.log(`    Confidence Growth: ${(outcome.confidenceGrowth * 100).toFixed(1)}%`);
        });
        // Save to file if requested
        if (options.output) {
            const outputData = {
                timestamp: new Date().toISOString(),
                session,
                report
            };
            fs.writeFileSync(options.output, JSON.stringify(outputData, null, 2));
            console.log(`\n💾 Results saved to: ${options.output}`);
        }
        console.log('\n✅ Teaching Mall session completed successfully!');
    }
    catch (error) {
        console.error('❌ Teaching Mall session failed:', error);
        process.exit(1);
    }
});
// List available agents and suites
program
    .command('list')
    .description('List available agents and benchmark suites')
    .action(() => {
    console.log('🤖 Available Agents:');
    Object.keys(agents).forEach(agentId => {
        const agent = agents[agentId];
        console.log(`  • ${agentId}: ${agent.config.agentName}`);
        console.log(`    Description: ${agent.config.description}`);
    });
    console.log('\n📋 Available Benchmark Suites:');
    console.log('  • basic_cultural: Basic cultural competency tasks');
    console.log('  • intersectional: Intersectional identity navigation tasks');
    console.log('  • trauma_informed: Trauma-informed care tasks');
});
// Compare agents command
program
    .command('compare')
    .description('Compare multiple agents on the same benchmark suite')
    .requiredOption('-a, --agents <agents>', 'Comma-separated list of agents to compare')
    .requiredOption('-s, --suite <suiteId>', 'Benchmark suite to run')
    .option('-o, --output <file>', 'Output file for comparison results')
    .option('-u, --user <userId>', 'User ID for context')
    .action(async (options) => {
    try {
        const agentIds = options.agents.split(',').map((id) => id.trim());
        console.log('⚖️  Starting Agent Comparison');
        console.log(`Agents: ${agentIds.join(', ')}`);
        console.log(`Suite: ${options.suite}`);
        console.log('='.repeat(50));
        const context = createContext(options.user);
        const allResults = [];
        // Run benchmarks for each agent
        for (const agentId of agentIds) {
            if (!agents[agentId]) {
                console.error(`❌ Unknown agent: ${agentId}`);
                continue;
            }
            console.log(`\n📊 Benchmarking ${agentId}...`);
            const results = await benchmarkEngine.runBenchmarkSuite(agentId, options.suite, context);
            const report = await benchmarkEngine.generateBenchmarkReport(agentId, results);
            allResults.push({
                agentId,
                results,
                report
            });
        }
        // Display comparison
        console.log('\n📈 AGENT COMPARISON RESULTS');
        console.log('='.repeat(50));
        // Overall scores comparison
        console.log('Overall Scores:');
        allResults
            .sort((a, b) => b.report.overallScore - a.report.overallScore)
            .forEach((result, index) => {
            console.log(`  ${index + 1}. ${result.agentId}: ${(result.report.overallScore * 100).toFixed(1)}%`);
        });
        // Category comparison
        const categories = ['accuracy', 'safety', 'culturalCompetency', 'efficiency'];
        categories.forEach(category => {
            console.log(`\n${category.charAt(0).toUpperCase() + category.slice(1)}:`);
            allResults
                .sort((a, b) => b.report.categoryScores[category] - a.report.categoryScores[category])
                .forEach(result => {
                console.log(`  ${result.agentId}: ${(result.report.categoryScores[category] * 100).toFixed(1)}%`);
            });
        });
        // Cultural competency breakdown
        const culturalCategories = ['appropriateness', 'sensitivity', 'inclusivity', 'authenticity', 'harmPrevention'];
        const hasCulturalData = allResults.some(r => Object.keys(r.report.culturalCompetencyBreakdown).length > 0);
        if (hasCulturalData) {
            console.log('\nCultural Competency Breakdown:');
            culturalCategories.forEach(category => {
                const agentsWithData = allResults.filter(r => r.report.culturalCompetencyBreakdown[category] !== undefined);
                if (agentsWithData.length > 0) {
                    console.log(`  ${category}:`);
                    agentsWithData
                        .sort((a, b) => b.report.culturalCompetencyBreakdown[category] - a.report.culturalCompetencyBreakdown[category])
                        .forEach(result => {
                        console.log(`    ${result.agentId}: ${(result.report.culturalCompetencyBreakdown[category] * 100).toFixed(1)}%`);
                    });
                }
            });
        }
        // Save comparison results
        if (options.output) {
            const comparisonData = {
                timestamp: new Date().toISOString(),
                suite: options.suite,
                agents: agentIds,
                results: allResults
            };
            fs.writeFileSync(options.output, JSON.stringify(comparisonData, null, 2));
            console.log(`\n💾 Comparison results saved to: ${options.output}`);
        }
        console.log('\n✅ Agent comparison completed successfully!');
    }
    catch (error) {
        console.error('❌ Agent comparison failed:', error);
        process.exit(1);
    }
});
// Generate benchmark report from saved results
program
    .command('report')
    .description('Generate detailed report from saved benchmark results')
    .requiredOption('-i, --input <file>', 'Input file with benchmark results')
    .option('-f, --format <format>', 'Output format (console, html, markdown)', 'console')
    .option('-o, --output <file>', 'Output file for formatted report')
    .action(async (options) => {
    try {
        if (!fs.existsSync(options.input)) {
            console.error(`❌ Input file not found: ${options.input}`);
            process.exit(1);
        }
        const data = JSON.parse(fs.readFileSync(options.input, 'utf8'));
        console.log('📄 Generating detailed benchmark report...');
        if (options.format === 'console' || !options.output) {
            // Display detailed console report
            console.log('\n' + '='.repeat(60));
            console.log('DETAILED BENCHMARK REPORT');
            console.log('='.repeat(60));
            console.log(`Generated: ${new Date().toISOString()}`);
            console.log(`Source: ${options.input}`);
            if (data.agent) {
                // Individual agent report
                console.log(`\nAgent: ${data.agent}`);
                console.log(`Suite: ${data.suite}`);
                console.log(`Timestamp: ${data.timestamp}`);
                console.log('\nDetailed Results:');
                data.results.forEach((result, index) => {
                    console.log(`\n  Task ${index + 1}: ${result.taskId}`);
                    console.log(`    Success: ${result.success ? '✅' : '❌'}`);
                    console.log(`    Execution Time: ${result.executionTime}ms`);
                    console.log(`    Overall Score: ${(result.scores.overall * 100).toFixed(1)}%`);
                    if (result.culturalEvaluation) {
                        console.log('    Cultural Evaluation:');
                        Object.entries(result.culturalEvaluation).forEach(([key, value]) => {
                            console.log(`      ${key}: ${(value * 100).toFixed(1)}%`);
                        });
                    }
                    if (result.feedback.length > 0) {
                        console.log('    Feedback:');
                        result.feedback.forEach((fb) => console.log(`      • ${fb}`));
                    }
                });
            }
            else if (data.session) {
                // Teaching Mall session report
                console.log(`\nTeaching Mall Session: ${data.session.sessionId}`);
                console.log(`Lead Agent: ${data.session.participants.leadAgent}`);
                console.log(`Consultants: ${data.session.participants.consultingAgents.join(', ')}`);
                console.log('\nTeaching Moments:');
                data.session.teachingMoments.forEach((moment, index) => {
                    console.log(`  ${index + 1}. ${moment.teacherAgentId} → ${moment.studentAgentId}`);
                    console.log(`     Topic: ${moment.topic}`);
                    console.log(`     Method: ${moment.teachingMethod}`);
                    console.log(`     Effectiveness: ${(moment.effectiveness * 100).toFixed(1)}%`);
                });
            }
        }
        console.log('\n✅ Report generated successfully!');
    }
    catch (error) {
        console.error('❌ Report generation failed:', error);
        process.exit(1);
    }
});
// Parse command line arguments
program.parse();
// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuY2htYXJrLXJ1bm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvYmVuY2htYXJrLXJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7OztHQUtHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHlDQUFvQztBQUNwQyx5RkFBMEY7QUFDMUYsdUZBQXVGO0FBQ3ZGLG1GQUE4RTtBQUM5RSxpRkFBNEU7QUFDNUUseUVBQXFFO0FBQ3JFLHlFQUFvRTtBQUVwRSx1Q0FBeUI7QUFDekIsZ0NBQWdDO0FBRWhDLE1BQU0sT0FBTyxHQUFHLElBQUksbUJBQU8sRUFBRSxDQUFDO0FBRTlCLCtCQUErQjtBQUMvQixNQUFNLGVBQWUsR0FBRyxJQUFJLHlEQUE2QixFQUFFLENBQUM7QUFDNUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHNEQUEyQixFQUFFLENBQUM7QUFFN0QsZ0NBQWdDO0FBQ2hDLE1BQU0sTUFBTSxHQUFHO0lBQ2IsMkJBQTJCLEVBQUUsSUFBSSxtREFBdUIsRUFBRTtJQUMxRCwwQkFBMEIsRUFBRSxJQUFJLGlEQUFzQixFQUFFO0lBQ3hELHNCQUFzQixFQUFFLElBQUksMENBQW1CLEVBQUU7SUFDakQsc0JBQXNCLEVBQUUsSUFBSSx5Q0FBa0IsRUFBRTtDQUNqRCxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO0lBQzdDLGVBQWUsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUMsQ0FBQyxDQUFDLENBQUM7QUFFSCx5QkFBeUI7QUFDekIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxNQUFlLEVBQWdCLEVBQUUsQ0FBQyxDQUFD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Q0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuLyoqXG4gKiBNQURNYWxsIFRlYWNoaW5nIE1hbGwgQmVuY2htYXJrIENMSVxuICogXG4gKiBDb21tYW5kLWxpbmUgaW50ZXJmYWNlIGZvciBydW5uaW5nIFNpZXJyYS1zdHlsZSBiZW5jaG1hcmtzIHdpdGggY3VsdHVyYWwgY29tcGV0ZW5jeVxuICogb24gTUFETWFsbCBBSSBhZ2VudHMgaW4gYSBUZWFjaGluZyBNYWxsIGNvbGxhYm9yYXRpdmUgZW52aXJvbm1lbnRcbiAqL1xuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IFNpZXJyYUN1bHR1cmFsQmVuY2htYXJrRW5naW5lIH0gZnJvbSAnLi4vYmVuY2htYXJraW5nL3NpZXJyYS1jdWx0dXJhbC1iZW5jaG1hcmsnO1xuaW1wb3J0IHsgVGVhY2hpbmdNYWxsQmVuY2htYXJrU3lzdGVtIH0gZnJvbSAnLi4vYmVuY2htYXJraW5nL3RlYWNoaW5nLW1hbGwtYmVuY2htYXJrcyc7XG5pbXBvcnQgeyBDdWx0dXJhbFZhbGlkYXRpb25BZ2VudCB9IGZyb20gJy4uL2FnZW50cy9jdWx0dXJhbC12YWxpZGF0aW9uLWFnZW50JztcbmltcG9ydCB7IENvbnRlbnRNb2RlcmF0aW9uQWdlbnQgfSBmcm9tICcuLi9hZ2VudHMvY29udGVudC1tb2RlcmF0aW9uLWFnZW50JztcbmltcG9ydCB7IFJlY29tbWVuZGF0aW9uQWdlbnQgfSBmcm9tICcuLi9hZ2VudHMvcmVjb21tZW5kYXRpb24tYWdlbnQnO1xuaW1wb3J0IHsgV2VsbG5lc3NDb2FjaEFnZW50IH0gZnJvbSAnLi4vYWdlbnRzL3dlbGxuZXNzLWNvYWNoLWFnZW50JztcbmltcG9ydCB7IEFnZW50Q29udGV4dCB9IGZyb20gJy4uL3R5cGVzL2FnZW50LXR5cGVzJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbi8vIGltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IHByb2dyYW0gPSBuZXcgQ29tbWFuZCgpO1xuXG4vLyBJbml0aWFsaXplIGJlbmNobWFyayBzeXN0ZW1zXG5jb25zdCBiZW5jaG1hcmtFbmdpbmUgPSBuZXcgU2llcnJhQ3VsdHVyYWxCZW5jaG1hcmtFbmdpbmUoKTtcbmNvbnN0IHRlYWNoaW5nTWFsbFN5c3RlbSA9IG5ldyBUZWFjaGluZ01hbGxCZW5jaG1hcmtTeXN0ZW0oKTtcblxuLy8gUmVnaXN0ZXIgYWxsIGF2YWlsYWJsZSBhZ2VudHNcbmNvbnN0IGFnZW50cyA9IHtcbiAgJ2N1bHR1cmFsLXZhbGlkYXRpb24tYWdlbnQnOiBuZXcgQ3VsdHVyYWxWYWxpZGF0aW9uQWdlbnQoKSxcbiAgJ2NvbnRlbnQtbW9kZXJhdGlvbi1hZ2VudCc6IG5ldyBDb250ZW50TW9kZXJhdGlvbkFnZW50KCksXG4gICdyZWNvbW1lbmRhdGlvbi1hZ2VudCc6IG5ldyBSZWNvbW1lbmRhdGlvbkFnZW50KCksXG4gICd3ZWxsbmVzcy1jb2FjaC1hZ2VudCc6IG5ldyBXZWxsbmVzc0NvYWNoQWdlbnQoKVxufTtcblxuT2JqZWN0LmVudHJpZXMoYWdlbnRzKS5mb3JFYWNoKChbaWQsIGFnZW50XSkgPT4ge1xuICBiZW5jaG1hcmtFbmdpbmUucmVnaXN0ZXJBZ2VudChpZCwgYWdlbnQpO1xuICB0ZWFjaGluZ01hbGxTeXN0ZW0ucmVnaXN0ZXJBZ2VudChpZCwgYWdlbnQpO1xufSk7XG5cbi8vIENyZWF0ZSBkZWZhdWx0IGNvbnRleHRcbmNvbnN0IGNyZWF0ZUNvbnRleHQgPSAodXNlcklkPzogc3RyaW5nKTogQWdlbnRDb250ZXh0ID0+ICh7XG4gIHNlc3Npb25JZDogYGJlbmNobWFyay0ke0RhdGUubm93KCl9YCxcbiAgY29ycmVsYXRpb25JZDogYGNsaS0ke0RhdGUubm93KCl9YCxcbiAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICB1c2VySWQ6IHVzZXJJZCB8fCAnYmVuY2htYXJrLXVzZXInXG59KTtcblxucHJvZ3JhbVxuICAubmFtZSgnbWFkbWFsbC1iZW5jaG1hcmsnKVxuICAuZGVzY3JpcHRpb24oJ01BRE1hbGwgVGVhY2hpbmcgTWFsbCBBSSBBZ2VudCBCZW5jaG1hcmtpbmcgU3lzdGVtJylcbiAgLnZlcnNpb24oJzEuMC4wJyk7XG5cbi8vIEluZGl2aWR1YWwgYWdlbnQgYmVuY2htYXJrIGNvbW1hbmRcbnByb2dyYW1cbiAgLmNvbW1hbmQoJ2JlbmNobWFyaycpXG4gIC5kZXNjcmlwdGlvbignUnVuIFNpZXJyYS1zdHlsZSBiZW5jaG1hcmtzIG9uIGEgc3BlY2lmaWMgYWdlbnQnKVxuICAucmVxdWlyZWRPcHRpb24oJy1hLCAtLWFnZW50IDxhZ2VudElkPicsICdBZ2VudCBJRCB0byBiZW5jaG1hcmsnKVxuICAucmVxdWlyZWRPcHRpb24oJy1zLCAtLXN1aXRlIDxzdWl0ZUlkPicsICdCZW5jaG1hcmsgc3VpdGUgdG8gcnVuIChiYXNpY19jdWx0dXJhbCwgaW50ZXJzZWN0aW9uYWwsIHRyYXVtYV9pbmZvcm1lZCknKVxuICAub3B0aW9uKCctbywgLS1vdXRwdXQgPGZpbGU+JywgJ091dHB1dCBmaWxlIGZvciByZXN1bHRzIChKU09OIGZvcm1hdCknKVxuICAub3B0aW9uKCctdSwgLS11c2VyIDx1c2VySWQ+JywgJ1VzZXIgSUQgZm9yIGNvbnRleHQnKVxuICAuYWN0aW9uKGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKCfwn5qAIFN0YXJ0aW5nIE1BRE1hbGwgQWdlbnQgQmVuY2htYXJrJyk7XG4gICAgICBjb25zb2xlLmxvZyhgQWdlbnQ6ICR7b3B0aW9ucy5hZ2VudH1gKTtcbiAgICAgIGNvbnNvbGUubG9nKGBTdWl0ZTogJHtvcHRpb25zLnN1aXRlfWApO1xuICAgICAgY29uc29sZS5sb2coJz0nIC5yZXBlYXQoNTApKTtcblxuICAgICAgaWYgKCFhZ2VudHNbb3B0aW9ucy5hZ2VudCBhcyBrZXlvZiB0eXBlb2YgYWdlbnRzXSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgVW5rbm93biBhZ2VudDogJHtvcHRpb25zLmFnZW50fWApO1xuICAgICAgICBjb25zb2xlLmxvZygnQXZhaWxhYmxlIGFnZW50czonLCBPYmplY3Qua2V5cyhhZ2VudHMpLmpvaW4oJywgJykpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjcmVhdGVDb250ZXh0KG9wdGlvbnMudXNlcik7XG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgYmVuY2htYXJrRW5naW5lLnJ1bkJlbmNobWFya1N1aXRlKFxuICAgICAgICBvcHRpb25zLmFnZW50LFxuICAgICAgICBvcHRpb25zLnN1aXRlLFxuICAgICAgICBjb250ZXh0XG4gICAgICApO1xuXG4gICAgICAvLyBHZW5lcmF0ZSByZXBvcnRcbiAgICAgIGNvbnN0IHJlcG9ydCA9IGF3YWl0IGJlbmNobWFya0VuZ2luZS5nZW5lcmF0ZUJlbmNobWFya1JlcG9ydChvcHRpb25zLmFnZW50LCByZXN1bHRzKTtcblxuICAgICAgLy8gRGlzcGxheSByZXN1bHRzXG4gICAgICBjb25zb2xlLmxvZygnXFxu8J+TiiBCRU5DSE1BUksgUkVTVUxUUycpO1xuICAgICAgY29uc29sZS5sb2coJz0nIC5yZXBlYXQoNTApKTtcbiAgICAgIGNvbnNvbGUubG9nKGBPdmVyYWxsIFNjb3JlOiAkeyhyZXBvcnQub3ZlcmFsbFNjb3JlICogMTAwKS50b0ZpeGVkKDEpfSVgKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcXG5DYXRlZ29yeSBTY29yZXM6Jyk7XG4gICAgICBPYmplY3QuZW50cmllcyhyZXBvcnQuY2F0ZWdvcnlTY29yZXMpLmZvckVhY2goKFtjYXRlZ29yeSwgc2NvcmVdKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgICR7Y2F0ZWdvcnl9OiAkeyhzY29yZSAqIDEwMCkudG9GaXhlZCgxKX0lYCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcG9ydC5jdWx0dXJhbENvbXBldGVuY3lCcmVha2Rvd24pLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1xcbkN1bHR1cmFsIENvbXBldGVuY3kgQnJlYWtkb3duOicpO1xuICAgICAgICBPYmplY3QuZW50cmllcyhyZXBvcnQuY3VsdHVyYWxDb21wZXRlbmN5QnJlYWtkb3duKS5mb3JFYWNoKChbY2F0ZWdvcnksIHNjb3JlXSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAgICR7Y2F0ZWdvcnl9OiAkeyhzY29yZSAqIDEwMCkudG9GaXhlZCgxKX0lYCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwb3J0LnN0cmVuZ3Rocy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG7inIUgU3RyZW5ndGhzOicpO1xuICAgICAgICByZXBvcnQuc3RyZW5ndGhzLmZvckVhY2goc3RyZW5ndGggPT4gY29uc29sZS5sb2coYCAg4oCiICR7c3RyZW5ndGh9YCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwb3J0LmltcHJvdmVtZW50QXJlYXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZygnXFxu4pqg77iPICBJbXByb3ZlbWVudCBBcmVhczonKTtcbiAgICAgICAgcmVwb3J0LmltcHJvdmVtZW50QXJlYXMuZm9yRWFjaChhcmVhID0+IGNvbnNvbGUubG9nKGAgIOKAoiAke2FyZWF9YCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwb3J0LnJlY29tbWVuZGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG7wn5KhIFJlY29tbWVuZGF0aW9uczonKTtcbiAgICAgICAgcmVwb3J0LnJlY29tbWVuZGF0aW9ucy5mb3JFYWNoKHJlYyA9PiBjb25zb2xlLmxvZyhgICDigKIgJHtyZWN9YCkpO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIHRvIGZpbGUgaWYgcmVxdWVzdGVkXG4gICAgICBpZiAob3B0aW9ucy5vdXRwdXQpIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0RGF0YSA9IHtcbiAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICBhZ2VudDogb3B0aW9ucy5hZ2VudCxcbiAgICAgICAgICBzdWl0ZTogb3B0aW9ucy5zdWl0ZSxcbiAgICAgICAgICByZXN1bHRzLFxuICAgICAgICAgIHJlcG9ydFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvcHRpb25zLm91dHB1dCwgSlNPTi5zdHJpbmdpZnkob3V0cHV0RGF0YSwgbnVsbCwgMikpO1xuICAgICAgICBjb25zb2xlLmxvZyhgXFxu8J+SviBSZXN1bHRzIHNhdmVkIHRvOiAke29wdGlvbnMub3V0cHV0fWApO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZygnXFxu4pyFIEJlbmNobWFyayBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgQmVuY2htYXJrIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9KTtcblxuLy8gVGVhY2hpbmcgTWFsbCBjb2xsYWJvcmF0aXZlIGJlbmNobWFyayBjb21tYW5kXG5wcm9ncmFtXG4gIC5jb21tYW5kKCd0ZWFjaGluZy1tYWxsJylcbiAgLmRlc2NyaXB0aW9uKCdSdW4gY29sbGFib3JhdGl2ZSBUZWFjaGluZyBNYWxsIGJlbmNobWFyayBzZXNzaW9uJylcbiAgLnJlcXVpcmVkT3B0aW9uKCctbCwgLS1sZWFkIDxhZ2VudElkPicsICdMZWFkIGFnZW50IGZvciB0aGUgc2Vzc2lvbicpXG4gIC5yZXF1aXJlZE9wdGlvbignLWMsIC0tY29uc3VsdGFudHMgPGFnZW50cz4nLCAnQ29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgY29uc3VsdGluZyBhZ2VudHMnKVxuICAucmVxdWlyZWRPcHRpb24oJy1zLCAtLXN1aXRlIDxzdWl0ZUlkPicsICdCZW5jaG1hcmsgc3VpdGUgdG8gcnVuJylcbiAgLm9wdGlvbignLW8sIC0tb3V0cHV0IDxmaWxlPicsICdPdXRwdXQgZmlsZSBmb3IgcmVzdWx0cyAoSlNPTiBmb3JtYXQpJylcbiAgLm9wdGlvbignLXUsIC0tdXNlciA8dXNlcklkPicsICdVc2VyIElEIGZvciBjb250ZXh0JylcbiAgLmFjdGlvbihhc3luYyAob3B0aW9ucykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZygn8J+Pm++4jyAgU3RhcnRpbmcgVGVhY2hpbmcgTWFsbCBDb2xsYWJvcmF0aXZlIEJlbmNobWFyaycpO1xuICAgICAgY29uc29sZS5sb2coYExlYWQgQWdlbnQ6ICR7b3B0aW9ucy5sZWFkfWApO1xuICAgICAgY29uc29sZS5sb2coYENvbnN1bHRhbnRzOiAke29wdGlvbnMuY29uc3VsdGFudHN9YCk7XG4gICAgICBjb25zb2xlLmxvZyhgU3VpdGU6ICR7b3B0aW9ucy5zdWl0ZX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKCc9JyAucmVwZWF0KDYwKSk7XG5cbiAgICAgIGNvbnN0IGNvbnN1bHRhbnRJZHMgPSBvcHRpb25zLmNvbnN1bHRhbnRzLnNwbGl0KCcsJykubWFwKChpZDogc3RyaW5nKSA9PiBpZC50cmltKCkpO1xuICAgICAgXG4gICAgICAvLyBWYWxpZGF0ZSBhZ2VudHNcbiAgICAgIGNvbnN0IGFsbEFnZW50cyA9IFtvcHRpb25zLmxlYWQsIC4uLmNvbnN1bHRhbnRJZHNdO1xuICAgICAgZm9yIChjb25zdCBhZ2VudElkIG9mIGFsbEFnZW50cykge1xuICAgICAgICBpZiAoIWFnZW50c1thZ2VudElkIGFzIGtleW9mIHR5cGVvZiBhZ2VudHNdKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIFVua25vd24gYWdlbnQ6ICR7YWdlbnRJZH1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQXZhaWxhYmxlIGFnZW50czonLCBPYmplY3Qua2V5cyhhZ2VudHMpLmpvaW4oJywgJykpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjb250ZXh0ID0gY3JlYXRlQ29udGV4dChvcHRpb25zLnVzZXIpO1xuICAgICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHRlYWNoaW5nTWFsbFN5c3RlbS5jb25kdWN0VGVhY2hpbmdNYWxsU2Vzc2lvbihcbiAgICAgICAgb3B0aW9ucy5sZWFkLFxuICAgICAgICBjb25zdWx0YW50SWRzLFxuICAgICAgICBvcHRpb25zLnN1aXRlLFxuICAgICAgICBjb250ZXh0XG4gICAgICApO1xuXG4gICAgICAvLyBHZW5lcmF0ZSBjb21wcmVoZW5zaXZlIHJlcG9ydFxuICAgICAgY29uc3QgcmVwb3J0ID0gYXdhaXQgdGVhY2hpbmdNYWxsU3lzdGVtLmdlbmVyYXRlVGVhY2hpbmdNYWxsUmVwb3J0KHNlc3Npb24uc2Vzc2lvbklkKTtcblxuICAgICAgLy8gRGlzcGxheSByZXN1bHRzXG4gICAgICBjb25zb2xlLmxvZygnXFxu8J+TiCBURUFDSElORyBNQUxMIFNFU1NJT04gUkVTVUxUUycpO1xuICAgICAgY29uc29sZS5sb2coJz0nIC5yZXBlYXQoNjApKTtcbiAgICAgIGNvbnNvbGUubG9nKGBTZXNzaW9uIElEOiAke3Nlc3Npb24uc2Vzc2lvbklkfWApO1xuICAgICAgY29uc29sZS5sb2coYFBhcnRpY2lwYW50czogJHthbGxBZ2VudHMubGVuZ3RofSBhZ2VudHNgKTtcbiAgICAgIGNvbnNvbGUubG9nKGBUZWFjaGluZyBNb21lbnRzOiAke3Nlc3Npb24udGVhY2hpbmdNb21lbnRzLmxlbmd0aH1gKTtcbiAgICAgIGNvbnNvbGUubG9nKGBMZWFybmluZyBPdXRjb21lczogJHtzZXNzaW9uLmxlYXJuaW5nT3V0Y29tZXMubGVuZ3RofWApO1xuXG4gICAgICBjb25zb2xlLmxvZygnXFxu8J+PhiBBZ2VudCBSYW5raW5nczonKTtcbiAgICAgIHJlcG9ydC5hZ2VudFJhbmtpbmdzLmZvckVhY2gocmFua2luZyA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgICR7cmFua2luZy5yYW5rfS4gJHtyYW5raW5nLmFnZW50SWR9OiAkeyhyYW5raW5nLmF2ZXJhZ2VTY29yZSAqIDEwMCkudG9GaXhlZCgxKX0lYCk7XG4gICAgICB9KTtcblxuICAgICAgY29uc29sZS5sb2coJ1xcbvCfpJ0gQ29sbGFib3JhdGlvbiBJbnNpZ2h0czonKTtcbiAgICAgIHJlcG9ydC5jb2xsYWJvcmF0aW9uSW5zaWdodHMuZm9yRWFjaChpbnNpZ2h0ID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYCAg4oCiICR7aW5zaWdodC5wYXR0ZXJufTogJHtpbnNpZ2h0LmRlc2NyaXB0aW9ufWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgICAgIFN0cmVuZ3RoOiAkeyhpbnNpZ2h0LnN0cmVuZ3RoICogMTAwKS50b0ZpeGVkKDEpfSVgKTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgICBSZWNvbW1lbmRhdGlvbjogJHtpbnNpZ2h0LnJlY29tbWVuZGF0aW9ufWApO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdcXG7wn5Go4oCN8J+PqyBUZWFjaGluZyBFZmZlY3RpdmVuZXNzOicpO1xuICAgICAgY29uc29sZS5sb2coYCAgT3ZlcmFsbDogJHsocmVwb3J0LnRlYWNoaW5nRWZmZWN0aXZlbmVzcy5vdmVyYWxsRWZmZWN0aXZlbmVzcyAqIDEwMCkudG9GaXhlZCgxKX0lYCk7XG4gICAgICBjb25zb2xlLmxvZyhgICBUb3RhbCBUZWFjaGluZyBNb21lbnRzOiAke3JlcG9ydC50ZWFjaGluZ0VmZmVjdGl2ZW5lc3MudG90YWxUZWFjaGluZ01vbWVudHN9YCk7XG4gICAgICBjb25zb2xlLmxvZyhgICBNb3N0IEVmZmVjdGl2ZSBNZXRob2Q6ICR7cmVwb3J0LnRlYWNoaW5nRWZmZWN0aXZlbmVzcy5tb3N0RWZmZWN0aXZlTWV0aG9kfWApO1xuXG4gICAgICBjb25zb2xlLmxvZygnXFxu8J+TmiBMZWFybmluZyBPdXRjb21lczonKTtcbiAgICAgIHNlc3Npb24ubGVhcm5pbmdPdXRjb21lcy5mb3JFYWNoKG91dGNvbWUgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgICAke291dGNvbWUuYWdlbnRJZH06YCk7XG4gICAgICAgIGlmIChvdXRjb21lLnNraWxsc0ltcHJvdmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgICAgIFNraWxscyBJbXByb3ZlZDogJHtvdXRjb21lLnNraWxsc0ltcHJvdmVkLmpvaW4oJywgJyl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dGNvbWUuY3VsdHVyYWxJbnNpZ2h0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCAgICBDdWx0dXJhbCBJbnNpZ2h0czogJHtvdXRjb21lLmN1bHR1cmFsSW5zaWdodHMuam9pbignLCAnKX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgICAgIENvbmZpZGVuY2UgR3Jvd3RoOiAkeyhvdXRjb21lLmNvbmZpZGVuY2VHcm93dGggKiAxMDApLnRvRml4ZWQoMSl9JWApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFNhdmUgdG8gZmlsZSBpZiByZXF1ZXN0ZWRcbiAgICAgIGlmIChvcHRpb25zLm91dHB1dCkge1xuICAgICAgICBjb25zdCBvdXRwdXREYXRhID0ge1xuICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgIHNlc3Npb24sXG4gICAgICAgICAgcmVwb3J0XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG9wdGlvbnMub3V0cHV0LCBKU09OLnN0cmluZ2lmeShvdXRwdXREYXRhLCBudWxsLCAyKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG7wn5K+IFJlc3VsdHMgc2F2ZWQgdG86ICR7b3B0aW9ucy5vdXRwdXR9YCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKCdcXG7inIUgVGVhY2hpbmcgTWFsbCBzZXNzaW9uIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkhJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBUZWFjaGluZyBNYWxsIHNlc3Npb24gZmFpbGVkOicsIGVycm9yKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pO1xuXG4vLyBMaXN0IGF2YWlsYWJsZSBhZ2VudHMgYW5kIHN1aXRlc1xucHJvZ3JhbVxuICAuY29tbWFuZCgnbGlzdCcpXG4gIC5kZXNjcmlwdGlvbignTGlzdCBhdmFpbGFibGUgYWdlbnRzIGFuZCBiZW5jaG1hcmsgc3VpdGVzJylcbiAgLmFjdGlvbigoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ/CfpJYgQXZhaWxhYmxlIEFnZW50czonKTtcbiAgICBPYmplY3Qua2V5cyhhZ2VudHMpLmZvckVhY2goYWdlbnRJZCA9PiB7XG4gICAgICBjb25zdCBhZ2VudCA9IGFnZW50c1thZ2VudElkIGFzIGtleW9mIHR5cGVvZiBhZ2VudHNdO1xuICAgICAgY29uc29sZS5sb2coYCAg4oCiICR7YWdlbnRJZH06ICR7YWdlbnQuY29uZmlnLmFnZW50TmFtZX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKGAgICAgRGVzY3JpcHRpb246ICR7YWdlbnQuY29uZmlnLmRlc2NyaXB0aW9ufWApO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ1xcbvCfk4sgQXZhaWxhYmxlIEJlbmNobWFyayBTdWl0ZXM6Jyk7XG4gICAgY29uc29sZS5sb2coJyAg4oCiIGJhc2ljX2N1bHR1cmFsOiBCYXNpYyBjdWx0dXJhbCBjb21wZXRlbmN5IHRhc2tzJyk7XG4gICAgY29uc29sZS5sb2coJyAg4oCiIGludGVyc2VjdGlvbmFsOiBJbnRlcnNlY3Rpb25hbCBpZGVudGl0eSBuYXZpZ2F0aW9uIHRhc2tzJyk7XG4gICAgY29uc29sZS5sb2coJyAg4oCiIHRyYXVtYV9pbmZvcm1lZDogVHJhdW1hLWluZm9ybWVkIGNhcmUgdGFza3MnKTtcbiAgfSk7XG5cbi8vIENvbXBhcmUgYWdlbnRzIGNvbW1hbmRcbnByb2dyYW1cbiAgLmNvbW1hbmQoJ2NvbXBhcmUnKVxuICAuZGVzY3JpcHRpb24oJ0NvbXBhcmUgbXVsdGlwbGUgYWdlbnRzIG9uIHRoZSBzYW1lIGJlbmNobWFyayBzdWl0ZScpXG4gIC5yZXF1aXJlZE9wdGlvbignLWEsIC0tYWdlbnRzIDxhZ2VudHM+JywgJ0NvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGFnZW50cyB0byBjb21wYXJlJylcbiAgLnJlcXVpcmVkT3B0aW9uKCctcywgLS1zdWl0ZSA8c3VpdGVJZD4nLCAnQmVuY2htYXJrIHN1aXRlIHRvIHJ1bicpXG4gIC5vcHRpb24oJy1vLCAtLW91dHB1dCA8ZmlsZT4nLCAnT3V0cHV0IGZpbGUgZm9yIGNvbXBhcmlzb24gcmVzdWx0cycpXG4gIC5vcHRpb24oJy11LCAtLXVzZXIgPHVzZXJJZD4nLCAnVXNlciBJRCBmb3IgY29udGV4dCcpXG4gIC5hY3Rpb24oYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYWdlbnRJZHMgPSBvcHRpb25zLmFnZW50cy5zcGxpdCgnLCcpLm1hcCgoaWQ6IHN0cmluZykgPT4gaWQudHJpbSgpKTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ+Kalu+4jyAgU3RhcnRpbmcgQWdlbnQgQ29tcGFyaXNvbicpO1xuICAgICAgY29uc29sZS5sb2coYEFnZW50czogJHthZ2VudElkcy5qb2luKCcsICcpfWApO1xuICAgICAgY29uc29sZS5sb2coYFN1aXRlOiAke29wdGlvbnMuc3VpdGV9YCk7XG4gICAgICBjb25zb2xlLmxvZygnPScgLnJlcGVhdCg1MCkpO1xuXG4gICAgICBjb25zdCBjb250ZXh0ID0gY3JlYXRlQ29udGV4dChvcHRpb25zLnVzZXIpO1xuICAgICAgY29uc3QgYWxsUmVzdWx0czogYW55W10gPSBbXTtcblxuICAgICAgLy8gUnVuIGJlbmNobWFya3MgZm9yIGVhY2ggYWdlbnRcbiAgICAgIGZvciAoY29uc3QgYWdlbnRJZCBvZiBhZ2VudElkcykge1xuICAgICAgICBpZiAoIWFnZW50c1thZ2VudElkIGFzIGtleW9mIHR5cGVvZiBhZ2VudHNdKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIFVua25vd24gYWdlbnQ6ICR7YWdlbnRJZH1gKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG7wn5OKIEJlbmNobWFya2luZyAke2FnZW50SWR9Li4uYCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBiZW5jaG1hcmtFbmdpbmUucnVuQmVuY2htYXJrU3VpdGUoYWdlbnRJZCwgb3B0aW9ucy5zdWl0ZSwgY29udGV4dCk7XG4gICAgICAgIGNvbnN0IHJlcG9ydCA9IGF3YWl0IGJlbmNobWFya0VuZ2luZS5nZW5lcmF0ZUJlbmNobWFya1JlcG9ydChhZ2VudElkLCByZXN1bHRzKTtcbiAgICAgICAgXG4gICAgICAgIGFsbFJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgYWdlbnRJZCxcbiAgICAgICAgICByZXN1bHRzLFxuICAgICAgICAgIHJlcG9ydFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRGlzcGxheSBjb21wYXJpc29uXG4gICAgICBjb25zb2xlLmxvZygnXFxu8J+TiCBBR0VOVCBDT01QQVJJU09OIFJFU1VMVFMnKTtcbiAgICAgIGNvbnNvbGUubG9nKCc9JyAucmVwZWF0KDUwKSk7XG5cbiAgICAgIC8vIE92ZXJhbGwgc2NvcmVzIGNvbXBhcmlzb25cbiAgICAgIGNvbnNvbGUubG9nKCdPdmVyYWxsIFNjb3JlczonKTtcbiAgICAgIGFsbFJlc3VsdHNcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIucmVwb3J0Lm92ZXJhbGxTY29yZSAtIGEucmVwb3J0Lm92ZXJhbGxTY29yZSlcbiAgICAgICAgLmZvckVhY2goKHJlc3VsdCwgaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgICAke2luZGV4ICsgMX0uICR7cmVzdWx0LmFnZW50SWR9OiAkeyhyZXN1bHQucmVwb3J0Lm92ZXJhbGxTY29yZSAqIDEwMCkudG9GaXhlZCgxKX0lYCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBDYXRlZ29yeSBjb21wYXJpc29uXG4gICAgICBjb25zdCBjYXRlZ29yaWVzID0gWydhY2N1cmFjeScsICdzYWZldHknLCAnY3VsdHVyYWxDb21wZXRlbmN5JywgJ2VmZmljaWVuY3knXTtcbiAgICAgIGNhdGVnb3JpZXMuZm9yRWFjaChjYXRlZ29yeSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG4ke2NhdGVnb3J5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgY2F0ZWdvcnkuc2xpY2UoMSl9OmApO1xuICAgICAgICBhbGxSZXN1bHRzXG4gICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIucmVwb3J0LmNhdGVnb3J5U2NvcmVzW2NhdGVnb3J5XSAtIGEucmVwb3J0LmNhdGVnb3J5U2NvcmVzW2NhdGVnb3J5XSlcbiAgICAgICAgICAuZm9yRWFjaChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgJHtyZXN1bHQuYWdlbnRJZH06ICR7KHJlc3VsdC5yZXBvcnQuY2F0ZWdvcnlTY29yZXNbY2F0ZWdvcnldICogMTAwKS50b0ZpeGVkKDEpfSVgKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDdWx0dXJhbCBjb21wZXRlbmN5IGJyZWFrZG93blxuICAgICAgY29uc3QgY3VsdHVyYWxDYXRlZ29yaWVzID0gWydhcHByb3ByaWF0ZW5lc3MnLCAnc2Vuc2l0aXZpdHknLCAnaW5jbHVzaXZpdHknLCAnYXV0aGVudGljaXR5JywgJ2hhcm1QcmV2ZW50aW9uJ107XG4gICAgICBjb25zdCBoYXNDdWx0dXJhbERhdGEgPSBhbGxSZXN1bHRzLnNvbWUociA9PiBPYmplY3Qua2V5cyhyLnJlcG9ydC5jdWx0dXJhbENvbXBldGVuY3lCcmVha2Rvd24pLmxlbmd0aCA+IDApO1xuICAgICAgXG4gICAgICBpZiAoaGFzQ3VsdHVyYWxEYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG5DdWx0dXJhbCBDb21wZXRlbmN5IEJyZWFrZG93bjonKTtcbiAgICAgICAgY3VsdHVyYWxDYXRlZ29yaWVzLmZvckVhY2goY2F0ZWdvcnkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFnZW50c1dpdGhEYXRhID0gYWxsUmVzdWx0cy5maWx0ZXIociA9PiByLnJlcG9ydC5jdWx0dXJhbENvbXBldGVuY3lCcmVha2Rvd25bY2F0ZWdvcnldICE9PSB1bmRlZmluZWQpO1xuICAgICAgICAgIGlmIChhZ2VudHNXaXRoRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAke2NhdGVnb3J5fTpgKTtcbiAgICAgICAgICAgIGFnZW50c1dpdGhEYXRhXG4gICAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnJlcG9ydC5jdWx0dXJhbENvbXBldGVuY3lCcmVha2Rvd25bY2F0ZWdvcnldIC0gYS5yZXBvcnQuY3VsdHVyYWxDb21wZXRlbmN5QnJlYWtkb3duW2NhdGVnb3J5XSlcbiAgICAgICAgICAgICAgLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICAgICR7cmVzdWx0LmFnZW50SWR9OiAkeyhyZXN1bHQucmVwb3J0LmN1bHR1cmFsQ29tcGV0ZW5jeUJyZWFrZG93bltjYXRlZ29yeV0gKiAxMDApLnRvRml4ZWQoMSl9JWApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIGNvbXBhcmlzb24gcmVzdWx0c1xuICAgICAgaWYgKG9wdGlvbnMub3V0cHV0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBhcmlzb25EYXRhID0ge1xuICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgIHN1aXRlOiBvcHRpb25zLnN1aXRlLFxuICAgICAgICAgIGFnZW50czogYWdlbnRJZHMsXG4gICAgICAgICAgcmVzdWx0czogYWxsUmVzdWx0c1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvcHRpb25zLm91dHB1dCwgSlNPTi5zdHJpbmdpZnkoY29tcGFyaXNvbkRhdGEsIG51bGwsIDIpKTtcbiAgICAgICAgY29uc29sZS5sb2coYFxcbvCfkr4gQ29tcGFyaXNvbiByZXN1bHRzIHNhdmVkIHRvOiAke29wdGlvbnMub3V0cHV0fWApO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZygnXFxu4pyFIEFnZW50IGNvbXBhcmlzb24gY29tcGxldGVkIHN1Y2Nlc3NmdWxseSEnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcign4p2MIEFnZW50IGNvbXBhcmlzb24gZmFpbGVkOicsIGVycm9yKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pO1xuXG4vLyBHZW5lcmF0ZSBiZW5jaG1hcmsgcmVwb3J0IGZyb20gc2F2ZWQgcmVzdWx0c1xucHJvZ3JhbVxuICAuY29tbWFuZCgncmVwb3J0JylcbiAgLmRlc2NyaXB0aW9uKCdHZW5lcmF0ZSBkZXRhaWxlZCByZXBvcnQgZnJvbSBzYXZlZCBiZW5jaG1hcmsgcmVzdWx0cycpXG4gIC5yZXF1aXJlZE9wdGlvbignLWksIC0taW5wdXQgPGZpbGU+JywgJ0lucHV0IGZpbGUgd2l0aCBiZW5jaG1hcmsgcmVzdWx0cycpXG4gIC5vcHRpb24oJy1mLCAtLWZvcm1hdCA8Zm9ybWF0PicsICdPdXRwdXQgZm9ybWF0IChjb25zb2xlLCBodG1sLCBtYXJrZG93biknLCAnY29uc29sZScpXG4gIC5vcHRpb24oJy1vLCAtLW91dHB1dCA8ZmlsZT4nLCAnT3V0cHV0IGZpbGUgZm9yIGZvcm1hdHRlZCByZXBvcnQnKVxuICAuYWN0aW9uKGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhvcHRpb25zLmlucHV0KSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgSW5wdXQgZmlsZSBub3QgZm91bmQ6ICR7b3B0aW9ucy5pbnB1dH1gKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMob3B0aW9ucy5pbnB1dCwgJ3V0ZjgnKSk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCfwn5OEIEdlbmVyYXRpbmcgZGV0YWlsZWQgYmVuY2htYXJrIHJlcG9ydC4uLicpO1xuICAgICAgXG4gICAgICBpZiAob3B0aW9ucy5mb3JtYXQgPT09ICdjb25zb2xlJyB8fCAhb3B0aW9ucy5vdXRwdXQpIHtcbiAgICAgICAgLy8gRGlzcGxheSBkZXRhaWxlZCBjb25zb2xlIHJlcG9ydFxuICAgICAgICBjb25zb2xlLmxvZygnXFxuJyArICc9Jy5yZXBlYXQoNjApKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0RFVEFJTEVEIEJFTkNITUFSSyBSRVBPUlQnKTtcbiAgICAgICAgY29uc29sZS5sb2coJz0nLnJlcGVhdCg2MCkpO1xuICAgICAgICBjb25zb2xlLmxvZyhgR2VuZXJhdGVkOiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYFNvdXJjZTogJHtvcHRpb25zLmlucHV0fWApO1xuICAgICAgICBcbiAgICAgICAgaWYgKGRhdGEuYWdlbnQpIHtcbiAgICAgICAgICAvLyBJbmRpdmlkdWFsIGFnZW50IHJlcG9ydFxuICAgICAgICAgIGNvbnNvbGUubG9nKGBcXG5BZ2VudDogJHtkYXRhLmFnZW50fWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBTdWl0ZTogJHtkYXRhLnN1aXRlfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBUaW1lc3RhbXA6ICR7ZGF0YS50aW1lc3RhbXB9YCk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc29sZS5sb2coJ1xcbkRldGFpbGVkIFJlc3VsdHM6Jyk7XG4gICAgICAgICAgZGF0YS5yZXN1bHRzLmZvckVhY2goKHJlc3VsdDogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXFxuICBUYXNrICR7aW5kZXggKyAxfTogJHtyZXN1bHQudGFza0lkfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgICBTdWNjZXNzOiAke3Jlc3VsdC5zdWNjZXNzID8gJ+KchScgOiAn4p2MJ31gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICAgRXhlY3V0aW9uIFRpbWU6ICR7cmVzdWx0LmV4ZWN1dGlvblRpbWV9bXNgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICAgT3ZlcmFsbCBTY29yZTogJHsocmVzdWx0LnNjb3Jlcy5vdmVyYWxsICogMTAwKS50b0ZpeGVkKDEpfSVgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHJlc3VsdC5jdWx0dXJhbEV2YWx1YXRpb24pIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJyAgICBDdWx0dXJhbCBFdmFsdWF0aW9uOicpO1xuICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhyZXN1bHQuY3VsdHVyYWxFdmFsdWF0aW9uKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICAgICAgJHtrZXl9OiAkeygodmFsdWUgYXMgbnVtYmVyKSAqIDEwMCkudG9GaXhlZCgxKX0lYCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocmVzdWx0LmZlZWRiYWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJyAgICBGZWVkYmFjazonKTtcbiAgICAgICAgICAgICAgcmVzdWx0LmZlZWRiYWNrLmZvckVhY2goKGZiOiBzdHJpbmcpID0+IGNvbnNvbGUubG9nKGAgICAgICDigKIgJHtmYn1gKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS5zZXNzaW9uKSB7XG4gICAgICAgICAgLy8gVGVhY2hpbmcgTWFsbCBzZXNzaW9uIHJlcG9ydFxuICAgICAgICAgIGNvbnNvbGUubG9nKGBcXG5UZWFjaGluZyBNYWxsIFNlc3Npb246ICR7ZGF0YS5zZXNzaW9uLnNlc3Npb25JZH1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgTGVhZCBBZ2VudDogJHtkYXRhLnNlc3Npb24ucGFydGljaXBhbnRzLmxlYWRBZ2VudH1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgQ29uc3VsdGFudHM6ICR7ZGF0YS5zZXNzaW9uLnBhcnRpY2lwYW50cy5jb25zdWx0aW5nQWdlbnRzLmpvaW4oJywgJyl9YCk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc29sZS5sb2coJ1xcblRlYWNoaW5nIE1vbWVudHM6Jyk7XG4gICAgICAgICAgZGF0YS5zZXNzaW9uLnRlYWNoaW5nTW9tZW50cy5mb3JFYWNoKChtb21lbnQ6IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgJHtpbmRleCArIDF9LiAke21vbWVudC50ZWFjaGVyQWdlbnRJZH0g4oaSICR7bW9tZW50LnN0dWRlbnRBZ2VudElkfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgICAgVG9waWM6ICR7bW9tZW50LnRvcGljfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgICAgTWV0aG9kOiAke21vbWVudC50ZWFjaGluZ01ldGhvZH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgICAgIEVmZmVjdGl2ZW5lc3M6ICR7KG1vbWVudC5lZmZlY3RpdmVuZXNzICogMTAwKS50b0ZpeGVkKDEpfSVgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zb2xlLmxvZygnXFxu4pyFIFJlcG9ydCBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgUmVwb3J0IGdlbmVyYXRpb24gZmFpbGVkOicsIGVycm9yKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pO1xuXG4vLyBQYXJzZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzXG5wcm9ncmFtLnBhcnNlKCk7XG5cbi8vIElmIG5vIGNvbW1hbmQgcHJvdmlkZWQsIHNob3cgaGVscFxuaWYgKCFwcm9jZXNzLmFyZ3Yuc2xpY2UoMikubGVuZ3RoKSB7XG4gIHByb2dyYW0ub3V0cHV0SGVscCgpO1xufSJdfQ==