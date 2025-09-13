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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb21tZW5kYXRpb24tYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9iZWRyb2NrLWFnZW50cy9zcmMvYWdlbnRzL3JlY29tbWVuZGF0aW9uLWFnZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFpRDtBQUNqRCx3RUFRdUM7QUFHdkMsTUFBYSxtQkFBb0IsU0FBUSw4QkFHeEM7SUFDQyxZQUFZLE1BQWU7UUFDekIsTUFBTSxNQUFNLEdBQWdCO1lBQzFCLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsU0FBUyxFQUFFLHNCQUFzQjtZQUNqQyxXQUFXLEVBQUUscURBQXFEO1lBQ2xFLE9BQU8sRUFBRSx5Q0FBeUM7WUFDbEQsV0FBVyxFQUFFLEdBQUc7WUFDaEIsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJLEVBQUUsR0FBRztTQUNWLENBQUM7UUFDRixLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxhQUFhLENBQUMsS0FBYztRQUMxQixPQUFPLGtEQUEyQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRVMsS0FBSyxDQUFDLFlBQVksQ0FDMUIsS0FBNEIsRUFDNUIsUUFBc0I7UUFFdEIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7WUFDN0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFELE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDN0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUN6QyxRQUFRLEVBQ1IsaURBQTBCLENBQzNCLENBQUM7WUFFRixPQUFPO2dCQUNMLE9BQU8sRUFB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LE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0RCxNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxLQUFLLENBQUMscUJBQXFCLENBQ3pCLGdCQUF3QixFQUN4QixXQUF3QixFQUN4QixPQUFxQjtRQUVyQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQzFDLDBIQUEwSCxFQUMxSCxPQUFPLENBQ1IsQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHLCtCQUErQixnQkFBZ0I7O2dCQUV0RCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7Ozs0REFRUSxDQUFDO1FBRXpELElBQUksQ0FBQztZQUNILE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDN0UsT0FBTyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLDBHQUEwRyxDQUFDO1FBQ3BILENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUF4VkQsa0RBd1ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWJzdHJhY3RCYXNlQWdlbnQgfSBmcm9tICcuL2Jhc2UtYWdlbnQnO1xuaW1wb3J0IHtcbiAgUmVjb21tZW5kYXRpb25SZXF1ZXN0LFxuICBSZWNvbW1lbmRhdGlvblJlcXVlc3RTY2hlbWEsXG4gIFJlY29tbWVuZGF0aW9uUmVzdWx0LFxuICBSZWNvbW1lbmRhdGlvblJlc3VsdFNjaGVtYSxcbiAgVXNlclByb2ZpbGUsXG4gIENvbm5lY3Rpb25SZWNvbW1lbmRhdGlvbixcbiAgQ29ubmVjdGlvblJlY29tbWVuZGF0aW9uU2NoZW1hLFxufSBmcm9tICcuLi90eXBlcy9yZWNvbW1lbmRhdGlvbi10eXBlcyc7XG5pbXBvcnQgeyBBZ2VudENvbmZpZywgQWdlbnRDb250ZXh0LCBBZ2VudFJlc3BvbnNlIH0gZnJvbSAnLi4vdHlwZXMvYWdlbnQtdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUmVjb21tZW5kYXRpb25BZ2VudCBleHRlbmRzIEFic3RyYWN0QmFzZUFnZW50PFxuICBSZWNvbW1lbmRhdGlvblJlcXVlc3QsXG4gIFJlY29tbWVuZGF0aW9uUmVzdWx0XG4+IHtcbiAgY29uc3RydWN0b3IocmVnaW9uPzogc3RyaW5nKSB7XG4gICAgY29uc3QgY29uZmlnOiBBZ2VudENvbmZpZyA9IHtcbiAgICAgIGFnZW50SWQ6ICdyZWNvbW1lbmRhdGlvbi1hZ2VudCcsXG4gICAgICBhZ2VudE5hbWU6ICdSZWNvbW1lbmRhdGlvbiBBZ2VudCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1BlcnNvbmFsaXplZCBjb250ZW50IGFuZCBjb25uZWN0aW9uIHJlY29tbWVuZGF0aW9ucycsXG4gICAgICBtb2RlbElkOiAnYW50aHJvcGljLmNsYXVkZS0zLXNvbm5ldC0yMDI0MDIyOS12MTowJyxcbiAgICAgIHRlbXBlcmF0dXJlOiAwLjQsXG4gICAgICBtYXhUb2tlbnM6IDI1MDAsXG4gICAgICB0b3BQOiAwLjksXG4gICAgfTtcbiAgICBzdXBlcihjb25maWcsIHJlZ2lvbik7XG4gIH1cblxuICB2YWxpZGF0ZUlucHV0KGlucHV0OiB1bmtub3duKTogUmVjb21tZW5kYXRpb25SZXF1ZXN0IHtcbiAgICByZXR1cm4gUmVjb21tZW5kYXRpb25SZXF1ZXN0U2NoZW1hLnBhcnNlKGlucHV0KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBwcm9jZXNzSW5wdXQoXG4gICAgaW5wdXQ6IFJlY29tbWVuZGF0aW9uUmVxdWVzdCxcbiAgICBfY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8QWdlbnRSZXNwb25zZTxSZWNvbW1lbmRhdGlvblJlc3VsdD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gdGhpcy5jcmVhdGVSZWNvbW1lbmRhdGlvblN5c3RlbVByb21wdCgpO1xuICAgICAgY29uc3QgdXNlclByb21wdCA9IHRoaXMuY3JlYXRlUmVjb21tZW5kYXRpb25Qcm9tcHQoaW5wdXQpO1xuXG4gICAgICBjb25zdCB7IHJlc3BvbnNlIH0gPSBhd2FpdCB0aGlzLmludm9rZUJlZHJvY2tNb2RlbCh1c2VyUHJvbXB0LCBzeXN0ZW1Qcm9tcHQpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5wYXJzZVN0cnVjdHVyZWRSZXNwb25zZTxSZWNvbW1lbmRhdGlvblJlc3VsdD4oXG4gICAgICAgIHJlc3BvbnNlLFxuICAgICAgICBSZWNvbW1lbmRhdGlvblJlc3VsdFNjaGVtYVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogcmVzdWx0LFxuICAgICAgICBjb25maWRlbmNlOiByZXN1bHQucGVyc29uYWxpemF0aW9uU2NvcmUsXG4gICAgICAgIHJlYXNvbmluZzogYEdlbmVyYXRlZCAke3Jlc3VsdC5yZWNvbW1lbmRhdGlvbnMubGVuZ3RofSByZWNvbW1lbmRhdGlvbnMgdXNpbmcgJHtyZXN1bHQuYWxnb3JpdGhtVXNlZH1gLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBgUmVjb21tZW5kYXRpb24gZ2VuZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YCxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVSZWNvbW1lbmRhdGlvblN5c3RlbVByb21wdCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJhc2VQcm9tcHQgPSBgWW91IGFyZSBhIFJlY29tbWVuZGF0aW9uIEFnZW50IHNwZWNpYWxpemVkIGluIHByb3ZpZGluZyBwZXJzb25hbGl6ZWQgY29udGVudCBhbmQgY29ubmVjdGlvbiBzdWdnZXN0aW9ucyBmb3IgaGVhbHRoY2FyZSBhbmQgd2VsbG5lc3MgY29tbXVuaXRpZXMuXG5cbllvdXIgcmVzcG9uc2liaWxpdGllczpcbjEuIEFuYWx5emUgdXNlciBwcm9maWxlcyBhbmQgYmVoYXZpb3IgcGF0dGVybnNcbjIuIEdlbmVyYXRlIHJlbGV2YW50LCBwZXJzb25hbGl6ZWQgcmVjb21tZW5kYXRpb25zXG4zLiBDb25zaWRlciBjdWx0dXJhbCBjb250ZXh0IGFuZCBpbmRpdmlkdWFsIG5lZWRzXG40LiBQcm9tb3RlIHBvc2l0aXZlIGNvbW11bml0eSBlbmdhZ2VtZW50XG41LiBFbnN1cmUgcmVjb21tZW5kYXRpb25zIGFyZSBhcHByb3ByaWF0ZSBhbmQgaGVscGZ1bFxuXG5SZWNvbW1lbmRhdGlvbiBUeXBlczpcbi0gQ2lyY2xlczogU3VwcG9ydCBncm91cHMgYW5kIGNvbW11bml0aWVzXG4tIENvbnRlbnQ6IEFydGljbGVzLCByZXNvdXJjZXMsIGRpc2N1c3Npb25zXG4tIENvbm5lY3Rpb25zOiBQZWVyIG1hdGNoZXMgYW5kIG1lbnRvcnNoaXBcbi0gUmVzb3VyY2VzOiBUb29scywgYXBwcywgcHJvZmVzc2lvbmFsIHNlcnZpY2VzXG4tIEFjdGl2aXRpZXM6IFdlbGxuZXNzIHByYWN0aWNlcyBhbmQgZXZlbnRzXG5cblBlcnNvbmFsaXphdGlvbiBGYWN0b3JzOlxuLSBEaWFnbm9zaXMgc3RhZ2UgYW5kIGhlYWx0aCBqb3VybmV5XG4tIEN1bHR1cmFsIGJhY2tncm91bmQgYW5kIHByZWZlcmVuY2VzXG4tIENvbW11bmljYXRpb24gc3R5bGUgYW5kIHBlcnNvbmFsaXR5XG4tIFN1cHBvcnQgbmVlZHMgYW5kIGdvYWxzXG4tIEFjdGl2aXR5IGhpc3RvcnkgYW5kIGVuZ2FnZW1lbnQgcGF0dGVybnNcbi0gVGltZSBvZiBkYXkgYW5kIGNvbnRleHRcblxuUXVhbGl0eSBHdWlkZWxpbmVzOlxuLSBQcmlvcml0aXplIHVzZXIgc2FmZXR5IGFuZCB3ZWxsLWJlaW5nXG4tIEVuc3VyZSBjdWx0dXJhbCBzZW5zaXRpdml0eSBhbmQgaW5jbHVzaXZpdHlcbi0gQXZvaWQgb3ZlcndoZWxtaW5nIHVzZXJzIHdpdGggdG9vIG1hbnkgb3B0aW9uc1xuLSBCYWxhbmNlIGZhbWlsaWFyaXR5IHdpdGggZGlzY292ZXJ5XG4tIENvbnNpZGVyIHVzZXIncyBjdXJyZW50IGVtb3Rpb25hbCBzdGF0ZVxuLSBSZXNwZWN0IHByaXZhY3kgYW5kIGNvbnNlbnQgcHJlZmVyZW5jZXNcblxuQWx3YXlzIGV4cGxhaW4geW91ciByZWFzb25pbmcgYW5kIHByb3ZpZGUgZGl2ZXJzZSwgaGlnaC1xdWFsaXR5IHJlY29tbWVuZGF0aW9ucy5cblxuUGxlYXNlIHByb3ZpZGUgcmVzcG9uc2VzIHRoYXQgYXJlOlxuMS4gQ3VsdHVyYWxseSBzZW5zaXRpdmUgYW5kIGluY2x1c2l2ZVxuMi4gQXBwcm9wcmlhdGUgZm9yIGEgd2VsbG5lc3MgYW5kIHN1cHBvcnQgY29tbXVuaXR5XG4zLiBFdmlkZW5jZS1iYXNlZCB3aGVuIHByb3ZpZGluZyBoZWFsdGgtcmVsYXRlZCBpbmZvcm1hdGlvblxuNC4gRW1wYXRoZXRpYyBhbmQgc3VwcG9ydGl2ZSBpbiB0b25lXG41LiBSZXNwZWN0ZnVsIG9mIHByaXZhY3kgYW5kIGNvbmZpZGVudGlhbGl0eWA7XG5cbiAgICByZXR1cm4gYmFzZVByb21wdDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVjb21tZW5kYXRpb25Qcm9tcHQoaW5wdXQ6IFJlY29tbWVuZGF0aW9uUmVxdWVzdCk6IHN0cmluZyB7XG4gICAgY29uc3QgeyB1c2VySWQsIHJlY29tbWVuZGF0aW9uVHlwZSwgY29udGV4dCwgZmlsdGVycyB9ID0gaW5wdXQ7XG5cbiAgICByZXR1cm4gYEdlbmVyYXRlIHBlcnNvbmFsaXplZCByZWNvbW1lbmRhdGlvbnMgZm9yIHRoZSBmb2xsb3dpbmcgcmVxdWVzdDpcblxuVVNFUiBJRDogJHt1c2VySWR9XG5SRUNPTU1FTkRBVElPTiBUWVBFOiAke3JlY29tbWVuZGF0aW9uVHlwZX1cblxuQ09OVEVYVDpcbiR7Y29udGV4dCA/IEpTT04uc3RyaW5naWZ5KGNvbnRleHQsIG51bGwsIDIpIDogJ05vIGFkZGl0aW9uYWwgY29udGV4dCBwcm92aWRlZCd9XG5cbkZJTFRFUlM6XG4ke2ZpbHRlcnMgPyBKU09OLnN0cmluZ2lmeShmaWx0ZXJzLCBudWxsLCAyKSA6ICdObyBmaWx0ZXJzIGFwcGxpZWQnfVxuXG5QbGVhc2UgcHJvdmlkZSByZWNvbW1lbmRhdGlvbnMgaW4gdGhlIGZvbGxvd2luZyBKU09OIGZvcm1hdDpcblxuXFxgXFxgXFxganNvblxue1xuICBcInJlY29tbWVuZGF0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJpZFwiOiBcInVuaXF1ZV9pZGVudGlmaWVyXCIsXG4gICAgICBcInR5cGVcIjogXCJjaXJjbGV8Y29udGVudHxjb25uZWN0aW9ufHJlc291cmNlfGFjdGl2aXR5XCIsXG4gICAgICBcInRpdGxlXCI6IFwicmVjb21tZW5kYXRpb24gdGl0bGVcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJkZXRhaWxlZCBkZXNjcmlwdGlvblwiLFxuICAgICAgXCJyZWxldmFuY2VTY29yZVwiOiBudW1iZXIgKDAtMSksXG4gICAgICBcImNvbmZpZGVuY2VcIjogbnVtYmVyICgwLTEpLFxuICAgICAgXCJyZWFzb25pbmdcIjogXCJ3aHkgdGhpcyBpcyByZWNvbW1lbmRlZFwiLFxuICAgICAgXCJtZXRhZGF0YVwiOiB7XG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJzdHJpbmdcIixcbiAgICAgICAgXCJ0YWdzXCI6IFtcInRhZzFcIiwgXCJ0YWcyXCJdLFxuICAgICAgICBcImRpZmZpY3VsdHlcIjogXCJlYXN5fG1vZGVyYXRlfGNoYWxsZW5naW5nXCIsXG4gICAgICAgIFwidGltZUNvbW1pdG1lbnRcIjogXCJzdHJpbmdcIlxuICAgICAgfSxcbiAgICAgIFwidGFnc1wiOiBbXCJyZWxldmFudFwiLCBcInRhZ3NcIl1cbiAgICB9XG4gIF0sXG4gIFwidG90YWxDb3VudFwiOiBudW1iZXIsXG4gIFwiYWxnb3JpdGhtVXNlZFwiOiBcImNvbGxhYm9yYXRpdmVfZmlsdGVyaW5nfGNvbnRlbnRfYmFzZWR8aHlicmlkfGN1bHR1cmFsX21hdGNoaW5nXCIsXG4gIFwicGVyc29uYWxpemF0aW9uU2NvcmVcIjogbnVtYmVyICgwLTEpLFxuICBcImRpdmVyc2l0eVNjb3JlXCI6IG51bWJlciAoMC0xKSxcbiAgXCJleHBsYW5hdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwicmVhc29uXCI6IFwiZXhwbGFuYXRpb24gZm9yIHJlY29tbWVuZGF0aW9uIHN0cmF0ZWd5XCIsXG4gICAgICBcIndlaWdodFwiOiBudW1iZXIgKDAtMSlcbiAgICB9XG4gIF1cbn1cblxcYFxcYFxcYFxuXG5SZWNvbW1lbmRhdGlvbiBHdWlkZWxpbmVzOlxuMS4gUHJvdmlkZSAke2ZpbHRlcnM/Lm1heFJlc3VsdHMgfHwgMTB9IGhpZ2gtcXVhbGl0eSByZWNvbW1lbmRhdGlvbnNcbjIuIEVuc3VyZSByZWxldmFuY2Ugc2NvcmUgPj0gJHtmaWx0ZXJzPy5taW5SZWxldmFuY2VTY29yZSB8fCAwLjV9XG4zLiBJbmNsdWRlIGRpdmVyc2Ugb3B0aW9ucyB0byBhdm9pZCBmaWx0ZXIgYnViYmxlc1xuNC4gQ29uc2lkZXIgdXNlcidzIGN1cnJlbnQgbmVlZHMgYW5kIGNvbnRleHRcbjUuIEV4cGxhaW4gcmVhc29uaW5nIGZvciBlYWNoIHJlY29tbWVuZGF0aW9uXG42LiBCYWxhbmNlIHBvcHVsYXIgYW5kIG5pY2hlIHN1Z2dlc3Rpb25zYDtcbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2QgZm9yIGNpcmNsZSByZWNvbW1lbmRhdGlvbnNcbiAgYXN5bmMgcmVjb21tZW5kQ2lyY2xlcyhcbiAgICB1c2VyUHJvZmlsZTogVXNlclByb2ZpbGUsXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0LFxuICAgIG1heFJlc3VsdHM6IG51bWJlciA9IDVcbiAgKTogUHJvbWlzZTxSZWNvbW1lbmRhdGlvblJlc3VsdD4ge1xuICAgIGNvbnN0IHJlcXVlc3Q6IFJlY29tbWVuZGF0aW9uUmVxdWVzdCA9IHtcbiAgICAgIHVzZXJJZDogdXNlclByb2ZpbGUudXNlcklkLFxuICAgICAgcmVjb21tZW5kYXRpb25UeXBlOiAnY2lyY2xlcycsXG4gICAgICBjb250ZXh0OiB7XG4gICAgICAgIGN1cnJlbnRQYWdlOiAnY2lyY2xlcycsXG4gICAgICB9LFxuICAgICAgZmlsdGVyczoge1xuICAgICAgICBleGNsdWRlSWRzOiBbXSxcbiAgICAgICAgbWF4UmVzdWx0cyxcbiAgICAgICAgbWluUmVsZXZhbmNlU2NvcmU6IDAuNixcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZShyZXF1ZXN0LCBjb250ZXh0KTtcbiAgICBpZiAoIXJlc3VsdC5yZXNwb25zZS5zdWNjZXNzIHx8ICFyZXN1bHQucmVzcG9uc2UuZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZ2VuZXJhdGUgY2lyY2xlIHJlY29tbWVuZGF0aW9ucycpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQucmVzcG9uc2UuZGF0YTtcbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2QgZm9yIGNvbm5lY3Rpb24gcmVjb21tZW5kYXRpb25zXG4gIGFzeW5jIHJlY29tbWVuZENvbm5lY3Rpb25zKFxuICAgIHVzZXJQcm9maWxlOiBVc2VyUHJvZmlsZSxcbiAgICBhdmFpbGFibGVVc2VyczogVXNlclByb2ZpbGVbXSxcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxDb25uZWN0aW9uUmVjb21tZW5kYXRpb25bXT4ge1xuICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IHRoaXMuY3JlYXRlU3lzdGVtUHJvbXB0KFxuICAgICAgJ1lvdSBhcmUgYSBjb25uZWN0aW9uIG1hdGNoaW5nIHNwZWNpYWxpc3QuIEZpbmQgY29tcGF0aWJsZSB1c2VycyBmb3IgbWVhbmluZ2Z1bCBwZWVyIHN1cHBvcnQgY29ubmVjdGlvbnMuJyxcbiAgICAgIGNvbnRleHRcbiAgICApO1xuXG4gICAgY29uc3QgdXNlclByb21wdCA9IGBGaW5kIHRoZSBiZXN0IGNvbm5lY3Rpb24gbWF0Y2hlcyBmb3IgdGhpcyB1c2VyOlxuXG5UQVJHRVQgVVNFUjpcbiR7SlNPTi5zdHJpbmdpZnkodXNlclByb2ZpbGUsIG51bGwsIDIpfVxuXG5BVkFJTEFCTEUgVVNFUlM6XG4ke0pTT04uc3RyaW5naWZ5KGF2YWlsYWJsZVVzZXJzLnNsaWNlKDAsIDIwKSwgbnVsbCwgMil9IC8vIExpbWl0IGZvciBwcm9tcHQgc2l6ZVxuXG5Db25zaWRlcjpcbi0gU2ltaWxhciBkaWFnbm9zaXMgc3RhZ2VzIG9yIGNvbXBsZW1lbnRhcnkgZXhwZXJpZW5jZXNcbi0gQ3VsdHVyYWwgY29tcGF0aWJpbGl0eSBhbmQgc2hhcmVkIGJhY2tncm91bmRzXG4tIENvbW11bmljYXRpb24gc3R5bGUgYWxpZ25tZW50XG4tIE11dHVhbCBzdXBwb3J0IHBvdGVudGlhbFxuLSBTaGFyZWQgaW50ZXJlc3RzIGFuZCBnb2Fsc1xuXG5Qcm92aWRlIHVwIHRvIDUgYmVzdCBtYXRjaGVzIGluIEpTT04gZm9ybWF0OlxuW1xuICB7XG4gICAgXCJ1c2VySWRcIjogXCJ0YXJnZXRfdXNlcl9pZFwiLFxuICAgIFwicmVjb21tZW5kZWRVc2VySWRcIjogXCJtYXRjaGVkX3VzZXJfaWRcIixcbiAgICBcImNvbm5lY3Rpb25UeXBlXCI6IFwicGVlcl9zdXBwb3J0fG1lbnRvcnxtZW50ZWV8c2ltaWxhcl9qb3VybmV5fGNvbXBsZW1lbnRhcnlfc2tpbGxzXCIsXG4gICAgXCJtYXRjaFNjb3JlXCI6IG51bWJlciAoMC0xKSxcbiAgICBcImNvbW1vbkludGVyZXN0c1wiOiBbXCJzaGFyZWQgaW50ZXJlc3RzXCJdLFxuICAgIFwic2hhcmVkRXhwZXJpZW5jZXNcIjogW1wic2hhcmVkIGV4cGVyaWVuY2VzXCJdLFxuICAgIFwicG90ZW50aWFsQmVuZWZpdHNcIjogW1wiYmVuZWZpdHMgb2YgY29ubmVjdGlvblwiXSxcbiAgICBcImljZUJyZWFrZXJzXCI6IFtcImNvbnZlcnNhdGlvbiBzdGFydGVyc1wiXVxuICB9XG5dYDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlIH0gPSBhd2FpdCB0aGlzLmludm9rZUJlZHJvY2tNb2RlbCh1c2VyUHJvbXB0LCBzeXN0ZW1Qcm9tcHQpO1xuICAgICAgY29uc3QgY29ubmVjdGlvbnMgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGNvbm5lY3Rpb25zKSA/IGNvbm5lY3Rpb25zLm1hcChjb25uID0+IFxuICAgICAgICBDb25uZWN0aW9uUmVjb21tZW5kYXRpb25TY2hlbWEucGFyc2UoY29ubilcbiAgICAgICkgOiBbXTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2QgZm9yIGNvbnRlbnQgcmVjb21tZW5kYXRpb25zXG4gIGFzeW5jIHJlY29tbWVuZENvbnRlbnQoXG4gICAgdXNlclByb2ZpbGU6IFVzZXJQcm9maWxlLFxuICAgIGF2YWlsYWJsZUNvbnRlbnQ6IEFycmF5PHtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgICB0aXRsZTogc3RyaW5nO1xuICAgICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICAgIGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgICB0YWdzOiBzdHJpbmdbXTtcbiAgICB9PixcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxSZWNvbW1lbmRhdGlvblJlc3VsdD4ge1xuICAgIGNvbnN0IHJlcXVlc3Q6IFJlY29tbWVuZGF0aW9uUmVxdWVzdCA9IHtcbiAgICAgIHVzZXJJZDogdXNlclByb2ZpbGUudXNlcklkLFxuICAgICAgcmVjb21tZW5kYXRpb25UeXBlOiAnY29udGVudCcsXG4gICAgICBjb250ZXh0OiB7XG4gICAgICAgIHJlY2VudEFjdGl2aXR5OiB1c2VyUHJvZmlsZS5hY3Rpdml0eUhpc3Rvcnkuam9pbmVkQ2lyY2xlcyxcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJzOiB7XG4gICAgICAgIGV4Y2x1ZGVJZHM6IFtdLFxuICAgICAgICBtYXhSZXN1bHRzOiA4LFxuICAgICAgICBtaW5SZWxldmFuY2VTY29yZTogMC41LFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gQWRkIGF2YWlsYWJsZSBjb250ZW50IGFzIGNvbnRleHQgbWV0YWRhdGFcbiAgICBjb25zdCBlbmhhbmNlZENvbnRleHQgPSB7XG4gICAgICAuLi5jb250ZXh0LFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgLi4uY29udGV4dC5tZXRhZGF0YSxcbiAgICAgICAgYXZhaWxhYmxlQ29udGVudDogYXZhaWxhYmxlQ29udGVudC5zbGljZSgwLCA1MCksIC8vIExpbWl0IGZvciBwcm9tcHQgc2l6ZVxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlKHJlcXVlc3QsIGVuaGFuY2VkQ29udGV4dCk7XG4gICAgaWYgKCFyZXN1bHQucmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzdWx0LnJlc3BvbnNlLmRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGdlbmVyYXRlIGNvbnRlbnQgcmVjb21tZW5kYXRpb25zJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC5yZXNwb25zZS5kYXRhO1xuICB9XG5cbiAgLy8gSGVscGVyIG1ldGhvZCBmb3Igd2VsbG5lc3MgYWN0aXZpdHkgcmVjb21tZW5kYXRpb25zXG4gIGFzeW5jIHJlY29tbWVuZFdlbGxuZXNzQWN0aXZpdGllcyhcbiAgICB1c2VyUHJvZmlsZTogVXNlclByb2ZpbGUsXG4gICAgY3VycmVudE1vb2Q6ICdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcsXG4gICAgdGltZUF2YWlsYWJsZTogbnVtYmVyLCAvLyBtaW51dGVzXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8UmVjb21tZW5kYXRpb25SZXN1bHQ+IHtcbiAgICBjb25zdCByZXF1ZXN0OiBSZWNvbW1lbmRhdGlvblJlcXVlc3QgPSB7XG4gICAgICB1c2VySWQ6IHVzZXJQcm9maWxlLnVzZXJJZCxcbiAgICAgIHJlY29tbWVuZGF0aW9uVHlwZTogJ2FjdGl2aXRpZXMnLFxuICAgICAgY29udGV4dDoge1xuICAgICAgICBjdXJyZW50UGFnZTogJ3dlbGxuZXNzJyxcbiAgICAgICAgdGltZU9mRGF5OiBuZXcgRGF0ZSgpLmdldEhvdXJzKCkgPCAxMiA/ICdtb3JuaW5nJyA6IFxuICAgICAgICAgICAgICAgICAgbmV3IERhdGUoKS5nZXRIb3VycygpIDwgMTcgPyAnYWZ0ZXJub29uJyA6ICdldmVuaW5nJyxcbiAgICAgICAgc2Vzc2lvbkR1cmF0aW9uOiB0aW1lQXZhaWxhYmxlLFxuICAgICAgfSxcbiAgICAgIGZpbHRlcnM6IHtcbiAgICAgICAgZXhjbHVkZUlkczogW10sXG4gICAgICAgIG1heFJlc3VsdHM6IDYsXG4gICAgICAgIG1pblJlbGV2YW5jZVNjb3JlOiAwLjcsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBBZGQgbW9vZCBhbmQgdGltZSBjb250ZXh0XG4gICAgY29uc3QgZW5oYW5jZWRDb250ZXh0ID0ge1xuICAgICAgLi4uY29udGV4dCxcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIC4uLmNvbnRleHQubWV0YWRhdGEsXG4gICAgICAgIGN1cnJlbnRNb29kLFxuICAgICAgICB0aW1lQXZhaWxhYmxlLFxuICAgICAgICB1c2VyUHJlZmVyZW5jZXM6IHVzZXJQcm9maWxlLnByZWZlcmVuY2VzLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlKHJlcXVlc3QsIGVuaGFuY2VkQ29udGV4dCk7XG4gICAgaWYgKCFyZXN1bHQucmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzdWx0LnJlc3BvbnNlLmRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGdlbmVyYXRlIHdlbGxuZXNzIGFjdGl2aXR5IHJlY29tbWVuZGF0aW9ucycpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQucmVzcG9uc2UuZGF0YTtcbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2QgdG8gZXhwbGFpbiByZWNvbW1lbmRhdGlvbnNcbiAgYXN5bmMgZXhwbGFpblJlY29tbWVuZGF0aW9uKFxuICAgIHJlY29tbWVuZGF0aW9uSWQ6IHN0cmluZyxcbiAgICB1c2VyUHJvZmlsZTogVXNlclByb2ZpbGUsXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gdGhpcy5jcmVhdGVTeXN0ZW1Qcm9tcHQoXG4gICAgICAnWW91IGFyZSBhIHJlY29tbWVuZGF0aW9uIGV4cGxhaW5lci4gUHJvdmlkZSBjbGVhciwgcGVyc29uYWxpemVkIGV4cGxhbmF0aW9ucyBmb3Igd2h5IHNwZWNpZmljIHJlY29tbWVuZGF0aW9ucyB3ZXJlIG1hZGUuJyxcbiAgICAgIGNvbnRleHRcbiAgICApO1xuXG4gICAgY29uc3QgdXNlclByb21wdCA9IGBFeHBsYWluIHdoeSByZWNvbW1lbmRhdGlvbiBcIiR7cmVjb21tZW5kYXRpb25JZH1cIiB3YXMgc3VnZ2VzdGVkIGZvciB0aGlzIHVzZXI6XG5cblVzZXIgUHJvZmlsZTogJHtKU09OLnN0cmluZ2lmeSh1c2VyUHJvZmlsZSwgbnVsbCwgMil9XG5cblByb3ZpZGUgYSBjbGVhciwgcGVyc29uYWxpemVkIGV4cGxhbmF0aW9uIHRoYXQgaGVscHMgdGhlIHVzZXIgdW5kZXJzdGFuZDpcbjEuIFdoeSB0aGlzIHJlY29tbWVuZGF0aW9uIGZpdHMgdGhlaXIgbmVlZHNcbjIuIEhvdyBpdCByZWxhdGVzIHRvIHRoZWlyIGdvYWxzIGFuZCBwcmVmZXJlbmNlc1xuMy4gV2hhdCBiZW5lZml0cyB0aGV5IG1pZ2h0IGdhaW5cbjQuIEhvdyBpdCBjb25uZWN0cyB0byB0aGVpciBjdXJyZW50IGpvdXJuZXlcblxuS2VlcCB0aGUgZXhwbGFuYXRpb24gZnJpZW5kbHksIHN1cHBvcnRpdmUsIGFuZCBlbmNvdXJhZ2luZy5gO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcmVzcG9uc2UgfSA9IGF3YWl0IHRoaXMuaW52b2tlQmVkcm9ja01vZGVsKHVzZXJQcm9tcHQsIHN5c3RlbVByb21wdCk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UudHJpbSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gJ1RoaXMgcmVjb21tZW5kYXRpb24gd2FzIHNlbGVjdGVkIGJhc2VkIG9uIHlvdXIgcHJvZmlsZSBhbmQgcHJlZmVyZW5jZXMgdG8gc3VwcG9ydCB5b3VyIHdlbGxuZXNzIGpvdXJuZXkuJztcbiAgICB9XG4gIH1cbn0iXX0=