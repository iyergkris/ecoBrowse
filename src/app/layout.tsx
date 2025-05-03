import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Head from 'next/head'; // Import Head
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       {/* Add favicons - assumes icons exist in public/icons/ */}
       <Head>
         <link rel="icon" href="/icons/icon16.png" sizes="16x16" type="image/png" />
         <link rel="icon" href="/icons/icon32.png" sizes="32x32" type="image/png" /> {/* Common size */}
         <link rel="apple-touch-icon" href="/icons/icon128.png" /> {/* For iOS */}
       </Head>
       {/* Remove fixed width for responsiveness */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[300px]`}>
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
