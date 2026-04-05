'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Search, Loader2, Clock, CheckCircle2 } from 'lucide-react';

// --- TYPES ---
interface RelayPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  distance?: number;
  openingHours?: any;
  provider: 'mondial-relay' | 'chronopost' | 'gls';
  latitude?: number;
  longitude?: number;
}

interface RelayPointSelectorProps {
  provider: 'mondial-relay' | 'chronopost' | 'gls';
  onSelect: (point: RelayPoint) => void;
  selectedPoint?: RelayPoint | null;
  customerAddress?: {
    postalCode: string;
    city: string;
  };
}

function formatHours(openingHours: any): string {
  if (!openingHours) return '';
  if (typeof openingHours === 'string') return openingHours;
  // Object format from Sendcloud { monday: '09:00-18:00', ... }
  const dayLabels: Record<string, string> = {
    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer', thursday: 'Jeu',
    friday: 'Ven', saturday: 'Sam', sunday: 'Dim',
  };
  return Object.entries(openingHours)
    .filter(([, v]) => v)
    .map(([k, v]) => `${dayLabels[k] || k}: ${v}`)
    .join(' | ');
}

export function RelayPointSelector({ provider, onSelect, selectedPoint, customerAddress }: RelayPointSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchPostalCode, setSearchPostalCode] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const providerNames = {
    'mondial-relay': 'Mondial Relay',
    'chronopost': 'Chronopost Shop2Shop',
    'gls': 'GLS Relais',
  };

  useEffect(() => {
    if (open) {
      const initialZip = customerAddress?.postalCode || '';
      const initialCity = customerAddress?.city || '';
      setSearchPostalCode(initialZip);
      setSearchCity(initialCity);
      if (initialZip && relayPoints.length === 0) {
        setTimeout(() => searchRelayPoints(initialZip), 150);
      }
    }
  }, [open]);

  const searchRelayPoints = async (overrideZip?: string, overrideCity?: string) => {
    const zipToUse = overrideZip !== undefined ? overrideZip : searchPostalCode;
    const cityToUse = overrideCity !== undefined ? overrideCity : searchCity;

    if (!zipToUse) {
      toast.error('Veuillez saisir un code postal');
      return;
    }

    setLoading(true);
    setRelayPoints([]);

    try {
      const response = await fetch(`/api/${provider}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postalCode: zipToUse }),
      });

      const data = await response.json();

      if (data.error && (!data.points || data.points.length === 0)) {
        toast.error(data.error);
        setHasSearched(true);
        return;
      }

      const points: RelayPoint[] = (data.points || []).map((p: any) => ({
        ...p,
        provider: provider,
      }));

      setRelayPoints(points);
      setHasSearched(true);

      if (points.length === 0) {
        toast.info('Aucun point relais trouvé dans cette zone. Essayez un autre code postal.');
      }
    } catch (error: any) {
      console.error('Error searching relay points:', error);
      toast.error('Impossible de récupérer les points relais. Veuillez réessayer.');
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPoint = (point: RelayPoint) => {
    onSelect(point);
    setOpen(false);
    toast.success(`Point relais sélectionné : ${point.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="default"
          className="w-full h-12 bg-[#D4AF37] hover:bg-[#b8933d] text-white text-base font-semibold shadow-md transition-all hover:scale-[1.01] rounded-xl flex items-center justify-center gap-3 border-0"
        >
          <MapPin className="h-5 w-5 text-white flex-shrink-0" />
          {selectedPoint ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-white/80 flex-shrink-0" />
              <span className="truncate">{selectedPoint.name} — {selectedPoint.city}</span>
            </>
          ) : (
            <span>Choisir un point {providerNames[provider]}</span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col z-[9999]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-[#D4AF37]" />
            Choisir votre point relais
          </DialogTitle>
          <DialogDescription>
            {providerNames[provider]} — Saisissez un code postal pour rechercher.
          </DialogDescription>
        </DialogHeader>

        {/* Search form */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            placeholder="Code postal (ex: 59000)"
            value={searchPostalCode}
            onChange={(e) => setSearchPostalCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchRelayPoints()}
            className="flex-1"
          />
          <Input
            placeholder="Ville (optionnel)"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchRelayPoints()}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => searchRelayPoints()}
            disabled={loading}
            className="bg-gradient-to-r from-[#b8933d] to-[#d4af37] hover:from-[#9a7a2f] hover:to-[#b8933d] text-white px-4 flex-shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37] mb-2" />
              <p className="text-sm">Recherche en cours...</p>
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MapPin className="h-10 w-10 opacity-20 mb-2" />
              <p className="text-sm text-center">Entrez votre code postal pour voir les points relais proches.</p>
            </div>
          )}

          {!loading && hasSearched && relayPoints.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search className="h-10 w-10 opacity-20 mb-2" />
              <p className="text-sm text-center">Aucun point relais trouvé.<br />Essayez un code postal voisin.</p>
            </div>
          )}

          {!loading && relayPoints.map((point) => {
            const isSelected = selectedPoint?.id === point.id;
            const hours = formatHours(point.openingHours);
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => handleSelectPoint(point)}
                className={`w-full text-left border rounded-lg p-3 transition-all hover:border-[#D4AF37] hover:bg-[#FFF9F0] ${
                  isSelected ? 'border-[#D4AF37] bg-[#FFF9F0]' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900">{point.name}</span>
                        {point.distance != null && point.distance > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-white">
                            {point.distance > 1000
                              ? `${(point.distance / 1000).toFixed(1)} km`
                              : `${point.distance} m`}
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge className="text-[10px] px-1.5 h-4 bg-[#D4AF37] text-white">Sélectionné</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{point.address}</p>
                      <p className="text-xs text-gray-700 font-medium">{point.postalCode} {point.city}</p>
                      {hours && (
                        <div className="mt-1 flex items-start gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {relayPoints.length > 0 && (
          <p className="flex-shrink-0 text-center text-xs text-gray-400">
            {relayPoints.length} point{relayPoints.length > 1 ? 's' : ''} relais trouvé{relayPoints.length > 1 ? 's' : ''}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
