'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProfilePictureUploadProps {
  currentUrl: string;
  firstName: string;
  lastName: string;
  onUploadComplete: (url: string) => void;
}

export function ProfilePictureUpload({
  currentUrl,
  firstName,
  lastName,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille du fichier ne doit pas dépasser 5 Mo');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }

    try {
      setIsUploading(true);

      // Preview locale immédiate
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload vers Supabase Storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `avatars/${user.id}.${ext}`;

      // Supprimer l'ancien fichier s'il existe
      await supabase.storage.from('media').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Erreur lors de l'upload : " + uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Ajouter un timestamp pour forcer le refresh du cache
      const freshUrl = `${publicUrl}?t=${Date.now()}`;
      setPreviewUrl(freshUrl);
      onUploadComplete(freshUrl);
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-[#b8933d]">
          <AvatarImage src={previewUrl} alt="Photo de profil" />
          <AvatarFallback className="bg-[#b8933d] text-white text-3xl font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Chargement...' : 'Changer la photo'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        JPG, PNG ou GIF. Max 5 Mo.
      </p>
    </div>
  );
}
