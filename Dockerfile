# Multi-stage Docker build for IT Architects Suite
# Optimized for production deployment with security best practices

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Copy source code
COPY . .

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Build the application (if build process is needed in future)
RUN npm run build 2>/dev/null || echo "No build script found, using static files"

# Production stage
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy built application
COPY --from=builder --chown=appuser:appgroup /app /usr/share/nginx/html

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Create necessary directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 3000

# Labels for metadata
LABEL maintainer="IT Architects Suite Team" \
      version="1.0.0" \
      description="IT Architects Suite - AI-Powered Architecture Design Platform" \
      org.opencontainers.image.title="IT Architects Suite" \
      org.opencontainers.image.description="AI-Powered Architecture Design Platform for IT Architects" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="Architects Suite" \
      org.opencontainers.image.licenses="MIT"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]