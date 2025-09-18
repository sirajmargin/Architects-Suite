/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'mermaid'],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          mermaid: {
            test: /[\\/]node_modules[\\/]mermaid[\\/]/,
            name: 'mermaid',
            chunks: 'async',
          },
        },
      };
    }
    return config;
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;