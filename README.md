# Architects Suite - Complete Setup Guide

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd architects-suite

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- Git
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### 1. Environment Setup

Create `.env.local` with the following configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/architects_suite"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Security
ENCRYPTION_KEY="your-256-bit-encryption-key-in-hex"

# Integrations (Optional)
GITHUB_BOT_TOKEN="your-github-token"
SAML_ENTRY_POINT="https://your-idp.com/saml/sso"
SAML_CERT="your-saml-certificate"
```

### 2. Database Setup

```bash
# Install Prisma CLI
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed initial data
npm run db:seed
```

### 3. Redis Setup

```bash
# Install Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
# Set environment variables in .env.production
docker-compose up -d
```

### Multi-tenant Production
```bash
DEPLOYMENT_TYPE=multi-tenant docker-compose up -d
```

## ☸️ Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n architects-suite

# View logs
kubectl logs -f deployment/architects-suite-app -n architects-suite
```

## 🔧 Configuration

### Multi-tenancy Options

1. **Multi-tenant** (default): Single deployment, multiple organizations
2. **Single-tenant**: Dedicated deployment per organization  
3. **Private-cloud**: Self-hosted with custom domain

### SAML SSO Setup

1. Configure your Identity Provider:
   - Entity ID: `https://your-domain.com`
   - ACS URL: `https://your-domain.com/api/auth/saml/callback`
   - Download metadata: `https://your-domain.com/api/auth/saml/metadata`

2. Update environment variables:
   ```env
   SAML_ENTRY_POINT="https://your-idp.com/saml/sso"
   SAML_ISSUER="https://your-domain.com"
   SAML_CERT="-----BEGIN CERTIFICATE-----..."
   ```

### GitHub Integration

1. Create GitHub App or Personal Access Token
2. Set permissions: `Contents: Read/Write`, `Metadata: Read`
3. Configure webhook URL: `https://your-domain.com/api/webhooks/github`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testPathPattern=services

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

### Production Monitoring

```bash
# Start with monitoring stack
docker-compose --profile monitoring up -d

# Access monitoring dashboards
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

### Health Checks

- Application: `GET /api/health`
- Database: `GET /api/health/database`
- Redis: `GET /api/health/redis`

## 🔐 Security

### SSL/TLS Setup

```bash
# Generate SSL certificate (Let's Encrypt)
certbot certonly --webroot -w /var/www/html -d your-domain.com

# Update nginx configuration
# Copy certificate files to ./ssl/
```

### Security Headers

The application includes comprehensive security headers:
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

## 🚀 Deployment Options

### 1. Vercel (Recommended for getting started)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### 2. AWS/Azure/GCP

Use provided Kubernetes manifests or Docker images.

### 3. Self-hosted

Use Docker Compose with reverse proxy (nginx/traefik).

## 🔄 Updates & Maintenance

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name description

# Apply to production
npx prisma migrate deploy
```

### Backup & Recovery

```bash
# Database backup
pg_dump $DATABASE_URL > backup.sql

# Redis backup
redis-cli BGSAVE
```

## 🛠️ Development

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                # Utilities and configurations
├── services/           # Business logic
├── types/              # TypeScript definitions
└── __tests__/          # Test files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Verify DATABASE_URL format
   echo $DATABASE_URL
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Check Redis logs
   sudo journalctl -u redis-server
   ```

3. **SAML Authentication Issues**
   - Verify certificate format (include headers/footers)
   - Check clock synchronization between servers
   - Validate metadata exchange

4. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node modules
   rm -rf node_modules package-lock.json
   npm install
   ```

### Performance Optimization

1. **Database Optimization**
   - Enable connection pooling
   - Add database indexes for frequent queries
   - Monitor slow queries

2. **Caching Strategy**
   - Redis for session storage
   - CDN for static assets
   - Browser caching headers

3. **Resource Limits**
   - Adjust memory limits in Docker/K8s
   - Configure horizontal pod autoscaling
   - Monitor resource usage

## 📞 Support

For technical support and questions:
- Documentation: [Your documentation URL]
- Issues: [Your GitHub issues URL]
- Support: [Your support email]

## 📄 License

[Your license information]