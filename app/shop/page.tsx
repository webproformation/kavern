'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  SlidersHorizontal, Filter, AlertTriangle, ChevronRight, Home, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

const LIVE_KEYWORDS = ['live'];

const FilterSidebarContent = ({ priceRange, setPriceRange, maxPrice, activeFilters, setActiveFilters, availableTerms }: any) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
        <span className="bg-[#D4AF37] w-1 h-4 rounded-full"></span> Prix maximum
      </h3>
      <div className="px-2">
        <Slider value={priceRange} onValueChange={(value) => setPriceRange(value as [number, number])} max={maxPrice} step={1} className="my-4" />
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>{priceRange[0]}€</span>
          <span className="text-[#D4AF37] font-bold">{priceRange[1]}€</span>
        </div>
      </div>
    </div>
    <Separator />
    <ProductFilters activeFilters={activeFilters} availableTerms={availableTerms} onFiltersChange={setActiveFilters} />
  </div>
);

export default function ShopPage() {
  const { profile } = useAuth();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTerms, setAvailableTerms] = useState<Set<string>>(new Set());
  const [productTermsMap, setProductTermsMap] = useState<Record<string, Set<string>>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    mySize: false, sizes: [], colors: [], comfort: [], coupe: [], live: false, nouveautes: false,
  });

  const extractProductTerms = (p: any, dictionary: Record<string, string>): Set<string> => {
    const terms = new Set<string>();

    const addValue = (v: any) => {
      if (v == null || v === '') return;
      const vStr = String(v).toLowerCase().trim();
      const resolved = dictionary[vStr] ? dictionary[vStr].toLowerCase().trim() : vStr;
      terms.add(resolved);
    };

    const processAttributes = (attrObj: any) => {
      if (!attrObj) return;
      let data: any;
      try {
        data = typeof attrObj === 'string' ? JSON.parse(attrObj) : attrObj;
      } catch {
        return;
      }
      if (!data) return;

      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (!item || typeof item !== 'object') return;
          if (Array.isArray(item.options)) {
            item.options.forEach(addValue);
          } else if (item.option != null) {
            addValue(item.option);
          } else if (Array.isArray(item.term_ids)) {
            item.term_ids.forEach(addValue);
          } else if (item.value != null) {
            addValue(item.value);
          }
        });
      } else if (typeof data === 'object') {
        Object.values(data).forEach((val: any) => {
          Array.isArray(val) ? val.forEach(addValue) : addValue(val);
        });
      }
    };

    processAttributes(p.attributes);
    p.product_variations?.forEach((v: any) =>
      processAttributes(v.attributes)
    );

    return terms;
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { applyFilters(); }, [priceRange, activeFilters, allProducts, productTermsMap]);

  async function loadProducts() {
    setLoading(true);
    try {
      const { data: termsData } = await supabase.from('product_attribute_terms').select('id, name');
      const dict: Record<string, string> = {};
      if (termsData) {
        termsData.forEach(t => { dict[String(t.id).toLowerCase()] = t.name; });
      }

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'publish')
        .order('created_at', { ascending: false });

      if (productsData) {
        const productIds = productsData.map(p => p.id);
        const { data: variationsData } = await supabase.from('product_variations').select('*').in('product_id', productIds);
        
        const finalProducts = productsData.map(p => ({
          ...p,
          product_variations: variationsData?.filter(v => v.product_id === p.id) || []
        }));

        const globalSet = new Set<string>();
        const pMap: Record<string, Set<string>> = {};
        
        finalProducts.forEach(p => {
          const terms = extractProductTerms(p, dict);
          pMap[p.id] = terms;
          terms.forEach(t => globalSet.add(t));
        });

        setAllProducts(finalProducts);
        setProductTermsMap(pMap);
        setAvailableTerms(globalSet);

        const prices = productsData.map(p => p.sale_price || p.regular_price || 0).filter(p => p > 0);
        const max = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 200;
        setMaxPrice(max);
        setPriceRange([0, max]);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    if (!allProducts.length) return;
    const boolKeys = ['mySize', 'live', 'nouveautes'];
    const filtered = allProducts.filter(p => {
      const price = p.sale_price || p.regular_price || 0;
      const terms = productTermsMap[p.id] || new Set<string>();
      
      if (price < priceRange[0] || price > priceRange[1]) return false;
      
      for (const [key, selectedValues] of Object.entries(activeFilters)) {
        if (boolKeys.includes(key)) continue;
        if (!Array.isArray(selectedValues) || selectedValues.length === 0) continue;
        const hasMatch = selectedValues.some((val: string) => terms.has(val.toLowerCase().trim()));
        if (!hasMatch) return false;
      }
      
      if (activeFilters.live) {
        const hasLive = [...terms].some(t => LIVE_KEYWORDS.some(k => t.includes(k)));
        if (!hasLive) return false;
      }
      return true;
    });
    
    setFilteredProducts(filtered);
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase text-[#b8933d] animate-pulse">
      Chargement de la malle...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      {profile?.is_admin && (
        <div className="bg-red-50 border-b border-red-100 py-2 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 font-black text-[10px] uppercase tracking-widest">
              <AlertTriangle className="h-3 w-3" /> Mode Administrateur
            </div>
            <Button asChild size="sm" variant="outline" className="h-7 text-[10px] font-bold border-red-200 hover:bg-red-100">
              <Link href="/admin/products/new">Ajouter une pépite</Link>
            </Button>
          </div>
        </div>
      )}
      
      <nav className="bg-white border-b py-3 px-4">
        <div className="container mx-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-[#b8933d] flex items-center gap-1"><Home className="h-3 w-3" /> Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#b8933d]">Tous les Produits</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <div className="flex items-center gap-2 mb-8 text-[#D4AF37] font-black uppercase text-xs tracking-widest">
                <Filter className="w-4 h-4" /> Vos Critères
              </div>
              <FilterSidebarContent priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} activeFilters={activeFilters} setActiveFilters={setActiveFilters} availableTerms={availableTerms} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none flex items-center gap-3">
                  La Kavern Complète <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                </h1>
                <p className="text-gray-400 font-medium italic text-sm">Explorez l'intégralité de nos pépites et trouvez la perle rare.</p>
              </div>
              
              {allProducts.length > 0 && (
                <div className="flex items-center gap-3 lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="rounded-2xl border-gray-200 h-12 px-6 font-bold shadow-sm">
                        <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtres
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto rounded-r-[2rem]">
                      <SheetHeader className="mb-8 text-left">
                        <SheetTitle className="text-2xl font-black text-[#D4AF37] uppercase italic">Affiner</SheetTitle>
                      </SheetHeader>
                      <FilterSidebarContent priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} activeFilters={activeFilters} setActiveFilters={setActiveFilters} availableTerms={availableTerms} />
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showAddToCart={true} />
              ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-bold uppercase tracking-widest">Aucun résultat trouvé dans la Kavern</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}