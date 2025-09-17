'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DiagramContent } from '@/types';

interface SequenceRendererProps {
  content: DiagramContent;
  width: number;
  height: number;
  readonly: boolean;
  onContentChange?: (content: DiagramContent) => void;
  onError?: (error: string) => void;
}

export function SequenceRenderer(props: SequenceRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically import mermaid for sequence diagrams
    import('mermaid').then((mermaidModule) => {
      const mermaidInstance = mermaidModule.default;
      
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
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
        }
      });
      
      setMermaid(mermaidInstance);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to load Mermaid for sequence:', error);
      props.onError?.('Failed to load sequence diagram renderer');
      setIsLoading(false);
    });
  }, [props.onError]);

  useEffect(() => {
    if (mermaid && props.content.code && containerRef.current) {
      renderSequenceDiagram();
    }
  }, [mermaid, props.content.code]);

  const renderSequenceDiagram = async () => {
    if (!mermaid || !containerRef.current || !props.content.code) return;

    try {
      containerRef.current.innerHTML = '';
      const diagramId = `sequence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      console.error('Sequence diagram rendering error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-center p-6">
              <div class="text-red-500 text-lg mb-2">⚠️ Sequence Diagram Error</div>
              <div class="text-sm text-gray-600">${error instanceof Error ? error.message : 'Invalid sequence diagram syntax'}</div>
            </div>
          </div>
        `;
      }
      props.onError?.(error instanceof Error ? error.message : 'Failed to render sequence diagram');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading sequence renderer...</div>
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