import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return mock stats immediately
  const stats = {
    totalDiagrams: 12,
    totalUsers: 5,
    diagramsThisMonth: 8,
    activeCollaborations: 3,
    recentActivity: [
      { id: '1', action: 'Created diagram', timestamp: new Date().toISOString() },
      { id: '2', action: 'Updated diagram', timestamp: new Date().toISOString() }
    ]
  };

  return NextResponse.json({
    success: true,
    stats
  });
}