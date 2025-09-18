import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { prompt, diagramType = 'cloud-architecture' } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await AIService.generateArchitecture(prompt);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: {
        code: result.content?.code,
        visual: result.content?.visual,
        nodes: [],
        edges: []
      },
      metadata: {
        prompt,
        diagramType,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate diagram' },
      { status: 500 }
    );
  }
}