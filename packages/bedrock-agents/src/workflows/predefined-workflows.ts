import { WorkflowDefinition } from '../types/workflow-types';

// Content validation workflow - validates content through cultural and moderation checks
export const contentValidationWorkflow: WorkflowDefinition = {
  id: 'content-validation',
  name: 'Content Validation Workflow',
  description: 'Comprehensive content validation through cultural sensitivity and moderation checks',
  version: '1.0.0',
  steps: [
    {
      id: 'cultural-validation',
      name: 'Cultural Validation',
      agentId: 'cultural-validation-agent',
      inputMapping: {
        content: 'input.content',
        contentType: 'input.contentType',
        culturalContext: 'input.culturalContext',
        targetAudience: 'input.targetAudience',
      },
      outputMapping: {
        'data.isAppropriate': 'culturallyAppropriate',
        'data.overallScore': 'culturalScore',
        'data.issues': 'culturalIssues',
      },
    },
    {
      id: 'content-moderation',
      name: 'Content Moderation',
      agentId: 'content-moderation-agent',
      inputMapping: {
        content: 'input.content',
        contentType: 'input.contentType',
        moderationLevel: 'input.moderationLevel',
      },
      outputMapping: {
        'data.isAllowed': 'moderationAllowed',
        'data.riskScore': 'riskScore',
        'data.action': 'recommendedAction',
      },
      condition: '${culturallyAppropriate} === true',
    },
    {
      id: 'final-decision',
      name: 'Final Validation Decision',
      agentId: 'cultural-validation-agent', // Reuse for final decision logic
      inputMapping: {
        culturalResult: 'variables.culturalScore',
        moderationResult: 'variables.riskScore',
        culturalIssues: 'variables.culturalIssues',
      },
      outputMapping: {
        'data': 'finalDecision',
      },
    },
  ],
  errorHandling: {
    onError: 'fallback',
    fallbackSteps: ['safe-rejection'],
    maxExecutionTime: 60000, // 1 minute
  },
};

// Personalized recommendation workflow
export const personalizationWorkflow: WorkflowDefinition = {
  id: 'personalized-recommendations',
  name: 'Personalized Recommendations Workflow',
  description: 'Generate personalized recommendations based on user profile and context',
  version: '1.0.0',
  steps: [
    {
      id: 'analyze-user-profile',
      name: 'User Profile Analysis',
      agentId: 'recommendation-agent',
      inputMapping: {
        userId: 'input.userId',
        recommendationType: 'input.recommendationType',
        context: 'input.context',
      },
      outputMapping: {
        'data.recommendations': 'baseRecommendations',
        'data.personalizationScore': 'personalizationScore',
      },
    },
    {
      id: 'cultural-filter',
      name: 'Cultural Appropriateness Filter',
      agentId: 'cultural-validation-agent',
      inputMapping: {
        recommendations: 'variables.baseRecommendations',
        culturalContext: 'input.userProfile.culturalContext',
      },
      outputMapping: {
        'data': 'filteredRecommendations',
      },
      condition: '${baseRecommendations}.length > 0',
    },
    {
      id: 'wellness-alignment',
      name: 'Wellness Goal Alignment',
      agentId: 'wellness-coach-agent',
      inputMapping: {
        recommendations: 'variables.filteredRecommendations',
        userGoals: 'input.userProfile.currentGoals',
        wellnessMetrics: 'input.userProfile.recentMetrics',
      },
      outputMapping: {
        'data': 'finalRecommendations',
      },
    },
  ],
  errorHandling: {
    onError: 'continue',
    maxExecutionTime: 120000, // 2 minutes
  },
};

