"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractBaseAgent = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
class AbstractBaseAgent {
    constructor(config, region = 'us-east-1') {
        this.config = config;
        this.bedrockClient = new client_bedrock_runtime_1.BedrockRuntimeClient({ region });
    }
    async execute(input, context) {
        const startTime = Date.now();
        let tokensUsed = 0;
        try {
            // Validate input
            const validatedInput = this.validateInput(input);
            // Process the request
            const response = await this.processInput(validatedInput, context);
            const executionTime = Date.now() - startTime;
            return {
                agentId: this.config.agentId,
                context,
                response,
                executionTime,
                tokensUsed,
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                agentId: this.config.agentId,
                context,
                response: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error occurred',
                },
                executionTime,
                tokensUsed,
            };
        }
    }
    async invokeBedrockModel(prompt, systemPrompt) {
        const modelInput = {
            modelId: this.config.modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
                top_p: this.config.topP,
                stop_sequences: this.config.stopSequences,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                ...(systemPrompt && { system: systemPrompt }),
            }),
        };
        const command = new client_bedrock_runtime_1.InvokeModelCommand(modelInput);
        const response = await this.bedrockClient.send(command);
        if (!response.body) {
            throw new Error('No response body from Bedrock model');
        }
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return {
            response: responseBody.content[0].text,
            tokensUsed: responseBody.usage?.total_tokens || 0,
        };
    }
    createSystemPrompt(basePrompt, context) {
        return `${basePrompt}

Context Information:
- Session ID: ${context.sessionId}
- Correlation ID: ${context.correlationId}
- Timestamp: ${context.timestamp.toISOString()}
${context.userId ? `- User ID: ${context.userId}` : ''}
${context.tenantId ? `- Tenant ID: ${context.tenantId}` : ''}

Please provide responses that are:
1. Culturally sensitive and inclusive
2. Appropriate for a wellness and support community
3. Evidence-based when providing health-related information
4. Empathetic and supportive in tone
5. Respectful of privacy and confidentiality`;
    }
    parseStructuredResponse(response, schema) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                const parsed = JSON.parse(jsonStr);
                return schema.parse(parsed);
            }
            throw new Error('No valid JSON found in response');
        }
        catch (error) {
            throw new Error(`Failed to parse structured response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.AbstractBaseAgent = AbstractBaseAgent;
