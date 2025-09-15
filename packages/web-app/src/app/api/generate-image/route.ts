import { NextRequest, NextResponse } from 'next/server';
import { TitanEngine } from '@/lib/titan-engine';

const engine = TitanEngine.createDefault();

export async function POST(req: NextRequest) {
  try {
    const { prompt, style = 'culturally-sensitive' } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating image with TitanEngine:', { prompt, style });

    const result = await engine.generateImage(prompt, style);

    return NextResponse.json({
      success: true,
      image: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}