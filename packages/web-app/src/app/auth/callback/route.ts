import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Amplify handles tokens client-side after redirect; we can just route users home
  const url = new URL(request.url);
  const redirect = url.searchParams.get('redirect') || '/';
  return NextResponse.redirect(new URL(redirect, url.origin));
}

