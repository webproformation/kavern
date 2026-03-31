'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur page produit:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">📦</div>
        <h1 className="text-2xl font-black text-gray-900 uppercase">
          Produit indisponible
        </h1>
        <p className="text-gray-500 text-sm">
          Ce produit n&apos;a pas pu être chargé. Il est peut-être temporairement indisponible.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="outline" className="rounded-2xl">
            Réessayer
          </Button>
          <Button asChild className="rounded-2xl bg-[#d4af37] hover:bg-[#b8933d] text-white">
            <a href="/shop">Voir le catalogue</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
