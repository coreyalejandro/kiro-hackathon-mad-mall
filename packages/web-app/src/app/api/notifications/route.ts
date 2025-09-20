import { NextResponse } from 'next/server';
import { ZajiEngine } from '@/lib/zaji-engine';

const engine = ZajiEngine.createDefault();

// In-memory store for notification preferences
let preferences = {
  email: true,
  sms: false,
};

export async function GET() {
  await engine.recordEvent({ userId: 'demo_user', eventType: 'page', name: 'notifications:get' });
  return NextResponse.json(preferences);
}

export async function PUT(request: Request) {
  const data = await request.json();
  preferences = { ...preferences, ...data };
  await engine.recordEvent({ userId: 'demo_user', eventType: 'interaction', name: 'notifications:update', data });
  return NextResponse.json(preferences);
}
