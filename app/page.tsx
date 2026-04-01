import type { Metadata } from 'next';
import { HeroSlider } from '@/components/hero-slider';
import { FeaturedProducts } from '@/components/featured-products';
import { HomeCategories } from '@/components/home-categories';
import { VideoShortsSection } from '@/components/VideoShortsSection';
// On remplace l'ancien composant statique par le nouveau dynamique
import KeyFigures from '@/components/sections/KeyFigures';
import { HomeReviewsCarousel } from '@/components/HomeReviewsCarousel';
import { GamePopupManager } from '@/components/GamePopupManager';
import { LiveBanner } from '@/components/LiveBanner';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'KAVERN - Concept Store Artisanat Francais | Bougies, Bijoux, Epicerie Fine',
  description: 'Decouvrez KAVERN, votre concept store en ligne d\'artisanat francais. Bougies artisanales, bijoux, epicerie fine, spa et bien-etre. Livraison rapide, satisfait ou rembourse. Live shopping chaque semaine.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LiveBanner />
      <GamePopupManager />

      <main>
        <h1 className="sr-only">KAVERN - Concept Store Artisanat Francais</h1>
        <section className="w-full">
          <HeroSlider />
        </section>

        <HomeCategories />

        <FeaturedProducts />

        {/* Le livre d'or remonte juste en dessous des produits vedettes */}
        <HomeReviewsCarousel />

        <VideoShortsSection />

        {/* Affichage des statistiques animées */}
        <KeyFigures />
      </main>
    </div>
  );
}