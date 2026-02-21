'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Profile {
  id: string; email: string; first_name: string; last_name: string;
  phone: string; avatar_url: string; birth_date: string | null;
  wallet_balance: number; loyalty_euros: number; is_admin: boolean;
  blocked: boolean;
}

interface AuthContextType {
  user: User | null; profile: Profile | null; loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  signUp: any; resetPassword: any; updatePassword: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingProfileRef = useRef(false);
  const dailyLoginCheckedRef = useRef(false); // VERROU ANTI-BOUCLE

  const checkDailyLogin = async (userId: string) => {
    if (dailyLoginCheckedRef.current) return;
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(`login_${userId}`) === today) {
      dailyLoginCheckedRef.current = true;
      return;
    }

    try {
      const { data } = await supabase.rpc('add_loyalty_gain', {
        p_user_id: userId, p_type: 'daily_login', p_base_amount: 0.10, p_description: 'Connexion quotidienne'
      });
      if (data) {
        dailyLoginCheckedRef.current = true;
        localStorage.setItem(`login_${userId}`, today);
        toast.success("Bonus quotidien crédité !");
      }
    } catch (e) { console.error("Login check skipped"); }
  };

  const loadProfile = async (userId: string, force = false) => {
    if (loadingProfileRef.current && !force) return;
    loadingProfileRef.current = true;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
        setProfile(data);
        if (data.blocked) { await signOut(); return; }
        await checkDailyLogin(userId);
      }
    } finally { loadingProfileRef.current = false; }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && event === 'SIGNED_IN') {
        loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        dailyLoginCheckedRef.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data.user) await loadProfile(res.data.user.id);
    return { error: res.error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); dailyLoginCheckedRef.current = false;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile: () => loadProfile(user?.id || '', true), updateProfile: async () => ({error:null}), signUp:null, resetPassword:null, updatePassword:null }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;