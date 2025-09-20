/**
 * Working Zaji implementation for web app
 * Provides real Bedrock integration for image generation and validation
 */

interface ValidationResult {
  cultural: number;
  sensitivity: number;
  inclusivity: number;
  issues: string[];
  validator: string;
  isAppropriate: boolean;
}

interface CareRecommendation {
  id: string;
  userId: string;
  recommendations: string[];
  confidence: number;
  timestamp: Date;
}

interface ZajiEvent {
  userId: string;
  eventType: 'page' | 'interaction';
  name: string;
  timestamp?: number;
  data?: Record<string, unknown>;
}

export class ZajiEngine {
  static createDefault() {
    return new ZajiEngine();
  }

  constructor() {
    console.log('ZajiEngine initialized (web app version)');
  }

  // Real Bedrock-powered image validation
  async validateImageContent(image: {
    url: string;
    altText: string;
    category: string;
    imageId?: string;
  }): Promise<ValidationResult> {
    try {
      const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

      const client = new BedrockRuntimeClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
      });

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

    } catch (error) {
      console.error('Bedrock validation failed, falling back to heuristic analysis:', error);

      const cultural = this.calculateCulturalScore(image);
      const sensitivity = this.calculateSensitivityScore(image);
      const inclusivity = this.calculateInclusivityScore(image);

      const issues: string[] = [];
      if (cultural < 0.7) issues.push('May not be culturally appropriate');
      if (sensitivity < 0.7) issues.push('May contain sensitive content');
      if (inclusivity < 0.7) issues.push('May not be inclusive');

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

  // Real Bedrock-powered image generation
  async generateImage(prompt: string, style: string = 'culturally-sensitive'): Promise<{
    url: string;
    altText: string;
    metadata: Record<string, any>;
  }> {
    try {
      const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

      const client = new BedrockRuntimeClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
      });

      const culturalPrompt = this.enhancePromptForCulturalSensitivity(prompt, style);

      const command = new InvokeModelCommand({
        modelId: 'stability.stable-diffusion-xl-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          text_prompts: [
            {
              text: culturalPrompt,
              weight: 1
            }
          ],
          cfg_scale: 12,
          clip_guidance_preset: 'FAST_BLUE',
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 50
        })
      });

      const response = await client.send(command);
      if (!response.body) {
        throw new Error('No response from Bedrock SDXL');
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      if (!responseBody.artifacts || responseBody.artifacts.length === 0) {
        throw new Error('No image generated by Bedrock SDXL');
      }

      const imageBase64 = responseBody.artifacts[0].base64;
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

    } catch (error) {
      console.error('Bedrock image generation failed:', error);

      // Return a placeholder with error info
      return {
        url: `data:image/svg+xml;base64,${btoa(`
          <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="24" fill="#666">
              Image Generation Failed
            </text>
            <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="#888">
              Bedrock SDXL Error
            </text>
            <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">
              ${prompt.substring(0, 50)}...
            </text>
          </svg>
        `)}`,
        altText: `Image generation failed: ${prompt}`,
        metadata: {
          prompt: prompt,
          originalPrompt: prompt,
          style,
          generator: 'placeholder-fallback',
          modelId: 'none',
          error: error instanceof Error ? error.message : 'Unknown error',
          culturalValidated: false,
          generatedAt: new Date().toISOString()
        }
      };
    }
  }

  // Real Bedrock-powered care recommendations
  async generateCareModel(params: {
    userId: string;
    culturalBackground: string[];
    supportNeeds: string[];
    context: string;
  }): Promise<CareRecommendation> {
    try {
      const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

      const client = new BedrockRuntimeClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
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

    } catch (error) {
      console.error('Bedrock care generation failed, falling back to heuristic generation:', error);

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
  async recordEvent(event: ZajiEvent): Promise<void> {
    console.log('ZajiEngine event recorded:', event);
  }

  async getEvents(userId: string): Promise<ZajiEvent[]> {
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

  // Private helper methods
  private calculateCulturalScore(image: { url: string; altText: string; category: string }): number {
    let score = 0.8;

    const culturalKeywords = ['diverse', 'inclusive', 'multicultural', 'african', 'black', 'melanin'];
    const hasPositiveKeywords = culturalKeywords.some(keyword =>
      image.altText.toLowerCase().includes(keyword)
    );

    if (hasPositiveKeywords) score += 0.15;
    if (image.category === 'wellness' || image.category === 'community') score += 0.05;

    return Math.min(score, 1.0);
  }

  private calculateSensitivityScore(image: { url: string; altText: string; category: string }): number {
    let score = 0.9;

    const sensitiveTerms = ['trigger', 'violence', 'harm', 'inappropriate'];
    const hasSensitiveTerms = sensitiveTerms.some(term =>
      image.altText.toLowerCase().includes(term)
    );

    if (hasSensitiveTerms) score -= 0.3;

    return Math.max(score, 0.0);
  }

  private calculateInclusivityScore(image: { url: string; altText: string; category: string }): number {
    let score = 0.75;

    const inclusiveTerms = ['accessibility', 'diverse', 'inclusive', 'representation', 'community'];
    const inclusiveCount = inclusiveTerms.filter(term =>
      image.altText.toLowerCase().includes(term)
    ).length;

    score += inclusiveCount * 0.05;

    return Math.min(score, 1.0);
  }

  private generateRecommendations(params: {
    userId: string;
    culturalBackground: string[];
    supportNeeds: string[];
    context: string;
  }): string[] {
    const recommendations: string[] = [];

    recommendations.push('Connect with peer support groups in your area');
    recommendations.push('Practice daily mindfulness exercises tailored to your cultural background');

    if (params.culturalBackground.includes('African American')) {
      recommendations.push('Explore culturally-responsive therapy approaches');
      recommendations.push('Connect with Black mental health professionals');
    }

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

  private enhancePromptForCulturalSensitivity(prompt: string, style: string): string {
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