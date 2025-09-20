import { NextRequest, NextResponse } from 'next/server';
import { ZajiEngine } from '@/lib/zaji-engine';

const engine = ZajiEngine.createDefault();

// Pre-defined prompts for different site sections
const siteImagePrompts = {
  concourse: [
    "African American women having a supportive conversation in a community center",
    "Black women friends sharing stories and laughing together",
    "African American women in wellness support group meeting in a circle",
    "Black women of different ages connecting over coffee and conversation"
  ],
  circles: [
    "African American women peer support group sitting in a circle",
    "Black women supporting each other in group therapy session",
    "African American women mental health support circle with caring facilitator",
    "Black women community healing circle sharing experiences"
  ],
  comedy: [
    "African American woman comedian performing therapeutic comedy for women audience",
    "Black women laughter therapy session with joyful participants",
    "African American women enjoying comedy in supportive atmosphere",
    "Black women healing through laughter workshop with community members"
  ],
  stories: [
    "African American woman sharing her personal story to attentive women audience",
    "Black woman storyteller connecting with diverse women community",
    "African American women narrative therapy session with participants",
    "Black women story sharing circle promoting healing and connection"
  ],
  marketplace: [
    "African American women vendors at wellness marketplace selling healing products",
    "Black women entrepreneurs showcasing mental health resources",
    "African American women at community wellness fair with businesses",
    "Black women displaying holistic healing products as business owners"
  ],
  resources: [
    "African American woman reading a health article on a tablet in a calm environment",
    "Black women browsing wellness resources together in a bright library space",
    "African American woman learning mindfulness from a digital guide at home",
    "Black woman researching mental health information on a laptop with notes"
  ],
  auth: [
    "African American woman smiling while using a secure login screen on a phone",
    "Black woman creating an account on a laptop in a cozy workspace",
    "African American woman confidently signing in to a community app",
    "Black woman verifying account details with a friendly UI"
  ],
  profile: [
    "African American woman customizing her profile on a laptop in a warm, bright room",
    "Black woman updating account settings on a tablet with a calm smile",
    "African American woman reviewing notifications on a mobile app in a cozy space",
    "Black woman managing her profile in a friendly, modern UI"
  ],
  article: [
    "Close-up of an African American woman reading a wellness article on a tablet",
    "Black woman highlighting notes from a digital mental health article",
    "African American woman focused on learning from an online resource with tea",
    "Black woman studying a health article on a laptop at a tidy desk"
  ]
};

export async function POST(req: NextRequest) {
  try {
    const { section, count = 1 } = await req.json();

    if (!siteImagePrompts[section as keyof typeof siteImagePrompts]) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const prompts = siteImagePrompts[section as keyof typeof siteImagePrompts];
    const results = [];

    for (let i = 0; i < Math.min(count, prompts.length); i++) {
      const prompt = prompts[i];

      // Generate image
      const generatedImage = await engine.generateImage(prompt, 'culturally-sensitive');

      // Auto-approve the image through the approval workflow
      const approvalResponse = await fetch(`${req.nextUrl.origin}/api/images/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage.url,
          altText: generatedImage.altText,
          prompt: prompt,
          category: section
        })
      });

      const approvalData = await approvalResponse.json();

      results.push({
        prompt,
        generated: generatedImage,
        approval: approvalData
      });

      // Record event
      await engine.recordEvent({
        userId: 'system',
        eventType: 'interaction',
        name: 'site-image:generated',
        data: { section, prompt, approved: approvalData.approved }
      });
    }

    return NextResponse.json({
      section,
      results,
      summary: {
        total: results.length,
        approved: results.filter(r => r.approval.approved).length
      }
    });

  } catch (error) {
    console.error('Site image generation failed:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

// Get pre-generated images for a section
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const section = url.searchParams.get('section');

  // Get approved images from the approval API
  const approvedResponse = await fetch(`${req.nextUrl.origin}/api/images/approve`);
  const { approvedImages } = await approvedResponse.json();

  // Filter by section if specified
  const sectionImages = section
    ? approvedImages.filter((img: any) => img.category === section)
    : approvedImages;

  return NextResponse.json({
    section: section || 'all',
    images: sectionImages,
    count: sectionImages.length
  });
}
