import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { AppLifecycle } from '@/components/AppLifecycle'; // Nouveau composant

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kavern',
  description: 'Des prix mini, des choix en or',
  icons: {
    icon: '/kavern-icone.png',
    shortcut: '/kavern-icone.png',
    apple: '/kavern-icone.png',
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