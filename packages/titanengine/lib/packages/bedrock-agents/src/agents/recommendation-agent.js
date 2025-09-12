"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationAgent = void 0;
const base_agent_1 = require("./base-agent");
const recommendation_types_1 = require("../types/recommendation-types");
class RecommendationAgent extends base_agent_1.AbstractBaseAgent {
    constructor(region) {
        const config = {
            agentId: 'recommendation-agent',
            agentName: 'Recommendation Agent',
            description: 'Personalized content and connection recommendations',
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            temperature: 0.4,
            maxTokens: 2500,
            topP: 0.9,
        };
        super(config, region);
    }
    validateInput(input) {
        return recommendation_types_1.RecommendationRequestSchema.parse(input);
    }
    async processInput(input, _context) {
        try {
            const systemPrompt = this.createRecommendationSystemPrompt();
            const userPrompt = this.createRecommendationPrompt(input);
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            const result = this.parseStructuredResponse(response, recommendation_types_1.RecommendationResultSchema);
            return {
                success: true,
                data: result,
                confidence: result.personalizationScore,
                reasoning: `Generated ${result.recommendations.length} recommendations using ${result.algorithmUsed}`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Recommendation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    createRecommendationSystemPrompt() {
        const basePrompt = `You are a Recommendation Agent specialized in providing personalized content and connection suggestions for healthcare and wellness communities.

Your responsibilities:
1. Analyze user profiles and behavior patterns
2. Generate relevant, personalized recommendations
3. Consider cultural context and individual needs
4. Promote positive community engagement
5. Ensure recommendations are appropriate and helpful

Recommendation Types:
- Circles: Support groups and communities
- Content: Articles, resources, discussions
- Connections: Peer matches and mentorship
- Resources: Tools, apps, professional services
- Activities: Wellness practices and events

Personalization Factors:
- Diagnosis stage and health journey
- Cultural background and preferences
- Communication style and personality
- Support needs and goals
- Activity history and engagement patterns
- Time of day and context

Quality Guidelines:
- Prioritize user safety and well-being
- Ensure cultural sensitivity and inclusivity
- Avoid overwhelming users with too many options
- Balance familiarity with discovery
- Consider user's current emotional state
- Respect privacy and consent preferences

Always explain your reasoning and provide diverse, high-quality recommendations.

Please provide responses that are:
1. Culturally sensitive and inclusive
2. Appropriate for a wellness and support community
3. Evidence-based when providing health-related information
4. Empathetic and supportive in tone
5. Respectful of privacy and confidentiality`;
        return basePrompt;
    }
    createRecommendationPrompt(input) {
        const { userId, recommendationType, context, filters } = input;
        return `Generate personalized recommendations for the following request:

USER ID: ${userId}
RECOMMENDATION TYPE: ${recommendationType}

CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'No additional context provided'}

FILTERS:
${filters ? JSON.stringify(filters, null, 2) : 'No filters applied'}

Please provide recommendations in the following JSON format:

\`\`\`json
{
  "recommendations": [
    {
      "id": "unique_identifier",
      "type": "circle|content|connection|resource|activity",
      "title": "recommendation title",
      "description": "detailed description",
      "relevanceScore": number (0-1),
      "confidence": number (0-1),
      "reasoning": "why this is recommended",
      "metadata": {
        "category": "string",
        "tags": ["tag1", "tag2"],
        "difficulty": "easy|moderate|challenging",
        "timeCommitment": "string"
      },
      "tags": ["relevant", "tags"]
    }
  ],
  "totalCount": number,
  "algorithmUsed": "collaborative_filtering|content_based|hybrid|cultural_matching",
  "personalizationScore": number (0-1),
  "diversityScore": number (0-1),
  "explanations": [
    {
      "reason": "explanation for recommendation strategy",
      "weight": number (0-1)
    }
  ]
}
\`\`\`

Recommendation Guidelines:
1. Provide ${filters?.maxResults || 10} high-quality recommendations
2. Ensure relevance score >= ${filters?.minRelevanceScore || 0.5}
3. Include diverse options to avoid filter bubbles
4. Consider user's current needs and context
5. Explain reasoning for each recommendation
6. Balance popular and niche suggestions`;
    }
    // Helper method for circle recommendations
    async recommendCircles(userProfile, context, maxResults = 5) {
        const request = {
            userId: userProfile.userId,
            recommendationType: 'circles',
            context: {
                currentPage: 'circles',
            },
            filters: {
                excludeIds: [],
                maxResults,
                minRelevanceScore: 0.6,
            },
        };
        const result = await this.execute(request, context);
        if (!result.response.success || !result.response.data) {
            throw new Error('Failed to generate circle recommendations');
        }
        return result.response.data;
    }
    // Helper method for connection recommendations
    async recommendConnections(userProfile, availableUsers, context) {
        const systemPrompt = this.createSystemPrompt('You are a connection matching specialist. Find compatible users for meaningful peer support connections.', context);
        const userPrompt = `Find the best connection matches for this user:

TARGET USER:
${JSON.stringify(userProfile, null, 2)}

AVAILABLE USERS:
${JSON.stringify(availableUsers.slice(0, 20), null, 2)} // Limit for prompt size

Consider:
- Similar diagnosis stages or complementary experiences
- Cultural compatibility and shared backgrounds
- Communication style alignment
- Mutual support potential
- Shared interests and goals

Provide up to 5 best matches in JSON format:
[
  {
    "userId": "target_user_id",
    "recommendedUserId": "matched_user_id",
    "connectionType": "peer_support|mentor|mentee|similar_journey|complementary_skills",
    "matchScore": number (0-1),
    "commonInterests": ["shared interests"],
    "sharedExperiences": ["shared experiences"],
    "potentialBenefits": ["benefits of connection"],
    "iceBreakers": ["conversation starters"]
  }
]`;
        try {
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            const connections = JSON.parse(response);
            return Array.isArray(connections) ? connections.map(conn => recommendation_types_1.ConnectionRecommendationSchema.parse(conn)) : [];
        }
        catch (error) {
            return [];
        }
    }
    // Helper method for content recommendations
    async recommendContent(userProfile, availableContent, context) {
        const request = {
            userId: userProfile.userId,
            recommendationType: 'content',
            context: {
                recentActivity: userProfile.activityHistory.joinedCircles,
            },
            filters: {
                excludeIds: [],
                maxResults: 8,
                minRelevanceScore: 0.5,
            },
        };
        // Add available content as context metadata
        const enhancedContext = {
            ...context,
            metadata: {
                ...context.metadata,
                availableContent: availableContent.slice(0, 50), // Limit for prompt size
            },
        };
        const result = await this.execute(request, enhancedContext);
        if (!result.response.success || !result.response.data) {
            throw new Error('Failed to generate content recommendations');
        }
        return result.response.data;
    }
    // Helper method for wellness activity recommendations
    async recommendWellnessActivities(userProfile, currentMood, timeAvailable, // minutes
    context) {
        const request = {
            userId: userProfile.userId,
            recommendationType: 'activities',
            context: {
                currentPage: 'wellness',
                timeOfDay: new Date().getHours() < 12 ? 'morning' :
                    new Date().getHours() < 17 ? 'afternoon' : 'evening',
                sessionDuration: timeAvailable,
            },
            filters: {
                excludeIds: [],
                maxResults: 6,
                minRelevanceScore: 0.7,
            },
        };
        // Add mood and time context
        const enhancedContext = {
            ...context,
            metadata: {
                ...context.metadata,
                currentMood,
                timeAvailable,
                userPreferences: userProfile.preferences,
            },
        };
        const result = await this.execute(request, enhancedContext);
        if (!result.response.success || !result.response.data) {
            throw new Error('Failed to generate wellness activity recommendations');
        }
        return result.response.data;
    }
    // Helper method to explain recommendations
    async explainRecommendation(recommendationId, userProfile, context) {
        const systemPrompt = this.createSystemPrompt('You are a recommendation explainer. Provide clear, personalized explanations for why specific recommendations were made.', context);
        const userPrompt = `Explain why recommendation "${recommendationId}" was suggested for this user:

User Profile: ${JSON.stringify(userProfile, null, 2)}

Provide a clear, personalized explanation that helps the user understand:
1. Why this recommendation fits their needs
2. How it relates to their goals and preferences
3. What benefits they might gain
4. How it connects to their current journey

Keep the explanation friendly, supportive, and encouraging.`;
        try {
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            return response.trim();
        }
        catch (error) {
            return 'This recommendation was selected based on your profile and preferences to support your wellness journey.';
        }
    }
}
exports.RecommendationAgent = RecommendationAgent;
//# sourceMappingURL=recommendation-agent.js.map