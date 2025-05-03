import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
// Removed import Head from 'next/head'; - Incompatible with App Router
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EcoBrowse', // Updated App Name
  description: 'Analyze website carbon footprint and get eco-friendly suggestions.', // Updated Description
  // Metadata API handles basic head tags like title and description
  // Add icons via link tags below for broader compatibility, especially with static export
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Determine asset prefix based on environment for icons
  const isProd = process.env.NODE_ENV === 'production';
  const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
  const assetPrefix = isProd && repoName ? `/${repoName}` : '';

  return (
    <html lang="en">
       {/* Use standard head tag, ensure no leading/trailing whitespace inside */}
       <head>
         {/* Add favicons using standard link tags */}
         {/* Adjust href paths based on assetPrefix for GitHub Pages compatibility */}
         <link rel="icon" href={`${assetPrefix}/icons/icon16.png`} sizes="16x16" type="image/png" />
         <link rel="icon" href={`${assetPrefix}/icons/icon32.png`} sizes="32x32" type="image/png" /> {/* Common size */}
         <link rel="apple-touch-icon" href={`${assetPrefix}/icons/icon128.png`} /> {/* For iOS */}
         <meta name="viewport" content="width=device-width, initial-scale=1" /> {/* Ensure proper viewport */}
       </head>
       {/* Remove fixed width for responsiveness */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}> {/* Use min-h-screen */}
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
