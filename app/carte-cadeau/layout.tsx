import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carte Cadeau',
  description: "Offrez une carte cadeau KAVERN. Le cadeau parfait pour les amoureux de l'artisanat et des produits faits main.",
  alternates: {
    canonical: '/carte-cadeau',
  },
};

export default function CarteCadeauLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
