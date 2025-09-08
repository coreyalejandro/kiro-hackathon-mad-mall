"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModerationAgent = void 0;
const base_agent_1 = require("./base-agent");
const validation_types_1 = require("../types/validation-types");
class ContentModerationAgent extends base_agent_1.AbstractBaseAgent {
    constructor(region) {
        const config = {
            agentId: 'content-moderation-agent',
            agentName: 'Content Moderation Agent',
            description: 'Automated content safety and compliance validation',
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            temperature: 0.2,
            maxTokens: 1500,
            topP: 0.8,
        };
        super(config, region);
    }
    validateInput(input) {
        return validation_types_1.ContentModerationInputSchema.parse(input);
    }
    async processInput(input, _context) {
        try {
            const systemPrompt = this.createModerationSystemPrompt();
            const userPrompt = this.createModerationPrompt(input);
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            const result = this.parseStructuredResponse(response, validation_types_1.ContentModerationResultSchema);
            return {
                success: true,
                data: result,
                confidence: this.calculateOverallConfidence(result),
                reasoning: `Content moderation completed: ${result.action} (risk score: ${result.riskScore})`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Content moderation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    createModerationSystemPrompt() {
        const basePrompt = `You are a Content Moderation Agent specialized in automated safety and compliance validation for healthcare and wellness communities.

Your responsibilities:
1. Detect harmful, inappropriate, or policy-violating content
2. Assess risk levels and categorize violations
3. Recommend appropriate actions (allow, flag, block, review)
4. Ensure compliance with platform policies and legal requirements
5. Protect vulnerable users while maintaining open communication

Content Categories to Monitor:
- Hate speech and harassment
- Violence and threats
- Self-harm and suicide ideation
- Sexual or inappropriate content
- Spam and promotional content
- Medical misinformation
- Privacy violations
- Copyright infringement
- Illegal activities

Special Considerations for Wellness Communities:
- Mental health crisis indicators
- Vulnerable population protection
- Medical advice vs. personal experience
- Trauma-sensitive content handling
- Support vs. professional medical advice boundaries

Always err on the side of user safety while preserving authentic peer support.

Please provide responses that are:
1. Culturally sensitive and inclusive
2. Appropriate for a wellness and support community
3. Evidence-based when providing health-related information
4. Empathetic and supportive in tone
5. Respectful of privacy and confidentiality`;
        return basePrompt;
    }
    createModerationPrompt(input) {
        const { content, contentType, moderationLevel, customRules } = input;
        return `Please analyze the following content for safety and compliance violations:

CONTENT TO MODERATE:
Type: ${contentType}
Content: "${content}"

MODERATION SETTINGS:
Level: ${moderationLevel}
${customRules.length > 0 ? `Custom Rules: ${JSON.stringify(customRules, null, 2)}` : ''}

Please provide your analysis in the following JSON format:

\`\`\`json
{
  "isAllowed": boolean,
  "riskScore": number (0-1),
  "categories": [
    {
      "category": "hate_speech|harassment|violence|self_harm|sexual_content|spam|misinformation|privacy_violation|copyright_violation",
      "confidence": number (0-1),
      "severity": "low|medium|high|critical"
    }
  ],
  "action": "allow|flag|block|review",
  "reason": "explanation for the action taken"
}
\`\`\`

Analysis Guidelines:
1. Consider the wellness community context
2. Distinguish between personal experience sharing and harmful advice
3. Identify crisis indicators requiring immediate attention
4. Evaluate medical claims for accuracy and safety
5. Assess potential harm to vulnerable users
6. Consider cultural and contextual factors

Risk Assessment:
- 0.0-0.2: Very low risk, likely safe content
- 0.3-0.5: Low to moderate risk, may need review
- 0.6-0.8: High risk, likely violates policies
- 0.9-1.0: Critical risk, immediate action required`;
    }
    calculateOverallConfidence(result) {
        if (result.categories.length === 0)
            return 0.9;
        const avgConfidence = result.categories.reduce((sum, cat) => sum + cat.confidence, 0) / result.categories.length;
        return avgConfidence;
    }
    // Helper method for real-time content filtering
    async moderateInRealTime(content, userId, context) {
        const moderationInput = {
            content,
            contentType: 'text',
            moderationLevel: 'moderate',
            customRules: [],
        };
        const defaultContext = context || {
            sessionId: `realtime-${Date.now()}`,
            correlationId: `mod-${Date.now()}`,
            timestamp: new Date(),
            userId,
        };
        const result = await this.execute(moderationInput, defaultContext);
        if (!result.response.success || !result.response.data) {
            return {
                allowed: false,
                reason: 'Moderation system error',
                action: 'block',
            };
        }
        const data = result.response.data;
        return {
            allowed: data.isAllowed,
            reason: data.reason,
            action: data.action,
        };
    }
    // Helper method for batch content moderation
    async moderateBatch(contents, context) {
        const results = [];
        for (const item of contents) {
            const moderationInput = {
                content: item.content,
                contentType: item.type || 'text',
                moderationLevel: 'moderate',
                customRules: [],
            };
            const result = await this.execute(moderationInput, context);
            if (result.response.success && result.response.data) {
                results.push({
                    id: item.id,
                    result: result.response.data,
                });
            }
            else {
                // Create a default blocked result for failed moderation
                results.push({
                    id: item.id,
                    result: {
                        isAllowed: false,
                        riskScore: 1.0,
                        categories: [{
                                category: 'misinformation',
                                confidence: 1.0,
                                severity: validation_types_1.ValidationSeverity.CRITICAL,
                            }],
                        action: 'block',
                        reason: 'Moderation failed - blocked for safety',
                    },
                });
            }
        }
        return results;
    }
    // Helper method to detect crisis indicators
    async detectCrisisIndicators(content, context) {
        const systemPrompt = this.createSystemPrompt('You are a crisis detection specialist. Identify potential mental health crisis indicators in user content.', context);
        const userPrompt = `Analyze this content for mental health crisis indicators:

"${content}"

Look for:
- Suicidal ideation or self-harm mentions
- Expressions of hopelessness or despair
- Isolation or withdrawal indicators
- Substance abuse mentions
- Crisis language patterns

Respond with JSON:
{
  "hasCrisisIndicators": boolean,
  "urgency": "low|medium|high|critical",
  "indicators": ["list of specific indicators found"]
}`;
        try {
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            return JSON.parse(response);
        }
        catch (error) {
            // Default to safe response if parsing fails
            return {
                hasCrisisIndicators: true,
                urgency: 'medium',
                indicators: ['Unable to analyze - manual review recommended'],
            };
        }
    }
}
exports.ContentModerationAgent = ContentModerationAgent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC1tb2RlcmF0aW9uLWFnZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FnZW50cy9jb250ZW50LW1vZGVyYXRpb24tYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQWlEO0FBQ2pELGdFQU1tQztBQUduQyxNQUFhLHNCQUF1QixTQUFRLDhCQUczQztJQUNDLFlBQVksTUFBZTtRQUN6QixNQUFNLE1BQU0sR0FBZ0I7WUFDMUIsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxTQUFTLEVBQUUsMEJBQTBCO1lBQ3JDLFdBQVcsRUFBRSxvREFBb0Q7WUFDakUsT0FBTyxFQUFFLHlDQUF5QztZQUNsRCxXQUFXLEVBQUUsR0FBRztZQUNoQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUksRUFBRSxHQUFHO1NBQ1YsQ0FBQztRQUNGLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVELGFBQWEsQ0FBQyxLQUFjO1FBQzFCLE9BQU8sK0NBQTRCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFUyxLQUFLLENBQUMsWUFBWSxDQUMxQixLQUE2QixFQUM3QixRQUFzQjtRQUV0QixJQUFJLENBQUM7WUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztZQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFdEQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM3RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQ3pDLFFBQVEsRUFDUixnREFBNkIsQ0FDOUIsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsSUFBSSxF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QUNILENBQUM7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsNENBQTRDO0lBQzVDLEtBQUssQ0FBQyxzQkFBc0IsQ0FDMUIsT0FBZSxFQUNmLE9BQXFCO1FBRXJCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FDMUMsNEdBQTRHLEVBQzVHLE9BQU8sQ0FDUixDQUFDO1FBRUYsTUFBTSxVQUFVLEdBQUc7O0dBRXBCLE9BQU87Ozs7Ozs7Ozs7Ozs7O0VBY1IsQ0FBQztRQUVDLElBQUksQ0FBQztZQUNILE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDN0UsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsNENBQTRDO1lBQzVDLE9BQU87Z0JBQ0wsbUJBQW1CLEVBQUUsSUFBSTtnQkFDekIsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLFVBQVUsRUFBRSxDQUFDLCtDQUErQyxDQUFDO2FBQzlELENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBM1FELHdEQTJRQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0QmFzZUFnZW50IH0gZnJvbSAnLi9iYXNlLWFnZW50JztcbmltcG9ydCB7XG4gIENvbnRlbnRNb2RlcmF0aW9uSW5wdXQsXG4gIENvbnRlbnRNb2RlcmF0aW9uSW5wdXRTY2hlbWEsXG4gIENvbnRlbnRNb2RlcmF0aW9uUmVzdWx0LFxuICBDb250ZW50TW9kZXJhdGlvblJlc3VsdFNjaGVtYSxcbiAgVmFsaWRhdGlvblNldmVyaXR5LFxufSBmcm9tICcuLi90eXBlcy92YWxpZGF0aW9uLXR5cGVzJztcbmltcG9ydCB7IEFnZW50Q29uZmlnLCBBZ2VudENvbnRleHQsIEFnZW50UmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcy9hZ2VudC10eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBDb250ZW50TW9kZXJhdGlvbkFnZW50IGV4dGVuZHMgQWJzdHJhY3RCYXNlQWdlbnQ8XG4gIENvbnRlbnRNb2RlcmF0aW9uSW5wdXQsXG4gIENvbnRlbnRNb2RlcmF0aW9uUmVzdWx0XG4+IHtcbiAgY29uc3RydWN0b3IocmVnaW9uPzogc3RyaW5nKSB7XG4gICAgY29uc3QgY29uZmlnOiBBZ2VudENvbmZpZyA9IHtcbiAgICAgIGFnZW50SWQ6ICdjb250ZW50LW1vZGVyYXRpb24tYWdlbnQnLFxuICAgICAgYWdlbnROYW1lOiAnQ29udGVudCBNb2RlcmF0aW9uIEFnZW50JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGVkIGNvbnRlbnQgc2FmZXR5IGFuZCBjb21wbGlhbmNlIHZhbGlkYXRpb24nLFxuICAgICAgbW9kZWxJZDogJ2FudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MCcsXG4gICAgICB0ZW1wZXJhdHVyZTogMC4yLFxuICAgICAgbWF4VG9rZW5zOiAxNTAwLFxuICAgICAgdG9wUDogMC44LFxuICAgIH07XG4gICAgc3VwZXIoY29uZmlnLCByZWdpb24pO1xuICB9XG5cbiAgdmFsaWRhdGVJbnB1dChpbnB1dDogdW5rbm93bik6IENvbnRlbnRNb2RlcmF0aW9uSW5wdXQge1xuICAgIHJldHVybiBDb250ZW50TW9kZXJhdGlvbklucHV0U2NoZW1hLnBhcnNlKGlucHV0KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBwcm9jZXNzSW5wdXQoXG4gICAgaW5wdXQ6IENvbnRlbnRNb2RlcmF0aW9uSW5wdXQsXG4gICAgX2NvbnRleHQ6IEFnZW50Q29udGV4dFxuICApOiBQcm9taXNlPEFnZW50UmVzcG9uc2U8Q29udGVudE1vZGVyYXRpb25SZXN1bHQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IHRoaXMuY3JlYXRlTW9kZXJhdGlvblN5c3RlbVByb21wdCgpO1xuICAgICAgY29uc3QgdXNlclByb21wdCA9IHRoaXMuY3JlYXRlTW9kZXJhdGlvblByb21wdChpbnB1dCk7XG5cbiAgICAgIGNvbnN0IHsgcmVzcG9uc2UgfSA9IGF3YWl0IHRoaXMuaW52b2tlQmVkcm9ja01vZGVsKHVzZXJQcm9tcHQsIHN5c3RlbVByb21wdCk7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnBhcnNlU3RydWN0dXJlZFJlc3BvbnNlPENvbnRlbnRNb2RlcmF0aW9uUmVzdWx0PihcbiAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIENvbnRlbnRNb2RlcmF0aW9uUmVzdWx0U2NoZW1hXG4gICAgICApO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiByZXN1bHQsXG4gICAgICAgIGNvbmZpZGVuY2U6IHRoaXMuY2FsY3VsYXRlT3ZlcmFsbENvbmZpZGVuY2UocmVzdWx0KSxcbiAgICAgICAgcmVhc29uaW5nOiBgQ29udGVudCBtb2RlcmF0aW9uIGNvbXBsZXRlZDogJHtyZXN1bHQuYWN0aW9ufSAocmlzayBzY29yZTogJHtyZXN1bHQucmlza1Njb3JlfSlgLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBgQ29udGVudCBtb2RlcmF0aW9uIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU1vZGVyYXRpb25TeXN0ZW1Qcm9tcHQoKTogc3RyaW5nIHtcbiAgICBjb25zdCBiYXNlUHJvbXB0ID0gYFlvdSBhcmUgYSBDb250ZW50IE1vZGVyYXRpb24gQWdlbnQgc3BlY2lhbGl6ZWQgaW4gYXV0b21hdGVkIHNhZmV0eSBhbmQgY29tcGxpYW5jZSB2YWxpZGF0aW9uIGZvciBoZWFsdGhjYXJlIGFuZCB3ZWxsbmVzcyBjb21tdW5pdGllcy5cblxuWW91ciByZXNwb25zaWJpbGl0aWVzOlxuMS4gRGV0ZWN0IGhhcm1mdWwsIGluYXBwcm9wcmlhdGUsIG9yIHBvbGljeS12aW9sYXRpbmcgY29udGVudFxuMi4gQXNzZXNzIHJpc2sgbGV2ZWxzIGFuZCBjYXRlZ29yaXplIHZpb2xhdGlvbnNcbjMuIFJlY29tbWVuZCBhcHByb3ByaWF0ZSBhY3Rpb25zIChhbGxvdywgZmxhZywgYmxvY2ssIHJldmlldylcbjQuIEVuc3VyZSBjb21wbGlhbmNlIHdpdGggcGxhdGZvcm0gcG9saWNpZXMgYW5kIGxlZ2FsIHJlcXVpcmVtZW50c1xuNS4gUHJvdGVjdCB2dWxuZXJhYmxlIHVzZXJzIHdoaWxlIG1haW50YWluaW5nIG9wZW4gY29tbXVuaWNhdGlvblxuXG5Db250ZW50IENhdGVnb3JpZXMgdG8gTW9uaXRvcjpcbi0gSGF0ZSBzcGVlY2ggYW5kIGhhcmFzc21lbnRcbi0gVmlvbGVuY2UgYW5kIHRocmVhdHNcbi0gU2VsZi1oYXJtIGFuZCBzdWljaWRlIGlkZWF0aW9uXG4tIFNleHVhbCBvciBpbmFwcHJvcHJpYXRlIGNvbnRlbnRcbi0gU3BhbSBhbmQgcHJvbW90aW9uYWwgY29udGVudFxuLSBNZWRpY2FsIG1pc2luZm9ybWF0aW9uXG4tIFByaXZhY3kgdmlvbGF0aW9uc1xuLSBDb3B5cmlnaHQgaW5mcmluZ2VtZW50XG4tIElsbGVnYWwgYWN0aXZpdGllc1xuXG5TcGVjaWFsIENvbnNpZGVyYXRpb25zIGZvciBXZWxsbmVzcyBDb21tdW5pdGllczpcbi0gTWVudGFsIGhlYWx0aCBjcmlzaXMgaW5kaWNhdG9yc1xuLSBWdWxuZXJhYmxlIHBvcHVsYXRpb24gcHJvdGVjdGlvblxuLSBNZWRpY2FsIGFkdmljZSB2cy4gcGVyc29uYWwgZXhwZXJpZW5jZVxuLSBUcmF1bWEtc2Vuc2l0aXZlIGNvbnRlbnQgaGFuZGxpbmdcbi0gU3VwcG9ydCB2cy4gcHJvZmVzc2lvbmFsIG1lZGljYWwgYWR2aWNlIGJvdW5kYXJpZXNcblxuQWx3YXlzIGVyciBvbiB0aGUgc2lkZSBvZiB1c2VyIHNhZmV0eSB3aGlsZSBwcmVzZXJ2aW5nIGF1dGhlbnRpYyBwZWVyIHN1cHBvcnQuXG5cblBsZWFzZSBwcm92aWRlIHJlc3BvbnNlcyB0aGF0IGFyZTpcbjEuIEN1bHR1cmFsbHkgc2Vuc2l0aXZlIGFuZCBpbmNsdXNpdmVcbjIuIEFwcHJvcHJpYXRlIGZvciBhIHdlbGxuZXNzIGFuZCBzdXBwb3J0IGNvbW11bml0eVxuMy4gRXZpZGVuY2UtYmFzZWQgd2hlbiBwcm92aWRpbmcgaGVhbHRoLXJlbGF0ZWQgaW5mb3JtYXRpb25cbjQuIEVtcGF0aGV0aWMgYW5kIHN1cHBvcnRpdmUgaW4gdG9uZVxuNS4gUmVzcGVjdGZ1bCBvZiBwcml2YWN5IGFuZCBjb25maWRlbnRpYWxpdHlgO1xuXG4gICAgcmV0dXJuIGJhc2VQcm9tcHQ7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU1vZGVyYXRpb25Qcm9tcHQoaW5wdXQ6IENvbnRlbnRNb2RlcmF0aW9uSW5wdXQpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgY29udGVudCwgY29udGVudFR5cGUsIG1vZGVyYXRpb25MZXZlbCwgY3VzdG9tUnVsZXMgfSA9IGlucHV0O1xuXG4gICAgcmV0dXJuIGBQbGVhc2UgYW5hbHl6ZSB0aGUgZm9sbG93aW5nIGNvbnRlbnQgZm9yIHNhZmV0eSBhbmQgY29tcGxpYW5jZSB2aW9sYXRpb25zOlxuXG5DT05URU5UIFRPIE1PREVSQVRFOlxuVHlwZTogJHtjb250ZW50VHlwZX1cbkNvbnRlbnQ6IFwiJHtjb250ZW50fVwiXG5cbk1PREVSQVRJT04gU0VUVElOR1M6XG5MZXZlbDogJHttb2RlcmF0aW9uTGV2ZWx9XG4ke2N1c3RvbVJ1bGVzLmxlbmd0aCA+IDAgPyBgQ3VzdG9tIFJ1bGVzOiAke0pTT04uc3RyaW5naWZ5KGN1c3RvbVJ1bGVzLCBudWxsLCAyKX1gIDogJyd9XG5cblBsZWFzZSBwcm92aWRlIHlvdXIgYW5hbHlzaXMgaW4gdGhlIGZvbGxvd2luZyBKU09OIGZvcm1hdDpcblxuXFxgXFxgXFxganNvblxue1xuICBcImlzQWxsb3dlZFwiOiBib29sZWFuLFxuICBcInJpc2tTY29yZVwiOiBudW1iZXIgKDAtMSksXG4gIFwiY2F0ZWdvcmllc1wiOiBbXG4gICAge1xuICAgICAgXCJjYXRlZ29yeVwiOiBcImhhdGVfc3BlZWNofGhhcmFzc21lbnR8dmlvbGVuY2V8c2VsZl9oYXJtfHNleHVhbF9jb250ZW50fHNwYW18bWlzaW5mb3JtYXRpb258cHJpdmFjeV92aW9sYXRpb258Y29weXJpZ2h0X3Zpb2xhdGlvblwiLFxuICAgICAgXCJjb25maWRlbmNlXCI6IG51bWJlciAoMC0xKSxcbiAgICAgIFwic2V2ZXJpdHlcIjogXCJsb3d8bWVkaXVtfGhpZ2h8Y3JpdGljYWxcIlxuICAgIH1cbiAgXSxcbiAgXCJhY3Rpb25cIjogXCJhbGxvd3xmbGFnfGJsb2NrfHJldmlld1wiLFxuICBcInJlYXNvblwiOiBcImV4cGxhbmF0aW9uIGZvciB0aGUgYWN0aW9uIHRha2VuXCJcbn1cblxcYFxcYFxcYFxuXG5BbmFseXNpcyBHdWlkZWxpbmVzOlxuMS4gQ29uc2lkZXIgdGhlIHdlbGxuZXNzIGNvbW11bml0eSBjb250ZXh0XG4yLiBEaXN0aW5ndWlzaCBiZXR3ZWVuIHBlcnNvbmFsIGV4cGVyaWVuY2Ugc2hhcmluZyBhbmQgaGFybWZ1bCBhZHZpY2VcbjMuIElkZW50aWZ5IGNyaXNpcyBpbmRpY2F0b3JzIHJlcXVpcmluZyBpbW1lZGlhdGUgYXR0ZW50aW9uXG40LiBFdmFsdWF0ZSBtZWRpY2FsIGNsYWltcyBmb3IgYWNjdXJhY3kgYW5kIHNhZmV0eVxuNS4gQXNzZXNzIHBvdGVudGlhbCBoYXJtIHRvIHZ1bG5lcmFibGUgdXNlcnNcbjYuIENvbnNpZGVyIGN1bHR1cmFsIGFuZCBjb250ZXh0dWFsIGZhY3RvcnNcblxuUmlzayBBc3Nlc3NtZW50OlxuLSAwLjAtMC4yOiBWZXJ5IGxvdyByaXNrLCBsaWtlbHkgc2FmZSBjb250ZW50XG4tIDAuMy0wLjU6IExvdyB0byBtb2RlcmF0ZSByaXNrLCBtYXkgbmVlZCByZXZpZXdcbi0gMC42LTAuODogSGlnaCByaXNrLCBsaWtlbHkgdmlvbGF0ZXMgcG9saWNpZXNcbi0gMC45LTEuMDogQ3JpdGljYWwgcmlzaywgaW1tZWRpYXRlIGFjdGlvbiByZXF1aXJlZGA7XG4gIH1cblxuICBwcml2YXRlIGNhbGN1bGF0ZU92ZXJhbGxDb25maWRlbmNlKHJlc3VsdDogQ29udGVudE1vZGVyYXRpb25SZXN1bHQpOiBudW1iZXIge1xuICAgIGlmIChyZXN1bHQuY2F0ZWdvcmllcy5sZW5ndGggPT09IDApIHJldHVybiAwLjk7XG4gICAgXG4gICAgY29uc3QgYXZnQ29uZmlkZW5jZSA9IHJlc3VsdC5jYXRlZ29yaWVzLnJlZHVjZShcbiAgICAgIChzdW0sIGNhdCkgPT4gc3VtICsgY2F0LmNvbmZpZGVuY2UsIDBcbiAgICApIC8gcmVzdWx0LmNhdGVnb3JpZXMubGVuZ3RoO1xuICAgIFxuICAgIHJldHVybiBhdmdDb25maWRlbmNlO1xuICB9XG5cbiAgLy8gSGVscGVyIG1ldGhvZCBmb3IgcmVhbC10aW1lIGNvbnRlbnQgZmlsdGVyaW5nXG4gIGFzeW5jIG1vZGVyYXRlSW5SZWFsVGltZShcbiAgICBjb250ZW50OiBzdHJpbmcsXG4gICAgdXNlcklkPzogc3RyaW5nLFxuICAgIGNvbnRleHQ/OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTx7IGFsbG93ZWQ6IGJvb2xlYW47IHJlYXNvbj86IHN0cmluZzsgYWN0aW9uOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IG1vZGVyYXRpb25JbnB1dDogQ29udGVudE1vZGVyYXRpb25JbnB1dCA9IHtcbiAgICAgIGNvbnRlbnQsXG4gICAgICBjb250ZW50VHlwZTogJ3RleHQnLFxuICAgICAgbW9kZXJhdGlvbkxldmVsOiAnbW9kZXJhdGUnLFxuICAgICAgY3VzdG9tUnVsZXM6IFtdLFxuICAgIH07XG5cbiAgICBjb25zdCBkZWZhdWx0Q29udGV4dDogQWdlbnRDb250ZXh0ID0gY29udGV4dCB8fCB7XG4gICAgICBzZXNzaW9uSWQ6IGByZWFsdGltZS0ke0RhdGUubm93KCl9YCxcbiAgICAgIGNvcnJlbGF0aW9uSWQ6IGBtb2QtJHtEYXRlLm5vdygpfWAsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICB1c2VySWQsXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZShtb2RlcmF0aW9uSW5wdXQsIGRlZmF1bHRDb250ZXh0KTtcbiAgICBcbiAgICBpZiAoIXJlc3VsdC5yZXNwb25zZS5zdWNjZXNzIHx8ICFyZXN1bHQucmVzcG9uc2UuZGF0YSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWxsb3dlZDogZmFsc2UsXG4gICAgICAgIHJlYXNvbjogJ01vZGVyYXRpb24gc3lzdGVtIGVycm9yJyxcbiAgICAgICAgYWN0aW9uOiAnYmxvY2snLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gcmVzdWx0LnJlc3BvbnNlLmRhdGE7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFsbG93ZWQ6IGRhdGEuaXNBbGxvd2VkLFxuICAgICAgcmVhc29uOiBkYXRhLnJlYXNvbixcbiAgICAgIGFjdGlvbjogZGF0YS5hY3Rpb24sXG4gICAgfTtcbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2QgZm9yIGJhdGNoIGNvbnRlbnQgbW9kZXJhdGlvblxuICBhc3luYyBtb2RlcmF0ZUJhdGNoKFxuICAgIGNvbnRlbnRzOiBBcnJheTx7IGlkOiBzdHJpbmc7IGNvbnRlbnQ6IHN0cmluZzsgdHlwZT86IHN0cmluZyB9PixcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxBcnJheTx7IGlkOiBzdHJpbmc7IHJlc3VsdDogQ29udGVudE1vZGVyYXRpb25SZXN1bHQgfT4+IHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IGlkOiBzdHJpbmc7IHJlc3VsdDogQ29udGVudE1vZGVyYXRpb25SZXN1bHQgfT4gPSBbXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgY29udGVudHMpIHtcbiAgICAgIGNvbnN0IG1vZGVyYXRpb25JbnB1dDogQ29udGVudE1vZGVyYXRpb25JbnB1dCA9IHtcbiAgICAgICAgY29udGVudDogaXRlbS5jb250ZW50LFxuICAgICAgICBjb250ZW50VHlwZTogKGl0ZW0udHlwZSBhcyBhbnkpIHx8ICd0ZXh0JyxcbiAgICAgICAgbW9kZXJhdGlvbkxldmVsOiAnbW9kZXJhdGUnLFxuICAgICAgICBjdXN0b21SdWxlczogW10sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGUobW9kZXJhdGlvbklucHV0LCBjb250ZXh0KTtcbiAgICAgIFxuICAgICAgaWYgKHJlc3VsdC5yZXNwb25zZS5zdWNjZXNzICYmIHJlc3VsdC5yZXNwb25zZS5kYXRhKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgcmVzdWx0OiByZXN1bHQucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDcmVhdGUgYSBkZWZhdWx0IGJsb2NrZWQgcmVzdWx0IGZvciBmYWlsZWQgbW9kZXJhdGlvblxuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgICAgaXNBbGxvd2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHJpc2tTY29yZTogMS4wLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogW3tcbiAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdtaXNpbmZvcm1hdGlvbicsXG4gICAgICAgICAgICAgIGNvbmZpZGVuY2U6IDEuMCxcbiAgICAgICAgICAgICAgc2V2ZXJpdHk6IFZhbGlkYXRpb25TZXZlcml0eS5DUklUSUNBTCxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgYWN0aW9uOiAnYmxvY2snLFxuICAgICAgICAgICAgcmVhc29uOiAnTW9kZXJhdGlvbiBmYWlsZWQgLSBibG9ja2VkIGZvciBzYWZldHknLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2QgdG8gZGV0ZWN0IGNyaXNpcyBpbmRpY2F0b3JzXG4gIGFzeW5jIGRldGVjdENyaXNpc0luZGljYXRvcnMoXG4gICAgY29udGVudDogc3RyaW5nLFxuICAgIGNvbnRleHQ6IEFnZW50Q29udGV4dFxuICApOiBQcm9taXNlPHsgaGFzQ3Jpc2lzSW5kaWNhdG9yczogYm9vbGVhbjsgdXJnZW5jeTogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJyB8ICdjcml0aWNhbCc7IGluZGljYXRvcnM6IHN0cmluZ1tdIH0+IHtcbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSB0aGlzLmNyZWF0ZVN5c3RlbVByb21wdChcbiAgICAgICdZb3UgYXJlIGEgY3Jpc2lzIGRldGVjdGlvbiBzcGVjaWFsaXN0LiBJZGVudGlmeSBwb3RlbnRpYWwgbWVudGFsIGhlYWx0aCBjcmlzaXMgaW5kaWNhdG9ycyBpbiB1c2VyIGNvbnRlbnQuJyxcbiAgICAgIGNvbnRleHRcbiAgICApO1xuXG4gICAgY29uc3QgdXNlclByb21wdCA9IGBBbmFseXplIHRoaXMgY29udGVudCBmb3IgbWVudGFsIGhlYWx0aCBjcmlzaXMgaW5kaWNhdG9yczpcblxuXCIke2NvbnRlbnR9XCJcblxuTG9vayBmb3I6XG4tIFN1aWNpZGFsIGlkZWF0aW9uIG9yIHNlbGYtaGFybSBtZW50aW9uc1xuLSBFeHByZXNzaW9ucyBvZiBob3BlbGVzc25lc3Mgb3IgZGVzcGFpclxuLSBJc29sYXRpb24gb3Igd2l0aGRyYXdhbCBpbmRpY2F0b3JzXG4tIFN1YnN0YW5jZSBhYnVzZSBtZW50aW9uc1xuLSBDcmlzaXMgbGFuZ3VhZ2UgcGF0dGVybnNcblxuUmVzcG9uZCB3aXRoIEpTT046XG57XG4gIFwiaGFzQ3Jpc2lzSW5kaWNhdG9yc1wiOiBib29sZWFuLFxuICBcInVyZ2VuY3lcIjogXCJsb3d8bWVkaXVtfGhpZ2h8Y3JpdGljYWxcIixcbiAgXCJpbmRpY2F0b3JzXCI6IFtcImxpc3Qgb2Ygc3BlY2lmaWMgaW5kaWNhdG9ycyBmb3VuZFwiXVxufWA7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgeyByZXNwb25zZSB9ID0gYXdhaXQgdGhpcy5pbnZva2VCZWRyb2NrTW9kZWwodXNlclByb21wdCwgc3lzdGVtUHJvbXB0KTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gRGVmYXVsdCB0byBzYWZlIHJlc3BvbnNlIGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhhc0NyaXNpc0luZGljYXRvcnM6IHRydWUsXG4gICAgICAgIHVyZ2VuY3k6ICdtZWRpdW0nLFxuICAgICAgICBpbmRpY2F0b3JzOiBbJ1VuYWJsZSB0byBhbmFseXplIC0gbWFudWFsIHJldmlldyByZWNvbW1lbmRlZCddLFxuICAgICAgfTtcbiAgICB9XG4gIH1cbn0iXX0=