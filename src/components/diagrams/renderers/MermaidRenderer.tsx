'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DiagramContent } from '@/types';

interface MermaidRendererProps {
  content: DiagramContent;
  width: number;
  height: number;
  readonly: boolean;
  onContentChange?: (content: DiagramContent) => void;
  onError?: (error: string) => void;
}

export function MermaidRenderer({
  content,
  width,
  height,
  readonly,
  onContentChange,
  onError
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only load mermaid when actually needed
    if (!content.code || content.code.trim().startsWith('//') || content.code.trim().startsWith('/*')) {
      setIsLoading(false);
      return;
    }

    // Dynamically import mermaid to avoid SSR issues
    import('mermaid').then((mermaidModule) => {
      const mermaidInstance = mermaidModule.default;
      
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        flowchart: { useMaxWidth: true, htmlLabels: true },
        sequence: { useMaxWidth: true, mirrorActors: true },
        er: { useMaxWidth: true }
      });
      
      setMermaid(mermaidInstance);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to load Mermaid:', error);
      onError?.('Failed to load diagram renderer');
      setIsLoading(false);
    });
  }, [content.code, onError]);

  useEffect(() => {
    if (mermaid && content.code && containerRef.current) {
      // Check if code is valid before rendering
      const trimmedCode = content.code.trim();
      if (trimmedCode && !trimmedCode.startsWith('//') && !trimmedCode.startsWith('/*')) {
        renderMermaidDiagram();
      }
    }
  }, [mermaid, content.code]);

  const renderMermaidDiagram = async () => {
    if (!mermaid || !containerRef.current || !content.code) return;

    try {
      // Clear previous content
      containerRef.current.innerHTML = '';

      // Generate unique ID for this diagram
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Validate and render the diagram
      const { svg } = await mermaid.render(diagramId, content.code);
      
      // Insert the SVG
      containerRef.current.innerHTML = svg;

      // Make the SVG responsive
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.maxWidth = `${width}px`;
        svgElement.style.maxHeight = `${height}px`;
        
        // Add click handlers for interactive elements if not readonly
        if (!readonly) {
          addInteractiveHandlers(svgElement);
        }
      }
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      
      // Display error in container
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-center p-6">
              <div class="text-red-500 text-lg mb-2">⚠️ Syntax Error</div>
              <div class="text-sm text-gray-600">${error instanceof Error ? error.message : 'Invalid diagram syntax'}</div>
              <div class="text-xs text-gray-400 mt-2">Check your diagram code for syntax errors</div>
            </div>
          </div>
        `;
      }
      
      onError?.(error instanceof Error ? error.message : 'Failed to render diagram');
    }
  };

  const addInteractiveHandlers = (svgElement: SVGElement) => {
    if (readonly) return;
    
    // Simplified interaction handlers
    const nodes = svgElement.querySelectorAll('.node, .actor, .entity');
    nodes.forEach((node) => {
      (node as HTMLElement).style.cursor = 'pointer';
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        handleNodeClick(node);
      });
    });
  };

  const handleNodeClick = (node: Element) => {
    const nodeText = node.textContent || '';
    console.log('Node clicked:', nodeText);
    onContentChange?.({ ...content });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading Mermaid renderer...</div>
        </div>
      </div>
    );
  }

  if (!content.code || content.code.trim().startsWith('//') || content.code.trim().startsWith('/*')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">No diagram code provided</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto"
        style={{ minWidth: width, minHeight: height }}
      />
    </div>
  );
}