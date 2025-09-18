# Deployment Guide
## Architects Suite

### Prerequisites

#### System Requirements
- **OS:** Linux, macOS, or Windows
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Storage:** 10GB available space
- **Network:** Internet connection for dependencies

#### Software Dependencies
- **Docker:** 20.10+ with Docker Compose
- **Node.js:** 18+ (for local development)
- **Git:** Latest version
- **curl:** For health checks and testing

### Quick Start Deployment

#### 1. Clone Repository
```bash
git clone <repository-url>
cd architects-suite
```

#### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

#### 3. Start Services
```bash
# Option 1: Docker Compose (Recommended)
docker-compose -f docker-compose.dev.yml up --build

# Option 2: Local Development
npm run microservices

# Option 3: Windows Batch
start-docker.bat
```

#### 4. Verify Deployment
```bash
# Run automated tests
test-features.bat

# Manual verification
curl http://localhost:3000  # Frontend
curl http://localhost:3001  # AI Service
curl http://localhost:3002  # Diagram Service
curl http://localhost:3003  # PPT Service
```

### Production Deployment

#### Docker Compose Production
```bash
# Create production environment
cp .env.example .env.production

# Configure production settings
nano .env.production

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n architects-suite

# Monitor logs
kubectl logs -f deployment/architects-suite-app
```

#### Cloud Deployment Options

**AWS ECS:**
```bash
# Build and push images
docker build -t architects-suite-frontend .
docker tag architects-suite-frontend:latest <ecr-repo>/frontend:latest
docker push <ecr-repo>/frontend:latest

# Deploy ECS service
aws ecs update-service --cluster architects-suite --service frontend
```

**Azure Container Instances:**
```bash
# Create resource group
az group create --name architects-suite --location eastus

# Deploy container group
az container create --resource-group architects-suite \
  --name architects-suite --image <acr-repo>/frontend:latest
```

**Google Cloud Run:**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/<project>/frontend
gcloud run deploy --image gcr.io/<project>/frontend --platform managed
```

### Environment Configuration

#### Required Environment Variables
```bash
# Service URLs
NEXT_PUBLIC_AI_SERVICE_URL=http://ai-service:3001
NEXT_PUBLIC_DIAGRAM_SERVICE_URL=http://diagram-service:3002
NEXT_PUBLIC_PPT_SERVICE_URL=http://ppt-service:3003

# Application Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Security
JWT_SECRET=your-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
```

#### Optional Configuration
```bash
# Database (if using persistent storage)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Load Balancer Configuration

#### Nginx Configuration
```nginx
upstream frontend {
    server frontend:3000;
}

upstream ai-service {
    server ai-service:3001;
}

server {
    listen 80;
    server_name architects-suite.com;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ai/ {
        proxy_pass http://ai-service/;
    }
}
```

#### HAProxy Configuration
```
backend frontend
    balance roundrobin
    server web1 frontend:3000 check

backend ai-service
    balance roundrobin
    server ai1 ai-service:3001 check
```

### SSL/TLS Setup

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d architects-suite.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual SSL Certificate
```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate certificate signing request
openssl req -new -key private.key -out certificate.csr

# Install certificate in nginx/apache
```

### Monitoring and Logging

#### Health Check Endpoints
```bash
# Application health
curl http://localhost:3000/api/health

# Service-specific health
curl http://localhost:3001/health  # AI Service
curl http://localhost:3002/health  # Diagram Service
curl http://localhost:3003/health  # PPT Service
```

#### Log Aggregation
```yaml
# docker-compose.yml logging
services:
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Monitoring Stack
```bash
# Start monitoring with Prometheus/Grafana
docker-compose --profile monitoring up -d

# Access dashboards
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

### Backup and Recovery

#### Database Backup
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20241201.sql
```

#### Application Data Backup
```bash
# Backup user data and configurations
docker run --rm -v architects-suite_data:/data \
  -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

#### Disaster Recovery Plan
1. **Automated Backups:** Daily database and file backups
2. **Multi-Region:** Deploy in multiple availability zones
3. **Failover:** Automatic failover to backup instances
4. **Recovery Testing:** Monthly disaster recovery drills

### Performance Optimization

#### Caching Strategy
```bash
# Redis for session caching
REDIS_URL=redis://redis:6379

# CDN for static assets
CLOUDFRONT_DOMAIN=d123456789.cloudfront.net
```

#### Database Optimization
```sql
-- Add indexes for frequent queries
CREATE INDEX idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX idx_diagrams_created_at ON diagrams(created_at);
```

#### Container Resource Limits
```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Security Hardening

#### Container Security
```dockerfile
# Use non-root user
USER node

# Remove unnecessary packages
RUN apk del build-dependencies

# Set read-only filesystem
--read-only --tmpfs /tmp
```

#### Network Security
```yaml
# Restrict network access
networks:
  internal:
    internal: true
  external:
    driver: bridge
```

#### Environment Security
```bash
# Use secrets management
docker secret create jwt_secret jwt_secret.txt
docker service create --secret jwt_secret architects-suite
```

### Troubleshooting

#### Common Deployment Issues

**Port Conflicts:**
```bash
# Check port usage
netstat -tulpn | grep :3000

# Kill conflicting processes
sudo kill -9 $(lsof -t -i:3000)
```

**Memory Issues:**
```bash
# Check memory usage
docker stats

# Increase memory limits
docker-compose up --memory=2g
```

**Network Issues:**
```bash
# Check Docker networks
docker network ls

# Inspect network configuration
docker network inspect architects-suite_app-network
```

#### Log Analysis
```bash
# View service logs
docker-compose logs -f frontend
docker-compose logs -f ai-service

# Filter logs by level
docker-compose logs | grep ERROR
```

### Maintenance

#### Regular Updates
```bash
# Update base images
docker-compose pull

# Rebuild with latest changes
docker-compose up --build

# Clean unused resources
docker system prune -a
```

#### Performance Monitoring
```bash
# Monitor resource usage
docker stats --no-stream

# Check application metrics
curl http://localhost:3000/api/metrics
```