import type { NextConfig } from 'next';

// Determine if the build is for GitHub Pages static export
const isGithubPagesBuild = process.env.GITHUB_PAGES_BUILD === 'true';
const repoName = 'ecoBrowse'; // Keep your repository name here

const nextConfig: NextConfig = {
  /* config options here */
  // Enable static export only when GITHUB_PAGES_BUILD is true
  output: isGithubPagesBuild ? 'export' : undefined,
  // Change distDir only for the static export build
  distDir: isGithubPagesBuild ? 'out' : '.next',
  // Apply trailingSlash, basePath, and assetPrefix only for GitHub Pages build
  trailingSlash: isGithubPagesBuild ? true : undefined,
  basePath: isGithubPagesBuild ? `/${repoName}` : '',
  assetPrefix: isGithubPagesBuild ? `/${repoName}/` : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Unoptimize images for static export or if explicitly set
    unoptimized: isGithubPagesBuild ? true : false,
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
