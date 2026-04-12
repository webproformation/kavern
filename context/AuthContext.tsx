'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

export interface Profile {
  id: string; 
  email: string; 
  first_name: string; 
  last_name: string;
  phone: string; 
  avatar_url: string; 
  birth_date: string | null;
  wallet_balance: number; 
  loyalty_euros: number; 
  is_admin: boolean;
  is_blocked: boolean;
  blocked: boolean; // alias pour compatibilité
}

interface AuthContextType {
  user: User | null; 
  profile: Profile | null; 
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingProfileRef = useRef(false);
  const dailyLoginCheckedRef = useRef(false);

  const checkDailyLogin = async (userId: string) => {
    if (dailyLoginCheckedRef.current) return;
    const today = new Date().toISOString().split('T')[0];

    // Vérification anniversaire — toujours, indépendamment du bonus quotidien
    const birthdayKey = `birthday_${userId}_${today}`;
    if (!localStorage.getItem(birthdayKey)) {
      try {
        const bdRes = await fetch('/api/auth/check-birthday', { method: 'POST', credentials: 'include' });
        const bdData = await bdRes.json();
        if (bdData.credited) {
          localStorage.setItem(birthdayKey, '1');
          toast.success("🎂 Joyeux anniversaire ! +5€ crédités sur votre cagnotte !");
          try {
            const confetti = (await import('canvas-confetti')).default;
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#D4AF37', '#FF6B9D', '#FFD700', '#FF0000'] });
          } catch {}
        }
      } catch { /* non-bloquant */ }
    }

    if (localStorage.getItem(`login_${userId}`) === today) {
      dailyLoginCheckedRef.current = true;
      return;
    }

    try {
      const { data, error } = await supabase.rpc('record_daily_connection', {
        p_user_id: userId,
      });
      if (error) {
        console.error("Daily login bonus error:", error.message);
        dailyLoginCheckedRef.current = true;
        return;
      }
      dailyLoginCheckedRef.current = true;
      localStorage.setItem(`login_${userId}`, today);
      if (data?.success) {
        toast.success("Bonus quotidien crédité ! +0,10€");
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#D4AF37', '#C6A15B', '#FFD700'] });
        } catch {}
      }
      // Vérification anniversaire déjà faite en début de checkDailyLogin
    } catch (e: any) {
      console.error("Daily login bonus exception:", e.message);
      dailyLoginCheckedRef.current = true;
    }
  };

  const loadProfile = async (userId: string, force = false) => {
    if (loadingProfileRef.current && !force) return;
    loadingProfileRef.current = true;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        // Évite les re-renders inutiles quand les données n'ont pas changé.
        // setProfile avec fonction fonctionnelle : React ne re-rendra que si la référence change.
        setProfile(prev => {
          if (!prev) return data;
          if (
            prev.wallet_balance === data.wallet_balance &&
            prev.loyalty_euros === data.loyalty_euros &&
            prev.is_admin === data.is_admin &&
            prev.is_blocked === data.is_blocked &&
            prev.blocked === data.blocked &&
            prev.first_name === data.first_name &&
            prev.last_name === data.last_name &&
            prev.phone === data.phone
          ) return prev; // Même données → même référence → pas de re-render
          return data;
        });
        useAuthStore.getState().setProfile(data);

        if (data.is_blocked || data.blocked) {
          await signOut();
          return;
        }
        await checkDailyLogin(userId);
      } else {
        // FALLBACK : Le trigger handle_new_user a échoué silencieusement.
        // On crée le profil manuellement depuis les métadonnées auth.
        console.warn('[AuthContext] Profil introuvable pour', userId, '— création fallback');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const meta = authUser.user_metadata || {};
          const { data: newProfile, error: insertErr } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: authUser.email || '',
              full_name: `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || authUser.email || '',
              first_name: meta.first_name || '',
              last_name: meta.last_name || '',
              phone: meta.phone || '',
              avatar_url: '',
              birth_date: meta.birth_date || null,
              wallet_balance: 5.00,
              loyalty_euros: 0,
              current_tier: 1,
              tier_multiplier: 1,
              // is_admin intentionnellement absent : ne jamais écraser une valeur existante
              is_blocked: false,
              cancelled_orders_count: 0,
            }, { onConflict: 'id', ignoreDuplicates: true })
            .select()
            .maybeSingle();

          if (insertErr) {
            console.error('[AuthContext] Fallback profil échoué:', insertErr.message);
          } else if (newProfile) {
            console.info('[AuthContext] Profil créé en fallback avec 5€ de bienvenue');
            setProfile(newProfile);
            useAuthStore.getState().setProfile(newProfile);
            // Envoyer le mail de bienvenue (best-effort)
            fetch('/api/emails/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: authUser.email, firstName: meta.first_name || '' })
            }).catch(() => {});
          }
        }
      }
    } finally {
      loadingProfileRef.current = false;
    }
  };

  useEffect(() => {
    // Déclaré AVANT init() pour que init() puisse mettre à jour le timestamp
    // et éviter le double-chargement quand SIGNED_IN fire juste après getSession().
    let lastProfileLoad = 0;
    const PROFILE_DEBOUNCE_MS = 30000; // 30s entre chaque reload forcé

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        useAuthStore.getState().setUser(session.user);
        await loadProfile(session.user.id);
        lastProfileLoad = Date.now(); // Empêche SIGNED_IN de re-charger dans la foulée
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;

      // Ne setter user que si l'ID change réellement (évite les re-renders inutiles sur TOKEN_REFRESHED)
      if (currentUser?.id !== undefined) {
        setUser(prev => prev?.id === currentUser.id ? prev : currentUser);
        useAuthStore.getState().setUser(currentUser);
      } else if (!currentUser) {
        setUser(null);
        useAuthStore.getState().setUser(null);
      }

      if (currentUser && event === 'SIGNED_IN') {
        // Debounce : init() vient peut-être de charger le profil il y a < 30s
        const now = Date.now();
        if (now - lastProfileLoad > PROFILE_DEBOUNCE_MS) {
          loadProfile(currentUser.id, true);
          lastProfileLoad = now;
        } else {
          lastProfileLoad = now; // On marque quand même pour les events suivants
        }
      } else if (currentUser && event === 'USER_UPDATED') {
        // Mise à jour de l'utilisateur (email, métadonnées) — recharger le profil
        const now = Date.now();
        if (now - lastProfileLoad > PROFILE_DEBOUNCE_MS) {
          loadProfile(currentUser.id, true);
          lastProfileLoad = now;
        }
        // TOKEN_REFRESHED : intentionnellement ignoré — seul le JWT change, pas le profil.
        // Le Web Locks API dans supabase.ts garantit qu'un seul onglet rafraîchit à la fois.
      } else if (event === 'SIGNED_OUT') {
        // Vérifier que c'est bien un vrai sign-out (pas un glitch multi-onglet)
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
          if (currentSession?.user) {
            // Faux SIGNED_OUT (multi-onglet) — ne rien faire, onAuthStateChange reviendra
            setUser(currentSession.user);
            useAuthStore.getState().setUser(currentSession.user);
          } else {
            // Vrai sign-out
            setProfile(null);
            useAuthStore.getState().setProfile(null);
            dailyLoginCheckedRef.current = false;
          }
        }).catch(() => {
          setProfile(null);
          useAuthStore.getState().setProfile(null);
          dailyLoginCheckedRef.current = false;
        });
      }
    });

    // NB: le visibilitychange a été supprimé — il causait une tempête de requêtes Supabase
    // en multi-onglets (TOKEN_REFRESHED + visibilitychange = cascade de re-renders bloquants).
    // onAuthStateChange gère déjà TOKEN_REFRESHED entre onglets.

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data.user) {
      await loadProfile(res.data.user.id, true);
    }
    return { error: res.error };
  };

  const signOut = async () => {
    // Nettoyer le panier et la wishlist localStorage AVANT déconnexion (évite fuite entre comptes)
    try {
      localStorage.removeItem('kavern_cart');
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
    } catch {}

    // scope:'local' efface la session locale sans appel API — évite le 403 si le token est expiré
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {}

    // Force le nettoyage d'état même si l'appel API a échoué
    setUser(null);
    setProfile(null);
    useAuthStore.getState().signOut();
    dailyLoginCheckedRef.current = false;
    window.dispatchEvent(new Event('kavern:logout'));
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error("Utilisateur non connecté") };
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);
      
    if (!error) {
      await loadProfile(user.id, true);
    }
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    // On force l'objet metadata pour éviter l'erreur "cannot unmarshal string"
    return await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signIn, 
      signOut, 
      refreshProfile: () => loadProfile(user?.id || '', true), 
      updateProfile, 
      updatePassword, 
      signUp, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};