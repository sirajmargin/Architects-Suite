// Simple diagram controller for development
const logger = require('../utils/logger');

const createDiagram = async (req, res) => {
  try {
    const { xml, title, description } = req.body;
    
    // Mock diagram creation
    const diagram = {
      id: `diag_${Date.now()}`,
      title: title || 'New Diagram',
      description: description || 'Generated diagram',
      xml: xml || '<mxfile><diagram>Mock diagram</diagram></mxfile>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logger.info(`Created diagram: ${diagram.id}`);

    res.json({
      success: true,
      diagram
    });

  } catch (error) {
    logger.error('Error creating diagram:', error);
    res.status(500).json({ 
      error: 'Failed to create diagram',
      details: error.message
    });
  }
};

const updateDiagram = async (req, res) => {
  try {
    const { id } = req.params;
    const { xml, title, description } = req.body;
    
    // Mock diagram update
    const diagram = {
      id,
      title: title || 'Updated Diagram',
      description: description || 'Updated diagram',
      xml: xml || '<mxfile><diagram>Updated diagram</diagram></mxfile>',
      updatedAt: new Date().toISOString()
    };

    logger.info(`Updated diagram: ${id}`);

    res.json({
      success: true,
      diagram
    });

  } catch (error) {
    logger.error('Error updating diagram:', error);
    res.status(500).json({ 
      error: 'Failed to update diagram',
      details: error.message
    });
  }
};

const getDiagram = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock diagram retrieval
    const diagram = {
      id,
      title: 'Sample Diagram',
      description: 'Sample architecture diagram',
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Architecture" id="sample">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="2" value="Frontend" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="3" value="API Gateway" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="300" y="100" width="120" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="4" value="Database" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="200" y="250" width="120" height="60" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logger.info(`Retrieved diagram: ${id}`);

    res.json({
      success: true,
      diagram
    });

  } catch (error) {
    logger.error('Error retrieving diagram:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve diagram',
      details: error.message
    });
  }
};

const generateDiagram = async (req, res) => {
  try {
    const { architecture, sessionId } = req.body;
    
    if (!architecture) {
      return res.status(400).json({ error: 'Architecture data is required' });
    }

    // Generate simple XML based on architecture
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Generated Architecture" id="generated">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${architecture.components ? architecture.components.map((comp, index) => `
        <mxCell id="${index + 2}" value="${comp.name}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="${100 + (index * 150)}" y="${100 + (Math.floor(index / 3) * 120)}" width="120" height="60" as="geometry"/>
        </mxCell>`).join('') : ''}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    logger.info(`Generated diagram XML for session: ${sessionId}`);

    res.json({
      success: true,
      xml: xml,
      diagramId: `generated_${Date.now()}`,
      sessionId
    });

  } catch (error) {
    logger.error('Error generating diagram:', error);
    res.status(500).json({ 
      error: 'Failed to generate diagram',
      details: error.message
    });
  }
};

module.exports = {
  createDiagram,
  updateDiagram,
  getDiagram,
  generateDiagram
};