import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// import rateLimit from 'express-rate-limit';
// import helmet from 'helmet';

// Security middleware configuration
export const securityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },

  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.github.com", "https://api.notion.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};

// Encryption utilities
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private secretKey: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.secretKey = Buffer.from(key, 'hex');
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('architects-suite', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const { encrypted, iv, tag } = encryptedData;
    
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('architects-suite', 'utf8'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash password with salt
   */
  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
    
    return { hash, salt: actualSalt };
  }

  /**
   * Verify password against hash
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Input validation and sanitization
export class ValidationService {
  /**
   * Sanitize HTML input to prevent XSS
   */
  sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate diagram code for security issues
   */
  validateDiagramCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Potentially dangerous pattern detected: ${pattern.source}`);
      }
    }

    // Check code length
    if (code.length > 50000) {
      errors.push('Diagram code is too long (max 50,000 characters)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'text/plain'];

    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Audit logging
export class AuditService {
  /**
   * Log security event
   */
  async logSecurityEvent(event: {
    type: 'login' | 'logout' | 'access_denied' | 'data_export' | 'config_change';
    userId?: string;
    ip: string;
    userAgent: string;
    details?: any;
  }): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      severity: this.getSeverityLevel(event.type)
    };

    // In production, this would write to a secure logging service
    console.log('SECURITY_AUDIT:', JSON.stringify(logEntry));

    // Store in database for compliance
    // await this.storeAuditLog(logEntry);
  }

  /**
   * Get severity level for event type
   */
  private getSeverityLevel(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
      login: 'low',
      logout: 'low',
      access_denied: 'medium',
      data_export: 'medium',
      config_change: 'high'
    };

    return severityMap[type] || 'medium';
  }
}

// Permission system
export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export interface Role {
  name: string;
  permissions: Permission[];
}

export class AccessControlService {
  private roles: Map<string, Role> = new Map();

  constructor() {
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default roles
   */
  private initializeDefaultRoles(): void {
    // Viewer role
    this.roles.set('viewer', {
      name: 'viewer',
      permissions: [
        { resource: 'diagrams', action: 'read' },
        { resource: 'comments', action: 'read' }
      ]
    });

    // Editor role
    this.roles.set('editor', {
      name: 'editor',
      permissions: [
        { resource: 'diagrams', action: 'read' },
        { resource: 'diagrams', action: 'write' },
        { resource: 'comments', action: 'read' },
        { resource: 'comments', action: 'write' },
        { resource: 'export', action: 'read' }
      ]
    });

    // Admin role
    this.roles.set('admin', {
      name: 'admin',
      permissions: [
        { resource: 'diagrams', action: 'read' },
        { resource: 'diagrams', action: 'write' },
        { resource: 'diagrams', action: 'delete' },
        { resource: 'comments', action: 'read' },
        { resource: 'comments', action: 'write' },
        { resource: 'comments', action: 'delete' },
        { resource: 'export', action: 'read' },
        { resource: 'users', action: 'admin' },
        { resource: 'settings', action: 'admin' }
      ]
    });
  }

  /**
   * Check if user has permission
   */
  hasPermission(userRoles: string[], resource: string, action: Permission['action']): boolean {
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (role) {
        const hasPermission = role.permissions.some(
          p => p.resource === resource && p.action === action
        );
        if (hasPermission) return true;
      }
    }
    return false;
  }

  /**
   * Get all permissions for user roles
   */
  getUserPermissions(userRoles: string[]): Permission[] {
    const permissions: Permission[] = [];
    
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (role) {
        permissions.push(...role.permissions);
      }
    }

    return permissions;
  }
}

// Security middleware factory
export function createSecurityMiddleware() {
  const encryption = new EncryptionService();
  const validation = new ValidationService();
  const audit = new AuditService();
  const accessControl = new AccessControlService();

  return {
    encryption,
    validation,
    audit,
    accessControl,

    // Rate limiting middleware (disabled for build)
    // rateLimit: rateLimit(securityConfig.rateLimit),

    // Request validation middleware
    validateRequest: (req: NextRequest) => {
      const errors: string[] = [];

      // Validate Content-Type for POST/PUT requests
      if (['POST', 'PUT'].includes(req.method)) {
        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          errors.push('Invalid Content-Type header');
        }
      }

      // Validate User-Agent
      const userAgent = req.headers.get('user-agent');
      if (!userAgent || userAgent.length < 10) {
        errors.push('Invalid or missing User-Agent header');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
}

export const security = createSecurityMiddleware();