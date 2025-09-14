#!/usr/bin/env ts-node

import { LiveMeetingManager } from '../../../../LiveMeetingManager';

async function runDemoMeeting() {
  console.log('🏛️ MADMall Real-Time Agent Collaboration Demo');
  console.log('=====================================');
  
  const meetingManager = new LiveMeetingManager();
  
  // Set up event listeners for demo
  meetingManager.on('meetingStarted', (data) => {
    console.log(`\n✅ Meeting started: ${data.sessionId}`);
    console.log(`📋 Topic: ${data.topic}`);
    console.log(`👥 Participants: ${data.participants.join(', ')}`);
  });
  
  meetingManager.on('agentSpoke', (data) => {
    console.log(`\n🗣️ ${data.agent.toUpperCase()}: ${data.message.substring(0, 200)}...`);
  });
  
  meetingManager.on('consensusUpdate', (data) => {
    const percentage = Math.round(data.consensus.agreementLevel * 100);
    console.log(`\n📊 Consensus: ${percentage}% (${data.consensus.status})`);
  });

  try {
    // Demo Scenario 1: MADMall Feature Planning
    console.log('\n🎬 Demo Scenario: AI-Powered Wellness Goal Tracking Feature');
    console.log('============================================================');
    
    const sessionId = await meetingManager.startLiveMeeting(
      'AI-powered wellness goal tracking for Black women with Graves\' disease',
      ['claude', 'kiro', 'gemini', 'amazon_q'],
      'brainstorm',
      {
        objectives: [
          'Design culturally-appropriate goal tracking system',
          'Ensure community-centered approach over individual metrics',
          'Plan technical implementation with TitanEngine integration',
          'Establish success metrics and validation approach'
        ],
        culturalConsiderations: [
          'Community-oriented wellness approaches preferred',
          'Cultural validation of all goal types and messaging',
          'Integration with existing support circles',
          'Holistic health perspective including spiritual wellness'
        ],
        constraints: [
          'Must integrate with existing TitanEngine care recommendations',
          'Real-time cultural validation required',
          'Mobile-first design for accessibility'
        ]
      }
    );

    // Wait for initial discussion
    console.log('\n⏱️  Allowing 15 seconds for agent discussion...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Add user input to guide discussion
    console.log('\n👤 User joins the conversation...');
    await meetingManager.addUserMessage(
      sessionId,
      'I want this feature to feel supportive, not judgmental. How can we ensure the goals feel like community encouragement rather than clinical tracking?',
      ['kiro', 'claude']
    );

    // Allow responses
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Ask Gemini for data validation
    await meetingManager.addUserMessage(
      sessionId,
      'Gemini, how would you statistically validate that our approach is more effective than traditional individual goal tracking?',
      ['gemini']
    );

    await new Promise(resolve => setTimeout(resolve, 8000));

    // Ask Amazon Q about business implications
    await meetingManager.addUserMessage(
      sessionId,
      'Amazon Q, what are the business and operational considerations for implementing this community-focused approach?',
      ['amazon_q']
    );

    await new Promise(resolve => setTimeout(resolve, 8000));

    // Final consensus check
    const finalConsensus = await meetingManager.getMeetingState(sessionId);
    console.log(`\n📈 Final Consensus Level: ${Math.round((finalConsensus?.consensus.level || 0) * 100)}%`);
    
    // Show meeting summary
    const history = meetingManager.getMeetingHistory(sessionId);
    console.log(`\n📊 Meeting Summary:`);
    console.log(`- Total messages: ${history.length}`);
    console.log(`- Agents participated: ${new Set(history.map(m => m.from.agentId)).size}`);
    console.log(`- Duration: ${Math.round((Date.now() - (finalConsensus?.startTime || Date.now())) / 1000)}s`);

    // End the meeting
    await meetingManager.endMeeting(sessionId);
    
    console.log('\n✅ Demo completed successfully!');
    console.log('\n🎯 Key Outcomes:');
    console.log('- Claude provided technical architecture recommendations');
    console.log('- Kiro ensured cultural competency and community focus');
    console.log('- Gemini designed statistical validation approach');
    console.log('- Amazon Q analyzed business and operational implications');
    console.log('- All agents collaborated to reach consensus on implementation');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  runDemoMeeting().catch(console.error);
}

export { runDemoMeeting };