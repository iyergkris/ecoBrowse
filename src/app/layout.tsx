import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

// Define assetPrefix for potential use in client-side links if needed
// For static export, next/link handles basePath automatically.
// Manually constructing URLs (e.g., for images outside next/image) might need it.
const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'EcoBrowse', // Updated App Name
  description: 'Analyze website carbon footprint and get eco-friendly suggestions.', // Updated Description
  // Metadata API handles basic head tags like title and description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SVG icon representing a green leaf for the favicon
  const leafSvgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='hsl(150 60% 40%)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/><path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/></svg>`;
  const faviconDataUri = `data:image/svg+xml,${encodeURIComponent(leafSvgIcon)}`;

  return (
    <html lang="en">
       {/* Use standard head tag, ensure no leading/trailing whitespace inside */}
       <head>
        {/* Use an SVG data URI for the favicon - this works fine with static export */}
        <link rel="icon" href={faviconDataUri} type="image/svg+xml" />
        {/* Removed old PNG links and apple-touch-icon */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
       </head>
       <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
