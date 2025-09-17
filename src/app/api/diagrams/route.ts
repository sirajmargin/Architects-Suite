import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // In a real app, get user ID from session/auth
    const userId = 'temp-user-id'; // Replace with actual user ID from auth
    
    // Get user's diagrams
    const diagrams = await prisma.diagram.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20, // Limit to 20 most recent
    });

    return NextResponse.json({
      success: true,
      data: diagrams,
    });
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch diagrams',
    }, { status: 500 });
  }
}