// Wellness check-in workflow
export const wellnessCheckInWorkflow: WorkflowDefinition = {
  id: 'wellness-check-in',
  name: 'Wellness Check-in Workflow',
  description: 'Comprehensive wellness assessment and coaching session',
  version: '1.0.0',
  steps: [
    {
      id: 'crisis-assessment',
      name: 'Crisis Risk Assessment',
      agentId: 'wellness-coach-agent',
      inputMapping: {
        userMessage: 'input.userMessage',
        urgencyLevel: 'input.urgencyLevel',
      },
      outputMapping: {
        'data.escalationNeeded': 'crisisDetected',
        'data.escalationReason': 'crisisReason',
      },
    },
    {
      id: 'wellness-coaching',
      name: 'Wellness Coaching Session',
      agentId: 'wellness-coach-agent',
      inputMapping: {
        userId: 'input.userId',
        sessionType: 'input.sessionType',
        userMessage: 'input.userMessage',
        currentGoals: 'input.currentGoals',
        recentMetrics: 'input.recentMetrics',
      },
      outputMapping: {
        'data': 'coachingResponse',
      },
      condition: '${crisisDetected} !== true',
    },
    {
      id: 'crisis-intervention',
      name: 'Crisis Intervention',
      agentId: 'wellness-coach-agent',
      inputMapping: {
        userId: 'input.userId',
        sessionType: 'crisis_support',
        userMessage: 'input.userMessage',
        urgencyLevel: 'crisis',
      },
      outputMapping: {
        'data': 'crisisResponse',
      },
      condition: '${crisisDetected} === true',
    },
    {
      id: 'generate-recommendations',
      name: 'Generate Wellness Recommendations',
      agentId: 'recommendation-agent',
      inputMapping: {
        userId: 'input.userId',
        recommendationType: 'activities',
        context: 'variables.coachingResponse',
      },
      outputMapping: {
        'data.recommendations': 'wellnessRecommendations',
      },
      condition: '${crisisDetected} !== true',
    },
  ],
  errorHandling: {
    onError: 'stop',
    maxExecutionTime: 180000, // 3 minutes
  },
};

// Community onboarding workflow
export const communityOnboardingWorkflow: WorkflowDefinition = {
  id: 'community-onboarding',
  name: 'Community Onboarding Workflow',
  description: 'Personalized onboarding experience for new community members',
  version: '1.0.0',
  steps: [
    {
      id: 'profile-analysis',
      name: 'User Profile Analysis',
      agentId: 'recommendation-agent',
      inputMapping: {
        userId: 'input.userId',
        userProfile: 'input.userProfile',
      },
      outputMapping: {
        'data': 'profileInsights',
      },
    },
    {
      id: 'circle-recommendations',
      name: 'Circle Recommendations',
      agentId: 'recommendation-agent',
      inputMapping: {
        userId: 'input.userId',
        recommendationType: 'circles',
        context: 'variables.profileInsights',
      },
      outputMapping: {
        'data.recommendations': 'recommendedCircles',
      },
    },
    {
      id: 'connection-matching',
      name: 'Peer Connection Matching',
      agentId: 'recommendation-agent',
      inputMapping: {
        userId: 'input.userId',
        recommendationType: 'connections',
        userProfile: 'input.userProfile',
      },
      outputMapping: {
        'data.recommendations': 'potentialConnections',
      },
    },
    {
      id: 'wellness-goal-setting',
      name: 'Initial Wellness Goal Setting',
      agentId: 'wellness-coach-agent',
      inputMapping: {
        userId: 'input.userId',
        sessionType: 'goal_setting',
        userMessage: 'input.onboardingGoals',
      },
      outputMapping: {
        'data': 'initialGoals',
      },
    },
    {
      id: 'cultural-preferences',
      name: 'Cultural Preference Setup',
      agentId: 'cultural-validation-agent',
      inputMapping: {
        culturalContext: 'input.userProfile.culturalContext',
        preferences: 'input.userProfile.preferences',
      },
      outputMapping: {
        'data': 'culturalSettings',
      },
    },
  ],
  errorHandling: {
    onError: 'continue',
    maxExecutionTime: 300000, // 5 minutes
  },
};

// Export all predefined workflows
export const predefinedWorkflows: WorkflowDefinition[] = [
  contentValidationWorkflow,
  personalizationWorkflow,
  wellnessCheckInWorkflow,
  communityOnboardingWorkflow,
];