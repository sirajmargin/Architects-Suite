export class DrawIOConverter {
  static svgToDrawIO(svgContent: string, services: any[]): string {
    const cells: any[] = [];
    let cellId = 1;

    // Add root cell
    cells.push({
      id: "0",
      value: "",
      style: "",
      vertex: "1"
    });

    // Add parent cell
    cells.push({
      id: "1",
      value: "",
      style: "",
      vertex: "1",
      parent: "0"
    });

    // Convert services to draw.io cells
    services.forEach((service, index) => {
      const serviceId = (cellId++).toString();
      
      cells.push({
        id: serviceId,
        value: `${service.icon} ${service.name}`,
        style: `rounded=1;whiteSpace=wrap;html=1;fillColor=#e3f2fd;strokeColor=#1976d2;fontStyle=1;`,
        vertex: "1",
        parent: "1",
        geometry: {
          x: service.position.x,
          y: service.position.y,
          width: 120,
          height: 80,
          as: "geometry"
        }
      });

      // Add connections
      service.connections?.forEach((targetId: string) => {
        const target = services.find(s => s.id === targetId);
        if (target) {
          const edgeId = (cellId++).toString();
          const targetCellId = services.findIndex(s => s.id === targetId) + 2;
          
          cells.push({
            id: edgeId,
            value: "",
            style: "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#4a90e2;strokeWidth=2;",
            edge: "1",
            parent: "1",
            source: serviceId,
            target: targetCellId.toString(),
            geometry: {
              relative: "1",
              as: "geometry"
            }
          });
        }
      });
    });

    const mxGraphModel = {
      dx: "1422",
      dy: "794",
      grid: "1",
      gridSize: "10",
      guides: "1",
      tooltips: "1",
      connect: "1",
      arrows: "1",
      fold: "1",
      page: "1",
      pageScale: "1",
      pageWidth: "827",
      pageHeight: "1169",
      math: "0",
      shadow: "0",
      root: {
        mxCell: cells
      }
    };

    return `<mxfile host="app.diagrams.net">
      <diagram name="Architecture">
        <mxGraphModel ${Object.entries(mxGraphModel).filter(([k]) => k !== 'root').map(([k, v]) => `${k}="${v}"`).join(' ')}>
          <root>
            ${cells.map(cell => this.cellToXML(cell)).join('\n            ')}
          </root>
        </mxGraphModel>
      </diagram>
    </mxfile>`;
  }

  private static cellToXML(cell: any): string {
    let xml = `<mxCell id="${cell.id}"`;
    
    if (cell.value) xml += ` value="${cell.value}"`;
    if (cell.style) xml += ` style="${cell.style}"`;
    if (cell.vertex) xml += ` vertex="${cell.vertex}"`;
    if (cell.edge) xml += ` edge="${cell.edge}"`;
    if (cell.parent) xml += ` parent="${cell.parent}"`;
    if (cell.source) xml += ` source="${cell.source}"`;
    if (cell.target) xml += ` target="${cell.target}"`;
    
    if (cell.geometry) {
      xml += `>
        <mxGeometry ${Object.entries(cell.geometry).map(([k, v]) => `${k}="${v}"`).join(' ')} />
      </mxCell>`;
    } else {
      xml += ' />';
    }
    
    return xml;
  }
}