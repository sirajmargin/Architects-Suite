/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@node-saml/node-saml']
  },
  webpack: (config, { isServer }) => {
    // Handle Canvas for html2canvas
    if (isServer) {
      config.externals.push('canvas');
    }
    
    // Handle mermaid
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    });

    return config;
  },
  // Optimize for production
  swcMinify: true,
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Environment variables
  env: {
    // Add environment variables here if needed
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Output configuration for standalone build
  output: 'standalone',
};

module.exports = nextConfig;