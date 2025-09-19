# Deployment Guide
# IT Architects Suite

## Overview

This guide covers the deployment of the IT Architects Suite application using Docker containers and cloud-native technologies.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for development)
- Git
- 4GB RAM minimum, 8GB recommended
- Modern web browser

## Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/it-architects-suite.git
   cd it-architects-suite
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - API: http://localhost:3001
   - AI Service: http://localhost:5000
   - Monitoring: http://localhost:3000 (Grafana)

### Production Deployment

#### Using Docker

1. **Build the production image:**
   ```bash
   docker build -t it-architects-suite:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -d \\
     --name architects-suite \\
     -p 8080:8080 \\
     it-architects-suite:latest
   ```

#### Using Kubernetes

1. **Apply the Kubernetes manifests:**
   ```bash
   kubectl apply -f k8s/
   ```

2. **Verify deployment:**
   ```bash
   kubectl get pods -l app=architects-suite
   ```

## Environment Variables

### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `API_BASE_URL` | Backend API URL | `http://backend:3001` |
| `AI_SERVICE_URL` | AI service URL | `http://ai-service:5000` |

### Backend Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | No |

### AI Service Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `MODEL_PATH` | ML models directory | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | No |
| `MAX_WORKERS` | Number of worker processes | No |

## Database Setup

### PostgreSQL

1. **Create database:**
   ```sql
   CREATE DATABASE architects_db;
   CREATE USER architects_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE architects_db TO architects_user;
   ```

2. **Run migrations:**
   ```bash
   npm run migrate
   ```

### MongoDB

1. **Initialize database:**
   ```javascript
   use architects_diagrams;
   db.createUser({
     user: "architects_user",
     pwd: "secure_password",
     roles: [{ role: "readWrite", db: "architects_diagrams" }]
   });
   ```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS

1. **Create ECS cluster:**
   ```bash
   aws ecs create-cluster --cluster-name architects-suite
   ```

2. **Deploy task definition:**
   ```bash
   aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
   ```

3. **Create service:**
   ```bash
   aws ecs create-service \\
     --cluster architects-suite \\
     --service-name architects-suite-service \\
     --task-definition architects-suite:1 \\
     --desired-count 2
   ```

#### Using AWS EKS

1. **Create EKS cluster:**
   ```bash
   eksctl create cluster --name architects-suite --region us-west-2
   ```

2. **Deploy application:**
   ```bash
   kubectl apply -f k8s/aws/
   ```

### Azure Deployment

#### Using Azure Container Instances

1. **Create resource group:**
   ```bash
   az group create --name architects-suite-rg --location eastus
   ```

2. **Deploy container:**
   ```bash
   az container create \\
     --resource-group architects-suite-rg \\
     --name architects-suite \\
     --image your-registry/it-architects-suite:latest \\
     --ports 8080
   ```

### Google Cloud Deployment

#### Using Google Cloud Run

1. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy architects-suite \\
     --image gcr.io/your-project/it-architects-suite:latest \\
     --platform managed \\
     --region us-central1
   ```

## Monitoring and Logging

### Prometheus Metrics

The application exposes metrics at `/metrics` endpoint:
- `http_requests_total`
- `ai_generation_duration_seconds`
- `architecture_validation_errors_total`

### Grafana Dashboards

Import the provided dashboards:
- Application Performance Dashboard
- AI Service Metrics Dashboard
- Infrastructure Overview Dashboard

### Log Aggregation

#### Using ELK Stack

1. **Configure Filebeat:**
   ```yaml
   filebeat.inputs:
   - type: container
     paths:
       - '/var/lib/docker/containers/*/*.log'
   ```

2. **Logstash configuration:**
   ```ruby
   input {
     beats {
       port => 5044
     }
   }
   ```

## Security Configuration

### SSL/TLS Setup

1. **Generate certificates:**
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\
     -keyout architects-suite.key \\
     -out architects-suite.crt
   ```

2. **Configure nginx:**
   ```nginx
   server {
     listen 443 ssl;
     ssl_certificate /etc/ssl/architects-suite.crt;
     ssl_certificate_key /etc/ssl/architects-suite.key;
   }
   ```

### Authentication Setup

