import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Shopping',
  description: 'Rejoignez les lives shopping KAVERN ! Decouvrez nos produits en direct, posez vos questions et profitez d\'offres exclusives.',
  alternates: {
    canonical: '/live',
  },
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
