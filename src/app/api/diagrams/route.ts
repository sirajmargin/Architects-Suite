import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock diagrams data for testing
    const mockDiagrams = [
      {
        id: '1',
        title: 'User Authentication Flow',
        type: 'flowchart',
        description: 'Login and registration process',
        lastModified: new Date('2024-01-15'),
        isStarred: true,
        isShared: false,
        collaborators: 2
      },
      {
        id: '2', 
        title: 'Database Schema',
        type: 'erd',
        description: 'Main application database structure',
        lastModified: new Date('2024-01-10'),
        isStarred: false,
        isShared: true,
        collaborators: 5
      },
      {
        id: '3',
        title: 'API Sequence',
        type: 'sequence',
        description: 'REST API interaction flow',
        lastModified: new Date('2024-01-08'),
        isStarred: false,
        isShared: false,
        collaborators: 1
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockDiagrams,
    });
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch diagrams',
    }, { status: 500 });
  }
}