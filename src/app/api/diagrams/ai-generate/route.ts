import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, diagramType = 'flowchart', complexity = 'medium' } = await request.json();

    // Mock AI-generated diagram content
    const mockDiagrams = {
      flowchart: `flowchart TD
    A[${prompt || 'Start'}] --> B{Decision Point}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End Result]
    D --> E`,
      
      sequence: `sequenceDiagram
    participant User
    participant System
    participant Database
    User->>System: ${prompt || 'Request'}
    System->>Database: Query Data
    Database-->>System: Return Results
    System-->>User: Response`,
      
      erd: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ITEM : contains
    USER {
        string name
        string email
    }
    ORDER {
        int id
        date created
    }`,
      
      uml: `classDiagram
    class ${prompt?.replace(/\s+/g, '') || 'System'} {
        +String name
        +process()
        +validate()
    }`
    };

    const generatedCode = mockDiagrams[diagramType as keyof typeof mockDiagrams] || mockDiagrams.flowchart;

    return NextResponse.json({
      success: true,
      content: {
        code: generatedCode,
        nodes: [],
        edges: [],
        layout: { direction: 'TB', spacing: 100, alignment: 'center' }
      },
      metadata: {
        prompt,
        diagramType,
        complexity,
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