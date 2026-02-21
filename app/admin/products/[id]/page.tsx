"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase, Product } from "@/lib/supabase";
import { ShoppingCart, Star, Video, Heart, Sparkles, MessageCircle } from "lucide-react";
import { ProductGallery } from "@/components/ProductGallery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { decodeHtmlEntities } from "@/lib/utils";
import { CUSTOM_TEXTS } from "@/lib/texts";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => { loadProduct(); }, [slug]);

  async function loadProduct() {
    const { data } = await supabase.from("products").select("*").eq("slug", slug).single();
    if (data) {
      setProduct(data);
      // Chargement Cross-Selling
      if (data.related_product_ids?.length > 0) {
        const { data: related } = await supabase.from("products").select("*").in("id", data.related_product_ids);
        setRelatedProducts(related || []);
      }
    }
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* GALERIE OU VIDÉO */}
        <div className="space-y-4">
          {product.video_url ? (
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border-4 border-[#d4af37]/10 shadow-xl">
               <iframe src={product.video_url.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
            </div>
          ) : (
            <ProductGallery images={[{id: 'm', src: product.image_url, alt: product.name}]} productName={product.name} />
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">{decodeHtmlEntities(product.name)}</h1>
            <p className="text-xl text-[#d4af37] font-medium italic">{product.short_description}</p>
          </div>

          <div className="text-3xl font-bold text-gray-900">{product.regular_price?.toFixed(2)} €</div>

          {/* L'AVIS D'ANDRÉ */}
          {product.andre_review && (
            <Card className="bg-amber-50/50 border-none shadow-none rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-4 relative">
                <MessageCircle className="absolute right-6 top-6 w-12 h-12 text-[#d4af37]/10" />
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#b8933d] uppercase tracking-wider">
                  <Sparkles className="w-5 h-5"/> L&apos;avis d&apos;André
                </h3>
                <p className="text-gray-700 leading-relaxed italic text-lg">&quot;{product.andre_review}&quot;</p>
                <p className="text-sm font-bold text-[#b8933d]">— Fondateur de KAVERN</p>
              </CardContent>
            </Card>
          )}

          <div dangerouslySetInnerHTML={{ __html: product.description }} className="prose prose-amber" />

          {/* CROSS-SELLING */}
          {relatedProducts.length > 0 && (
            <div className="pt-10 border-t space-y-6">
              <h3 className="text-xl font-bold">André vous conseille d&apos;accompagner cela avec...</h3>
              <div className="grid grid-cols-2 gap-4">
                {relatedProducts.map(p => (
                  <Card key={p.id} className="hover:shadow-lg transition-shadow rounded-2xl overflow-hidden border-none bg-gray-50">
                    <img src={p.image_url} className="h-32 w-full object-cover" />
                    <CardContent className="p-4"><p className="font-bold text-sm truncate">{p.name}</p></CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}