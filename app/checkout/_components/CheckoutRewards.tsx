'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Gift, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutRewardsProps {
  profile: any;
  useWallet: boolean;
  setUseWallet: (val: boolean) => void;
  walletAmountToUse: number;
  setWalletAmountToUse: (val: number) => void;
  maxWalletAllowed: number;
  useLoyalty: boolean;
  setUseLoyalty: (val: boolean) => void;
  loyaltyAmountToUse: number;
  setLoyaltyAmountToUse: (val: number) => void;
  maxLoyaltyAllowed: number;
  discountAmount: number;
  setDiscountAmount: (val: number) => void;
  referralDiscount: number;
  couponCode: string;
  setCouponCode: (val: string) => void;
  selectedUserCouponId: string;
  setSelectedUserCouponId: (val: string) => void;
  userCoupons: any[];
  couponsLoading: boolean;
  subtotal: number;
  referralCode: string;
  setReferralCode: (val: string) => void;
  appliedReferral: any;
  handleApplyReferral: () => Promise<void>;
  totalAfterDiscount: number;
}

export function CheckoutRewards({
  profile,
  useWallet,
  setUseWallet,
  walletAmountToUse,
  setWalletAmountToUse,
  maxWalletAllowed,
  useLoyalty,
  setUseLoyalty,
  loyaltyAmountToUse,
  setLoyaltyAmountToUse,
  maxLoyaltyAllowed,
  discountAmount,
  setDiscountAmount,
  referralDiscount,
  couponCode,
  setCouponCode,
  selectedUserCouponId,
  setSelectedUserCouponId,
  userCoupons,
  couponsLoading,
  subtotal,
  referralCode,
  setReferralCode,
  appliedReferral,
  handleApplyReferral,
  totalAfterDiscount
}: CheckoutRewardsProps) {
  return (
    <Card className="border-l-4 border-[#C6A15B]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Gift className="h-6 w-6 text-[#C6A15B]" />
          <CardTitle className="text-xl">Réductions & Fidélité</CardTitle>
        </div>
        <CardDescription>
          Profitez de vos avantages pour réduire le montant de votre commande
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Porte-monnaie */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#C6A15B]" />
              <Label className="text-base font-semibold">Mon porte-monnaie</Label>
            </div>
            <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37] font-semibold px-3 py-1">
              {(profile?.wallet_balance || 0).toFixed(2)} € disponible
            </Badge>
          </div>

          {(profile?.wallet_balance || 0) > 0 ? (
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#D4AF37] transition-all bg-gray-50">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="useWallet"
                  checked={useWallet}
                  onCheckedChange={(checked) => {
                    setUseWallet(checked as boolean);
                    if (!checked) {
                      setWalletAmountToUse(0);
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="useWallet" className="cursor-pointer">
                    <p className="font-medium text-gray-900">
                      Utiliser mon solde de {(profile?.wallet_balance || 0).toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Économisez jusqu&apos;à {Math.min(profile?.wallet_balance || 0, totalAfterDiscount).toFixed(2)} € sur cette commande
                    </p>
                  </label>

                  {useWallet && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="walletAmount" className="text-sm font-medium text-gray-700">
                        Montant à utiliser
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="walletAmount"
                          type="number"
                          min="0"
                          max={Math.min(profile?.wallet_balance || 0, totalAfterDiscount)}
                          step="0.01"
                          value={walletAmountToUse}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const maxAmount = Math.min(profile?.wallet_balance || 0, totalAfterDiscount);
                            setWalletAmountToUse(Math.min(Math.max(0, value), maxAmount));
                          }}
                          className="flex-1 focus:border-[#C6A15B] focus:ring-[#C6A15B]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const maxAmount = Math.min(profile?.wallet_balance || 0, totalAfterDiscount);
                            setWalletAmountToUse(maxAmount);
                          }}
                          className="border-[#C6A15B] text-[#C6A15B] hover:bg-[#C6A15B] hover:text-white"
                        >
                          Tout utiliser
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Votre porte-monnaie est vide. Gagnez des points lors de vos achats ou en participant à nos jeux !
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Cagnotte fidélité */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-[#C6A15B]" />
              <Label className="text-base font-semibold">Ma cagnotte fidélité</Label>
            </div>
            <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37] font-semibold px-3 py-1">
              {(profile?.loyalty_euros || 0).toFixed(2)} € disponible
            </Badge>
          </div>

          {(profile?.loyalty_euros || 0) > 0 ? (
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#D4AF37] transition-all bg-gray-50">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="useLoyalty"
                  checked={useLoyalty}
                  disabled={discountAmount > 0 || referralDiscount > 0}
                  onCheckedChange={(checked) => {
                    setUseLoyalty(checked as boolean);
                    if (!checked) {
                      setLoyaltyAmountToUse(0);
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="useLoyalty" className="cursor-pointer">
                    <p className="font-medium text-gray-900">
                      Utiliser ma cagnotte de {(profile?.loyalty_euros || 0).toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Économisez jusqu&apos;à {Math.min(profile?.loyalty_euros || 0, Math.max(0, totalAfterDiscount - walletAmountToUse)).toFixed(2)} €
                    </p>
                  </label>

                  {useLoyalty && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="loyaltyAmount" className="text-sm font-medium text-gray-700">
                        Montant à utiliser
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="loyaltyAmount"
                          type="number"
                          min="0"
                          max={Math.min(profile?.loyalty_euros || 0, Math.max(0, totalAfterDiscount - walletAmountToUse))}
                          step="0.01"
                          value={loyaltyAmountToUse}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const afterWallet = Math.max(0, totalAfterDiscount - walletAmountToUse);
                            const maxAmount = Math.min(profile?.loyalty_euros || 0, afterWallet);
                            setLoyaltyAmountToUse(Math.min(Math.max(0, value), maxAmount));
                          }}
                          className="flex-1 focus:border-[#C6A15B] focus:ring-[#C6A15B]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const afterWallet = Math.max(0, totalAfterDiscount - walletAmountToUse);
                            const maxAmount = Math.min(profile?.loyalty_euros || 0, afterWallet);
                            setLoyaltyAmountToUse(maxAmount);
                          }}
                          className="border-[#C6A15B] text-[#C6A15B] hover:bg-[#C6A15B] hover:text-white"
                        >
                          Tout utiliser
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Votre cagnotte est vide. Gagnez des euros en effectuant des achats !
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Coupons gagnés */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-[#C6A15B]" />
            <Label className="text-base font-semibold">Mes coupons gagnés</Label>
          </div>
          
          {couponsLoading ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">Chargement de vos coupons...</p>
            </div>
          ) : userCoupons.length > 0 ? (
            <div className="space-y-3">
              <RadioGroup
                value={selectedUserCouponId}
                onValueChange={(value) => {
                  setSelectedUserCouponId(value);
                  const selectedCoupon = userCoupons.find(c => c.id === value);
                  if (selectedCoupon && selectedCoupon.coupon) {
                    const discount = selectedCoupon.coupon.discount_type === 'percentage'
                      ? (subtotal * selectedCoupon.coupon.discount_value / 100)
                      : Number(selectedCoupon.coupon.discount_value);
                    setDiscountAmount(discount);
                  } else {
                    setDiscountAmount(0);
                  }
                }}
              >
                {userCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-[#D4AF37] transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={coupon.id} id={coupon.id} className="mt-1" />
                      <label htmlFor={coupon.id} className="flex-1 cursor-pointer">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {coupon.coupon?.name || 'Coupon'}
                              </p>
                              <Badge className="bg-[#D4AF37] text-white border-0 text-xs">
                                {coupon.code}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {coupon.coupon?.description || 'Réduction applicable'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Valable jusqu&apos;au {new Date(coupon.valid_until).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#D4AF37]">
                              {coupon.coupon?.discount_type === 'percentage'
                                ? `-${coupon.coupon.discount_value}%`
                                : `-${Number(coupon.coupon?.discount_value || 0).toFixed(2)}€`
                              }
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Vous n&apos;avez pas encore de coupons. Participez à nos jeux pour en gagner !
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Code promo manuel */}
        <div className="space-y-2">
          <Label htmlFor="coupon" className="text-base font-semibold">Code promo</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              disabled={useLoyalty}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Entrez votre code"
              className="focus:border-[#C6A15B] focus:ring-[#C6A15B]"
            />
            <Button
              type="button"
              variant="outline"
              className="border-[#C6A15B] text-[#C6A15B] hover:bg-[#C6A15B] hover:text-white"
              disabled={useLoyalty}
            >
              Appliquer
            </Button>
          </div>
        </div>

        <Separator />

        {/* Parrainage */}
        <div className="space-y-2">
          <Label htmlFor="referralCode" className="text-base font-semibold">Code parrainage</Label>
          <div className="flex gap-2">
            <Input
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Code parrainage (5€ offerts)"
              className="focus:border-[#C6A15B] focus:ring-[#C6A15B]"
            />
            <Button
              type="button"
              variant="outline"
              className="border-[#C6A15B] text-[#C6A15B] hover:bg-[#C6A15B] hover:text-white"
              onClick={handleApplyReferral}
            >
              Appliquer
            </Button>
          </div>
          {appliedReferral && (
            <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
              <Gift className="h-4 w-4" /> Code parrainage appliqué : -5,00 €
            </p>
          )}
        </div>

      </CardContent>
    </Card>
  );
}