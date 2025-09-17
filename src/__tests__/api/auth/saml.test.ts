import { POST } from '@/app/api/auth/saml/callback/route';
import { samlService } from '@/lib/saml';
import { security } from '@/lib/security';
import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/saml');
jest.mock('@/lib/security');
jest.mock('jsonwebtoken');

describe('/api/auth/saml/callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('processes SAML response successfully', async () => {
    const mockUser = {
      nameId: 'user123',
      nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['editor'],
      sessionIndex: 'session123'
    };

    (samlService.processResponse as jest.Mock).mockResolvedValue(mockUser);

    const formData = new FormData();
    formData.append('SAMLResponse', 'encoded-saml-response');
    formData.append('RelayState', '/dashboard');

    const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);

    expect(response.status).toBe(302); // Redirect
    expect(samlService.processResponse).toHaveBeenCalledWith('encoded-saml-response');
    expect(security.audit.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'login',
        userId: 'user123'
      })
    );
  });

  it('handles missing SAML response', async () => {
    const formData = new FormData();
    // No SAMLResponse

    const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing SAML response');
  });

  it('handles user without email', async () => {
    const mockUser = {
      nameId: 'user123',
      nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      email: '', // Missing email
      sessionIndex: 'session123'
    };

    (samlService.processResponse as jest.Mock).mockResolvedValue(mockUser);

    const formData = new FormData();
    formData.append('SAMLResponse', 'encoded-saml-response');

    const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(security.audit.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'access_denied',
        details: expect.objectContaining({
          reason: 'Missing email attribute'
        })
      })
    );
  });

  it('handles SAML processing errors', async () => {
    (samlService.processResponse as jest.Mock).mockRejectedValue(
      new Error('Invalid SAML response')
    );

    const formData = new FormData();
    formData.append('SAMLResponse', 'invalid-saml-response');

    const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);

    expect(response.status).toBe(302); // Redirect to error page
    expect(response.headers.get('location')).toContain('/auth/error');
    expect(security.audit.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'access_denied'
      })
    );
  });

  it('sets secure cookie correctly', async () => {
    const mockUser = {
      nameId: 'user123',
      nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      email: 'user@example.com',
      sessionIndex: 'session123'
    };

    (samlService.processResponse as jest.Mock).mockResolvedValue(mockUser);

    // Mock JWT
    const jwt = require('jsonwebtoken');
    jwt.sign = jest.fn().mockReturnValue('mocked-jwt-token');

    const formData = new FormData();
    formData.append('SAMLResponse', 'encoded-saml-response');

    const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user123',
        email: 'user@example.com'
      }),
      'test-secret',
      { algorithm: 'HS256' }
    );

    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toContain('auth-token=mocked-jwt-token');
    expect(setCookieHeader).toContain('HttpOnly');
  });
});