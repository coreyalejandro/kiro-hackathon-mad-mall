import { NextResponse } from 'next/server';
import { TitanEngine } from '@/lib/titan-engine';

const engine = TitanEngine.createDefault();

// In-memory store for mock profile data
let profile = {
  firstName: 'Jane',
  lastName: 'Doe',
  bio: '',
};

export async function GET() {
  await engine.recordEvent({ userId: 'demo_user', eventType: 'page', name: 'profile:get' });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const data = await request.json();
  profile = { ...profile, ...data };
  await engine.recordEvent({ userId: 'demo_user', eventType: 'interaction', name: 'profile:update', data });
  return NextResponse.json(profile);
}
