'use client';

import React, { useState, useEffect } from 'react';
import { DiagramContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FastDiagramRenderer } from './FastDiagramRenderer';
import { DrawIORenderer } from './DrawIORenderer';
import { PPTViewer } from './PPTViewer';
import { PPTGenerator } from '@/lib/ppt-generator';
import { Brain, Code, Eye, Loader2, Sparkles, FileText, Presentation } from 'lucide-react';

interface CloudDiagramWithAIProps {
  onContentChange?: (content: DiagramContent) => void;
}

export function CloudDiagramWithAI({ onContentChange }: CloudDiagramWithAIProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [diagramContent, setDiagramContent] = useState<DiagramContent>({
    code: '',
    nodes: [],
    edges: [],
    layout: { direction: 'TB', spacing: 100, alignment: 'center' }
  });
  const [viewMode, setViewMode] = useState<'diagram' | 'drawio' | 'ppt' | 'code'>('diagram');
  const [pptData, setPptData] = useState<any>(null);

  useEffect(() => {
    // Check for AI generated content from session storage
    const aiContent = sessionStorage.getItem('aiGeneratedContent');
    if (aiContent) {
      try {
        const parsedContent = JSON.parse(aiContent);
        setDiagramContent(parsedContent);
        setGeneratedCode(parsedContent.code || '');
        
        // Generate PPT from loaded content
        if (parsedContent.visual?.services) {
          const urlParams = new URLSearchParams(window.location.search);
          const userPrompt = urlParams.get('prompt') || 'Architecture diagram';
          const ppt = PPTGenerator.generateArchitecturePPT(
            parsedContent.visual.services,
            userPrompt
          );
          setPptData(ppt);
          setViewMode('ppt');
        }
        
        sessionStorage.removeItem('aiGeneratedContent');
      } catch (error) {
        console.error('Failed to parse AI content:', error);
      }
    }
  }, []);

  const generateCloudDiagram = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${aiServiceUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const infraCode = generateMockCloudCode(prompt);
        const apiContent = result.content;
        
        // Combine API response with local infrastructure code
        const combinedContent = {
          ...apiContent,
          code: infraCode
        };
        
        setGeneratedCode(infraCode);
        setDiagramContent(combinedContent);
        
        if (onContentChange) {
          onContentChange(combinedContent);
        }
        
        // Generate PPT data via service
        if (result.content.visual?.services) {
          const pptServiceUrl = process.env.NEXT_PUBLIC_PPT_SERVICE_URL || 'http://localhost:3003';
          fetch(`${pptServiceUrl}/generate-ppt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ services: result.content.visual.services, prompt })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) setPptData(data.ppt);
          })
          .catch(console.error);
        }
        
        // Set default view to presentation
        setViewMode('ppt');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to generate diagram:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockCloudCode = (userPrompt: string): string => {
    // Mock AI-generated code based on prompt keywords
    if (userPrompt.toLowerCase().includes('microservice')) {
      return `# Microservices Architecture
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 8080`;
    }
    
    if (userPrompt.toLowerCase().includes('serverless')) {
      return `# Serverless Architecture
Resources:
  UserFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: UserFunction
      Runtime: nodejs18.x
      Handler: index.handler
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            return { statusCode: 200, body: 'Hello World' };
          };
  
  ApiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: UserAPI
      
  UserTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Users
      BillingMode: PAY_PER_REQUEST`;
    }
    
    return `# Cloud Infrastructure
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "main-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  
  tags = {
    Name = "public-subnet"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id
  
  tags = {
    Name = "web-server"
  }
}`;
  };

  const generateMockCloudContent = (userPrompt: string): DiagramContent => {
    const prompt_lower = userPrompt.toLowerCase();
    
    if (prompt_lower.includes('microservice')) {
      return {
        code: generateMockCloudCode(userPrompt),
        visual: {
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
        },
        nodes: [],
        edges: [],
        layout: { direction: 'LR', spacing: 150, alignment: 'center' }
      };
    }
    
    if (prompt_lower.includes('serverless')) {
      return {
        code: generateMockCloudCode(userPrompt),
        visual: {
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
        },
        nodes: [],
        edges: [],
        layout: { direction: 'LR', spacing: 200, alignment: 'center' }
      };
    }
    
    // Default architecture
    return {
      code: generateMockCloudCode(userPrompt),
      visual: {
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
      },
      nodes: [],
      edges: [],
      layout: { direction: 'LR', spacing: 200, alignment: 'center' }
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* AI Prompt Section */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Cloud Architecture Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your cloud architecture... (e.g., 'Create a microservices architecture with user and order services' or 'Design a serverless application with API Gateway and Lambda')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                generateCloudDiagram();
              }
            }}
            className="min-h-[100px] resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4" />
              AI will generate both infrastructure code and visual diagram
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Ctrl+Enter</span>
            </div>
            <Button 
              onClick={generateCloudDiagram}
              disabled={!prompt.trim() || isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Architecture
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      {(generatedCode || diagramContent.visual) && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={viewMode === 'diagram' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('diagram')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Diagram
          </Button>
          <Button
            variant={viewMode === 'drawio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('drawio')}
          >
            <Brain className="h-4 w-4 mr-1" />
            Draw.io
          </Button>
          <Button
            variant={viewMode === 'ppt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('ppt')}
          >
            <Presentation className="h-4 w-4 mr-1" />
            Presentation
          </Button>
          <Button
            variant={viewMode === 'code' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('code')}
          >
            <Code className="h-4 w-4 mr-1" />
            Code
          </Button>
        </div>
      )}

      {/* Content Display */}
      <div className="flex-1">
        {viewMode === 'diagram' && diagramContent.visual && (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Architecture Diagram</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)]">
              <FastDiagramRenderer
                type="cloud-architecture"
                content={diagramContent}
                width={800}
                height={500}
              />
            </CardContent>
          </Card>
        )}

        {viewMode === 'drawio' && diagramContent.visual?.services && (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Draw.io Format</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)]">
              <DrawIORenderer
                services={diagramContent.visual.services}
                width={800}
                height={500}
              />
            </CardContent>
          </Card>
        )}

        {viewMode === 'ppt' && pptData && (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Architecture Presentation</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)] p-0">
              <PPTViewer
                pptData={pptData}
                onTemplateUpload={(template) => {
                  if (diagramContent.visual?.services) {
                    const newPpt = PPTGenerator.generateArchitecturePPT(
                      diagramContent.visual.services,
                      prompt,
                      template
                    );
                    setPptData(newPpt);
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {viewMode === 'code' && generatedCode && (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Infrastructure Code</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)]">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto h-full text-sm font-mono">
                <code>{generatedCode}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {!generatedCode && !diagramContent.visual && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">AI-Powered Cloud Architecture</h3>
            <p className="text-sm max-w-md">
              Describe your cloud architecture requirements above and let AI generate both the infrastructure code and visual diagram for you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}