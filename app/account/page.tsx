'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { LoyaltyEuroBar } from '@/components/LoyaltyEuroBar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  Loader2, 
  PiggyBank, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

export default function AccountPage() {
  const { updatePassword, refreshProfile } = useAuth();
  
  // Utilisation de Zustand comme source de vérité (Solution Claude AI)
  const { profile, user } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setBirthDate(profile.birth_date || '');
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
    }

    // MÉTHODE INFAILLIBLE : Contournement de tous les caches pour forcer l'image
    const forceFetchAvatar = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
          
        if (data && data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };
    forceFetchAvatar();
  }, [profile, user?.id]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const formatMemberSince = (dateString: string) => {
    try { 
      return format(new Date(dateString), 'd MMMM yyyy', { locale: fr }); 
    } catch { 
      return dateString; 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Le nom et le prénom sont obligatoires');
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading('Enregistrement en cours...');
    
    try {
      // SAUVEGARDE DIRECTE POUR CONTOURNER TOUT BUG DE CONTEXTE
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          birth_date: birthDate || null,
          avatar_url: avatarUrl,
        })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile(); // Force la synchronisation globale
      toast.success('Profil mis à jour avec succès !', { id: toastId });
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsUpdatingPassword(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });

    if (authError) {
      toast.error('Mot de passe actuel incorrect');
      setIsUpdatingPassword(false);
      return;
    }

    const { error } = await updatePassword(newPassword);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Mot de passe mis à jour !');
      setCurrentPassword(''); 
      setNewPassword(''); 
      setConfirmPassword('');
    }
    
    setIsUpdatingPassword(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BANNIÈRE DE BIENVENUE AVEC PHOTO */}
      <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#C6A15B]/10 border border-[#D4AF37]/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="h-16 w-16 rounded-full object-cover border-2 border-[#D4AF37] bg-white flex-shrink-0" 
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#D4AF37] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue, {firstName} !
            </h1>
            <p className="text-gray-700 leading-relaxed mb-1">
              Ici, chaque visite vous rapproche de votre prochaine pépite.
            </p>
            <p className="text-sm text-gray-600">
              Membre depuis le {formatMemberSince(profile.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* PORTE-MONNAIE */}
      <Card className="bg-gradient-to-r from-[#b8933d] to-[#d4af37] border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <PiggyBank className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-tight">Solde du Porte-monnaie</h3>
                <p className="text-sm text-white/90">Utilisable sur vos prochaines commandes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                {((Number(profile.wallet_balance) || 0) + (Number(profile.loyalty_euros) || 0)).toFixed(2)}€
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <LoyaltyEuroBar />

      {/* INFORMATIONS PERSONNELLES */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {profile?.is_admin ? (
              <Link href="/account/admin-invoices" title="Accès Factures Admin">
                <User className="h-5 w-5 text-[#D4AF37] hover:cursor-pointer transition-transform hover:scale-110" />
              </Link>
            ) : (
              <User className="h-5 w-5 text-[#D4AF37]" />
            )}
            <CardTitle className="font-bold uppercase tracking-tight">Informations personnelles</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-center">
              <ProfilePictureUpload 
                currentUrl={avatarUrl} 
                firstName={firstName} 
                lastName={lastName} 
                onUploadComplete={setAvatarUrl} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Prénom *</Label>
                <Input 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                  className="rounded-xl border-gray-200" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Nom *</Label>
                <Input 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                  className="rounded-xl border-gray-200" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    value={profile.email} 
                    disabled 
                    className="pl-10 bg-gray-50 rounded-xl border-gray-200" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="pl-10 rounded-xl border-gray-200" 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Date de naissance</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="date" 
                  value={birthDate} 
                  onChange={(e) => setBirthDate(e.target.value)} 
                  max={getTodayDate()} 
                  className="pl-10 rounded-xl border-gray-200" 
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isUpdating} 
              className="w-full bg-[#D4AF37] hover:bg-black text-white font-bold uppercase rounded-xl h-12 shadow-lg transition-all gap-2"
            >
              {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</> : <><Save className="h-4 w-4" /> Enregistrer</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SÉCURITÉ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#D4AF37]" />
            <CardTitle className="font-bold uppercase tracking-tight">Sécurité</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Mot de passe actuel *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  type={showCurrent ? "text" : "password"} 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  required 
                  className="pl-10 pr-10 rounded-xl border-gray-200" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrent(!showCurrent)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Nouveau mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    className="pl-10 pr-10 rounded-xl border-gray-200" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Confirmer *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input 
                    type={showConfirm ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="pl-10 pr-10 rounded-xl border-gray-200" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isUpdatingPassword} 
              className="w-full bg-[#D4AF37] hover:bg-black text-white font-bold uppercase rounded-xl h-12 shadow-lg gap-2"
            >
              {isUpdatingPassword ? <><Loader2 className="animate-spin h-4 w-4" /> Mise à jour...</> : <><Lock className="h-4 w-4" /> Modifier le mot de passe</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}