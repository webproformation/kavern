import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { AppLifecycle } from '@/components/AppLifecycle'; // Nouveau composant

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kavern-france.fr'),
  title: {
    default: 'KAVERN - L\'artisanat et l\'inattendu',
    template: '%s | KAVERN',
  },
  description: 'KAVERN, concept store en ligne d\'artisanat francais. Bougies artisanales, epicerie fine, bijoux, spa et bien-etre. Livraison rapide, satisfait ou rembourse.',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/kavern-icone.png',
    shortcut: '/kavern-icone.png',
    apple: '/kavern-icone.png',
  },
  themeColor: '#D4AF37',
  openGraph: {
    title: 'KAVERN - L\'artisanat et l\'inattendu',
    description: 'KAVERN, concept store en ligne d\'artisanat francais. Bougies artisanales, epicerie fine, bijoux, spa et bien-etre.',
    url: 'https://kavern-france.fr',
    siteName: 'KAVERN',
    images: [{ url: '/kavern-logo.png', width: 800, height: 400, alt: 'KAVERN' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAVERN - L\'artisanat et l\'inattendu',
    description: 'KAVERN, concept store en ligne d\'artisanat francais. Bougies artisanales, epicerie fine, bijoux, spa et bien-etre.',
    images: ['/kavern-logo.png'],
  },
};

// MODE MAINTENANCE — Passer à false pour réactiver le site
const MAINTENANCE_MODE = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (MAINTENANCE_MODE) {
    return (
      <html lang="fr">
        <body style={{ margin: 0, padding: 0, backgroundColor: '#000', color: '#D4AF37', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '0.2em' }}>KAVERN</h1>
            <p style={{ fontSize: '1.2rem', color: '#999', marginBottom: '2rem' }}>Nous préparons quelque chose d&apos;exceptionnel pour vous.</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Le site sera bientôt disponible.</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body className={inter.className}>
        <AppLifecycle />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}