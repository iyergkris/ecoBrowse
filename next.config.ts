import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Remove static export settings, default to hybrid mode
  // output: isProd ? 'export' : undefined,
  // distDir: isProd ? 'out' : '.next',
  // trailingSlash: isProd ? true : undefined,

  // Remove GitHub Pages basePath and assetPrefix
  // basePath: isProd && repoName ? `/${repoName}` : '',
  // assetPrefix: isProd && repoName ? `/${repoName}/` : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Revert image optimization (Next.js default behavior)
    // unoptimized: true,
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
