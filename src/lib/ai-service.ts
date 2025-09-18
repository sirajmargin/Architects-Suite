interface AIResponse {
  success: boolean;
  content?: {
    code: string;
    visual?: any;
  };
  error?: string;
}

export class AIService {
  private static async callOpenAI(prompt: string): Promise<string> {
    // Mock OpenAI call - replace with actual API
    const architecturePrompts = {
      microservices: `graph TD
    User[👤 User] --> Gateway[🚪 API Gateway]
    Gateway --> UserSvc[⚙️ User Service]
    Gateway --> OrderSvc[⚙️ Order Service]
    Gateway --> PaymentSvc[⚙️ Payment Service]
    UserSvc --> UserDB[(🗄️ User DB)]
    OrderSvc --> OrderDB[(🗄️ Order DB)]
    PaymentSvc --> PaymentDB[(🗄️ Payment DB)]`,
      
      serverless: `graph TD
    User[👤 User] --> API[🚪 API Gateway]
    API --> Auth[🔐 Authorizer]
    Auth --> Lambda1[λ User Function]
    Auth --> Lambda2[λ Order Function]
    Lambda1 --> DDB1[(📊 Users Table)]
    Lambda2 --> DDB2[(📊 Orders Table)]
    Lambda1 --> S3[🪣 S3 Storage]`,
      
      kubernetes: `graph TD
    User[👤 User] --> LB[⚖️ Load Balancer]
    LB --> Ingress[🚪 Ingress Controller]
    Ingress --> Frontend[🖥️ Frontend Pod]
    Ingress --> Backend[⚙️ Backend Pod]
    Backend --> DB[(🗄️ Database)]
    Backend --> Cache[(⚡ Redis Cache)]`,
      
      cicd: `graph TD
    Dev[👨‍💻 Developer] --> Git[📁 Git Repository]
    Git --> CI[🔄 CI Pipeline]
    CI --> Test[🧪 Tests]
    Test --> Build[🔨 Build]
    Build --> Registry[📦 Container Registry]
    Registry --> CD[🚀 CD Pipeline]
    CD --> Staging[🎭 Staging]
    CD --> Prod[🏭 Production]`
    };

    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('microservice')) return architecturePrompts.microservices;
    if (promptLower.includes('serverless') || promptLower.includes('lambda')) return architecturePrompts.serverless;
    if (promptLower.includes('kubernetes') || promptLower.includes('k8s')) return architecturePrompts.kubernetes;
    if (promptLower.includes('ci/cd') || promptLower.includes('pipeline')) return architecturePrompts.cicd;
    
    // Default cloud architecture
    return `graph TD
    User[👤 User] --> ALB[⚖️ Application Load Balancer]
    ALB --> Web[🖥️ Web Server]
    Web --> API[🚪 API Gateway]
    API --> Lambda[λ Lambda Function]
    Lambda --> RDS[(🗄️ RDS Database)]
    Lambda --> S3[🪣 S3 Storage]`;
  }

  private static generateVisualServices(prompt: string) {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('microservice')) {
      return {
        services: [
          { id: 'user', name: 'User', type: 'compute', provider: 'generic', position: { x: 50, y: 200 }, icon: '👤', connections: ['gateway'] },
          { id: 'gateway', name: 'API Gateway', type: 'network', provider: 'aws', position: { x: 200, y: 200 }, icon: '🚪', connections: ['user-svc', 'order-svc'] },
          { id: 'user-svc', name: 'User Service', type: 'compute', provider: 'aws', position: { x: 400, y: 150 }, icon: '⚙️', connections: ['user-db'] },
          { id: 'order-svc', name: 'Order Service', type: 'compute', provider: 'aws', position: { x: 400, y: 250 }, icon: '⚙️', connections: ['order-db'] },
          { id: 'user-db', name: 'User DB', type: 'database', provider: 'aws', position: { x: 600, y: 150 }, icon: '🗄️', connections: [] },
          { id: 'order-db', name: 'Order DB', type: 'database', provider: 'aws', position: { x: 600, y: 250 }, icon: '🗄️', connections: [] }
        ]
      };
    }
    
    if (promptLower.includes('serverless')) {
      return {
        services: [
          { id: 'user', name: 'User', type: 'compute', provider: 'generic', position: { x: 50, y: 200 }, icon: '👤', connections: ['api'] },
          { id: 'api', name: 'API Gateway', type: 'network', provider: 'aws', position: { x: 200, y: 200 }, icon: '🚪', connections: ['lambda'] },
          { id: 'lambda', name: 'Lambda', type: 'compute', provider: 'aws', position: { x: 400, y: 200 }, icon: 'λ', connections: ['dynamodb'] },
          { id: 'dynamodb', name: 'DynamoDB', type: 'database', provider: 'aws', position: { x: 600, y: 200 }, icon: '📊', connections: [] }
        ]
      };
    }
    
    // Default
    return {
      services: [
        { id: 'user', name: 'User', type: 'compute', provider: 'generic', position: { x: 50, y: 200 }, icon: '👤', connections: ['alb'] },
        { id: 'alb', name: 'Load Balancer', type: 'network', provider: 'aws', position: { x: 200, y: 200 }, icon: '⚖️', connections: ['web'] },
        { id: 'web', name: 'Web Server', type: 'compute', provider: 'aws', position: { x: 400, y: 200 }, icon: '🖥️', connections: ['db'] },
        { id: 'db', name: 'Database', type: 'database', provider: 'aws', position: { x: 600, y: 200 }, icon: '🗄️', connections: [] }
      ]
    };
  }

  static async generateArchitecture(prompt: string): Promise<AIResponse> {
    try {
      const code = await this.callOpenAI(prompt);
      const visual = this.generateVisualServices(prompt);
      
      return {
        success: true,
        content: {
          code,
          visual
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate architecture'
      };
    }
  }
}