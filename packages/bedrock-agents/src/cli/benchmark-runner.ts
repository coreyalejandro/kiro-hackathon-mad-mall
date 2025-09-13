#!/usr/bin/env node

/**
 * MADMall Teaching Mall Benchmark CLI
 * 
 * Command-line interface for running Sierra-style benchmarks with cultural competency
 * on MADMall AI agents in a Teaching Mall collaborative environment
 */

import { Command } from 'commander';
import { SierraCulturalBenchmarkEngine } from '../benchmarking/sierra-cultural-benchmark';
import { TeachingMallBenchmarkSystem } from '../benchmarking/teaching-mall-benchmarks';
import { CulturalValidationAgent } from '../agents/cultural-validation-agent';
import { ContentModerationAgent } from '../agents/content-moderation-agent';
import { RecommendationAgent } from '../agents/recommendation-agent';
import { WellnessCoachAgent } from '../agents/wellness-coach-agent';
import { AgentContext } from '../types/agent-types';
import * as fs from 'fs';
// import * as path from 'path';

const program = new Command();

// Initialize benchmark systems
const benchmarkEngine = new SierraCulturalBenchmarkEngine();
const teachingMallSystem = new TeachingMallBenchmarkSystem();

// Register all available agents
const agents = {
  'cultural-validation-agent': new CulturalValidationAgent(),
  'content-moderation-agent': new ContentModerationAgent(),
  'recommendation-agent': new RecommendationAgent(),
  'wellness-coach-agent': new WellnessCoachAgent()
};

Object.entries(agents).forEach(([id, agent]) => {
  benchmarkEngine.registerAgent(id, agent);
  teachingMallSystem.registerAgent(id, agent);
});

// Create default context
const createContext = (userId?: string): AgentContext => ({
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
      console.log('=' .repeat(50));

      if (!agents[options.agent as keyof typeof agents]) {
        console.error(`❌ Unknown agent: ${options.agent}`);
        console.log('Available agents:', Object.keys(agents).join(', '));
        process.exit(1);
      }

      const context = createContext(options.user);
      const results = await benchmarkEngine.runBenchmarkSuite(
        options.agent,
        options.suite,
        context
      );

      // Generate report
      const report = await benchmarkEngine.generateBenchmarkReport(options.agent, results);

      // Display results
      console.log('\n📊 BENCHMARK RESULTS');
      console.log('=' .repeat(50));
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
    } catch (error) {
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
      console.log('=' .repeat(60));

      const consultantIds = options.consultants.split(',').map((id: string) => id.trim());
      
      // Validate agents
      const allAgents = [options.lead, ...consultantIds];
      for (const agentId of allAgents) {
        if (!agents[agentId as keyof typeof agents]) {
          console.error(`❌ Unknown agent: ${agentId}`);
          console.log('Available agents:', Object.keys(agents).join(', '));
          process.exit(1);
        }
      }

      const context = createContext(options.user);
      const session = await teachingMallSystem.conductTeachingMallSession(
        options.lead,
        consultantIds,
        options.suite,
        context
      );

      // Generate comprehensive report
      const report = await teachingMallSystem.generateTeachingMallReport(session.sessionId);

      // Display results
      console.log('\n📈 TEACHING MALL SESSION RESULTS');
      console.log('=' .repeat(60));
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
    } catch (error) {
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
      const agent = agents[agentId as keyof typeof agents];
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
      const agentIds = options.agents.split(',').map((id: string) => id.trim());
      
      console.log('⚖️  Starting Agent Comparison');
      console.log(`Agents: ${agentIds.join(', ')}`);
      console.log(`Suite: ${options.suite}`);
      console.log('=' .repeat(50));

      const context = createContext(options.user);
      const allResults: any[] = [];

      // Run benchmarks for each agent
      for (const agentId of agentIds) {
        if (!agents[agentId as keyof typeof agents]) {
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
      console.log('=' .repeat(50));

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
    } catch (error) {
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
          data.results.forEach((result: any, index: number) => {
            console.log(`\n  Task ${index + 1}: ${result.taskId}`);
            console.log(`    Success: ${result.success ? '✅' : '❌'}`);
            console.log(`    Execution Time: ${result.executionTime}ms`);
            console.log(`    Overall Score: ${(result.scores.overall * 100).toFixed(1)}%`);
            
            if (result.culturalEvaluation) {
              console.log('    Cultural Evaluation:');
              Object.entries(result.culturalEvaluation).forEach(([key, value]) => {
                console.log(`      ${key}: ${((value as number) * 100).toFixed(1)}%`);
              });
            }
            
            if (result.feedback.length > 0) {
              console.log('    Feedback:');
              result.feedback.forEach((fb: string) => console.log(`      • ${fb}`));
            }
          });
        } else if (data.session) {
          // Teaching Mall session report
          console.log(`\nTeaching Mall Session: ${data.session.sessionId}`);
          console.log(`Lead Agent: ${data.session.participants.leadAgent}`);
          console.log(`Consultants: ${data.session.participants.consultingAgents.join(', ')}`);
          
          console.log('\nTeaching Moments:');
          data.session.teachingMoments.forEach((moment: any, index: number) => {
            console.log(`  ${index + 1}. ${moment.teacherAgentId} → ${moment.studentAgentId}`);
            console.log(`     Topic: ${moment.topic}`);
            console.log(`     Method: ${moment.teachingMethod}`);
            console.log(`     Effectiveness: ${(moment.effectiveness * 100).toFixed(1)}%`);
          });
        }
      }
      
      console.log('\n✅ Report generated successfully!');
    } catch (error) {
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