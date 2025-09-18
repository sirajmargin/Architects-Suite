import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock dashboard statistics for testing
    const stats = {
      totalDiagrams: 12,
      sharedDiagrams: 5,
      collaborators: 8,
      aiGeneratedDiagrams: 3
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
    }, { status: 500 });
  }
}