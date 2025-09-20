import { NextRequest, NextResponse } from 'next/server';
import { ZajiEngine } from '@/lib/zaji-engine';

const engine = ZajiEngine.createDefault();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      userId = 'anonymous_user',
      context = '',
      culturalContext = {},
      maxTokens = 1000,
      temperature = 0.7
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate response using Zaji's Bedrock integration
    const response = await engine.generateResponse({
      prompt,
      context,
      culturalContext,
      maxTokens,
      temperature,
      userId
    });

    // Record the interaction
    await engine.recordEvent({
      userId,
      eventType: 'interaction',
      name: 'zaji:chat',
      data: { 
        prompt: prompt.substring(0, 100), // Truncate for logging
        context,
        culturalContext,
        responseLength: response.length
      },
    });

    return NextResponse.json({
      success: true,
      response,
      metadata: {
        userId,
        timestamp: new Date().toISOString(),
        promptLength: prompt.length,
        responseLength: response.length,
        culturalContext: Object.keys(culturalContext).length > 0 ? culturalContext : undefined
      }
    });

  } catch (error) {
    console.error('Zaji chat error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Zaji Chat API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/zaji/chat',
      description: 'Send a chat prompt to Zaji'
    },
    example: {
      method: 'POST',
      body: {
        prompt: 'Hello, how can you help me with my wellness journey?',
        userId: 'user123',
        context: 'Graves disease management',
        culturalContext: {
          primaryCulture: 'African American',
          region: 'US'
        }
      }
    }
  });
}
