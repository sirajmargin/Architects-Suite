import { NextRequest, NextResponse } from 'next/server';
import { samlService } from '@/lib/saml';
import { security } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Get relay state from query params (optional)
    const { searchParams } = new URL(request.url);
    const relayState = searchParams.get('RelayState');

    // Generate SAML authentication request
    const { url } = await samlService.generateAuthRequest(relayState || undefined);

    // Log security event
    await security.audit.logSecurityEvent({
      type: 'login',
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { method: 'SAML', relayState }
    });

    // Redirect to identity provider
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('SAML auth initiation error:', error);
    
    return NextResponse.json(
      { error: 'SAML authentication failed' },
      { status: 500 }
    );
  }
}