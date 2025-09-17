'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  NodeTypes,
  EdgeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DiagramContent, DiagramNode, DiagramEdge } from '@/types';

// Custom node types
const CustomNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 shadow-md rounded-md border-2 ${
    selected ? 'border-blue-500' : 'border-gray-300'
  } ${data.type === 'decision' ? 'bg-yellow-100' : 
       data.type === 'process' ? 'bg-blue-100' : 
       data.type === 'start' ? 'bg-green-100' : 
       data.type === 'end' ? 'bg-red-100' : 'bg-white'}`}>
    <div className="text-sm font-medium">{data.label}</div>
    {data.description && (
      <div className="text-xs text-gray-600 mt-1">{data.description}</div>
    )}
  </div>
);

const DecisionNode = ({ data, selected }: any) => (
  <div className={`w-20 h-20 transform rotate-45 border-2 ${
    selected ? 'border-blue-500' : 'border-yellow-500'
  } bg-yellow-100 flex items-center justify-center`}>
    <div className="transform -rotate-45 text-xs text-center font-medium">
      {data.label}
    </div>
  </div>
);

const StartEndNode = ({ data, selected }: any) => (
  <div className={`px-6 py-3 rounded-full border-2 ${
    selected ? 'border-blue-500' : 'border-gray-300'
  } ${data.type === 'start' ? 'bg-green-100' : 'bg-red-100'}`}>
    <div className="text-sm font-medium">{data.label}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
};

interface FlowchartRendererProps {
  content: DiagramContent;
  width: number;
  height: number;
  readonly: boolean;
  onContentChange?: (content: DiagramContent) => void;
  onError?: (error: string) => void;
}

export function FlowchartRenderer({
  content,
  width,
  height,
  readonly,
  onContentChange,
  onError
}: FlowchartRendererProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeFlowchart();
  }, [content]);

  const initializeFlowchart = () => {
    try {
      let initialNodes: Node[] = [];
      let initialEdges: Edge[] = [];

      if (content.nodes && content.edges) {
        // Use provided nodes and edges
        initialNodes = content.nodes.map(node => ({
          id: node.id,
          type: getNodeType(node.type),
          position: node.position,
          data: {
            label: node.data.label || node.id,
            description: node.data.description,
            type: node.type
          },
          style: node.style || {}
        }));

        initialEdges = content.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'default',
          label: edge.data?.label,
          style: edge.style || {},
          animated: edge.data?.animated || false
        }));
      } else if (content.code) {
        // Parse Mermaid code to create nodes and edges
        const parsed = parseMermaidFlowchart(content.code);
        initialNodes = parsed.nodes;
        initialEdges = parsed.edges;
      } else {
        // Create a simple default flowchart
        initialNodes = [
          {
            id: '1',
            type: 'startEnd',
            position: { x: 250, y: 0 },
            data: { label: 'Start', type: 'start' }
          },
          {
            id: '2',
            type: 'custom',
            position: { x: 250, y: 100 },
            data: { label: 'Process', type: 'process' }
          },
          {
            id: '3',
            type: 'decision',
            position: { x: 250, y: 200 },
            data: { label: 'Decision?', type: 'decision' }
          },
          {
            id: '4',
            type: 'startEnd',
            position: { x: 250, y: 350 },
            data: { label: 'End', type: 'end' }
          }
        ];

        initialEdges = [
          { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
          { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
          { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', label: 'Yes' }
        ];
      }

      setNodes(initialNodes);
      setEdges(initialEdges);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize flowchart:', error);
      onError?.('Failed to initialize flowchart');
    }
  };

  const getNodeType = (type: string): string => {
    switch (type) {
      case 'start':
      case 'end':
        return 'startEnd';
      case 'decision':
        return 'decision';
      default:
        return 'custom';
    }
  };

  const parseMermaidFlowchart = (code: string): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const lines = code.split('\n').filter(line => line.trim());

    let nodeCounter = 0;
    const nodeMap = new Map<string, string>();

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and flowchart declaration
      if (!trimmedLine || trimmedLine.startsWith('flowchart')) return;

      // Parse node connections (A --> B, A --> B[Label], etc.)
      const connectionMatch = trimmedLine.match(/(\w+)(?:\[([^\]]+)\])?\s*-->\s*(\w+)(?:\[([^\]]+)\])?/);
      if (connectionMatch) {
        const [, sourceId, sourceLabel, targetId, targetLabel] = connectionMatch;
        
        // Create nodes if they don't exist
        if (!nodeMap.has(sourceId)) {
          const id = `node-${++nodeCounter}`;
          nodeMap.set(sourceId, id);
          nodes.push({
            id,
            type: 'custom',
            position: { x: Math.random() * 400, y: index * 80 },
            data: { 
              label: sourceLabel || sourceId,
              type: sourceLabel?.toLowerCase().includes('start') ? 'start' :
                    sourceLabel?.toLowerCase().includes('end') ? 'end' :
                    sourceLabel?.includes('?') ? 'decision' : 'process'
            }
          });
        }

        if (!nodeMap.has(targetId)) {
          const id = `node-${++nodeCounter}`;
          nodeMap.set(targetId, id);
          nodes.push({
            id,
            type: 'custom',
            position: { x: Math.random() * 400, y: (index + 1) * 80 },
            data: { 
              label: targetLabel || targetId,
              type: targetLabel?.toLowerCase().includes('start') ? 'start' :
                    targetLabel?.toLowerCase().includes('end') ? 'end' :
                    targetLabel?.includes('?') ? 'decision' : 'process'
            }
          });
        }

        // Create edge
        edges.push({
          id: `edge-${edges.length + 1}`,
          source: nodeMap.get(sourceId)!,
          target: nodeMap.get(targetId)!,
          type: 'smoothstep'
        });
      }
    });

    // Auto-layout nodes if no positions specified
    if (nodes.length > 0) {
      layoutNodes(nodes);
    }

    return { nodes, edges };
  };

  const layoutNodes = (nodes: Node[]) => {
    // Simple vertical layout
    const spacing = 150;
    let currentY = 50;

    nodes.forEach((node, index) => {
      node.position = {
        x: 250 + (index % 2) * 200 - 100, // Alternate left/right
        y: currentY
      };
      currentY += spacing;
    });
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (readonly) return;
      
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: false
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Update content
      if (onContentChange) {
        const updatedContent: DiagramContent = {
          ...content,
          nodes: nodes.map(n => ({
            id: n.id,
            type: n.data.type || 'process',
            position: n.position,
            data: n.data,
            style: n.style
          })),
          edges: [...edges, {
            id: newEdge.id!,
            source: newEdge.source!,
            target: newEdge.target!,
            type: newEdge.type,
            data: { animated: newEdge.animated },
            style: {}
          }]
        };
        onContentChange(updatedContent);
      }
    },
    [readonly, edges, nodes, content, onContentChange]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      if (readonly || !onContentChange) return;

      const updatedContent: DiagramContent = {
        ...content,
        nodes: nodes.map(n => n.id === node.id ? {
          id: n.id,
          type: n.data.type || 'process',
          position: node.position,
          data: n.data,
          style: n.style
        } : {
          id: n.id,
          type: n.data.type || 'process',
          position: n.position,
          data: n.data,
          style: n.style
        }),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          data: e.data || {},
          style: e.style || {}
        }))
      };
      
      onContentChange(updatedContent);
    },
    [readonly, nodes, edges, content, onContentChange]
  );

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Initializing flowchart...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height }} className="border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readonly ? undefined : onNodesChange}
        onEdgesChange={readonly ? undefined : onEdgesChange}
        onConnect={readonly ? undefined : onConnect}
        onNodeDragStop={readonly ? undefined : onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode="partial"
      >
        <Controls showInteractive={!readonly} />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'start': return '#10b981';
              case 'end': return '#ef4444';
              case 'decision': return '#f59e0b';
              default: return '#3b82f6';
            }
          }}
          position="top-right"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        
        {!readonly && (
          <Panel position="top-left">
            <div className="bg-white p-2 rounded-lg shadow-sm border text-xs">
              <div className="font-medium mb-1">Flowchart Editor</div>
              <div className="text-gray-600">
                • Drag nodes to move<br/>
                • Connect nodes by dragging from handles<br/>
                • Use controls to zoom and fit
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}