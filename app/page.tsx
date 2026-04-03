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
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'KAVERN — L\'Artisanat et l\'Inattendu | Concept Store',
  description: 'Decouvrez KAVERN, votre concept store en ligne d\'artisanat francais. Bougies artisanales, bijoux, epicerie fine, spa et bien-etre. Livraison rapide, satisfait ou rembourse. Live shopping chaque semaine.',
  alternates: { canonical: '/' },
};

export default async function Home() {
  let seoPage: { content: string } | null = null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('pages_seo')
      .select('content')
      .eq('slug', 'home')
      .maybeSingle();
    seoPage = data;
  } catch {
    // Pas critique — la homepage s'affiche sans le contenu SEO si Supabase échoue
  }

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

        {/* Contenu éditorial WYSIWYG depuis l'admin (pages_seo slug=accueil) */}
        {seoPage?.content && (
          <section className="max-w-4xl mx-auto px-4 py-10">
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: seoPage.content }}
            />
          </section>
        )}
      </main>
    </div>
  );
}