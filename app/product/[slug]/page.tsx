"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ChevronRight,
  Home,
  ShoppingCart,
  Plus,
  Minus,
  Shield,
  Video,
  Sparkles,
  MessageCircle,
  Heart,
  Share2,
  Edit,
  Trash2,
  AlertTriangle,
  Star,
  Info
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { decodeHtmlEntities } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { profile } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProduct(data);
        loadRelatedAndReviews(data);
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRelatedAndReviews(prod: any) {
    try {
        if (prod.related_product_ids?.length > 0) {
          const { data: related } = await supabase
            .from("products")
            .select("id, name, slug, image_url, regular_price")
            .in("id", prod.related_product_ids);
          setRelatedProducts(related || []);
        }

        const { data: revs } = await supabase
          .from("livre-dor") 
          .select("*")
          .eq("product_id", prod.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false });
        setReviews(revs || []);
    } catch (err) {
        console.error("Error loading extra data:", err);
    } finally {
        setLoadingReviews(false);
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
    if (product?.has_variations) return selectedVariation ? selectedVariation.stock_quantity <= 0 : false;
    return product?.stock_quantity <= 0;
  }, [product, selectedVariation]);

  const handleAddToCart = () => {
    if (!product) return;
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8933d]"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Pépite introuvable...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* BARRE ADMIN */}
      {profile?.is_admin && (
        <div className="bg-red-50 border-b border-red-100 py-3 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 font-bold text-[10px] uppercase tracking-widest"><AlertTriangle className="h-4 w-4" /> Mode Administrateur</div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="bg-white hover:bg-red-100 h-8 font-bold"><Link href={`/admin/products/${product.id}`}><Edit className="h-3.5 w-3.5 mr-2" /> Modifier</Link></Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="h-8 font-bold"><Trash2 className="h-3.5 w-3.5 mr-2" /> Supprimer</Button>
            </div>
          </div>
        </div>
      )}

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
          {/* GALERIE / VIDÉO */}
          <div className="space-y-6 sticky top-24">
            {product.video_url ? (
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-[#d4af37]/20 relative group">
                <iframe src={product.video_url.replace("watch?v=", "embed/").replace("reel/", "embed/")} className="w-full h-full" allowFullScreen />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg flex items-center gap-1.5 animate-pulse"><Video className="h-3 w-3" /> Vu en Live</div>
              </div>
            ) : (
              <ProductGallery images={[{ id: 'main', src: product.image_url || '', alt: product.name }, ...(product.gallery_images?.map((img: string, i: number) => ({ id: `gal-${i}`, src: img, alt: `${product.name} ${i + 1}` })) || [])]} productName={product.name} selectedImageUrl={selectedVariation?.image_url} />
            )}
            <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
               <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={product.name} />
            </div>
          </div>

          {/* DÉTAILS */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                {/* TITRE ET WISHLIST CŒUR */}
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] uppercase tracking-tighter">
                    {decodeHtmlEntities(product.name)}
                  </h1>
                  <WishlistButton 
                    productId={product.id} 
                    className="shrink-0 h-10 w-10 md:h-12 md:w-12 bg-white shadow-sm border border-gray-100 rounded-full hover:bg-pink-50 hover:text-pink-500 transition-all duration-300" 
                  />
                </div>
                
                {product.short_description && (
                  <p className="text-xl text-[#C6A15B] italic font-semibold leading-relaxed">
                    &quot;{product.short_description}&quot;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6 py-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">{currentPrice.toFixed(2)} €</span>
                  {oldPrice && <span className="text-2xl text-gray-300 line-through font-light italic">{oldPrice.toFixed(2)} €</span>}
                </div>
                {product.is_featured && <Badge className="bg-[#D4AF37] text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-md animate-bounce">⭐ La Vedette d&apos;André</Badge>}
              </div>
            </div>

            {/* AVIS D'ANDRÉ */}
            {product.andre_review && (
              <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100/30 shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-5 relative">
                  <MessageCircle className="absolute right-8 top-8 w-16 h-16 text-[#d4af37]/5" />
                  <h3 className="text-xs font-black flex items-center gap-2 text-[#b8933d] uppercase tracking-[0.3em]"><Sparkles className="w-4 h-4 fill-[#b8933d]"/> L&apos;avis d&apos;André</h3>
                  <p className="text-gray-800 leading-[1.8] italic text-xl font-medium">&quot;{product.andre_review}&quot;</p>
                </CardContent>
              </Card>
            )}

            {/* VARIANTES */}
            {product.has_variations && (
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                <Label className="text-sm font-black uppercase tracking-widest text-gray-400 text-[10px]">Personnalisez votre pépite</Label>
                <ProductVariationSelector productId={product.id} onVariationSelect={setSelectedVariation} />
              </div>
            )}

            {/* QUANTITÉ & ACHAT */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border-2 border-gray-100 rounded-2xl bg-white h-16 px-3 shadow-inner">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#b8933d]"><Minus className="h-5 w-5" /></Button>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-16 border-none text-center font-black text-xl focus-visible:ring-0" />
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="text-[#b8933d]"><Plus className="h-5 w-5" /></Button>
                </div>
                <Button onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1 h-16 rounded-2xl bg-[#b8933d] hover:bg-[#D4AF37] text-white text-lg font-black shadow-2xl transition-all uppercase tracking-widest">
                  {isOutOfStock ? "Victime de son succès" : "Craquer maintenant"}
                </Button>
              </div>
            </div>

            {/* DESCRIPTION ACCORDÉON */}
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="description" className="border-none bg-white rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] py-5">L&apos;histoire & Secrets</AccordionTrigger>
                <AccordionContent className="pb-8 font-medium leading-relaxed text-gray-600">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} className="prose prose-amber prose-sm" />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="border-none bg-white rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] py-5">Livraison & Retours</AccordionTrigger>
                <AccordionContent className="pb-8 text-xs text-gray-500">Expédition rapide KAVERN. Emballage soigné à Nieppe. Livraison Colissimo ou Mondial Relay sous 2 à 4 jours.</AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* AVIS CLIENTS */}
            <div className="pt-10 border-t-2 border-gray-50 space-y-8" id="avis">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] flex items-center justify-between text-[10px]">
                  <span>Avis des collectionneurs ({(reviews || []).length})</span>
                </h3>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((rev, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-sm text-gray-900">{rev.customer_name || 'Un collectionneur'}</p>
                          <div className="flex gap-0.5"><Star className="h-3 w-3 text-[#D4AF37] fill-current" /></div>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed">&quot;{rev.message || rev.comment}&quot;</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-[10px]">Soyez la première personne à partager votre expérience !</p>
                )}
            </div>

            {/* DIAMANT CACHÉ */}
            <HiddenDiamond productId={product.id} position="description" selectedPosition="description" />
          </div>
        </div>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader><AlertDialogTitle className="text-2xl font-black text-red-600 uppercase italic">⚠️ Action Irréversible</AlertDialogTitle><AlertDialogDescription>Supprimer définitivement &quot;{product.name}&quot; ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-2xl">Annuler</AlertDialogCancel><AlertDialogAction onClick={() => { supabase.from("products").delete().eq("id", product.id).then(() => router.push("/shop")); }} className="bg-red-600 hover:bg-red-700 rounded-2xl font-black">OUI, SUPPRIMER</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}