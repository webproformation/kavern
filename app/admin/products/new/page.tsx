"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  ImageIcon,
  Layers,
  Settings2
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import ProductMediaGalleryManager from "@/components/ProductMediaGalleryManager";
import HierarchicalCategorySelector from "@/components/HierarchicalCategorySelector";
import GeneralAttributesSelector from "@/components/GeneralAttributesSelector";
import ColorSwatchSelector from "@/components/ColorSwatchSelector";
import VariationDetailsForm from "@/components/VariationDetailsForm";

// --- IMPORT DU HOOK DE SAUVEGARDE ---
import { useAutoSave } from "@/hooks/useAutoSave"; 

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number | null;
}

interface Variation {
  colorName: string;
  colorId: string;
  sku: string;
  regular_price: number | null;
  sale_price: number | null;
  stock_quantity: number | null;
  image_url: string | null;
}

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // --- GÉNÉRATION DE L'ID ANTICIPÉ ---
  const [newProductId] = useState(() => crypto.randomUUID());

  // --- ÉTATS : INFORMATIONS GÉNÉRALES ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState(""); // Phrase d'accroche (150 chars)
  const [description, setDescription] = useState("");
  const [andreReview, setAndreReview] = useState(""); // L'avis d'André
  const [videoUrl, setVideoUrl] = useState(""); // Lien Vidéo

  // --- ÉTATS : FINANCES & LOGISTIQUE ---
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [virtualWeight, setVirtualWeight] = useState<number>(0);

  // --- ÉTATS : CONFIGURATION & SEO ---
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDiamond, setIsDiamond] = useState(false);
  const [hasVariations, setHasVariations] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // --- ÉTATS : MÉDIAS & RELATIONS ---
  const [mainImage, setMainImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]); 
  const [allProducts, setAllProducts] = useState<{id: string, name: string}[]>([]);

  // --- ÉTATS : COULEURS & VARIANTES (LOGIQUE CUMULATIVE) ---
  const [activeFamilyView, setActiveFamilyView] = useState<string>("");
  const [selectedNuances, setSelectedNuances] = useState<string[]>([]);
  const [nuanceIds, setNuanceIds] = useState<Record<string, string>>({});
  const [sizeRangeStart, setSizeRangeStart] = useState<number | null>(null);
  const [sizeRangeEnd, setSizeRangeEnd] = useState<number | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);

  // --- INTÉGRATION AUTO-SAVE ---
  const currentFormData = {
    newProductId, name, slug, sku, shortDescription, description, andreReview, videoUrl,
    purchasePrice, regularPrice, salePrice, stockQuantity, virtualWeight,
    status, isFeatured, isDiamond, hasVariations, showSizes, seoTitle, seoDescription,
    mainImage, galleryImages, selectedCategories, selectedAttributes, relatedProductIds,
    selectedNuances, nuanceIds, sizeRangeStart, sizeRangeEnd, variations
  };

  const { clearSavedData } = useAutoSave(
    `new_product_creation`,
    currentFormData,
    (savedData: any) => {
        if (savedData.name !== undefined) setName(savedData.name);
        if (savedData.slug !== undefined) setSlug(savedData.slug);
        if (savedData.sku !== undefined) setSku(savedData.sku);
        if (savedData.shortDescription !== undefined) setShortDescription(savedData.shortDescription);
        if (savedData.description !== undefined) setDescription(savedData.description);
        if (savedData.andreReview !== undefined) setAndreReview(savedData.andreReview);
        if (savedData.videoUrl !== undefined) setVideoUrl(savedData.videoUrl);
        if (savedData.purchasePrice !== undefined) setPurchasePrice(savedData.purchasePrice);
        if (savedData.regularPrice !== undefined) setRegularPrice(savedData.regularPrice);
        if (savedData.salePrice !== undefined) setSalePrice(savedData.salePrice);
        if (savedData.stockQuantity !== undefined) setStockQuantity(savedData.stockQuantity);
        if (savedData.virtualWeight !== undefined) setVirtualWeight(savedData.virtualWeight);
        if (savedData.status !== undefined) setStatus(savedData.status);
        if (savedData.isFeatured !== undefined) setIsFeatured(savedData.isFeatured);
        if (savedData.isDiamond !== undefined) setIsDiamond(savedData.isDiamond);
        if (savedData.hasVariations !== undefined) setHasVariations(savedData.hasVariations);
        if (savedData.showSizes !== undefined) setShowSizes(savedData.showSizes);
        if (savedData.seoTitle !== undefined) setSeoTitle(savedData.seoTitle);
        if (savedData.seoDescription !== undefined) setSeoDescription(savedData.seoDescription);
        if (savedData.mainImage !== undefined) setMainImage(savedData.mainImage);
        if (savedData.galleryImages !== undefined) setGalleryImages(savedData.galleryImages);
        if (savedData.selectedCategories !== undefined) setSelectedCategories(savedData.selectedCategories);
        if (savedData.selectedAttributes !== undefined) setSelectedAttributes(savedData.selectedAttributes);
        if (savedData.relatedProductIds !== undefined) setRelatedProductIds(savedData.relatedProductIds);
        if (savedData.selectedNuances !== undefined) setSelectedNuances(savedData.selectedNuances);
        if (savedData.nuanceIds !== undefined) setNuanceIds(savedData.nuanceIds);
        if (savedData.variations !== undefined) setVariations(savedData.variations);
    }
  );

  // --- LOGIQUE : GÉNÉRATION AUTOMATIQUE DU SLUG ---
  useEffect(() => {
    if (name) {
      setSlug(name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  }, [name]);

  // --- LOGIQUE : CHARGEMENT DES PRODUITS (CROSS-SELLING) ---
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("id, name").order("name");
      if (data) setAllProducts(data);
    };
    fetchProducts();
  }, []);

  // --- LOGIQUE : CALCUL DE LA MARGE ---
  const margin = useMemo(() => {
    if (regularPrice > 0) {
      return (((regularPrice - purchasePrice) / regularPrice) * 100).toFixed(1);
    }
    return "0";
  }, [purchasePrice, regularPrice]);

  // --- LOGIQUE : VARIATIONS (SANS ÉCRASEMENT) ---
  useEffect(() => {
    if (hasVariations) {
      setVariations(prev => {
        const kept = prev.filter(v => selectedNuances.includes(v.colorName));
        const added = selectedNuances
          .filter(name => !kept.some(v => v.colorName === name))
          .map(colorName => ({
            colorName, colorId: nuanceIds[colorName] || "", sku: "",
            regular_price: regularPrice || null, sale_price: salePrice,
            stock_quantity: stockQuantity || null, image_url: null,
          }));
        return [...kept, ...added];
      });
    }
  }, [selectedNuances, nuanceIds, hasVariations]);

  // --- HANDLERS ---
  const handleFamilySelect = (name: string, id: string) => { setActiveFamilyView(name); };
  const handleNuanceToggle = (name: string, id: string, selected: boolean) => {
    if (selected) {
      setSelectedNuances(prev => Array.from(new Set([...prev, name])));
      setNuanceIds(prev => ({ ...prev, [name]: id }));
    } else {
      setSelectedNuances(prev => prev.filter(n => n !== name));
    }
  };

  const handleSave = async () => {
    if (!name || !slug) { toast.error("Le nom et le slug sont requis"); return; }
    setSaving(true);
    try {
      const finalAttributes = { ...selectedAttributes };
      if (hasVariations) finalAttributes['Couleur'] = selectedNuances;

      const { data: newProd, error: pErr } = await supabase.from("products").insert({
        id: newProductId, name: name.trim(), slug: slug.trim(), sku: sku.trim() || null,
        short_description: shortDescription.substring(0, 150), description, andre_review: andreReview,
        video_url: videoUrl, purchase_price: purchasePrice, regular_price: regularPrice,
        sale_price: salePrice, stock_quantity: stockQuantity, virtual_weight: virtualWeight,
        status, is_featured: isFeatured, is_diamond: isDiamond, has_variations: hasVariations,
        seo_title: seoTitle || name, seo_description: seoDescription || shortDescription,
        image_url: mainImage, gallery_images: galleryImages, attributes: finalAttributes,
        related_product_ids: relatedProductIds,
        size_range_start: showSizes ? sizeRangeStart : null,
        size_range_end: showSizes ? sizeRangeEnd : null
      }).select().single();

      if (pErr) throw pErr;

      if (selectedCategories.length > 0) {
        const mappings = selectedCategories.map((id, i) => ({ product_id: newProductId, category_id: id, is_primary: i === 0, display_order: i }));
        await supabase.from("product_category_mapping").insert(mappings);
      }

      if (hasVariations && variations.length > 0) {
        const toInsert = variations.map(v => ({
          product_id: newProductId, sku: v.sku, attributes: { "Couleur": v.colorName },
          regular_price: v.regular_price || regularPrice, sale_price: v.sale_price || salePrice,
          stock_quantity: v.stock_quantity || stockQuantity, image_url: v.image_url || mainImage,
          stock_status: (v.stock_quantity || 0) > 0 ? "instock" : "outofstock", is_active: true,
        }));
        await supabase.from("product_variations").insert(toInsert);
      }

      clearSavedData();
      toast.success("Nouvelle pépite créée !");
      router.push("/admin/products");
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* HEADER FIXE */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5"/></Button></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nouveau Produit</h1>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1"><RefreshCw className="w-2.5 h-2.5" /> Auto-save actif</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/products"><Button variant="outline">Annuler</Button></Link>
            <Button onClick={handleSave} disabled={saving} className="bg-[#d4af37] hover:bg-[#c19b2f] text-white px-8 shadow-lg shadow-amber-200">
              {saving ? "Création..." : <><Save className="w-4 h-4 mr-2" /> Créer la pépite</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. L'ÂME DU PRODUIT */}
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#C6A15B]"/><CardTitle className="text-lg">L&apos;Âme du Produit</CardTitle></div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Nom de la pépite *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Bougie Ambre & Soja" /></div>
                <div className="space-y-2"><Label>Slug (URL)</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-gray-50 font-mono text-xs" /></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>La &quot;Phrase d&apos;Accroche&quot;</Label><span className="text-[10px] text-gray-400">{shortDescription.length}/150</span></div>
                <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value.substring(0, 150))} placeholder="Le goût authentique..." className="italic" />
              </div>
              <div className="space-y-2"><Label>Histoire du produit (Description longue)</Label><RichTextEditor value={description} onChange={setDescription} /></div>
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                <Label className="text-[#b8933d] font-bold flex items-center gap-2 uppercase tracking-tighter"><Heart className="h-4 w-4 fill-[#b8933d]" /> L&apos;avis d&apos;André</Label>
                <Textarea value={andreReview} onChange={(e) => setAndreReview(e.target.value)} placeholder="Pourquoi avez-vous craqué pour ce produit ?" rows={4} className="bg-white border-none italic shadow-inner" />
              </div>
            </CardContent>
          </Card>

          {/* 2. VISUELS & VIDÉO */}
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-2"><Video className="h-5 w-5 text-gray-800" /><CardTitle className="text-lg">Visuels & Démo</CardTitle></div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <ProductMediaGalleryManager mainImage={mainImage} galleryImages={galleryImages} onMainImageChange={setMainImage} onGalleryImagesChange={setGalleryImages} />
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2"><Video className="h-5 w-5 text-red-500" /><Label>Lien Vidéo (Instagram Reel / Live)</Label></div>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Lien direct pour remplacer la photo principale..." className="border-red-100 focus:border-red-400" />
              </div>
            </CardContent>
          </Card>

          {/* 3. LE CROSS-SELLING */}
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="border-b bg-gray-50/50"><CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-blue-500" /> Ventes Suggérées</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {relatedProductIds.map(id => (
                  <Badge key={id} variant="secondary" className="px-3 py-1 gap-2 bg-blue-50 text-blue-700 border-blue-100">
                    {allProducts.find(p => p.id === id)?.name}
                    <Trash2 className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setRelatedProductIds(relatedProductIds.filter(v => v !== id))} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(id) => id && !relatedProductIds.includes(id) && relatedProductIds.length < 3 && setRelatedProductIds([...relatedProductIds, id])}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Ajouter une suggestion d'André..." /></SelectTrigger>
                <SelectContent>{allProducts.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-8">
          <Card className="shadow-lg border-2 border-[#d4af37]/30 bg-amber-50/20 overflow-hidden">
            <CardHeader className="bg-[#d4af37]/10 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg text-[#b8933d] flex items-center gap-2"><Calculator className="h-5 w-5"/> Marge</CardTitle>
              <Badge className="bg-[#d4af37] text-white border-none">{margin}%</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white/80">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Achat (€)</Label><Input type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)} className="font-mono" /></div>
                <div className="space-y-1"><Label className="text-xs font-bold text-[#b8933d] uppercase">Vente (€) *</Label><Input type="number" step="0.01" value={regularPrice} onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)} className="font-bold font-mono border-amber-200" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Promo (€)</Label><Input type="number" step="0.01" value={salePrice || ""} onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : null)} className="text-red-600 font-mono border-red-100" /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Stock</Label><Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Poids (g)</Label><Input type="number" value={virtualWeight} onChange={(e) => setVirtualWeight(parseInt(e.target.value) || 0)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-green-600" /> SEO</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div><Label>Titre Google</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={name} /></div>
              <div><Label>Description Google</Label><Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={shortDescription} rows={3} /></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="text-lg flex items-center gap-2 text-gray-600"><Settings2 className="h-5 w-5"/> Options</CardTitle></CardHeader>
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

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        <GeneralAttributesSelector selectedAttributes={selectedAttributes} onAttributesChange={setSelectedAttributes} />
        <HierarchicalCategorySelector selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} />
        
        {hasVariations && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ColorSwatchSelector selectedMainColor={activeFamilyView} selectedSecondaryColors={selectedNuances} onMainColorSelect={setActiveFamilyView} onSecondaryColorToggle={handleNuanceToggle} showSecondaryColors={true} />
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