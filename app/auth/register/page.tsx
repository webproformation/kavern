'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, Phone, Calendar, AlertCircle, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/PasswordInput';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/account');
    }
  }, [user, authLoading, router]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(
      email,
      password,
      firstName,
      lastName,
      phone,
      birthDate || null
    );

    if (signUpError) {
      setError(signUpError.message || 'Erreur lors de la création du compte');
      setLoading(false);
      return;
    }

    toast.success('Compte créé avec succès!');
    router.push('/account');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-1 pt-10">
          <div className="flex justify-center mb-6">
            <img src="/kavern-logo.png" alt="Logo Kavern" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-3xl font-black text-center uppercase tracking-tighter text-gray-900">
            Rejoindre la KAVERN
          </CardTitle>
          <CardDescription className="text-center font-medium text-gray-500 italic">
            Créez votre compte et commencez votre collection de pépites
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-bold text-gray-700 ml-1">
                  Prénom <span className="text-[#D4AF37]">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Claire"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-bold text-gray-700 ml-1">
                  Nom <span className="text-[#D4AF37]">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-gray-700 ml-1">
                Email <span className="text-[#D4AF37]">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-bold text-gray-700 ml-1">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="font-bold text-gray-700 ml-1">Date de naissance</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={getTodayDate()}
                    className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter ml-1">
                  Une surprise vous attendra le jour J ! 🎁
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="font-bold text-gray-700 ml-1">Code de parrainage</Label>
                <div className="relative">
                  <Gift className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="KAVERN2026"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37] uppercase"
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter ml-1">
                  Profitez d&apos;avantages exclusifs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-gray-700 ml-1">
                  Mot de passe <span className="text-[#D4AF37]">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-10 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold ml-1">8 caractères minimum</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-bold text-gray-700 ml-1">
                  Confirmer <span className="text-[#D4AF37]">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-10 h-12 rounded-xl border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-[#b8933d] to-[#d4af37] hover:from-[#9a7a2f] hover:to-[#b8933d] text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Ouverture de la malle...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>

            <div className="text-center text-sm font-medium text-gray-500 pt-4">
              Déjà membre de la communauté ?{' '}
              <Link
                href="/auth/login"
                className="text-[#D4AF37] hover:text-[#b8933d] font-black underline underline-offset-4 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}