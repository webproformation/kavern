import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Actualites',
  description: 'Toutes les actualites KAVERN : nouveaux produits, artisans partenaires, evenements et lives shopping a venir.',
  alternates: {
    canonical: '/actualites',
  },
};

export default function ActualitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
