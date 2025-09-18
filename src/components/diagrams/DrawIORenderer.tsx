import React, { useEffect, useRef } from 'react';
import { DrawIOConverter } from '@/lib/drawio-converter';

interface DrawIORendererProps {
  services: any[];
  width: number;
  height: number;
}

export function DrawIORenderer({ services, width, height }: DrawIORendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (services && containerRef.current) {
      renderDrawIO();
    }
  }, [services]);

  const renderDrawIO = () => {
    if (!containerRef.current) return;

    const drawIOXML = DrawIOConverter.svgToDrawIO('', services);
    
    // Create embedded draw.io viewer
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // Use draw.io embed URL with XML data
    const encodedXML = encodeURIComponent(drawIOXML);
    iframe.src = `https://viewer.diagrams.net/?embed=1&ui=min&spin=1&proto=json&xml=${encodedXML}`;
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);
  };

  const downloadDrawIO = () => {
    const drawIOXML = DrawIOConverter.svgToDrawIO('', services);
    const blob = new Blob([drawIOXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.drawio';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={downloadDrawIO}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Download .drawio
        </button>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}