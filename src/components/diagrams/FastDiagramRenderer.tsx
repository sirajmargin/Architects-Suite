'use client';

import React, { memo } from 'react';
import { DiagramType, DiagramContent } from '@/types';

interface FastDiagramRendererProps {
  type: DiagramType;
  content: DiagramContent;
  width?: number;
  height?: number;
}

const FastDiagramRenderer = memo(function FastDiagramRenderer({
  type,
  content,
  width = 800,
  height = 600
}: FastDiagramRendererProps) {
  if (type === 'cloud-architecture' && content.visual?.services) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <svg width={width} height={height} className="w-full h-full">
          {/* Render connections first */}
          {content.visual.services.map((service: any) => 
            service.connections?.map((targetId: string) => {
              const target = content.visual.services.find((s: any) => s.id === targetId);
              if (!target) return null;
              return (
                <line
                  key={`${service.id}-${targetId}`}
                  x1={service.position.x + 60}
                  y1={service.position.y + 40}
                  x2={target.position.x + 60}
                  y2={target.position.y + 40}
                  stroke="#4a90e2"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)"
                />
              );
            })
          )}
          
          {/* Arrow marker definition */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4a90e2" />
            </marker>
          </defs>
          
          {/* Render services */}
          {content.visual.services.map((service: any) => (
            <g key={service.id}>
              <rect
                x={service.position.x}
                y={service.position.y}
                width="120"
                height="80"
                rx="12"
                fill="#e3f2fd"
                stroke="#1976d2"
                strokeWidth="2"
              />
              <text
                x={service.position.x + 60}
                y={service.position.y + 30}
                textAnchor="middle"
                fontSize="24"
              >
                {service.icon}
              </text>
              <text
                x={service.position.x + 60}
                y={service.position.y + 65}
                textAnchor="middle"
                fontSize="10"
                fill="#1a1a1a"
              >
                {service.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  if (!content.code?.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Enter diagram code to see preview
      </div>
    );
  }

  return (
    <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-2xl mb-2">📊</div>
        <div className="text-sm">Diagram Preview</div>
        <div className="text-xs mt-1">{type}</div>
      </div>
    </div>
  );
});

export { FastDiagramRenderer };