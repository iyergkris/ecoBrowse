import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  output: isProd ? 'export' : undefined, // Export static HTML for production build
  distDir: isProd ? 'out' : '.next',     // Output directory for `next export`
  trailingSlash: isProd ? true : undefined, // Needed for extension static export
  assetPrefix: isProd ? './' : undefined, // Ensure assets are loaded relatively

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // For static export, disable image optimization or configure a custom loader if needed
    unoptimized: true, // Simple solution for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
