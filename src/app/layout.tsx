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
  // Remove asset prefix logic, assume root deployment
  // const isProd = process.env.NODE_ENV === 'production';
  // const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
  // const assetPrefix = isProd && repoName ? `/${repoName}` : '';

  return (
    <html lang="en">
       {/* Use standard head tag, ensure no leading/trailing whitespace inside */}
       <head>
        {/* Use standard link tags for icons, assuming they are in public/icons */}
        <link rel="icon" href="/icons/icon16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/icons/icon32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon128.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
       </head>
       <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
