import { security } from '@/lib/security';
import { jest } from '@jest/globals';

describe('Security Services', () => {
  describe('EncryptionService', () => {
    beforeAll(() => {
      // Mock environment variable
      process.env.ENCRYPTION_KEY = 'a'.repeat(64); // 64 character hex string
    });

    it('encrypts and decrypts data correctly', () => {
      const testData = 'sensitive information';
      
      const encrypted = security.encryption.encrypt(testData);
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();

      const decrypted = security.encryption.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });

    it('generates secure tokens', () => {
      const token1 = security.encryption.generateToken();
      const token2 = security.encryption.generateToken();
      
      expect(token1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });

    it('hashes passwords securely', () => {
      const password = 'test-password';
      
      const { hash, salt } = security.encryption.hashPassword(password);
      expect(hash).toBeDefined();
      expect(salt).toBeDefined();
      expect(hash).toHaveLength(128); // 64 bytes = 128 hex chars

      const isValid = security.encryption.verifyPassword(password, hash, salt);
      expect(isValid).toBe(true);

      const isInvalid = security.encryption.verifyPassword('wrong-password', hash, salt);
      expect(isInvalid).toBe(false);
    });
  });

  describe('ValidationService', () => {
    it('sanitizes HTML correctly', () => {
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = security.validation.sanitizeHtml(maliciousHtml);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('Safe content');
    });

    it('validates email addresses', () => {
      expect(security.validation.validateEmail('user@example.com')).toBe(true);
      expect(security.validation.validateEmail('valid.email+tag@domain.co.uk')).toBe(true);
      expect(security.validation.validateEmail('invalid-email')).toBe(false);
      expect(security.validation.validateEmail('user@')).toBe(false);
      expect(security.validation.validateEmail('@domain.com')).toBe(false);
    });

    it('validates diagram code for security issues', () => {
      const safeDiagram = 'graph TD\n  A --> B\n  B --> C';
      const unsafeDiagram = 'graph TD\n  A --> B\n  <script>alert("xss")</script>';

      const safeResult = security.validation.validateDiagramCode(safeDiagram);
      expect(safeResult.valid).toBe(true);
      expect(safeResult.errors).toHaveLength(0);

      const unsafeResult = security.validation.validateDiagramCode(unsafeDiagram);
      expect(unsafeResult.valid).toBe(false);
      expect(unsafeResult.errors.length).toBeGreaterThan(0);
    });

    it('validates file uploads', () => {
      const validFile = new File(['content'], 'test.png', { type: 'image/png' });
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/exe' });
      
      // Mock file size
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
      Object.defineProperty(invalidFile, 'size', { value: 20 * 1024 * 1024 }); // 20MB

      const validResult = security.validation.validateFileUpload(validFile);
      expect(validResult.valid).toBe(true);

      const invalidResult = security.validation.validateFileUpload(invalidFile);
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('AccessControlService', () => {
    it('checks permissions correctly', () => {
      const userRoles = ['editor'];
      
      const canRead = security.accessControl.hasPermission(userRoles, 'diagrams', 'read');
      expect(canRead).toBe(true);

      const canWrite = security.accessControl.hasPermission(userRoles, 'diagrams', 'write');
      expect(canWrite).toBe(true);

      const canDelete = security.accessControl.hasPermission(userRoles, 'diagrams', 'delete');
      expect(canDelete).toBe(false); // Only admin can delete
    });

    it('handles multiple roles correctly', () => {
      const userRoles = ['viewer', 'editor'];
      
      const canRead = security.accessControl.hasPermission(userRoles, 'diagrams', 'read');
      expect(canRead).toBe(true);

      const canAdmin = security.accessControl.hasPermission(userRoles, 'users', 'admin');
      expect(canAdmin).toBe(false);
    });

    it('returns user permissions correctly', () => {
      const userRoles = ['editor'];
      const permissions = security.accessControl.getUserPermissions(userRoles);
      
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some(p => p.resource === 'diagrams' && p.action === 'read')).toBe(true);
      expect(permissions.some(p => p.resource === 'diagrams' && p.action === 'write')).toBe(true);
    });
  });

  describe('AuditService', () => {
    it('logs security events', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await security.audit.logSecurityEvent({
        type: 'login',
        userId: 'user123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: { method: 'SAML' }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_AUDIT:',
        expect.stringContaining('login')
      );

      consoleSpy.mockRestore();
    });

    it('assigns correct severity levels', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await security.audit.logSecurityEvent({
        type: 'access_denied',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_AUDIT:',
        expect.stringContaining('"severity":"medium"')
      );

      consoleSpy.mockRestore();
    });
  });
});