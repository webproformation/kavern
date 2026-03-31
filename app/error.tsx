'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur application:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-black text-gray-900 uppercase">
          Oops, une erreur est survenue
        </h1>
        <p className="text-gray-500 text-sm">
          Pas de panique ! Essayez de rafraîchir la page ou revenez à l&apos;accueil.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="outline" className="rounded-2xl">
            Réessayer
          </Button>
          <Button asChild className="rounded-2xl bg-[#d4af37] hover:bg-[#b8933d] text-white">
            <a href="/">Retour à l&apos;accueil</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
