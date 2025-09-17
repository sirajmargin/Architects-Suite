import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, content, isPublic } = body;
    
    // In a real app, get user ID from session/auth
    const userId = 'temp-user-id'; // Replace with actual user ID from auth
    
    // Create diagram in database
    const diagram = await prisma.diagram.create({
      data: {
        title: title || `New ${type} Diagram`,
        type: type.toUpperCase(),
        content: content || {},
        metadata: {
          aiGenerated: false,
          version: 1,
          tags: [],
          category: type
        },
        permissions: {
          read: [userId],
          write: [userId],
          admin: [userId],
          public: isPublic || false
        },
        isPublic: isPublic || false,
        organizationId: 'temp-org-id', // Replace with actual org ID
        createdBy: userId
      }
    });

    // Create initial version
    await prisma.diagramVersion.create({
      data: {
        diagramId: diagram.id,
        version: 1,
        content: content || {},
        message: 'Initial creation',
        createdBy: userId
      }
    });

    return NextResponse.json({
      success: true,
      diagramId: diagram.id,
      message: 'Diagram created successfully'
    });
  } catch (error) {
    console.error('Error creating diagram:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create diagram'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = 'temp-user-id'; // Replace with actual user ID from auth
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const whereClause: any = {
      createdBy: userId
    };
    
    if (type) {
      whereClause.type = type.toUpperCase();
    }
    
    const diagrams = await prisma.diagram.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: diagrams
    });
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch diagrams'
    }, { status: 500 });
  }
}