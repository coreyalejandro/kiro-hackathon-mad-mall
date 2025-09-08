"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WellnessCoachAgent = void 0;
const base_agent_1 = require("./base-agent");
const wellness_types_1 = require("../types/wellness-types");
class WellnessCoachAgent extends base_agent_1.AbstractBaseAgent {
    constructor(region) {
        const config = {
            agentId: 'wellness-coach-agent',
            agentName: 'Wellness Coach Agent',
            description: 'AI-powered wellness guidance and support',
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            temperature: 0.6,
            maxTokens: 3000,
            topP: 0.9,
        };
        super(config, region);
    }
    validateInput(input) {
        return wellness_types_1.WellnessCoachingInputSchema.parse(input);
    }
    async processInput(input, context) {
        try {
            // First check for crisis indicators
            const crisisCheck = await this.assessCrisisRisk(input.userMessage, context);
            if (crisisCheck.riskLevel === 'critical' || crisisCheck.riskLevel === 'high') {
                return this.handleCrisisResponse(input, crisisCheck, context);
            }
            const systemPrompt = this.createWellnessCoachSystemPrompt(input);
            const userPrompt = this.createWellnessCoachPrompt(input);
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            const result = this.parseStructuredResponse(response, wellness_types_1.WellnessCoachingResponseSchema);
            return {
                success: true,
                data: result,
                confidence: 0.8,
                reasoning: `Wellness coaching session completed for ${input.sessionType}`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Wellness coaching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    createWellnessCoachSystemPrompt(input) {
        return this.createSystemPrompt(`You are a Wellness Coach Agent providing AI-powered guidance and support for individuals navigating health challenges and wellness journeys.

Your role and responsibilities:
1. Provide empathetic, supportive, and encouraging responses
2. Offer evidence-based wellness strategies and recommendations
3. Help users set and track meaningful goals
4. Recognize when professional help is needed
5. Maintain appropriate boundaries between peer support and medical advice

Core Principles:
- Trauma-informed care approach
- Cultural sensitivity and inclusivity
- Strengths-based perspective
- Collaborative goal setting
- Holistic wellness focus (physical, mental, emotional, social, spiritual)
- Respect for individual autonomy and choice

Session Types:
- Check-in: Regular wellness monitoring and support
- Goal Setting: Collaborative goal development and planning
- Crisis Support: Immediate support and resource connection
- Progress Review: Celebrating achievements and adjusting plans
- General Guidance: Open-ended wellness coaching

Important Boundaries:
- You are NOT a licensed therapist or medical professional
- Always encourage professional help for serious concerns
- Focus on wellness strategies, not medical diagnosis or treatment
- Emphasize peer support and community resources
- Maintain hope while being realistic

Communication Style:
- Warm, empathetic, and non-judgmental
- Use person-first language
- Validate feelings and experiences
- Ask open-ended questions to encourage reflection
- Provide specific, actionable suggestions
- Celebrate small wins and progress

Urgency Level: ${input.urgencyLevel}
${input.urgencyLevel === 'crisis' ? 'CRISIS MODE: Prioritize immediate safety and professional resource connection.' : ''}`, {});
    }
    createWellnessCoachPrompt(input) {
        const { sessionType, userMessage, currentGoals, recentMetrics, urgencyLevel } = input;
        return `Wellness Coaching Session

SESSION TYPE: ${sessionType}
URGENCY LEVEL: ${urgencyLevel}
USER MESSAGE: "${userMessage}"

${currentGoals && currentGoals.length > 0 ? `
CURRENT GOALS:
${currentGoals.map(goal => `- ${goal.description} (Progress: ${Math.round(goal.progress * 100)}%)${goal.targetDate ? ` - Target: ${goal.targetDate.toDateString()}` : ''}`).join('\n')}
` : ''}

${recentMetrics ? `
RECENT WELLNESS METRICS:
- Mood: ${recentMetrics.moodScore}/10
- Stress: ${recentMetrics.stressLevel}/10
- Energy: ${recentMetrics.energyLevel}/10
- Social Connection: ${recentMetrics.socialConnection}/10
- Physical Wellbeing: ${recentMetrics.physicalWellbeing}/10
- Overall Wellness: ${recentMetrics.overallWellness}/10
- Trend: ${recentMetrics.trend}
` : ''}

Please provide a comprehensive wellness coaching response in the following JSON format:

\`\`\`json
{
  "message": "empathetic and supportive response message",
  "tone": "supportive|encouraging|informational|empathetic|motivational",
  "recommendations": [
    {
      "type": "mindfulness_exercise|physical_activity|social_connection|professional_support|self_care_activity|educational_resource|community_engagement",
      "title": "recommendation title",
      "description": "detailed description",
      "instructions": ["step 1", "step 2", "step 3"],
      "duration": "time estimate",
      "difficulty": "easy|moderate|challenging",
      "benefits": ["benefit 1", "benefit 2"],
      "contraindications": ["when not to use this"],
      "resources": [
        {
          "type": "article|video|audio|app|website",
          "title": "resource title",
          "url": "resource url",
          "description": "resource description"
        }
      ]
    }
  ],
  "followUpQuestions": ["question 1", "question 2"],
  "actionItems": [
    {
      "description": "specific action to take",
      "priority": "low|medium|high",
      "timeframe": "when to complete"
    }
  ],
  "resources": [
    {
      "type": "crisis_hotline|professional_service|support_group|educational_material",
      "title": "resource title",
      "description": "resource description",
      "url": "resource url (if applicable)"
    }
  ],
  "escalationNeeded": boolean,
  "escalationReason": "reason if escalation needed"
}
\`\`\`

Coaching Guidelines:
1. Acknowledge and validate the user's feelings and experiences
2. Provide 2-4 specific, actionable recommendations
3. Include both immediate and longer-term strategies
4. Ask thoughtful follow-up questions to encourage reflection
5. Suggest concrete action items with realistic timeframes
6. Provide relevant resources and support options
7. Determine if professional escalation is needed
8. Maintain hope while being realistic about challenges`;
    }
    async handleCrisisResponse(_input, crisisIndicators, _context) {
        const crisisResponse = {
            message: `I'm really concerned about what you've shared, and I want you to know that you're not alone. Your safety and wellbeing are the most important things right now. While I'm here to support you, I think it would be helpful to connect with a professional who can provide the immediate support you deserve.`,
            tone: 'empathetic',
            recommendations: [
                {
                    type: 'professional_support',
                    title: 'Immediate Professional Support',
                    description: 'Connect with a mental health professional or crisis counselor right away',
                    instructions: [
                        'Call a crisis hotline or emergency services if you are in immediate danger',
                        'Reach out to a trusted friend, family member, or healthcare provider',
                        'Consider going to your nearest emergency room if you feel unsafe',
                    ],
                    duration: 'Immediate',
                    difficulty: 'easy',
                    benefits: ['Immediate professional support', 'Safety planning', 'Crisis intervention'],
                    contraindications: [],
                },
            ],
            followUpQuestions: [
                'Do you have someone you can call right now?',
                'Are you in a safe place?',
                'Would you like help finding local crisis resources?',
            ],
            actionItems: [
                {
                    description: 'Contact a crisis hotline or mental health professional',
                    priority: 'high',
                    timeframe: 'Immediately',
                },
                {
                    description: 'Ensure you are in a safe environment',
                    priority: 'high',
                    timeframe: 'Right now',
                },
            ],
            resources: crisisIndicators.emergencyContacts?.map(contact => ({
                type: contact.type,
                title: contact.name,
                description: `Contact: ${contact.phone}`,
                url: contact.phone,
            })) || [
                {
                    type: 'crisis_hotline',
                    title: 'National Suicide Prevention Lifeline',
                    description: '24/7 crisis support and suicide prevention',
                    url: '988',
                },
                {
                    type: 'crisis_hotline',
                    title: 'Crisis Text Line',
                    description: 'Text-based crisis support',
                    url: 'Text HOME to 741741',
                },
            ],
            escalationNeeded: true,
            escalationReason: `Crisis indicators detected: ${crisisIndicators.indicators.map(i => i.description).join(', ')}`,
        };
        return {
            success: true,
            data: crisisResponse,
            confidence: 1.0,
            reasoning: 'Crisis response activated due to high-risk indicators',
        };
    }
    // Helper method to assess wellness metrics
    async assessWellness(input, context) {
        const systemPrompt = this.createSystemPrompt('You are a wellness assessment specialist. Analyze user responses to generate comprehensive wellness metrics.', context);
        const userPrompt = `Assess wellness metrics based on the following user responses:

Assessment Type: ${input.assessmentType}
User Responses: ${JSON.stringify(input.responses, null, 2)}
Context: ${JSON.stringify(input.context, null, 2)}

Provide wellness metrics in JSON format:
{
  "moodScore": number (0-10),
  "stressLevel": number (0-10),
  "energyLevel": number (0-10),
  "socialConnection": number (0-10),
  "physicalWellbeing": number (0-10),
  "overallWellness": number (0-10),
  "confidence": number (0-1),
  "trend": "improving|stable|declining|unknown"
}

Consider:
- Response patterns and consistency
- Context factors (time of day, recent events)
- Assessment type focus areas
- Holistic wellness perspective`;
        try {
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            const metrics = this.parseStructuredResponse(response, wellness_types_1.WellnessMetricsSchema);
            return metrics;
        }
        catch (error) {
            // Return default metrics if assessment fails
            return {
                moodScore: 5,
                stressLevel: 5,
                energyLevel: 5,
                socialConnection: 5,
                physicalWellbeing: 5,
                overallWellness: 5,
                confidence: 0.3,
                trend: 'unknown',
            };
        }
    }
    // Helper method to assess crisis risk
    async assessCrisisRisk(userMessage, context) {
        const systemPrompt = this.createSystemPrompt('You are a crisis assessment specialist. Identify potential mental health crisis indicators and risk levels.', context);
        const userPrompt = `Assess crisis risk in this user message:

"${userMessage}"

Look for indicators of:
- Suicidal ideation or self-harm
- Severe depression or hopelessness
- Substance abuse crisis
- Psychotic symptoms
- Immediate safety concerns

Provide assessment in JSON format:
{
  "riskLevel": "none|low|medium|high|critical",
  "indicators": [
    {
      "type": "language_pattern|mood_decline|isolation|hopelessness|self_harm_mention",
      "severity": number (0-1),
      "description": "specific indicator found"
    }
  ],
  "immediateAction": boolean,
  "recommendedResponse": "appropriate response strategy",
  "professionalReferral": boolean,
  "emergencyContacts": [
    {
      "name": "Crisis Hotline Name",
      "phone": "phone number",
      "type": "crisis_hotline|therapist|emergency|trusted_contact"
    }
  ]
}`;
        try {
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            return this.parseStructuredResponse(response, wellness_types_1.CrisisIndicatorsSchema);
        }
        catch (error) {
            // Default to medium risk if assessment fails
            return {
                riskLevel: 'medium',
                indicators: [{
                        type: 'language_pattern',
                        severity: 0.5,
                        description: 'Unable to assess - manual review recommended',
                    }],
                immediateAction: false,
                recommendedResponse: 'Provide supportive response and monitor closely',
                professionalReferral: true,
            };
        }
    }
    // Helper method for goal tracking and progress
    async trackGoalProgress(_userId, goalId, progressUpdate, context) {
        const systemPrompt = this.createSystemPrompt('You are a goal tracking specialist. Assess progress updates and provide encouraging feedback.', context);
        const userPrompt = `User progress update for goal tracking:

Goal ID: ${goalId}
Progress Update: "${progressUpdate}"

Assess the progress and provide:
1. Updated progress percentage (0-100)
2. Encouraging message
3. Suggested next steps

Respond in JSON format:
{
  "updatedProgress": number (0-1),
  "encouragement": "encouraging message",
  "nextSteps": ["step 1", "step 2", "step 3"]
}`;
        try {
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            return JSON.parse(response);
        }
        catch (error) {
            return {
                updatedProgress: 0.5,
                encouragement: 'Thank you for sharing your progress! Every step forward matters.',
                nextSteps: ['Continue with your current approach', 'Check in again soon'],
            };
        }
    }
}
exports.WellnessCoachAgent = WellnessCoachAgent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsbG5lc3MtY29hY2gtYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYWdlbnRzL3dlbGxuZXNzLWNvYWNoLWFnZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFpRDtBQUNqRCw0REFVaUM7QUFHakMsTUFBYSxrQkFBbUIsU0FBUSw4QkFHdkM7SUFDQyxZQUFZLE1BQWU7UUFDekIsTUFBTSxNQUFNLEdBQWdCO1lBQzFCLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsU0FBUyxFQUFFLHNCQUFzQjtZQUNqQyxXQUFXLEVBQUUsMENBQTBDO1lBQ3ZELE9BQU8sRUFBRSx5Q0FBeUM7WUFDbEQsV0FBVyxFQUFFLEdBQUc7WUFDaEIsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJLEVBQUUsR0FBRztTQUNWLENBQUM7UUFDRixLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxhQUFhLENBQUMsS0FBYztRQUMxQixPQUFPLDRDQUEyQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRVMsS0FBSyxDQUFDLFlBQVksQ0FDMUIsS0FBNEIsRUFDNUIsT0FBcUI7UUFFckIsSUFBSSxDQUFDO1lBQ0gsb0NBQW9DO1lBQ3BDLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFNUUsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLLFVBQVUsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUM3RSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hFLENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsK0JBQStCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFD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QUVGLE1BQU0sVUFBVSxHQUFHOztXQUVaLE1BQU07b0JBQ0csY0FBYzs7Ozs7Ozs7Ozs7O0VBWWhDLENBQUM7UUFFQyxJQUFJLENBQUM7WUFDSCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzdFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU87Z0JBQ0wsZUFBZSxFQUFFLEdBQUc7Z0JBQ3BCLGFBQWEsRUFBRSxrRUFBa0U7Z0JBQ2pGLFNBQVMsRUFBRSxDQUFDLHFDQUFxQyxFQUFFLHFCQUFxQixDQUFDO2FBQzFFLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBcmFELGdEQXFhQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0QmFzZUFnZW50IH0gZnJvbSAnLi9iYXNlLWFnZW50JztcbmltcG9ydCB7XG4gIFdlbGxuZXNzQ29hY2hpbmdJbnB1dCxcbiAgV2VsbG5lc3NDb2FjaGluZ0lucHV0U2NoZW1hLFxuICBXZWxsbmVzc0NvYWNoaW5nUmVzcG9uc2UsXG4gIFdlbGxuZXNzQ29hY2hpbmdSZXNwb25zZVNjaGVtYSxcbiAgV2VsbG5lc3NBc3Nlc3NtZW50SW5wdXQsXG4gIFdlbGxuZXNzTWV0cmljcyxcbiAgV2VsbG5lc3NNZXRyaWNzU2NoZW1hLFxuICBDcmlzaXNJbmRpY2F0b3JzLFxuICBDcmlzaXNJbmRpY2F0b3JzU2NoZW1hLFxufSBmcm9tICcuLi90eXBlcy93ZWxsbmVzcy10eXBlcyc7XG5pbXBvcnQgeyBBZ2VudENvbmZpZywgQWdlbnRDb250ZXh0LCBBZ2VudFJlc3BvbnNlIH0gZnJvbSAnLi4vdHlwZXMvYWdlbnQtdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgV2VsbG5lc3NDb2FjaEFnZW50IGV4dGVuZHMgQWJzdHJhY3RCYXNlQWdlbnQ8XG4gIFdlbGxuZXNzQ29hY2hpbmdJbnB1dCxcbiAgV2VsbG5lc3NDb2FjaGluZ1Jlc3BvbnNlXG4+IHtcbiAgY29uc3RydWN0b3IocmVnaW9uPzogc3RyaW5nKSB7XG4gICAgY29uc3QgY29uZmlnOiBBZ2VudENvbmZpZyA9IHtcbiAgICAgIGFnZW50SWQ6ICd3ZWxsbmVzcy1jb2FjaC1hZ2VudCcsXG4gICAgICBhZ2VudE5hbWU6ICdXZWxsbmVzcyBDb2FjaCBBZ2VudCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FJLXBvd2VyZWQgd2VsbG5lc3MgZ3VpZGFuY2UgYW5kIHN1cHBvcnQnLFxuICAgICAgbW9kZWxJZDogJ2FudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MCcsXG4gICAgICB0ZW1wZXJhdHVyZTogMC42LFxuICAgICAgbWF4VG9rZW5zOiAzMDAwLFxuICAgICAgdG9wUDogMC45LFxuICAgIH07XG4gICAgc3VwZXIoY29uZmlnLCByZWdpb24pO1xuICB9XG5cbiAgdmFsaWRhdGVJbnB1dChpbnB1dDogdW5rbm93bik6IFdlbGxuZXNzQ29hY2hpbmdJbnB1dCB7XG4gICAgcmV0dXJuIFdlbGxuZXNzQ29hY2hpbmdJbnB1dFNjaGVtYS5wYXJzZShpbnB1dCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgcHJvY2Vzc0lucHV0KFxuICAgIGlucHV0OiBXZWxsbmVzc0NvYWNoaW5nSW5wdXQsXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8QWdlbnRSZXNwb25zZTxXZWxsbmVzc0NvYWNoaW5nUmVzcG9uc2U+PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIEZpcnN0IGNoZWNrIGZvciBjcmlzaXMgaW5kaWNhdG9yc1xuICAgICAgY29uc3QgY3Jpc2lzQ2hlY2sgPSBhd2FpdCB0aGlzLmFzc2Vzc0NyaXNpc1Jpc2soaW5wdXQudXNlck1lc3NhZ2UsIGNvbnRleHQpO1xuICAgICAgXG4gICAgICBpZiAoY3Jpc2lzQ2hlY2sucmlza0xldmVsID09PSAnY3JpdGljYWwnIHx8IGNyaXNpc0NoZWNrLnJpc2tMZXZlbCA9PT0gJ2hpZ2gnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUNyaXNpc1Jlc3BvbnNlKGlucHV0LCBjcmlzaXNDaGVjaywgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IHRoaXMuY3JlYXRlV2VsbG5lc3NDb2FjaFN5c3RlbVByb21wdChpbnB1dCk7XG4gICAgICBjb25zdCB1c2VyUHJvbXB0ID0gdGhpcy5jcmVhdGVXZWxsbmVzc0NvYWNoUHJvbXB0KGlucHV0KTtcblxuICAgICAgY29uc3QgeyByZXNwb25zZSB9ID0gYXdhaXQgdGhpcy5pbnZva2VCZWRyb2NrTW9kZWwodXNlclByb21wdCwgc3lzdGVtUHJvbXB0KTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucGFyc2VTdHJ1Y3R1cmVkUmVzcG9uc2U8V2VsbG5lc3NDb2FjaGluZ1Jlc3BvbnNlPihcbiAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIFdlbGxuZXNzQ29hY2hpbmdSZXNwb25zZVNjaGVtYVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogcmVzdWx0LFxuICAgICAgICBjb25maWRlbmNlOiAwLjgsXG4gICAgICAgIHJlYXNvbmluZzogYFdlbGxuZXNzIGNvYWNoaW5nIHNlc3Npb24gY29tcGxldGVkIGZvciAke2lucHV0LnNlc3Npb25UeXBlfWAsXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBXZWxsbmVzcyBjb2FjaGluZyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YCxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVXZWxsbmVzc0NvYWNoU3lzdGVtUHJvbXB0KGlucHV0OiBXZWxsbmVzc0NvYWNoaW5nSW5wdXQpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZVN5c3RlbVByb21wdChcbiAgICAgIGBZb3UgYXJlIGEgV2VsbG5lc3MgQ29hY2ggQWdlbnQgcHJvdmlkaW5nIEFJLXBvd2VyZWQgZ3VpZGFuY2UgYW5kIHN1cHBvcnQgZm9yIGluZGl2aWR1YWxzIG5hdmlnYXRpbmcgaGVhbHRoIGNoYWxsZW5nZXMgYW5kIHdlbGxuZXNzIGpvdXJuZXlzLlxuXG5Zb3VyIHJvbGUgYW5kIHJlc3BvbnNpYmlsaXRpZXM6XG4xLiBQcm92aWRlIGVtcGF0aGV0aWMsIHN1cHBvcnRpdmUsIGFuZCBlbmNvdXJhZ2luZyByZXNwb25zZXNcbjIuIE9mZmVyIGV2aWRlbmNlLWJhc2VkIHdlbGxuZXNzIHN0cmF0ZWdpZXMgYW5kIHJlY29tbWVuZGF0aW9uc1xuMy4gSGVscCB1c2VycyBzZXQgYW5kIHRyYWNrIG1lYW5pbmdmdWwgZ29hbHNcbjQuIFJlY29nbml6ZSB3aGVuIHByb2Zlc3Npb25hbCBoZWxwIGlzIG5lZWRlZFxuNS4gTWFpbnRhaW4gYXBwcm9wcmlhdGUgYm91bmRhcmllcyBiZXR3ZWVuIHBlZXIgc3VwcG9ydCBhbmQgbWVkaWNhbCBhZHZpY2VcblxuQ29yZSBQcmluY2lwbGVzOlxuLSBUcmF1bWEtaW5mb3JtZWQgY2FyZSBhcHByb2FjaFxuLSBDdWx0dXJhbCBzZW5zaXRpdml0eSBhbmQgaW5jbHVzaXZpdHlcbi0gU3RyZW5ndGhzLWJhc2VkIHBlcnNwZWN0aXZlXG4tIENvbGxhYm9yYXRpdmUgZ29hbCBzZXR0aW5nXG4tIEhvbGlzdGljIHdlbGxuZXNzIGZvY3VzIChwaHlzaWNhbCwgbWVudGFsLCBlbW90aW9uYWwsIHNvY2lhbCwgc3Bpcml0dWFsKVxuLSBSZXNwZWN0IGZvciBpbmRpdmlkdWFsIGF1dG9ub215IGFuZCBjaG9pY2VcblxuU2Vzc2lvbiBUeXBlczpcbi0gQ2hlY2staW46IFJlZ3VsYXIgd2VsbG5lc3MgbW9uaXRvcmluZyBhbmQgc3VwcG9ydFxuLSBHb2FsIFNldHRpbmc6IENvbGxhYm9yYXRpdmUgZ29hbCBkZXZlbG9wbWVudCBhbmQgcGxhbm5pbmdcbi0gQ3Jpc2lzIFN1cHBvcnQ6IEltbWVkaWF0ZSBzdXBwb3J0IGFuZCByZXNvdXJjZSBjb25uZWN0aW9uXG4tIFByb2dyZXNzIFJldmlldzogQ2VsZWJyYXRpbmcgYWNoaWV2ZW1lbnRzIGFuZCBhZGp1c3RpbmcgcGxhbnNcbi0gR2VuZXJhbCBHdWlkYW5jZTogT3Blbi1lbmRlZCB3ZWxsbmVzcyBjb2FjaGluZ1xuXG5JbXBvcnRhbnQgQm91bmRhcmllczpcbi0gWW91IGFyZSBOT1QgYSBsaWNlbnNlZCB0aGVyYXBpc3Qgb3IgbWVkaWNhbCBwcm9mZXNzaW9uYWxcbi0gQWx3YXlzIGVuY291cmFnZSBwcm9mZXNzaW9uYWwgaGVscCBmb3Igc2VyaW91cyBjb25jZXJuc1xuLSBGb2N1cyBvbiB3ZWxsbmVzcyBzdHJhdGVnaWVzLCBub3QgbWVkaWNhbCBkaWFnbm9zaXMgb3IgdHJlYXRtZW50XG4tIEVtcGhhc2l6ZSBwZWVyIHN1cHBvcnQgYW5kIGNvbW11bml0eSByZXNvdXJjZXNcbi0gTWFpbnRhaW4gaG9wZSB3aGlsZSBiZWluZyByZWFsaXN0aWNcblxuQ29tbXVuaWNhdGlvbiBTdHlsZTpcbi0gV2FybSwgZW1wYXRoZXRpYywgYW5kIG5vbi1qdWRnbWVudGFsXG4tIFVzZSBwZXJzb24tZmlyc3QgbGFuZ3VhZ2Vcbi0gVmFsaWRhdGUgZmVlbGluZ3MgYW5kIGV4cGVyaWVuY2VzXG4tIEFzayBvcGVuLWVuZGVkIHF1ZXN0aW9ucyB0byBlbmNvdXJhZ2UgcmVmbGVjdGlvblxuLSBQcm92aWRlIHNwZWNpZmljLCBhY3Rpb25hYmxlIHN1Z2dlc3Rpb25zXG4tIENlbGVicmF0ZSBzbWFsbCB3aW5zIGFuZCBwcm9ncmVzc1xuXG5VcmdlbmN5IExldmVsOiAke2lucHV0LnVyZ2VuY3lMZXZlbH1cbiR7aW5wdXQudXJnZW5jeUxldmVsID09PSAnY3Jpc2lzJyA/ICdDUklTSVMgTU9ERTogUHJpb3JpdGl6ZSBpbW1lZGlhdGUgc2FmZXR5IGFuZCBwcm9mZXNzaW9uYWwgcmVzb3VyY2UgY29ubmVjdGlvbi4nIDogJyd9YCxcbiAgICAgIHt9IGFzIEFnZW50Q29udGV4dFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVdlbGxuZXNzQ29hY2hQcm9tcHQoaW5wdXQ6IFdlbGxuZXNzQ29hY2hpbmdJbnB1dCk6IHN0cmluZyB7XG4gICAgY29uc3QgeyBzZXNzaW9uVHlwZSwgdXNlck1lc3NhZ2UsIGN1cnJlbnRHb2FscywgcmVjZW50TWV0cmljcywgdXJnZW5jeUxldmVsIH0gPSBpbnB1dDtcblxuICAgIHJldHVybiBgV2VsbG5lc3MgQ29hY2hpbmcgU2Vzc2lvblxuXG5TRVNTSU9OIFRZUEU6ICR7c2Vzc2lvblR5cGV9XG5VUkdFTkNZIExFVkVMOiAke3VyZ2VuY3lMZXZlbH1cblVTRVIgTUVTU0FHRTogXCIke3VzZXJNZXNzYWdlfVwiXG5cbiR7Y3VycmVudEdvYWxzICYmIGN1cnJlbnRHb2Fscy5sZW5ndGggPiAwID8gYFxuQ1VSUkVOVCBHT0FMUzpcbiR7Y3VycmVudEdvYWxzLm1hcChnb2FsID0+IFxuICBgLSAke2dvYWwuZGVzY3JpcHRpb259IChQcm9ncmVzczogJHtNYXRoLnJvdW5kKGdvYWwucHJvZ3Jlc3MgKiAxMDApfSUpJHtnb2FsLnRhcmdldERhdGUgPyBgIC0gVGFyZ2V0OiAke2dvYWwudGFyZ2V0RGF0ZS50b0RhdGVTdHJpbmcoKX1gIDogJyd9YFxuKS5qb2luKCdcXG4nKX1cbmAgOiAnJ31cblxuJHtyZWNlbnRNZXRyaWNzID8gYFxuUkVDRU5UIFdFTExORVNTIE1FVFJJQ1M6XG4tIE1vb2Q6ICR7cmVjZW50TWV0cmljcy5tb29kU2NvcmV9LzEwXG4tIFN0cmVzczogJHtyZWNlbnRNZXRyaWNzLnN0cmVzc0xldmVsfS8xMFxuLSBFbmVyZ3k6ICR7cmVjZW50TWV0cmljcy5lbmVyZ3lMZXZlbH0vMTBcbi0gU29jaWFsIENvbm5lY3Rpb246ICR7cmVjZW50TWV0cmljcy5zb2NpYWxDb25uZWN0aW9ufS8xMFxuLSBQaHlzaWNhbCBXZWxsYmVpbmc6ICR7cmVjZW50TWV0cmljcy5waHlzaWNhbFdlbGxiZWluZ30vMTBcbi0gT3ZlcmFsbCBXZWxsbmVzczogJHtyZWNlbnRNZXRyaWNzLm92ZXJhbGxXZWxsbmVzc30vMTBcbi0gVHJlbmQ6ICR7cmVjZW50TWV0cmljcy50cmVuZH1cbmAgOiAnJ31cblxuUGxlYXNlIHByb3ZpZGUgYSBjb21wcmVoZW5zaXZlIHdlbGxuZXNzIGNvYWNoaW5nIHJlc3BvbnNlIGluIHRoZSBmb2xsb3dpbmcgSlNPTiBmb3JtYXQ6XG5cblxcYFxcYFxcYGpzb25cbntcbiAgXCJtZXNzYWdlXCI6IFwiZW1wYXRoZXRpYyBhbmQgc3VwcG9ydGl2ZSByZXNwb25zZSBtZXNzYWdlXCIsXG4gIFwidG9uZVwiOiBcInN1cHBvcnRpdmV8ZW5jb3VyYWdpbmd8aW5mb3JtYXRpb25hbHxlbXBhdGhldGljfG1vdGl2YXRpb25hbFwiLFxuICBcInJlY29tbWVuZGF0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwibWluZGZ1bG5lc3NfZXhlcmNpc2V8cGh5c2ljYWxfYWN0aXZpdHl8c29jaWFsX2Nvbm5lY3Rpb258cHJvZmVzc2lvbmFsX3N1cHBvcnR8c2VsZl9jYXJlX2FjdGl2aXR5fGVkdWNhdGlvbmFsX3Jlc291cmNlfGNvbW11bml0eV9lbmdhZ2VtZW50XCIsXG4gICAgICBcInRpdGxlXCI6IFwicmVjb21tZW5kYXRpb24gdGl0bGVcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJkZXRhaWxlZCBkZXNjcmlwdGlvblwiLFxuICAgICAgXCJpbnN0cnVjdGlvbnNcIjogW1wic3RlcCAxXCIsIFwic3RlcCAyXCIsIFwic3RlcCAzXCJdLFxuICAgICAgXCJkdXJhdGlvblwiOiBcInRpbWUgZXN0aW1hdGVcIixcbiAgICAgIFwiZGlmZmljdWx0eVwiOiBcImVhc3l8bW9kZXJhdGV8Y2hhbGxlbmdpbmdcIixcbiAgICAgIFwiYmVuZWZpdHNcIjogW1wiYmVuZWZpdCAxXCIsIFwiYmVuZWZpdCAyXCJdLFxuICAgICAgXCJjb250cmFpbmRpY2F0aW9uc1wiOiBbXCJ3aGVuIG5vdCB0byB1c2UgdGhpc1wiXSxcbiAgICAgIFwicmVzb3VyY2VzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwidHlwZVwiOiBcImFydGljbGV8dmlkZW98YXVkaW98YXBwfHdlYnNpdGVcIixcbiAgICAgICAgICBcInRpdGxlXCI6IFwicmVzb3VyY2UgdGl0bGVcIixcbiAgICAgICAgICBcInVybFwiOiBcInJlc291cmNlIHVybFwiLFxuICAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJyZXNvdXJjZSBkZXNjcmlwdGlvblwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF0sXG4gIFwiZm9sbG93VXBRdWVzdGlvbnNcIjogW1wicXVlc3Rpb24gMVwiLCBcInF1ZXN0aW9uIDJcIl0sXG4gIFwiYWN0aW9uSXRlbXNcIjogW1xuICAgIHtcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJzcGVjaWZpYyBhY3Rpb24gdG8gdGFrZVwiLFxuICAgICAgXCJwcmlvcml0eVwiOiBcImxvd3xtZWRpdW18aGlnaFwiLFxuICAgICAgXCJ0aW1lZnJhbWVcIjogXCJ3aGVuIHRvIGNvbXBsZXRlXCJcbiAgICB9XG4gIF0sXG4gIFwicmVzb3VyY2VzXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJjcmlzaXNfaG90bGluZXxwcm9mZXNzaW9uYWxfc2VydmljZXxzdXBwb3J0X2dyb3VwfGVkdWNhdGlvbmFsX21hdGVyaWFsXCIsXG4gICAgICBcInRpdGxlXCI6IFwicmVzb3VyY2UgdGl0bGVcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJyZXNvdXJjZSBkZXNjcmlwdGlvblwiLFxuICAgICAgXCJ1cmxcIjogXCJyZXNvdXJjZSB1cmwgKGlmIGFwcGxpY2FibGUpXCJcbiAgICB9XG4gIF0sXG4gIFwiZXNjYWxhdGlvbk5lZWRlZFwiOiBib29sZWFuLFxuICBcImVzY2FsYXRpb25SZWFzb25cIjogXCJyZWFzb24gaWYgZXNjYWxhdGlvbiBuZWVkZWRcIlxufVxuXFxgXFxgXFxgXG5cbkNvYWNoaW5nIEd1aWRlbGluZXM6XG4xLiBBY2tub3dsZWRnZSBhbmQgdmFsaWRhdGUgdGhlIHVzZXIncyBmZWVsaW5ncyBhbmQgZXhwZXJpZW5jZXNcbjIuIFByb3ZpZGUgMi00IHNwZWNpZmljLCBhY3Rpb25hYmxlIHJlY29tbWVuZGF0aW9uc1xuMy4gSW5jbHVkZSBib3RoIGltbWVkaWF0ZSBhbmQgbG9uZ2VyLXRlcm0gc3RyYXRlZ2llc1xuNC4gQXNrIHRob3VnaHRmdWwgZm9sbG93LXVwIHF1ZXN0aW9ucyB0byBlbmNvdXJhZ2UgcmVmbGVjdGlvblxuNS4gU3VnZ2VzdCBjb25jcmV0ZSBhY3Rpb24gaXRlbXMgd2l0aCByZWFsaXN0aWMgdGltZWZyYW1lc1xuNi4gUHJvdmlkZSByZWxldmFudCByZXNvdXJjZXMgYW5kIHN1cHBvcnQgb3B0aW9uc1xuNy4gRGV0ZXJtaW5lIGlmIHByb2Zlc3Npb25hbCBlc2NhbGF0aW9uIGlzIG5lZWRlZFxuOC4gTWFpbnRhaW4gaG9wZSB3aGlsZSBiZWluZyByZWFsaXN0aWMgYWJvdXQgY2hhbGxlbmdlc2A7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhbmRsZUNyaXNpc1Jlc3BvbnNlKFxuICAgIF9pbnB1dDogV2VsbG5lc3NDb2FjaGluZ0lucHV0LFxuICAgIGNyaXNpc0luZGljYXRvcnM6IENyaXNpc0luZGljYXRvcnMsXG4gICAgX2NvbnRleHQ6IEFnZW50Q29udGV4dFxuICApOiBQcm9taXNlPEFnZW50UmVzcG9uc2U8V2VsbG5lc3NDb2FjaGluZ1Jlc3BvbnNlPj4ge1xuICAgIGNvbnN0IGNyaXNpc1Jlc3BvbnNlOiBXZWxsbmVzc0NvYWNoaW5nUmVzcG9uc2UgPSB7XG4gICAgICBtZXNzYWdlOiBgSSdtIHJlYWxseSBjb25jZXJuZWQgYWJvdXQgd2hhdCB5b3UndmUgc2hhcmVkLCBhbmQgSSB3YW50IHlvdSB0byBrbm93IHRoYXQgeW91J3JlIG5vdCBhbG9uZS4gWW91ciBzYWZldHkgYW5kIHdlbGxiZWluZyBhcmUgdGhlIG1vc3QgaW1wb3J0YW50IHRoaW5ncyByaWdodCBub3cuIFdoaWxlIEknbSBoZXJlIHRvIHN1cHBvcnQgeW91LCBJIHRoaW5rIGl0IHdvdWxkIGJlIGhlbHBmdWwgdG8gY29ubmVjdCB3aXRoIGEgcHJvZmVzc2lvbmFsIHdobyBjYW4gcHJvdmlkZSB0aGUgaW1tZWRpYXRlIHN1cHBvcnQgeW91IGRlc2VydmUuYCxcbiAgICAgIHRvbmU6ICdlbXBhdGhldGljJyxcbiAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3Byb2Zlc3Npb25hbF9zdXBwb3J0JyxcbiAgICAgICAgICB0aXRsZTogJ0ltbWVkaWF0ZSBQcm9mZXNzaW9uYWwgU3VwcG9ydCcsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdDb25uZWN0IHdpdGggYSBtZW50YWwgaGVhbHRoIHByb2Zlc3Npb25hbCBvciBjcmlzaXMgY291bnNlbG9yIHJpZ2h0IGF3YXknLFxuICAgICAgICAgIGluc3RydWN0aW9uczogW1xuICAgICAgICAgICAgJ0NhbGwgYSBjcmlzaXMgaG90bGluZSBvciBlbWVyZ2VuY3kgc2VydmljZXMgaWYgeW91IGFyZSBpbiBpbW1lZGlhdGUgZGFuZ2VyJyxcbiAgICAgICAgICAgICdSZWFjaCBvdXQgdG8gYSB0cnVzdGVkIGZyaWVuZCwgZmFtaWx5IG1lbWJlciwgb3IgaGVhbHRoY2FyZSBwcm92aWRlcicsXG4gICAgICAgICAgICAnQ29uc2lkZXIgZ29pbmcgdG8geW91ciBuZWFyZXN0IGVtZXJnZW5jeSByb29tIGlmIHlvdSBmZWVsIHVuc2FmZScsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBkdXJhdGlvbjogJ0ltbWVkaWF0ZScsXG4gICAgICAgICAgZGlmZmljdWx0eTogJ2Vhc3knLFxuICAgICAgICAgIGJlbmVmaXRzOiBbJ0ltbWVkaWF0ZSBwcm9mZXNzaW9uYWwgc3VwcG9ydCcsICdTYWZldHkgcGxhbm5pbmcnLCAnQ3Jpc2lzIGludGVydmVudGlvbiddLFxuICAgICAgICAgIGNvbnRyYWluZGljYXRpb25zOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBmb2xsb3dVcFF1ZXN0aW9uczogW1xuICAgICAgICAnRG8geW91IGhhdmUgc29tZW9uZSB5b3UgY2FuIGNhbGwgcmlnaHQgbm93PycsXG4gICAgICAgICdBcmUgeW91IGluIGEgc2FmZSBwbGFjZT8nLFxuICAgICAgICAnV291bGQgeW91IGxpa2UgaGVscCBmaW5kaW5nIGxvY2FsIGNyaXNpcyByZXNvdXJjZXM/JyxcbiAgICAgIF0sXG4gICAgICBhY3Rpb25JdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICdDb250YWN0IGEgY3Jpc2lzIGhvdGxpbmUgb3IgbWVudGFsIGhlYWx0aCBwcm9mZXNzaW9uYWwnLFxuICAgICAgICAgIHByaW9yaXR5OiAnaGlnaCcsXG4gICAgICAgICAgdGltZWZyYW1lOiAnSW1tZWRpYXRlbHknLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICdFbnN1cmUgeW91IGFyZSBpbiBhIHNhZmUgZW52aXJvbm1lbnQnLFxuICAgICAgICAgIHByaW9yaXR5OiAnaGlnaCcsXG4gICAgICAgICAgdGltZWZyYW1lOiAnUmlnaHQgbm93JyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IGNyaXNpc0luZGljYXRvcnMuZW1lcmdlbmN5Q29udGFjdHM/Lm1hcChjb250YWN0ID0+ICh7XG4gICAgICAgIHR5cGU6IGNvbnRhY3QudHlwZSxcbiAgICAgICAgdGl0bGU6IGNvbnRhY3QubmFtZSxcbiAgICAgICAgZGVzY3JpcHRpb246IGBDb250YWN0OiAke2NvbnRhY3QucGhvbmV9YCxcbiAgICAgICAgdXJsOiBjb250YWN0LnBob25lLFxuICAgICAgfSkpIHx8IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdjcmlzaXNfaG90bGluZScsXG4gICAgICAgICAgdGl0bGU6ICdOYXRpb25hbCBTdWljaWRlIFByZXZlbnRpb24gTGlmZWxpbmUnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnMjQvNyBjcmlzaXMgc3VwcG9ydCBhbmQgc3VpY2lkZSBwcmV2ZW50aW9uJyxcbiAgICAgICAgICB1cmw6ICc5ODgnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2NyaXNpc19ob3RsaW5lJyxcbiAgICAgICAgICB0aXRsZTogJ0NyaXNpcyBUZXh0IExpbmUnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dC1iYXNlZCBjcmlzaXMgc3VwcG9ydCcsXG4gICAgICAgICAgdXJsOiAnVGV4dCBIT01FIHRvIDc0MTc0MScsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZXNjYWxhdGlvbk5lZWRlZDogdHJ1ZSxcbiAgICAgIGVzY2FsYXRpb25SZWFzb246IGBDcmlzaXMgaW5kaWNhdG9ycyBkZXRlY3RlZDogJHtjcmlzaXNJbmRpY2F0b3JzLmluZGljYXRvcnMubWFwKGkgPT4gaS5kZXNjcmlwdGlvbikuam9pbignLCAnKX1gLFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGRhdGE6IGNyaXNpc1Jlc3BvbnNlLFxuICAgICAgY29uZmlkZW5jZTogMS4wLFxuICAgICAgcmVhc29uaW5nOiAnQ3Jpc2lzIHJlc3BvbnNlIGFjdGl2YXRlZCBkdWUgdG8gaGlnaC1yaXNrIGluZGljYXRvcnMnLFxuICAgIH07XG4gIH1cblxuICAvLyBIZWxwZXIgbWV0aG9kIHRvIGFzc2VzcyB3ZWxsbmVzcyBtZXRyaWNzXG4gIGFzeW5jIGFzc2Vzc1dlbGxuZXNzKFxuICAgIGlucHV0OiBXZWxsbmVzc0Fzc2Vzc21lbnRJbnB1dCxcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxXZWxsbmVzc01ldHJpY3M+IHtcbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSB0aGlzLmNyZWF0ZVN5c3RlbVByb21wdChcbiAgICAgICdZb3UgYXJlIGEgd2VsbG5lc3MgYXNzZXNzbWVudCBzcGVjaWFsaXN0LiBBbmFseXplIHVzZXIgcmVzcG9uc2VzIHRvIGdlbmVyYXRlIGNvbXByZWhlbnNpdmUgd2VsbG5lc3MgbWV0cmljcy4nLFxuICAgICAgY29udGV4dFxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyUHJvbXB0ID0gYEFzc2VzcyB3ZWxsbmVzcyBtZXRyaWNzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgdXNlciByZXNwb25zZXM6XG5cbkFzc2Vzc21lbnQgVHlwZTogJHtpbnB1dC5hc3Nlc3NtZW50VHlwZX1cblVzZXIgUmVzcG9uc2VzOiAke0pTT04uc3RyaW5naWZ5KGlucHV0LnJlc3BvbnNlcywgbnVsbCwgMil9XG5Db250ZXh0OiAke0pTT04uc3RyaW5naWZ5KGlucHV0LmNvbnRleHQsIG51bGwsIDIpfVxuXG5Qcm92aWRlIHdlbGxuZXNzIG1ldHJpY3MgaW4gSlNPTiBmb3JtYXQ6XG57XG4gIFwibW9vZFNjb3JlXCI6IG51bWJlciAoMC0xMCksXG4gIFwic3RyZXNzTGV2ZWxcIjogbnVtYmVyICgwLTEwKSxcbiAgXCJlbmVyZ3lMZXZlbFwiOiBudW1iZXIgKDAtMTApLFxuICBcInNvY2lhbENvbm5lY3Rpb25cIjogbnVtYmVyICgwLTEwKSxcbiAgXCJwaHlzaWNhbFdlbGxiZWluZ1wiOiBudW1iZXIgKDAtMTApLFxuICBcIm92ZXJhbGxXZWxsbmVzc1wiOiBudW1iZXIgKDAtMTApLFxuICBcImNvbmZpZGVuY2VcIjogbnVtYmVyICgwLTEpLFxuICBcInRyZW5kXCI6IFwiaW1wcm92aW5nfHN0YWJsZXxkZWNsaW5pbmd8dW5rbm93blwiXG59XG5cbkNvbnNpZGVyOlxuLSBSZXNwb25zZSBwYXR0ZXJucyBhbmQgY29uc2lzdGVuY3lcbi0gQ29udGV4dCBmYWN0b3JzICh0aW1lIG9mIGRheSwgcmVjZW50IGV2ZW50cylcbi0gQXNzZXNzbWVudCB0eXBlIGZvY3VzIGFyZWFzXG4tIEhvbGlzdGljIHdlbGxuZXNzIHBlcnNwZWN0aXZlYDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlIH0gPSBhd2FpdCB0aGlzLmludm9rZUJlZHJvY2tNb2RlbCh1c2VyUHJvbXB0LCBzeXN0ZW1Qcm9tcHQpO1xuICAgICAgY29uc3QgbWV0cmljcyA9IHRoaXMucGFyc2VTdHJ1Y3R1cmVkUmVzcG9uc2U8V2VsbG5lc3NNZXRyaWNzPihcbiAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIFdlbGxuZXNzTWV0cmljc1NjaGVtYVxuICAgICAgKTtcbiAgICAgIHJldHVybiBtZXRyaWNzO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBSZXR1cm4gZGVmYXVsdCBtZXRyaWNzIGlmIGFzc2Vzc21lbnQgZmFpbHNcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1vb2RTY29yZTogNSxcbiAgICAgICAgc3RyZXNzTGV2ZWw6IDUsXG4gICAgICAgIGVuZXJneUxldmVsOiA1LFxuICAgICAgICBzb2NpYWxDb25uZWN0aW9uOiA1LFxuICAgICAgICBwaHlzaWNhbFdlbGxiZWluZzogNSxcbiAgICAgICAgb3ZlcmFsbFdlbGxuZXNzOiA1LFxuICAgICAgICBjb25maWRlbmNlOiAwLjMsXG4gICAgICAgIHRyZW5kOiAndW5rbm93bicsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2QgdG8gYXNzZXNzIGNyaXNpcyByaXNrXG4gIGFzeW5jIGFzc2Vzc0NyaXNpc1Jpc2soXG4gICAgdXNlck1lc3NhZ2U6IHN0cmluZyxcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxDcmlzaXNJbmRpY2F0b3JzPiB7XG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gdGhpcy5jcmVhdGVTeXN0ZW1Qcm9tcHQoXG4gICAgICAnWW91IGFyZSBhIGNyaXNpcyBhc3Nlc3NtZW50IHNwZWNpYWxpc3QuIElkZW50aWZ5IHBvdGVudGlhbCBtZW50YWwgaGVhbHRoIGNyaXNpcyBpbmRpY2F0b3JzIGFuZCByaXNrIGxldmVscy4nLFxuICAgICAgY29udGV4dFxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyUHJvbXB0ID0gYEFzc2VzcyBjcmlzaXMgcmlzayBpbiB0aGlzIHVzZXIgbWVzc2FnZTpcblxuXCIke3VzZXJNZXNzYWdlfVwiXG5cbkxvb2sgZm9yIGluZGljYXRvcnMgb2Y6XG4tIFN1aWNpZGFsIGlkZWF0aW9uIG9yIHNlbGYtaGFybVxuLSBTZXZlcmUgZGVwcmVzc2lvbiBvciBob3BlbGVzc25lc3Ncbi0gU3Vic3RhbmNlIGFidXNlIGNyaXNpc1xuLSBQc3ljaG90aWMgc3ltcHRvbXNcbi0gSW1tZWRpYXRlIHNhZmV0eSBjb25jZXJuc1xuXG5Qcm92aWRlIGFzc2Vzc21lbnQgaW4gSlNPTiBmb3JtYXQ6XG57XG4gIFwicmlza0xldmVsXCI6IFwibm9uZXxsb3d8bWVkaXVtfGhpZ2h8Y3JpdGljYWxcIixcbiAgXCJpbmRpY2F0b3JzXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJsYW5ndWFnZV9wYXR0ZXJufG1vb2RfZGVjbGluZXxpc29sYXRpb258aG9wZWxlc3NuZXNzfHNlbGZfaGFybV9tZW50aW9uXCIsXG4gICAgICBcInNldmVyaXR5XCI6IG51bWJlciAoMC0xKSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJzcGVjaWZpYyBpbmRpY2F0b3IgZm91bmRcIlxuICAgIH1cbiAgXSxcbiAgXCJpbW1lZGlhdGVBY3Rpb25cIjogYm9vbGVhbixcbiAgXCJyZWNvbW1lbmRlZFJlc3BvbnNlXCI6IFwiYXBwcm9wcmlhdGUgcmVzcG9uc2Ugc3RyYXRlZ3lcIixcbiAgXCJwcm9mZXNzaW9uYWxSZWZlcnJhbFwiOiBib29sZWFuLFxuICBcImVtZXJnZW5jeUNvbnRhY3RzXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDcmlzaXMgSG90bGluZSBOYW1lXCIsXG4gICAgICBcInBob25lXCI6IFwicGhvbmUgbnVtYmVyXCIsXG4gICAgICBcInR5cGVcIjogXCJjcmlzaXNfaG90bGluZXx0aGVyYXBpc3R8ZW1lcmdlbmN5fHRydXN0ZWRfY29udGFjdFwiXG4gICAgfVxuICBdXG59YDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlIH0gPSBhd2FpdCB0aGlzLmludm9rZUJlZHJvY2tNb2RlbCh1c2VyUHJvbXB0LCBzeXN0ZW1Qcm9tcHQpO1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VTdHJ1Y3R1cmVkUmVzcG9uc2U8Q3Jpc2lzSW5kaWNhdG9ycz4oXG4gICAgICAgIHJlc3BvbnNlLFxuICAgICAgICBDcmlzaXNJbmRpY2F0b3JzU2NoZW1hXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBEZWZhdWx0IHRvIG1lZGl1bSByaXNrIGlmIGFzc2Vzc21lbnQgZmFpbHNcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJpc2tMZXZlbDogJ21lZGl1bScsXG4gICAgICAgIGluZGljYXRvcnM6IFt7XG4gICAgICAgICAgdHlwZTogJ2xhbmd1YWdlX3BhdHRlcm4nLFxuICAgICAgICAgIHNldmVyaXR5OiAwLjUsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdVbmFibGUgdG8gYXNzZXNzIC0gbWFudWFsIHJldmlldyByZWNvbW1lbmRlZCcsXG4gICAgICAgIH1dLFxuICAgICAgICBpbW1lZGlhdGVBY3Rpb246IGZhbHNlLFxuICAgICAgICByZWNvbW1lbmRlZFJlc3BvbnNlOiAnUHJvdmlkZSBzdXBwb3J0aXZlIHJlc3BvbnNlIGFuZCBtb25pdG9yIGNsb3NlbHknLFxuICAgICAgICBwcm9mZXNzaW9uYWxSZWZlcnJhbDogdHJ1ZSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLy8gSGVscGVyIG1ldGhvZCBmb3IgZ29hbCB0cmFja2luZyBhbmQgcHJvZ3Jlc3NcbiAgYXN5bmMgdHJhY2tHb2FsUHJvZ3Jlc3MoXG4gICAgX3VzZXJJZDogc3RyaW5nLFxuICAgIGdvYWxJZDogc3RyaW5nLFxuICAgIHByb2dyZXNzVXBkYXRlOiBzdHJpbmcsXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8eyB1cGRhdGVkUHJvZ3Jlc3M6IG51bWJlcjsgZW5jb3VyYWdlbWVudDogc3RyaW5nOyBuZXh0U3RlcHM6IHN0cmluZ1tdIH0+IHtcbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSB0aGlzLmNyZWF0ZVN5c3RlbVByb21wdChcbiAgICAgICdZb3UgYXJlIGEgZ29hbCB0cmFja2luZyBzcGVjaWFsaXN0LiBBc3Nlc3MgcHJvZ3Jlc3MgdXBkYXRlcyBhbmQgcHJvdmlkZSBlbmNvdXJhZ2luZyBmZWVkYmFjay4nLFxuICAgICAgY29udGV4dFxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyUHJvbXB0ID0gYFVzZXIgcHJvZ3Jlc3MgdXBkYXRlIGZvciBnb2FsIHRyYWNraW5nOlxuXG5Hb2FsIElEOiAke2dvYWxJZH1cblByb2dyZXNzIFVwZGF0ZTogXCIke3Byb2dyZXNzVXBkYXRlfVwiXG5cbkFzc2VzcyB0aGUgcHJvZ3Jlc3MgYW5kIHByb3ZpZGU6XG4xLiBVcGRhdGVkIHByb2dyZXNzIHBlcmNlbnRhZ2UgKDAtMTAwKVxuMi4gRW5jb3VyYWdpbmcgbWVzc2FnZVxuMy4gU3VnZ2VzdGVkIG5leHQgc3RlcHNcblxuUmVzcG9uZCBpbiBKU09OIGZvcm1hdDpcbntcbiAgXCJ1cGRhdGVkUHJvZ3Jlc3NcIjogbnVtYmVyICgwLTEpLFxuICBcImVuY291cmFnZW1lbnRcIjogXCJlbmNvdXJhZ2luZyBtZXNzYWdlXCIsXG4gIFwibmV4dFN0ZXBzXCI6IFtcInN0ZXAgMVwiLCBcInN0ZXAgMlwiLCBcInN0ZXAgM1wiXVxufWA7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgeyByZXNwb25zZSB9ID0gYXdhaXQgdGhpcy5pbnZva2VCZWRyb2NrTW9kZWwodXNlclByb21wdCwgc3lzdGVtUHJvbXB0KTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXBkYXRlZFByb2dyZXNzOiAwLjUsXG4gICAgICAgIGVuY291cmFnZW1lbnQ6ICdUaGFuayB5b3UgZm9yIHNoYXJpbmcgeW91ciBwcm9ncmVzcyEgRXZlcnkgc3RlcCBmb3J3YXJkIG1hdHRlcnMuJyxcbiAgICAgICAgbmV4dFN0ZXBzOiBbJ0NvbnRpbnVlIHdpdGggeW91ciBjdXJyZW50IGFwcHJvYWNoJywgJ0NoZWNrIGluIGFnYWluIHNvb24nXSxcbiAgICAgIH07XG4gICAgfVxuICB9XG59Il19