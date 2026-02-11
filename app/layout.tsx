import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // 1. On importe Inter
import { LayoutWrapper } from '@/components/layout-wrapper';

// 2. On configure la police avec le sous-ensemble latin
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
      {/* 3. On applique la classe de la police au body */}
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}