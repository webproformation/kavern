'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Filter } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  slug: string;
  color_code?: string;
}

export interface FilterState {
  mySize: boolean;
  sizes: string[];
  colors: string[];
  comfort: string[];
  coupe: string[];
  live: boolean;
  nouveautes: boolean;
}

interface ProductFiltersProps {
  categorySlug?: string;
  activeFilters: FilterState;
  availableTerms: Set<string>;
  onFiltersChange: (filters: FilterState) => void;
}

const FALLBACK_COLORS: Record<string, string> = {
  'blanc': '#FFFFFF', 'noir': '#000000', 'gris': '#808080', 'beige': '#F5F5DC',
  'marron': '#8B4513', 'bleu': '#0000FF', 'vert': '#008000', 'jaune': '#FFFF00',
  'orange': '#FFA500', 'rouge': '#FF0000', 'rose': '#FFC0CB', 'violet': '#800080'
};

export default function ProductFilters({ 
  categorySlug, 
  activeFilters, 
  availableTerms,
  onFiltersChange 
}: ProductFiltersProps) {
  const { profile } = useAuth();
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FLAG DE CONFIGURATION (Permet de réactiver les filtres vêtements plus tard)
  const ENABLE_CLOTHING_FILTERS = false; 

  useEffect(() => {
    loadFilterData();
  }, []);

  async function loadFilterData() {
    try {
      const { data: attrs, error } = await supabase
        .from('product_attributes')
        .select(`
          id, name, slug,
          terms:product_attribute_terms(id, name, slug, color_code)
        `)
        .eq('is_visible', true)
        .order('order_by');

      if (error) throw error;
      setAttributes(attrs || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleFilter = (key: keyof FilterState, value: string | boolean) => {
    const newFilters = { ...activeFilters };
    if (typeof value === 'boolean') {
      (newFilters as any)[key] = value;
    } else {
      const current = (newFilters as any)[key] as string[];
      if (current.includes(value)) {
        (newFilters as any)[key] = current.filter(v => v !== value);
      } else {
        (newFilters as any)[key] = [...current, value];
      }
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({
      mySize: false,
      sizes: [],
      colors: [],
      comfort: [],
      coupe: [],
      live: false,
      nouveautes: false
    });
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded w-full"></div></div>;

  // Filtrage des groupes d'attributs
  const sizeGroup = attributes.find(a => a.slug === 'tailles');
  const colorGroup = attributes.find(a => a.slug === 'couleurs');
  const otherGroups = attributes.filter(a => a.slug !== 'tailles' && a.slug !== 'couleurs');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Filter className="h-4 w-4" /> Filtres
        </div>
        <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors flex items-center gap-1">
          <X className="h-3 w-3" /> Effacer tout
        </button>
      </div>

      <Separator />

      {/* 1. SECTION MA TAILLE (Désactivée selon demande André) */}
      {ENABLE_CLOTHING_FILTERS && profile?.user_size && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
            <Checkbox 
              id="filter-mysize" 
              checked={activeFilters.mySize} 
              onCheckedChange={(c) => toggleFilter('mySize', !!c)}
              className="data-[state=checked]:bg-[#D4AF37] border-[#D4AF37]" 
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="filter-mysize" className="text-sm font-bold text-[#b8933d] cursor-pointer flex items-center gap-1">
                ✨ Ma taille ({profile.user_size})
              </Label>
              <p className="text-[10px] text-amber-700 italic">Afficher uniquement ce qui me va</p>
            </div>
          </div>
          <Separator />
        </div>
      )}

      {/* 2. SECTION TAILLES (Désactivée selon demande André) */}
      {ENABLE_CLOTHING_FILTERS && sizeGroup && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">{sizeGroup.name}</h3>
          <div className="grid grid-cols-4 gap-2">
            {sizeGroup.terms.map((opt: FilterOption) => {
              const isActive = activeFilters.sizes.includes(opt.name);
              const isAvailable = availableTerms.has(opt.name);
              return (
                <button
                  key={opt.id}
                  disabled={!isAvailable}
                  onClick={() => toggleFilter('sizes', opt.name)}
                  className={`h-9 rounded-lg text-xs font-bold transition-all border ${
                    isActive 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-md' 
                      : isAvailable 
                        ? 'bg-white border-gray-200 text-gray-700 hover:border-[#D4AF37]' 
                        : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  {opt.name}
                </button>
              );
            })}
          </div>
          <Separator />
        </div>
      )}

      {/* 3. SECTION COULEURS (Désactivée selon demande André) */}
      {ENABLE_CLOTHING_FILTERS && colorGroup && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">{colorGroup.name}</h3>
          <div className="flex flex-wrap gap-3">
            {colorGroup.terms.map((opt: FilterOption) => {
              const isActive = activeFilters.colors.includes(opt.name);
              const isAvailable = availableTerms.has(opt.name);
              const colorCode = opt.color_code || FALLBACK_COLORS[opt.name.toLowerCase()] || '#CCCCCC';
              
              return (
                <button
                  key={opt.id}
                  disabled={!isAvailable}
                  onClick={() => toggleFilter('colors', opt.name)}
                  title={opt.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    isActive ? 'border-[#D4AF37] scale-110 shadow-md' : 'border-transparent'
                  } ${!isAvailable && 'opacity-20 grayscale cursor-not-allowed'}`}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-100" 
                    style={{ backgroundColor: colorCode }}
                  />
                </button>
              );
            })}
          </div>
          <Separator />
        </div>
      )}

      {/* 4. AUTRES ATTRIBUTS DYNAMIQUES (Confort, Coupe, Matière...) */}
      {otherGroups.map((group) => (
        <div key={group.id} className="space-y-4">
          <h3 className="font-semibold text-sm text-gray-900">{group.name}</h3>
          <div className="space-y-2">
            {group.terms
              .filter((opt: any) => availableTerms.has(opt.name))
              .map((opt: FilterOption) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${group.slug}-${opt.id}`} 
                    checked={(activeFilters as any)[group.slug]?.includes(opt.name) || false} 
                    onCheckedChange={() => toggleFilter(group.slug as any, opt.name)} 
                    className="data-[state=checked]:bg-[#D4AF37] border-[#D4AF37]" 
                  />
                  <Label htmlFor={`${group.slug}-${opt.id}`} className="text-sm cursor-pointer hover:text-[#D4AF37] transition-colors">
                    {opt.name}
                  </Label>
                </div>
              ))}
          </div>
          <Separator />
        </div>
      ))}

      {/* 5. FILTRES SPÉCIAUX (Live, Nouveautés) */}
      <div className="space-y-3 pt-2">
        <h3 className="font-semibold text-sm text-gray-900 uppercase tracking-tighter text-gray-400">Expérience Kavern</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 group">
            <Checkbox 
              id="filter-live" 
              checked={activeFilters.live} 
              onCheckedChange={(c) => toggleFilter('live', !!c)} 
              className="data-[state=checked]:bg-pink-500 border-pink-500" 
            />
            <Label htmlFor="filter-live" className="text-sm font-medium cursor-pointer group-hover:text-pink-600 transition-colors">
              🎥 Vu en Live
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 group">
            <Checkbox 
              id="filter-nouveautes" 
              checked={activeFilters.nouveautes} 
              onCheckedChange={(c) => toggleFilter('nouveautes', !!c)} 
              className="data-[state=checked]:bg-[#D4AF37] border-[#D4AF37]" 
            />
            <Label htmlFor="filter-nouveautes" className="text-sm font-medium cursor-pointer group-hover:text-[#D4AF37] transition-colors">
              ✨ Nouveautés
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}