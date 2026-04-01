import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'equipe KAVERN. Telephone, email, formulaire de contact. Nous repondons sous 24h. Allo Andre au 06 03 48 96 62.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
