/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable linting and type checking during builds for speed
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable experimental features for Next.js 15
  experimental: {
    // Enable React 19 features - disabled until babel-plugin-react-compiler is installed
    // reactCompiler: true,
  },
  
  // Build optimization settings for production deployment
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Output configuration for different deployment environments
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // CSS modules support is enabled by default in Next.js
  // Additional CSS configuration if needed
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  
  // Performance optimizations (swcMinify is deprecated in Next.js 15, enabled by default)
  
  // Bundle analyzer (optional, can be enabled with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),
};

module.exports = nextConfig;