#### OAuth 2.0 Configuration

```yaml
oauth:
  providers:
    - name: google
      client_id: ${GOOGLE_CLIENT_ID}
      client_secret: ${GOOGLE_CLIENT_SECRET}
    - name: microsoft
      client_id: ${MICROSOFT_CLIENT_ID}
      client_secret: ${MICROSOFT_CLIENT_SECRET}
```

## Performance Optimization

### Frontend Optimization

1. **Enable compression:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Configure caching:**
   ```nginx
   location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

### Backend Optimization

1. **Connection pooling:**
   ```javascript
   const pool = new Pool({
     host: 'localhost',
     database: 'architects_db',
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Redis caching:**
   ```javascript
   const redis = new Redis({
     host: 'localhost',
     port: 6379,
     retryDelayOnFailover: 100,
     maxRetriesPerRequest: 3,
   });
   ```

## Backup and Recovery

### Database Backup

#### PostgreSQL

```bash
# Daily backup
pg_dump -h localhost -U architects_user -d architects_db > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U architects_user -d architects_db < backup_20250919.sql
```

#### MongoDB

```bash
# Backup
mongodump --host localhost:27017 --db architects_diagrams --out backup/

# Restore
mongorestore --host localhost:27017 --db architects_diagrams backup/architects_diagrams/
```

### Application Data Backup

```bash
# Backup configuration and data
tar -czf architects-suite-backup-$(date +%Y%m%d).tar.gz \\
    config/ \\
    data/ \\
    logs/
```

## Troubleshooting

### Common Issues

#### Container Won't Start

1. **Check logs:**
   ```bash
   docker logs architects-suite-frontend
   ```

2. **Verify environment variables:**
   ```bash
   docker exec architects-suite-frontend env
   ```

#### Database Connection Issues

1. **Test connectivity:**
   ```bash
   telnet postgres-host 5432
   ```

2. **Check credentials:**
   ```bash
   psql -h postgres-host -U architects_user -d architects_db
   ```

#### AI Service Errors

1. **Check API keys:**
   ```bash
   curl -H "Authorization: Bearer ${OPENAI_API_KEY}" \\
        https://api.openai.com/v1/models
   ```

2. **Monitor resource usage:**
   ```bash
   docker stats architects-suite-ai
   ```

### Performance Issues

#### High Memory Usage

1. **Adjust container limits:**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2G
       reservations:
         memory: 1G
   ```

#### Slow Response Times

1. **Enable APM monitoring:**
   ```javascript
   const apm = require('elastic-apm-node').start({
     serviceName: 'architects-suite',
     serverUrl: 'http://apm-server:8200'
   });
   ```

## Health Checks

### Application Health

```bash
# Frontend health
curl http://localhost:8080/health

# Backend health
curl http://localhost:3001/health

# AI service health
curl http://localhost:5000/health
```

### Database Health

```bash
# PostgreSQL
pg_isready -h localhost -p 5432 -U architects_user

# MongoDB
mongosh --host localhost:27017 --eval "db.adminCommand('ping')"

# Redis
redis-cli ping
```

## Scaling

### Horizontal Scaling

#### Docker Swarm

```bash
docker service scale architects-suite_frontend=3
docker service scale architects-suite_backend=5
```

#### Kubernetes

```bash
kubectl scale deployment architects-suite-frontend --replicas=3
kubectl scale deployment architects-suite-backend --replicas=5
```

### Auto-scaling

#### Kubernetes HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: architects-suite-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: architects-suite-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Maintenance

### Updates

1. **Rolling updates:**
   ```bash
   kubectl set image deployment/architects-suite-frontend \\
     frontend=it-architects-suite:v2.0.0
   ```

2. **Zero-downtime deployment:**
   ```bash
   docker service update --image it-architects-suite:v2.0.0 \\
     architects-suite_frontend
   ```

### Cleanup

1. **Remove old images:**
   ```bash
   docker image prune -a
   ```

2. **Clean up logs:**
   ```bash
   find /var/log -name "*.log" -mtime +7 -delete
   ```

## Support

For deployment issues:
- Check the troubleshooting section
- Review application logs
- Contact the development team
- Create an issue in the project repository