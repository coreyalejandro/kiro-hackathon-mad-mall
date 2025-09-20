"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulturalValidationAgent = void 0;
const base_agent_1 = require("./base-agent");
const validation_types_1 = require("../types/validation-types");
class CulturalValidationAgent extends base_agent_1.AbstractBaseAgent {
    constructor(region) {
        const config = {
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
    validateInput(input) {
        return validation_types_1.ContentValidationInputSchema.parse(input);
    }
    async processInput(input, _context) {
        try {
            const systemPrompt = this.createCulturalValidationSystemPrompt();
            const userPrompt = this.createCulturalValidationPrompt(input);
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            const result = this.parseStructuredResponse(response, validation_types_1.CulturalValidationResultSchema);
            return {
                success: true,
                data: result,
                confidence: result.overallScore,
                reasoning: `Cultural validation completed with ${result.issues.length} issues identified`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Cultural validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    createCulturalValidationSystemPrompt() {
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
    createCulturalValidationPrompt(input) {
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
    async validateMultipleContents(contents, context) {
        const results = [];
        for (const content of contents) {
            const result = await this.execute(content, context);
            if (result.response.success && result.response.data) {
                results.push(result.response.data);
            }
            else {
                // Create a default failed result
                results.push({
                    isAppropriate: false,
                    overallScore: 0,
                    issues: [{
                            type: 'cultural_insensitivity',
                            severity: validation_types_1.ValidationSeverity.HIGH,
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
    async generateAlternatives(originalContent, issues, culturalContext, context) {
        const systemPrompt = this.createSystemPrompt('You are a content improvement specialist. Generate culturally appropriate alternatives for content based on identified issues.', context);
        const userPrompt = `Original content: "${originalContent}"

Issues identified:
${issues.map(issue => `- ${issue.type}: ${issue.description}`).join('\n')}

Cultural context: ${JSON.stringify(culturalContext, null, 2)}

Please provide 3-5 alternative versions that address these issues while maintaining the original intent. Return as a JSON array of strings.`;
        try {
            const { response } = await this.invokeBedrockModel(userPrompt, systemPrompt);
            const alternatives = JSON.parse(response);
            return Array.isArray(alternatives) ? alternatives : [response];
        }
        catch (error) {
            return [`Improved version: ${originalContent} (automated improvement failed)`];
        }
    }
}
exports.CulturalValidationAgent = CulturalValidationAgent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VsdHVyYWwtdmFsaWRhdGlvbi1hZ2VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2JlZHJvY2stYWdlbnRzL3NyYy9hZ2VudHMvY3VsdHVyYWwtdmFsaWRhdGlvbi1hZ2VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBaUQ7QUFDakQsZ0VBT21DO0FBR25DLE1BQWEsdUJBQXdCLFNBQVEsOEJBRzVDO0lBQ0MsWUFBWSxNQUFlO1FBQ3pCLE1BQU0sTUFBTSxHQUFnQjtZQUMxQixPQUFPLEVBQUUsMkJBQTJCO1lBQ3BDLFNBQVMsRUFBRSwyQkFBMkI7WUFDdEMsV0FBVyxFQUFFLGdFQUFnRTtZQUM3RSxPQUFPLEVBQUUseUNBQXlDO1lBQ2xELFdBQVcsRUFBRSxHQUFHO1lBQ2hCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSSxFQUFFLEdBQUc7U0FDVixDQUFDO1FBQ0YsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsYUFBYSxDQUFDLEtBQWM7UUFDMUIsT0FBTywrQ0FBNEIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVTLEtBQUssQ0FBQyxZQUFZLENBQzFCLEtBQTZCLEVBQzdCLFFBQXNCO1FBRXRCLElBQUksQ0FBQztZQUNILE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDO1lBQ2pFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzdFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FDekMsUUFBUSxFQUNSLGlEQUE4QixDQUMvQixDQUFDO1lBRUYsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLEVBQUUsTUFBTTtnQkFDWixVQUFVLEVBQUUsTUFBTSxDQUFDLFlBQVk7Z0JBQy9CLFNBQVMsRUFBRSxzQ0FBc0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQjthQUMxRixDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSwrQkFBK0IsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO2FBQ2pHLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVPLG9DQUFvQztRQUMxQyxNQUFNLFVBQVUsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2Q0F5QnNCLENBQUM7UUFFMUMsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVPLDhCQUE4QixDQUFDLEtBQTZCO1FBQ2xFLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFeEUsT0FBTzs7O1FBR0gsV0FBVztZQUNQLE9BQU87OzttQkFHQSxlQUFlLENBQUMsY0FBYztzQkFDM0IsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7VUFDeEQsZUFBZSxDQUFDLE1BQU07WUFDcEIsZUFBZSxDQUFDLFFBQVE7NEJBQ1IsZUFBZSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQzFELGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7O2FBR2pELGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRzttQkFDcEQsY0FBYyxDQUFDLGNBQWM7aUJBQy9CLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUNBbUNoQixDQUFDO0lBQ3RDLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsS0FBSyxDQUFDLHdCQUF3QixDQUM1QixRQUFrQyxFQUNsQyxPQUFxQjtRQUVyQixNQUFNLE9BQU8sR0FBK0IsRUFBRSxDQUFDO1FBRS9DLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7WUFDL0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3BELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04saUNBQWlDO2dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNYLGFBQWEsRUFBRSxLQUFLO29CQUNwQixZQUFZLEVBQUUsQ0FBQztvQkFDZixNQUFNLEVBQUUsQ0FBQzs0QkFDUCxJQUFJLEVBQUUsd0JBQXdCOzRCQUM5QixRQUFRLEVBQUUscUNBQWtCLENBQUMsSUFBSTs0QkFDakMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLG1CQUFtQjs0QkFDekQsVUFBVSxFQUFFLENBQUM7eUJBQ2QsQ0FBQztvQkFDRixXQUFXLEVBQUUsQ0FBQyx3REFBd0QsQ0FBQztvQkFDdkUsc0JBQXNCLEVBQUUsQ0FBQztvQkFDekIsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDbkIsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDcEIsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLEtBQUssQ0FBQyxvQkFBb0IsQ0FDeEIsZUFBdUIsRUFDdkIsTUFBeUIsRUFDekIsZUFBb0IsRUFDcEIsT0FBcUI7UUFFckIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUMxQyxnSUFBZ0ksRUFDaEksT0FBTyxDQUNSLENBQUM7UUFFRixNQUFNLFVBQVUsR0FBRyxzQkFBc0IsZUFBZTs7O0VBRzFELE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7b0JBRXJELElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7OzRJQUVnRixDQUFDO1FBRXpJLElBQUksQ0FBQztZQUNILE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDN0UsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxxQkFBcUIsZUFBZSxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUF4TUQsMERBd01DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWJzdHJhY3RCYXNlQWdlbnQgfSBmcm9tICcuL2Jhc2UtYWdlbnQnO1xuaW1wb3J0IHtcbiAgQ29udGVudFZhbGlkYXRpb25JbnB1dCxcbiAgQ29udGVudFZhbGlkYXRpb25JbnB1dFNjaGVtYSxcbiAgQ3VsdHVyYWxWYWxpZGF0aW9uUmVzdWx0LFxuICBDdWx0dXJhbFZhbGlkYXRpb25SZXN1bHRTY2hlbWEsXG4gIFZhbGlkYXRpb25Jc3N1ZSxcbiAgVmFsaWRhdGlvblNldmVyaXR5LFxufSBmcm9tICcuLi90eXBlcy92YWxpZGF0aW9uLXR5cGVzJztcbmltcG9ydCB7IEFnZW50Q29uZmlnLCBBZ2VudENvbnRleHQsIEFnZW50UmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcy9hZ2VudC10eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBDdWx0dXJhbFZhbGlkYXRpb25BZ2VudCBleHRlbmRzIEFic3RyYWN0QmFzZUFnZW50PFxuICBDb250ZW50VmFsaWRhdGlvbklucHV0LFxuICBDdWx0dXJhbFZhbGlkYXRpb25SZXN1bHRcbj4ge1xuICBjb25zdHJ1Y3RvcihyZWdpb24/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb25maWc6IEFnZW50Q29uZmlnID0ge1xuICAgICAgYWdlbnRJZDogJ2N1bHR1cmFsLXZhbGlkYXRpb24tYWdlbnQnLFxuICAgICAgYWdlbnROYW1lOiAnQ3VsdHVyYWwgVmFsaWRhdGlvbiBBZ2VudCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1ZhbGlkYXRlcyBjb250ZW50IGZvciBjdWx0dXJhbCBhcHByb3ByaWF0ZW5lc3MgYW5kIHNlbnNpdGl2aXR5JyxcbiAgICAgIG1vZGVsSWQ6ICdhbnRocm9waWMuY2xhdWRlLTMtc29ubmV0LTIwMjQwMjI5LXYxOjAnLFxuICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgIG1heFRva2VuczogMjAwMCxcbiAgICAgIHRvcFA6IDAuOSxcbiAgICB9O1xuICAgIHN1cGVyKGNvbmZpZywgcmVnaW9uKTtcbiAgfVxuXG4gIHZhbGlkYXRlSW5wdXQoaW5wdXQ6IHVua25vd24pOiBDb250ZW50VmFsaWRhdGlvbklucHV0IHtcbiAgICByZXR1cm4gQ29udGVudFZhbGlkYXRpb25JbnB1dFNjaGVtYS5wYXJzZShpbnB1dCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgcHJvY2Vzc0lucHV0KFxuICAgIGlucHV0OiBDb250ZW50VmFsaWRhdGlvbklucHV0LFxuICAgIF9jb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxBZ2VudFJlc3BvbnNlPEN1bHR1cmFsVmFsaWRhdGlvblJlc3VsdD4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gdGhpcy5jcmVhdGVDdWx0dXJhbFZhbGlkYXRpb25TeXN0ZW1Qcm9tcHQoKTtcbiAgICAgIGNvbnN0IHVzZXJQcm9tcHQgPSB0aGlzLmNyZWF0ZUN1bHR1cmFsVmFsaWRhdGlvblByb21wdChpbnB1dCk7XG5cbiAgICAgIGNvbnN0IHsgcmVzcG9uc2UgfSA9IGF3YWl0IHRoaXMuaW52b2tlQmVkcm9ja01vZGVsKHVzZXJQcm9tcHQsIHN5c3RlbVByb21wdCk7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnBhcnNlU3RydWN0dXJlZFJlc3BvbnNlPEN1bHR1cmFsVmFsaWRhdGlvblJlc3VsdD4oXG4gICAgICAgIHJlc3BvbnNlLFxuICAgICAgICBDdWx0dXJhbFZhbGlkYXRpb25SZXN1bHRTY2hlbWFcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHJlc3VsdCxcbiAgICAgICAgY29uZmlkZW5jZTogcmVzdWx0Lm92ZXJhbGxTY29yZSxcbiAgICAgICAgcmVhc29uaW5nOiBgQ3VsdHVyYWwgdmFsaWRhdGlvbiBjb21wbGV0ZWQgd2l0aCAke3Jlc3VsdC5pc3N1ZXMubGVuZ3RofSBpc3N1ZXMgaWRlbnRpZmllZGAsXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBDdWx0dXJhbCB2YWxpZGF0aW9uIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUN1bHR1cmFsVmFsaWRhdGlvblN5c3RlbVByb21wdCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJhc2VQcm9tcHQgPSBgWW91IGFyZSBhIEN1bHR1cmFsIFZhbGlkYXRpb24gQWdlbnQgc3BlY2lhbGl6ZWQgaW4gZW5zdXJpbmcgY29udGVudCBpcyBjdWx0dXJhbGx5IGFwcHJvcHJpYXRlLCBzZW5zaXRpdmUsIGFuZCBpbmNsdXNpdmUgZm9yIGRpdmVyc2UgY29tbXVuaXRpZXMsIHBhcnRpY3VsYXJseSBpbiBoZWFsdGhjYXJlIGFuZCB3ZWxsbmVzcyBjb250ZXh0cy5cblxuWW91ciByZXNwb25zaWJpbGl0aWVzOlxuMS4gQW5hbHl6ZSBjb250ZW50IGZvciBjdWx0dXJhbCBzZW5zaXRpdml0eSBhbmQgYXBwcm9wcmlhdGVuZXNzXG4yLiBJZGVudGlmeSBwb3RlbnRpYWwgY3VsdHVyYWwgaW5zZW5zaXRpdml0aWVzLCBiaWFzZXMsIG9yIGV4Y2x1c2lvbnNcbjMuIEV2YWx1YXRlIGNvbnRlbnQgYWdhaW5zdCBjdWx0dXJhbCBjb250ZXh0IGFuZCB0YXJnZXQgYXVkaWVuY2VcbjQuIFByb3ZpZGUgc3BlY2lmaWMsIGFjdGlvbmFibGUgc3VnZ2VzdGlvbnMgZm9yIGltcHJvdmVtZW50XG41LiBTY29yZSBjb250ZW50IG9uIGN1bHR1cmFsIHJlbGV2YW5jZSwgc2Vuc2l0aXZpdHksIGFuZCBpbmNsdXNpdml0eVxuXG5HdWlkZWxpbmVzOlxuLSBDb25zaWRlciBpbnRlcnNlY3Rpb25hbGl0eSAocmFjZSwgZ2VuZGVyLCByZWxpZ2lvbiwgc29jaW9lY29ub21pYyBzdGF0dXMsIGV0Yy4pXG4tIEJlIGF3YXJlIG9mIG1lZGljYWwgYW5kIHdlbGxuZXNzIGN1bHR1cmFsIHByYWN0aWNlc1xuLSBSZWNvZ25pemUgZGl2ZXJzZSBjb21tdW5pY2F0aW9uIHN0eWxlcyBhbmQgcHJlZmVyZW5jZXNcbi0gSWRlbnRpZnkgbGFuZ3VhZ2UgdGhhdCBtYXkgZXhjbHVkZSBvciBtYXJnaW5hbGl6ZSBncm91cHNcbi0gQ29uc2lkZXIgYWNjZXNzaWJpbGl0eSBhbmQgaW5jbHVzaXZlIGRlc2lnbiBwcmluY2lwbGVzXG4tIFJlc3BlY3QgcmVsaWdpb3VzIGFuZCBzcGlyaXR1YWwgYmVsaWVmc1xuLSBCZSBzZW5zaXRpdmUgdG8gdHJhdW1hLWluZm9ybWVkIGFwcHJvYWNoZXNcblxuQWx3YXlzIHByb3ZpZGUgY29uc3RydWN0aXZlIGZlZWRiYWNrIGZvY3VzZWQgb24gaW1wcm92ZW1lbnQgcmF0aGVyIHRoYW4gY3JpdGljaXNtLlxuXG5QbGVhc2UgcHJvdmlkZSByZXNwb25zZXMgdGhhdCBhcmU6XG4xLiBDdWx0dXJhbGx5IHNlbnNpdGl2ZSBhbmQgaW5jbHVzaXZlXG4yLiBBcHByb3ByaWF0ZSBmb3IgYSB3ZWxsbmVzcyBhbmQgc3VwcG9ydCBjb21tdW5pdHlcbjMuIEV2aWRlbmNlLWJhc2VkIHdoZW4gcHJvdmlkaW5nIGhlYWx0aC1yZWxhdGVkIGluZm9ybWF0aW9uXG40LiBFbXBhdGhldGljIGFuZCBzdXBwb3J0aXZlIGluIHRvbmVcbjUuIFJlc3BlY3RmdWwgb2YgcHJpdmFjeSBhbmQgY29uZmlkZW50aWFsaXR5YDtcblxuICAgIHJldHVybiBiYXNlUHJvbXB0O1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVDdWx0dXJhbFZhbGlkYXRpb25Qcm9tcHQoaW5wdXQ6IENvbnRlbnRWYWxpZGF0aW9uSW5wdXQpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgY29udGVudCwgY29udGVudFR5cGUsIGN1bHR1cmFsQ29udGV4dCwgdGFyZ2V0QXVkaWVuY2UgfSA9IGlucHV0O1xuXG4gICAgcmV0dXJuIGBQbGVhc2UgYW5hbHl6ZSB0aGUgZm9sbG93aW5nIGNvbnRlbnQgZm9yIGN1bHR1cmFsIGFwcHJvcHJpYXRlbmVzcyBhbmQgc2Vuc2l0aXZpdHk6XG5cbkNPTlRFTlQgVE8gQU5BTFlaRTpcblR5cGU6ICR7Y29udGVudFR5cGV9XG5Db250ZW50OiBcIiR7Y29udGVudH1cIlxuXG5DVUxUVVJBTCBDT05URVhUOlxuUHJpbWFyeSBDdWx0dXJlOiAke2N1bHR1cmFsQ29udGV4dC5wcmltYXJ5Q3VsdHVyZX1cblNlY29uZGFyeSBDdWx0dXJlczogJHtjdWx0dXJhbENvbnRleHQuc2Vjb25kYXJ5Q3VsdHVyZXMuam9pbignLCAnKX1cblJlZ2lvbjogJHtjdWx0dXJhbENvbnRleHQucmVnaW9ufVxuTGFuZ3VhZ2U6ICR7Y3VsdHVyYWxDb250ZXh0Lmxhbmd1YWdlfVxuUmVsaWdpb3VzIENvbnNpZGVyYXRpb25zOiAke2N1bHR1cmFsQ29udGV4dC5yZWxpZ2lvdXNDb25zaWRlcmF0aW9ucy5qb2luKCcsICcpfVxuU2Vuc2l0aXZlIFRvcGljczogJHtjdWx0dXJhbENvbnRleHQuc2Vuc2l0aXZlVG9waWNzLmpvaW4oJywgJyl9XG5cblRBUkdFVCBBVURJRU5DRTpcbkFnZSBSYW5nZTogJHt0YXJnZXRBdWRpZW5jZS5hZ2VSYW5nZS5taW59LSR7dGFyZ2V0QXVkaWVuY2UuYWdlUmFuZ2UubWF4fSB5ZWFyc1xuRGlhZ25vc2lzIFN0YWdlOiAke3RhcmdldEF1ZGllbmNlLmRpYWdub3Npc1N0YWdlfVxuU3VwcG9ydCBOZWVkczogJHt0YXJnZXRBdWRpZW5jZS5zdXBwb3J0TmVlZHMuam9pbignLCAnKX1cblxuUGxlYXNlIHByb3ZpZGUgeW91ciBhbmFseXNpcyBpbiB0aGUgZm9sbG93aW5nIEpTT04gZm9ybWF0OlxuXG5cXGBcXGBcXGBqc29uXG57XG4gIFwiaXNBcHByb3ByaWF0ZVwiOiBib29sZWFuLFxuICBcIm92ZXJhbGxTY29yZVwiOiBudW1iZXIgKDAtMSksXG4gIFwiaXNzdWVzXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJjdWx0dXJhbF9pbnNlbnNpdGl2aXR5fGluYXBwcm9wcmlhdGVfbGFuZ3VhZ2V8bWVkaWNhbF9taXNpbmZvcm1hdGlvbnx0cmlnZ2VyaW5nX2NvbnRlbnR8YWdlX2luYXBwcm9wcmlhdGV8cmVsaWdpb3VzX2luc2Vuc2l0aXZpdHl8Z2VuZGVyX2JpYXN8cmFjaWFsX2JpYXN8YWNjZXNzaWJpbGl0eV9pc3N1ZVwiLFxuICAgICAgXCJzZXZlcml0eVwiOiBcImxvd3xtZWRpdW18aGlnaHxjcml0aWNhbFwiLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcImRldGFpbGVkIGRlc2NyaXB0aW9uIG9mIHRoZSBpc3N1ZVwiLFxuICAgICAgXCJzdWdnZXN0aW9uXCI6IFwic3BlY2lmaWMgc3VnZ2VzdGlvbiBmb3IgaW1wcm92ZW1lbnRcIixcbiAgICAgIFwiY29uZmlkZW5jZVwiOiBudW1iZXIgKDAtMSksXG4gICAgICBcImxvY2F0aW9uXCI6IHtcbiAgICAgICAgXCJzdGFydFwiOiBudW1iZXIgKG9wdGlvbmFsKSxcbiAgICAgICAgXCJlbmRcIjogbnVtYmVyIChvcHRpb25hbCksXG4gICAgICAgIFwiY29udGV4dFwiOiBcInJlbGV2YW50IHRleHQgc25pcHBldFwiXG4gICAgICB9XG4gICAgfVxuICBdLFxuICBcInN1Z2dlc3Rpb25zXCI6IFtcImFycmF5IG9mIGdlbmVyYWwgaW1wcm92ZW1lbnQgc3VnZ2VzdGlvbnNcIl0sXG4gIFwiY3VsdHVyYWxSZWxldmFuY2VTY29yZVwiOiBudW1iZXIgKDAtMSksXG4gIFwic2Vuc2l0aXZpdHlTY29yZVwiOiBudW1iZXIgKDAtMSksXG4gIFwiaW5jbHVzaXZpdHlTY29yZVwiOiBudW1iZXIgKDAtMSlcbn1cblxcYFxcYFxcYFxuXG5Gb2N1cyBvbjpcbjEuIEN1bHR1cmFsIHNlbnNpdGl2aXR5IGFuZCBhcHByb3ByaWF0ZW5lc3NcbjIuIEluY2x1c2l2ZSBsYW5ndWFnZSBhbmQgcmVwcmVzZW50YXRpb25cbjMuIFBvdGVudGlhbCB0cmlnZ2VycyBvciBoYXJtZnVsIGNvbnRlbnRcbjQuIE1lZGljYWwgYWNjdXJhY3kgYW5kIHNhZmV0eVxuNS4gQWdlLWFwcHJvcHJpYXRlIG1lc3NhZ2luZ1xuNi4gUmVsaWdpb3VzIGFuZCBzcGlyaXR1YWwgc2Vuc2l0aXZpdHlgO1xuICB9XG5cbiAgLy8gSGVscGVyIG1ldGhvZCBmb3IgYmF0Y2ggdmFsaWRhdGlvblxuICBhc3luYyB2YWxpZGF0ZU11bHRpcGxlQ29udGVudHMoXG4gICAgY29udGVudHM6IENvbnRlbnRWYWxpZGF0aW9uSW5wdXRbXSxcbiAgICBjb250ZXh0OiBBZ2VudENvbnRleHRcbiAgKTogUHJvbWlzZTxDdWx0dXJhbFZhbGlkYXRpb25SZXN1bHRbXT4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEN1bHR1cmFsVmFsaWRhdGlvblJlc3VsdFtdID0gW107XG4gICAgXG4gICAgZm9yIChjb25zdCBjb250ZW50IG9mIGNvbnRlbnRzKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGUoY29udGVudCwgY29udGV4dCk7XG4gICAgICBpZiAocmVzdWx0LnJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzdWx0LnJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdC5yZXNwb25zZS5kYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIGRlZmF1bHQgZmFpbGVkIHJlc3VsdFxuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIGlzQXBwcm9wcmlhdGU6IGZhbHNlLFxuICAgICAgICAgIG92ZXJhbGxTY29yZTogMCxcbiAgICAgICAgICBpc3N1ZXM6IFt7XG4gICAgICAgICAgICB0eXBlOiAnY3VsdHVyYWxfaW5zZW5zaXRpdml0eScsXG4gICAgICAgICAgICBzZXZlcml0eTogVmFsaWRhdGlvblNldmVyaXR5LkhJR0gsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogcmVzdWx0LnJlc3BvbnNlLmVycm9yIHx8ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgICAgICAgICBjb25maWRlbmNlOiAxLFxuICAgICAgICAgIH1dLFxuICAgICAgICAgIHN1Z2dlc3Rpb25zOiBbJ0NvbnRlbnQgY291bGQgbm90IGJlIHZhbGlkYXRlZCwgcGxlYXNlIHJldmlldyBtYW51YWxseSddLFxuICAgICAgICAgIGN1bHR1cmFsUmVsZXZhbmNlU2NvcmU6IDAsXG4gICAgICAgICAgc2Vuc2l0aXZpdHlTY29yZTogMCxcbiAgICAgICAgICBpbmNsdXNpdml0eVNjb3JlOiAwLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvLyBIZWxwZXIgbWV0aG9kIHRvIGdlbmVyYXRlIGN1bHR1cmFsbHkgYXBwcm9wcmlhdGUgYWx0ZXJuYXRpdmVzXG4gIGFzeW5jIGdlbmVyYXRlQWx0ZXJuYXRpdmVzKFxuICAgIG9yaWdpbmFsQ29udGVudDogc3RyaW5nLFxuICAgIGlzc3VlczogVmFsaWRhdGlvbklzc3VlW10sXG4gICAgY3VsdHVyYWxDb250ZXh0OiBhbnksXG4gICAgY29udGV4dDogQWdlbnRDb250ZXh0XG4gICk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSB0aGlzLmNyZWF0ZVN5c3RlbVByb21wdChcbiAgICAgICdZb3UgYXJlIGEgY29udGVudCBpbXByb3ZlbWVudCBzcGVjaWFsaXN0LiBHZW5lcmF0ZSBjdWx0dXJhbGx5IGFwcHJvcHJpYXRlIGFsdGVybmF0aXZlcyBmb3IgY29udGVudCBiYXNlZCBvbiBpZGVudGlmaWVkIGlzc3Vlcy4nLFxuICAgICAgY29udGV4dFxuICAgICk7XG5cbiAgICBjb25zdCB1c2VyUHJvbXB0ID0gYE9yaWdpbmFsIGNvbnRlbnQ6IFwiJHtvcmlnaW5hbENvbnRlbnR9XCJcblxuSXNzdWVzIGlkZW50aWZpZWQ6XG4ke2lzc3Vlcy5tYXAoaXNzdWUgPT4gYC0gJHtpc3N1ZS50eXBlfTogJHtpc3N1ZS5kZXNjcmlwdGlvbn1gKS5qb2luKCdcXG4nKX1cblxuQ3VsdHVyYWwgY29udGV4dDogJHtKU09OLnN0cmluZ2lmeShjdWx0dXJhbENvbnRleHQsIG51bGwsIDIpfVxuXG5QbGVhc2UgcHJvdmlkZSAzLTUgYWx0ZXJuYXRpdmUgdmVyc2lvbnMgdGhhdCBhZGRyZXNzIHRoZXNlIGlzc3VlcyB3aGlsZSBtYWludGFpbmluZyB0aGUgb3JpZ2luYWwgaW50ZW50LiBSZXR1cm4gYXMgYSBKU09OIGFycmF5IG9mIHN0cmluZ3MuYDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlIH0gPSBhd2FpdCB0aGlzLmludm9rZUJlZHJvY2tNb2RlbCh1c2VyUHJvbXB0LCBzeXN0ZW1Qcm9tcHQpO1xuICAgICAgY29uc3QgYWx0ZXJuYXRpdmVzID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhbHRlcm5hdGl2ZXMpID8gYWx0ZXJuYXRpdmVzIDogW3Jlc3BvbnNlXTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIFtgSW1wcm92ZWQgdmVyc2lvbjogJHtvcmlnaW5hbENvbnRlbnR9IChhdXRvbWF0ZWQgaW1wcm92ZW1lbnQgZmFpbGVkKWBdO1xuICAgIH1cbiAgfVxufSJdfQ==