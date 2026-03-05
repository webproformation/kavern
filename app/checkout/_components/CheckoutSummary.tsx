'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Info, ShoppingBag, AlertCircle, CreditCard as CreditCardIcon, Box, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { PayPalButtons } from '@/components/PayPalButtons';
import { CUSTOM_TEXTS } from '@/lib/texts';

interface CheckoutSummaryProps {
  cart: any[];
  subtotal: number;
  shippingCost: number;
  addToOpenPackage: boolean;
  insuranceCost: number;
  paymentFee: number;
  discountAmount: number;
  couponCode: string;
  referralDiscount: number;
  walletAmountToUse: number;
  loyaltyAmountToUse: number;
  totalAfterWallet: number;
  tvaAmount: number;
  totalHT: number;
  notes: string;
  setNotes: (val: string) => void;
  newsletterConsent: boolean;
  setNewsletterConsent: (val: boolean) => void;
  rgpdConsent: boolean;
  setRgpdConsent: (val: boolean) => void;
  selectedPaymentMethod: any;
  loading: boolean;
  MIN_ORDER_AMOUNT: number;
  onPayPalSuccess: (orderId: string) => void;
  onPayPalError: (error: any) => void;
}

export function CheckoutSummary({
  cart,
  subtotal,
  shippingCost,
  addToOpenPackage,
  insuranceCost,
  paymentFee,
  discountAmount,
  couponCode,
  referralDiscount,
  walletAmountToUse,
  loyaltyAmountToUse,
  totalAfterWallet,
  tvaAmount,
  totalHT,
  notes,
  setNotes,
  newsletterConsent,
  setNewsletterConsent,
  rgpdConsent,
  setRgpdConsent,
  selectedPaymentMethod,
  loading,
  MIN_ORDER_AMOUNT,
  onPayPalSuccess,
  onPayPalError
}: CheckoutSummaryProps) {
  return (
    <>
      {/* NOTES & CONSENTEMENTS */}
      <Card className="border-l-4 border-[#C6A15B]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Info className="h-6 w-6 text-[#C6A15B]" />
            <CardTitle className="text-xl">Informations complémentaires</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes de commande (optionnel)</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Instructions de livraison, précisions, etc." 
              rows={3} 
            />
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="newsletter" 
                checked={newsletterConsent} 
                onCheckedChange={(c) => setNewsletterConsent(c as boolean)} 
              />
              <label htmlFor="newsletter" className="text-sm leading-tight cursor-pointer">
                Je souhaite recevoir les offres et actualités de La Boutique de Morgane
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="rgpd" 
                checked={rgpdConsent} 
                onCheckedChange={(c) => setRgpdConsent(c as boolean)} 
              />
              <label htmlFor="rgpd" className="text-sm leading-tight cursor-pointer">
                <span className="text-red-500">*</span> J&apos;accepte la{' '}
                <Link href="/politique-confidentialite" className="text-[#C6A15B] hover:underline">
                  politique de confidentialité
                </Link>{' '}
                et le traitement de mes données personnelles
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RÉCAPITULATIF FINAL */}
      <Card className="border-l-4 border-[#C6A15B]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-[#C6A15B]" />
            <CardTitle className="text-xl">Récapitulatif</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <div className="text-gray-900 font-semibold">{item.name} × {item.quantity}</div>
                  {item.sku && <div className="text-xs text-gray-500 mt-0.5">Réf: {item.sku}</div>}
                  {/* Affichage du détail des Lots pour le client */}
                  {item.isPack && item.packItems && (
                    <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                      <p className="font-semibold flex items-center gap-1 mb-1"><Box className="h-3 w-3" /> Composition :</p>
                      {item.packItems.map((pItem: any, idx: number) => (
                        <div key={idx} className="flex justify-between"><span>{pItem.name}</span><span>x{pItem.quantity}</span></div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-semibold ml-2">{(parseFloat(item.price || "0") * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Sous-total</span><span className="font-semibold">{subtotal.toFixed(2)} €</span></div>
            {!addToOpenPackage && <div className="flex justify-between text-sm"><span className="text-gray-600">Livraison</span><span className="font-semibold">{shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)} €`}</span></div>}
            {insuranceCost > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Assurance</span><span className="font-semibold">{insuranceCost.toFixed(2)} €</span></div>}
            {paymentFee > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Frais de paiement</span><span className="font-semibold">{paymentFee.toFixed(2)} €</span></div>}
            {discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Remise</span><span className="font-semibold">-{discountAmount.toFixed(2)} €</span></div>}
            {referralDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Parrainage</span><span className="font-semibold">-{referralDiscount.toFixed(2)} €</span></div>}
            {walletAmountToUse > 0 && <div className="flex justify-between text-sm text-purple-600"><span>Avoirs utilisés</span><span className="font-semibold">-{walletAmountToUse.toFixed(2)} €</span></div>}
            {loyaltyAmountToUse > 0 && <div className="flex justify-between text-sm text-[#D4AF37]"><span>Cagnotte utilisée</span><span className="font-semibold">-{loyaltyAmountToUse.toFixed(2)} €</span></div>}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between items-center"><span className="font-bold text-lg">Total TTC</span><span className="font-bold text-2xl text-[#C6A15B]">{totalAfterWallet.toFixed(2)} €</span></div>
            <div className="flex justify-between text-xs text-gray-500"><span>dont TVA (20%)</span><span>{tvaAmount.toFixed(2)} €</span></div>
            <div className="flex justify-between text-xs text-gray-500"><span>Total HT</span><span>{totalHT.toFixed(2)} €</span></div>
          </div>

          <Separator />

          {selectedPaymentMethod?.code === 'paypal' ? (
            <>
              {!rgpdConsent && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm"><AlertCircle className="h-4 w-4 inline mr-1" /> Acceptez les CGV pour continuer.</div>}
              <PayPalButtons amount={totalAfterWallet} disabled={!rgpdConsent || loading || subtotal < MIN_ORDER_AMOUNT} onSuccess={onPayPalSuccess} onError={onPayPalError} />
            </>
          ) : (
            <Button type="submit" disabled={loading || !rgpdConsent || subtotal < MIN_ORDER_AMOUNT} className="w-full bg-[#b8933d] hover:bg-[#a07c2f] text-white h-14 text-lg">
              {loading ? 'Traitement...' : <><CreditCardIcon className="h-5 w-5 mr-2" /> Confirmer le paiement de {totalAfterWallet.toFixed(2)} €</>}
            </Button>
          )}

          <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1 mt-4">
            <ShieldCheck className="h-4 w-4 text-green-600" /> Paiement sécurisé
          </div>
        </CardContent>
      </Card>
    </>
  );
}