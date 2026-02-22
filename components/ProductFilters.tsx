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
import { cn } from '@/lib/utils';

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
  [key: string]: any; 
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

export function ProductFilters({ 
  categorySlug, 
  activeFilters, 
  availableTerms,
  onFiltersChange 
}: ProductFiltersProps) {
  const { profile } = useAuth();
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FLAGS DE CONFIGURATION (Restaurés selon Master Rule) ---
  const ENABLE_CLOTHING_FILTERS = false; 
  const ENABLE_COLOR_FILTERS = false;

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

  const toggleFilter = (key: string, value: string | boolean) => {
    if (typeof onFiltersChange !== 'function') return;
    
    const newFilters = { ...activeFilters };
    if (typeof value === 'boolean') {
      newFilters[key] = value;
    } else {
      const current = Array.isArray(newFilters[key]) ? newFilters[key] : [];
      if (current.includes(value)) {
        newFilters[key] = current.filter((v: string) => v !== value);
      } else {
        newFilters[key] = [...current, value];
      }
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    if (typeof onFiltersChange === 'function') {
      onFiltersChange({
        mySize: false,
        sizes: [],
        colors: [],
        comfort: [],
        coupe: [],
        live: false,
        nouveautes: false
      });
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4 pt-4">
      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      <div className="h-20 bg-gray-100 rounded w-full"></div>
      <div className="h-20 bg-gray-100 rounded w-full"></div>
    </div>
  );

  const sizeGroup = attributes.find(a => a.slug === 'tailles' || a.slug === 'taille');
  const colorGroup = attributes.find(a => a.slug === 'couleurs' || a.slug === 'couleur');
  const otherGroups = attributes.filter(a => 
    a.slug !== 'tailles' && a.slug !== 'taille' && 
    a.slug !== 'couleurs' && a.slug !== 'couleur'
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-black uppercase text-[11px] tracking-[0.15em] text-gray-900">
          <Filter className="h-4 w-4" /> Filtres de recherche
        </div>
        <button onClick={clearFilters} className="text-[10px] font-bold text-gray-400 hover:text-[#D4AF37] transition-all uppercase tracking-widest flex items-center gap-1">
          <X className="h-3 w-3" /> Effacer
        </button>
      </div>

      <Separator className="opacity-50" />

      {/* 1. MA TAILLE (MASQUÉE) */}
      {ENABLE_CLOTHING_FILTERS && profile?.user_size && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
            <Checkbox id="filter-mysize" checked={activeFilters.mySize} onCheckedChange={(c) => toggleFilter('mySize', !!c)} className="data-[state=checked]:bg-[#D4AF37] border-[#D4AF37] h-5 w-5" />
            <div className="grid gap-1">
              <Label htmlFor="filter-mysize" className="text-sm font-black text-[#b8933d] cursor-pointer uppercase tracking-tight">✨ Ma taille ({profile.user_size})</Label>
              <p className="text-[9px] text-amber-700 font-medium">Afficher seulement ce qui me va</p>
            </div>
          </div>
          <Separator className="mt-6 opacity-30" />
        </div>
      )}

      {/* 2. TAILLES (MASQUÉE) */}
      {ENABLE_CLOTHING_FILTERS && sizeGroup && (
        <div className="space-y-4">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">{sizeGroup.name}</h3>
          <div className="grid grid-cols-4 gap-2">
            {sizeGroup.terms.map((opt: FilterOption) => {
              const isActive = (activeFilters.sizes || []).includes(opt.name);
              const isAvailable = availableTerms.has(opt.name);
              return (
                <button key={opt.id} disabled={!isAvailable} type="button" onClick={() => toggleFilter('sizes', opt.name)} className={cn("h-10 rounded-xl text-[11px] font-black transition-all border-2 uppercase", isActive ? "bg-[#D4AF37] border-[#D4AF37] text-white shadow-md scale-105" : isAvailable ? "bg-white border-gray-100 text-gray-700 hover:border-[#D4AF37]" : "bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed opacity-40")}>
                  {opt.name}
                </button>
              );
            })}
          </div>
          <Separator className="mt-6 opacity-30" />
        </div>
      )}

      {/* 3. COULEURS (MASQUÉE) */}
      {ENABLE_COLOR_FILTERS && colorGroup && (
        <div className="space-y-4">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">{colorGroup.name}</h3>
          <div className="flex flex-wrap gap-3">
            {colorGroup.terms.map((opt: FilterOption) => {
              const isActive = (activeFilters.colors || []).includes(opt.name);
              const isAvailable = availableTerms.has(opt.name);
              const colorCode = opt.color_code || FALLBACK_COLORS[opt.name.toLowerCase()] || '#CCCCCC';
              return (
                <button key={opt.id} disabled={!isAvailable} type="button" onClick={() => toggleFilter('colors', opt.name)} title={opt.name} className={cn("w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center", isActive ? "border-[#D4AF37] scale-110 shadow-lg" : "border-transparent", !isAvailable && "opacity-20 grayscale cursor-not-allowed")}>
                  <div className="w-7 h-7 rounded-full border border-black/5 shadow-inner" style={{ backgroundColor: colorCode }} />
                </button>
              );
            })}
          </div>
          <Separator className="mt-6 opacity-30" />
        </div>
      )}

      {/* 4. AUTRES ATTRIBUTS DYNAMIQUES */}
      {otherGroups.map((group) => {
        const visibleTerms = group.terms.filter((opt: any) => availableTerms.has(opt.name));
        if (visibleTerms.length === 0) return null;

        return (
          <div key={group.id} className="space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">{group.name}</h3>
            <div className="space-y-3">
              {visibleTerms.map((opt: any) => {
                const isActive = activeFilters[group.name]?.includes(opt.name);
                return (
                  <div key={opt.id} className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox id={`${group.slug}-${opt.id}`} checked={isActive || false} onCheckedChange={() => toggleFilter(group.name, opt.name)} className="data-[state=checked]:bg-[#D4AF37] border-[#D4AF37] rounded-md h-5 w-5" />
                    <Label htmlFor={`${group.slug}-${opt.id}`} className={cn("text-sm font-bold cursor-pointer transition-colors uppercase tracking-tight", isActive ? "text-[#D4AF37]" : "text-gray-600 hover:text-gray-900")}>
                      {opt.name}
                    </Label>
                  </div>
                );
              })}
            </div>
            <Separator className="opacity-30 mt-6" />
          </div>
        );
      })}

      {/* 5. EXPÉRIENCE KAVERN */}
      <div className="space-y-5 pt-2">
        <h3 className="font-black text-[10px] uppercase tracking-widest text-[#b8933d]">Expérience Kavern</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <Checkbox id="filter-live" checked={activeFilters.live} onCheckedChange={(c) => toggleFilter('live', !!c)} className="data-[state=checked]:bg-pink-500 border-pink-500 rounded-md h-5 w-5" />
            <Label htmlFor="filter-live" className="text-sm font-black text-gray-700 cursor-pointer group-hover:text-pink-600 transition-colors uppercase tracking-tight">🎥 Vu en Live</Label>
          </div>
          <div className="flex items-center space-x-3 group cursor-pointer">
            <Checkbox id="filter-nouveautes" checked={activeFilters.nouveautes} onCheckedChange={(c) => toggleFilter('nouveautes', !!c)} className="data-[state=checked]:bg-[#D4AF37] border-[#D4AF37] rounded-md h-5 w-5" />
            <Label htmlFor="filter-nouveautes" className="text-sm font-black text-gray-700 cursor-pointer group-hover:text-[#D4AF37] transition-colors uppercase tracking-tight">✨ Nouveautés</Label>
          </div>
        </div>
      </div>
    </div>
  );
}