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
