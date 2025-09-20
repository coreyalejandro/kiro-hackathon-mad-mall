import { NextRequest, NextResponse } from 'next/server';
import { ZajiEngine } from '@/lib/zaji-engine';

const engine = ZajiEngine.createDefault();

// In-memory store for approved images (in production, use database)
let approvedImages: Array<{
  id: string;
  url: string;
  altText: string;
  prompt: string;
  category: string;
  approvedAt: string;
  approvedBy: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, altText, prompt, category } = await req.json();

    // Validate the image first
    const validation = await engine.validateImageContent({
      url: imageUrl,
      altText,
      category
    });

    // Auto-approve if validation scores are high
    const isAutoApproved = validation.cultural >= 0.8 &&
                          validation.sensitivity >= 0.8 &&
                          validation.inclusivity >= 0.8;

    if (isAutoApproved) {
      const approvedImage = {
        id: `img_${Date.now()}`,
        url: imageUrl,
        altText,
        prompt,
        category,
        approvedAt: new Date().toISOString(),
        approvedBy: 'auto-approval-system'
      };

      approvedImages.push(approvedImage);

      await engine.recordEvent({
        userId: 'system',
        eventType: 'interaction',
        name: 'image:auto-approved',
        data: { imageId: approvedImage.id, category, validation }
      });

      return NextResponse.json({
        approved: true,
        image: approvedImage,
        validation,
        reason: 'Auto-approved based on high validation scores'
      });
    } else {
      return NextResponse.json({
        approved: false,
        validation,
        reason: 'Requires manual review',
        issues: validation.issues
      });
    }
  } catch (error) {
    console.error('Image approval failed:', error);
    return NextResponse.json({ error: 'Approval failed' }, { status: 500 });
  }
}

export async function GET() {
  // Return all approved images for use on the site
  return NextResponse.json({
    approvedImages,
    total: approvedImages.length
  });
}