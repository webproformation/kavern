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
  ArrowDown
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
  is_active: true
};

// --- COMPOSANT FORMULAIRE ISOLÉ (La clé de la stabilité) ---
// En le mettant ici, on empêche les interférences avec le reste de la page
const SlideForm = ({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData: Slide, 
  onSave: (data: Slide) => Promise<void>, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState<Slide>(initialData);
  const [saving, setSaving] = useState(false);

  // Mise à jour simple des champs texte
  const handleChange = (field: keyof Slide, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast.error("L'image est obligatoire");
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <Card className="border-2 border-[#C6A15B]/20 mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
        <h2 className="font-bold text-lg">
          {formData.id ? 'Modifier le slide' : 'Nouveau slide'}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <CardContent className="p-6 space-y-6">
        {/* GALERIE ROBUSTE */}
        <div className="space-y-3">
          <Label className="font-semibold">Image de fond</Label>
          <div className="bg-gray-50 p-2 rounded-lg border">
            <ProductMediaSelector
              label={formData.image_url ? "Changer l'image" : "Choisir une image"}
              currentImageUrl={formData.image_url}
              onSelect={(url) => handleChange('image_url', url)}
              bucket="media" // Assurez-vous que ce bucket existe et est public
            />
          </div>
        </div>

        {/* CHAMPS TEXTE */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Titre Principal</Label>
            <Input 
              value={formData.title || ''} 
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: NOUVELLE COLLECTION"
              className="font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label>Sous-titre</Label>
            <Input 
              value={formData.subtitle || ''} 
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Ex: Découvrez nos pépites..."
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Texte du bouton</Label>
            <Input 
              value={formData.button_text || ''} 
              onChange={(e) => handleChange('button_text', e.target.value)}
              placeholder="Ex: VOIR TOUT"
            />
          </div>
          <div className="space-y-2">
            <Label>Lien du bouton</Label>
            <Input 
              value={formData.button_url || ''} 
              onChange={(e) => handleChange('button_url', e.target.value)}
              placeholder="Ex: /category/promos"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-lg">
          <div className="w-24">
            <Label>Ordre</Label>
            <Input 
              type="number" 
              value={formData.order_position} 
              onChange={(e) => handleChange('order_position', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch 
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label>Visible sur le site</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving}
            className="bg-[#C6A15B] hover:bg-[#B7933F] text-white min-w-[140px]"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// --- PAGE PRINCIPALE ---
export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('home_slides')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error loading slides:', error);
      toast.error('Erreur chargement des slides');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slideData: Slide) => {
    try {
      // Préparation propre des données
      const cleanData = {
        title: slideData.title || '',
        subtitle: slideData.subtitle || '',
        image_url: slideData.image_url,
        link_url: slideData.link_url || slideData.button_url || '',
        button_text: slideData.button_text || '',
        button_url: slideData.button_url || '',
        order_position: slideData.order_position || 0,
        is_active: slideData.is_active
      };

      if (slideData.id) {
        const { error } = await supabase
          .from('home_slides')
          .update(cleanData)
          .eq('id', slideData.id);
        if (error) throw error;
        toast.success('Slide mis à jour');
      } else {
        const { error } = await supabase
          .from('home_slides')
          .insert(cleanData);
        if (error) throw error;
        toast.success('Slide créé');
      }

      setEditingSlide(null);
      setIsCreating(false);
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce slide ?')) return;
    try {
      const { error } = await supabase.from('home_slides').delete().eq('id', id);
      if (error) throw error;
      toast.success('Slide supprimé');
      loadData();
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C6A15B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Slides d'accueil</h1>
          <p className="text-gray-600">Gérez le carrousel principal de votre boutique</p>
        </div>
        {!editingSlide && !isCreating && (
          <Button 
            onClick={() => { setEditingSlide(emptySlide); setIsCreating(true); }}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Nouveau Slide
          </Button>
        )}
      </div>

      {/* ZONE D'ÉDITION (Si active) */}
      {(isCreating || editingSlide) && (
        <SlideForm 
          initialData={editingSlide || emptySlide}
          onCancel={() => { setEditingSlide(null); setIsCreating(false); }}
          onSave={handleSave}
        />
      )}

      {/* LISTE DES SLIDES */}
      <div className="grid gap-4">
        {slides.map((slide) => (
          <Card key={slide.id} className="group hover:border-blue-300 transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              {/* Image Miniature */}
              <div className="h-20 w-32 bg-gray-100 rounded-md overflow-hidden border shrink-0 relative">
                {slide.image_url ? (
                  <img src={slide.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded">
                  #{slide.order_position}
                </div>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold truncate">{slide.title || 'Sans titre'}</h3>
                  <Badge variant={slide.is_active ? 'default' : 'secondary'}>
                    {slide.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                {slide.button_url && (
                  <p className="text-xs text-blue-600 mt-1 truncate">
                    Lien: {slide.button_url}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => { 
                    setEditingSlide(slide); 
                    setIsCreating(false); 
                    // Scroll automatique vers le haut pour voir le formulaire
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