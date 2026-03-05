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
  Info,
  ArrowRight,
  Tag,
  Mail,
  Bell,
  Box,
  CheckCircle2
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
import { decodeHtmlEntities, cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { profile, user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // ÉTATS POUR LE SYSTÈME DE PACK (LOTS)
  const [packSourceProducts, setPackSourceProducts] = useState<any[]>([]);
  const [selectedPackItems, setSelectedPackItems] = useState<Record<string, number>>({});
  const [packLoading, setPackLoading] = useState(false);

  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  useEffect(() => {
    if (user?.email) setNotifyEmail(user.email);
  }, [user]);

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_variations (*)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProduct(data);
        loadRelatedAndReviews(data);
        
        // Si c'est un pack, on charge les produits de la catégorie source
        if (data.is_pack) {
          loadPackSourceProducts(data.pack_source_category_id);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPackSourceProducts(categoryId: string | null) {
    setPackLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("id, name, image_url, regular_price, stock_quantity")
        .eq("status", "publish")
        .eq("is_pack", false); // On ne met pas de pack dans un pack

      if (categoryId) {
        // On filtre par catégorie via la table de mapping
        const { data: mapping } = await supabase
          .from("product_category_mapping")
          .select("product_id")
          .eq("category_id", categoryId);
        
        const productIds = mapping?.map(m => m.product_id) || [];
        query = query.in("id", productIds);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;
      setPackSourceProducts(data || []);
    } catch (err) {
      console.error("Error loading pack items:", err);
    } finally {
      setPackLoading(false);
    }
  }

  async function loadRelatedAndReviews(prod: any) {
    try {
        if (prod.related_product_ids && prod.related_product_ids.length > 0) {
          const { data: related } = await supabase
            .from("products")
            .select("id, name, slug, image_url, regular_price, sale_price")
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
    }
  }

  const handleNotifyStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifying(true);
    try {
      const { error } = await supabase.from("stock_notifications").insert({
        product_id: product.id,
        variation_id: selectedVariation?.id || null,
        email: notifyEmail,
        status: 'pending'
      });
      if (error) throw error;
      toast.success("C'est noté ! On vous prévient dès le retour de cette pépite.");
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'inscription.");
    } finally {
      setNotifying(false);
    }
  };

  // Logique de sélection pour le Pack
  const updatePackItemQuantity = (productId: string, delta: number) => {
    const currentTotal = Object.values(selectedPackItems).reduce((a, b) => a + b, 0);
    const currentQty = selectedPackItems[productId] || 0;
    
    if (delta > 0 && currentTotal >= product.pack_slots) {
      toast.error(`Votre malle est déjà pleine (${product.pack_slots} articles)`);
      return;
    }
    
    if (delta < 0 && currentQty <= 0) return;

    setSelectedPackItems(prev => {
      const newQty = (prev[productId] || 0) + delta;
      const newState = { ...prev };
      if (newQty <= 0) delete newState[productId];
      else newState[productId] = newQty;
      return newState;
    });
  };

  const packTotalSelected = useMemo(() => 
    Object.values(selectedPackItems).reduce((a, b) => a + b, 0)
  , [selectedPackItems]);

  const displayTitle = useMemo(() => {
    let name = decodeHtmlEntities(product?.name || "");
    if (selectedVariation) {
      const variationAttrs = selectedVariation.attributes || {};
      const variationValue = Object.values(variationAttrs)[0];
      if (variationValue) return `${name} - ${variationValue}`;
    }
    return name;
  }, [product, selectedVariation]);

  const currentPrice = useMemo(() => {
    if (selectedVariation) return selectedVariation.sale_price || selectedVariation.regular_price;
    return product?.sale_price || product?.regular_price || 0;
  }, [product, selectedVariation]);

  const oldPrice = useMemo(() => {
    if (selectedVariation) return selectedVariation.sale_price ? selectedVariation.regular_price : null;
    return product?.sale_price ? product?.regular_price : null;
  }, [product, selectedVariation]);

  const isOutOfStock = useMemo(() => {
    if (!product) return false;
    if (product.has_variations || product.type === 'variable') {
      if (selectedVariation) return (selectedVariation.stock_quantity ?? 0) <= 0;
      return !product.product_variations?.some((v: any) => (v.stock_quantity ?? 0) > 0);
    }
    return (product.stock_quantity ?? 0) <= 0;
  }, [product, selectedVariation]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Validation Pack
    if (product.is_pack && packTotalSelected < product.pack_slots) {
      toast.error(`Veuillez choisir encore ${product.pack_slots - packTotalSelected} article(s) pour compléter votre malle.`);
      return;
    }

    // Validation Variations
    if (!product.is_pack && (product.has_variations || product.type === 'variable') && !selectedVariation) {
      toast.error("Veuillez sélectionner une option (couleur, parfum...)");
      return;
    }

    // Préparation des données spécifiques au pack
    const packDetails = product.is_pack ? Object.entries(selectedPackItems).map(([id, qty]) => {
      const p = packSourceProducts.find(item => item.id === id);
      return { id, name: p?.name, quantity: qty };
    }) : null;

    addToCart({
      id: product.id,
      name: displayTitle,
      slug: product.slug,
      price: currentPrice.toString(),
      image: { sourceUrl: selectedVariation?.image_url || product.image_url || "" },
      variationId: selectedVariation?.id,
      variationData: selectedVariation?.attributes,
      isPack: product.is_pack,
      packItems: packDetails // Transmis au CartContext
    }, quantity);
    
    toast.success(`${displayTitle} ajouté au panier`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8933d]"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Pépite introuvable...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
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
          
          <div className="space-y-6 lg:sticky lg:top-24">
            <ProductGallery 
              images={[
                { id: 'main', src: product.image_url || '', alt: product.name }, 
                ...(product.gallery_images?.map((img: string, i: number) => ({ id: `gal-${i}`, src: img, alt: `${product.name} ${i + 1}` })) || [])
              ]} 
              productName={product.name} 
              selectedImageUrl={selectedVariation?.image_url}
              videoUrl={product.video_url} 
            />
            
            <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
               <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={product.name} />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                  {displayTitle}
                </h1>
                {(selectedVariation?.sku || product.sku) && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                    Référence : {selectedVariation?.sku || product.sku}
                  </p>
                )}
              </div>
              
              {product.short_description && (
                <p className="text-lg text-[#C6A15B] italic font-semibold leading-relaxed">
                  &quot;{product.short_description}&quot;
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {product.is_pack && <Badge className="bg-blue-600 text-white px-3 py-1 rounded-full font-black text-[10px] uppercase shadow-md animate-pulse">🎁 Offre Lot Personnalisable</Badge>}
                {product.is_featured && <Badge className="bg-[#D4AF37] text-white px-3 py-1 rounded-full font-black text-[10px] uppercase shadow-md">⭐ La Vedette d&apos;André</Badge>}
                {product.is_diamond && <Badge className="bg-indigo-600 text-white px-3 py-1 rounded-full font-black text-[10px] uppercase shadow-md">💎 Pépite Diamant</Badge>}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="bg-amber-100 p-2.5 rounded-full text-amber-600 shrink-0"><Sparkles className="w-5 h-5" /></div>
              <div className="text-sm">Gagnez <strong className="font-black text-amber-700 text-base">2%</strong> sur votre cagnotte de fidélité à chaque achat !</div>
            </div>

            {/* --- ZONE SYSTÈME DE PACK (LOTS) --- */}
            {product.is_pack && (
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                  Malle de {product.pack_slots} articles
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                    <Box className="h-5 w-5 text-blue-600" /> Composez votre lot
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium italic">Sélectionnez vos {product.pack_slots} pépites préférées :</p>
                    <Badge className={cn("h-8 rounded-full px-4 text-xs font-black transition-all", packTotalSelected === product.pack_slots ? "bg-green-500" : "bg-blue-100 text-blue-700")}>
                      {packTotalSelected} / {product.pack_slots} choisis
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {packLoading ? (
                    <div className="col-span-2 py-10 text-center"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-200" /></div>
                  ) : packSourceProducts.map((item) => (
                    <div key={item.id} className={cn("group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all", (selectedPackItems[item.id] || 0) > 0 ? "border-blue-400 bg-blue-50/30 shadow-md" : "border-gray-50 hover:border-blue-100")}>
                      <img src={item.image_url} className="w-14 h-14 object-cover rounded-xl shadow-sm" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-900 truncate leading-tight uppercase">{item.name}</p>
                        <p className="text-[10px] text-blue-600 font-black">{item.stock_quantity > 0 ? "En stock" : "Bientôt de retour"}</p>
                      </div>
                      <div className="flex items-center bg-white rounded-xl border border-gray-100 shadow-inner p-1">
                        <button onClick={() => updatePackItemQuantity(item.id, -1)} className="p-1 hover:text-red-500 transition-colors"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center font-black text-xs text-blue-700">{selectedPackItems[item.id] || 0}</span>
                        <button onClick={() => updatePackItemQuantity(item.id, 1)} disabled={item.stock_quantity <= (selectedPackItems[item.id] || 0)} className="p-1 hover:text-green-500 transition-colors disabled:opacity-20"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- ZONE VARIATIONS CLASSIQUES --- */}
            {!product.is_pack && (product.has_variations || product.type === 'variable' || (product.product_variations && product.product_variations.length > 0)) && (
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <Label className="text-sm font-black uppercase tracking-widest text-gray-400 text-[10px]">Personnalisez votre pépite</Label>
                <ProductVariationSelector 
                  attributes={product.attributes} 
                  variations={product.product_variations || []} 
                  onVariationSelect={setSelectedVariation} 
                />
              </div>
            )}

            <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center gap-6 z-40 sticky bottom-4 sm:relative mt-2">
              <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-[#b8933d] whitespace-nowrap tracking-tighter">
                    {currentPrice.toFixed(2)} €
                  </span>
                  {oldPrice && <span className="text-sm text-gray-400 line-through italic">{oldPrice.toFixed(2)} €</span>}
                </div>
                
                {!isOutOfStock && !product.is_pack && (
                  <div className="flex items-center border-2 border-gray-100 rounded-2xl bg-white h-14 px-2 shadow-inner">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#b8933d] hover:bg-transparent"><Minus className="h-4 w-4" /></Button>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-12 border-none text-center font-black text-lg focus-visible:ring-0 p-0" />
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="text-[#b8933d] hover:bg-transparent"><Plus className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
              
              <div className="w-full sm:flex-1 flex gap-2">
                <Button 
                  onClick={handleAddToCart} 
                  disabled={isOutOfStock || (product.is_pack && packTotalSelected < product.pack_slots)}
                  className={`flex-1 h-14 rounded-xl text-lg font-black shadow-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex gap-3 ${
                    (isOutOfStock || (product.is_pack && packTotalSelected < product.pack_slots)) 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : product.is_pack ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" : "bg-[#b8933d] hover:bg-[#a68231] text-white shadow-amber-500/20"
                  }`}
                >
                  {product.is_pack ? (packTotalSelected === product.pack_slots ? <CheckCircle2 className="w-5 h-5" /> : <Box className="w-5 h-5" />) : <ShoppingCart className="w-5 h-5" />}
                  {isOutOfStock ? "En rupture" : product.is_pack ? (packTotalSelected === product.pack_slots ? "Valider ma malle" : `Complétez (${packTotalSelected}/${product.pack_slots})`) : "Je craque !"}
                </Button>
                
                <WishlistButton productId={product.id} variant="icon" className="shrink-0 h-14 w-14 rounded-xl" />
              </div>
            </div>

            {isOutOfStock && (
              <Card className="border-2 border-dashed border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-500">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#D4AF37] p-2 rounded-full text-white shadow-md"><Bell className="w-4 h-4" /></div>
                    <h3 className="font-black text-gray-900 uppercase tracking-tighter">On vous prévient ?</h3>
                  </div>
                  <p className="text-sm text-gray-600 font-medium italic">Cette pépite vous a tapé dans l&apos;œil ? Laissez-nous votre email, on vous fait signe dès qu&apos;elle est de nouveau en stock !</p>
                  <form onSubmit={handleNotifyStock} className="flex flex-col sm:flex-row gap-2 mt-4">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input type="email" placeholder="votre@email.com" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} required className="pl-10 h-12 rounded-xl border-gray-200" />
                    </div>
                    <Button type="submit" disabled={notifying} className="bg-gray-900 text-white hover:bg-black h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest">{notifying ? "Inscription..." : "M'avertir"}</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {product.andre_review && (
              <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100/30 shadow-md rounded-[2.5rem] overflow-hidden mt-4">
                <CardContent className="p-8 space-y-4 relative">
                  <MessageCircle className="absolute right-6 top-6 w-12 h-12 text-[#d4af37]/5" />
                  <h3 className="text-xs font-black flex items-center gap-2 text-[#b8933d] uppercase tracking-[0.3em]"><Sparkles className="w-4 h-4 fill-[#b8933d]"/> L&apos;avis d&apos;André</h3>
                  <p className="text-gray-800 leading-relaxed italic text-lg font-medium">&quot;{product.andre_review}&quot;</p>
                </CardContent>
              </Card>
            )}

            <Accordion type="single" collapsible className="w-full space-y-2 mt-4">
              <AccordionItem value="description" className="border-none bg-white rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] py-5">L&apos;histoire & Secrets</AccordionTrigger>
                <AccordionContent className="pb-8 font-medium leading-relaxed text-gray-600">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} className="prose prose-amber prose-sm max-w-none prose-h2:text-gray-900 prose-h2:text-2xl prose-h2:font-black prose-h2:mt-8 prose-h2:mb-4 prose-a:text-[#b8933d] prose-a:font-bold hover:prose-a:underline" />
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2"><Tag className="h-3 w-3" /> Mots-clés de la pépite</p>
                      <div className="flex flex-wrap gap-2">{product.tags.map((tag: string, i: number) => (<Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-[#D4AF37] hover:text-white transition-colors cursor-default rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-tighter">#{tag}</Badge>))}</div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="shipping" className="border-none bg-white rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em] py-5">Livraison & Retours</AccordionTrigger>
                <AccordionContent className="pb-8 text-sm text-gray-700 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-black text-[#D4AF37] uppercase tracking-widest text-xs">Livraison & Expédition</h4>
                    <div className="space-y-3">
                      <p><strong className="text-gray-900">Préparation express :</strong> Chaque commande est emballée avec amour et soin depuis notre atelier, et expédiée sous 24h à 48h.</p>
                      <p><strong className="text-gray-900">L&apos;astuce &quot;Colis Ouvert&quot; :</strong> Vous avez un coup de cœur aujourd&apos;hui mais vous voulez attendre le prochain Live ? Cochez l&apos;option Colis Ouvert dans votre panier ! Cumulez vos achats pendant 7 jours et ne payez vos frais de port qu&apos;une seule fois à la fin.</p>
                      <p><strong className="text-gray-900">Cadeau KAVERN :</strong> Dès 69 € d&apos;achats (en une fois ou cumulés dans votre Colis Ouvert), un cadeau exclusif est glissé dans votre malle !</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-gray-100" />
                  <div className="space-y-4">
                    <h4 className="font-black text-[#D4AF37] uppercase tracking-widest text-xs">Retours & Échanges</h4>
                    <div className="space-y-3">
                      <p><strong className="text-gray-900">Vous avez changé d&apos;avis ?</strong> Pas de panique ! Vous disposez de 14 jours après la réception de votre colis pour nous retourner un article qui ne conviendrait pas.</p>
                      <p><strong className="text-gray-900">Note :</strong> Par mesure d&apos;hygiène et de sécurité, les produits de l&apos;épicerie fine, les cosmétiques ouverts et les créations personnalisées ne sont pas éligibles aux retours.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-10 border-t-2 border-gray-50 space-y-8" id="avis">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] flex items-center justify-between text-[10px]"><span>Avis des collectionneurs ({(reviews || []).length})</span></h3>
                {reviews.length > 0 ? (
                  <div className="space-y-6">{reviews.map((rev, i) => (<div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm space-y-2"><div className="flex justify-between items-center"><p className="font-bold text-sm text-gray-900">{rev.customer_name || 'Un collectionneur'}</p><div className="flex gap-0.5"><Star className="h-3 w-3 text-[#D4AF37] fill-current" /></div></div><p className="text-xs text-gray-600 italic leading-relaxed">&quot;{rev.message || rev.comment}&quot;</p></div>))}</div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-[10px]">Soyez la première personne à partager votre expérience !</p>
                )}
            </div>
            <HiddenDiamond productId={product.id} position="description" selectedPosition="description" />
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-24 border-t pt-16">
             <div className="flex items-center justify-between mb-8">
               <div><h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Les suggestions d&apos;André</h2><p className="text-sm text-[#b8933d] font-bold">D&apos;autres pépites qui pourraient vous faire craquer</p></div>
               <Button variant="ghost" asChild className="text-[#b8933d] font-bold"><Link href="/shop">Voir tout le catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {relatedProducts.map((rel) => (
                 <Link key={rel.id} href={`/product/${rel.slug}`} className="group space-y-3">
                   <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1"><img src={rel.image_url} alt={rel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" /></div>
                   <div className="space-y-1 px-1"><h3 className="font-bold text-gray-900 line-clamp-1 text-sm group-hover:text-[#b8933d] transition-colors">{rel.name}</h3><p className="text-[#b8933d] font-black text-base">{(rel.sale_price || rel.regular_price).toFixed(2)} €</p></div>
                 </Link>
               ))}
             </div>
          </section>
        )}
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