'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Home, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { decodeHtmlEntities } from '@/lib/utils';

// Interface basée sur les données nécessaires pour les cartes produits
interface Product {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  regular_price: number;
  sale_price: number | null;
}

const ITEMS_PER_PAGE = 20;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Référence pour l'élément déclencheur du lazy loading
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async (pageNumber: number) => {
    try {
      if (pageNumber === 0) setLoading(true);
      else setLoadingMore(true);

      const from = pageNumber * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, image_url, regular_price, sale_price')
        // Si tu as une colonne pour masquer certains produits, tu peux l'ajouter ici. ex: .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (pageNumber === 0) {
          setProducts(data);
        } else {
          setProducts(prev => [...prev, ...data]);
        }
        
        // S'il y a moins de 20 produits retournés, c'est qu'on a atteint la fin du catalogue
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  // Configuration de l'Intersection Observer pour le Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Si la cible est visible et qu'on n'est pas déjà en train de charger
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage);
        }
      },
      { threshold: 0.1 } // Se déclenche quand 10% de la cible est visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchProducts]);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* FIL D'ARIANE */}
      <nav className="bg-white border-b overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#b8933d] flex items-center gap-1">
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium truncate">La KAVERN complète</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* EN-TÊTE DE PAGE */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
          <div className="p-3 bg-[#D4AF37]/10 rounded-full mb-2">
            <Sparkles className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] uppercase tracking-tighter">
            La KAVERN complète
          </h1>
          <p className="text-xl text-[#C6A15B] italic font-semibold max-w-2xl mx-auto">
            &quot;Explorez l'intégralité de nos pépites et trouvez la perle rare qui vous correspond.&quot;
          </p>
          <div className="h-1 w-24 bg-[#D4AF37] rounded-full mt-4" />
        </div>

        {/* GRILLE PRODUITS */}
        {loading && page === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Ouverture de la Kavern...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-2xl font-black text-gray-900 uppercase">La Kavern est vide</h3>
            <p className="text-gray-500 font-medium mt-2">
              Revenez très vite pour découvrir nos futures pépites.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`} className="group space-y-3">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                    <img 
                      src={product.image_url} 
                      alt={decodeHtmlEntities(product.name)} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    
                    {/* Badge Promo Optionnel si besoin */}
                    {product.sale_price && product.regular_price > product.sale_price && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-md">
                        Promo
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 px-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-sm group-hover:text-[#b8933d] transition-colors">
                      {decodeHtmlEntities(product.name)}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-[#b8933d] font-black text-base">
                        {(product.sale_price || product.regular_price).toFixed(2)} €
                      </p>
                      {product.sale_price && (
                        <p className="text-xs text-gray-400 line-through font-medium">
                          {product.regular_price.toFixed(2)} €
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Cible pour déclencher le chargement (Intersection Observer Target) */}
            {hasMore && (
              <div 
                ref={observerTarget} 
                className="flex justify-center items-center py-10"
              >
                {loadingMore && (
                  <div className="flex items-center gap-3 text-[#D4AF37]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest">Chargement des pépites...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <div className="text-center py-12">
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">
                  Vous avez exploré toute la Kavern
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}