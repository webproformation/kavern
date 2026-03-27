import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { AppLifecycle } from '@/components/AppLifecycle'; // Nouveau composant

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KAVERN - L\'artisanat et l\'inattendu',
  description: 'Concept Store en ligne - Bougies artisanales, epicerie fine, mode et lives shopping',
  manifest: '/manifest.json',
  icons: {
    icon: '/kavern-icone.png',
    shortcut: '/kavern-icone.png',
    apple: '/kavern-icone.png',
  },
  themeColor: '#D4AF37',
  openGraph: {
    title: 'KAVERN - L\'artisanat et l\'inattendu',
    description: 'Concept Store en ligne - Bougies artisanales, epicerie fine, mode et lives shopping',
    url: 'https://kavern-france.fr',
    siteName: 'KAVERN',
    images: [{ url: '/kavern-logo.png', width: 800, height: 400, alt: 'KAVERN' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAVERN - L\'artisanat et l\'inattendu',
    description: 'Concept Store en ligne - Bougies artisanales, epicerie fine, mode et lives shopping',
    images: ['/kavern-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* Ce composant invisible gère le rafraîchissement automatique pour Mamie */}
        <AppLifecycle />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}