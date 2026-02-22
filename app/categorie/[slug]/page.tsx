'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, SlidersHorizontal, Filter, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// --- COMPOSANT SIDEBAR DE FILTRES ---
const FilterSidebarContent = ({ 
  priceRange, setPriceRange, maxPrice, activeFilters, setActiveFilters, availableTerms, categorySlug 
}: any) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
        <span className="bg-[#D4AF37] w-1 h-4 rounded-full"></span> Prix maximum
      </h3>
      <div className="px-2">
        <Slider
          defaultValue={[0, maxPrice]}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mt-6"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-black text-gray-900">{priceRange[0]}€</span>
          <span className="text-xs font-black text-gray-900">{priceRange[1]}€</span>
        </div>
      </div>
    </div>

    <Separator />

    <ProductFilters 
      categorySlug={categorySlug}
      activeFilters={activeFilters} 
      onFiltersChange={setActiveFilters}
      availableTerms={availableTerms}
    />
  </div>
);

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [maxPrice, setMaxPrice] = useState(2000);
  
  // État initial des filtres
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    mySize: false, sizes: [], colors: [], comfort: [], coupe: [], live: false, nouveautes: false
  });

  useEffect(() => {
    async function fetchCategoryData() {
      if (!slug) return;
      setLoading(true);
      try {
        const { data: cat, error: catErr } = await supabase.from('categories').select('*').eq('slug', slug).single();
        if (catErr || !cat) throw catErr;
        setCategory(cat);

        const { data: mappingData } = await supabase.from('product_category_mapping').select('product_id').eq('category_id', cat.id);
        const productIds = (mappingData || []).map(m => m.product_id);

        if (productIds.length > 0) {
          const { data: prods, error: prodErr } = await supabase.from('products').select('*').in('id', productIds).eq('status', 'publish');
          if (prodErr) throw prodErr;

          if (prods) {
            setProducts(prods);
            const highest = Math.max(...prods.map(p => p.sale_price || p.regular_price || 0));
            setMaxPrice(highest > 0 ? highest : 500);
            setPriceRange([0, highest > 0 ? highest : 500]);
          }
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryData();
  }, [slug]);

  // --- LOGIQUE DE FILTRAGE PAR ID (UUID) ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Filtre Prix
      const price = p.sale_price || p.regular_price || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      // 2. Filtre Live
      if (activeFilters.live && !p.video_url) return false;

      // 3. Attributs Dynamiques (Utilisation des UUID du JSON)
      const pAttrs = p.attributes || {};
      
      // On ne filtre que sur les clés qui ont des valeurs sélectionnées
      for (const [filterKey, selectedValues] of Object.entries(activeFilters)) {
        // On ignore les filtres globaux
        if (['live', 'nouveautes', 'mySize', 'sizes', 'colors', 'comfort', 'coupe'].includes(filterKey)) continue;
        
        const values = selectedValues as string[];
        if (values.length === 0) continue;

        // On cherche la clé (UUID) directement dans les attributs du produit
        const productData = pAttrs[filterKey];
        
        if (!productData) return false; // Le produit n'a pas cet ID d'attribut

        const attrArray = Array.isArray(productData) ? productData : [productData];
        const hasMatch = values.some(val => attrArray.includes(val));
        
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [products, priceRange, activeFilters]);

  const availableTerms = useMemo(() => {
    const terms = new Set<string>();
    products.forEach(p => {
      const a = p.attributes || {};
      Object.values(a).forEach((val: any) => {
        if (Array.isArray(val)) val.forEach(v => terms.add(String(v)));
        else if (val) terms.add(String(val));
      });
    });
    return terms;
  }, [products]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FDFCFB]">
      <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement de la collection...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#D4AF37] mb-6 uppercase tracking-[0.2em] transition-all">
            <ArrowLeft className="h-3 w-3" /> Retour Accueil
          </Link>
          <div className="space-y-4">
            <Badge className="bg-amber-50 text-[#D4AF37] border-amber-100 px-4 py-1 font-black text-[10px] uppercase tracking-widest">
              {filteredProducts.length} pépites disponibles
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">
              {category?.name}
            </h1>
            <p className="text-gray-500 max-w-2xl text-base md:text-lg font-medium leading-relaxed">
              {category?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-12">
          <aside className="hidden lg:block space-y-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit sticky top-28">
            <FilterSidebarContent 
              categorySlug={slug} priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice}
              activeFilters={activeFilters} setActiveFilters={setActiveFilters} availableTerms={availableTerms}
            />
          </aside>

          <div className="lg:col-span-3 space-y-8">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-700">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-900 uppercase">Aucune pépite ne correspond</h3>
                <p className="text-gray-400 mt-2 mb-10 text-sm font-medium">Réinitialisez les filtres pour voir les produits.</p>
                <Button onClick={() => setActiveFilters({ mySize: false, sizes: [], colors: [], comfort: [], coupe: [], live: false, nouveautes: false })} className="bg-black text-white rounded-2xl h-12 px-10 font-black uppercase text-[10px] tracking-widest hover:bg-[#D4AF37] transition-all">
                  EFFACER TOUT
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}