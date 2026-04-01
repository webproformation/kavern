import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Livre d'Or",
  description: 'Les avis de nos clients KAVERN. Decouvrez les temoignages authentiques de notre communaute de passionnes d\'artisanat.',
  alternates: {
    canonical: '/livre-dor',
  },
};

export default function LivreDorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
