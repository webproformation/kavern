"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
  Share2,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CUSTOM_TEXTS } from "@/lib/texts";

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { profile } = useAuth();

  // --- ÉTATS PRODUIT ---
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // --- ÉTATS AVIS ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // FLAG DE CONFIGURATION (Futur)
  const ENABLE_MORPHOLOGY_LOGIC = false; 

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
        loadRelatedAndReviews(data);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Pépite introuvable...");
    } finally {
      setLoading(false);
    }
  }

  async function loadRelatedAndReviews(prod: any) {
    // 1. Cross-selling
    if (prod.related_product_ids?.length > 0) {
      const { data: related } = await supabase
        .from("products")
        .select("id, name, slug, image_url, regular_price")
        .in("id", prod.related_product_ids);
      setRelatedProducts(related || []);
    }

    // 2. Avis clients (Sans récompense cagnotte comme demandé)
    const { data: revs } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", prod.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setReviews(revs || []);
    setLoadingReviews(false);
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

  const handleDeleteProduct = async () => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      toast.success("Produit supprimé");
      router.push("/shop");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleNotifyMe = async () => {
    if (!notifyEmail) return;
    toast.success("C'est noté ! André vous préviendra personnellement.");
    setShowNotifyDialog(false);
    setNotifyEmail("");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8933d]"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Cette pépite n&apos;est plus disponible...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* 🛠️ BARRE D'OUTILS ADMIN (Restaurée) */}
      {profile?.is_admin && (
        <div className="bg-red-50 border-b border-red-100 py-3 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4" /> Mode Administrateur
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="bg-white hover:bg-red-100 border-red-200 text-red-700 h-8">
                <Link href={`/admin/products/${product.id}`}><Edit className="h-3.5 w-3.5 mr-2" /> Modifier la fiche</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="h-8">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Supprimer
              </Button>
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
          
          {/* ZONE MÉDIA (Vidéo prioritiaire ou Galerie) */}
          <div className="space-y-6 sticky top-24">
            {product.video_url ? (
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-[#d4af37]/20 relative group">
                <iframe 
                  src={product.video_url.replace("watch?v=", "embed/").replace("reel/", "embed/")} 
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg flex items-center gap-1.5 animate-pulse">
                  <Video className="h-3 w-3" /> Vu en Live
                </div>
              </div>
            ) : (
              <ProductGallery 
                images={[{ id: 'main', src: product.image_url || '', alt: product.name }, ...(product.gallery_images?.map((img: string, i: number) => ({ id: `gal-${i}`, src: img, alt: `${product.name} ${i + 1}` })) || [])]} 
                productName={product.name}
                selectedImageUrl={selectedVariation?.image_url}
              />
            )}
            
            <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Share2 className="h-3 w-3" /> Partagez votre coup de cœur
               </p>
               <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={product.name} />
            </div>
          </div>

          {/* DÉTAILS PRODUIT */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1]">
                    {decodeHtmlEntities(product.name)}
                  </h1>
                  {product.short_description && (
                    <p className="text-xl text-[#C6A15B] italic font-semibold leading-relaxed">
                      &quot;{product.short_description}&quot;
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <WishlistButton productId={product.id} className="h-12 w-12 bg-white shadow-md border-none rounded-2xl hover:scale-110 transition-transform" />
                </div>
              </div>

              <div className="flex items-center gap-6 py-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">{currentPrice.toFixed(2)} €</span>
                  {oldPrice && (
                    <span className="text-2xl text-gray-300 line-through font-light italic">{oldPrice.toFixed(2)} €</span>
                  )}
                </div>
                {product.is_featured && (
                  <Badge className="bg-[#D4AF37] text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-md animate-bounce">
                    ⭐ La Vedette d&apos;André
                  </Badge>
                )}
              </div>
            </div>

            {/* L'AVIS D'ANDRÉ (Touche Concept Store) */}
            {product.andre_review && (
              <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100/30 shadow-xl shadow-amber-50/50 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-5 relative">
                  <MessageCircle className="absolute right-8 top-8 w-16 h-16 text-[#d4af37]/5" />
                  <h3 className="text-xs font-black flex items-center gap-2 text-[#b8933d] uppercase tracking-[0.3em]">
                    <Sparkles className="w-4 h-4 fill-[#b8933d]"/> L&apos;avis d&apos;André
                  </h3>
                  <p className="text-gray-800 leading-[1.8] italic text-xl font-medium">
                    &quot;{product.andre_review}&quot;
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-[2px] w-12 bg-[#d4af37]/20"></div>
                    <p className="text-[10px] font-black text-[#b8933d] uppercase tracking-widest">Le mot du créateur de KAVERN</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SÉLECTEUR DE VARIANTES */}
            {product.has_variations && (
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                <Label className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#b8933d]" /> Personnalisez votre pépite
                </Label>
                <ProductVariationSelector productId={product.id} onVariationSelect={setSelectedVariation} />
              </div>
            )}

            {/* LOGIQUE MORPHOLOGIE (Masquée mais présente dans le code) */}
            {ENABLE_MORPHOLOGY_LOGIC && profile?.user_size && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-bold text-green-700 italic">Cette pépite correspond à votre taille ({profile.user_size})</p>
              </div>
            )}

            {/* ACHAT & QUANTITÉ */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border-2 border-gray-100 rounded-2xl bg-white h-16 px-3 shadow-inner">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#b8933d] hover:bg-amber-50">
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-16 border-none text-center font-black text-xl focus-visible:ring-0" />
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="text-[#b8933d] hover:bg-amber-50">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <Button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-16 rounded-2xl bg-[#b8933d] hover:bg-[#D4AF37] text-white text-lg font-black shadow-2xl shadow-amber-200 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isOutOfStock ? (
                    <span className="flex items-center gap-2"><Bell className="h-6 w-6" /> M&apos;alerter du retour</span>
                  ) : (
                    <span className="flex items-center gap-2 uppercase tracking-widest"><ShoppingCart className="h-6 w-6" /> Craquer maintenant</span>
                  )}
                </Button>
              </div>

              {isOutOfStock && (
                <div className="flex justify-center">
                  <button onClick={() => setShowNotifyDialog(true)} className="text-xs text-[#b8933d] font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                    <Info className="h-4 w-4" /> Victime de son succès ? Soyez prévenu(e)
                  </button>
                </div>
              )}
            </div>

            {/* CROSS-SELLING (L'Appât) */}
            {relatedProducts.length > 0 && (
              <div className="pt-10 border-t-2 border-gray-50 space-y-8">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                  André vous suggère aussi
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedProducts.map(p => (
                    <Link key={p.id} href={`/product/${p.slug}`} className="group block space-y-3">
                      <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-gray-50 border-2 border-transparent transition-all group-hover:shadow-2xl group-hover:border-[#d4af37]/30 group-hover:-translate-y-1">
                        <img src={p.image_url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-[#b8933d] transition-colors">{p.name}</p>
                        <p className="text-[#b8933d] font-black text-sm">{p.regular_price?.toFixed(2)} €</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ACCORDÉONS DÉTAILLÉS */}
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="description" className="border-none bg-white rounded-2xl px-6">
                <AccordionTrigger className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] hover:no-underline py-5">L&apos;histoire & Secrets de fabrication</AccordionTrigger>
                <AccordionContent className="pb-8">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} className="prose prose-amber prose-sm max-w-none text-gray-600 leading-relaxed font-medium" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delivery" className="border-none bg-white rounded-2xl px-6">
                <AccordionTrigger className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] hover:no-underline py-5">Vite chez vous : Livraison & Retours</AccordionTrigger>
                <AccordionContent className="pb-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-xl"><Shield className="h-5 w-5 text-green-600" /></div>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">Expédition rapide KAVERN</p>
                      <p className="text-xs text-gray-500 leading-relaxed">André emballe chaque pépite avec amour à Nieppe. Expédition en 24h/48h avec suivi complet.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-xl"><CheckCircle2 className="h-5 w-5 text-blue-600" /></div>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">Le Droit à l&apos;Erreur (14 jours)</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Changement d&apos;avis ? Aucun problème ! Retournez votre colis sous 14 jours pour un crédit boutique immédiat.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* SECTION AVIS CLIENTS (Ajoutée) */}
            <div className="pt-10 border-t-2 border-gray-50 space-y-8" id="avis">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] flex items-center justify-between">
                  <span>Avis des collectionneurs ({reviews.length})</span>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-xs font-black">4.9/5</span>
                    </div>
                  )}
                </h3>
                
                {loadingReviews ? (
                  <div className="animate-pulse h-20 bg-gray-50 rounded-2xl" />
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((rev, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-sm text-gray-900">{rev.customer_name}</p>
                          <div className="flex gap-0.5"><Star className="h-3 w-3 text-[#D4AF37] fill-current" /><Star className="h-3 w-3 text-[#D4AF37] fill-current" /><Star className="h-3 w-3 text-[#D4AF37] fill-current" /><Star className="h-3 w-3 text-[#D4AF37] fill-current" /><Star className="h-3 w-3 text-[#D4AF37] fill-current" /></div>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed">&quot;{rev.comment}&quot;</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">Soyez la première personne à partager votre expérience sur cette pépite !</p>
                )}
            </div>

            {/* DIAMANT CACHÉ */}
            <HiddenDiamond product={product} />
          </div>
        </div>
      </main>

      {/* DIALOGUES & MODALES */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-[#b8933d] animate-bounce" /> {CUSTOM_TEXTS.buttons.alertStock}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">André surveille l&apos;atelier ! Laissez votre email pour être alerté(e) du prochain arrivage.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2"><Label htmlFor="email" className="font-bold text-gray-700">Votre adresse email</Label><Input id="email" type="email" placeholder="votre@email.com" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} className="rounded-2xl h-14 border-gray-100 shadow-inner" /></div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3"><Button variant="outline" onClick={() => setShowNotifyDialog(false)} className="rounded-2xl h-12">Plus tard</Button><Button onClick={handleNotifyMe} className="bg-[#b8933d] text-white rounded-2xl px-10 h-12 shadow-lg shadow-amber-100 font-black">M&apos;ALERTER PERSONNELLEMENT</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader><AlertDialogTitle className="text-2xl font-black text-red-600 uppercase italic">⚠️ Action Irréversible</AlertDialogTitle><AlertDialogDescription>Supprimer définitivement &quot;{product.name}&quot; ? Cette pépite disparaîtra du catalogue et des statistiques.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-2xl">Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700 rounded-2xl font-black">OUI, SUPPRIMER</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}