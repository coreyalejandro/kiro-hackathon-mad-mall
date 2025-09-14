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
