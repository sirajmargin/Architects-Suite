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
    // Dynamically import mermaid to avoid SSR issues
    import('mermaid').then((mermaidModule) => {
      const mermaidInstance = mermaidModule.default;
      
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          padding: 20
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
          mirrorActors: true,
          bottomMarginAdj: 1,
          useMaxWidth: true,
          rightAngles: false,
          showSequenceNumbers: false
        },
        er: {
          diagramPadding: 20,
          layoutDirection: 'TB',
          minEntityWidth: 100,
          minEntityHeight: 75,
          entityPadding: 15,
          stroke: 'gray',
          fill: 'honeydew',
          fontSize: 12,
          useMaxWidth: true
        }
      });
      
      setMermaid(mermaidInstance);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to load Mermaid:', error);
      onError?.('Failed to load diagram renderer');
      setIsLoading(false);
    });
  }, [onError]);

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
    // Add click handlers for nodes
    const nodes = svgElement.querySelectorAll('.node, .actor, .entity');
    nodes.forEach((node) => {
      node.addEventListener('click', (event) => {
        event.stopPropagation();
        handleNodeClick(node);
      });
      
      // Add hover effects
      node.addEventListener('mouseenter', () => {
        (node as HTMLElement).style.filter = 'brightness(1.1)';
        (node as HTMLElement).style.cursor = 'pointer';
      });
      
      node.addEventListener('mouseleave', () => {
        (node as HTMLElement).style.filter = 'none';
      });
    });

    // Add click handlers for edges/connections
    const edges = svgElement.querySelectorAll('.edgePath, .messageLine0, .relation');
    edges.forEach((edge) => {
      edge.addEventListener('click', (event) => {
        event.stopPropagation();
        handleEdgeClick(edge);
      });
    });
  };

  const handleNodeClick = (node: Element) => {
    // Extract node information
    const nodeId = node.getAttribute('id') || '';
    const nodeText = node.textContent || '';
    
    console.log('Node clicked:', { nodeId, nodeText });
    
    // In a real implementation, this would open an edit dialog
    // or trigger the onContentChange callback with updated content
    if (onContentChange) {
      // This is a simplified example - real implementation would parse and update the diagram
      const updatedContent = { ...content };
      onContentChange(updatedContent);
    }
  };

  const handleEdgeClick = (edge: Element) => {
    console.log('Edge clicked:', edge);
    
    // Similar to node click, would handle edge editing
    if (onContentChange) {
      const updatedContent = { ...content };
      onContentChange(updatedContent);
    }
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