import { AbstractBaseAgent } from './base-agent';
import {
  ContentValidationInput,
  ContentValidationInputSchema,
  CulturalValidationResult,
  CulturalValidationResultSchema,
  ValidationIssue,
  ValidationSeverity,
} from '../types/validation-types';
import { AgentConfig, AgentContext, AgentResponse } from '../types/agent-types';

export class CulturalValidationAgent extends AbstractBaseAgent<
  ContentValidationInput,
  CulturalValidationResult
> {
  constructor(region?: string) {
    const config: AgentConfig = {
      agentId: 'cultural-validation-agent',
      agentName: 'Cultural Validation Agent',
      description: 'Validates content for cultural appropriateness and sensitivity',
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      temperature: 0.3,
      maxTokens: 2000,
      topP: 0.9,
    };
    super(config, region);
  }

  validateInput(input: unknown): ContentValidationInput {
    return ContentValidationInputSchema.parse(input);
  }

  protected async processInput(
    input: ContentValidationInput,
    _context: AgentContext
  ): Promise<AgentResponse<CulturalValidationResult>> {
    try {
      const systemPrompt = this.createCulturalValidationSystemPrompt();
      const userPrompt = this.createCulturalValidationPrompt(input);

      const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
      const result = this.parseStructuredResponse<CulturalValidationResult>(
        response,
        CulturalValidationResultSchema
      );

      return {
        success: true,
        data: result,
        confidence: result.overallScore,
        reasoning: `Cultural validation completed with ${result.issues.length} issues identified`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Cultural validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private createCulturalValidationSystemPrompt(): string {
    const basePrompt = `You are a Cultural Validation Agent specialized in ensuring content is culturally appropriate, sensitive, and inclusive for diverse communities, particularly in healthcare and wellness contexts.

Your responsibilities:
1. Analyze content for cultural sensitivity and appropriateness
2. Identify potential cultural insensitivities, biases, or exclusions
3. Evaluate content against cultural context and target audience
4. Provide specific, actionable suggestions for improvement
5. Score content on cultural relevance, sensitivity, and inclusivity

Guidelines:
- Consider intersectionality (race, gender, religion, socioeconomic status, etc.)
- Be aware of medical and wellness cultural practices
- Recognize diverse communication styles and preferences
- Identify language that may exclude or marginalize groups
- Consider accessibility and inclusive design principles
- Respect religious and spiritual beliefs
- Be sensitive to trauma-informed approaches

Always provide constructive feedback focused on improvement rather than criticism.

Please provide responses that are:
1. Culturally sensitive and inclusive
2. Appropriate for a wellness and support community
3. Evidence-based when providing health-related information
4. Empathetic and supportive in tone
5. Respectful of privacy and confidentiality`;

    return basePrompt;
  }

  private createCulturalValidationPrompt(input: ContentValidationInput): string {
    const { content, contentType, culturalContext, targetAudience } = input;

    return `Please analyze the following content for cultural appropriateness and sensitivity:

CONTENT TO ANALYZE:
Type: ${contentType}
Content: "${content}"

CULTURAL CONTEXT:
Primary Culture: ${culturalContext.primaryCulture}
Secondary Cultures: ${culturalContext.secondaryCultures.join(', ')}
Region: ${culturalContext.region}
Language: ${culturalContext.language}
Religious Considerations: ${culturalContext.religiousConsiderations.join(', ')}
Sensitive Topics: ${culturalContext.sensitiveTopics.join(', ')}

TARGET AUDIENCE:
Age Range: ${targetAudience.ageRange.min}-${targetAudience.ageRange.max} years
Diagnosis Stage: ${targetAudience.diagnosisStage}
Support Needs: ${targetAudience.supportNeeds.join(', ')}

Please provide your analysis in the following JSON format:

\`\`\`json
{
  "isAppropriate": boolean,
  "overallScore": number (0-1),
  "issues": [
    {
      "type": "cultural_insensitivity|inappropriate_language|medical_misinformation|triggering_content|age_inappropriate|religious_insensitivity|gender_bias|racial_bias|accessibility_issue",
      "severity": "low|medium|high|critical",
      "description": "detailed description of the issue",
      "suggestion": "specific suggestion for improvement",
      "confidence": number (0-1),
      "location": {
        "start": number (optional),
        "end": number (optional),
        "context": "relevant text snippet"
      }
    }
  ],
  "suggestions": ["array of general improvement suggestions"],
  "culturalRelevanceScore": number (0-1),
  "sensitivityScore": number (0-1),
  "inclusivityScore": number (0-1)
}
\`\`\`

Focus on:
1. Cultural sensitivity and appropriateness
2. Inclusive language and representation
3. Potential triggers or harmful content
4. Medical accuracy and safety
5. Age-appropriate messaging
6. Religious and spiritual sensitivity`;
  }

  // Helper method for batch validation
  async validateMultipleContents(
    contents: ContentValidationInput[],
    context: AgentContext
  ): Promise<CulturalValidationResult[]> {
    const results: CulturalValidationResult[] = [];
    
    for (const content of contents) {
      const result = await this.execute(content, context);
      if (result.response.success && result.response.data) {
        results.push(result.response.data);
      } else {
        // Create a default failed result
        results.push({
          isAppropriate: false,
          overallScore: 0,
          issues: [{
            type: 'cultural_insensitivity',
            severity: ValidationSeverity.HIGH,
            description: result.response.error || 'Validation failed',
            confidence: 1,
          }],
          suggestions: ['Content could not be validated, please review manually'],
          culturalRelevanceScore: 0,
          sensitivityScore: 0,
          inclusivityScore: 0,
        });
      }
    }
    
    return results;
  }

  // Helper method to generate culturally appropriate alternatives
  async generateAlternatives(
    originalContent: string,
    issues: ValidationIssue[],
    culturalContext: any,
    context: AgentContext
  ): Promise<string[]> {
    const systemPrompt = this.createSystemPrompt(
      'You are a content improvement specialist. Generate culturally appropriate alternatives for content based on identified issues.',
      context
    );

    const userPrompt = `Original content: "${originalContent}"

Issues identified:
${issues.map(issue => `- ${issue.type}: ${issue.description}`).join('\n')}

Cultural context: ${JSON.stringify(culturalContext, null, 2)}

Please provide 3-5 alternative versions that address these issues while maintaining the original intent. Return as a JSON array of strings.`;

    try {
      const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
      const alternatives = JSON.parse(response);
      return Array.isArray(alternatives) ? alternatives : [response];
    } catch (error) {
      return [`Improved version: ${originalContent} (automated improvement failed)`];
    }
  }
}