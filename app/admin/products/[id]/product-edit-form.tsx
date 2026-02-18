"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, ArrowLeft, RefreshCw, Weight } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import ColorSwatchSelector from "@/components/ColorSwatchSelector";
import ProductMediaGalleryManager from "@/components/ProductMediaGalleryManager";
import HierarchicalCategorySelector from "@/components/HierarchicalCategorySelector";
import GeneralAttributesSelector from "@/components/GeneralAttributesSelector";
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
  id?: string;
  colorName: string;
  colorId: string;
  sku: string;
  regular_price: number | null;
  sale_price: number | null;
  stock_quantity: number | null;
  image_url: string | null;
}

interface ProductCreateFormProps {
  allCategories: Category[];
}

export default function ProductCreateForm({
  allCategories,
}: ProductCreateFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // --- GÉNÉRATION DE L'ID ANTICIPÉ ---
  const [newProductId] = useState(() => crypto.randomUUID());

  // --- ÉTATS DU FORMULAIRE ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [virtualWeight, setVirtualWeight] = useState<number>(0);
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDiamond, setIsDiamond] = useState(false);

  const [mainImage, setMainImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const [mainColor, setMainColor] = useState<string>("");
  const [mainColorId, setMainColorId] = useState<string>("");
  const [selectedSecondaryColors, setSelectedSecondaryColors] = useState<string[]>([]);
  const [secondaryColorIds, setSecondaryColorIds] = useState<Record<string, string>>({});

  const [sizeRangeStart, setSizeRangeStart] = useState<number | null>(null);
  const [sizeRangeEnd, setSizeRangeEnd] = useState<number | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  
  const [variations, setVariations] = useState<Variation[]>([]);

  // --- INTÉGRATION AUTO-SAVE ---
  const currentFormData = {
    newProductId, name, slug, sku, description,
    regularPrice, salePrice, stockQuantity, virtualWeight,
    status, isFeatured, isDiamond,
    mainImage, galleryImages,
    mainColor, mainColorId, selectedSecondaryColors, secondaryColorIds,
    sizeRangeStart, sizeRangeEnd,
    selectedCategories, selectedAttributes,
    variations
  };

  const { clearSavedData } = useAutoSave(
    `new_product_creation`,
    currentFormData,
    (savedData: any) => {
        if (savedData.name !== undefined) setName(savedData.name);
        if (savedData.slug !== undefined) setSlug(savedData.slug);
        if (savedData.sku !== undefined) setSku(savedData.sku);
        if (savedData.description !== undefined) setDescription(savedData.description);
        if (savedData.regularPrice !== undefined) setRegularPrice(savedData.regularPrice);
        if (savedData.salePrice !== undefined) setSalePrice(savedData.salePrice);
        if (savedData.stockQuantity !== undefined) setStockQuantity(savedData.stockQuantity);
        if (savedData.virtualWeight !== undefined) setVirtualWeight(savedData.virtualWeight);
        if (savedData.status !== undefined) setStatus(savedData.status);
        if (savedData.isFeatured !== undefined) setIsFeatured(savedData.isFeatured);
        if (savedData.isDiamond !== undefined) setIsDiamond(savedData.isDiamond);
        if (savedData.mainImage !== undefined) setMainImage(savedData.mainImage);
        if (savedData.galleryImages !== undefined) setGalleryImages(savedData.galleryImages);
        if (savedData.mainColor !== undefined) setMainColor(savedData.mainColor);
        if (savedData.mainColorId !== undefined) setMainColorId(savedData.mainColorId);
        if (savedData.selectedSecondaryColors !== undefined) setSelectedSecondaryColors(savedData.selectedSecondaryColors);
        if (savedData.secondaryColorIds !== undefined) setSecondaryColorIds(savedData.secondaryColorIds);
        if (savedData.sizeRangeStart !== undefined) setSizeRangeStart(savedData.sizeRangeStart);
        if (savedData.sizeRangeEnd !== undefined) setSizeRangeEnd(savedData.sizeRangeEnd);
        if (savedData.selectedCategories !== undefined) setSelectedCategories(savedData.selectedCategories);
        if (savedData.selectedAttributes !== undefined) setSelectedAttributes(savedData.selectedAttributes);
        if (savedData.variations !== undefined) setVariations(savedData.variations);
    }
  );

  // --- LOGIQUE AUTO-SÉLECTION DES TAILLES ---
  useEffect(() => {
    if (sizeRangeStart && sizeRangeEnd) {
      const start = Math.min(sizeRangeStart, sizeRangeEnd);
      const end = Math.max(sizeRangeStart, sizeRangeEnd);
      const autoSizes: string[] = [];
      for (let s = start; s <= end; s += 2) {
        autoSizes.push(s.toString());
      }
      setSelectedAttributes(prev => ({ ...prev, "Tailles": autoSizes }));
    }
  }, [sizeRangeStart, sizeRangeEnd]);

  // --- LOGIQUE DES VARIATIONS (CORRIGÉE) ---
  useEffect(() => {
    // Fusion unique des couleurs sans doublons
    const allColors = Array.from(new Set([
      ...(mainColor ? [mainColor] : []),
      ...selectedSecondaryColors
    ]));
    
    if (allColors.length > 0) {
        const currentNames = variations.map(v => v.colorName).sort().join(',');
        const newNames = [...allColors].sort().join(',');
        
        if (currentNames !== newNames) {
             const newVariations: Variation[] = allColors.map(colorName => {
                const existingVar = variations.find(v => v.colorName === colorName);
                return existingVar || {
                  colorName,
                  colorId: colorName === mainColor ? mainColorId : (secondaryColorIds[colorName] || ""),
                  sku: "",
                  regular_price: regularPrice || null,
                  sale_price: salePrice,
                  stock_quantity: stockQuantity || null,
                  image_url: colorName === mainColor ? mainImage : null,
                };
              });
              setVariations(newVariations);
        }
    } else {
      if (variations.length > 0) setVariations([]);
    }
  }, [mainColor, selectedSecondaryColors, mainColorId, secondaryColorIds, regularPrice, stockQuantity, salePrice, mainImage]);

  // --- GESTION DU CHANGEMENT DE COULEUR PRINCIPALE (FIX MIGRATION) ---
  const handleMainColorSelect = (colorName: string, colorId: string) => {
    // Si on change la couleur principale, l'ancienne bascule dans les secondaires
    // pour ne pas perdre la variation associée.
    if (mainColor && mainColor !== colorName) {
      if (!selectedSecondaryColors.includes(mainColor)) {
        setSelectedSecondaryColors(prev => [...prev, mainColor]);
        setSecondaryColorIds(prev => ({ ...prev, [mainColor]: mainColorId }));
      }
    }

    setMainColor(colorName);
    setMainColorId(colorId);

    // On retire la nouvelle principale de la liste secondaire pour éviter les doublons
    setSelectedSecondaryColors(prev => prev.filter(c => c !== colorName));
  };

  const handleSecondaryColorToggle = (colorName: string, colorId: string, selected: boolean) => {
    if (selected) {
      if (colorName === mainColor) return; // Déjà en principale
      setSelectedSecondaryColors(prev => [...prev, colorName]);
      setSecondaryColorIds(prev => ({ ...prev, [colorName]: colorId }));
    } else {
      setSelectedSecondaryColors(prev => prev.filter(c => c !== colorName));
    }
  };

  const handleVariationUpdate = (colorName: string, field: keyof Variation, value: any) => {
    setVariations(prev => {
      const idx = prev.findIndex(v => v.colorName === colorName);
      if (idx >= 0) {
        const newVars = [...prev];
        newVars[idx] = { ...newVars[idx], [field]: value };
        return newVars;
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (!name || !slug) {
      toast.error("Le nom et le slug sont requis");
      return;
    }
    if (!mainColor) {
      toast.error("Veuillez sélectionner une couleur principale");
      return;
    }

    setSaving(true);

    try {
      const allAttributes: Record<string, string[]> = { ...selectedAttributes };
      const uniqueColors = Array.from(new Set([mainColor, ...selectedSecondaryColors]));
      allAttributes['Couleur'] = uniqueColors;

      // 1. INSERTION DU PRODUIT
      const { error: productError } = await supabase
        .from("products")
        .insert({
          id: newProductId,
          name: name.trim(),
          slug: slug.trim(),
          sku: sku.trim() || null,
          description,
          regular_price: regularPrice,
          sale_price: salePrice,
          stock_quantity: stockQuantity,
          virtual_weight: virtualWeight,
          status,
          image_url: mainImage || null,
          gallery_images: galleryImages.length > 0 ? galleryImages : null,
          is_diamond: isDiamond,
          is_featured: isFeatured,
          is_variable_product: variations.length > 0,
          has_variations: variations.length > 0,
          main_color: mainColor,
          size_range_start: sizeRangeStart,
          size_range_end: sizeRangeEnd,
          attributes: allAttributes,
        });

      if (productError) throw productError;

      // 2. INSERTION CATÉGORIES
      if (selectedCategories.length > 0) {
        const mappings = selectedCategories.map((catId, index) => ({
          product_id: newProductId,
          category_id: catId,
          is_primary: index === 0,
          display_order: index,
        }));
        await supabase.from("product_category_mapping").insert(mappings);
      }

      // 3. INSERTION VARIATIONS
      if (variations.length > 0) {
        const varsToInsert = variations.map(v => ({
          product_id: newProductId,
          sku: v.sku || "",
          attributes: { "Couleur": v.colorName },
          regular_price: v.regular_price !== null ? parseFloat(String(v.regular_price)) : regularPrice,
          sale_price: v.sale_price !== null ? parseFloat(String(v.sale_price)) : salePrice,
          stock_quantity: v.stock_quantity !== null ? parseInt(String(v.stock_quantity)) : stockQuantity,
          image_url: v.image_url || (v.colorName === mainColor ? mainImage : null),
          stock_status: (v.stock_quantity || stockQuantity || 0) > 0 ? "instock" : "outofstock",
          is_active: true,
        }));
        await supabase.from("product_variations").insert(varsToInsert);
      }

      clearSavedData();
      toast.success("Produit créé avec succès !");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouveau Produit</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Auto-save actif
                </span>
            </div>
          </div>
          <Link href="/admin/products">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* INFORMATIONS GÉNÉRALES */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#d4af37]">Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du Produit *</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ex: Robe de soirée en soie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input 
                    id="slug" 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="robe-de-soiree-soie"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor value={description} onChange={setDescription} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Référence)</Label>
                  <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="publish">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-4 pb-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_featured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(!!checked)} />
                    <Label htmlFor="is_featured" className="cursor-pointer">Vedette</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_diamond" checked={isDiamond} onCheckedChange={(checked) => setIsDiamond(!!checked)} />
                    <Label htmlFor="is_diamond" className="cursor-pointer">Diamant</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÉDIAS */}
          <ProductMediaGalleryManager
            mainImage={mainImage}
            galleryImages={galleryImages}
            onMainImageChange={setMainImage}
            onGalleryImagesChange={setGalleryImages}
          />

          {/* PRIX ET STOCK */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#d4af37]">Prix & Stock (Par défaut)</CardTitle>
              <CardDescription>Valeurs appliquées si aucune variation n&apos;est définie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Prix Régulier (€) *</Label>
                  <Input 
                    id="regularPrice" 
                    type="number" 
                    step="0.01" 
                    value={regularPrice} 
                    onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Prix Promo (€)</Label>
                  <Input 
                    id="salePrice" 
                    type="number" 
                    step="0.01" 
                    value={salePrice || ""} 
                    onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : null)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Initial</Label>
                  <Input 
                    id="stockQuantity" 
                    type="number" 
                    value={stockQuantity} 
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LOGISTIQUE */}
          <Card className="bg-white border-2 border-[#D4AF37]/20">
            <CardHeader className="bg-[#D4AF37]/5">
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-[#D4AF37]" />
                <CardTitle className="text-[#d4af37]">Logistique (Colis Ouvert)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Label htmlFor="virtualWeight">Poids Virtuel (en grammes) *</Label>
              <div className="relative max-w-[200px]">
                <Input
                  id="virtualWeight"
                  type="number"
                  value={virtualWeight}
                  onChange={(e) => setVirtualWeight(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 500"
                  className="bg-white pr-10"
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">g</div>
              </div>
              <p className="text-[10px] text-gray-500 italic">Permet d&apos;estimer le remplissage du carton (max 20kg).</p>
            </CardContent>
          </Card>

          {/* SÉLECTEURS DE COULEURS */}
          <ColorSwatchSelector
            selectedMainColor={mainColor}
            selectedSecondaryColors={selectedSecondaryColors}
            onMainColorSelect={handleMainColorSelect}
            onSecondaryColorToggle={handleSecondaryColorToggle}
            showSecondaryColors={true}
          />

          {/* DÉTAILS DES VARIATIONS */}
          <VariationDetailsForm
            selectedSecondaryColors={selectedSecondaryColors}
            secondaryColorIds={secondaryColorIds}
            variations={variations}
            onVariationUpdate={handleVariationUpdate}
            defaultRegularPrice={regularPrice}
            defaultSalePrice={salePrice}
            defaultStock={stockQuantity}
          />

          {/* FILTRES DE TAILLES */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#d4af37]">Filtres de Taille</CardTitle>
              <CardDescription>Génère automatiquement les attributs de taille</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Taille Minimum</Label>
                  <Select value={sizeRangeStart?.toString() || "none"} onValueChange={(v) => setSizeRangeStart(v === "none" ? null : parseInt(v))}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {Array.from({ length: 11 }, (_, i) => 34 + (i * 2)).map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Taille Maximum</Label>
                  <Select value={sizeRangeEnd?.toString() || "none"} onValueChange={(v) => setSizeRangeEnd(v === "none" ? null : parseInt(v))}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {Array.from({ length: 11 }, (_, i) => 34 + (i * 2)).map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ATTRIBUTS GÉNÉRAUX */}
          <GeneralAttributesSelector 
            selectedAttributes={selectedAttributes} 
            onAttributesChange={setSelectedAttributes} 
          />
          
          {/* CATÉGORIES HIERARCHIQUES */}
          <HierarchicalCategorySelector 
            selectedCategories={selectedCategories} 
            onCategoriesChange={setSelectedCategories} 
          />

          {/* BOUTONS D'ACTION */}
          <div className="flex justify-end gap-4 pb-12">
            <Link href="/admin/products">
              <Button variant="outline" type="button">Annuler</Button>
            </Link>
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="bg-[#d4af37] hover:bg-[#c19b2f] px-10"
            >
              {saving ? (
                <>Enregistrement...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Créer le produit et ses déclinaisons</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}