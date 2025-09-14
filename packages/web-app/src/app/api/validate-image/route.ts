import { NextRequest, NextResponse } from 'next/server';
import { TitanEngine } from '@madmall/titanengine';

const engine = TitanEngine.createDefault();

export async function POST(req: NextRequest) {
  const { url, altText, category } = await req.json();
  if (!url || !altText || !category) {
    return NextResponse.json({ error: 'url, altText and category are required' }, { status: 400 });
  }
  const result = await engine.validateImageContent({ url, altText, category });
  await engine.recordEvent({
    userId: 'demo_user',
    eventType: 'interaction',
    name: 'validate-image',
    data: { category },
  });
  return NextResponse.json(result);
}
