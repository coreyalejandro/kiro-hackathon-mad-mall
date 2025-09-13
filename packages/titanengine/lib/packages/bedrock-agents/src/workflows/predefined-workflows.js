"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predefinedWorkflows = exports.communityOnboardingWorkflow = exports.wellnessCheckInWorkflow = exports.personalizationWorkflow = exports.contentValidationWorkflow = void 0;
// Content validation workflow - validates content through cultural and moderation checks
exports.contentValidationWorkflow = {
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
exports.personalizationWorkflow = {
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
exports.wellnessCheckInWorkflow = {
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
exports.communityOnboardingWorkflow = {
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
exports.predefinedWorkflows = [
    exports.contentValidationWorkflow,
    exports.personalizationWorkflow,
    exports.wellnessCheckInWorkflow,
    exports.communityOnboardingWorkflow,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZGVmaW5lZC13b3JrZmxvd3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9iZWRyb2NrLWFnZW50cy9zcmMvd29ya2Zsb3dzL3ByZWRlZmluZWQtd29ya2Zsb3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHlGQUF5RjtBQUM1RSxRQUFBLHlCQUF5QixHQUF1QjtJQUMzRCxFQUFFLEVBQUUsb0JBQW9CO0lBQ3hCLElBQUksRUFBRSw2QkFBNkI7SUFDbkMsV0FBVyxFQUFFLHFGQUFxRjtJQUNsRyxPQUFPLEVBQUUsT0FBTztJQUNoQixLQUFLLEVBQUU7UUFDTDtZQUNFLEVBQUUsRUFBRSxxQkFBcUI7WUFDekIsSUFBSSxFQUFFLHFCQUFxQjtZQUMzQixPQUFPLEVBQUUsMkJBQTJCO1lBQ3BDLFlBQVksRUFBRTtnQkFDWixPQUFPLEVBQUUsZUFBZTtnQkFDeEIsV0FBVyxFQUFFLG1CQUFtQjtnQkFDaEMsZUFBZSxFQUFFLHVCQUF1QjtnQkFDeEMsY0FBYyxFQUFFLHNCQUFzQjthQUN2QztZQUNELGFBQWEsRUFBRTtnQkFDYixvQkFBb0IsRUFBRSx1QkFBdUI7Z0JBQzdDLG1CQUFtQixFQUFFLGVBQWU7Z0JBQ3BDLGFBQWEsRUFBRSxnQkFBZ0I7YUFDaEM7U0FDRjtRQUNEO1lBQ0UsRUFBRSxFQUFFLG9CQUFvQjtZQUN4QixJQUFJLEVBQUUsb0JBQW9CO1lBQzFCLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsWUFBWSxFQUFFO2dCQUNaLE9BQU8sRUFBRSxlQUFlO2dCQUN4QixXQUFXLEVBQUUsbUJBQW1CO2dCQUNoQyxlQUFlLEVBQUUsdUJBQXVCO2FBQ3pDO1lBQ0QsYUFBYSxFQUFFO2dCQUNiLGdCQUFnQixFQUFFLG1CQUFtQjtnQkFDckMsZ0JBQWdCLEVBQUUsV0FBVztnQkFDN0IsYUFBYSxFQUFFLG1CQUFtQjthQUNuQztZQUNELFNBQVMsRUFBRSxtQ0FBbUM7U0FDL0M7UUFDRDtZQUNFLEVB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QU0sRUFBRSxrQkFBa0I7YUFDM0I7U0FDRjtLQUNGO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsT0FBTyxFQUFFLFVBQVU7UUFDbkIsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLFlBQVk7S0FDdkM7Q0FDRixDQUFDO0FBRUYsa0NBQWtDO0FBQ3JCLFFBQUEsbUJBQW1CLEdBQXlCO0lBQ3ZELGlDQUF5QjtJQUN6QiwrQkFBdUI7SUFDdkIsK0JBQXVCO0lBQ3ZCLG1DQUEyQjtDQUM1QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgV29ya2Zsb3dEZWZpbml0aW9uIH0gZnJvbSAnLi4vdHlwZXMvd29ya2Zsb3ctdHlwZXMnO1xuXG4vLyBDb250ZW50IHZhbGlkYXRpb24gd29ya2Zsb3cgLSB2YWxpZGF0ZXMgY29udGVudCB0aHJvdWdoIGN1bHR1cmFsIGFuZCBtb2RlcmF0aW9uIGNoZWNrc1xuZXhwb3J0IGNvbnN0IGNvbnRlbnRWYWxpZGF0aW9uV29ya2Zsb3c6IFdvcmtmbG93RGVmaW5pdGlvbiA9IHtcbiAgaWQ6ICdjb250ZW50LXZhbGlkYXRpb24nLFxuICBuYW1lOiAnQ29udGVudCBWYWxpZGF0aW9uIFdvcmtmbG93JyxcbiAgZGVzY3JpcHRpb246ICdDb21wcmVoZW5zaXZlIGNvbnRlbnQgdmFsaWRhdGlvbiB0aHJvdWdoIGN1bHR1cmFsIHNlbnNpdGl2aXR5IGFuZCBtb2RlcmF0aW9uIGNoZWNrcycsXG4gIHZlcnNpb246ICcxLjAuMCcsXG4gIHN0ZXBzOiBbXG4gICAge1xuICAgICAgaWQ6ICdjdWx0dXJhbC12YWxpZGF0aW9uJyxcbiAgICAgIG5hbWU6ICdDdWx0dXJhbCBWYWxpZGF0aW9uJyxcbiAgICAgIGFnZW50SWQ6ICdjdWx0dXJhbC12YWxpZGF0aW9uLWFnZW50JyxcbiAgICAgIGlucHV0TWFwcGluZzoge1xuICAgICAgICBjb250ZW50OiAnaW5wdXQuY29udGVudCcsXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnaW5wdXQuY29udGVudFR5cGUnLFxuICAgICAgICBjdWx0dXJhbENvbnRleHQ6ICdpbnB1dC5jdWx0dXJhbENvbnRleHQnLFxuICAgICAgICB0YXJnZXRBdWRpZW5jZTogJ2lucHV0LnRhcmdldEF1ZGllbmNlJyxcbiAgICAgIH0sXG4gICAgICBvdXRwdXRNYXBwaW5nOiB7XG4gICAgICAgICdkYXRhLmlzQXBwcm9wcmlhdGUnOiAnY3VsdHVyYWxseUFwcHJvcHJpYXRlJyxcbiAgICAgICAgJ2RhdGEub3ZlcmFsbFNjb3JlJzogJ2N1bHR1cmFsU2NvcmUnLFxuICAgICAgICAnZGF0YS5pc3N1ZXMnOiAnY3VsdHVyYWxJc3N1ZXMnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnY29udGVudC1tb2RlcmF0aW9uJyxcbiAgICAgIG5hbWU6ICdDb250ZW50IE1vZGVyYXRpb24nLFxuICAgICAgYWdlbnRJZDogJ2NvbnRlbnQtbW9kZXJhdGlvbi1hZ2VudCcsXG4gICAgICBpbnB1dE1hcHBpbmc6IHtcbiAgICAgICAgY29udGVudDogJ2lucHV0LmNvbnRlbnQnLFxuICAgICAgICBjb250ZW50VHlwZTogJ2lucHV0LmNvbnRlbnRUeXBlJyxcbiAgICAgICAgbW9kZXJhdGlvbkxldmVsOiAnaW5wdXQubW9kZXJhdGlvbkxldmVsJyxcbiAgICAgIH0sXG4gICAgICBvdXRwdXRNYXBwaW5nOiB7XG4gICAgICAgICdkYXRhLmlzQWxsb3dlZCc6ICdtb2RlcmF0aW9uQWxsb3dlZCcsXG4gICAgICAgICdkYXRhLnJpc2tTY29yZSc6ICdyaXNrU2NvcmUnLFxuICAgICAgICAnZGF0YS5hY3Rpb24nOiAncmVjb21tZW5kZWRBY3Rpb24nLFxuICAgICAgfSxcbiAgICAgIGNvbmRpdGlvbjogJyR7Y3VsdHVyYWxseUFwcHJvcHJpYXRlfSA9PT0gdHJ1ZScsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2ZpbmFsLWRlY2lzaW9uJyxcbiAgICAgIG5hbWU6ICdGaW5hbCBWYWxpZGF0aW9uIERlY2lzaW9uJyxcbiAgICAgIGFnZW50SWQ6ICdjdWx0dXJhbC12YWxpZGF0aW9uLWFnZW50JywgLy8gUmV1c2UgZm9yIGZpbmFsIGRlY2lzaW9uIGxvZ2ljXG4gICAgICBpbnB1dE1hcHBpbmc6IHtcbiAgICAgICAgY3VsdHVyYWxSZXN1bHQ6ICd2YXJpYWJsZXMuY3VsdHVyYWxTY29yZScsXG4gICAgICAgIG1vZGVyYXRpb25SZXN1bHQ6ICd2YXJpYWJsZXMucmlza1Njb3JlJyxcbiAgICAgICAgY3VsdHVyYWxJc3N1ZXM6ICd2YXJpYWJsZXMuY3VsdHVyYWxJc3N1ZXMnLFxuICAgICAgfSxcbiAgICAgIG91dHB1dE1hcHBpbmc6IHtcbiAgICAgICAgJ2RhdGEnOiAnZmluYWxEZWNpc2lvbicsXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG4gIGVycm9ySGFuZGxpbmc6IHtcbiAgICBvbkVycm9yOiAnZmFsbGJhY2snLFxuICAgIGZhbGxiYWNrU3RlcHM6IFsnc2FmZS1yZWplY3Rpb24nXSxcbiAgICBtYXhFeGVjdXRpb25UaW1lOiA2MDAwMCwgLy8gMSBtaW51dGVcbiAgfSxcbn07XG5cbi8vIFBlcnNvbmFsaXplZCByZWNvbW1lbmRhdGlvbiB3b3JrZmxvd1xuZXhwb3J0IGNvbnN0IHBlcnNvbmFsaXphdGlvbldvcmtmbG93OiBXb3JrZmxvd0RlZmluaXRpb24gPSB7XG4gIGlkOiAncGVyc29uYWxpemVkLXJlY29tbWVuZGF0aW9ucycsXG4gIG5hbWU6ICdQZXJzb25hbGl6ZWQgUmVjb21tZW5kYXRpb25zIFdvcmtmbG93JyxcbiAgZGVzY3JpcHRpb246ICdHZW5lcmF0ZSBwZXJzb25hbGl6ZWQgcmVjb21tZW5kYXRpb25zIGJhc2VkIG9uIHVzZXIgcHJvZmlsZSBhbmQgY29udGV4dCcsXG4gIHZlcnNpb246ICcxLjAuMCcsXG4gIHN0ZXBzOiBbXG4gICAge1xuICAgICAgaWQ6ICdhbmFseXplLXVzZXItcHJvZmlsZScsXG4gICAgICBuYW1lOiAnVXNlciBQcm9maWxlIEFuYWx5c2lzJyxcbiAgICAgIGFnZW50SWQ6ICdyZWNvbW1lbmRhdGlvbi1hZ2VudCcsXG4gICAgICBpbnB1dE1hcHBpbmc6IHtcbiAgICAgICAgdXNlcklkOiAnaW5wdXQudXNlcklkJyxcbiAgICAgICAgcmVjb21tZW5kYXRpb25UeXBlOiAnaW5wdXQucmVjb21tZW5kYXRpb25UeXBlJyxcbiAgICAgICAgY29udGV4dDogJ2lucHV0LmNvbnRleHQnLFxuICAgICAgfSxcbiAgICAgIG91dHB1dE1hcHBpbmc6IHtcbiAgICAgICAgJ2RhdGEucmVjb21tZW5kYXRpb25zJzogJ2Jhc2VSZWNvbW1lbmRhdGlvbnMnLFxuICAgICAgICAnZGF0YS5wZXJzb25hbGl6YXRpb25TY29yZSc6ICdwZXJzb25hbGl6YXRpb25TY29yZScsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjdWx0dXJhbC1maWx0ZXInLFxuICAgICAgbmFtZTogJ0N1bHR1cmFsIEFwcHJvcHJpYXRlbmVzcyBGaWx0ZXInLFxuICAgICAgYWdlbnRJZDogJ2N1bHR1cmFsLXZhbGlkYXRpb24tYWdlbnQnLFxuICAgICAgaW5wdXRNYXBwaW5nOiB7XG4gICAgICAgIHJlY29tbWVuZGF0aW9uczogJ3ZhcmlhYmxlcy5iYXNlUmVjb21tZW5kYXRpb25zJyxcbiAgICAgICAgY3VsdHVyYWxDb250ZXh0OiAnaW5wdXQudXNlclByb2ZpbGUuY3VsdHVyYWxDb250ZXh0JyxcbiAgICAgIH0sXG4gICAgICBvdXRwdXRNYXBwaW5nOiB7XG4gICAgICAgICdkYXRhJzogJ2ZpbHRlcmVkUmVjb21tZW5kYXRpb25zJyxcbiAgICAgIH0sXG4gICAgICBjb25kaXRpb246ICcke2Jhc2VSZWNvbW1lbmRhdGlvbnN9Lmxlbmd0aCA+IDAnLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICd3ZWxsbmVzcy1hbGlnbm1lbnQnLFxuICAgICAgbmFtZTogJ1dlbGxuZXNzIEdvYWwgQWxpZ25tZW50JyxcbiAgICAgIGFnZW50SWQ6ICd3ZWxsbmVzcy1jb2FjaC1hZ2VudCcsXG4gICAgICBpbnB1dE1hcHBpbmc6IHtcbiAgICAgICAgcmVjb21tZW5kYXRpb25zOiAndmFyaWFibGVzLmZpbHRlcmVkUmVjb21tZW5kYXRpb25zJyxcbiAgICAgICAgdXNlckdvYWxzOiAnaW5wdXQudXNlclByb2ZpbGUuY3VycmVudEdvYWxzJyxcbiAgICAgICAgd2VsbG5lc3NNZXRyaWNzOiAnaW5wdXQudXNlclByb2ZpbGUucmVjZW50TWV0cmljcycsXG4gICAgICB9LFxuICAgICAgb3V0cHV0TWFwcGluZzoge1xuICAgICAgICAnZGF0YSc6ICdmaW5hbFJlY29tbWVuZGF0aW9ucycsXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG4gIGVycm9ySGFuZGxpbmc6IHtcbiAgICBvbkVycm9yOiAnY29udGludWUnLFxuICAgIG1heEV4ZWN1dGlvblRpbWU6IDEyMDAwMCwgLy8gMiBtaW51dGVzXG4gIH0sXG59O1xuXG4vLyBXZWxsbmVzcyBjaGVjay1pbiB3b3JrZmxvd1xuZXhwb3J0IGNvbnN0IHdlbGxuZXNzQ2hlY2tJbldvcmtmbG93OiBXb3JrZmxvd0RlZmluaXRpb24gPSB7XG4gIGlkOiAnd2VsbG5lc3MtY2hlY2staW4nLFxuICBuYW1lOiAnV2VsbG5lc3MgQ2hlY2staW4gV29ya2Zsb3cnLFxuICBkZXNjcmlwdGlvbjogJ0NvbXByZWhlbnNpdmUgd2VsbG5lc3MgYXNzZXNzbWVudCBhbmQgY29hY2hpbmcgc2Vzc2lvbicsXG4gIHZlcnNpb246ICcxLjAuMCcsXG4gIHN0ZXBzOiBbXG4gICAge1xuICAgICAgaWQ6ICdjcmlzaXMtYXNzZXNzbWVudCcsXG4gICAgICBuYW1lOiAnQ3Jpc2lzIFJpc2sgQXNzZXNzbWVudCcsXG4gICAgICBhZ2VudElkOiAnd2VsbG5lc3MtY29hY2gtYWdlbnQnLFxuICAgICAgaW5wdXRNYXBwaW5nOiB7XG4gICAgICAgIHVzZXJNZXNzYWdlOiAnaW5wdXQudXNlck1lc3NhZ2UnLFxuICAgICAgICB1cmdlbmN5TGV2ZWw6ICdpbnB1dC51cmdlbmN5TGV2ZWwnLFxuICAgICAgfSxcbiAgICAgIG91dHB1dE1hcHBpbmc6IHtcbiAgICAgICAgJ2RhdGEuZXNjYWxhdGlvbk5lZWRlZCc6ICdjcmlzaXNEZXRlY3RlZCcsXG4gICAgICAgICdkYXRhLmVzY2FsYXRpb25SZWFzb24nOiAnY3Jpc2lzUmVhc29uJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3dlbGxuZXNzLWNvYWNoaW5nJyxcbiAgICAgIG5hbWU6ICdXZWxsbmVzcyBDb2FjaGluZyBTZXNzaW9uJyxcbiAgICAgIGFnZW50SWQ6ICd3ZWxsbmVzcy1jb2FjaC1hZ2VudCcsXG4gICAgICBpbnB1dE1hcHBpbmc6IHtcbiAgICAgICAgdXNlcklkOiAnaW5wdXQudXNlcklkJyxcbiAgICAgICAgc2Vzc2lvblR5cGU6ICdpbnB1dC5zZXNzaW9uVHlwZScsXG4gICAgICAgIHVzZXJNZXNzYWdlOiAnaW5wdXQudXNlck1lc3NhZ2UnLFxuICAgICAgICBjdXJyZW50R29hbHM6ICdpbnB1dC5jdXJyZW50R29hbHMnLFxuICAgICAgICByZWNlbnRNZXRyaWNzOiAnaW5wdXQucmVjZW50TWV0cmljcycsXG4gICAgICB9LFxuICAgICAgb3V0cHV0TWFwcGluZzoge1xuICAgICAgICAnZGF0YSc6ICdjb2FjaGluZ1Jlc3BvbnNlJyxcbiAgICAgIH0sXG4gICAgICBjb25kaXRpb246ICcke2NyaXNpc0RldGVjdGVkfSAhPT0gdHJ1ZScsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2NyaXNpcy1pbnRlcnZlbnRpb24nLFxuICAgICAgbmFtZTogJ0NyaXNpcyBJbnRlcnZlbnRpb24nLFxuICAgICAgYWdlbnRJZDogJ3dlbGxuZXNzLWNvYWNoLWFnZW50JyxcbiAgICAgIGlucHV0TWFwcGluZzoge1xuICAgICAgICB1c2VySWQ6ICdpbnB1dC51c2VySWQnLFxuICAgICAgICBzZXNzaW9uVHlwZTogJ2NyaXNpc19zdXBwb3J0JyxcbiAgICAgICAgdXNlck1lc3NhZ2U6ICdpbnB1dC51c2VyTWVzc2FnZScsXG4gICAgICAgIHVyZ2VuY3lMZXZlbDogJ2NyaXNpcycsXG4gICAgICB9LFxuICAgICAgb3V0cHV0TWFwcGluZzoge1xuICAgICAgICAnZGF0YSc6ICdjcmlzaXNSZXNwb25zZScsXG4gICAgICB9LFxuICAgICAgY29uZGl0aW9uOiAnJHtjcmlzaXNEZXRlY3RlZH0gPT09IHRydWUnLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdnZW5lcmF0ZS1yZWNvbW1lbmRhdGlvbnMnLFxuICAgICAgbmFtZTogJ0dlbmVyYXRlIFdlbGxuZXNzIFJlY29tbWVuZGF0aW9ucycsXG4gICAgICBhZ2VudElkOiAncmVjb21tZW5kYXRpb24tYWdlbnQnLFxuICAgICAgaW5wdXRNYXBwaW5nOiB7XG4gICAgICAgIHVzZXJJZDogJ2lucHV0LnVzZXJJZCcsXG4gICAgICAgIHJlY29tbWVuZGF0aW9uVHlwZTogJ2FjdGl2aXRpZXMnLFxuICAgICAgICBjb250ZXh0OiAndmFyaWFibGVzLmNvYWNoaW5nUmVzcG9uc2UnLFxuICAgICAgfSxcbiAgICAgIG91dHB1dE1hcHBpbmc6IHtcbiAgICAgICAgJ2RhdGEucmVjb21tZW5kYXRpb25zJzogJ3dlbGxuZXNzUmVjb21tZW5kYXRpb25zJyxcbiAgICAgIH0sXG4gICAgICBjb25kaXRpb246ICcke2NyaXNpc0RldGVjdGVkfSAhPT0gdHJ1ZScsXG4gICAgfSxcbiAgXSxcbiAgZXJyb3JIYW5kbGluZzoge1xuICAgIG9uRXJyb3I6ICdzdG9wJyxcbiAgICBtYXhFeGVjdXRpb25UaW1lOiAxODAwMDAsIC8vIDMgbWludXRlc1xuICB9LFxufTtcblxuLy8gQ29tbXVuaXR5IG9uYm9hcmRpbmcgd29ya2Zsb3dcbmV4cG9ydCBjb25zdCBjb21tdW5pdHlPbmJvYXJkaW5nV29ya2Zsb3c6IFdvcmtmbG93RGVmaW5pdGlvbiA9IHtcbiAgaWQ6ICdjb21tdW5pdHktb25ib2FyZGluZycsXG4gIG5hbWU6ICdDb21tdW5pdHkgT25ib2FyZGluZyBXb3JrZmxvdycsXG4gIGRlc2NyaXB0aW9uOiAnUGVyc29uYWxpemVkIG9uYm9hcmRpbmcgZXhwZXJpZW5jZSBmb3IgbmV3IGNvbW11bml0eSBtZW1iZXJzJyxcbiAgdmVyc2lvbjogJzEuMC4wJyxcbiAgc3RlcHM6IFtcbiAgICB7XG4gICAgICBpZDogJ3Byb2ZpbGUtYW5hbHlzaXMnLFxuICAgICAgbmFtZTogJ1VzZXIgUHJvZmlsZSBBbmFseXNpcycsXG4gICAgICBhZ2VudElkOiAncmVjb21tZW5kYXRpb24tYWdlbnQnLFxuICAgICAgaW5wdXRNYXBwaW5nOiB7XG4gICAgICAgIHVzZXJJZDogJ2lucHV0LnVzZXJJZCcsXG4gICAgICAgIHVzZXJQcm9maWxlOiAnaW5wdXQudXNlclByb2ZpbGUnLFxuICAgICAgfSxcbiAgICAgIG91dHB1dE1hcHBpbmc6IHtcbiAgICAgICAgJ2RhdGEnOiAncHJvZmlsZUluc2lnaHRzJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2NpcmNsZS1yZWNvbW1lbmRhdGlvbnMnLFxuICAgICAgbmFtZTogJ0NpcmNsZSBSZWNvbW1lbmRhdGlvbnMnLFxuICAgICAgYWdlbnRJZDogJ3JlY29tbWVuZGF0aW9uLWFnZW50JyxcbiAgICAgIGlucHV0TWFwcGluZzoge1xuICAgICAgICB1c2VySWQ6ICdpbnB1dC51c2VySWQnLFxuICAgICAgICByZWNvbW1lbmRhdGlvblR5cGU6ICdjaXJjbGVzJyxcbiAgICAgICAgY29udGV4dDogJ3ZhcmlhYmxlcy5wcm9maWxlSW5zaWdodHMnLFxuICAgICAgfSxcbiAgICAgIG91dHB1dE1hcHBpbmc6IHtcbiAgICAgICAgJ2RhdGEucmVjb21tZW5kYXRpb25zJzogJ3JlY29tbWVuZGVkQ2lyY2xlcycsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb25uZWN0aW9uLW1hdGNoaW5nJyxcbiAgICAgIG5hbWU6ICdQZWVyIENvbm5lY3Rpb24gTWF0Y2hpbmcnLFxuICAgICAgYWdlbnRJZDogJ3JlY29tbWVuZGF0aW9uLWFnZW50JyxcbiAgICAgIGlucHV0TWFwcGluZzoge1xuICAgICAgICB1c2VySWQ6ICdpbnB1dC51c2VySWQnLFxuICAgICAgICByZWNvbW1lbmRhdGlvblR5cGU6ICdjb25uZWN0aW9ucycsXG4gICAgICAgIHVzZXJQcm9maWxlOiAnaW5wdXQudXNlclByb2ZpbGUnLFxuICAgICAgfSxcbiAgICAgIG91dHB1dE1hcHBpbmc6IHtcbiAgICAgICAgJ2RhdGEucmVjb21tZW5kYXRpb25zJzogJ3BvdGVudGlhbENvbm5lY3Rpb25zJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3dlbGxuZXNzLWdvYWwtc2V0dGluZycsXG4gICAgICBuYW1lOiAnSW5pdGlhbCBXZWxsbmVzcyBHb2FsIFNldHRpbmcnLFxuICAgICAgYWdlbnRJZDogJ3dlbGxuZXNzLWNvYWNoLWFnZW50JyxcbiAgICAgIGlucHV0TWFwcGluZzoge1xuICAgICAgICB1c2VySWQ6ICdpbnB1dC51c2VySWQnLFxuICAgICAgICBzZXNzaW9uVHlwZTogJ2dvYWxfc2V0dGluZycsXG4gICAgICAgIHVzZXJNZXNzYWdlOiAnaW5wdXQub25ib2FyZGluZ0dvYWxzJyxcbiAgICAgIH0sXG4gICAgICBvdXRwdXRNYXBwaW5nOiB7XG4gICAgICAgICdkYXRhJzogJ2luaXRpYWxHb2FscycsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjdWx0dXJhbC1wcmVmZXJlbmNlcycsXG4gICAgICBuYW1lOiAnQ3VsdHVyYWwgUHJlZmVyZW5jZSBTZXR1cCcsXG4gICAgICBhZ2VudElkOiAnY3VsdHVyYWwtdmFsaWRhdGlvbi1hZ2VudCcsXG4gICAgICBpbnB1dE1hcHBpbmc6IHtcbiAgICAgICAgY3VsdHVyYWxDb250ZXh0OiAnaW5wdXQudXNlclByb2ZpbGUuY3VsdHVyYWxDb250ZXh0JyxcbiAgICAgICAgcHJlZmVyZW5jZXM6ICdpbnB1dC51c2VyUHJvZmlsZS5wcmVmZXJlbmNlcycsXG4gICAgICB9LFxuICAgICAgb3V0cHV0TWFwcGluZzoge1xuICAgICAgICAnZGF0YSc6ICdjdWx0dXJhbFNldHRpbmdzJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcbiAgZXJyb3JIYW5kbGluZzoge1xuICAgIG9uRXJyb3I6ICdjb250aW51ZScsXG4gICAgbWF4RXhlY3V0aW9uVGltZTogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgfSxcbn07XG5cbi8vIEV4cG9ydCBhbGwgcHJlZGVmaW5lZCB3b3JrZmxvd3NcbmV4cG9ydCBjb25zdCBwcmVkZWZpbmVkV29ya2Zsb3dzOiBXb3JrZmxvd0RlZmluaXRpb25bXSA9IFtcbiAgY29udGVudFZhbGlkYXRpb25Xb3JrZmxvdyxcbiAgcGVyc29uYWxpemF0aW9uV29ya2Zsb3csXG4gIHdlbGxuZXNzQ2hlY2tJbldvcmtmbG93LFxuICBjb21tdW5pdHlPbmJvYXJkaW5nV29ya2Zsb3csXG5dOyJdfQ==