'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist-button';
import { CUSTOM_TEXTS } from '@/lib/texts';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    product.image_url,
    ...(product.gallery_images || [])
  ].filter(Boolean) as string[];

  const displayPrice = product.sale_price || product.regular_price || 0;
  const hasDiscount = product.sale_price && product.sale_price < (product.regular_price || 0);
  const isInStock = !product.stock_quantity || product.stock_quantity > 0;
  const isLowStock = product.stock_quantity && product.stock_quantity > 0 && product.stock_quantity <= 5;

  // Récupération des attributs de mise en avant (ex: "Vite dernière pièce")
  const highlights = product.attributes?.["Mise en avant"] || [];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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
      {/* Zone Image cliquable */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden block">
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}

        {/* BADGES DISCRETS (Taille réduite de 30%) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
          {product.is_featured && (
            <Badge className="bg-[#D4AF37] text-white border-none text-[9px] px-1.5 py-0 uppercase font-bold">
              <Sparkles className="h-2.5 w-2.5 mr-1" /> Vedette
            </Badge>
          )}
          {product.is_diamond && (
            <Badge className="bg-blue-600 text-white border-none text-[9px] px-1.5 py-0 uppercase font-bold">
              💎 Diamant
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-pink-600 text-white border-none text-[9px] px-1.5 py-0 uppercase font-bold">
              Promo
            </Badge>
          )}
          {/* Affichage des attributs "Mise en avant" demandés par le client */}
          {highlights.map((text: string, idx: number) => (
            <Badge key={idx} className="bg-black/70 text-white border-none text-[9px] px-1.5 py-0 uppercase font-bold backdrop-blur-sm">
              {text}
            </Badge>
          ))}
        </div>

        {/* Wishlist Button - Positionné pour ne pas gêner le clic */}
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton productId={product.id} variant="card" />
        </div>

        {/* Flèches de navigation (uniquement si plusieurs images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
            >
              <ChevronLeft className="h-3 w-3 text-gray-900" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
            >
              <ChevronRight className="h-3 w-3 text-gray-900" />
            </button>
          </>
        )}
      </Link>

      {/* Contenu de la carte */}
      <CardContent className="p-3 flex flex-col flex-1 space-y-2 bg-white">
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