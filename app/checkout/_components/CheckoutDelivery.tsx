'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Info, Package, MapPin, CheckCircle2, Plus, Truck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { RelayPointSelector } from '@/components/RelayPointSelector';
import { cn } from '@/lib/utils';

interface CheckoutDeliveryProps {
  createPendingPackage: boolean;
  setCreatePendingPackage: (val: boolean) => void;
  openPackage: any;
  packageLoading: boolean;
  addToOpenPackage: boolean;
  setAddToOpenPackage: (val: boolean) => void;
  selectedShippingMethod: any;
  addresses: any[];
  selectedAddressId: string;
  setSelectedAddressId: (val: string) => void;
  selectedAddress: any;
  shippingMethods: any[];
  selectedShippingMethodId: string;
  setSelectedShippingMethodId: (val: string) => void;
  relayPointData: any;
  setRelayPointData: (val: any) => void;
  shippingInsurance: string;
  setShippingInsurance: (val: string) => void;
  isStorePickup: boolean;
}

export function CheckoutDelivery({
  createPendingPackage,
  setCreatePendingPackage,
  openPackage,
  packageLoading,
  addToOpenPackage,
  setAddToOpenPackage,
  selectedShippingMethod,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  selectedAddress,
  shippingMethods,
  selectedShippingMethodId,
  setSelectedShippingMethodId,
  relayPointData,
  setRelayPointData,
  shippingInsurance,
  setShippingInsurance,
  isStorePickup
}: CheckoutDeliveryProps) {
  return (
    <>
      {/* COLIS EN ATTENTE */}
      <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#b8933d]/20 border-l-4 border-[#C6A15B]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-[#C6A15B]" />
            <CardTitle className="text-2xl">Mettre ma commande en attente</CardTitle>
          </div>
          <CardDescription className="text-gray-700 font-medium">
            Payez les frais de livraison maintenant, mais l&apos;expédition sera effectuée dans 5 jours (ou validée manuellement avant).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4 bg-white p-4 rounded-lg border border-gray-200">
            <Checkbox
              id="createPendingPackage"
              checked={createPendingPackage}
              onCheckedChange={(checked) => setCreatePendingPackage(checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-1 flex-1">
              <label
                htmlFor="createPendingPackage"
                className="font-semibold cursor-pointer text-gray-900"
              >
                Créer un colis en attente pour cette commande
              </label>
              {createPendingPackage && (
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><Info className="h-4 w-4 text-[#C6A15B]" /> Les frais de livraison seront payés aujourd&apos;hui.</p>
                  <p className="flex items-center gap-2"><Info className="h-4 w-4 text-[#C6A15B]" /> Expédition automatique dans 5 jours ou manuelle via votre compte.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COLIS OUVERT EXISTANT */}
      {openPackage && !packageLoading && (
        <Card className="border-l-4 border-[#C6A15B]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-[#C6A15B]" />
              <CardTitle className="text-xl">Colis ouvert disponible</CardTitle>
            </div>
            <CardDescription>
              Vous avez un colis ouvert actif. Ajoutez cette commande pour économiser les frais de port !
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="addToOpenPackage"
                checked={addToOpenPackage}
                onCheckedChange={(checked) => setAddToOpenPackage(checked as boolean)}
              />
              <label htmlFor="addToOpenPackage" className="text-sm font-medium leading-none cursor-pointer">
                Ajouter au colis ouvert (économisez {selectedShippingMethod?.cost.toFixed(2) || '0.00'} € de frais de port)
              </label>
            </div>
            {addToOpenPackage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  Cette commande sera ajoutée à votre colis ouvert. Les frais de port ont déjà été payés.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ADRESSE DE LIVRAISON */}
      {!addToOpenPackage && !isStorePickup && (
        <>
          <Card className="border-l-4 border-[#C6A15B]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-[#C6A15B]" />
                <CardTitle className="text-xl">Adresse de livraison</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-3 border p-4 rounded-lg hover:border-[#D4AF37] transition-colors">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900">{address.label || 'Adresse'}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {address.first_name} {address.last_name}<br />
                            {address.address_line1}<br />
                            {address.address_line2 && <>{address.address_line2}<br /></>}
                            {address.postal_code} {address.city}<br />
                            {address.country}<br />
                            Tél: {address.phone}
                          </div>
                          {address.is_default && (
                            <Badge variant="outline" className="mt-2">Par défaut</Badge>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Aucune adresse enregistrée</p>
                  <Button asChild variant="outline">
                    <Link href="/account/addresses">Ajouter une adresse</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MODE DE LIVRAISON ET MONDIAL RELAY */}
          <Card className="border-l-4 border-[#C6A15B]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-[#C6A15B]" />
                <CardTitle className="text-xl">Mode de livraison</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedShippingMethodId} onValueChange={setSelectedShippingMethodId}>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <div key={method.id} className="flex items-start space-x-3 border p-4 rounded-lg hover:border-[#D4AF37] transition-colors">
                      <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                      <label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{method.name}</span>
                          <span className="font-bold text-[#D4AF37]">
                            {method.cost === 0 ? 'Gratuit' : `${method.cost.toFixed(2)} €`}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {method.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Délai: {method.delivery_time}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {selectedShippingMethod?.is_relay && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <RelayPointSelector
                    provider={(() => {
                      const code = selectedShippingMethod.code;
                      if (code === 'mondial_relay') return 'mondial-relay';
                      if (code === 'chronopost_relay') return 'chronopost';
                      if (code === 'gls_relay') return 'gls';
                      return code as 'mondial-relay' | 'chronopost' | 'gls';
                    })()}
                    onSelect={(point) => {
                      setRelayPointData({
                        name: point.name,
                        address: `${point.address}, ${point.postalCode} ${point.city}`,
                        id: point.id,
                        provider: point.provider
                      });
                    }}
                    selectedPoint={relayPointData}
                    customerAddress={selectedAddress ? {
                      postalCode: selectedAddress.postal_code,
                      city: selectedAddress.city
                    } : undefined}
                  />

                  {relayPointData && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800 font-semibold mb-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Point relais sélectionné
                      </p>
                      <p className="text-sm text-green-800">{relayPointData.name}</p>
                      <p className="text-xs text-green-700">{relayPointData.address}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ASSURANCE LIVRAISON */}
      {!addToOpenPackage && selectedShippingMethodId && (
        <Card className="border-l-4 border-[#C6A15B]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#C6A15B]" />
              <CardTitle className="text-xl">Assurance livraison</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup value={shippingInsurance} onValueChange={setShippingInsurance}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 border p-4 rounded-lg hover:border-[#D4AF37] transition-colors">
                  <RadioGroupItem value="0" id="insurance-none" />
                  <label htmlFor="insurance-none" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">Sans assurance</span>
                        <p className="text-sm text-gray-600 mt-1">Pas de protection supplémentaire</p>
                      </div>
                      <span className="font-bold text-[#D4AF37]">Gratuit</span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center space-x-3 border-2 border-[#D4AF37]/40 p-4 rounded-lg bg-gradient-to-br from-[#D4AF37]/5 to-white relative">
                  <RadioGroupItem value="2.90" id="insurance-diamond" />
                  <Badge className="absolute -top-2 right-4 bg-[#C6A15B] text-white px-2 py-0.5 text-xs">Recommandée</Badge>
                  <label htmlFor="insurance-diamond" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#D4AF37]">Protection Diamant Kavern</span>
                        <p className="text-sm text-gray-700 mt-1">Remboursement ou renvoi immédiat sous 48h (Perte/Casse), sans enquête</p>
                      </div>
                      <span className="font-bold text-[#D4AF37] text-lg">2,90 €</span>
                    </div>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </>
  );
}