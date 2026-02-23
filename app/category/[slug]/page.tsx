'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, ProductCategory } from '@/lib/supabase';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  Filter, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  Home,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

const FilterSidebarContent = ({ 
  priceRange, 
  setPriceRange, 
  maxPrice, 
  slug, 
  activeFilters, 
  setActiveFilters,
  availableTerms 
}: any) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
        <span className="bg-[#D4AF37] w-1 h-4 rounded-full"></span> Prix maximum
      </h3>
      <div className="px-2">
        <Slider 
          value={priceRange} 
          onValueChange={(value) => setPriceRange(value as [number, number])} 
          max={maxPrice} 
          step={1} 
          className="my-4" 
        />
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>{priceRange[0]}€</span>
          <span className="text-[#D4AF37] font-bold">{priceRange[1]}€</span>
        </div>
      </div>
    </div>
    <Separator />
    <ProductFilters 
      categorySlug={slug === 'tous' ? undefined : slug} 
      activeFilters={activeFilters}
      availableTerms={availableTerms} 
      onFiltersChange={setActiveFilters} 
    />
  </div>
);

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const slug = params.slug as string;

  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [availableTerms, setAvailableTerms] = useState<Set<string>>(new Set());
  const [productTermsMap, setProductTermsMap] = useState<Record<string, Set<string>>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [maxPrice, setMaxPrice] = useState(200);
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    mySize: false,
    sizes: [], colors: [], comfort: [], coupe: [], live: false, nouveautes: false,
  });

  const [idToNameMap, setIdToNameMap] = useState<Record<string, string>>({});

  // ANALYSE STRICTE DES ATTRIBUTS (Évite les bugs de texte brut)
  const extractProductTerms = (p: any, dictionary: Record<string, string>): Set<string> => {
    const found = new Set<string>();
    
    const scan = (attrObj: any) => {
      if (!attrObj) return;
      const data = typeof attrObj === 'string' ? JSON.parse(attrObj) : attrObj;
      
      Object.entries(data).forEach(([key, val]) => {
        // 1. On regarde la clé (l'ID de l'attribut)
        const keyLower = key.toLowerCase().trim();
        if (dictionary[keyLower]) found.add(dictionary[keyLower].toLowerCase());
        else found.add(keyLower);

        // 2. On regarde la valeur (Nom ou ID du terme)
        const processValue = (v: any) => {
          const vStr = String(v).toLowerCase().trim();
          if (dictionary[vStr]) found.add(dictionary[vStr].toLowerCase());
          else found.add(vStr);
        };

        if (Array.isArray(val)) val.forEach(processValue);
        else processValue(val);
      });
    };

    try {
      scan(p.attributes);
      p.product_variations?.forEach((v: any) => scan(v.attributes));
    } catch (e) {}

    return found;
  };

  useEffect(() => { loadCategoryAndProducts(); }, [slug]);
  useEffect(() => { applyFilters(); }, [priceRange, activeFilters, allProducts, productTermsMap]);

  async function loadCategoryAndProducts() {
    setLoading(true);
    try {
      // 1. CHARGER LE DICTIONNAIRE
      const { data: termsData } = await supabase.from('product_attribute_terms').select('id, name');
      const dict: Record<string, string> = {};
      if (termsData) {
        termsData.forEach(t => { dict[String(t.id).toLowerCase()] = t.name; });
      }
      setIdToNameMap(dict);

      // 2. CHARGER LES PRODUITS
      let query = supabase.from('products').select('*').eq('status', 'publish').order('created_at', { ascending: false });

      if (slug !== 'tous') {
        const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
        if (!cat) { router.push('/'); return; }
        setCategory(cat);
        const { data: map } = await supabase.from('product_category_mapping').select('product_id').eq('category_id', cat.id);
        const productIds = map?.map(m => m.product_id) || [];
        if (productIds.length > 0) query = query.in('id', productIds);
        else { setAllProducts([]); setLoading(false); return; }
      }

      const { data: productsData } = await query;
      if (productsData) {
        const ids = productsData.map(p => p.id);
        const { data: variations } = await supabase.from('product_variations').select('*').in('product_id', ids);
        
        const finalProducts = productsData.map(p => ({
          ...p,
          product_variations: variations?.filter(v => v.product_id === p.id) || []
        }));

        // 3. GÉNÉRER LE RADAR
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
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  function applyFilters() {
    if (!allProducts) return;
    let filtered = allProducts.filter(p => {
      const price = p.sale_price || p.regular_price || 0;
      const terms = productTermsMap[p.id] || new Set();
      
      if (price < priceRange[0] || price > priceRange[1]) return false;

      for (const [key, values] of Object.entries(activeFilters)) {
        if (Array.isArray(values) && values.length > 0 && !['mySize', 'live', 'nouveautes'].includes(key)) {
          if (!values.some(v => terms.has(v.toLowerCase().trim()))) return false;
        }
      }

      if (activeFilters.live && !terms.has("live") && !terms.has("vu en live")) return false;
      return true;
    });

    setFilteredProducts(filtered);
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase text-[#b8933d] animate-pulse">Chargement...</div>;

  const categoryName = slug === 'tous' ? 'Tous les Produits' : category?.name || '';

  return (
    <div className="min-h-screen bg-gray-50/30">
      {profile?.is_admin && (
        <div className="bg-red-50 border-b border-red-100 py-2 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 font-black text-[10px] uppercase tracking-widest"><AlertTriangle className="h-3 w-3" /> Mode Gestionnaire</div>
            <Button asChild size="sm" variant="outline" className="h-7 text-[10px] font-bold border-red-200 hover:bg-red-100"><Link href="/admin/products/new">Ajouter</Link></Button>
          </div>
        </div>
      )}

      <nav className="bg-white border-b py-3 px-4">
        <div className="container mx-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-[#b8933d] flex items-center gap-1"><Home className="h-3 w-3" /> Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#b8933d]">{categoryName}</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <div className="flex items-center gap-2 mb-8 text-[#D4AF37] font-black uppercase text-xs tracking-widest">
                <Filter className="w-4 h-4" /> Vos Critères
              </div>
              <FilterSidebarContent priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} slug={slug} activeFilters={activeFilters} setActiveFilters={setActiveFilters} availableTerms={availableTerms} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">{categoryName}</h1>
                {category?.description && <p className="text-gray-400 font-medium italic text-sm">{category.description}</p>}
              </div>
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-2xl border-gray-200 h-12 px-6 font-bold shadow-sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtrer
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto rounded-r-[2rem]">
                    <FilterSidebarContent priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} slug={slug} activeFilters={activeFilters} setActiveFilters={setActiveFilters} availableTerms={availableTerms} />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showAddToCart={true} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}