import { NextResponse } from 'next/server';

// In-memory store for privacy settings
let settings = {
  visibility: 'public'
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const data = await request.json();
  settings = { ...settings, ...data };
  return NextResponse.json(settings);
}
