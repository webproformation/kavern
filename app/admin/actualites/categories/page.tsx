'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Loader2, 
  ChevronUp, 
  ChevronDown,
  Check,
  X,
  LayoutGrid,
  Search,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  display_order: number;
  is_active: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export default function NewsCategoriesAdmin() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#D4AF37',
    display_order: 0,
    is_active: true,
    is_visible: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#D4AF37',
      display_order: categories.length,
      is_active: true,
      is_visible: true
    });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      const now = new Date().toISOString();

      if (editingCategory) {
        const { error } = await supabase
          .from('news_categories')
          .update({
            ...formData,
            updated_at: now
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Catégorie mise à jour avec succès');
      } else {
        const { error } = await supabase
          .from('news_categories')
          .insert([{
            id: crypto.randomUUID(), // AJOUT DE L'ID OBLIGATOIRE
            ...formData,
            created_at: now,
            updated_at: now
          }]);

        if (error) throw error;
        toast.success('Nouvelle catégorie créée');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: articlesCheck, error: checkError } = await supabase
        .from('news_posts')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (articlesCheck && articlesCheck.length > 0) {
        toast.error('Impossible de supprimer : des articles sont encore associés à cette catégorie');
        return;
      }

      const { error } = await supabase
        .from('news_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Catégorie supprimée');
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleStatus = async (category: NewsCategory) => {
    try {
      const { error } = await supabase
        .from('news_categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;
      fetchCategories();
      toast.success(`Catégorie ${category.is_active ? 'désactivée' : 'activée'}`);
    } catch (error: any) {
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentCat = newCategories[index];
    const targetCat = newCategories[targetIndex];

    try {
      const { error: err1 } = await supabase
        .from('news_categories')
        .update({ display_order: targetCat.display_order })
        .eq('id', currentCat.id);

      const { error: err2 } = await supabase
        .from('news_categories')
        .update({ display_order: currentCat.display_order })
        .eq('id', targetCat.id);

      if (err1 || err2) throw err1 || err2;
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors du changement d'ordre");
    }
  };

  const handleEdit = (category: NewsCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#D4AF37',
      display_order: category.display_order,
      is_active: category.is_active,
      is_visible: category.is_visible
    });
    setIsDialogOpen(true);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
              <Tag className="h-8 w-8 text-[#D4AF37]" />
            </div>
            Catégories d'Actualités
          </h1>
          <p className="text-muted-foreground font-medium ml-1">
            Organisez les articles de votre carnet par thématiques
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchCategories}
            className="rounded-xl h-12 w-12 border-2 hover:bg-gray-50 transition-all"
          >
            <RefreshCcw className={cn("h-5 w-5 text-gray-400", loading && "animate-spin")} />
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-[#D4AF37] text-white rounded-2xl h-12 px-6 font-black uppercase text-xs tracking-widest transition-all shadow-lg hover:shadow-[#D4AF37]/20 gap-2">
                <Plus className="h-5 w-5" />
                Nouvelle Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none shadow-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                    {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
                  </DialogTitle>
                  <DialogDescription className="font-medium">
                    Définissez les détails de votre thématique pour le carnet.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-8">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nom de la catégorie</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Tendances Mode"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="h-12 rounded-xl border-2 focus-visible:ring-[#D4AF37] font-bold"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="slug" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Slug (URL)</Label>
                    <Input
                      id="slug"
                      placeholder="tendances-mode"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="h-12 rounded-xl border-2 font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description (Optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez brièvement cette thématique..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px] rounded-xl border-2 resize-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="color" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Couleur Badge</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-14 h-12 p-1 rounded-xl border-2 cursor-pointer"
                        />
                        <Input
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="flex-1 h-12 rounded-xl border-2 font-mono uppercase"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="order" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Position</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="h-12 rounded-xl border-2 font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative",
                          formData.is_active ? "bg-green-500" : "bg-gray-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          formData.is_active ? "left-5" : "left-1"
                        )} />
                      </button>
                      <Label className="text-xs font-black uppercase tracking-widest cursor-pointer">Active</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_visible: !formData.is_visible })}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative",
                          formData.is_visible ? "bg-[#D4AF37]" : "bg-gray-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          formData.is_visible ? "left-5" : "left-1"
                        )} />
                      </button>
                      <Label className="text-xs font-black uppercase tracking-widest cursor-pointer">Visible</Label>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-xl font-bold uppercase text-[10px] tracking-widest"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-[#D4AF37] hover:bg-black text-white rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest transition-all"
                  >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingCategory ? 'Mettre à jour' : 'Créer la catégorie'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
            <Input 
              placeholder="Rechercher une catégorie..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 rounded-2xl border-2 bg-gray-50/50 focus-visible:ring-[#D4AF37] font-medium"
            />
          </div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            {filteredCategories.length} catégories trouvées
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
              <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronisation avec la Kavern...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <div className="p-6 bg-gray-50 rounded-full mb-4">
                <AlertCircle className="h-12 w-12 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase">Aucun résultat</h3>
              <p className="text-gray-400 font-medium max-w-xs mt-2">
                Nous n'avons trouvé aucune catégorie correspondant à votre recherche.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[80px] text-xs font-black uppercase tracking-widest text-gray-400 py-6 pl-8">Ordre</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest text-gray-400 py-6">Thématique</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest text-gray-400 py-6">Badge</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest text-gray-400 py-6 text-center">Statut</TableHead>
                    <TableHead className="text-xs font-black uppercase tracking-widest text-gray-400 py-6 text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category, index) => (
                    <TableRow key={category.id} className="group border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <TableCell className="pl-8">
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            onClick={() => moveOrder(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:text-[#D4AF37] disabled:opacity-0 transition-all"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-black text-gray-400">{category.display_order}</span>
                          <button 
                            onClick={() => moveOrder(index, 'down')}
                            disabled={index === filteredCategories.length - 1}
                            className="p-1 hover:text-[#D4AF37] disabled:opacity-0 transition-all"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <div className="text-base font-black text-gray-900 uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">
                            {category.name}
                          </div>
                          <div className="text-xs font-mono text-gray-400 lowercase bg-gray-100 w-fit px-2 py-0.5 rounded-md">
                            /{category.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          style={{ backgroundColor: `${category.color}15`, color: category.color, borderColor: `${category.color}30` }}
                          className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 shadow-sm"
                        >
                          <div className="w-2 h-2 rounded-full mr-2 shadow-inner" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleStatus(category)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                              category.is_active 
                                ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-100" 
                                : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                            )}
                          >
                            {category.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {category.is_active ? 'Actif' : 'Inactif'}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(category)}
                            className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2.5rem] border-none p-10 shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Supprimer la catégorie ?</AlertDialogTitle>
                                <AlertDialogDescription className="text-base font-medium py-4">
                                  Attention, cette action est irréversible. Toutes les données liées à la catégorie <span className="font-black text-gray-900">"{category.name}"</span> seront impactées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-4">
                                <AlertDialogCancel className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12">Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-red-600 hover:bg-black text-white rounded-2xl h-12 px-8 font-black uppercase text-xs tracking-widest transition-all"
                                >
                                  Confirmer la suppression
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}