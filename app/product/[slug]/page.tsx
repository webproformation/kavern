"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, Product } from "@/lib/supabase";
import {
  ChevronRight,
  Home,
  ShoppingCart,
  Bell,
  Plus,
  Minus,
  Shield,
  Video,
  Sparkles,
  MessageCircle,
  Heart,
  Share2
} from "lucide-react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductVariationSelector } from "@/components/ProductVariationSelector";
import { HiddenDiamond } from "@/components/HiddenDiamond";
import { ShareButtons } from "@/components/ShareButtons";
import { WishlistButton } from "@/components/wishlist-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { decodeHtmlEntities } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { CUSTOM_TEXTS } from "@/lib/texts";

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      if (data) {
        setProduct(data);
        // CHARGEMENT CROSS-SELLING (L'Appât)
        if (data.related_product_ids && data.related_product_ids.length > 0) {
          const { data: related } = await supabase
            .from("products")
            .select("id, name, slug, image_url, regular_price")
            .in("id", data.related_product_ids);
          setRelatedProducts(related || []);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Produit introuvable");
    } finally {
      setLoading(false);
    }
  }

  const currentPrice = useMemo(() => {
    if (selectedVariation) return selectedVariation.sale_price || selectedVariation.regular_price;
    return product?.sale_price || product?.regular_price || 0;
  }, [product, selectedVariation]);

  const oldPrice = useMemo(() => {
    if (selectedVariation) return selectedVariation.sale_price ? selectedVariation.regular_price : null;
    return product?.sale_price ? product?.regular_price : null;
  }, [product, selectedVariation]);

  const isOutOfStock = useMemo(() => {
    if (product?.has_variations) {
      return selectedVariation ? selectedVariation.stock_quantity <= 0 : false;
    }
    return product?.stock_quantity <= 0;
  }, [product, selectedVariation]);

  const handleAddToCart = () => {
    if (product.has_variations && !selectedVariation) {
      toast.error("Veuillez sélectionner une option");
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice.toString(),
      image: { sourceUrl: selectedVariation?.image_url || product.image_url || "" },
      variationId: selectedVariation?.id,
      variationData: selectedVariation?.attributes
    }, quantity);
    
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleNotifyMe = async () => {
    if (!notifyEmail) return;
    toast.success("C'est noté ! Nous vous préviendrons dès le retour en stock.");
    setShowNotifyDialog(false);
    setNotifyEmail("");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8933d]"></div></div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* FIL D'ARIANE */}
      <nav className="bg-white border-b overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#b8933d] flex items-center gap-1"><Home className="h-4 w-4" /> Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="hover:text-[#b8933d]">Boutique</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium truncate">{decodeHtmlEntities(product.name)}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* GALERIE OU VIDÉO (PRIORITAIRE) */}
          <div className="space-y-6 sticky top-24">
            {product.video_url ? (
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-[#d4af37]/20 relative group">
                <iframe 
                  src={product.video_url.replace("watch?v=", "embed/").replace("reel/", "embed/")} 
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                  <Video className="h-3 w-3" /> VU EN LIVE
                </div>
              </div>
            ) : (
              <ProductGallery 
                images={[{ id: 'main', src: product.image_url || '', alt: product.name }, ...(product.gallery_images?.map((img: string, i: number) => ({ id: `gal-${i}`, src: img, alt: `${product.name} ${i + 1}` })) || [])]} 
                productName={product.name}
                selectedImageUrl={selectedVariation?.image_url}
              />
            )}
            
            <div className="flex justify-center">
              <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={product.name} />
            </div>
          </div>

          {/* DÉTAILS PRODUIT */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {decodeHtmlEntities(product.name)}
                  </h1>
                  {product.short_description && (
                    <p className="text-xl text-[#C6A15B] italic font-medium">
                      {product.short_description}
                    </p>
                  )}
                </div>
                <WishlistButton productId={product.id} className="mt-2" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-gray-900">{currentPrice.toFixed(2)} €</span>
                  {oldPrice && (
                    <span className="text-xl text-gray-400 line-through font-light">{oldPrice.toFixed(2)} €</span>
                  )}
                </div>
                {product.is_featured && <Badge className="bg-[#D4AF37] text-white px-3 py-1">⭐ Vedette</Badge>}
              </div>
            </div>

            {/* L'AVIS D'ANDRÉ (Touche Concept Store) */}
            {product.andre_review && (
              <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100/50 shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-8 space-y-4 relative">
                  <MessageCircle className="absolute right-6 top-6 w-12 h-12 text-[#d4af37]/10" />
                  <h3 className="text-sm font-black flex items-center gap-2 text-[#b8933d] uppercase tracking-widest">
                    <Sparkles className="w-4 h-4"/> L&apos;avis d&apos;André
                  </h3>
                  <p className="text-gray-700 leading-relaxed italic text-lg font-medium">
                    &quot;{product.andre_review}&quot;
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-px w-8 bg-[#d4af37]/30"></div>
                    <p className="text-xs font-bold text-[#b8933d] uppercase">Fondateur de KAVERN</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* VARIANTES */}
            {product.has_variations && (
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <Label className="text-base font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#b8933d]" /> Choisir votre option
                </Label>
                <ProductVariationSelector
                  productId={product.id}
                  onVariationSelect={setSelectedVariation}
                />
              </div>
            )}

            {/* ACHAT */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border-2 rounded-xl bg-white h-14 px-2">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#b8933d]">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 border-none text-center font-bold text-lg focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="text-[#b8933d]">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-14 rounded-xl bg-[#b8933d] hover:bg-[#D4AF37] text-white text-lg font-bold shadow-lg shadow-amber-100 transition-all active:scale-95"
                >
                  {isOutOfStock ? (
                    <span className="flex items-center gap-2"><Bell className="h-5 w-5" /> M'alerter du retour</span>
                  ) : (
                    <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Ajouter au panier</span>
                  )}
                </Button>
              </div>

              {isOutOfStock && (
                <p className="text-center">
                  <button onClick={() => setShowNotifyDialog(true)} className="text-sm text-[#b8933d] font-semibold hover:underline">
                    Cette pépite est victime de son succès ? Cliquez ici pour être prévenu.
                  </button>
                </p>
              )}
            </div>

            {/* CROSS-SELLING (L'Appât) */}
            {relatedProducts.length > 0 && (
              <div className="pt-8 border-t space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                  André vous conseille d&apos;accompagner cela avec...
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedProducts.map(p => (
                    <Link key={p.id} href={`/product/${p.slug}`} className="group block space-y-2">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border transition-all group-hover:shadow-md group-hover:border-[#d4af37]/30">
                        <img src={p.image_url} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div>
                        <p className="font-bold text-xs line-clamp-1 group-hover:text-[#b8933d]">{p.name}</p>
                        <p className="text-[#b8933d] font-bold text-sm">{p.regular_price?.toFixed(2)} €</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ACCORDIONS */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description" className="border-b">
                <AccordionTrigger className="font-bold text-gray-900 uppercase text-xs tracking-widest">L&apos;histoire & composition</AccordionTrigger>
                <AccordionContent>
                  <div 
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                    className="prose prose-amber prose-sm max-w-none text-gray-600 leading-relaxed pt-4"
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delivery" className="border-b">
                <AccordionTrigger className="font-bold text-gray-900 uppercase text-xs tracking-widest">Livraison & Retours</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-1.5 rounded-full"><Shield className="h-4 w-4 text-green-600" /></div>
                    <p><strong>Vite chez vous :</strong> André prépare votre pépite avec soin en 24h/48h.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full"><Plus className="h-4 w-4 text-blue-600" /></div>
                    <p><strong>Droit à l&apos;erreur :</strong> 14 jours pour changer d&apos;avis (échange contre crédit boutique).</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* DIAMANT CACHÉ */}
            <HiddenDiamond product={product} />
          </div>
        </div>
      </main>

      {/* DIALOGUE NOTIFICATION STOCK */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#b8933d]" />
              {CUSTOM_TEXTS.buttons.alertStock}
            </DialogTitle>
            <DialogDescription>
              Entrez votre email pour être notifié personnellement dès que cette pépite revient à l&apos;atelier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Votre adresse email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="votre@email.com" 
                value={notifyEmail} 
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifyDialog(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleNotifyMe} className="bg-[#b8933d] text-white rounded-xl px-8 h-10 shadow-lg">Me notifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}