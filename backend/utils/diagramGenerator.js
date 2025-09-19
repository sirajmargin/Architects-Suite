const OpenAI = require('openai');
const logger = require('./logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate draw.io compatible XML from architecture description
 */
async function generateDiagramXMLFromDescription(architectureDescription, components = [], style = 'modern') {
  try {
    const prompt = `Create a draw.io compatible XML diagram for this architecture:

${architectureDescription}

Components: ${components.join(', ')}
Style: ${style}

Generate a professional, well-organized diagram XML that includes:
1. Proper mxGraphModel structure
2. Components positioned logically
3. Connections showing data/control flow
4. Modern styling with appropriate colors
5. Clear labels and groupings

The XML should be valid draw.io format that can be imported directly.

Return only the XML content, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in creating draw.io diagrams. Generate only valid draw.io XML without any additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    let xml = completion.choices[0].message.content.trim();
    
    // Remove any markdown formatting if present
    xml = xml.replace(/```xml\n?/, '').replace(/```\n?$/, '');
    
    // Validate basic XML structure
    if (!xml.includes('<mxfile') || !xml.includes('</mxfile>')) {
      // Fallback to template if AI doesn't generate proper XML
      xml = generateTemplateXML(architectureDescription, components);
    }

    return xml;

  } catch (error) {
    logger.error('Error generating diagram XML:', error);
    // Return a basic template on error
    return generateTemplateXML(architectureDescription, components);
  }
}

/**
 * Generate a basic template XML for fallback
 */
function generateTemplateXML(description, components) {
  const componentBoxes = components.slice(0, 6).map((component, index) => {
    const x = 100 + (index % 3) * 200;
    const y = 100 + Math.floor(index / 3) * 150;
    
    return `<mxCell id="component${index + 1}" value="${component}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
              <mxGeometry x="${x}" y="${y}" width="160" height="80" as="geometry"/>
            </mxCell>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2025-09-19T00:00:00.000Z" agent="IT Architects Suite" version="22.0.0">
  <diagram name="Architecture" id="architecture-diagram">
    <mxGraphModel dx="1426" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="title" value="${description}" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=16;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="400" height="30" as="geometry"/>
        </mxCell>
        ${componentBoxes}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

module.exports = {
  generateDiagramXMLFromDescription
};