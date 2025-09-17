'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DiagramContent } from '@/types';

interface ERDRendererProps {
  content: DiagramContent;
  width: number;
  height: number;
  readonly: boolean;
  onContentChange?: (content: DiagramContent) => void;
  onError?: (error: string) => void;
}

interface Entity {
  id: string;
  name: string;
  attributes: Array<{
    name: string;
    type: string;
    key?: 'primary' | 'foreign';
    nullable?: boolean;
  }>;
  position: { x: number; y: number };
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  label?: string;
}

export function ERDRenderer({
  content,
  width,
  height,
  readonly,
  onContentChange,
  onError
}: ERDRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [draggedEntity, setDraggedEntity] = useState<string | null>(null);

  useEffect(() => {
    initializeERD();
  }, [content]);

  useEffect(() => {
    if (entities.length > 0) {
      renderERD();
    }
  }, [entities, relationships, width, height]);

  const initializeERD = () => {
    if (content.code) {
      parseERDCode();
    } else if (content.visual) {
      // Load from visual data
      setEntities(content.visual.entities || []);
      setRelationships(content.visual.relationships || []);
    } else {
      // Create sample ERD
      createSampleERD();
    }
  };

  const parseERDCode = () => {
    try {
      const lines = content.code!.split('\n').filter(line => line.trim());
      const parsedEntities: Entity[] = [];
      const parsedRelationships: Relationship[] = [];
      
      let currentEntity: Entity | null = null;
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Skip erDiagram declaration
        if (trimmedLine.startsWith('erDiagram')) return;
        
        // Parse relationships (CUSTOMER ||--o{ ORDER : places)
        const relationshipMatch = trimmedLine.match(/(\w+)\s+([\|\|o\{\}o\-]+)\s+(\w+)\s*:\s*(.+)/);
        if (relationshipMatch) {
          const [, from, connector, to, label] = relationshipMatch;
          const type = parseRelationshipType(connector);
          
          parsedRelationships.push({
            id: `rel-${from}-${to}`,
            from,
            to,
            type,
            label: label.trim()
          });
          return;
        }
        
        // Parse entity declaration
        if (trimmedLine.match(/^\w+\s*\{$/)) {
          currentEntity = {
            id: trimmedLine.replace(/\s*\{$/, ''),
            name: trimmedLine.replace(/\s*\{$/, ''),
            attributes: [],
            position: { x: 0, y: 0 }
          };
          return;
        }
        
        // Parse entity attributes
        if (currentEntity && trimmedLine.match(/^\w+\s+\w+/)) {
          const [type, name] = trimmedLine.split(/\s+/);
          currentEntity.attributes.push({
            name,
            type,
            key: name.toLowerCase().includes('id') ? 'primary' : undefined,
            nullable: false
          });
          return;
        }
        
        // End of entity
        if (trimmedLine === '}' && currentEntity) {
          parsedEntities.push(currentEntity);
          currentEntity = null;
        }
      });
      
      // Auto-layout entities
      layoutEntities(parsedEntities);
      
      setEntities(parsedEntities);
      setRelationships(parsedRelationships);
    } catch (error) {
      console.error('Failed to parse ERD code:', error);
      onError?.('Failed to parse ERD syntax');
      createSampleERD();
    }
  };

  const parseRelationshipType = (connector: string): 'one-to-one' | 'one-to-many' | 'many-to-many' => {
    if (connector.includes('||') && connector.includes('o{')) return 'one-to-many';
    if (connector.includes('||') && connector.includes('||')) return 'one-to-one';
    if (connector.includes('o{') && connector.includes('o{')) return 'many-to-many';
    return 'one-to-many';
  };

  const createSampleERD = () => {
    const sampleEntities: Entity[] = [
      {
        id: 'CUSTOMER',
        name: 'CUSTOMER',
        attributes: [
          { name: 'customer_id', type: 'int', key: 'primary' },
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'phone', type: 'string', nullable: true }
        ],
        position: { x: 50, y: 50 }
      },
      {
        id: 'ORDER',
        name: 'ORDER',
        attributes: [
          { name: 'order_id', type: 'int', key: 'primary' },
          { name: 'customer_id', type: 'int', key: 'foreign' },
          { name: 'order_date', type: 'date' },
          { name: 'total_amount', type: 'decimal' }
        ],
        position: { x: 350, y: 50 }
      },
      {
        id: 'PRODUCT',
        name: 'PRODUCT',
        attributes: [
          { name: 'product_id', type: 'int', key: 'primary' },
          { name: 'name', type: 'string' },
          { name: 'price', type: 'decimal' },
          { name: 'description', type: 'text', nullable: true }
        ],
        position: { x: 350, y: 300 }
      }
    ];

    const sampleRelationships: Relationship[] = [
      {
        id: 'customer-order',
        from: 'CUSTOMER',
        to: 'ORDER',
        type: 'one-to-many',
        label: 'places'
      },
      {
        id: 'order-product',
        from: 'ORDER',
        to: 'PRODUCT',
        type: 'many-to-many',
        label: 'contains'
      }
    ];

    setEntities(sampleEntities);
    setRelationships(sampleRelationships);
  };

  const layoutEntities = (entities: Entity[]) => {
    const cols = Math.ceil(Math.sqrt(entities.length));
    const entityWidth = 200;
    const entityHeight = 150;
    const spacing = 100;

    entities.forEach((entity, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      entity.position = {
        x: 50 + col * (entityWidth + spacing),
        y: 50 + row * (entityHeight + spacing)
      };
    });
  };

  const renderERD = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = '';

    // Create definitions for markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Arrow marker
    const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    arrowMarker.setAttribute('id', 'arrow');
    arrowMarker.setAttribute('markerWidth', '10');
    arrowMarker.setAttribute('markerHeight', '10');
    arrowMarker.setAttribute('refX', '9');
    arrowMarker.setAttribute('refY', '3');
    arrowMarker.setAttribute('orient', 'auto');
    arrowMarker.innerHTML = '<path d="M0,0 L0,6 L9,3 z" fill="#666" />';
    
    defs.appendChild(arrowMarker);
    svg.appendChild(defs);

    // Render relationships first (so they appear behind entities)
    relationships.forEach(rel => {
      const fromEntity = entities.find(e => e.id === rel.from);
      const toEntity = entities.find(e => e.id === rel.to);
      
      if (fromEntity && toEntity) {
        renderRelationship(svg, fromEntity, toEntity, rel);
      }
    });

    // Render entities
    entities.forEach(entity => {
      renderEntity(svg, entity);
    });
  };

  const renderEntity = (svg: SVGSVGElement, entity: Entity) => {
    const entityGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    entityGroup.setAttribute('class', 'entity');
    entityGroup.setAttribute('data-entity-id', entity.id);
    
    if (!readonly) {
      entityGroup.style.cursor = 'move';
      entityGroup.addEventListener('mousedown', (e) => handleEntityMouseDown(e, entity.id));
    }

    const entityWidth = 200;
    const attributeHeight = 25;
    const headerHeight = 40;
    const entityHeight = headerHeight + entity.attributes.length * attributeHeight;

    // Entity rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', entity.position.x.toString());
    rect.setAttribute('y', entity.position.y.toString());
    rect.setAttribute('width', entityWidth.toString());
    rect.setAttribute('height', entityHeight.toString());
    rect.setAttribute('fill', '#f8f9fa');
    rect.setAttribute('stroke', '#6c757d');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '8');
    
    // Entity header
    const headerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    headerRect.setAttribute('x', entity.position.x.toString());
    headerRect.setAttribute('y', entity.position.y.toString());
    headerRect.setAttribute('width', entityWidth.toString());
    headerRect.setAttribute('height', headerHeight.toString());
    headerRect.setAttribute('fill', '#e9ecef');
    headerRect.setAttribute('stroke', 'none');
    headerRect.setAttribute('rx', '8');
    
    // Entity name
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', (entity.position.x + entityWidth / 2).toString());
    nameText.setAttribute('y', (entity.position.y + headerHeight / 2 + 5).toString());
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('font-family', 'Inter, sans-serif');
    nameText.setAttribute('font-size', '14');
    nameText.setAttribute('font-weight', 'bold');
    nameText.setAttribute('fill', '#212529');
    nameText.textContent = entity.name;

    entityGroup.appendChild(rect);
    entityGroup.appendChild(headerRect);
    entityGroup.appendChild(nameText);

    // Render attributes
    entity.attributes.forEach((attr, index) => {
      const attrY = entity.position.y + headerHeight + index * attributeHeight;
      
      // Attribute background (alternate colors)
      const attrRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      attrRect.setAttribute('x', entity.position.x.toString());
      attrRect.setAttribute('y', attrY.toString());
      attrRect.setAttribute('width', entityWidth.toString());
      attrRect.setAttribute('height', attributeHeight.toString());
      attrRect.setAttribute('fill', index % 2 === 0 ? '#ffffff' : '#f8f9fa');
      attrRect.setAttribute('stroke', 'none');
      
      // Attribute text
      const attrText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      attrText.setAttribute('x', (entity.position.x + 10).toString());
      attrText.setAttribute('y', (attrY + attributeHeight / 2 + 4).toString());
      attrText.setAttribute('font-family', 'Inter, sans-serif');
      attrText.setAttribute('font-size', '12');
      attrText.setAttribute('fill', '#495057');
      
      let displayText = attr.name;
      if (attr.key === 'primary') displayText = '🔑 ' + displayText;
      if (attr.key === 'foreign') displayText = '🔗 ' + displayText;
      if (attr.nullable) displayText += '?';
      
      attrText.textContent = displayText;
      
      // Type text
      const typeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      typeText.setAttribute('x', (entity.position.x + entityWidth - 10).toString());
      typeText.setAttribute('y', (attrY + attributeHeight / 2 + 4).toString());
      typeText.setAttribute('text-anchor', 'end');
      typeText.setAttribute('font-family', 'Inter, sans-serif');
      typeText.setAttribute('font-size', '11');
      typeText.setAttribute('fill', '#6c757d');
      typeText.textContent = attr.type;

      entityGroup.appendChild(attrRect);
      entityGroup.appendChild(attrText);
      entityGroup.appendChild(typeText);
    });

    svg.appendChild(entityGroup);
  };

  const renderRelationship = (svg: SVGSVGElement, fromEntity: Entity, toEntity: Entity, relationship: Relationship) => {
    const fromCenter = {
      x: fromEntity.position.x + 100,
      y: fromEntity.position.y + 75
    };
    
    const toCenter = {
      x: toEntity.position.x + 100,
      y: toEntity.position.y + 75
    };

    // Create relationship line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromCenter.x.toString());
    line.setAttribute('y1', fromCenter.y.toString());
    line.setAttribute('x2', toCenter.x.toString());
    line.setAttribute('y2', toCenter.y.toString());
    line.setAttribute('stroke', '#6c757d');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrow)');

    // Relationship label
    const labelX = (fromCenter.x + toCenter.x) / 2;
    const labelY = (fromCenter.y + toCenter.y) / 2;
    
    const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    labelBg.setAttribute('x', (labelX - 30).toString());
    labelBg.setAttribute('y', (labelY - 10).toString());
    labelBg.setAttribute('width', '60');
    labelBg.setAttribute('height', '20');
    labelBg.setAttribute('fill', 'white');
    labelBg.setAttribute('stroke', '#6c757d');
    labelBg.setAttribute('rx', '4');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelX.toString());
    label.setAttribute('y', (labelY + 4).toString());
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'Inter, sans-serif');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#495057');
    label.textContent = relationship.label || relationship.type;

    svg.appendChild(line);
    svg.appendChild(labelBg);
    svg.appendChild(label);
  };

  const handleEntityMouseDown = (e: MouseEvent, entityId: string) => {
    if (readonly) return;
    
    e.preventDefault();
    setDraggedEntity(entityId);
    
    const handleMouseMove = (e: MouseEvent) => {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      
      const newX = e.clientX - svgRect.left - 100; // Center offset
      const newY = e.clientY - svgRect.top - 75;
      
      setEntities(prev => prev.map(entity => 
        entity.id === entityId 
          ? { ...entity, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
          : entity
      ));
    };
    
    const handleMouseUp = () => {
      setDraggedEntity(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Update content
      if (onContentChange) {
        const updatedContent: DiagramContent = {
          ...content,
          visual: { entities, relationships }
        };
        onContentChange(updatedContent);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden bg-white">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {!readonly && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm text-xs">
          <div className="font-medium mb-1">ERD Editor</div>
          <div className="text-gray-600">
            • Drag entities to reposition<br/>
            • 🔑 Primary key • 🔗 Foreign key
          </div>
        </div>
      )}
    </div>
  );
}