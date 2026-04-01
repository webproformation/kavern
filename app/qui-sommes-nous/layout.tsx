import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qui sommes-nous',
  description: "Decouvrez l'histoire de KAVERN, concept store en ligne d'artisanat francais. Une aventure familiale dediee aux createurs et artisans locaux.",
  alternates: {
    canonical: '/qui-sommes-nous',
  },
};

export default function QuiSommesNousLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
