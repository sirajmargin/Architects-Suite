const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function generatePPT(services, prompt) {
  const componentCount = services.length;
  const connectionCount = services.reduce((total, service) => total + (service.connections?.length || 0), 0);
  
  return {
    title: 'Architecture Overview',
    slides: [
      {
        title: 'Architecture Overview',
        layout: 'title',
        content: [
          `Generated from: "${prompt}"`,
          `Components: ${componentCount}`,
          `Connections: ${connectionCount}`
        ]
      },
      {
        title: 'System Components',
        layout: 'content',
        content: services.map(s => `• ${s.name} (${s.type})`)
      },
      {
        title: 'Architecture Diagram',
        layout: 'diagram',
        content: ['[Architecture Diagram]'],
        diagramData: services
      },
      {
        title: 'Summary',
        layout: 'summary',
        content: [
          `✓ ${componentCount} components identified`,
          `✓ ${connectionCount} connections mapped`,
          '• Consider security implementation',
          '• Plan monitoring strategy'
        ]
      }
    ]
  };
}

app.post('/generate-ppt', (req, res) => {
  const { services, prompt } = req.body;
  const ppt = generatePPT(services, prompt);
  res.json({ success: true, ppt });
});

app.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalDiagrams: 5,
      sharedDiagrams: 2,
      collaborators: 3,
      aiGeneratedDiagrams: 4
    }
  });
});

app.listen(3003, () => {
  console.log('PPT Service running on port 3003');
});