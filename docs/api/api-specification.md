# API Specification
## Architects Suite REST API

### Base URLs
- **Development:** `http://localhost:3000/api`
- **AI Service:** `http://localhost:3001`
- **Diagram Service:** `http://localhost:3002`
- **PPT Service:** `http://localhost:3003`

### Authentication
All API requests require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## AI Service API

### Generate Architecture
Generate architecture diagram from natural language prompt.

**Endpoint:** `POST /generate`

**Request Body:**
```json
{
  "prompt": "Create a microservices architecture with user and order services"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "code": "graph TD\n    User[👤 User] --> Gateway[🚪 API Gateway]...",
    "visual": {
      "services": [
        {
          "id": "user",
          "name": "User",
          "type": "compute",
          "provider": "generic",
          "position": { "x": 50, "y": 200 },
          "icon": "👤",
          "connections": ["gateway"]
        }
      ]
    }
  }
}
```

## Diagram Service API

### Convert to Draw.io
Convert services to Draw.io XML format.

**Endpoint:** `POST /convert-drawio`

**Request Body:**
```json
{
  "services": [
    {
      "id": "user",
      "name": "User Service",
      "position": { "x": 100, "y": 100 }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "xml": "<mxfile><diagram>...</diagram></mxfile>"
}
```

### Get Diagrams
Retrieve user's diagrams.

**Endpoint:** `GET /diagrams`

**Query Parameters:**
- `limit` (optional): Number of diagrams to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "diagrams": [
    {
      "id": "1",
      "title": "Sample Architecture",
      "type": "cloud-architecture",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

## PPT Service API

### Generate Presentation
Generate PowerPoint presentation from architecture.

**Endpoint:** `POST /generate-ppt`

**Request Body:**
```json
{
  "services": [...],
  "prompt": "Microservices architecture description"
}
```

**Response:**
```json
{
  "success": true,
  "ppt": {
    "title": "Architecture Overview",
    "slides": [
      {
        "title": "Overview",
        "layout": "title",
        "content": ["Generated from: ..."]
      }
    ]
  }
}
```

### Get Statistics
Retrieve dashboard statistics.

**Endpoint:** `GET /stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalDiagrams": 5,
    "sharedDiagrams": 2,
    "collaborators": 3,
    "aiGeneratedDiagrams": 4
  }
}
```

## Frontend API Routes

### Dashboard
**Endpoint:** `GET /dashboard`
**Description:** Main dashboard page with statistics and recent diagrams

### Create Diagram
**Endpoint:** `GET /diagrams/create`
**Query Parameters:**
- `type`: Diagram type (flowchart, sequence, erd, cloud-architecture)
- `ai`: Enable AI features (true/false)
- `prompt`: Pre-filled prompt text

### Health Check
**Endpoint:** `GET /api/health`
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00Z",
  "services": {
    "ai": "healthy",
    "diagram": "healthy",
    "ppt": "healthy"
  }
}
```

## Error Responses

All APIs return consistent error format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-01T10:00:00Z"
}
```

### Common Error Codes
- `INVALID_REQUEST`: Malformed request body
- `UNAUTHORIZED`: Invalid or missing authentication
- `RATE_LIMITED`: Too many requests
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable
- `INTERNAL_ERROR`: Unexpected server error

## Rate Limiting
- **AI Generation:** 10 requests per minute per user
- **Diagram Operations:** 100 requests per minute per user
- **General API:** 1000 requests per hour per user

## Response Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error
- `503`: Service Unavailable