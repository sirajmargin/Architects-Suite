const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function svgToDrawIO(services) {
  const cells = services.map((service, index) => ({
    id: (index + 2).toString(),
    value: `${service.icon} ${service.name}`,
    style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#e3f2fd;strokeColor=#1976d2;',
    vertex: '1',
    parent: '1',
    geometry: {
      x: service.position.x,
      y: service.position.y,
      width: 120,
      height: 80
    }
  }));

  return `<mxfile><diagram><mxGraphModel><root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    ${cells.map(cell => `<mxCell id="${cell.id}" value="${cell.value}" style="${cell.style}" vertex="${cell.vertex}" parent="${cell.parent}">
      <mxGeometry x="${cell.geometry.x}" y="${cell.geometry.y}" width="${cell.geometry.width}" height="${cell.geometry.height}" as="geometry"/>
    </mxCell>`).join('')}
  </root></mxGraphModel></diagram></mxfile>`;
}

app.post('/convert-drawio', (req, res) => {
  const { services } = req.body;
  const xml = svgToDrawIO(services);
  res.json({ success: true, xml });
});

app.get('/diagrams', (req, res) => {
  res.json({
    success: true,
    diagrams: [
      { id: '1', title: 'Sample Architecture', type: 'cloud-architecture', createdAt: new Date().toISOString() }
    ]
  });
});

app.listen(3002, () => {
  console.log('Diagram Service running on port 3002');
});