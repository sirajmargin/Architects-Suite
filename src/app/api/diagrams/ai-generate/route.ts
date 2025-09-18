import { NextRequest, NextResponse } from 'next/server';

function generateCloudServices(prompt: string) {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('microservice')) {
    return {
      services: [
        {
          id: 'user',
          name: 'User',
          type: 'compute',
          provider: 'generic',
          position: { x: 50, y: 200 },
          icon: '👤',
          connections: ['gateway']
        },
        {
          id: 'gateway',
          name: 'API Gateway',
          type: 'network',
          provider: 'aws',
          position: { x: 200, y: 200 },
          icon: '🚪',
          connections: ['user-service', 'order-service']
        },
        {
          id: 'user-service',
          name: 'User Service',
          type: 'compute',
          provider: 'aws',
          position: { x: 400, y: 150 },
          icon: '⚙️',
          connections: ['user-db']
        },
        {
          id: 'order-service',
          name: 'Order Service',
          type: 'compute',
          provider: 'aws',
          position: { x: 400, y: 250 },
          icon: '⚙️',
          connections: ['order-db']
        },
        {
          id: 'user-db',
          name: 'User Database',
          type: 'database',
          provider: 'aws',
          position: { x: 600, y: 150 },
          icon: '🗄️',
          connections: []
        },
        {
          id: 'order-db',
          name: 'Order Database',
          type: 'database',
          provider: 'aws',
          position: { x: 600, y: 250 },
          icon: '🗄️',
          connections: []
        }
      ]
    };
  }
  
  if (promptLower.includes('serverless')) {
    return {
      services: [
        {
          id: 'user',
          name: 'User',
          type: 'compute',
          provider: 'generic',
          position: { x: 50, y: 200 },
          icon: '👤',
          connections: ['api-gateway']
        },
        {
          id: 'api-gateway',
          name: 'API Gateway',
          type: 'network',
          provider: 'aws',
          position: { x: 250, y: 200 },
          icon: '🚪',
          connections: ['lambda']
        },
        {
          id: 'lambda',
          name: 'Lambda Function',
          type: 'compute',
          provider: 'aws',
          position: { x: 450, y: 200 },
          icon: 'λ',
          connections: ['dynamodb']
        },
        {
          id: 'dynamodb',
          name: 'DynamoDB',
          type: 'database',
          provider: 'aws',
          position: { x: 650, y: 200 },
          icon: '🗄️',
          connections: []
        }
      ]
    };
  }
  
  // Default architecture
  return {
    services: [
      {
        id: 'user',
        name: 'User',
        type: 'compute',
        provider: 'generic',
        position: { x: 50, y: 200 },
        icon: '👤',
        connections: ['alb']
      },
      {
        id: 'alb',
        name: 'Load Balancer',
        type: 'network',
        provider: 'aws',
        position: { x: 250, y: 200 },
        icon: '⚖️',
        connections: ['web']
      },
      {
        id: 'web',
        name: 'Web Server',
        type: 'compute',
        provider: 'aws',
        position: { x: 450, y: 200 },
        icon: '🖥️',
        connections: ['db']
      },
      {
        id: 'db',
        name: 'Database',
        type: 'database',
        provider: 'aws',
        position: { x: 650, y: 200 },
        icon: '🗄️',
        connections: []
      }
    ]
  };
}

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
    }`,
      
      'cloud-architecture': `graph TD
    User[👤 User] --> ALB[⚖️ Load Balancer]
    ALB --> Web1[🖥️ Web Server 1]
    ALB --> Web2[🖥️ Web Server 2]
    Web1 --> API[🚪 API Gateway]
    Web2 --> API
    API --> Lambda[λ Lambda]
    Lambda --> DB[🗄️ Database]
    Lambda --> S3[🪣 S3 Storage]`
    };

    const generatedCode = mockDiagrams[diagramType as keyof typeof mockDiagrams] || mockDiagrams.flowchart;

    // Generate visual content for cloud architecture
    let visualContent = null;
    if (diagramType === 'cloud-architecture') {
      visualContent = generateCloudServices(prompt);
    }

    return NextResponse.json({
      success: true,
      content: {
        code: generatedCode,
        visual: visualContent,
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