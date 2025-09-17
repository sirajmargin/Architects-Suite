'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DiagramContent } from '@/types';

interface CloudService {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'database' | 'network' | 'security' | 'analytics';
  provider: 'aws' | 'azure' | 'gcp' | 'generic';
  position: { x: number; y: number };
  icon: string;
  connections: string[];
}

interface CloudArchitectureRendererProps {
  content: DiagramContent;
  width: number;
  height: number;
  readonly: boolean;
  onContentChange?: (content: DiagramContent) => void;
  onError?: (error: string) => void;
}

export function CloudArchitectureRenderer({
  content,
  width,
  height,
  readonly,
  onContentChange,
  onError
}: CloudArchitectureRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [services, setServices] = useState<CloudService[]>([]);
  const [draggedService, setDraggedService] = useState<string | null>(null);

  useEffect(() => {
    initializeCloudDiagram();
  }, [content]);

  useEffect(() => {
    if (services.length > 0) {
      renderCloudDiagram();
    }
  }, [services, width, height]);

  const initializeCloudDiagram = () => {
    if (content.visual?.services) {
      setServices(content.visual.services);
    } else {
      createSampleCloudArchitecture();
    }
  };

  const createSampleCloudArchitecture = () => {
    const sampleServices: CloudService[] = [
      {
        id: 'user',
        name: 'User',
        type: 'compute',
        provider: 'generic',
        position: { x: 50, y: 200 },
        icon: '👤',
        connections: ['alb']
      },
      {
        id: 'alb',
        name: 'Application Load Balancer',
        type: 'network',
        provider: 'aws',
        position: { x: 200, y: 200 },
        icon: '⚖️',
        connections: ['web1', 'web2']
      },
      {
        id: 'web1',
        name: 'Web Server 1',
        type: 'compute',
        provider: 'aws',
        position: { x: 350, y: 150 },
        icon: '🖥️',
        connections: ['api']
      },
      {
        id: 'web2',
        name: 'Web Server 2',
        type: 'compute',
        provider: 'aws',
        position: { x: 350, y: 250 },
        icon: '🖥️',
        connections: ['api']
      },
      {
        id: 'api',
        name: 'API Gateway',
        type: 'network',
        provider: 'aws',
        position: { x: 500, y: 200 },
        icon: '🚪',
        connections: ['lambda', 'rds']
      },
      {
        id: 'lambda',
        name: 'Lambda Functions',
        type: 'compute',
        provider: 'aws',
        position: { x: 650, y: 150 },
        icon: 'λ',
        connections: ['rds', 's3']
      },
      {
        id: 'rds',
        name: 'RDS Database',
        type: 'database',
        provider: 'aws',
        position: { x: 650, y: 300 },
        icon: '🗄️',
        connections: []
      },
      {
        id: 's3',
        name: 'S3 Storage',
        type: 'storage',
        provider: 'aws',
        position: { x: 800, y: 150 },
        icon: '🪣',
        connections: []
      }
    ];

    setServices(sampleServices);
  };

  const renderCloudDiagram = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = '';

    // Create definitions for patterns and gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Gradient for AWS services
    const awsGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    awsGradient.setAttribute('id', 'awsGradient');
    awsGradient.innerHTML = `
      <stop offset="0%" style="stop-color:#FF9900;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#FF9900;stop-opacity:0.3" />
    `;
    
    defs.appendChild(awsGradient);

    // Arrow marker
    const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    arrowMarker.setAttribute('id', 'cloudArrow');
    arrowMarker.setAttribute('markerWidth', '10');
    arrowMarker.setAttribute('markerHeight', '10');
    arrowMarker.setAttribute('refX', '9');
    arrowMarker.setAttribute('refY', '3');
    arrowMarker.setAttribute('orient', 'auto');
    arrowMarker.innerHTML = '<path d="M0,0 L0,6 L9,3 z" fill="#4a90e2" />';
    
    defs.appendChild(arrowMarker);
    svg.appendChild(defs);

    // Render connections first
    services.forEach(service => {
      service.connections.forEach(targetId => {
        const targetService = services.find(s => s.id === targetId);
        if (targetService) {
          renderConnection(svg, service, targetService);
        }
      });
    });

    // Render services
    services.forEach(service => {
      renderCloudService(svg, service);
    });

    // Add cloud regions/zones
    renderCloudRegions(svg);
  };

  const renderCloudService = (svg: SVGSVGElement, service: CloudService) => {
    const serviceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    serviceGroup.setAttribute('class', 'cloud-service');
    serviceGroup.setAttribute('data-service-id', service.id);
    
    if (!readonly) {
      serviceGroup.style.cursor = 'move';
      serviceGroup.addEventListener('mousedown', (e) => handleServiceMouseDown(e, service.id));
    }

    const serviceWidth = 120;
    const serviceHeight = 80;

    // Service background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', service.position.x.toString());
    rect.setAttribute('y', service.position.y.toString());
    rect.setAttribute('width', serviceWidth.toString());
    rect.setAttribute('height', serviceHeight.toString());
    rect.setAttribute('rx', '12');
    rect.setAttribute('fill', getServiceColor(service.type, service.provider));
    rect.setAttribute('stroke', getServiceBorderColor(service.provider));
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');

    // Service icon
    const iconText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    iconText.setAttribute('x', (service.position.x + serviceWidth / 2).toString());
    iconText.setAttribute('y', (service.position.y + 30).toString());
    iconText.setAttribute('text-anchor', 'middle');
    iconText.setAttribute('font-size', '24');
    iconText.textContent = service.icon;

    // Service name
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', (service.position.x + serviceWidth / 2).toString());
    nameText.setAttribute('y', (service.position.y + serviceHeight - 15).toString());
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('font-family', 'Inter, sans-serif');
    nameText.setAttribute('font-size', '10');
    nameText.setAttribute('font-weight', '500');
    nameText.setAttribute('fill', '#1a1a1a');
    nameText.textContent = service.name;

    // Provider badge
    const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    badgeRect.setAttribute('x', (service.position.x + serviceWidth - 25).toString());
    badgeRect.setAttribute('y', (service.position.y + 5).toString());
    badgeRect.setAttribute('width', '20');
    badgeRect.setAttribute('height', '12');
    badgeRect.setAttribute('rx', '6');
    badgeRect.setAttribute('fill', getProviderColor(service.provider));

    const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeText.setAttribute('x', (service.position.x + serviceWidth - 15).toString());
    badgeText.setAttribute('y', (service.position.y + 13).toString());
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.setAttribute('font-family', 'Inter, sans-serif');
    badgeText.setAttribute('font-size', '8');
    badgeText.setAttribute('font-weight', '600');
    badgeText.setAttribute('fill', 'white');
    badgeText.textContent = service.provider.toUpperCase();

    serviceGroup.appendChild(rect);
    serviceGroup.appendChild(iconText);
    serviceGroup.appendChild(nameText);
    serviceGroup.appendChild(badgeRect);
    serviceGroup.appendChild(badgeText);

    svg.appendChild(serviceGroup);
  };

  const renderConnection = (svg: SVGSVGElement, fromService: CloudService, toService: CloudService) => {
    const fromCenter = {
      x: fromService.position.x + 60,
      y: fromService.position.y + 40
    };
    
    const toCenter = {
      x: toService.position.x + 60,
      y: toService.position.y + 40
    };

    // Calculate connection points on edges of rectangles
    const angle = Math.atan2(toCenter.y - fromCenter.y, toCenter.x - fromCenter.x);
    
    const fromPoint = {
      x: fromCenter.x + Math.cos(angle) * 60,
      y: fromCenter.y + Math.sin(angle) * 40
    };
    
    const toPoint = {
      x: toCenter.x - Math.cos(angle) * 60,
      y: toCenter.y - Math.sin(angle) * 40
    };

    // Connection line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromPoint.x.toString());
    line.setAttribute('y1', fromPoint.y.toString());
    line.setAttribute('x2', toPoint.x.toString());
    line.setAttribute('y2', toPoint.y.toString());
    line.setAttribute('stroke', '#4a90e2');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    line.setAttribute('marker-end', 'url(#cloudArrow)');

    svg.appendChild(line);
  };

  const renderCloudRegions = (svg: SVGSVGElement) => {
    // Add a background region
    const regionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    regionRect.setAttribute('x', '20');
    regionRect.setAttribute('y', '20');
    regionRect.setAttribute('width', (width - 40).toString());
    regionRect.setAttribute('height', (height - 40).toString());
    regionRect.setAttribute('fill', 'none');
    regionRect.setAttribute('stroke', '#e0e0e0');
    regionRect.setAttribute('stroke-width', '2');
    regionRect.setAttribute('stroke-dasharray', '10,10');
    regionRect.setAttribute('rx', '20');

    // Region label
    const regionLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    regionLabel.setAttribute('x', '40');
    regionLabel.setAttribute('y', '40');
    regionLabel.setAttribute('font-family', 'Inter, sans-serif');
    regionLabel.setAttribute('font-size', '12');
    regionLabel.setAttribute('font-weight', '600');
    regionLabel.setAttribute('fill', '#666');
    regionLabel.textContent = 'Cloud Region: us-east-1';

    svg.insertBefore(regionRect, svg.firstChild);
    svg.appendChild(regionLabel);
  };

  const getServiceColor = (type: string, provider: string): string => {
    const colors = {
      compute: '#e3f2fd',
      storage: '#fff3e0',
      database: '#f3e5f5',
      network: '#e8f5e8',
      security: '#ffebee',
      analytics: '#e0f2f1'
    };
    return colors[type as keyof typeof colors] || '#f5f5f5';
  };

  const getServiceBorderColor = (provider: string): string => {
    const colors = {
      aws: '#ff9900',
      azure: '#0078d4',
      gcp: '#4285f4',
      generic: '#666666'
    };
    return colors[provider as keyof typeof colors] || '#666666';
  };

  const getProviderColor = (provider: string): string => {
    const colors = {
      aws: '#ff9900',
      azure: '#0078d4',
      gcp: '#4285f4',
      generic: '#666666'
    };
    return colors[provider as keyof typeof colors] || '#666666';
  };

  const handleServiceMouseDown = (e: MouseEvent, serviceId: string) => {
    if (readonly) return;
    
    e.preventDefault();
    setDraggedService(serviceId);
    
    const handleMouseMove = (e: MouseEvent) => {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      
      const newX = e.clientX - svgRect.left - 60;
      const newY = e.clientY - svgRect.top - 40;
      
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
          : service
      ));
    };
    
    const handleMouseUp = () => {
      setDraggedService(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (onContentChange) {
        const updatedContent: DiagramContent = {
          ...content,
          visual: { services }
        };
        onContentChange(updatedContent);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {!readonly && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm text-xs">
          <div className="font-medium mb-1">Cloud Architecture Editor</div>
          <div className="text-gray-600">
            • Drag services to reposition<br/>
            • Connections show data flow
          </div>
        </div>
      )}
    </div>
  );
}