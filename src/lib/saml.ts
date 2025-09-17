import { NextRequest, NextResponse } from 'next/server';
import { SAML } from '@node-saml/node-saml';

export interface SAMLConfig {
  entryPoint: string;
  issuer: string;
  cert: string;
  privateCert?: string;
  callbackUrl: string;
  logoutUrl?: string;
  signatureAlgorithm?: string;
  digestAlgorithm?: string;
  validateInResponseTo?: boolean;
  disableRequestedAuthnContext?: boolean;
}

export interface SAMLUser {
  nameId: string;
  nameIdFormat: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  groups?: string[];
  sessionIndex?: string;
}

export class SAMLService {
  private samlStrategy: SAML;
  private config: SAMLConfig;

  constructor(config: SAMLConfig) {
    this.config = config;
    this.samlStrategy = new SAML({
      entryPoint: config.entryPoint,
      issuer: config.issuer,
      cert: config.cert,
      privateCert: config.privateCert,
      callbackUrl: config.callbackUrl,
      logoutUrl: config.logoutUrl,
      signatureAlgorithm: config.signatureAlgorithm || 'sha256',
      digestAlgorithm: config.digestAlgorithm || 'sha256',
      validateInResponseTo: config.validateInResponseTo ?? true,
      disableRequestedAuthnContext: config.disableRequestedAuthnContext ?? false,
      acceptedClockSkewMs: 5000,
      attributeConsumingServiceIndex: false,
      disableRequestACSUrl: false,
      path: '/api/auth/saml/callback',
      // Additional security settings
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: true,
      forceAuthn: false,
      skipRequestCompression: false,
      authnRequestBinding: 'HTTP-POST',
      // Attribute mapping
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient'
    });
  }

  /**
   * Generate SAML authentication request
   */
  async generateAuthRequest(relayState?: string): Promise<{ url: string; samlRequest: string }> {
    return new Promise((resolve, reject) => {
      this.samlStrategy.getAuthorizeUrl(
        { relayState },
        (err: Error | null, url?: string, samlRequest?: string) => {
          if (err) {
            reject(err);
          } else if (url && samlRequest) {
            resolve({ url, samlRequest });
          } else {
            reject(new Error('Failed to generate auth request'));
          }
        }
      );
    });
  }

  /**
   * Process SAML response
   */
  async processResponse(body: string): Promise<SAMLUser> {
    return new Promise((resolve, reject) => {
      this.samlStrategy.validatePostResponse(
        { SAMLResponse: body },
        (err: Error | null, profile?: any) => {
          if (err) {
            reject(err);
          } else if (profile) {
            const user = this.mapSAMLProfile(profile);
            resolve(user);
          } else {
            reject(new Error('Invalid SAML response'));
          }
        }
      );
    });
  }

  /**
   * Generate SAML logout request
   */
  async generateLogoutRequest(user: SAMLUser): Promise<{ url: string; samlRequest: string }> {
    return new Promise((resolve, reject) => {
      this.samlStrategy.getLogoutUrl(
        {
          nameId: user.nameId,
          nameIdFormat: user.nameIdFormat,
          sessionIndex: user.sessionIndex
        },
        (err: Error | null, url?: string, samlRequest?: string) => {
          if (err) {
            reject(err);
          } else if (url && samlRequest) {
            resolve({ url, samlRequest });
          } else {
            reject(new Error('Failed to generate logout request'));
          }
        }
      );
    });
  }

  /**
   * Process SAML logout response
   */
  async processLogoutResponse(body: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.samlStrategy.validatePostResponse(
        { SAMLResponse: body },
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * Map SAML profile to user object
   */
  private mapSAMLProfile(profile: any): SAMLUser {
    // Standard SAML attribute mapping
    const attributeMap: { [key: string]: string } = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': 'firstName',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': 'lastName',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'roles',
      'http://schemas.xmlsoap.org/claims/Group': 'groups',
      'email': 'email',
      'firstName': 'firstName',
      'lastName': 'lastName',
      'roles': 'roles',
      'groups': 'groups'
    };

    const user: SAMLUser = {
      nameId: profile.nameID,
      nameIdFormat: profile.nameIDFormat,
      email: '',
      sessionIndex: profile.sessionIndex
    };

    // Map attributes
    Object.entries(attributeMap).forEach(([samlAttr, userAttr]) => {
      if (profile.attributes && profile.attributes[samlAttr]) {
        const value = profile.attributes[samlAttr];
        
        if (userAttr === 'roles' || userAttr === 'groups') {
          user[userAttr] = Array.isArray(value) ? value : [value];
        } else {
          (user as any)[userAttr] = Array.isArray(value) ? value[0] : value;
        }
      }
    });

    // Fallback to nameID for email if not provided
    if (!user.email && user.nameId.includes('@')) {
      user.email = user.nameId;
    }

    return user;
  }

  /**
   * Validate SAML configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.entryPoint) {
      errors.push('SAML entry point is required');
    }

    if (!this.config.issuer) {
      errors.push('SAML issuer is required');
    }

    if (!this.config.cert) {
      errors.push('SAML certificate is required');
    }

    if (!this.config.callbackUrl) {
      errors.push('SAML callback URL is required');
    }

    // Validate certificate format
    if (this.config.cert && !this.config.cert.includes('BEGIN CERTIFICATE')) {
      errors.push('Invalid certificate format');
    }

    // Validate URLs
    try {
      new URL(this.config.entryPoint);
    } catch {
      errors.push('Invalid entry point URL');
    }

    try {
      new URL(this.config.callbackUrl);
    } catch {
      errors.push('Invalid callback URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get SAML metadata XML
   */
  getMetadata(): string {
    return this.samlStrategy.generateServiceProviderMetadata(
      this.config.cert,
      this.config.cert
    );
  }
}

// SAML configuration from environment variables
export function createSAMLConfig(): SAMLConfig {
  return {
    entryPoint: process.env.SAML_ENTRY_POINT || '',
    issuer: process.env.SAML_ISSUER || process.env.NEXT_PUBLIC_APP_URL || '',
    cert: process.env.SAML_CERT || '',
    privateCert: process.env.SAML_PRIVATE_CERT,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/saml/callback`,
    logoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/saml/logout`,
    signatureAlgorithm: process.env.SAML_SIGNATURE_ALGORITHM as any,
    digestAlgorithm: process.env.SAML_DIGEST_ALGORITHM as any,
    validateInResponseTo: process.env.SAML_VALIDATE_IN_RESPONSE_TO === 'true',
    disableRequestedAuthnContext: process.env.SAML_DISABLE_REQUESTED_AUTHN_CONTEXT === 'true'
  };
}

// Multiple identity provider support
export class MultiSAMLService {
  private providers: Map<string, SAMLService> = new Map();

  /**
   * Add identity provider
   */
  addProvider(providerId: string, config: SAMLConfig): void {
    this.providers.set(providerId, new SAMLService(config));
  }

  /**
   * Get provider by ID
   */
  getProvider(providerId: string): SAMLService | undefined {
    return this.providers.get(providerId);
  }

  /**
   * List all providers
   */
  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Remove provider
   */
  removeProvider(providerId: string): boolean {
    return this.providers.delete(providerId);
  }
}

// Create default SAML service instance
export const samlService = new SAMLService(createSAMLConfig());
export const multiSAMLService = new MultiSAMLService();