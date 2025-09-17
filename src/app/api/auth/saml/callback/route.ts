import { NextRequest, NextResponse } from 'next/server';
import { samlService } from '@/lib/saml';
import { security } from '@/lib/security';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Parse SAML response from form data
    const formData = await request.formData();
    const samlResponse = formData.get('SAMLResponse') as string;
    const relayState = formData.get('RelayState') as string;

    if (!samlResponse) {
      return NextResponse.json(
        { error: 'Missing SAML response' },
        { status: 400 }
      );
    }

    // Process SAML response
    const user = await samlService.processResponse(samlResponse);

    // Validate user has required attributes
    if (!user.email) {
      await security.audit.logSecurityEvent({
        type: 'access_denied',
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { reason: 'Missing email attribute', nameId: user.nameId }
      });

      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        sub: user.nameId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || ['viewer'],
        groups: user.groups || [],
        sessionIndex: user.sessionIndex,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 // 8 hours
      },
      process.env.JWT_SECRET!,
      { algorithm: 'HS256' }
    );

    // Log successful login
    await security.audit.logSecurityEvent({
      type: 'login',
      userId: user.nameId,
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { method: 'SAML', email: user.email }
    });

    // Create response with secure cookie
    const response = NextResponse.redirect(
      relayState || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('SAML callback error:', error);

    await security.audit.logSecurityEvent({
      type: 'access_denied',
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'SAML'
      }
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=saml_callback_failed`
    );
  }
}