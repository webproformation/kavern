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
import { createClient as createSupabase } from '@supabase/supabase-js';
import PageContentDisplay from '@/components/PageContentDisplay';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'KAVERN — L\'Artisanat et l\'Inattendu | Concept Store',
  description: 'Decouvrez KAVERN, votre concept store en ligne d\'artisanat francais. Bougies artisanales, bijoux, epicerie fine, spa et bien-etre. Livraison rapide, satisfait ou rembourse. Live shopping chaque semaine.',
  alternates: { canonical: '/' },
};

export default async function Home() {
  let seoPage: { content: string } | null = null;
  try {
    const supabase = createSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data, error } = await supabase
      .from('pages_seo')
      .select('content')
      .eq('slug', 'home')
      .maybeSingle();
    if (error) console.error('[page.tsx] pages_seo error:', error);
    seoPage = data;
  } catch (e) {
    console.error('[page.tsx] pages_seo exception:', e);
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
            <PageContentDisplay content={seoPage.content} className="prose-gray" />
          </section>
        )}
      </main>
    </div>
  );
}