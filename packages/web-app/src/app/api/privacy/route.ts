import { NextResponse } from 'next/server';
import { TitanEngine } from '@/lib/titan-engine';

const engine = TitanEngine.createDefault();

// In-memory store for privacy settings
let settings = {
  visibility: 'public',
};

export async function GET() {
  await engine.recordEvent({ userId: 'demo_user', eventType: 'page', name: 'privacy:get' });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const data = await request.json();
  settings = { ...settings, ...data };
  await engine.recordEvent({ userId: 'demo_user', eventType: 'interaction', name: 'privacy:update', data });
  return NextResponse.json(settings);
}
