import { NextResponse } from 'next/server';

// In-memory store for notification preferences
let preferences = {
  email: true,
  sms: false
};

export async function GET() {
  return NextResponse.json(preferences);
}

export async function PUT(request: Request) {
  const data = await request.json();
  preferences = { ...preferences, ...data };
  return NextResponse.json(preferences);
}
