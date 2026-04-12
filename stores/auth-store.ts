import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  loyalty_points: number;
  loyalty_euros: number;
  current_tier: number;
  tier_multiplier: number;
  created_at: string;
  is_admin?: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  checkAdmin: () => Promise<void>;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile, isAdmin: profile?.is_admin || false }),

  checkAdmin: async () => {
    const { user } = get();
    if (!user) {
      set({ isAdmin: false });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    set({ isAdmin: profile?.is_admin || false });
  },

  initialize: async () => {
    // NB: Ne pas créer de onAuthStateChange ici — AuthContext gère toutes les transitions
    // et synchronise ce store via setUser/setProfile. Une double subscription causerait
    // des requêtes Supabase dupliquées et des cascades de re-renders en multi-onglets.
    set({ isLoading: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAdmin: false });
  },
}));