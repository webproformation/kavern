'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Gem } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { SectionTitle } from '@/components/ui/SectionTitle';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  image?: {
    sourceUrl: string;
  };
  attributes?: {
    nodes: Array<{
      name: string;
      options: string[];
    }>;
  };
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // CONFIGURATION DU SLIDER AVEC AUTOPLAY ET 5 COLONNES
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 5 } // On défile par 5 sur desktop
      }
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })] // Défilement auto toutes les 4s
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .eq('status', 'publish')
          .order('created_at', { ascending: false })
          .limit(15); // On en prend un peu plus pour le slider

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-[#F2F2E8]/30">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Les pépites du moment" 
            subtitle="Chargement des pépites..." 
            icon={Gem} 
          />
          {/* SQUELETTE MIS À JOUR EN 5 COLONNES */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[350px] bg-gray-200/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-[#F2F2E8]/30 overflow-hidden">
      <div className="container mx-auto px-4">
        
        <SectionTitle 
          title="Les pépites du moment" 
          subtitle="Ces pièces que vous adorez... et que nous aussi !"
          icon={Gem}
        />

        <div className="relative group px-2">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {products.map((product) => (
                /* CONFIGURATION TAILWIND POUR 5 COLONNES : lg:flex-[0_0_20%] */
                <div 
                  key={product.id} 
                  className="flex-[0_0_80%] min-w-0 pl-4 sm:flex-[0_0_45%] md:flex-[0_0_33.33%] lg:flex-[0_0_20%]"
                >
                  <div className="h-full transition-transform duration-300 hover:scale-[1.02] py-2">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOUTONS DE NAVIGATION S'AFFICHENT AU SURVOL */}
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg border-none text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex z-10"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg border-none text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex z-10"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            asChild
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all px-10 py-6 text-sm font-black uppercase tracking-widest rounded-xl shadow-sm"
          >
            <Link href="/shop">
              Découvrir tout le trésor
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}