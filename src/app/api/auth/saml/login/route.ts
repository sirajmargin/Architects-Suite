import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // SAML disabled for testing
  return NextResponse.json(
    { error: 'SAML authentication is disabled' },
    { status: 503 }
  );
}