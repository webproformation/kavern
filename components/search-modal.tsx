'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, X, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { decodeHtmlEntities } from '@/lib/utils';
import { CUSTOM_TEXTS } from '@/lib/texts';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  sku: string | null; // Ajout du SKU pour la référence
  image_url: string | null;
  regular_price: number;
  sale_price: number | null;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 4) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const { data, error } = await supabase
          .from('products')
          // MISE À JOUR : On sélectionne le champ 'sku'
          .select('id, name, slug, sku, image_url, regular_price, sale_price')
          .ilike('name', `%${searchQuery}%`)
          .eq('status', 'publish')
          .limit(10);

        if (error) throw error;

        setResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-black/95 border-[#D4AF37] p-0 overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">Rechercher une pépite</DialogTitle>
        <div className="flex flex-col">
          <div className="flex items-center gap-4 p-6 border-b border-[#D4AF37]/30 bg-black">
            <Link href="/" onClick={handleClose}>
              {/* MISE À JOUR : Nouveau Logo KAVERN */}
              <img
                src="/kavern-logo.png"
                alt="KAVERN"
                className="h-10 md:h-14 w-auto"
              />
            </Link>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D4AF37]" />
              <Input
                type="text"
                placeholder={CUSTOM_TEXTS.search.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 bg-white/10 border-[#D4AF37]/30 text-white placeholder:text-gray-500 focus:border-[#D4AF37] text-lg rounded-xl"
                autoFocus
              />
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-[#D4AF37] transition-colors p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-6 custom-scrollbar">
            {searchQuery.length < 4 ? (
              <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-3">
                <Search className="h-8 w-8 opacity-20" />
                <p className="font-medium">Tapez au moins 4 caractères pour explorer la malle...</p>
              </div>
            ) : isSearching ? (
              <div className="text-center text-[#D4AF37] py-12 animate-pulse font-bold uppercase tracking-widest text-sm">
                Recherche de pépites en cours...
              </div>
            ) : results.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                Aucune pépite trouvée pour <span className="text-white italic">"{searchQuery}"</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={handleClose}
                    className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-[#D4AF37]/30 group"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={decodeHtmlEntities(product.name)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-800">
                          <Search className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base md:text-lg truncate group-hover:text-[#D4AF37] transition-colors">
                        {decodeHtmlEntities(product.name)}
                      </h3>
                      {/* MISE À JOUR : Affichage de la référence SKU au lieu de l'ID */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <Tag className="h-3 w-3 text-[#D4AF37]/50" />
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                          Réf: {product.sku || 'KAV-'+product.id.substring(0, 4).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {product.sale_price ? (
                        <div className="flex flex-col items-end">
                          <span className="text-gray-500 line-through text-xs">
                            {product.regular_price.toFixed(2)} €
                          </span>
                          <span className="text-[#D4AF37] font-black text-lg">
                            {product.sale_price.toFixed(2)} €
                          </span>
                        </div>
                      ) : (
                        <span className="text-white font-black text-lg">
                          {product.regular_price.toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}