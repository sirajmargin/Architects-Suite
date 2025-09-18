const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const architectureTemplates = {
  vpc: {
    code: `graph TD
    VPC1[🏢 VPC A<br/>10.0.0.0/16] --> PCX[🔗 VPC Peering<br/>Connection]
    PCX --> VPC2[🏢 VPC B<br/>10.1.0.0/16]
    VPC1 --> RT1[📋 Route Table A]
    VPC2 --> RT2[📋 Route Table B]
    VPC1 --> SG1[🛡️ Security Group A]
    VPC2 --> SG2[🛡️ Security Group B]`,
    services: [
      { id: 'vpc1', name: 'VPC A (10.0.0.0/16)', type: 'network', provider: 'aws', position: { x: 50, y: 150 }, icon: '🏢', connections: ['pcx', 'rt1', 'sg1'] },
      { id: 'pcx', name: 'VPC Peering Connection', type: 'network', provider: 'aws', position: { x: 300, y: 200 }, icon: '🔗', connections: ['vpc2'] },
      { id: 'vpc2', name: 'VPC B (10.1.0.0/16)', type: 'network', provider: 'aws', position: { x: 550, y: 150 }, icon: '🏢', connections: ['rt2', 'sg2'] },
      { id: 'rt1', name: 'Route Table A', type: 'network', provider: 'aws', position: { x: 50, y: 300 }, icon: '📋', connections: [] },
      { id: 'rt2', name: 'Route Table B', type: 'network', provider: 'aws', position: { x: 550, y: 300 }, icon: '📋', connections: [] },
      { id: 'sg1', name: 'Security Group A', type: 'security', provider: 'aws', position: { x: 150, y: 350 }, icon: '🛡️', connections: [] },
      { id: 'sg2', name: 'Security Group B', type: 'security', provider: 'aws', position: { x: 450, y: 350 }, icon: '🛡️', connections: [] }
    ]
  },
  microservices: {
    code: `graph TD
    User[👤 User] --> Gateway[🚪 API Gateway]
    Gateway --> UserSvc[⚙️ User Service]
    Gateway --> OrderSvc[⚙️ Order Service]
    UserSvc --> UserDB[(🗄️ User DB)]
    OrderSvc --> OrderDB[(🗄️ Order DB)]`,
    services: [
      { id: 'user', name: 'User', type: 'compute', provider: 'generic', position: { x: 50, y: 200 }, icon: '👤', connections: ['gateway'] },
      { id: 'gateway', name: 'API Gateway', type: 'network', provider: 'aws', position: { x: 200, y: 200 }, icon: '🚪', connections: ['user-svc', 'order-svc'] },
      { id: 'user-svc', name: 'User Service', type: 'compute', provider: 'aws', position: { x: 400, y: 150 }, icon: '⚙️', connections: ['user-db'] },
      { id: 'order-svc', name: 'Order Service', type: 'compute', provider: 'aws', position: { x: 400, y: 250 }, icon: '⚙️', connections: ['order-db'] },
      { id: 'user-db', name: 'User DB', type: 'database', provider: 'aws', position: { x: 600, y: 150 }, icon: '🗄️', connections: [] },
      { id: 'order-db', name: 'Order DB', type: 'database', provider: 'aws', position: { x: 600, y: 250 }, icon: '🗄️', connections: [] }
    ]
  },
  serverless: {
    code: `graph TD
    User[👤 User] --> API[🚪 API Gateway]
    API --> Lambda[λ Lambda]
    Lambda --> DDB[(📊 DynamoDB)]`,
    services: [
      { id: 'user', name: 'User', type: 'compute', provider: 'generic', position: { x: 50, y: 200 }, icon: '👤', connections: ['api'] },
      { id: 'api', name: 'API Gateway', type: 'network', provider: 'aws', position: { x: 200, y: 200 }, icon: '🚪', connections: ['lambda'] },
      { id: 'lambda', name: 'Lambda', type: 'compute', provider: 'aws', position: { x: 400, y: 200 }, icon: 'λ', connections: ['dynamodb'] },
      { id: 'dynamodb', name: 'DynamoDB', type: 'database', provider: 'aws', position: { x: 600, y: 200 }, icon: '📊', connections: [] }
    ]
  }
};

app.post('/generate', (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required and must be a string'
    });
  }
  
  const promptLower = prompt.toLowerCase();
  
  let template = architectureTemplates.serverless; // default
  if (promptLower.includes('vpc') || promptLower.includes('peering')) template = architectureTemplates.vpc;
  if (promptLower.includes('microservice')) template = architectureTemplates.microservices;
  
  res.json({
    success: true,
    content: {
      code: template.code,
      visual: { services: template.services }
    }
  });
});

app.listen(3001, () => {
  console.log('AI Service running on port 3001');
});