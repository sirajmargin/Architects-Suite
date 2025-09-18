# System Architecture Document
## Architects Suite

### 1. Architecture Overview

Architects Suite follows a microservices architecture pattern with the following key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Service    │    │ Diagram Service │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Node.js)     │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  PPT Service    │◄─────────────┘
                        │   (Node.js)     │
                        │   Port: 3003    │
                        └─────────────────┘
```

### 2. Service Breakdown

#### 2.1 Frontend Service (Port 3000)
- **Technology:** Next.js 14, React 18, TypeScript
- **Responsibilities:**
  - User interface and experience
  - Authentication and session management
  - API orchestration
  - Real-time collaboration UI

#### 2.2 AI Service (Port 3001)
- **Technology:** Node.js, Express
- **Responsibilities:**
  - Natural language processing
  - Architecture pattern recognition
  - Diagram code generation
  - AI model integration

#### 2.3 Diagram Service (Port 3002)
- **Technology:** Node.js, Express
- **Responsibilities:**
  - Diagram rendering and manipulation
  - Draw.io XML conversion
  - SVG generation
  - Diagram storage and retrieval

#### 2.4 PPT Service (Port 3003)
- **Technology:** Node.js, Express
- **Responsibilities:**
  - Presentation generation
  - Template management
  - Slide content creation
  - Export functionality

### 3. Data Flow

```
User Input → Frontend → AI Service → Diagram Generation
     ↓
Frontend ← AI Service ← Generated Content
     ↓
Multiple Views (Diagram/Draw.io/PPT/Code)
```

### 4. Technology Stack

#### Frontend
- **Framework:** Next.js 14
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Hooks

#### Backend Services
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Language:** JavaScript/TypeScript

#### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Networking:** Bridge Network

### 5. Security Architecture

- **Authentication:** JWT-based authentication
- **Authorization:** Role-based access control
- **Data Encryption:** TLS 1.3 for data in transit
- **Input Validation:** Comprehensive input sanitization
- **CORS:** Configured for secure cross-origin requests

### 6. Scalability Design

- **Horizontal Scaling:** Each service can be scaled independently
- **Load Balancing:** Support for multiple instances
- **Caching:** Redis for session and data caching
- **CDN:** Static asset delivery optimization

### 7. Monitoring & Observability

- **Health Checks:** Built-in health endpoints
- **Logging:** Structured logging across all services
- **Metrics:** Performance and usage metrics
- **Alerting:** Automated alert system for failures

### 8. Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
└─────────────────────┬───────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐        ┌───▼───┐        ┌───▼───┐
│ App 1 │        │ App 2 │        │ App N │
└───────┘        └───────┘        └───────┘
```

### 9. Data Storage

- **Session Storage:** Browser session storage for temporary data
- **Local Storage:** User preferences and settings
- **File Storage:** Generated diagrams and templates
- **Database:** PostgreSQL for persistent data (future)

### 10. API Design

#### RESTful Endpoints
- `POST /api/ai/generate` - Generate architecture from prompt
- `GET /api/diagrams` - Retrieve user diagrams
- `POST /api/diagrams/export` - Export diagram in various formats
- `GET /api/health` - Service health check

### 11. Performance Considerations

- **Lazy Loading:** Components loaded on demand
- **Code Splitting:** Optimized bundle sizes
- **Caching:** Aggressive caching strategies
- **Compression:** Gzip compression for responses

### 12. Disaster Recovery

- **Backup Strategy:** Regular automated backups
- **Failover:** Automatic service failover
- **Recovery Time:** RTO < 15 minutes, RPO < 5 minutes
- **Testing:** Regular disaster recovery testing