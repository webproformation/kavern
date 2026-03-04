'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AppLifecycle() {
  const router = useRouter();

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Rafraîchit les données sans recharger la page
        router.refresh();

        // Réveille la session Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await supabase.auth.refreshSession();
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [router]);

  return null;
}