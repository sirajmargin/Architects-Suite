'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeDragHandler,
  type EdgeMouseHandler,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagramContent, DiagramType } from '@/types';
import { 
  Square, 
  Circle, 
  Diamond, 
  Plus, 
  Trash2, 
  Copy, 
  Undo, 
  Redo,
  MousePointer,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save
} from 'lucide-react';

// Custom node components
const RectangleNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 border-2 rounded ${
    selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
  } bg-white shadow-sm min-w-[100px] text-center`}>
    <div className="font-medium text-sm">{data.label}</div>
    {data.description && (
      <div className="text-xs text-gray-500 mt-1">{data.description}</div>
    )}
  </div>
);

const CircleNode = ({ data, selected }: any) => (
  <div className={`w-20 h-20 border-2 rounded-full ${
    selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
  } bg-white shadow-sm flex items-center justify-center`}>
    <div className="font-medium text-xs text-center">{data.label}</div>
  </div>
);

const DiamondNode = ({ data, selected }: any) => (
  <div className={`w-20 h-20 border-2 transform rotate-45 ${
    selected ? 'border-blue-500 shadow-lg' : 'border-yellow-500'
  } bg-yellow-100 shadow-sm flex items-center justify-center`}>
    <div className="font-medium text-xs transform -rotate-45 text-center">{data.label}</div>
  </div>
);

const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  diamond: DiamondNode,
};

interface DragDropDiagramEditorProps {
  diagramType: DiagramType;
  initialContent?: DiagramContent;
  width?: number;
  height?: number;
  onContentChange?: (content: DiagramContent) => void;
  onSave?: (content: DiagramContent) => void;
}

function DragDropEditor({
  diagramType,
  initialContent,
  width = 800,
  height = 600,
  onContentChange,
  onSave
}: DragDropDiagramEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialContent?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialContent?.edges || []);
  const [selectedNodeType, setSelectedNodeType] = useState<'rectangle' | 'circle' | 'diamond'>('rectangle');
  const [mode, setMode] = useState<'select' | 'draw'>('select');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { project } = useReactFlow();

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const newState = { nodes: [...nodes], edges: [...edges] };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Handle node connections
  const onConnect = useCallback(
    (params: Connection) => {
      saveToHistory();
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: false }, eds));
    },
    [saveToHistory, setEdges]
  );

  // Handle node drag end
  const onNodeDragStop: NodeDragHandler = useCallback(() => {
    saveToHistory();
  }, [saveToHistory]);

  // Handle dropping new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          description: ''
        },
      };

      saveToHistory();
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, project, saveToHistory, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Add node programmatically
  const addNode = useCallback((type: 'rectangle' | 'circle' | 'diamond') => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: ''
      },
    };

    saveToHistory();
    setNodes((nds) => nds.concat(newNode));
  }, [saveToHistory, setNodes]);

  // Delete selected elements
  const deleteSelected = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      saveToHistory();
      
      const selectedNodeIds = selectedNodes.map(n => n.id);
      setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
      
      const selectedEdgeIds = selectedEdges.map(e => e.id);
      setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.includes(edge.id)));
      
      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  }, [selectedNodes, selectedEdges, saveToHistory, setNodes, setEdges]);

  // Copy selected nodes
  const copySelected = useCallback(() => {
    if (selectedNodes.length > 0) {
      const copiedNodes = selectedNodes.map(node => ({
        ...node,
        id: `${node.id}-copy-${Date.now()}`,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50
        }
      }));

      saveToHistory();
      setNodes((nds) => [...nds, ...copiedNodes]);
    }
  }, [selectedNodes, saveToHistory, setNodes]);

  // Handle selection changes
  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }: any) => {
    setSelectedNodes(selectedNodes || []);
    setSelectedEdges(selectedEdges || []);
  }, []);

  // Handle saving
  const handleSave = useCallback(() => {
    const content: DiagramContent = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type || 'rectangle',
        position: node.position,
        data: node.data,
        style: node.style || {}
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        data: edge.data || {},
        style: edge.style || {}
      })),
      layout: { direction: 'TB', spacing: 100, alignment: 'center' }
    };

    if (onContentChange) {
      onContentChange(content);
    }
    
    if (onSave) {
      onSave(content);
    }
  }, [nodes, edges, onContentChange, onSave]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            undo();
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'c':
            if (selectedNodes.length > 0) {
              event.preventDefault();
              copySelected();
            }
            break;
        }
      }
      
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave, copySelected, deleteSelected, selectedNodes]);

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        {/* Mode Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Mode</h3>
          <div className="flex space-x-2">
            <Button
              variant={mode === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('select')}
            >
              <MousePointer className="h-4 w-4 mr-1" />
              Select
            </Button>
            <Button
              variant={mode === 'draw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('draw')}
            >
              <Move className="h-4 w-4 mr-1" />
              Draw
            </Button>
          </div>
        </div>

        {/* Node Shapes */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Shapes</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'rectangle')}
              draggable
              onClick={() => addNode('rectangle')}
            >
              <Square className="h-6 w-6 mb-1" />
              <span className="text-xs">Rectangle</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'circle')}
              draggable
              onClick={() => addNode('circle')}
            >
              <Circle className="h-6 w-6 mb-1" />
              <span className="text-xs">Circle</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'diamond')}
              draggable
              onClick={() => addNode('diamond')}
            >
              <Diamond className="h-6 w-6 mb-1" />
              <span className="text-xs">Diamond</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
              onClick={() => addNode('rectangle')}
            >
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-xs">Add Node</span>
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={copySelected}
              disabled={selectedNodes.length === 0}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={deleteSelected}
              disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            
            <Button
              size="sm"
              className="w-full justify-start"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedNodes.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Properties</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Label</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    value={selectedNodes[0]?.data?.label || ''}
                    onChange={(e) => {
                      const updatedNodes = nodes.map(node =>
                        node.id === selectedNodes[0].id
                          ? { ...node, data: { ...node.data, label: e.target.value } }
                          : node
                      );
                      setNodes(updatedNodes);
                    }}
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Description</label>
                  <textarea
                    className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded resize-none"
                    rows={2}
                    value={selectedNodes[0]?.data?.description || ''}
                    onChange={(e) => {
                      const updatedNodes = nodes.map(node =>
                        node.id === selectedNodes[0].id
                          ? { ...node, data: { ...node.data, description: e.target.value } }
                          : node
                      );
                      setNodes(updatedNodes);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Controls showInteractive={false} />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'circle': return '#3b82f6';
                case 'diamond': return '#f59e0b';
                default: return '#6b7280';
              }
            }}
            position="top-right"
          />
          
          <Panel position="bottom-left">
            <div className="bg-white p-2 rounded shadow-sm text-xs text-gray-600">
              Nodes: {nodes.length} | Edges: {edges.length}
            </div>
          </Panel>

          <Panel position="top-center">
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded shadow-sm text-xs">
              <span className="font-medium">Tip:</span> Drag shapes from the sidebar or use keyboard shortcuts
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export function DragDropDiagramEditor(props: DragDropDiagramEditorProps) {
  return (
    <ReactFlowProvider>
      <DragDropEditor {...props} />
    </ReactFlowProvider>
  );
}