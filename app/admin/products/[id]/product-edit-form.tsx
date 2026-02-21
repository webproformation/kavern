"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Save, 
  ArrowLeft, 
  RefreshCw, 
  Weight, 
  Calculator, 
  Globe, 
  Video, 
  Heart, 
  Package, 
  Sparkles,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import ColorSwatchSelector from "@/components/ColorSwatchSelector";
import ProductMediaGalleryManager from "@/components/ProductMediaGalleryManager";
import HierarchicalCategorySelector from "@/components/HierarchicalCategorySelector";
import GeneralAttributesSelector from "@/components/GeneralAttributesSelector";
import VariationDetailsForm from "@/components/VariationDetailsForm";

import { useAutoSave } from "@/hooks/useAutoSave"; 

interface Category { id: string; name: string; slug: string; parent_id: string | null; }
interface Variation { id?: string; colorName: string; colorId: string; sku: string; regular_price: number | null; sale_price: number | null; stock_quantity: number | null; image_url: string | null; }

interface ProductEditFormProps {
  productId: string;
  allCategories: Category[];
}

export default function ProductEditForm({ productId, allCategories }: ProductEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- ÉTATS PRODUIT (Informations & Editorial) ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState(""); // Phrase d'accroche
  const [description, setDescription] = useState("");
  const [andreReview, setAndreReview] = useState(""); // L'avis d'André
  const [videoUrl, setVideoUrl] = useState(""); // Vidéo

  // --- ÉTATS FINANCES & LOGISTIQUE ---
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [virtualWeight, setVirtualWeight] = useState<number>(0);

  // --- ÉTATS SEO ---
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // --- ÉTATS CONFIGURATION ---
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDiamond, setIsDiamond] = useState(false);
  const [mainImage, setMainImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // NOUVEAU : Switch pour activer/désactiver les modules complexes
  const [hasVariations, setHasVariations] = useState(false); 
  const [showSizes, setShowSizes] = useState(false);

  const [activeFamilyView, setActiveFamilyView] = useState<string>("");
  const [selectedNuances, setSelectedNuances] = useState<string[]>([]);
  const [nuanceIds, setNuanceIds] = useState<Record<string, string>>({});
  const [sizeRangeStart, setSizeRangeStart] = useState<number | null>(null);
  const [sizeRangeEnd, setSizeRangeEnd] = useState<number | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [variations, setVariations] = useState<Variation[]>([]);
  
  // Cross-selling
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<{id: string, name: string}[]>([]);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    if (productId) loadProductData();
    fetchOtherProducts();
  }, [productId]);

  async function loadProductData() {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
      if (error) throw error;

      // Editorial & Base
      setName(data.name || "");
      setSlug(data.slug || "");
      setSku(data.sku || "");
      setShortDescription(data.short_description || "");
      setDescription(data.description || "");
      setAndreReview(data.andre_review || "");
      setVideoUrl(data.video_url || "");
      
      // Finances
      setPurchasePrice(data.purchase_price || 0);
      setRegularPrice(data.regular_price || 0);
      setSalePrice(data.sale_price);
      setStockQuantity(data.stock_quantity || 0);
      setVirtualWeight(data.virtual_weight || 0);

      // SEO
      setSeoTitle(data.seo_title || "");
      setSeoDescription(data.seo_description || "");

      // Config
      setStatus(data.status || "draft");
      setIsFeatured(data.is_featured || false);
      setIsDiamond(data.is_diamond || false);
      setMainImage(data.image_url || "");
      setGalleryImages(data.gallery_images || []);
      setHasVariations(data.has_variations || false);
      setShowSizes(!!data.size_range_start);
      setSizeRangeStart(data.size_range_start);
      setSizeRangeEnd(data.size_range_end);
      
      setSelectedAttributes(data.attributes || {});
      setRelatedProductIds(data.related_product_ids || []);

      // Catégories
      const { data: catData } = await supabase.from("product_category_mapping").select("category_id").eq("product_id", productId);
      setSelectedCategories(catData?.map(c => c.category_id) || []);

      // Variations
      const { data: varData } = await supabase.from("product_variations").select("*").eq("product_id", productId);
      if (varData) {
        const mappedVars = varData.map(v => ({
          id: v.id,
          colorName: v.attributes?.Couleur || "",
          colorId: "",
          sku: v.sku || "",
          regular_price: v.regular_price,
          sale_price: v.sale_price,
          stock_quantity: v.stock_quantity,
          image_url: v.image_url
        }));
        setVariations(mappedVars);
        setSelectedNuances(mappedVars.map(v => v.colorName));
      }

    } catch (e: any) { toast.error("Impossible de charger le produit"); } finally { setLoading(false); }
  }

  async function fetchOtherProducts() {
    const { data } = await supabase.from("products").select("id, name").neq("id", productId).order("name");
    if (data) setAllProducts(data);
  }

  // --- LOGIQUE CALCUL MARGE ---
  const margin = useMemo(() => {
    if (regularPrice > 0) {
      const profit = regularPrice - purchasePrice;
      return ((profit / regularPrice) * 100).toFixed(1);
    }
    return "0";
  }, [purchasePrice, regularPrice]);

  // --- LOGIQUE AUTO-SLUG ---
  useEffect(() => {
    if (name && !productId) { // Seulement à la création pour ne pas casser les URLs existantes
       const s = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
       setSlug(s);
    }
  }, [name, productId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalAttributes = { ...selectedAttributes };
      if (hasVariations) finalAttributes['Couleur'] = selectedNuances;

      const { error } = await supabase.from("products").update({
        name, slug, sku, short_description: shortDescription.substring(0, 150),
        description, andre_review: andreReview, video_url: videoUrl,
        purchase_price: purchasePrice, regular_price: regularPrice, sale_price: salePrice,
        stock_quantity: stockQuantity, virtual_weight: virtualWeight,
        seo_title: seoTitle, seo_description: seoDescription,
        status, is_featured: isFeatured, is_diamond: isDiamond, has_variations: hasVariations,
        image_url: mainImage, gallery_images: galleryImages,
        size_range_start: showSizes ? sizeRangeStart : null,
        size_range_end: showSizes ? sizeRangeEnd : null,
        attributes: finalAttributes,
        related_product_ids: relatedProductIds
      }).eq("id", productId);

      if (error) throw error;
      toast.success("Produit mis à jour avec succès !");
      router.refresh();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4"><RefreshCw className="animate-spin h-8 w-8 text-[#d4af37]"/> Chargement de la fiche...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products"><Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="h-4 w-4"/></Button></Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier : {name}</h1>
            <p className="text-gray-500 italic text-sm">Concept Store KAVERN</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#d4af37] hover:bg-[#c19b2f] text-white px-10 shadow-lg">
          {saving ? "Enregistrement..." : <><Save className="w-4 h-4 mr-2" /> Enregistrer les modifications</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : EDITORIAL & MÉDIAS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. ÂME DU PRODUIT */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-[#C6A15B] flex items-center gap-2"><Heart className="h-5 w-5 fill-[#C6A15B]"/> L&apos;Âme du Produit</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Nom du produit *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Slug (URL)</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-gray-50 font-mono text-xs" /></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center"><Label>Phrase d&apos;accroche (Max 150 chars)</Label><span className="text-[10px] text-gray-400">{shortDescription.length}/150</span></div>
                <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value.substring(0, 150))} placeholder="Le goût authentique..." className="italic" />
              </div>

              <div className="space-y-2"><Label>Histoire du produit (Description longue)</Label><RichTextEditor value={description} onChange={setDescription} /></div>

              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                <Label className="text-[#b8933d] font-bold flex items-center gap-2 uppercase tracking-tight"><Sparkles className="h-4 w-4"/> L&apos;avis d&apos;André</Label>
                <Textarea value={andreReview} onChange={(e) => setAndreReview(e.target.value)} placeholder="Votre avis personnel..." rows={4} className="bg-white border-none italic shadow-inner" />
              </div>
            </CardContent>
          </Card>

          {/* 2. VISUELS & VIDÉO */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-red-500"/> Visuels & Démo Vidéo</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
              <ProductMediaGalleryManager mainImage={mainImage} galleryImages={galleryImages} onMainImageChange={setMainImage} onGalleryImagesChange={setGalleryImages} />
              <Separator />
              <div className="space-y-2">
                <Label>Lien Vidéo (Instagram Reel / YouTube)</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://instagram.com/reel/..." />
                <p className="text-[10px] text-gray-400 italic">Remplacera l&apos;image principale sur la fiche produit.</p>
              </div>
            </CardContent>
          </Card>

          {/* 3. CROSS-SELLING */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="flex items-center gap-2 text-blue-600"><Plus className="h-5 w-5"/> L&apos;Appât (Ventes Suggérées)</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <Label className="italic">André vous conseille d&apos;accompagner cela avec...</Label>
              <div className="flex flex-wrap gap-2">
                {relatedProductIds.map(id => (
                  <Badge key={id} variant="secondary" className="px-3 py-1 gap-2 bg-blue-50 text-blue-700 border-blue-100">
                    {allProducts.find(p => p.id === id)?.name}
                    <Trash2 className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setRelatedProductIds(relatedProductIds.filter(v => v !== id))} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(id) => id && !relatedProductIds.includes(id) && setRelatedProductIds([...relatedProductIds, id])}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Ajouter un produit suggéré..." /></SelectTrigger>
                <SelectContent>{allProducts.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
              </Select>
            </CardContent>
          </Card>

        </div>

        {/* COLONNE DROITE : FINANCES, SEO & CONFIG */}
        <div className="space-y-8">
          
          {/* FINANCES */}
          <Card className="border-2 border-[#d4af37]/30 bg-amber-50/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-[#d4af37]/10 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg text-[#b8933d] flex items-center gap-2"><Calculator className="h-5 w-5"/> Marge</CardTitle>
              <Badge className="bg-[#d4af37] text-white border-none">{margin}%</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white/80">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-[10px] uppercase text-gray-500">Achat (€)</Label><Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)} className="font-mono" /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase text-gray-500">Vente (€)</Label><Input type="number" value={regularPrice} onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)} className="font-bold font-mono border-amber-200" /></div>
              </div>
              <div className="space-y-1"><Label className="text-[10px] uppercase text-gray-500">Promo (€)</Label><Input type="number" value={salePrice || ""} onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : null)} className="text-red-600 font-mono border-red-100" /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-[10px] uppercase text-gray-500">Stock</Label><Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase text-gray-500">Poids (g)</Label><Input type="number" value={virtualWeight} onChange={(e) => setVirtualWeight(parseInt(e.target.value) || 0)} /></div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="flex items-center gap-2 text-green-600"><Globe className="h-5 w-5"/> Référencement (SEO)</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Titre Google</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description Google</Label><Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>

          {/* CONFIG & MODULES */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="flex items-center gap-2 text-gray-600"><Package className="h-5 w-5"/> Options</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-blue-50/30">
                <div className="space-y-0.5"><Label className="text-blue-900">Variantes ?</Label><p className="text-[10px] text-blue-500 italic">Couleurs & Stocks multiples</p></div>
                <Switch checked={hasVariations} onCheckedChange={setHasVariations} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-purple-50/30 opacity-60">
                <div className="space-y-0.5"><Label className="text-purple-900">Module Tailles ?</Label><p className="text-[10px] text-purple-500 italic">Désactivé par défaut</p></div>
                <Switch checked={showSizes} onCheckedChange={setShowSizes} />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2"><Checkbox id="f" checked={isFeatured} onCheckedChange={(c) => setIsFeatured(!!c)}/><Label htmlFor="f">⭐ Mettre en Vedette</Label></div>
                <div className="flex items-center gap-2"><Checkbox id="d" checked={isDiamond} onCheckedChange={(c) => setIsDiamond(!!c)}/><Label htmlFor="d">💎 Produit Diamant</Label></div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* BLOCS LARGES : ATTRIBUTS & CATÉGORIES */}
      <div className="space-y-8">
        <GeneralAttributesSelector selectedAttributes={selectedAttributes} onAttributesChange={setSelectedAttributes} />
        <HierarchicalCategorySelector selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} />
        
        {hasVariations && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ColorSwatchSelector selectedMainColor={activeFamilyView} selectedSecondaryColors={selectedNuances} onMainColorSelect={setActiveFamilyView} onSecondaryColorToggle={(name, id, sel) => {
                if (sel) {
                  setSelectedNuances([...selectedNuances, name]);
                  setNuanceIds({...nuanceIds, [name]: id});
                } else {
                  setSelectedNuances(selectedNuances.filter(n => n !== name));
                }
            }} showSecondaryColors={true} />
            <VariationDetailsForm selectedSecondaryColors={selectedNuances} secondaryColorIds={nuanceIds} variations={variations} onVariationUpdate={(name, field, val) => {
                setVariations(prev => {
                  const idx = prev.findIndex(v => v.colorName === name);
                  const newVars = [...prev];
                  newVars[idx] = { ...newVars[idx], [field]: val };
                  return newVars;
                });
            }} defaultRegularPrice={regularPrice} defaultSalePrice={salePrice} defaultStock={stockQuantity} />
          </div>
        )}
      </div>
    </div>
  );
}