'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isAbortError } from '@/lib/supabase-error';

export function AppLifecycle() {
  useEffect(() => {
    // Filtre global : silencier les AbortError dans toute la console
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const msg = args.map(a => String(a)).join(' ');
      if (msg.includes('AbortError') || msg.includes('signal is aborted')) return;
      originalConsoleError(...args);
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return;
        const { error } = await supabase.auth.refreshSession();
        if (error && !isAbortError(error)) {
          console.error('[AppLifecycle] Session expirée, refresh impossible');
        }
      } catch (e) {
        if (!isAbortError(e)) console.error('[AppLifecycle] Erreur refresh session:', e);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
