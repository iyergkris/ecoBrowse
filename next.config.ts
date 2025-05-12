import type { NextConfig } from 'next';

// Determine if the build is for production and specifically for GitHub Pages
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'ecoBrowse';

const nextConfig: NextConfig = {
  /* config options here */
  // Enable static export for GitHub Pages
  output: isProd ? 'export' : undefined,
  distDir: isProd ? 'out' : '.next',
  trailingSlash: isProd ? true : undefined,

  // Configure basePath and assetPrefix for GitHub Pages
  basePath: isProd && repoName ? `/${repoName}` : '',
  assetPrefix: isProd && repoName ? `/${repoName}/` : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
     // When using static export, default image optimization is disabled.
     // If you need optimization, consider a cloud provider or keep unoptimized: true.
    unoptimized: isProd ? true : false, // Keep true for static export compatibility
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
