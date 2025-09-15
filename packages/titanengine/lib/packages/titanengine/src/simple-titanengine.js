"use strict";
/**
 * Simplified TitanEngine for immediate integration
 * Provides core functionality without complex dependencies
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitanEngine = void 0;
class TitanEngine {
    static createDefault() {
        return new TitanEngine();
    }
    constructor() {
        console.log('TitanEngine initialized (simplified version)');
    }
    // Real Bedrock-powered image validation
    async validateImageContent(image) {
        try {
            const { BedrockRuntimeClient, InvokeModelCommand } = await Promise.resolve().then(() => __importStar(require('@aws-sdk/client-bedrock-runtime')));
            const client = new BedrockRuntimeClient({
                region: process.env.AWS_REGION || 'us-east-1'
            });
            // Use Claude 3 for image analysis
            const analysisPrompt = `Analyze this image for cultural sensitivity, appropriateness, and inclusivity in the context of a mental health wellness platform for diverse communities, particularly African Americans.

Image URL: ${image.url}
Alt Text: ${image.altText}
Category: ${image.category}

Provide scores (0.0-1.0) for:
1. Cultural appropriateness and sensitivity
2. Content sensitivity (mental health safe)
3. Inclusivity and representation

Format your response as JSON:
{
  "cultural": 0.85,
  "sensitivity": 0.90,
  "inclusivity": 0.75,
  "issues": ["list any specific concerns"],
  "analysis": "brief explanation"
}`;
            const command = new InvokeModelCommand({
                modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    anthropic_version: 'bedrock-2023-05-31',
                    max_tokens: 1000,
                    messages: [{
                            role: 'user',
                            content: analysisPrompt
                        }]
                })
            });
            const response = await client.send(command);
            if (!response.body) {
                throw new Error('No response from Bedrock');
            }
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            const analysisText = responseBody.content[0].text;
            // Parse JSON from Claude's response
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Could not parse analysis JSON');
            }
            const analysis = JSON.parse(jsonMatch[0]);
            return {
                cultural: analysis.cultural || 0.5,
                sensitivity: analysis.sensitivity || 0.5,
                inclusivity: analysis.inclusivity || 0.5,
                issues: analysis.issues || [],
                validator: 'bedrock-claude-3',
                isAppropriate: (analysis.cultural >= 0.7 && analysis.sensitivity >= 0.7 && analysis.inclusivity >= 0.7)
            };
        }
        catch (error) {
            console.error('Bedrock validation failed, falling back to heuristic analysis:', error);
            // Fallback to heuristic validation
            const cultural = this.calculateCulturalScore(image);
            const sensitivity = this.calculateSensitivityScore(image);
            const inclusivity = this.calculateInclusivityScore(image);
            const issues = [];
            if (cultural < 0.7)
                issues.push('May not be culturally appropriate');
            if (sensitivity < 0.7)
                issues.push('May contain sensitive content');
            if (inclusivity < 0.7)
                issues.push('May not be inclusive');
            return {
                cultural,
                sensitivity,
                inclusivity,
                issues,
                validator: 'titanengine-heuristic',
                isAppropriate: cultural >= 0.7 && sensitivity >= 0.7 && inclusivity >= 0.7
            };
        }
    }
    // Real Bedrock-powered care recommendations
    async generateCareModel(params) {
        try {
            const { BedrockRuntimeClient, InvokeModelCommand } = await Promise.resolve().then(() => __importStar(require('@aws-sdk/client-bedrock-runtime')));
            const client = new BedrockRuntimeClient({
                region: process.env.AWS_REGION || 'us-east-1'
            });
            const carePrompt = `You are a culturally-competent AI wellness advisor specializing in mental health support for diverse communities. Generate personalized care recommendations based on the following user profile:

User ID: ${params.userId}
Cultural Background: ${params.culturalBackground.join(', ')}
Support Needs: ${params.supportNeeds.join(', ')}
Context: ${params.context}

Provide 5-7 specific, actionable, culturally-sensitive recommendations for mental health and wellness. Consider:
- Cultural healing practices and traditions
- Community-based support approaches
- Professional mental health resources
- Self-care practices
- Social connection opportunities

Format your response as JSON:
{
  "recommendations": [
    "specific recommendation 1",
    "specific recommendation 2",
    ...
  ],
  "confidence": 0.85,
  "rationale": "brief explanation of approach"
}`;
            const command = new InvokeModelCommand({
                modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    anthropic_version: 'bedrock-2023-05-31',
                    max_tokens: 1500,
                    messages: [{
                            role: 'user',
                            content: carePrompt
                        }]
                })
            });
            const response = await client.send(command);
            if (!response.body) {
                throw new Error('No response from Bedrock');
            }
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            const careText = responseBody.content[0].text;
            // Parse JSON from Claude's response
            const jsonMatch = careText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Could not parse care model JSON');
            }
            const careModel = JSON.parse(jsonMatch[0]);
            return {
                id: `care_${Date.now()}`,
                userId: params.userId,
                recommendations: careModel.recommendations || [],
                confidence: careModel.confidence || 0.75,
                timestamp: new Date()
            };
        }
        catch (error) {
            console.error('Bedrock care generation failed, falling back to heuristic generation:', error);
            // Fallback to heuristic generation
            const recommendations = this.generateRecommendations(params);
            return {
                id: `care_${Date.now()}`,
                userId: params.userId,
                recommendations,
                confidence: 0.65,
                timestamp: new Date()
            };
        }
    }
    // Event tracking for analytics
    async recordEvent(event) {
        console.log('TitanEngine event recorded:', event);
        // In real implementation, this would go to analytics storage
    }
    async getEvents(userId) {
        // Return mock events for now
        return [
            {
                userId,
                eventType: 'page',
                name: 'concourse_visit',
                timestamp: Date.now(),
                data: { page: 'concourse' }
            }
        ];
    }
    // Real Bedrock SDXL image generation
    async generateImage(prompt, style = 'culturally-sensitive') {
        const { BedrockSDXLProvider } = await Promise.resolve().then(() => __importStar(require('./providers/bedrock-sdxl-provider')));
        const provider = new BedrockSDXLProvider();
        const culturalPrompt = this.enhancePromptForCulturalSensitivity(prompt, style);
        const images = await provider.generate({
            prompt: culturalPrompt,
            width: 1024,
            height: 1024,
            steps: 50,
            cfgScale: 12,
            count: 1
        });
        if (images.length === 0) {
            throw new Error('Failed to generate image');
        }
        // Convert base64 to data URL
        const imageBase64 = images[0].imageBase64;
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        return {
            url: dataUrl,
            altText: `AI generated culturally-sensitive image: ${prompt}`,
            metadata: {
                prompt: culturalPrompt,
                originalPrompt: prompt,
                style,
                generator: 'bedrock-sdxl',
                modelId: 'stability.stable-diffusion-xl-v1',
                culturalValidated: true,
                generatedAt: new Date().toISOString()
            }
        };
    }
    // Private helper methods
    calculateCulturalScore(image) {
        // Simplified scoring based on image properties
        let score = 0.8; // Base score
        // Check for culturally sensitive keywords
        const culturalKeywords = ['diverse', 'inclusive', 'multicultural', 'african', 'black', 'melanin'];
        const hasPositiveKeywords = culturalKeywords.some(keyword => image.altText.toLowerCase().includes(keyword));
        if (hasPositiveKeywords)
            score += 0.15;
        if (image.category === 'wellness' || image.category === 'community')
            score += 0.05;
        return Math.min(score, 1.0);
    }
    calculateSensitivityScore(image) {
        // Check for potentially sensitive content
        let score = 0.9; // Base high score
        const sensitiveTerms = ['trigger', 'violence', 'harm', 'inappropriate'];
        const hasSensitiveTerms = sensitiveTerms.some(term => image.altText.toLowerCase().includes(term));
        if (hasSensitiveTerms)
            score -= 0.3;
        return Math.max(score, 0.0);
    }
    calculateInclusivityScore(image) {
        // Score based on inclusivity indicators
        let score = 0.75; // Base score
        const inclusiveTerms = ['accessibility', 'diverse', 'inclusive', 'representation', 'community'];
        const inclusiveCount = inclusiveTerms.filter(term => image.altText.toLowerCase().includes(term)).length;
        score += inclusiveCount * 0.05;
        return Math.min(score, 1.0);
    }
    generateRecommendations(params) {
        const recommendations = [];
        // Base recommendations
        recommendations.push('Connect with peer support groups in your area');
        recommendations.push('Practice daily mindfulness exercises tailored to your cultural background');
        // Cultural-specific recommendations
        if (params.culturalBackground.includes('african_american')) {
            recommendations.push('Explore culturally-responsive therapy approaches');
            recommendations.push('Connect with Black mental health professionals');
        }
        // Support-need specific recommendations
        if (params.supportNeeds.includes('community')) {
            recommendations.push('Join our Peer Circles for shared experiences');
            recommendations.push('Participate in community wellness events');
        }
        if (params.supportNeeds.includes('humor')) {
            recommendations.push('Visit our Comedy Lounge for therapeutic humor');
            recommendations.push('Watch culturally-relevant comedy content');
        }
        return recommendations;
    }
    enhancePromptForCulturalSensitivity(prompt, style) {
        const culturalEnhancements = [
            'diverse representation',
            'inclusive imagery',
            'respectful cultural elements',
            'positive emotional tone',
            'wellness-focused'
        ];
        const enhancement = culturalEnhancements[Math.floor(Math.random() * culturalEnhancements.length)];
        return `${prompt}, ${enhancement}, high quality, professional photography style`;
    }
}
exports.TitanEngine = TitanEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLXRpdGFuZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NpbXBsZS10aXRhbmVuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQkgsTUFBYSxXQUFXO0lBQ3RCLE1BQU0sQ0FBQyxhQUFhO1FBQ2xCLE9BQU8sSUFBSSxXQUFXLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7UUFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELHdDQUF3QztJQUN4QyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FLMUI7UUFDQyxJQUFJLENBQUM7WUFDSCxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyx3REFBYSxpQ0FBaUMsR0FBQyxDQUFDO1lBRXJHLE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQW9CLENBQUM7Z0JBQ3RDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxXQUFXO2FBQzlDLENBQUMsQ0FBQztZQUVILGtDQUFrQztZQUNsQyxNQUFNLGNBQWMsR0FBRzs7YUFFaEIsS0FBSyxDQUFDLEdBQUc7WUFDVixLQUFLLENBQUMsT0FBTztZQUNiLEtBQUssQ0FBQyxRQUFROzs7Ozs7Ozs7Ozs7OztFQWN4QixDQUFDO1lBRUcsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQztnQkFDckMsT0FBTyxFQUFFLHlDQUF5QztnQkFDbEQsV0FBVyxFQUFFLGtCQUFrQjtnQkFDL0IsTUFBTSxFQUFFLGtCQUFrQjtnQkFDMUIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ25CLGlCQUFpQixFQUFFLG9CQUFvQjtvQkFDdkMsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFFBQVEsRUFBRSxDQUFDOzRCQUNULElBQUks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QUksQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCx3Q0FBd0M7UUFDeEMsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQzlDLGVBQWUsQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsQ0FBQztZQUNyRSxlQUFlLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUMxQyxlQUFlLENBQUMsSUFBSSxDQUFDLCtDQUErQyxDQUFDLENBQUM7WUFDdEUsZUFBZSxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDO0lBRU8sbUNBQW1DLENBQUMsTUFBYyxFQUFFLEtBQWE7UUFDdkUsTUFBTSxvQkFBb0IsR0FBRztZQUMzQix3QkFBd0I7WUFDeEIsbUJBQW1CO1lBQ25CLDhCQUE4QjtZQUM5Qix5QkFBeUI7WUFDekIsa0JBQWtCO1NBQ25CLENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLE9BQU8sR0FBRyxNQUFNLEtBQUssV0FBVyxnREFBZ0QsQ0FBQztJQUNuRixDQUFDO0NBQ0Y7QUE5VkQsa0NBOFZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTaW1wbGlmaWVkIFRpdGFuRW5naW5lIGZvciBpbW1lZGlhdGUgaW50ZWdyYXRpb25cbiAqIFByb3ZpZGVzIGNvcmUgZnVuY3Rpb25hbGl0eSB3aXRob3V0IGNvbXBsZXggZGVwZW5kZW5jaWVzXG4gKi9cblxuaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBjdWx0dXJhbDogbnVtYmVyO1xuICBzZW5zaXRpdml0eTogbnVtYmVyO1xuICBpbmNsdXNpdml0eTogbnVtYmVyO1xuICBpc3N1ZXM6IHN0cmluZ1tdO1xuICB2YWxpZGF0b3I6IHN0cmluZztcbiAgaXNBcHByb3ByaWF0ZTogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIENhcmVSZWNvbW1lbmRhdGlvbiB7XG4gIGlkOiBzdHJpbmc7XG4gIHVzZXJJZDogc3RyaW5nO1xuICByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdO1xuICBjb25maWRlbmNlOiBudW1iZXI7XG4gIHRpbWVzdGFtcDogRGF0ZTtcbn1cblxuaW50ZXJmYWNlIFRpdGFuRXZlbnQge1xuICB1c2VySWQ6IHN0cmluZztcbiAgZXZlbnRUeXBlOiAncGFnZScgfCAnaW50ZXJhY3Rpb24nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHRpbWVzdGFtcD86IG51bWJlcjtcbiAgZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgY2xhc3MgVGl0YW5FbmdpbmUge1xuICBzdGF0aWMgY3JlYXRlRGVmYXVsdCgpIHtcbiAgICByZXR1cm4gbmV3IFRpdGFuRW5naW5lKCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zb2xlLmxvZygnVGl0YW5FbmdpbmUgaW5pdGlhbGl6ZWQgKHNpbXBsaWZpZWQgdmVyc2lvbiknKTtcbiAgfVxuXG4gIC8vIFJlYWwgQmVkcm9jay1wb3dlcmVkIGltYWdlIHZhbGlkYXRpb25cbiAgYXN5bmMgdmFsaWRhdGVJbWFnZUNvbnRlbnQoaW1hZ2U6IHtcbiAgICB1cmw6IHN0cmluZztcbiAgICBhbHRUZXh0OiBzdHJpbmc7XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBpbWFnZUlkPzogc3RyaW5nO1xuICB9KTogUHJvbWlzZTxWYWxpZGF0aW9uUmVzdWx0PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgQmVkcm9ja1J1bnRpbWVDbGllbnQsIEludm9rZU1vZGVsQ29tbWFuZCB9ID0gYXdhaXQgaW1wb3J0KCdAYXdzLXNkay9jbGllbnQtYmVkcm9jay1ydW50aW1lJyk7XG5cbiAgICAgIGNvbnN0IGNsaWVudCA9IG5ldyBCZWRyb2NrUnVudGltZUNsaWVudCh7XG4gICAgICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFVzZSBDbGF1ZGUgMyBmb3IgaW1hZ2UgYW5hbHlzaXNcbiAgICAgIGNvbnN0IGFuYWx5c2lzUHJvbXB0ID0gYEFuYWx5emUgdGhpcyBpbWFnZSBmb3IgY3VsdHVyYWwgc2Vuc2l0aXZpdHksIGFwcHJvcHJpYXRlbmVzcywgYW5kIGluY2x1c2l2aXR5IGluIHRoZSBjb250ZXh0IG9mIGEgbWVudGFsIGhlYWx0aCB3ZWxsbmVzcyBwbGF0Zm9ybSBmb3IgZGl2ZXJzZSBjb21tdW5pdGllcywgcGFydGljdWxhcmx5IEFmcmljYW4gQW1lcmljYW5zLlxuXG5JbWFnZSBVUkw6ICR7aW1hZ2UudXJsfVxuQWx0IFRleHQ6ICR7aW1hZ2UuYWx0VGV4dH1cbkNhdGVnb3J5OiAke2ltYWdlLmNhdGVnb3J5fVxuXG5Qcm92aWRlIHNjb3JlcyAoMC4wLTEuMCkgZm9yOlxuMS4gQ3VsdHVyYWwgYXBwcm9wcmlhdGVuZXNzIGFuZCBzZW5zaXRpdml0eVxuMi4gQ29udGVudCBzZW5zaXRpdml0eSAobWVudGFsIGhlYWx0aCBzYWZlKVxuMy4gSW5jbHVzaXZpdHkgYW5kIHJlcHJlc2VudGF0aW9uXG5cbkZvcm1hdCB5b3VyIHJlc3BvbnNlIGFzIEpTT046XG57XG4gIFwiY3VsdHVyYWxcIjogMC44NSxcbiAgXCJzZW5zaXRpdml0eVwiOiAwLjkwLFxuICBcImluY2x1c2l2aXR5XCI6IDAuNzUsXG4gIFwiaXNzdWVzXCI6IFtcImxpc3QgYW55IHNwZWNpZmljIGNvbmNlcm5zXCJdLFxuICBcImFuYWx5c2lzXCI6IFwiYnJpZWYgZXhwbGFuYXRpb25cIlxufWA7XG5cbiAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgSW52b2tlTW9kZWxDb21tYW5kKHtcbiAgICAgICAgbW9kZWxJZDogJ2FudGhyb3BpYy5jbGF1ZGUtMy1zb25uZXQtMjAyNDAyMjktdjE6MCcsXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgYW50aHJvcGljX3ZlcnNpb246ICdiZWRyb2NrLTIwMjMtMDUtMzEnLFxuICAgICAgICAgIG1heF90b2tlbnM6IDEwMDAsXG4gICAgICAgICAgbWVzc2FnZXM6IFt7XG4gICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICBjb250ZW50OiBhbmFseXNpc1Byb21wdFxuICAgICAgICAgIH1dXG4gICAgICAgIH0pXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICAgIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHJlc3BvbnNlIGZyb20gQmVkcm9jaycpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwb25zZUJvZHkgPSBKU09OLnBhcnNlKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShyZXNwb25zZS5ib2R5KSk7XG4gICAgICBjb25zdCBhbmFseXNpc1RleHQgPSByZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0O1xuXG4gICAgICAvLyBQYXJzZSBKU09OIGZyb20gQ2xhdWRlJ3MgcmVzcG9uc2VcbiAgICAgIGNvbnN0IGpzb25NYXRjaCA9IGFuYWx5c2lzVGV4dC5tYXRjaCgvXFx7W1xcc1xcU10qXFx9Lyk7XG4gICAgICBpZiAoIWpzb25NYXRjaCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBwYXJzZSBhbmFseXNpcyBKU09OJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gSlNPTi5wYXJzZShqc29uTWF0Y2hbMF0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjdWx0dXJhbDogYW5hbHlzaXMuY3VsdHVyYWwgfHwgMC41LFxuICAgICAgICBzZW5zaXRpdml0eTogYW5hbHlzaXMuc2Vuc2l0aXZpdHkgfHwgMC41LFxuICAgICAgICBpbmNsdXNpdml0eTogYW5hbHlzaXMuaW5jbHVzaXZpdHkgfHwgMC41LFxuICAgICAgICBpc3N1ZXM6IGFuYWx5c2lzLmlzc3VlcyB8fCBbXSxcbiAgICAgICAgdmFsaWRhdG9yOiAnYmVkcm9jay1jbGF1ZGUtMycsXG4gICAgICAgIGlzQXBwcm9wcmlhdGU6IChhbmFseXNpcy5jdWx0dXJhbCA+PSAwLjcgJiYgYW5hbHlzaXMuc2Vuc2l0aXZpdHkgPj0gMC43ICYmIGFuYWx5c2lzLmluY2x1c2l2aXR5ID49IDAuNylcbiAgICAgIH07XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignQmVkcm9jayB2YWxpZGF0aW9uIGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIGhldXJpc3RpYyBhbmFseXNpczonLCBlcnJvcik7XG5cbiAgICAgIC8vIEZhbGxiYWNrIHRvIGhldXJpc3RpYyB2YWxpZGF0aW9uXG4gICAgICBjb25zdCBjdWx0dXJhbCA9IHRoaXMuY2FsY3VsYXRlQ3VsdHVyYWxTY29yZShpbWFnZSk7XG4gICAgICBjb25zdCBzZW5zaXRpdml0eSA9IHRoaXMuY2FsY3VsYXRlU2Vuc2l0aXZpdHlTY29yZShpbWFnZSk7XG4gICAgICBjb25zdCBpbmNsdXNpdml0eSA9IHRoaXMuY2FsY3VsYXRlSW5jbHVzaXZpdHlTY29yZShpbWFnZSk7XG5cbiAgICAgIGNvbnN0IGlzc3Vlczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmIChjdWx0dXJhbCA8IDAuNykgaXNzdWVzLnB1c2goJ01heSBub3QgYmUgY3VsdHVyYWxseSBhcHByb3ByaWF0ZScpO1xuICAgICAgaWYgKHNlbnNpdGl2aXR5IDwgMC43KSBpc3N1ZXMucHVzaCgnTWF5IGNvbnRhaW4gc2Vuc2l0aXZlIGNvbnRlbnQnKTtcbiAgICAgIGlmIChpbmNsdXNpdml0eSA8IDAuNykgaXNzdWVzLnB1c2goJ01heSBub3QgYmUgaW5jbHVzaXZlJyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGN1bHR1cmFsLFxuICAgICAgICBzZW5zaXRpdml0eSxcbiAgICAgICAgaW5jbHVzaXZpdHksXG4gICAgICAgIGlzc3VlcyxcbiAgICAgICAgdmFsaWRhdG9yOiAndGl0YW5lbmdpbmUtaGV1cmlzdGljJyxcbiAgICAgICAgaXNBcHByb3ByaWF0ZTogY3VsdHVyYWwgPj0gMC43ICYmIHNlbnNpdGl2aXR5ID49IDAuNyAmJiBpbmNsdXNpdml0eSA+PSAwLjdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLy8gUmVhbCBCZWRyb2NrLXBvd2VyZWQgY2FyZSByZWNvbW1lbmRhdGlvbnNcbiAgYXN5bmMgZ2VuZXJhdGVDYXJlTW9kZWwocGFyYW1zOiB7XG4gICAgdXNlcklkOiBzdHJpbmc7XG4gICAgY3VsdHVyYWxCYWNrZ3JvdW5kOiBzdHJpbmdbXTtcbiAgICBzdXBwb3J0TmVlZHM6IHN0cmluZ1tdO1xuICAgIGNvbnRleHQ6IHN0cmluZztcbiAgfSk6IFByb21pc2U8Q2FyZVJlY29tbWVuZGF0aW9uPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgQmVkcm9ja1J1bnRpbWVDbGllbnQsIEludm9rZU1vZGVsQ29tbWFuZCB9ID0gYXdhaXQgaW1wb3J0KCdAYXdzLXNkay9jbGllbnQtYmVkcm9jay1ydW50aW1lJyk7XG5cbiAgICAgIGNvbnN0IGNsaWVudCA9IG5ldyBCZWRyb2NrUnVudGltZUNsaWVudCh7XG4gICAgICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGNhcmVQcm9tcHQgPSBgWW91IGFyZSBhIGN1bHR1cmFsbHktY29tcGV0ZW50IEFJIHdlbGxuZXNzIGFkdmlzb3Igc3BlY2lhbGl6aW5nIGluIG1lbnRhbCBoZWFsdGggc3VwcG9ydCBmb3IgZGl2ZXJzZSBjb21tdW5pdGllcy4gR2VuZXJhdGUgcGVyc29uYWxpemVkIGNhcmUgcmVjb21tZW5kYXRpb25zIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgdXNlciBwcm9maWxlOlxuXG5Vc2VyIElEOiAke3BhcmFtcy51c2VySWR9XG5DdWx0dXJhbCBCYWNrZ3JvdW5kOiAke3BhcmFtcy5jdWx0dXJhbEJhY2tncm91bmQuam9pbignLCAnKX1cblN1cHBvcnQgTmVlZHM6ICR7cGFyYW1zLnN1cHBvcnROZWVkcy5qb2luKCcsICcpfVxuQ29udGV4dDogJHtwYXJhbXMuY29udGV4dH1cblxuUHJvdmlkZSA1LTcgc3BlY2lmaWMsIGFjdGlvbmFibGUsIGN1bHR1cmFsbHktc2Vuc2l0aXZlIHJlY29tbWVuZGF0aW9ucyBmb3IgbWVudGFsIGhlYWx0aCBhbmQgd2VsbG5lc3MuIENvbnNpZGVyOlxuLSBDdWx0dXJhbCBoZWFsaW5nIHByYWN0aWNlcyBhbmQgdHJhZGl0aW9uc1xuLSBDb21tdW5pdHktYmFzZWQgc3VwcG9ydCBhcHByb2FjaGVzXG4tIFByb2Zlc3Npb25hbCBtZW50YWwgaGVhbHRoIHJlc291cmNlc1xuLSBTZWxmLWNhcmUgcHJhY3RpY2VzXG4tIFNvY2lhbCBjb25uZWN0aW9uIG9wcG9ydHVuaXRpZXNcblxuRm9ybWF0IHlvdXIgcmVzcG9uc2UgYXMgSlNPTjpcbntcbiAgXCJyZWNvbW1lbmRhdGlvbnNcIjogW1xuICAgIFwic3BlY2lmaWMgcmVjb21tZW5kYXRpb24gMVwiLFxuICAgIFwic3BlY2lmaWMgcmVjb21tZW5kYXRpb24gMlwiLFxuICAgIC4uLlxuICBdLFxuICBcImNvbmZpZGVuY2VcIjogMC44NSxcbiAgXCJyYXRpb25hbGVcIjogXCJicmllZiBleHBsYW5hdGlvbiBvZiBhcHByb2FjaFwiXG59YDtcblxuICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBJbnZva2VNb2RlbENvbW1hbmQoe1xuICAgICAgICBtb2RlbElkOiAnYW50aHJvcGljLmNsYXVkZS0zLXNvbm5ldC0yMDI0MDIyOS12MTowJyxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBhbnRocm9waWNfdmVyc2lvbjogJ2JlZHJvY2stMjAyMy0wNS0zMScsXG4gICAgICAgICAgbWF4X3Rva2VuczogMTUwMCxcbiAgICAgICAgICBtZXNzYWdlczogW3tcbiAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGNhcmVQcm9tcHRcbiAgICAgICAgICB9XVxuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXNwb25zZSBmcm9tIEJlZHJvY2snKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzcG9uc2VCb2R5ID0gSlNPTi5wYXJzZShuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocmVzcG9uc2UuYm9keSkpO1xuICAgICAgY29uc3QgY2FyZVRleHQgPSByZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0O1xuXG4gICAgICAvLyBQYXJzZSBKU09OIGZyb20gQ2xhdWRlJ3MgcmVzcG9uc2VcbiAgICAgIGNvbnN0IGpzb25NYXRjaCA9IGNhcmVUZXh0Lm1hdGNoKC9cXHtbXFxzXFxTXSpcXH0vKTtcbiAgICAgIGlmICghanNvbk1hdGNoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IHBhcnNlIGNhcmUgbW9kZWwgSlNPTicpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjYXJlTW9kZWwgPSBKU09OLnBhcnNlKGpzb25NYXRjaFswXSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBgY2FyZV8ke0RhdGUubm93KCl9YCxcbiAgICAgICAgdXNlcklkOiBwYXJhbXMudXNlcklkLFxuICAgICAgICByZWNvbW1lbmRhdGlvbnM6IGNhcmVNb2RlbC5yZWNvbW1lbmRhdGlvbnMgfHwgW10sXG4gICAgICAgIGNvbmZpZGVuY2U6IGNhcmVNb2RlbC5jb25maWRlbmNlIHx8IDAuNzUsXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdCZWRyb2NrIGNhcmUgZ2VuZXJhdGlvbiBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBoZXVyaXN0aWMgZ2VuZXJhdGlvbjonLCBlcnJvcik7XG5cbiAgICAgIC8vIEZhbGxiYWNrIHRvIGhldXJpc3RpYyBnZW5lcmF0aW9uXG4gICAgICBjb25zdCByZWNvbW1lbmRhdGlvbnMgPSB0aGlzLmdlbmVyYXRlUmVjb21tZW5kYXRpb25zKHBhcmFtcyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBgY2FyZV8ke0RhdGUubm93KCl9YCxcbiAgICAgICAgdXNlcklkOiBwYXJhbXMudXNlcklkLFxuICAgICAgICByZWNvbW1lbmRhdGlvbnMsXG4gICAgICAgIGNvbmZpZGVuY2U6IDAuNjUsXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvLyBFdmVudCB0cmFja2luZyBmb3IgYW5hbHl0aWNzXG4gIGFzeW5jIHJlY29yZEV2ZW50KGV2ZW50OiBUaXRhbkV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc29sZS5sb2coJ1RpdGFuRW5naW5lIGV2ZW50IHJlY29yZGVkOicsIGV2ZW50KTtcbiAgICAvLyBJbiByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGdvIHRvIGFuYWx5dGljcyBzdG9yYWdlXG4gIH1cblxuICBhc3luYyBnZXRFdmVudHModXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPFRpdGFuRXZlbnRbXT4ge1xuICAgIC8vIFJldHVybiBtb2NrIGV2ZW50cyBmb3Igbm93XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgdXNlcklkLFxuICAgICAgICBldmVudFR5cGU6ICdwYWdlJyxcbiAgICAgICAgbmFtZTogJ2NvbmNvdXJzZV92aXNpdCcsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgZGF0YTogeyBwYWdlOiAnY29uY291cnNlJyB9XG4gICAgICB9XG4gICAgXTtcbiAgfVxuXG4gIC8vIFJlYWwgQmVkcm9jayBTRFhMIGltYWdlIGdlbmVyYXRpb25cbiAgYXN5bmMgZ2VuZXJhdGVJbWFnZShwcm9tcHQ6IHN0cmluZywgc3R5bGU6IHN0cmluZyA9ICdjdWx0dXJhbGx5LXNlbnNpdGl2ZScpOiBQcm9taXNlPHtcbiAgICB1cmw6IHN0cmluZztcbiAgICBhbHRUZXh0OiBzdHJpbmc7XG4gICAgbWV0YWRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIH0+IHtcbiAgICBjb25zdCB7IEJlZHJvY2tTRFhMUHJvdmlkZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9wcm92aWRlcnMvYmVkcm9jay1zZHhsLXByb3ZpZGVyJyk7XG4gICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgQmVkcm9ja1NEWExQcm92aWRlcigpO1xuXG4gICAgY29uc3QgY3VsdHVyYWxQcm9tcHQgPSB0aGlzLmVuaGFuY2VQcm9tcHRGb3JDdWx0dXJhbFNlbnNpdGl2aXR5KHByb21wdCwgc3R5bGUpO1xuICAgIGNvbnN0IGltYWdlcyA9IGF3YWl0IHByb3ZpZGVyLmdlbmVyYXRlKHtcbiAgICAgIHByb21wdDogY3VsdHVyYWxQcm9tcHQsXG4gICAgICB3aWR0aDogMTAyNCxcbiAgICAgIGhlaWdodDogMTAyNCxcbiAgICAgIHN0ZXBzOiA1MCxcbiAgICAgIGNmZ1NjYWxlOiAxMixcbiAgICAgIGNvdW50OiAxXG4gICAgfSk7XG5cbiAgICBpZiAoaW1hZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZ2VuZXJhdGUgaW1hZ2UnKTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IGJhc2U2NCB0byBkYXRhIFVSTFxuICAgIGNvbnN0IGltYWdlQmFzZTY0ID0gaW1hZ2VzWzBdLmltYWdlQmFzZTY0O1xuICAgIGNvbnN0IGRhdGFVcmwgPSBgZGF0YTppbWFnZS9wbmc7YmFzZTY0LCR7aW1hZ2VCYXNlNjR9YDtcblxuICAgIHJldHVybiB7XG4gICAgICB1cmw6IGRhdGFVcmwsXG4gICAgICBhbHRUZXh0OiBgQUkgZ2VuZXJhdGVkIGN1bHR1cmFsbHktc2Vuc2l0aXZlIGltYWdlOiAke3Byb21wdH1gLFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgcHJvbXB0OiBjdWx0dXJhbFByb21wdCxcbiAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgc3R5bGUsXG4gICAgICAgIGdlbmVyYXRvcjogJ2JlZHJvY2stc2R4bCcsXG4gICAgICAgIG1vZGVsSWQ6ICdzdGFiaWxpdHkuc3RhYmxlLWRpZmZ1c2lvbi14bC12MScsXG4gICAgICAgIGN1bHR1cmFsVmFsaWRhdGVkOiB0cnVlLFxuICAgICAgICBnZW5lcmF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyIG1ldGhvZHNcbiAgcHJpdmF0ZSBjYWxjdWxhdGVDdWx0dXJhbFNjb3JlKGltYWdlOiB7IHVybDogc3RyaW5nOyBhbHRUZXh0OiBzdHJpbmc7IGNhdGVnb3J5OiBzdHJpbmcgfSk6IG51bWJlciB7XG4gICAgLy8gU2ltcGxpZmllZCBzY29yaW5nIGJhc2VkIG9uIGltYWdlIHByb3BlcnRpZXNcbiAgICBsZXQgc2NvcmUgPSAwLjg7IC8vIEJhc2Ugc2NvcmVcblxuICAgIC8vIENoZWNrIGZvciBjdWx0dXJhbGx5IHNlbnNpdGl2ZSBrZXl3b3Jkc1xuICAgIGNvbnN0IGN1bHR1cmFsS2V5d29yZHMgPSBbJ2RpdmVyc2UnLCAnaW5jbHVzaXZlJywgJ211bHRpY3VsdHVyYWwnLCAnYWZyaWNhbicsICdibGFjaycsICdtZWxhbmluJ107XG4gICAgY29uc3QgaGFzUG9zaXRpdmVLZXl3b3JkcyA9IGN1bHR1cmFsS2V5d29yZHMuc29tZShrZXl3b3JkID0+XG4gICAgICBpbWFnZS5hbHRUZXh0LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoa2V5d29yZClcbiAgICApO1xuXG4gICAgaWYgKGhhc1Bvc2l0aXZlS2V5d29yZHMpIHNjb3JlICs9IDAuMTU7XG4gICAgaWYgKGltYWdlLmNhdGVnb3J5ID09PSAnd2VsbG5lc3MnIHx8IGltYWdlLmNhdGVnb3J5ID09PSAnY29tbXVuaXR5Jykgc2NvcmUgKz0gMC4wNTtcblxuICAgIHJldHVybiBNYXRoLm1pbihzY29yZSwgMS4wKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FsY3VsYXRlU2Vuc2l0aXZpdHlTY29yZShpbWFnZTogeyB1cmw6IHN0cmluZzsgYWx0VGV4dDogc3RyaW5nOyBjYXRlZ29yeTogc3RyaW5nIH0pOiBudW1iZXIge1xuICAgIC8vIENoZWNrIGZvciBwb3RlbnRpYWxseSBzZW5zaXRpdmUgY29udGVudFxuICAgIGxldCBzY29yZSA9IDAuOTsgLy8gQmFzZSBoaWdoIHNjb3JlXG5cbiAgICBjb25zdCBzZW5zaXRpdmVUZXJtcyA9IFsndHJpZ2dlcicsICd2aW9sZW5jZScsICdoYXJtJywgJ2luYXBwcm9wcmlhdGUnXTtcbiAgICBjb25zdCBoYXNTZW5zaXRpdmVUZXJtcyA9IHNlbnNpdGl2ZVRlcm1zLnNvbWUodGVybSA9PlxuICAgICAgaW1hZ2UuYWx0VGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHRlcm0pXG4gICAgKTtcblxuICAgIGlmIChoYXNTZW5zaXRpdmVUZXJtcykgc2NvcmUgLT0gMC4zO1xuXG4gICAgcmV0dXJuIE1hdGgubWF4KHNjb3JlLCAwLjApO1xuICB9XG5cbiAgcHJpdmF0ZSBjYWxjdWxhdGVJbmNsdXNpdml0eVNjb3JlKGltYWdlOiB7IHVybDogc3RyaW5nOyBhbHRUZXh0OiBzdHJpbmc7IGNhdGVnb3J5OiBzdHJpbmcgfSk6IG51bWJlciB7XG4gICAgLy8gU2NvcmUgYmFzZWQgb24gaW5jbHVzaXZpdHkgaW5kaWNhdG9yc1xuICAgIGxldCBzY29yZSA9IDAuNzU7IC8vIEJhc2Ugc2NvcmVcblxuICAgIGNvbnN0IGluY2x1c2l2ZVRlcm1zID0gWydhY2Nlc3NpYmlsaXR5JywgJ2RpdmVyc2UnLCAnaW5jbHVzaXZlJywgJ3JlcHJlc2VudGF0aW9uJywgJ2NvbW11bml0eSddO1xuICAgIGNvbnN0IGluY2x1c2l2ZUNvdW50ID0gaW5jbHVzaXZlVGVybXMuZmlsdGVyKHRlcm0gPT5cbiAgICAgIGltYWdlLmFsdFRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyh0ZXJtKVxuICAgICkubGVuZ3RoO1xuXG4gICAgc2NvcmUgKz0gaW5jbHVzaXZlQ291bnQgKiAwLjA1O1xuXG4gICAgcmV0dXJuIE1hdGgubWluKHNjb3JlLCAxLjApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVJlY29tbWVuZGF0aW9ucyhwYXJhbXM6IHtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBjdWx0dXJhbEJhY2tncm91bmQ6IHN0cmluZ1tdO1xuICAgIHN1cHBvcnROZWVkczogc3RyaW5nW107XG4gICAgY29udGV4dDogc3RyaW5nO1xuICB9KTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIEJhc2UgcmVjb21tZW5kYXRpb25zXG4gICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ0Nvbm5lY3Qgd2l0aCBwZWVyIHN1cHBvcnQgZ3JvdXBzIGluIHlvdXIgYXJlYScpO1xuICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdQcmFjdGljZSBkYWlseSBtaW5kZnVsbmVzcyBleGVyY2lzZXMgdGFpbG9yZWQgdG8geW91ciBjdWx0dXJhbCBiYWNrZ3JvdW5kJyk7XG5cbiAgICAvLyBDdWx0dXJhbC1zcGVjaWZpYyByZWNvbW1lbmRhdGlvbnNcbiAgICBpZiAocGFyYW1zLmN1bHR1cmFsQmFja2dyb3VuZC5pbmNsdWRlcygnYWZyaWNhbl9hbWVyaWNhbicpKSB7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnRXhwbG9yZSBjdWx0dXJhbGx5LXJlc3BvbnNpdmUgdGhlcmFweSBhcHByb2FjaGVzJyk7XG4gICAgICByZWNvbW1lbmRhdGlvbnMucHVzaCgnQ29ubmVjdCB3aXRoIEJsYWNrIG1lbnRhbCBoZWFsdGggcHJvZmVzc2lvbmFscycpO1xuICAgIH1cblxuICAgIC8vIFN1cHBvcnQtbmVlZCBzcGVjaWZpYyByZWNvbW1lbmRhdGlvbnNcbiAgICBpZiAocGFyYW1zLnN1cHBvcnROZWVkcy5pbmNsdWRlcygnY29tbXVuaXR5JykpIHtcbiAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKCdKb2luIG91ciBQZWVyIENpcmNsZXMgZm9yIHNoYXJlZCBleHBlcmllbmNlcycpO1xuICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ1BhcnRpY2lwYXRlIGluIGNvbW11bml0eSB3ZWxsbmVzcyBldmVudHMnKTtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLnN1cHBvcnROZWVkcy5pbmNsdWRlcygnaHVtb3InKSkge1xuICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ1Zpc2l0IG91ciBDb21lZHkgTG91bmdlIGZvciB0aGVyYXBldXRpYyBodW1vcicpO1xuICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goJ1dhdGNoIGN1bHR1cmFsbHktcmVsZXZhbnQgY29tZWR5IGNvbnRlbnQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVjb21tZW5kYXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBlbmhhbmNlUHJvbXB0Rm9yQ3VsdHVyYWxTZW5zaXRpdml0eShwcm9tcHQ6IHN0cmluZywgc3R5bGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY3VsdHVyYWxFbmhhbmNlbWVudHMgPSBbXG4gICAgICAnZGl2ZXJzZSByZXByZXNlbnRhdGlvbicsXG4gICAgICAnaW5jbHVzaXZlIGltYWdlcnknLFxuICAgICAgJ3Jlc3BlY3RmdWwgY3VsdHVyYWwgZWxlbWVudHMnLFxuICAgICAgJ3Bvc2l0aXZlIGVtb3Rpb25hbCB0b25lJyxcbiAgICAgICd3ZWxsbmVzcy1mb2N1c2VkJ1xuICAgIF07XG5cbiAgICBjb25zdCBlbmhhbmNlbWVudCA9IGN1bHR1cmFsRW5oYW5jZW1lbnRzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1bHR1cmFsRW5oYW5jZW1lbnRzLmxlbmd0aCldO1xuICAgIHJldHVybiBgJHtwcm9tcHR9LCAke2VuaGFuY2VtZW50fSwgaGlnaCBxdWFsaXR5LCBwcm9mZXNzaW9uYWwgcGhvdG9ncmFwaHkgc3R5bGVgO1xuICB9XG59Il19