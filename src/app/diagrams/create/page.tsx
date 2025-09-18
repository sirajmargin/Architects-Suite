'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loading';
import { DiagramType, DiagramContent } from '@/types';
import { 
  Code, 
  Eye, 
  Split, 
  Save,
  Brain
} from 'lucide-react';

// Fast components for immediate loading
import { FastDiagramRenderer } from '@/components/diagrams/FastDiagramRenderer';

// Lazy load only when needed
const CloudDiagramWithAI = lazy(() => import('@/components/diagrams/CloudDiagramWithAI').then(m => ({ default: m.CloudDiagramWithAI })));

function DiagramCreateContent() {
  const searchParams = useSearchParams();
  const diagramType = (searchParams.get('type') as DiagramType) || 'flowchart';
  const aiEnabled = searchParams.get('ai') === 'true';

  const [content, setContent] = useState<DiagramContent>(() => ({
    code: diagramType === 'cloud-architecture' ? '' : getDefaultCode(diagramType),
    nodes: [],
    edges: [],
    layout: { direction: 'TB', spacing: 100, alignment: 'center' }
  }));
  
  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const handleContentChange = (newContent: DiagramContent) => {
    setContent(newContent);
  };

  const handleSave = async (codeContent: string) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/diagrams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New ${diagramType}`,
          type: diagramType,
          content: { ...content, code: codeContent },
          isPublic: false
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.href = `/diagrams/${result.diagramId}`;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save diagram. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = (codeContent: string) => {
    setContent(prev => ({ ...prev, code: codeContent }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Create {diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram
              </h1>
              
              {diagramType === 'cloud-architecture' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Enhanced
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {diagramType !== 'cloud-architecture' && (
                <div className="flex rounded-lg border border-gray-300 p-1">
                  <Button
                    variant={viewMode === 'code' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('code')}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Code
                  </Button>
                  <Button
                    variant={viewMode === 'split' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('split')}
                  >
                    <Split className="h-4 w-4 mr-1" />
                    Split
                  </Button>
                  <Button
                    variant={viewMode === 'preview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              )}

              <Button disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <Suspense fallback={<PageLoader />}>
          {diagramType === 'cloud-architecture' ? (
            <div className="flex-1 p-4">
              <CloudDiagramWithAI onContentChange={handleContentChange} />
            </div>
          ) : (
            <div className="flex-1 flex">
              {(viewMode === 'code' || viewMode === 'split') && (
                <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-200`}>
                  <div className="h-full p-4">
                    <textarea
                      className="w-full h-full border rounded p-4 font-mono text-sm resize-none"
                      value={content.code}
                      onChange={(e) => setContent(prev => ({ ...prev, code: e.target.value }))}
                      placeholder={`Enter ${diagramType} code here...`}
                    />
                  </div>
                </div>
              )}

              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-white`}>
                  <div className="h-full p-4">
                    <FastDiagramRenderer
                      type={diagramType}
                      content={content}
                      width={viewMode === 'split' ? 600 : 800}
                      height={600}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default function DiagramCreatePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DiagramCreateContent />
    </Suspense>
  );
}

const defaultCodes = {
  flowchart: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
  sequence: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great, thanks for asking!`,
  erd: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`,
  uml: `classDiagram
    class User {
        +String name
        +login()
    }`,
  'cloud-architecture': `graph TD
    A[User] --> B[Load Balancer]
    B --> C[Web Server]
    C --> D[Database]`
};

function getDefaultCode(type: DiagramType): string {
  return defaultCodes[type] || '// Start creating your diagram here...';
}