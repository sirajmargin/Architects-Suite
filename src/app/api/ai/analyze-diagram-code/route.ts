import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    analysis: {
      isValid: true,
      suggestions: [],
      errors: []
    }
  });
}