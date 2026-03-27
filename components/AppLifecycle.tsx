'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function AppLifecycle() {
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        // Tenter de rafraîchir la session silencieusement
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session valide, rien à faire
          return;
        }

        // Pas de session, tenter un refresh
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('[AppLifecycle] Session expirée, refresh impossible');
        }
      } catch (e) {
        console.error('[AppLifecycle] Erreur refresh session:', e);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
