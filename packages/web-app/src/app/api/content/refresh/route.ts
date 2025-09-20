import { NextRequest, NextResponse } from 'next/server';
import { syntheticContentService } from '@/lib/synthetic-content-service';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    
    if (type) {
      // Reset specific content type
      syntheticContentService.resetUsedContent(type);
      return NextResponse.json({ 
        success: true, 
        message: `Reset used content for type: ${type}`,
        stats: syntheticContentService.getContentStats()
      });
    } else {
      // Reset all content
      syntheticContentService.clearCache();
      return NextResponse.json({ 
        success: true, 
        message: 'Reset all used content',
        stats: syntheticContentService.getContentStats()
      });
    }
  } catch (error) {
    console.error('Error refreshing content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh content' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = syntheticContentService.getContentStats();
    return NextResponse.json({ 
      success: true, 
      stats,
      message: 'Content generation statistics'
    });
  } catch (error) {
    console.error('Error getting content stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get content stats' },
      { status: 500 }
    );
  }
}
