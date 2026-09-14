// app/layout.tsx
import type { Metadata } from 'next';
import { Fraunces, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://timothypan.dev'),
  title: {
    default: 'Timothy Pan',
    template: '%s — Timothy Pan',
  },
  description:
    'Computer engineering at Waterloo. Previously Apple. Projects in silicon, machine learning, and robotics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-serif">
        <Nav />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
