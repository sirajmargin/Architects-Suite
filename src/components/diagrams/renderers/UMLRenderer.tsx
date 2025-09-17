'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DiagramContent } from '@/types';

interface UMLRendererProps {
  content: DiagramContent;
  width: number;
  height: number;
  readonly: boolean;
  onContentChange?: (content: DiagramContent) => void;
  onError?: (error: string) => void;
}

export function UMLRenderer(props: UMLRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('mermaid').then((mermaidModule) => {
      const mermaidInstance = mermaidModule.default;
      
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        class: {
          useMaxWidth: true,
          titleTopMargin: 25
        }
      });
      
      setMermaid(mermaidInstance);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to load Mermaid for UML:', error);
      props.onError?.('Failed to load UML diagram renderer');
      setIsLoading(false);
    });
  }, [props.onError]);

  useEffect(() => {
    if (mermaid && props.content.code && containerRef.current) {
      renderUMLDiagram();
    }
  }, [mermaid, props.content.code]);

  const renderUMLDiagram = async () => {
    if (!mermaid || !containerRef.current || !props.content.code) return;

    try {
      containerRef.current.innerHTML = '';
      const diagramId = `uml-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(diagramId, props.content.code);
      containerRef.current.innerHTML = svg;

      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.maxWidth = `${props.width}px`;
        svgElement.style.maxHeight = `${props.height}px`;
      }
    } catch (error) {
      console.error('UML diagram rendering error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-center p-6">
              <div class="text-red-500 text-lg mb-2">⚠️ UML Diagram Error</div>
              <div class="text-sm text-gray-600">${error instanceof Error ? error.message : 'Invalid UML diagram syntax'}</div>
            </div>
          </div>
        `;
      }
      props.onError?.(error instanceof Error ? error.message : 'Failed to render UML diagram');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading UML renderer...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto"
        style={{ minWidth: props.width, minHeight: props.height }}
      />
    </div>
  );
}