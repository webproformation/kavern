'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, ProductCategory } from '@/lib/supabase';
import { ArrowLeft, SlidersHorizontal, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

// Composant Sidebar interne pour la réutilisation (Desktop / Mobile)
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
        <span className="bg-[#D4AF37] w-1 h-4 rounded-full"></span> Prix
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
          <span>{priceRange[1]}€</span>
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [maxPrice, setMaxPrice] = useState(200);
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    mySize: false,
    sizes: [], colors: [], comfort: [], coupe: [], live: false, nouveautes: false,
  });

  const [nameToIdsMap, setNameToIdsMap] = useState<Map<string, string[]>>(new Map());

  useEffect(() => { loadCategoryAndProducts(); }, [slug]);
  
  useEffect(() => {
    if (allProducts.length > 0) {
      const terms = new Set<string>();
      allProducts.forEach(p => {
        const values = [
          ...deepExtractValues(p.attributes),
          ...(p.product_variations ? deepExtractValues(p.product_variations) : [])
        ];
        values.forEach(v => terms.add(v));
      });
      setAvailableTerms(terms);
    }
  }, [allProducts]);

  useEffect(() => { applyFilters(); }, [priceRange, activeFilters, allProducts, nameToIdsMap]);

  async function loadCategoryAndProducts() {
    setLoading(true);
    try {
      // 1. Charger la map des attributs pour le filtrage
      const { data: terms } = await supabase.from('product_attribute_terms').select('id, name');
      const map = new Map<string, string[]>();
      if (terms) {
        terms.forEach(t => {
          const idStr = String(t.id);
          const nameLower = t.name.toLowerCase();
          if (!map.has(nameLower)) map.set(nameLower, []);
          map.get(nameLower)?.push(idStr);
        });
      }
      setNameToIdsMap(map);

      // 2. Préparer la requête produits
      let productsQuery = supabase.from('products').select('*').eq('status', 'publish').order('created_at', { ascending: false });

      if (slug !== 'tous') {
        const { data: categoryData } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
        if (!categoryData) { router.push('/'); return; }
        setCategory(categoryData);
        
        const { data: mappingData } = await supabase.from('product_category_mapping').select('product_id').eq('category_id', categoryData.id);
        const productIds = mappingData?.map(m => m.product_id) || [];
        
        if (productIds.length > 0) productsQuery = productsQuery.in('id', productIds);
        else { 
            setAllProducts([]); 
            setLoading(false); 
            return; 
        }
      }

      const { data: productsData } = await productsQuery;

      if (productsData) {
        const productIds = productsData.map(p => p.id);
        const { data: variationsData } = await supabase
          .from('product_variations')
          .select('*')
          .in('product_id', productIds);

        const productsWithVariations = productsData.map(p => ({
          ...p,
          product_variations: variationsData?.filter(v => v.product_id === p.id) || []
        }));

        setAllProducts(productsWithVariations);
        
        const prices = productsData.map(p => p.sale_price || p.regular_price || 0).filter(p => p > 0);
        const max = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 200;
        setMaxPrice(max);
        setPriceRange([0, max]);
      }
    } catch (error) { 
        console.error('Error loading category:', error); 
    } finally { 
        setLoading(false); 
    }
  }

  const deepExtractValues = (obj: any): string[] => {
    let values: string[] = [];
    if (!obj) return values;
    if (Array.isArray(obj)) {
      obj.forEach(item => values = values.concat(deepExtractValues(item)));
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(val => values = values.concat(deepExtractValues(val)));
    } else if (typeof obj === 'string' || typeof obj === 'number') {
      values.push(String(obj).toLowerCase());
    }
    return values;
  };

  function applyFilters() {
    if (!allProducts) return;
    let filtered = [...allProducts];

    filtered = filtered.filter(p => {
      const price = p.sale_price || p.regular_price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (activeFilters.mySize && profile?.user_size) {
      filtered = filtered.filter(p => {
        const userSize = profile.user_size;
        if (p.product_variations && p.product_variations.length > 0) {
          return p.product_variations.some((v: any) => 
            (v.size_min !== null && v.size_max !== null && userSize >= v.size_min && userSize <= v.size_max)
          );
        }
        const values = deepExtractValues(p.attributes);
        return values.includes(String(userSize));
      });
    }

    const productHasAttribute = (product: any, targetNames: string[]) => {
      const targets = new Set<string>();
      targetNames.forEach(name => {
        const lowerName = name.toLowerCase();
        targets.add(lowerName);
        const ids = nameToIdsMap.get(lowerName);
        if (ids) ids.forEach(id => targets.add(id));
      });

      const allProductValues = new Set([
        ...deepExtractValues(product.attributes),
        ...(product.product_variations ? deepExtractValues(product.product_variations) : [])
      ]);

      for (const target of targets) {
        if (allProductValues.has(target)) return true;
      }
      return false;
    };

    if (activeFilters.sizes.length > 0) filtered = filtered.filter(p => productHasAttribute(p, activeFilters.sizes));
    if (activeFilters.colors.length > 0) filtered = filtered.filter(p => productHasAttribute(p, activeFilters.colors));
    if (activeFilters.comfort.length > 0) filtered = filtered.filter(p => productHasAttribute(p, activeFilters.comfort));
    if (activeFilters.coupe.length > 0) filtered = filtered.filter(p => productHasAttribute(p, activeFilters.coupe));
    if (activeFilters.live) filtered = filtered.filter(p => productHasAttribute(p, ["Vu dans le dernier Live !", "Live"]));
    if (activeFilters.nouveautes) filtered = filtered.filter(p => productHasAttribute(p, ["Nouveautés", "Nouveau"]));

    setFilteredProducts(filtered);
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-600 font-medium">Chargement des pépites...</div>
    </div>
  );

  const displayProducts = filteredProducts;
  const categoryName = slug === 'tous' ? 'Tous les Produits' : category?.name || '';

  return (
    <div className="min-h-screen bg-gray-50/30">
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#D4AF37] mb-6 transition-all text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filtres (uniquement si la catégorie contient des produits au départ) */}
          {allProducts.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="flex items-center gap-2 mb-6 text-[#D4AF37] font-bold text-lg">
                  <Filter className="w-5 h-5" /> Filtres
                </div>
                <FilterSidebarContent 
                  priceRange={priceRange} 
                  setPriceRange={setPriceRange} 
                  maxPrice={maxPrice} 
                  slug={slug} 
                  activeFilters={activeFilters} 
                  setActiveFilters={setActiveFilters}
                  availableTerms={availableTerms}
                />
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
                {category?.description && <p className="text-gray-500 mt-1 text-sm">{category.description}</p>}
              </div>

              {/* Bouton Mobile Filtres (uniquement si la catégorie contient des produits) */}
              {allProducts.length > 0 && (
                <div className="flex items-center gap-3 lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="rounded-xl border-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37]">
                        <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtres
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                      <SheetHeader className="mb-6 text-left">
                        <SheetTitle className="text-2xl font-bold text-[#D4AF37]">Filtres</SheetTitle>
                      </SheetHeader>
                      <FilterSidebarContent 
                        priceRange={priceRange} 
                        setPriceRange={setPriceRange} 
                        maxPrice={maxPrice} 
                        slug={slug} 
                        activeFilters={activeFilters} 
                        setActiveFilters={setActiveFilters}
                        availableTerms={availableTerms}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>

            {allProducts.length > 0 && (
              <div className="mb-6">
                <Badge variant="secondary" className="px-3 py-1 bg-white border border-gray-200 text-gray-600">
                  {displayProducts.length} résultat{displayProducts.length > 1 ? 's' : ''}
                </Badge>
              </div>
            )}

            {/* CAS 1 : LA CATÉGORIE EST VIDE EN BASE DE DONNÉES */}
            {allProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Sparkles className="h-10 w-10 text-[#D4AF37] animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 italic">C'est pour bientôt...</h3>
                <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
                  Cette catégorie est en cours de préparation. <br /> 
                  <span className="font-semibold text-gray-800">« ça arrive très prochainement »</span> dans la Kavern !
                </p>
                <div className="mt-10">
                   <Button asChild className="bg-black hover:bg-gray-800 text-white px-8 h-12 rounded-full">
                      <Link href="/">Découvrir d'autres pépites</Link>
                   </Button>
                </div>
              </div>
            ) 
            /* CAS 2 : LES FILTRES APPLIQUÉS NE DONNENT RIEN */
            : displayProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="text-4xl mb-4">🧐</div>
                <p className="text-xl text-gray-900 font-medium mb-2">Aucun produit ne correspond à vos critères</p>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setPriceRange([0, maxPrice]); 
                    setActiveFilters({
                      mySize: false, sizes: [], colors: [], comfort: [], coupe: [], live: false, nouveautes: false
                    });
                  }} 
                  className="text-[#D4AF37] border-[#D4AF37] hover:bg-[#FFF9F0]"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) 
            /* CAS 3 : AFFICHAGE DES PRODUITS */
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} showAddToCart={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}