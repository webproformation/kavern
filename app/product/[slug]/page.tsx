"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Loader2, 
  ExternalLink,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminProductEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // --- ÉTAT DU PRODUIT ---
  const [product, setProduct] = useState<any>({
    name: "",
    slug: "",
    regular_price: 0,
    sale_price: null,
    stock_quantity: 0,
    short_description: "",
    description: "",
    andre_review: "",
    video_url: "",
    image_url: "",
    gallery_images: [],
    status: "publish",
    is_featured: false,
    related_product_ids: []
  });

  // --- ÉTATS AUXILIAIRES ---
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id) loadInitialData();
  }, [id]);

  async function loadInitialData() {
    setLoading(true);
    try {
      // 1. Charger le produit
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (prodError) throw prodError;
      setProduct(prodData);

      // 2. Charger les catégories du produit
      const { data: mappingData } = await supabase
        .from("product_category_mapping")
        .select("category_id")
        .eq("product_id", id);
      setSelectedCategories(mappingData?.map(m => m.category_id) || []);

      // 3. Charger toutes les catégories disponibles
      const { data: cats } = await supabase.from("categories").select("*").order("name");
      setCategories(cats || []);

      // 4. Charger les autres produits pour le Cross-selling
      const { data: prods } = await supabase.from("products").select("id, name").neq("id", id);
      setAllProducts(prods || []);

    } catch (error: any) {
      console.error("Erreur chargement admin:", error);
      toast.error("Impossible de charger la pépite");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Mise à jour de la table products
      const { error: updateError } = await supabase
        .from("products")
        .update({
          ...product,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // 2. Mise à jour des catégories (Mapping)
      // On supprime l'ancien mapping
      await supabase.from("product_category_mapping").delete().eq("product_id", id);
      
      // On insère le nouveau
      if (selectedCategories.length > 0) {
        const newMappings = selectedCategories.map(catId => ({
          product_id: id,
          category_id: catId
        }));
        await supabase.from("product_category_mapping").insert(newMappings);
      }

      toast.success("Modifications enregistrées !");
    } catch (error: any) {
      console.error("Erreur sauvegarde:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-[#b8933d]" />
      <p className="text-gray-500 font-medium">Chargement de la fiche...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* HEADER FIXE */}
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/products"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Modifier : {product.name}</h1>
              <p className="text-xs text-gray-400 font-mono">ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" asChild className="hidden sm:flex">
               <Link href={`/product/${product.slug}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> Voir sur le site</Link>
             </Button>
             <Button 
               onClick={handleSave} 
               disabled={saving}
               className="bg-[#b8933d] hover:bg-[#D4AF37] text-white px-8 font-bold"
             >
               {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
               ENREGISTRER
             </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
            <TabsTrigger value="general" className="rounded-lg font-bold px-6">Informations</TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg font-bold px-6">Médias</TabsTrigger>
            <TabsTrigger value="logic" className="rounded-lg font-bold px-6">Catégories & Suggestions</TabsTrigger>
          </TabsList>

          {/* ONGLET GÉNÉRAL */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b py-4"><CardTitle className="text-sm uppercase tracking-widest font-black text-gray-400">Détails Principaux</CardTitle></CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la pépite</Label>
                      <Input id="name" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} className="h-12 text-lg font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL unique)</Label>
                      <Input id="slug" value={product.slug} onChange={(e) => setProduct({...product, slug: e.target.value})} className="font-mono text-xs bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="short">Accroche (Description courte)</Label>
                      <Input id="short" value={product.short_description || ""} onChange={(e) => setProduct({...product, short_description: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description complète (HTML)</Label>
                      <Textarea id="desc" value={product.description || ""} onChange={(e) => setProduct({...product, description: e.target.value})} className="min-h-[200px]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm overflow-hidden border-l-4 border-[#b8933d]">
                  <CardHeader className="py-4"><CardTitle className="text-sm font-black flex items-center gap-2 text-[#b8933d]"><Sparkles className="h-4 w-4" /> L'AVIS D'ANDRÉ</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    <Textarea value={product.andre_review || ""} onChange={(e) => setProduct({...product, andre_review: e.target.value})} placeholder="Qu'est-ce qui rend cette pièce unique ?" className="italic text-gray-700 min-h-[100px]" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b py-4"><CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Prix & Stock</CardTitle></CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix régulier (€)</Label>
                      <Input id="price" type="number" step="0.01" value={product.regular_price} onChange={(e) => setProduct({...product, regular_price: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sale">Prix Promo (€)</Label>
                      <Input id="sale" type="number" step="0.01" value={product.sale_price || ""} onChange={(e) => setProduct({...product, sale_price: e.target.value ? parseFloat(e.target.value) : null})} className="text-red-600 font-bold" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="stock">Quantité en stock</Label>
                      <Input id="stock" type="number" value={product.stock_quantity} onChange={(e) => setProduct({...product, stock_quantity: parseInt(e.target.value)})} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b py-4"><CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Options</CardTitle></CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer" htmlFor="featured">Mise en vedette ⭐</Label>
                      <Switch id="featured" checked={product.is_featured} onCheckedChange={(c) => setProduct({...product, is_featured: c})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer" htmlFor="status">Produit publié ✅</Label>
                      <Switch id="status" checked={product.status === "publish"} onCheckedChange={(c) => setProduct({...product, status: c ? "publish" : "draft"})} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ONGLET MÉDIAS */}
          <TabsContent value="media" className="space-y-6">
             <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image Principale (URL)</Label>
                    <div className="flex gap-4">
                      <Input value={product.image_url} onChange={(e) => setProduct({...product, image_url: e.target.value})} className="flex-1" placeholder="https://..." />
                      {product.image_url && <div className="h-12 w-12 rounded-lg border overflow-hidden"><img src={product.image_url} className="h-full w-full object-cover" /></div>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> Galerie d'images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {product.gallery_images?.map((url: string, index: number) => (
                        <div key={index} className="relative group aspect-square rounded-xl border overflow-hidden">
                           <img src={url} className="h-full w-full object-cover" />
                           <button 
                             onClick={() => setProduct({...product, gallery_images: product.gallery_images.filter((_:any, i:any) => i !== index)})}
                             className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <Trash2 className="h-3 w-3" />
                           </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const url = prompt("URL de l'image :");
                          if (url) setProduct({...product, gallery_images: [...(product.gallery_images || []), url]});
                        }}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#b8933d] hover:text-[#b8933d] transition-all"
                      >
                        <Plus className="h-6 w-6" />
                        <span className="text-[10px] font-bold">Ajouter</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <Label className="font-bold flex items-center gap-2">URL Vidéo (Youtube/Reels)</Label>
                    <Input value={product.video_url || ""} onChange={(e) => setProduct({...product, video_url: e.target.value})} placeholder="https://..." />
                  </div>
                </CardContent>
             </Card>
          </TabsContent>

          {/* ONGLET LOGIQUE */}
          <TabsContent value="logic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader className="border-b py-4"><CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Catégories</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center space-x-2 py-2 border-b border-gray-50 last:border-0">
                        <Switch 
                          checked={selectedCategories.includes(cat.id)} 
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedCategories([...selectedCategories, cat.id]);
                            else setSelectedCategories(selectedCategories.filter(cid => cid !== cat.id));
                          }}
                        />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader className="border-b py-4"><CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Suggestions André (Cross-Selling)</CardTitle></CardHeader>
                <CardContent className="p-6">
                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {allProducts.map(p => (
                      <div key={p.id} className="flex items-center space-x-2 py-2 border-b border-gray-50 last:border-0">
                        <Switch 
                          checked={product.related_product_ids?.includes(p.id)} 
                          onCheckedChange={(checked) => {
                            const ids = [...(product.related_product_ids || [])];
                            if (checked) ids.push(p.id);
                            else {
                               const idx = ids.indexOf(p.id);
                               if (idx > -1) ids.splice(idx, 1);
                            }
                            setProduct({...product, related_product_ids: ids});
                          }}
                        />
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}