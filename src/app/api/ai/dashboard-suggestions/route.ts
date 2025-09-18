import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const suggestions = [
    { id: '1', title: 'Create Cloud Architecture', type: 'cloud-architecture' },
    { id: '2', title: 'Design API Flow', type: 'sequence' }
  ];

  return NextResponse.json({
    success: true,
    suggestions
  });
}