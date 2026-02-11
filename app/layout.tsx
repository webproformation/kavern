import './globals.css';
import type { Metadata } from 'next';
import { Pangolin } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout-wrapper';

const pangolin = Pangolin({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kavern', // Assurez-vous que le titre est bon ici
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
      <body className={pangolin.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
