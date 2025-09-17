'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DiagramType, DiagramContent } from '@/types';
import { MermaidRenderer } from './renderers/MermaidRenderer';
import { FlowchartRenderer } from './renderers/FlowchartRenderer';
import { ERDRenderer } from './renderers/ERDRenderer';
import { SequenceRenderer } from './renderers/SequenceRenderer';
import { UMLRenderer } from './renderers/UMLRenderer';
import { CloudArchitectureRenderer } from './renderers/CloudArchitectureRenderer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Share2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface DiagramRendererProps {
  type: DiagramType;
  content: DiagramContent;
  width?: number;
  height?: number;
  readonly?: boolean;
  onContentChange?: (content: DiagramContent) => void;
  onError?: (error: string) => void;
}

export function DiagramRenderer({
  type,
  content,
  width = 800,
  height = 600,
  readonly = true,
  onContentChange,
  onError
}: DiagramRendererProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderDiagram();
  }, [type, content]);

  const renderDiagram = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate content based on diagram type
      const validationResult = await validateDiagramContent(type, content);
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
      setError(errorMessage);
      setIsLoading(false);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const validateDiagramContent = async (diagramType: DiagramType, diagramContent: DiagramContent) => {
    // Basic validation - in production, this would be more comprehensive
    if (!diagramContent.code && !diagramContent.nodes && !diagramContent.visual) {
      return {
        isValid: false,
        error: 'No diagram content provided'
      };
    }

    // Type-specific validation
    switch (diagramType) {
      case 'flowchart':
        if (diagramContent.code && !diagramContent.code.includes('flowchart')) {
          return {
            isValid: false,
            error: 'Flowchart must start with "flowchart" declaration'
          };
        }
        break;
      
      case 'sequence':
        if (diagramContent.code && !diagramContent.code.includes('sequenceDiagram')) {
          return {
            isValid: false,
            error: 'Sequence diagram must start with "sequenceDiagram" declaration'
          };
        }
        break;
      
      case 'erd':
        if (diagramContent.code && !diagramContent.code.includes('erDiagram')) {
          return {
            isValid: false,
            error: 'ERD must start with "erDiagram" declaration'
          };
        }
        break;
    }

    return { isValid: true };
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  const handleRefresh = () => {
    renderDiagram();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    try {
      const response = await fetch('/api/diagrams/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content,
          format,
          options: { zoom, width, height }
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      if (onError) {
        onError('Failed to export diagram');
      }
    }
  };

  const renderSpecificDiagram = () => {
    const commonProps = {
      content,
      width: width * zoom,
      height: height * zoom,
      readonly,
      onContentChange,
      onError: setError
    };

    switch (type) {
      case 'flowchart':
        return content.code ? 
          <MermaidRenderer {...commonProps} /> : 
          <FlowchartRenderer {...commonProps} />;
      
      case 'sequence':
        return <SequenceRenderer {...commonProps} />;
      
      case 'erd':
        return <ERDRenderer {...commonProps} />;
      
      case 'uml':
        return <UMLRenderer {...commonProps} />;
      
      case 'cloud-architecture':
        return <CloudArchitectureRenderer {...commonProps} />;
      
      default:
        return <MermaidRenderer {...commonProps} />;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertDescription>
            <div className="space-y-4">
              <p className="text-red-600 font-medium">Diagram Rendering Error</p>
              <p className="text-sm">{error}</p>
              <Button onClick={handleRefresh} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
      style={{ width, height }}
    >
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium px-2">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
          <Download className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleFullscreen}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-20">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Rendering diagram...</span>
          </div>
        </div>
      )}

      {/* Diagram Content */}
      <div className="w-full h-full overflow-auto">
        {renderSpecificDiagram()}
      </div>

      {/* Diagram Info */}
      {!isFullscreen && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-3 py-1 text-xs text-gray-600">
          {type.charAt(0).toUpperCase() + type.slice(1)} • {content.nodes?.length || 'Code-based'} elements
        </div>
      )}
    </div>
  );
}