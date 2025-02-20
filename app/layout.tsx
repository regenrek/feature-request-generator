import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Feature Generator',
  description: 'Create and share your feature requests',
  openGraph: {
    title: 'Feature Generator',
    description: 'Create and share your feature requests',
    images: [
      {
        url: '/ogimage.png', // Default OG image
        width: 800,
        height: 800,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feature Generator',
    description: 'Create and share your feature requests',
    images: ['/ogimage.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
