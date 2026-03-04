"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Settings2,
  Loader2,
  Tag
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import ProductMediaGalleryManager from "@/components/ProductMediaGalleryManager";
import HierarchicalCategorySelector from "@/components/HierarchicalCategorySelector";
import GeneralAttributesSelector from "@/components/GeneralAttributesSelector";
import ColorSwatchSelector from "@/components/ColorSwatchSelector";
import VariationDetailsForm from "@/components/VariationDetailsForm";
import { useAutoSave } from "@/hooks/useAutoSave"; 

interface Variation {
  id?: string;
  colorName: string;
  colorId: string;
  sku: string;
  regular_price: number | null;
  sale_price: number | null;
  stock_quantity: number | null;
  image_url: string | null;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- ÉTATS ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [andreReview, setAndreReview] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [virtualWeight, setVirtualWeight] = useState<number>(0);

  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDiamond, setIsDiamond] = useState(false);
  const [hasVariations, setHasVariations] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [mainImage, setMainImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]); 
  const [allProducts, setAllProducts] = useState<{id: string, name: string}[]>([]);

  const [activeFamilyView, setActiveFamilyView] = useState<string>("");
  const [selectedNuances, setSelectedNuances] = useState<string[]>([]);
  const [nuanceIds, setNuanceIds] = useState<Record<string, string>>({});
  const [sizeRangeStart, setSizeRangeStart] = useState<number | null>(null);
  const [sizeRangeEnd, setSizeRangeEnd] = useState<number | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);

  // --- CHARGEMENT ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: prod, error } = await supabase.from("products").select("*").eq("id", id).single();
        if (error) throw error;

        setName(prod.name || "");
        setSlug(prod.slug || "");
        setSku(prod.sku || "");
        setShortDescription(prod.short_description || "");
        setDescription(prod.description || "");
        setAndreReview(prod.andre_review || "");
        setVideoUrl(prod.video_url || "");
        setPurchasePrice(prod.purchase_price || 0);
        setRegularPrice(prod.regular_price || 0);
        setSalePrice(prod.sale_price);
        setStockQuantity(prod.stock_quantity || 0);
        setVirtualWeight(prod.virtual_weight || 0);
        setStatus(prod.status || "draft");
        setIsFeatured(prod.is_featured || false);
        setIsDiamond(prod.is_diamond || false);
        setHasVariations(prod.has_variations || false);
        setShowSizes(!!prod.size_range_start);
        setSeoTitle(prod.seo_title || "");
        setSeoDescription(prod.seo_description || "");
        setTags(prod.tags || []);
        setMainImage(prod.image_url || "");
        setGalleryImages(prod.gallery_images || []);
        setSelectedAttributes(prod.attributes || {});
        setRelatedProductIds(prod.related_product_ids || []);
        setSizeRangeStart(prod.size_range_start);
        setSizeRangeEnd(prod.size_range_end);

        const { data: catMapping } = await supabase.from("product_category_mapping").select("category_id").eq("product_id", id);
        setSelectedCategories(catMapping?.map(c => c.category_id) || []);

        const { data: varData } = await supabase.from("product_variations").select("*").eq("product_id", id);
        if (varData && varData.length > 0) {
          const loadedVariations = varData.map(v => ({
            id: v.id,
            colorName: v.attributes?.Couleur || "",
            colorId: "", 
            sku: v.sku || "",
            regular_price: v.regular_price,
            sale_price: v.sale_price,
            stock_quantity: v.stock_quantity,
            image_url: v.image_url
          }));
          setVariations(loadedVariations);
          setSelectedNuances(loadedVariations.map(v => v.colorName));
        }

        const { data: prods } = await supabase.from("products").select("id, name").order("name");
        if (prods) setAllProducts(prods);

      } catch (e: any) { toast.error("Erreur : " + e.message); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, [id]);

  // --- AUTO-SAVE ---
  const currentFormData = {
    id, name, slug, sku, shortDescription, description, andreReview, videoUrl,
    purchasePrice, regularPrice, salePrice, stockQuantity, virtualWeight,
    status, isFeatured, isDiamond, hasVariations, showSizes, seoTitle, seoDescription, tags,
    mainImage, galleryImages, selectedCategories, selectedAttributes, relatedProductIds,
    selectedNuances, nuanceIds, sizeRangeStart, sizeRangeEnd, variations
  };
  useAutoSave(`edit_product_${id}`, currentFormData, () => {});

  // --- CALCUL DE LA MARGE RÉELLE (BASÉ SUR LE HT) ---
  const marginData = useMemo(() => {
    const saleHT = regularPrice / 1.2; // Conversion Vente TTC en HT
    const marginEuro = saleHT - purchasePrice; // Marge nette en euros
    const marginPercent = saleHT > 0 ? (marginEuro / saleHT) * 100 : 0;
    
    return {
      euro: marginEuro.toFixed(2),
      percent: marginPercent.toFixed(1)
    };
  }, [purchasePrice, regularPrice]);

  useEffect(() => {
    if (hasVariations && !loading) {
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
  }, [selectedNuances, nuanceIds, hasVariations, loading, regularPrice, salePrice, stockQuantity]);

  const handleNuanceToggle = (nuanceName: string, nid: string, selected: boolean) => {
    if (selected) {
      setSelectedNuances(prev => Array.from(new Set([...prev, nuanceName])));
      setNuanceIds(prev => ({ ...prev, [nuanceName]: nid }));
    } else {
      setSelectedNuances(prev => prev.filter(n => n !== nuanceName));
    }
  };

  const handleSave = async () => {
    if (!name || !slug) { toast.error("Le nom et le slug sont requis"); return; }
    setSaving(true);
    try {
      const finalAttributes = { ...selectedAttributes };
      if (hasVariations) finalAttributes['Couleur'] = selectedNuances;

      const { error: pErr } = await supabase.from("products").update({
        name: name.trim(), slug: slug.trim(), sku: sku.trim() || null,
        short_description: shortDescription.substring(0, 150), description, andre_review: andreReview,
        video_url: videoUrl, purchase_price: purchasePrice, regular_price: regularPrice,
        sale_price: salePrice, stock_quantity: stockQuantity, virtual_weight: virtualWeight,
        status, is_featured: isFeatured, is_diamond: isDiamond, has_variations: hasVariations,
        seo_title: seoTitle || name, seo_description: seoDescription || shortDescription,
        tags: tags,
        image_url: mainImage, gallery_images: galleryImages, attributes: finalAttributes,
        related_product_ids: relatedProductIds,
        size_range_start: showSizes ? sizeRangeStart : null,
        size_range_end: showSizes ? sizeRangeEnd : null,
        updated_at: new Date().toISOString()
      }).eq("id", id);

      if (pErr) throw pErr;

      await supabase.from("product_category_mapping").delete().eq("product_id", id);
      if (selectedCategories.length > 0) {
        const mappings = selectedCategories.map((catId, i) => ({ product_id: id, category_id: catId, is_primary: i === 0, display_order: i }));
        await supabase.from("product_category_mapping").insert(mappings);
      }

      await supabase.from("product_variations").delete().eq("product_id", id);
      if (hasVariations && variations.length > 0) {
        const toInsert = variations.map(v => ({
          product_id: id, sku: v.sku, attributes: { "Couleur": v.colorName },
          regular_price: v.regular_price || regularPrice, sale_price: v.sale_price || salePrice,
          stock_quantity: v.stock_quantity || stockQuantity, image_url: v.image_url || mainImage,
          stock_status: (v.stock_quantity || 0) > 0 ? "instock" : "outofstock", is_active: true,
        }));
        await supabase.from("product_variations").insert(toInsert);
      }

      toast.success("La pépite a été mise à jour !");
      router.refresh();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <Loader2 className="h-12 w-12 animate-spin text-[#d4af37]" />
      <p className="text-gray-500 font-medium">Chargement...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5"/></Button></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Modifier : {name}</h1>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1"><RefreshCw className="w-2.5 h-2.5" /> Auto-save actif</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/product/${slug}`} target="_blank"><Button variant="outline">Voir sur le site</Button></Link>
            <Button onClick={handleSave} disabled={saving} className="bg-[#d4af37] hover:bg-[#c19b2f] text-white px-8 shadow-lg shadow-amber-200">
              {saving ? "Mise à jour..." : <><Save className="w-4 h-4 mr-2" /> Enregistrer les modifications</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#C6A15B]"/><CardTitle className="text-lg">L&apos;Âme du Produit</CardTitle></div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Nom de la pépite *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Slug (URL)</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-gray-50 font-mono text-xs" /></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>Phrase d&apos;Accroche</Label><span className="text-[10px] text-gray-400">{shortDescription.length}/150</span></div>
                <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value.substring(0, 150))} className="italic" />
              </div>
              <div className="space-y-2"><Label>Histoire (Description longue)</Label><RichTextEditor value={description} onChange={setDescription} /></div>
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                <Label className="text-[#b8933d] font-bold flex items-center gap-2 uppercase tracking-tighter"><Heart className="h-4 w-4 fill-[#b8933d]" /> L&apos;avis d&apos;André</Label>
                <Textarea value={andreReview} onChange={(e) => setAndreReview(e.target.value)} rows={4} className="bg-white border-none italic shadow-inner" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-2"><Video className="h-5 w-5 text-gray-800" /><CardTitle className="text-lg">Visuels & Démo</CardTitle></div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <ProductMediaGalleryManager mainImage={mainImage} galleryImages={galleryImages} onMainImageChange={setMainImage} onGalleryImagesChange={setGalleryImages} />
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2"><Video className="h-5 w-5 text-red-500" /><Label>Lien Vidéo</Label></div>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="border-red-100 focus:border-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="border-b bg-gray-50/50"><CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-blue-500" /> Ventes Suggérées</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {relatedProductIds.map(rid => (
                  <Badge key={rid} variant="secondary" className="px-3 py-1 gap-2 bg-blue-50 text-blue-700 border-blue-100">
                    {allProducts.find(p => p.id === rid)?.name}
                    <Trash2 className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setRelatedProductIds(relatedProductIds.filter(v => v !== rid))} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(rid) => rid && !relatedProductIds.includes(rid) && relatedProductIds.length < 3 && setRelatedProductIds([...relatedProductIds, rid])}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Ajouter une suggestion..." /></SelectTrigger>
                <SelectContent>{allProducts.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border-2 border-[#d4af37]/30 bg-amber-50/20 overflow-hidden">
            <CardHeader className="bg-[#d4af37]/10 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg text-[#b8933d] flex items-center gap-2"><Calculator className="h-5 w-5"/> Marge</CardTitle>
              <div className="text-right">
                <Badge className="bg-[#d4af37] text-white border-none block">{marginData.percent}%</Badge>
                <span className="text-[10px] font-bold text-[#b8933d]">{marginData.euro}€ net (HT)</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white/80">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Achat HT (€)</Label><Input type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)} className="font-mono" /></div>
                <div className="space-y-1"><Label className="text-xs font-bold text-[#b8933d] uppercase">Vente TTC (€) *</Label><Input type="number" step="0.01" value={regularPrice} onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)} className="font-bold font-mono border-amber-200" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Promo TTC (€)</Label><Input type="number" step="0.01" value={salePrice || ""} onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : null)} className="text-red-600 font-mono border-red-100" /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Stock</Label><Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Poids (g)</Label><Input type="number" value={virtualWeight} onChange={(e) => setVirtualWeight(parseInt(e.target.value) || 0)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="text-lg flex items-center gap-2 text-green-600"><Globe className="h-5 w-5" /> SEO & Tags</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div><Label>Titre Google</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></div>
              <div><Label>Description Google</Label><Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} /></div>
              <Separator className="my-2" />
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-[#b8933d] font-bold"><Tag className="h-4 w-4" /> Mots-clés (Tags)</Label>
                <Input placeholder="vintage, doré, été..." value={tags.join(", ")} onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()).filter(t => t !== ""))} />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag, i) => (<Badge key={i} variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-bold">#{tag}</Badge>))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="text-lg flex items-center gap-2 text-gray-600"><Settings2 className="h-5 w-5"/> Options</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
                <div className="space-y-0.5"><Label className="text-gray-900 font-bold">Statut</Label></div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[130px] bg-white border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="publish">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-blue-50/30">
                <div className="space-y-0.5"><Label className="text-blue-900">Variantes ?</Label></div>
                <Switch checked={hasVariations} onCheckedChange={setHasVariations} />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-xl bg-purple-50/30 opacity-60">
                <div className="space-y-0.5"><Label className="text-purple-900">Module Tailles ?</Label></div>
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
            <VariationDetailsForm selectedSecondaryColors={selectedNuances} secondaryColorIds={nuanceIds} variations={variations} onVariationUpdate={(vName, field, val) => {
                setVariations(prev => {
                  const idx = prev.findIndex(v => v.colorName === vName);
                  if (idx === -1) return prev;
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