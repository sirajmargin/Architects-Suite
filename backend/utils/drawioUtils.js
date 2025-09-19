const xml2js = require('xml2js');
const logger = require('./logger');

/**
 * Generate draw.io XML with proper structure
 */
async function generateDrawIOXML(architectureSpec, components = []) {
  try {
    // This is a comprehensive function to generate proper draw.io XML
    // For MVP, returning a structured template
    
    const xml = createDrawIOTemplate(architectureSpec, components);
    return xml;
    
  } catch (error) {
    logger.error('Error generating draw.io XML:', error);
    throw error;
  }
}

/**
 * Validate draw.io XML format
 */
async function validateDrawIOXML(xml) {
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    
    // Check for required draw.io structure
    return !!(
      result.mxfile &&
      result.mxfile.diagram &&
      result.mxfile.diagram[0] &&
      result.mxfile.diagram[0].mxGraphModel
    );
    
  } catch (error) {
    logger.error('XML validation error:', error);
    return false;
  }
}

/**
 * Convert architecture to draw.io format
 */
async function convertToDrawIOFormat(architectureData) {
  try {
    const { components = [], connections = [], layout = 'hierarchical' } = architectureData;
    
    let xml = createDrawIOTemplate('Architecture Diagram', components);
    
    // Add connections if provided
    if (connections.length > 0) {
      xml = addConnectionsToXML(xml, connections);
    }
    
    return xml;
    
  } catch (error) {
    logger.error('Error converting to draw.io format:', error);
    throw error;
  }
}

/**
 * Create a basic draw.io template
 */
function createDrawIOTemplate(title, components = []) {
  const timestamp = new Date().toISOString();
  
  // Generate component cells
  const componentCells = components.map((component, index) => {
    const x = 100 + (index % 4) * 220;
    const y = 150 + Math.floor(index / 4) * 120;
    
    const componentType = detectComponentType(component);
    const style = getComponentStyle(componentType);
    
    return `<mxCell id="component_${index}" value="${escapeXML(component)}" style="${style}" vertex="1" parent="1">
              <mxGeometry x="${x}" y="${y}" width="180" height="80" as="geometry"/>
            </mxCell>`;
  }).join('\n        ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="IT-Architects-Suite" modified="${timestamp}" agent="IT Architects Suite AI" version="1.0.0">
  <diagram name="Architecture" id="arch_diagram_${Date.now()}">
    <mxGraphModel dx="1426" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        
        <!-- Title -->
        <mxCell id="title" value="${escapeXML(title)}" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=20;fontStyle=1;fontColor=#2c3e50;" vertex="1" parent="1">
          <mxGeometry x="100" y="30" width="500" height="40" as="geometry"/>
        </mxCell>
        
        <!-- Components -->
        ${componentCells}
        
        <!-- Architecture Layers -->
        ${generateArchitectureLayers()}
        
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

/**
 * Detect component type for styling
 */
function detectComponentType(component) {
  const componentLower = component.toLowerCase();
  
  if (componentLower.includes('database') || componentLower.includes('db')) return 'database';
  if (componentLower.includes('api') || componentLower.includes('gateway')) return 'api';
  if (componentLower.includes('frontend') || componentLower.includes('ui')) return 'frontend';
  if (componentLower.includes('service') || componentLower.includes('microservice')) return 'service';
  if (componentLower.includes('cache') || componentLower.includes('redis')) return 'cache';
  if (componentLower.includes('queue') || componentLower.includes('messaging')) return 'queue';
  if (componentLower.includes('load') || componentLower.includes('balancer')) return 'loadbalancer';
  if (componentLower.includes('security') || componentLower.includes('auth')) return 'security';
  
  return 'default';
}

/**
 * Get component style based on type
 */
function getComponentStyle(type) {
  const styles = {
    database: 'shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#ffe6cc;strokeColor=#d79b00;fontColor=#000000;',
    api: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontColor=#000000;',
    frontend: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontColor=#000000;',
    service: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontColor=#000000;',
    cache: 'ellipse;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontColor=#000000;',
    queue: 'shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#f8cecc;strokeColor=#b85450;fontColor=#000000;',
    loadbalancer: 'shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#d0cee2;strokeColor=#56517e;fontColor=#000000;',
    security: 'shape=shield;perimeter=shieldPerimeter;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#ffcccc;strokeColor=#cc0000;fontColor=#000000;',
    default: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;'
  };
  
  return styles[type] || styles.default;
}

/**
 * Generate architecture layers for better organization
 */
function generateArchitectureLayers() {
  return `
        <!-- Presentation Layer -->
        <mxCell id="presentation_layer" value="Presentation Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#e1f5fe;strokeColor=#01579b;fontColor=#01579b;dashed=1;dashPattern=5 5;" vertex="1" parent="1">
          <mxGeometry x="80" y="120" width="220" height="100" as="geometry"/>
        </mxCell>
        
        <!-- Business Layer -->
        <mxCell id="business_layer" value="Business Logic Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f3e5f5;strokeColor=#4a148c;fontColor=#4a148c;dashed=1;dashPattern=5 5;" vertex="1" parent="1">
          <mxGeometry x="320" y="120" width="220" height="100" as="geometry"/>
        </mxCell>
        
        <!-- Data Layer -->
        <mxCell id="data_layer" value="Data Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff3e0;strokeColor=#e65100;fontColor=#e65100;dashed=1;dashPattern=5 5;" vertex="1" parent="1">
          <mxGeometry x="560" y="120" width="220" height="100" as="geometry"/>
        </mxCell>`;
}

/**
 * Add connections to XML
 */
function addConnectionsToXML(xml, connections) {
  // This would parse the XML and add connection elements
  // For now, return the original XML
  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  generateDrawIOXML,
  validateDrawIOXML,
  convertToDrawIOFormat
};