'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, Filter, Check, Video, Sparkles } from 'lucide-react';
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

const FALLBACK_COLORS: Record<string, string> = {
  'blanc': '#FFFFFF', 'noir': '#111111', 'gris': '#808080', 'beige': '#F5F5DC',
  'rouge': '#ef4444', 'bleu': '#3b82f6', 'vert': '#22c55e', 'jaune': '#eab308',
  'rose': '#ec4899', 'marron': '#8b4513', 'or': '#d4af37', 'argent': '#c0c0c0',
  'multicolore': 'conic-gradient(red, yellow, green, blue, magenta, red)',
  'ivoire nacré': '#F9F6EE', 'vert malachite': '#0E4B31'
};

export function ProductFilters({ 
  activeFilters, 
  availableTerms,
  onFiltersChange 
}: any) {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('product_attributes').select('id, name, slug, terms:product_attribute_terms(id, name, slug, color_code)').eq('is_visible', true).order('order_by');
      setAttributes(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const checkHasTerm = (name: string) => {
    if (!availableTerms) return false;
    return availableTerms.has(name.toLowerCase().trim());
  };

  const toggleFilter = (key: string, value: string) => {
    const newFilters = { ...activeFilters };
    const current = Array.isArray(newFilters[key]) ? newFilters[key] : [];
    newFilters[key] = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
    onFiltersChange(newFilters);
  };

  if (loading) return <div className="space-y-6 pt-4 animate-pulse"><div className="h-4 bg-gray-50 rounded-full w-1/2"></div><div className="h-24 bg-gray-50 rounded-[2rem] w-full"></div></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-black uppercase text-[11px] tracking-[0.2em] text-gray-900">
          <Filter className="h-3.5 w-3.5" /> Filtrer
        </div>
        <button onClick={() => window.location.reload()} className="text-[9px] font-black text-gray-300 hover:text-[#D4AF37] uppercase flex items-center gap-1">
          <X className="h-3 w-3" /> Reset
        </button>
      </div>

      <Separator className="opacity-50" />

      {attributes.map((group) => {
        const visibleTerms = group.terms.filter((opt: any) => checkHasTerm(opt.name));
        if (visibleTerms.length === 0) return null;

        const isColor = group.name.toLowerCase().includes('couleur') || group.name.toLowerCase().includes('pierre');

        return (
          <div key={group.id} className="space-y-5 animate-in fade-in duration-700">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">{group.name}</h3>
            
            <div className={cn(isColor ? "flex flex-wrap gap-3" : "space-y-4")}>
              {visibleTerms.map((opt: any) => {
                const isActive = (activeFilters[group.id] || []).includes(opt.name);
                
                if (isColor) {
                  const colorCode = opt.color_code || FALLBACK_COLORS[opt.name.toLowerCase().trim()] || '#e5e7eb';
                  const bgStyle = colorCode.includes('gradient') ? { backgroundImage: colorCode } : { backgroundColor: colorCode };

                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleFilter(group.id, opt.name)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-1 ring-gray-100",
                        isActive ? "ring-2 ring-offset-2 ring-[#b8933d] scale-110 shadow-xl" : "hover:scale-105"
                      )}
                      style={bgStyle}
                    >
                      {isActive && <Check className={cn("w-5 h-5", ['#ffffff', '#f5f5dc', '#f9f6ee'].includes(colorCode.toLowerCase()) ? "text-gray-900" : "text-white")} />}
                    </button>
                  );
                }

                return (
                  <div key={opt.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleFilter(group.id, opt.name)}>
                    <Checkbox checked={isActive} className="data-[state=checked]:bg-[#D4AF37] border-gray-200 h-6 w-6 rounded-xl" />
                    <Label className={cn("text-xs font-bold cursor-pointer transition-colors uppercase tracking-tight", isActive ? "text-[#D4AF37]" : "text-gray-500 group-hover:text-gray-900")}>
                      {opt.name}
                    </Label>
                  </div>
                );
              })}
            </div>
            <Separator className="opacity-30 pt-4" />
          </div>
        );
      })}

      <div className="space-y-6 pt-2">
        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#b8933d]">Univers Kavern</h3>
        <div className="space-y-4">
          <div 
            className={cn("flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer", activeFilters.live ? "bg-pink-50 border-pink-100" : "bg-white border-gray-50")}
            onClick={() => toggleFilter('live', 'live')}
          >
            <Checkbox checked={activeFilters.live} className="data-[state=checked]:bg-pink-500 border-pink-200 h-5 w-5 rounded-lg" />
            <div className="flex items-center gap-2">
               <Video className="h-4 w-4 text-pink-500" />
               <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Vu en Live</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}