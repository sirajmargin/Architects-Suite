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
    if (!content.code?.trim() || content.code.startsWith('//')) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    import('mermaid').then((m) => {
      if (!mounted) return;
      const mermaidInstance = m.default;
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
      });
      setMermaid(mermaidInstance);
      setIsLoading(false);
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    
    return () => { mounted = false; };
  }, [content.code]);

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
      containerRef.current.innerHTML = '';
      const diagramId = `m${Date.now()}`;
      const { svg } = await mermaid.render(diagramId, content.code);
      containerRef.current.innerHTML = svg;
      
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
      }
    } catch (error) {
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div class="p-4 text-red-500">Syntax Error</div>';
      }
    }
  };



  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!content.code?.trim() || content.code.startsWith('//')) {
    return <div className="flex items-center justify-center h-full text-gray-500">No diagram code</div>;
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