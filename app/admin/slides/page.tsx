'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ProductMediaSelector } from '@/components/product-media-selector';
import { 
  Plus, 
  Save, 
  X, 
  Edit, 
  Trash2, 
  Loader2, 
  ImageIcon,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MousePointer2
} from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES ---
interface Slide {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  button_text: string;
  button_url: string;
  order_position: number;
  is_active: boolean;
}

const emptySlide: Slide = {
  title: '',
  subtitle: '',
  image_url: '',
  link_url: '',
  button_text: '',
  button_url: '',
  order_position: 0,
  is_active: true,
};

export default function SlidesAdmin() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('home_slides')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Erreur lors du chargement des slides');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingSlide) return;

    if (!editingSlide.image_url) {
      toast.error('Une image est requise');
      return;
    }

    setSaving(true);
    try {
      // Préparation de l'objet complet pour Supabase avec les deux liens
      const slideData = {
        title: editingSlide.title,
        subtitle: editingSlide.subtitle,
        image_url: editingSlide.image_url,
        link_url: editingSlide.link_url,     // LIEN IMAGE COMPLÈTE
        button_text: editingSlide.button_text,
        button_url: editingSlide.button_url, // LIEN BOUTON
        order_position: editingSlide.order_position || 0,
        is_active: editingSlide.is_active,
      };

      if (editingSlide.id) {
        const { error } = await supabase
          .from('home_slides')
          .update(slideData)
          .eq('id', editingSlide.id);
        if (error) throw error;
        toast.success('Slide mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('home_slides')
          .insert([slideData]);
        if (error) throw error;
        toast.success('Slide créé avec succès');
      }

      setEditingSlide(null);
      setIsCreating(false);
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce slide ?')) return;

    try {
      const { error } = await supabase
        .from('home_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Slide supprimé');
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= slides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[newIndex];
    newSlides[newIndex] = temp;

    const updates = newSlides.map((slide, i) => ({
      id: slide.id,
      order_position: i
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('home_slides')
          .update({ order_position: update.order_position })
          .eq('id', update.id);
      }
      setSlides(newSlides);
      toast.success('Ordre mis à jour');
    } catch (error) {
      toast.error('Erreur lors du changement d\'ordre');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Slider</h1>
          <p className="text-gray-500">Configurez les visuels et les liens de la page d'accueil</p>
        </div>
        {!isCreating && !editingSlide && (
          <Button onClick={() => setIsCreating(true)} className="bg-[#D4AF37] hover:bg-[#B8933D]">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un slide
          </Button>
        )}
      </div>

      {/* Formulaire de création / édition */}
      {(isCreating || editingSlide) && (
        <Card className="mb-8 border-2 border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle>{isCreating ? 'Nouveau Slide' : 'Modifier le Slide'}</CardTitle>
            <CardDescription>Remplissez les informations ci-dessous</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du slide</Label>
                  <Input 
                    id="title"
                    value={isCreating ? emptySlide.title : editingSlide?.title}
                    onChange={(e) => isCreating 
                      ? setEditingSlide({ ...emptySlide, title: e.target.value })
                      : setEditingSlide({ ...editingSlide!, title: e.target.value })
                    }
                    placeholder="Titre principal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Sous-titre</Label>
                  <Input 
                    id="subtitle"
                    value={editingSlide?.subtitle}
                    onChange={(e) => setEditingSlide({ ...editingSlide!, subtitle: e.target.value })}
                    placeholder="Petit texte au-dessus du titre"
                  />
                </div>

                {/* --- Rétablissement du 2ème lien (Lien sur le slide complet) --- */}
                <div className="space-y-2">
                  <Label htmlFor="link_url" className="text-[#D4AF37] font-bold flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4" /> Lien du Slide complet (Clic sur l'image)
                  </Label>
                  <Input 
                    id="link_url"
                    value={editingSlide?.link_url}
                    onChange={(e) => setEditingSlide({ ...editingSlide!, link_url: e.target.value })}
                    placeholder="/colis-ouvert"
                    className="border-[#D4AF37]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="button_text">Texte du bouton</Label>
                    <Input 
                      id="button_text"
                      value={editingSlide?.button_text}
                      onChange={(e) => setEditingSlide({ ...editingSlide!, button_text: e.target.value })}
                      placeholder="Découvrir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button_url">Lien du bouton</Label>
                    <Input 
                      id="button_url"
                      value={editingSlide?.button_url}
                      onChange={(e) => setEditingSlide({ ...editingSlide!, button_url: e.target.value })}
                      placeholder="/shop"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Switch 
                    id="active" 
                    checked={editingSlide?.is_active}
                    onCheckedChange={(checked) => setEditingSlide({ ...editingSlide!, is_active: checked })}
                  />
                  <Label htmlFor="active">Slide actif</Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Image du slide</Label>
                {editingSlide?.image_url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <img 
                      src={editingSlide.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => setEditingSlide({ ...editingSlide!, image_url: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <ProductMediaSelector 
                    onSelect={(url) => setEditingSlide({ ...editingSlide!, image_url: url })}
                  >
                    <div className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Choisir une image</span>
                    </div>
                  </ProductMediaSelector>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => { setEditingSlide(null); setIsCreating(false); }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-black hover:bg-gray-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des slides */}
      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="group relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-6">
              {/* Thumbnail */}
              <div className="relative w-40 aspect-video rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={slide.image_url} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {!slide.is_active && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Badge variant="outline" className="bg-white">Inactif</Badge>
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{slide.title}</h3>
                  <Badge variant="secondary" className="text-[10px] font-bold">Pos. {index + 1}</Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                <div className="flex flex-wrap gap-x-4 mt-1">
                  {slide.link_url && (
                    <p className="text-xs text-[#D4AF37] font-medium flex items-center gap-1">
                      <MousePointer2 className="h-3 w-3" /> Image: {slide.link_url}
                    </p>
                  )}
                  {slide.button_url && (
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Bouton: {slide.button_url}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-1 mr-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => { 
                    setEditingSlide(slide); 
                    setIsCreating(false); 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => handleDelete(slide.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {slides.length === 0 && !isCreating && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500 mb-4">Aucun slide configuré</p>
            <Button onClick={() => setIsCreating(true)} variant="outline">
              Créer le premier slide
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}