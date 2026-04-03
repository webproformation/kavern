/**
 * Renvoie true si l'erreur est une AbortError (requête annulée au démontage du composant).
 * Ces erreurs sont normales et ne doivent pas être loggées.
 */
export function isAbortError(error: any): boolean {
  if (!error) return false;
  if (error.name === 'AbortError') return true;
  if (error.message?.includes('AbortError')) return true;
  if (error.details?.includes('AbortError')) return true;
  return false;
}
