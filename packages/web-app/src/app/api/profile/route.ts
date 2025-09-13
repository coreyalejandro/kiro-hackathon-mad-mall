import { NextResponse } from 'next/server';

// In-memory store for mock profile data
let profile = {
  firstName: 'Jane',
  lastName: 'Doe',
  bio: ''
};

export async function GET() {
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const data = await request.json();
  profile = { ...profile, ...data };
  return NextResponse.json(profile);
}
