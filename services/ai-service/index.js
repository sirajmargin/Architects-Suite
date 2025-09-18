const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const architectureTemplates = {
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
  const promptLower = prompt.toLowerCase();
  
  let template = architectureTemplates.serverless; // default
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