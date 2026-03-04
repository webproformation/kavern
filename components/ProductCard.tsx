'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist-button';
import { CUSTOM_TEXTS } from '@/lib/texts';
import useEmblaCarousel from 'embla-carousel-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    regular_price: number | null;
    sale_price: number | null;
    image_url: string | null;
    gallery_images?: string[] | null;
    is_variable_product?: boolean;
    stock_quantity?: number | null;
    is_featured?: boolean;
    is_diamond?: boolean;
    attributes?: any;
  };
  showAddToCart?: boolean;
}

export function ProductCard({ product, showAddToCart = false }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const images = [
    product.image_url,
    ...(product.gallery_images || [])
  ].filter(Boolean) as string[];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const displayPrice = product.sale_price || product.regular_price || 0;
  const hasDiscount = product.sale_price && product.sale_price < (product.regular_price || 0);
  const isInStock = !product.stock_quantity || product.stock_quantity > 0;
  const isLowStock = product.stock_quantity && product.stock_quantity > 0 && product.stock_quantity <= 5;

  const highlights = product.attributes?.["Mise en avant"] || [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.is_variable_product) {
      window.location.href = `/product/${product.slug}`;
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice.toString(),
      image: { sourceUrl: product.image_url || '' },
    }, 1);
  };

  return (
    <Card className="group relative overflow-hidden rounded-xl border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full flex flex-col">
      {/* Zone Image avec Swipe Tactile (Embla) */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing">
        
        {/* Lien global cliquable sur toute la zone d'image (sauf les flèches) */}
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" />

        {images.length > 0 ? (
          <div className="overflow-hidden h-full w-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((img, index) => (
                <div className="flex-[0_0_100%] min-w-0 h-full relative" key={index}>
                  <img
                    src={img}
                    alt={`${product.name} - Vue ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 pointer-events-none">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}

        {/* BADGES DISCRETS - DIAMANT RETIRÉ ICI */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 pointer-events-none">
          {product.is_featured && (
            <Badge className="bg-[#D4AF37] text-white border-none text-[9px] px-1.5 py-0 uppercase font-bold">
              <Sparkles className="h-2.5 w-2.5 mr-1" /> Vedette
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-pink-600 text-white border-none text-[9px] px-1.5 py-0 uppercase font-bold">
              Promo
            </Badge>
          )}
          {highlights.map((text: string, idx: number) => (
            <Badge key={idx} className="bg-black/70 text-white border-none text-[9px] px-1.5 py-0 uppercase font-bold backdrop-blur-sm">
              {text}
            </Badge>
          ))}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton productId={product.id} variant="card" />
        </div>

        {/* Flèches de navigation (Desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm opacity-0 md:group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
            >
              <ChevronLeft className="h-3 w-3 text-gray-900" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm opacity-0 md:group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
            >
              <ChevronRight className="h-3 w-3 text-gray-900" />
            </button>
            
            {/* Points de pagination (Mobile) */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20 md:hidden">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === selectedIndex ? 'w-3 bg-white' : 'w-1 bg-white/50'}`} 
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contenu de la carte */}
      <CardContent className="p-3 flex flex-col flex-1 space-y-2 bg-white relative z-20">
        <Link href={`/product/${product.slug}`} className="block group/title">
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem] group-hover/title:text-[#b8933d] transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* État du stock discret */}
        <div className="flex items-center gap-2">
          {!isInStock ? (
            <span className="text-[9px] font-bold text-pink-600 uppercase tracking-tighter">Épuisé</span>
          ) : isLowStock ? (
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter flex items-center gap-1">
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
              Dernières pièces
            </span>
          ) : (
            <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter">En stock</span>
          )}
        </div>

        {/* Prix */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className={`font-bold text-base ${hasDiscount ? 'text-[#b8933d]' : 'text-gray-900'}`}>
            {displayPrice.toFixed(2)} €
          </span>
          {hasDiscount && (
            <span className="text-gray-400 line-through text-[10px]">
              {product.regular_price?.toFixed(2)} €
            </span>
          )}
        </div>

        {/* Bouton Panier compact */}
        {showAddToCart && (
          <Button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="w-full bg-[#b8933d] hover:bg-[#D4AF37] text-white font-bold rounded-lg transition-all text-[11px] h-8 mt-auto"
          >
            {product.is_variable_product ? (
              CUSTOM_TEXTS.buttons.chooseOptions
            ) : (
              <><ShoppingCart className="h-3 w-3 mr-1.5" />{CUSTOM_TEXTS.buttons.addToCart}</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}