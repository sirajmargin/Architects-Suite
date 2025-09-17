import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // In a real app, get user ID from session/auth
    const userId = 'temp-user-id'; // Replace with actual user ID from auth
    
    // Get dashboard statistics
    const [
      totalDiagrams,
      sharedDiagrams,
      collaborators,
      aiGeneratedDiagrams
    ] = await Promise.all([
      // Total diagrams count
      prisma.diagram.count({
        where: { createdBy: userId }
      }),
      
      // Shared diagrams count  
      prisma.diagram.count({
        where: { 
          createdBy: userId,
          isPublic: true 
        }
      }),
      
      // Unique collaborators count
      prisma.collaborationSession.groupBy({
        by: ['userId'],
        where: {
          diagram: {
            createdBy: userId
          }
        }
      }).then(sessions => sessions.length),
      
      // AI generated diagrams (mock data for now)
      prisma.diagram.count({
        where: { 
          createdBy: userId,
          metadata: {
            path: ['aiGenerated'],
            equals: true
          }
        }
      })
    ]);

    const stats = {
      totalDiagrams,
      sharedDiagrams,
      collaborators,
      aiGeneratedDiagrams
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