import { NextRequest, NextResponse } from 'next/server';

// Mock data for fast response
const mockDiagrams = [
  {
    id: '1',
    title: 'Sample Flowchart',
    type: 'flowchart',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false
  },
  {
    id: '2', 
    title: 'Sample Cloud Architecture',
    type: 'cloud-architecture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false
  }
];

export async function GET(request: NextRequest) {
  // Simulate fast response
  return NextResponse.json({
    success: true,
    diagrams: mockDiagrams,
    total: mockDiagrams.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newDiagram = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      diagram: newDiagram
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create diagram' },
      { status: 500 }
    );
  }
}