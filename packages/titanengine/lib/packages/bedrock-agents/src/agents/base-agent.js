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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1hZ2VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2JlZHJvY2stYWdlbnRzL3NyYy9hZ2VudHMvYmFzZS1hZ2VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0RUFJeUM7QUFTekMsTUFBc0IsaUJBQWlCO0lBSXJDLFlBQVksTUFBbUIsRUFBRSxTQUFpQixXQUFXO1FBQzNELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSw2Q0FBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUtELEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBYSxFQUFFLE9BQXFCO1FBQ2hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFFbkIsSUFBSSxDQUFDO1lBQ0gsaUJBQWlCO1lBQ2pCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakQsc0JBQXNCO1lBQ3RCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUU3QyxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87Z0JBQzVCLE9BQU87Z0JBQ1AsUUFBUTtnQkFDUixhQUFhO2dCQUNiLFVBQVU7YUFDWCxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO1lBRTdDLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUks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TSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUN0SCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBMUhELDhDQTBIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEJlZHJvY2tSdW50aW1lQ2xpZW50LFxuICBJbnZva2VNb2RlbENvbW1hbmQsXG4gIEludm9rZU1vZGVsQ29tbWFuZElucHV0LFxufSBmcm9tICdAYXdzLXNkay9jbGllbnQtYmVkcm9jay1ydW50aW1lJztcbmltcG9ydCB7XG4gIEJhc2VBZ2VudCxcbiAgQWdlbnRDb25maWcsXG4gIEFnZW50Q29udGV4dCxcbiAgQWdlbnRFeGVjdXRpb25SZXN1bHQsXG4gIEFnZW50UmVzcG9uc2UsXG59IGZyb20gJy4uL3R5cGVzL2FnZW50LXR5cGVzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0QmFzZUFnZW50PFRJbnB1dCA9IGFueSwgVE91dHB1dCA9IGFueT4gaW1wbGVtZW50cyBCYXNlQWdlbnQ8VElucHV0LCBUT3V0cHV0PiB7XG4gIHByb3RlY3RlZCByZWFkb25seSBiZWRyb2NrQ2xpZW50OiBCZWRyb2NrUnVudGltZUNsaWVudDtcbiAgcHVibGljIHJlYWRvbmx5IGNvbmZpZzogQWdlbnRDb25maWc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBBZ2VudENvbmZpZywgcmVnaW9uOiBzdHJpbmcgPSAndXMtZWFzdC0xJykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuYmVkcm9ja0NsaWVudCA9IG5ldyBCZWRyb2NrUnVudGltZUNsaWVudCh7IHJlZ2lvbiB9KTtcbiAgfVxuXG4gIGFic3RyYWN0IHZhbGlkYXRlSW5wdXQoaW5wdXQ6IHVua25vd24pOiBUSW5wdXQ7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBwcm9jZXNzSW5wdXQoaW5wdXQ6IFRJbnB1dCwgY29udGV4dDogQWdlbnRDb250ZXh0KTogUHJvbWlzZTxBZ2VudFJlc3BvbnNlPFRPdXRwdXQ+PjtcblxuICBhc3luYyBleGVjdXRlKGlucHV0OiBUSW5wdXQsIGNvbnRleHQ6IEFnZW50Q29udGV4dCk6IFByb21pc2U8QWdlbnRFeGVjdXRpb25SZXN1bHQ8VE91dHB1dD4+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGxldCB0b2tlbnNVc2VkID0gMDtcblxuICAgIHRyeSB7XG4gICAgICAvLyBWYWxpZGF0ZSBpbnB1dFxuICAgICAgY29uc3QgdmFsaWRhdGVkSW5wdXQgPSB0aGlzLnZhbGlkYXRlSW5wdXQoaW5wdXQpO1xuXG4gICAgICAvLyBQcm9jZXNzIHRoZSByZXF1ZXN0XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHJvY2Vzc0lucHV0KHZhbGlkYXRlZElucHV0LCBjb250ZXh0KTtcblxuICAgICAgY29uc3QgZXhlY3V0aW9uVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFnZW50SWQ6IHRoaXMuY29uZmlnLmFnZW50SWQsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIHJlc3BvbnNlLFxuICAgICAgICBleGVjdXRpb25UaW1lLFxuICAgICAgICB0b2tlbnNVc2VkLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgZXhlY3V0aW9uVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFnZW50SWQ6IHRoaXMuY29uZmlnLmFnZW50SWQsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIHJlc3BvbnNlOiB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnLFxuICAgICAgICB9LFxuICAgICAgICBleGVjdXRpb25UaW1lLFxuICAgICAgICB0b2tlbnNVc2VkLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgaW52b2tlQmVkcm9ja01vZGVsKFxuICAgIHByb21wdDogc3RyaW5nLFxuICAgIHN5c3RlbVByb21wdD86IHN0cmluZ1xuICApOiBQcm9taXNlPHsgcmVzcG9uc2U6IHN0cmluZzsgdG9rZW5zVXNlZDogbnVtYmVyIH0+IHtcbiAgICBjb25zdCBtb2RlbElucHV0OiBJbnZva2VNb2RlbENvbW1hbmRJbnB1dCA9IHtcbiAgICAgIG1vZGVsSWQ6IHRoaXMuY29uZmlnLm1vZGVsSWQsXG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFudGhyb3BpY192ZXJzaW9uOiAnYmVkcm9jay0yMDIzLTA1LTMxJyxcbiAgICAgICAgbWF4X3Rva2VuczogdGhpcy5jb25maWcubWF4VG9rZW5zLFxuICAgICAgICB0ZW1wZXJhdHVyZTogdGhpcy5jb25maWcudGVtcGVyYXR1cmUsXG4gICAgICAgIHRvcF9wOiB0aGlzLmNvbmZpZy50b3BQLFxuICAgICAgICBzdG9wX3NlcXVlbmNlczogdGhpcy5jb25maWcuc3RvcFNlcXVlbmNlcyxcbiAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICBjb250ZW50OiBwcm9tcHQsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgLi4uKHN5c3RlbVByb21wdCAmJiB7IHN5c3RlbTogc3lzdGVtUHJvbXB0IH0pLFxuICAgICAgfSksXG4gICAgfTtcblxuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKG1vZGVsSW5wdXQpO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5iZWRyb2NrQ2xpZW50LnNlbmQoY29tbWFuZCk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcmVzcG9uc2UgYm9keSBmcm9tIEJlZHJvY2sgbW9kZWwnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZUJvZHkgPSBKU09OLnBhcnNlKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShyZXNwb25zZS5ib2R5KSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3BvbnNlOiByZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0LFxuICAgICAgdG9rZW5zVXNlZDogcmVzcG9uc2VCb2R5LnVzYWdlPy50b3RhbF90b2tlbnMgfHwgMCxcbiAgICB9O1xuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZVN5c3RlbVByb21wdChiYXNlUHJvbXB0OiBzdHJpbmcsIGNvbnRleHQ6IEFnZW50Q29udGV4dCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke2Jhc2VQcm9tcHR9XG5cbkNvbnRleHQgSW5mb3JtYXRpb246XG4tIFNlc3Npb24gSUQ6ICR7Y29udGV4dC5zZXNzaW9uSWR9XG4tIENvcnJlbGF0aW9uIElEOiAke2NvbnRleHQuY29ycmVsYXRpb25JZH1cbi0gVGltZXN0YW1wOiAke2NvbnRleHQudGltZXN0YW1wLnRvSVNPU3RyaW5nKCl9XG4ke2NvbnRleHQudXNlcklkID8gYC0gVXNlciBJRDogJHtjb250ZXh0LnVzZXJJZH1gIDogJyd9XG4ke2NvbnRleHQudGVuYW50SWQgPyBgLSBUZW5hbnQgSUQ6ICR7Y29udGV4dC50ZW5hbnRJZH1gIDogJyd9XG5cblBsZWFzZSBwcm92aWRlIHJlc3BvbnNlcyB0aGF0IGFyZTpcbjEuIEN1bHR1cmFsbHkgc2Vuc2l0aXZlIGFuZCBpbmNsdXNpdmVcbjIuIEFwcHJvcHJpYXRlIGZvciBhIHdlbGxuZXNzIGFuZCBzdXBwb3J0IGNvbW11bml0eVxuMy4gRXZpZGVuY2UtYmFzZWQgd2hlbiBwcm92aWRpbmcgaGVhbHRoLXJlbGF0ZWQgaW5mb3JtYXRpb25cbjQuIEVtcGF0aGV0aWMgYW5kIHN1cHBvcnRpdmUgaW4gdG9uZVxuNS4gUmVzcGVjdGZ1bCBvZiBwcml2YWN5IGFuZCBjb25maWRlbnRpYWxpdHlgO1xuICB9XG5cbiAgcHJvdGVjdGVkIHBhcnNlU3RydWN0dXJlZFJlc3BvbnNlPFQ+KHJlc3BvbnNlOiBzdHJpbmcsIHNjaGVtYTogYW55KTogVCB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRyeSB0byBleHRyYWN0IEpTT04gZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgIGNvbnN0IGpzb25NYXRjaCA9IHJlc3BvbnNlLm1hdGNoKC9gYGBqc29uXFxuKFtcXHNcXFNdKj8pXFxuYGBgLykgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLm1hdGNoKC9cXHtbXFxzXFxTXSpcXH0vKTtcbiAgICAgIFxuICAgICAgaWYgKGpzb25NYXRjaCkge1xuICAgICAgICBjb25zdCBqc29uU3RyID0ganNvbk1hdGNoWzFdIHx8IGpzb25NYXRjaFswXTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uU3RyKTtcbiAgICAgICAgcmV0dXJuIHNjaGVtYS5wYXJzZShwYXJzZWQpO1xuICAgICAgfVxuICAgICAgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbGlkIEpTT04gZm91bmQgaW4gcmVzcG9uc2UnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcGFyc2Ugc3RydWN0dXJlZCByZXNwb25zZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gKTtcbiAgICB9XG4gIH1cbn0iXX0=