import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
// Set this to your repository name if deploying to GitHub Pages like username.github.io/repo-name
// If deploying to username.github.io, leave it as an empty string.
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';

const nextConfig: NextConfig = {
  /* config options here */
  output: isProd ? 'export' : undefined, // Export static HTML for production build
  distDir: isProd ? 'out' : '.next',     // Output directory for `next export`
  trailingSlash: isProd ? true : undefined, // Needed for extension static export AND GitHub Pages

  // Configure basePath and assetPrefix for GitHub Pages deployment
  // basePath is needed for routing (e.g., /repo-name/page)
  // assetPrefix is needed for loading static assets (CSS, JS, images) from the correct path
  basePath: isProd && repoName ? `/${repoName}` : '',
  assetPrefix: isProd && repoName ? `/${repoName}/` : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // For static export, disable image optimization as it's not supported by default
    unoptimized: true,
    // Keep remotePatterns if needed for external images, but they will work as regular <img> tags
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
