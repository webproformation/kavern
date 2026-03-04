'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShoppingBag, ArrowLeft, CreditCard, MapPin, Truck, Wallet, Package, AlertCircle, Info, Gift, Clock, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useOpenPackage } from '@/hooks/use-open-package';
import { useUserCoupons } from '@/hooks/use-user-coupons';
import { PayPalButtons } from '@/components/PayPalButtons';
import { RelayPointSelector } from '@/components/RelayPointSelector';
import PageHeader from '@/components/PageHeader';
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { CUSTOM_TEXTS } from '@/lib/texts';

interface Address {
  id: string;
  label: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  cost: number;
  is_relay: boolean;
  is_active: boolean;
  delivery_time: string;
  type: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
  processing_fee_percentage: number;
  processing_fee_fixed: number;
  type: string;
}

const TVA_RATE = 0.20;
// --- RÈGLE : MINIMUM DE COMMANDE ---
const MIN_ORDER_AMOUNT = 10;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { openPackage, loading: packageLoading } = useOpenPackage();
  const { coupons: userCoupons, loading: couponsLoading, markCouponAsUsed } = useUserCoupons(user?.id);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [relayPointData, setRelayPointData] = useState<any>(null);

  // --- LOGIQUE AVANTAGES & NON-CUMULABILITÉ ---
  const [useLoyalty, setUseLoyalty] = useState(false); // Cagnotte multiplicatrice
  const [loyaltyAmountToUse, setLoyaltyAmountToUse] = useState(0);
  
  const [useWallet, setUseWallet] = useState(false); // Avoirs / Bonus 5€ (Cumulable)
  const [walletAmountToUse, setWalletAmountToUse] = useState(0);

  const [couponCode, setCouponCode] = useState('');
  const [selectedUserCouponId, setSelectedUserCouponId] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<any>(null);
  const [referralDiscount, setReferralDiscount] = useState(0);

  const [addToOpenPackage, setAddToOpenPackage] = useState(false);
  const [notes, setNotes] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [rgpdConsent, setRgpdConsent] = useState(false);
  const [shippingInsurance, setShippingInsurance] = useState('0');
  const [createPendingPackage, setCreatePendingPackage] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadShippingMethods();
      loadPaymentMethods();
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !loading && !isSuccess) {
      router.push('/cart');
    }
  }, [cart, loading, router, isSuccess]);

  // --- RÈGLE : NON-CUMULABILITÉ DES AVANTAGES ---
  // Si on utilise la cagnotte, on annule les remises promo/parrainage
  useEffect(() => {
    if (useLoyalty && loyaltyAmountToUse > 0) {
      setDiscountAmount(0);
      setCouponCode('');
      setSelectedUserCouponId('');
      setReferralDiscount(0);
      setAppliedReferral(null);
    }
  }, [useLoyalty, loyaltyAmountToUse]);

  // Si on applique une remise, on désactive la cagnotte
  useEffect(() => {
    if (discountAmount > 0 || referralDiscount > 0) {
      setUseLoyalty(false);
      setLoyaltyAmountToUse(0);
    }
  }, [discountAmount, referralDiscount]);

  useEffect(() => {
    if (addToOpenPackage) {
      setSelectedShippingMethodId('');
    }
  }, [addToOpenPackage]);

  const loadAddresses = async () => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error loading addresses:', error);
    } else if (data && data.length > 0) {
      setAddresses(data);
      const defaultAddress = data.find((addr: Address) => addr.is_default) || data[0];
      setSelectedAddressId(defaultAddress.id);
    }
  };

  const loadShippingMethods = async () => {
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading shipping methods:', error);
    } else if (data) {
      setShippingMethods(data);
      if (data.length > 0 && !addToOpenPackage) {
        setSelectedShippingMethodId(data[0].id);
      }
    }
  };

  const loadPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading payment methods:', error);
    } else if (data) {
      setPaymentMethods(data);
      if (data.length > 0) {
        setSelectedPaymentMethodId(data[0].id);
      }
    }
  };

  const selectedShippingMethod = shippingMethods.find(m => m.id === selectedShippingMethodId);
  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const isStorePickup = selectedPaymentMethod?.code === 'store_pickup_payment' || selectedPaymentMethod?.type === 'store';

  const subtotal = cartTotal;
  const shippingCost = (addToOpenPackage || isStorePickup) ? 0 : (selectedShippingMethod?.cost || 0);
  const insuranceCost = isStorePickup ? 0 : parseFloat(shippingInsurance);
  
  const paymentFee = selectedPaymentMethod
    ? (subtotal * selectedPaymentMethod.processing_fee_percentage / 100) + selectedPaymentMethod.processing_fee_fixed
    : 0;

  const totalBeforeDiscount = subtotal + shippingCost + insuranceCost + paymentFee;
  
  // Calcul du total après remise exclusive (Promo OU Cagnotte)
  const totalAfterAdvantage = Math.max(0, totalBeforeDiscount - discountAmount - referralDiscount - loyaltyAmountToUse);
  
  // Calcul Final TTC après Avoirs (Toujours cumulable)
  const totalAfterWallet = Math.max(0, totalAfterAdvantage - walletAmountToUse);
  
  const tvaAmount = totalAfterWallet * TVA_RATE / (1 + TVA_RATE);

  // --- RÈGLES DE LIMITES ET MAX ---
  const isGiftCardPayment = selectedPaymentMethod?.type === 'gift_card';
  
  // On ne peut utiliser la cagnotte que si le total reste > 10€ (sauf Carte Cadeau)
  const maxLoyaltyAllowed = isGiftCardPayment 
    ? Math.min(profile?.loyalty_euros || 0, totalBeforeDiscount)
    : Math.min(profile?.loyalty_euros || 0, Math.max(0, totalBeforeDiscount - MIN_ORDER_AMOUNT));

  // L'avoir peut tout couvrir, il n'est pas limité par la règle des 10€
  const maxWalletAllowed = Math.min(profile?.wallet_balance || 0, totalAfterAdvantage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vous devez être connecté pour passer commande');
      router.push('/auth/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    // --- SÉCURITÉ : MINIMUM 10€ PANIER ---
    if (subtotal < MIN_ORDER_AMOUNT) {
      toast.error(`Le montant minimum de commande est de ${MIN_ORDER_AMOUNT}€.`);
      return;
    }

    // --- SÉCURITÉ : MINIMUM 10€ APRÈS RÉDUCTIONS (HORS AVOIRS / CARTE CADEAU) ---
    if (totalAfterAdvantage < MIN_ORDER_AMOUNT && !isGiftCardPayment) {
      toast.error(`Le montant minimum après réductions doit être de ${MIN_ORDER_AMOUNT}€ (hors avoirs ou carte cadeau).`);
      return;
    }

    if (!selectedPaymentMethodId) {
      toast.error('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (!addToOpenPackage && !isStorePickup) {
        if (!selectedShippingMethodId) {
            toast.error('Veuillez sélectionner un mode de livraison');
            return;
        }
        if (!selectedAddressId) {
            toast.error('Veuillez sélectionner une adresse de livraison');
            return;
        }
    }

    if (!rgpdConsent) {
      toast.error('Vous devez accepter la politique de confidentialité');
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `CMD-${Date.now()}`;

      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'pending',
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        tax_amount: tvaAmount.toFixed(2),
        discount_amount: (discountAmount + referralDiscount).toFixed(2),
        wallet_amount_used: (loyaltyAmountToUse + walletAmountToUse).toFixed(2),
        total: totalAfterWallet.toFixed(2),
        shipping_address: isStorePickup ? null : selectedAddress,
        shipping_street: selectedAddress?.address_line1 || '',
        shipping_phone: selectedAddress?.phone || '',
        shipping_method_id: isStorePickup ? null : (selectedShippingMethodId || null),
        payment_method_id: selectedPaymentMethodId,
        relay_point_data: relayPointData,
        insurance_type: (isStorePickup || shippingInsurance === '0') ? 'none' : shippingInsurance === '1.00' ? 'serenity' : 'diamond',
        insurance_cost: insuranceCost,
        coupon_code: couponCode || null,
        notes: notes || null,
        newsletter_consent: newsletterConsent,
        rgpd_consent: rgpdConsent,
        is_open_package: addToOpenPackage,
      };

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => {
        const finalSku = 
          item.sku || 
          item.variationSku || 
          (item.selectedVariation && item.selectedVariation.sku) || 
          (item.variation && item.variation.sku) ||
          (item.attributes && item.attributes.sku) ||
          null;

        const finalVariationData = item.selectedAttributes || item.variation_data || item.attributes || null;
        
        return {
          order_id: newOrder.id,
          product_name: item.name || 'Produit',
          product_slug: item.slug || '',
          product_image: item.image?.sourceUrl || item.variationImage?.sourceUrl || '',
          price: String(item.price || 0),
          quantity: item.quantity || 1,
          variation_data: finalVariationData,
          sku: finalSku 
        };
      });
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (addToOpenPackage && openPackage) {
        await supabase
          .from('open_package_orders')
          .insert([{
            open_package_id: openPackage.id,
            order_id: newOrder.id,
            is_paid: false,
          }]);
      }

      if (createPendingPackage && !addToOpenPackage && !isStorePickup) {
        const openedAt = new Date();
        const closesAt = new Date(openedAt.getTime() + (5 * 24 * 60 * 60 * 1000));

        const { data: newPackage, error: packageError } = await supabase
          .from('open_packages')
          .insert([{
            user_id: user.id,
            status: 'active',
            shipping_cost_paid: shippingCost,
            shipping_method_id: selectedShippingMethodId || null,
            shipping_address_id: selectedAddressId || null,
            opened_at: openedAt.toISOString(),
            closes_at: closesAt.toISOString(),
          }])
          .select()
          .single();

        if (packageError) throw packageError;

        await supabase
          .from('open_package_orders')
          .insert([{
            open_package_id: newPackage.id,
            order_id: newOrder.id,
            is_paid: false,
          }]);
      }

      if (newsletterConsent && profile?.email) {
        await supabase
          .from('newsletter_subscriptions')
          .upsert([{ email: profile.email }], { onConflict: 'email', ignoreDuplicates: true });
      }

      // MISE À JOUR DES SOLDES CLIENT
      if (loyaltyAmountToUse > 0) {
        const newLoyaltyBalance = Math.max(0, (profile?.loyalty_euros || 0) - loyaltyAmountToUse);
        await supabase.from('profiles').update({ loyalty_euros: newLoyaltyBalance }).eq('id', user.id);
      }
      if (walletAmountToUse > 0) {
        const newWalletBalance = Math.max(0, (profile?.wallet_balance || 0) - walletAmountToUse);
        await supabase.from('profiles').update({ wallet_balance: newWalletBalance }).eq('id', user.id);
      }

      if (selectedUserCouponId) {
        await markCouponAsUsed(selectedUserCouponId, newOrder.id);
      }

      if (selectedPaymentMethod?.code === 'stripe' && totalAfterWallet > 0) {
        setCreatedOrderId(newOrder.id);
        setCreatedOrderNumber(orderNumber);
        setShowStripePayment(true);
        setLoading(false);
        return;
      }

      // Si le total est à 0€ (couvert par avoir), on marque directement comme payé
      if (totalAfterWallet === 0) {
        await supabase.from('orders').update({ payment_status: 'paid', status: 'processing' }).eq('id', newOrder.id);
      }

      setIsSuccess(true);
      clearCart();

      toast.success(`Commande ${orderNumber} validée avec succès !`, {
        position: 'bottom-right'
      });
      router.push(`/checkout/confirmation?order_id=${newOrder.id}`);
      
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Erreur lors du traitement de la commande');
      setLoading(false);
    }
  };

  if (showStripePayment && createdOrderId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#F2F2E8] to-[#F2F2E8] py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <button onClick={() => { setShowStripePayment(false); setCreatedOrderId(null); }} className="inline-flex items-center text-gray-600 hover:text-[#D4AF37] transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour au récapitulatif
            </button>
          </div>
          <PageHeader icon={CreditCard} title="Paiement sécurisé" description="Finalisez votre paiement avec Stripe" />
          <div className="max-w-2xl mx-auto mt-8">
            <StripePaymentForm
              orderId={createdOrderId}
              userId={user!.id}
              total={totalAfterWallet}
              onSuccess={async () => {
                await supabase.from('orders').update({ payment_status: 'paid', status: 'processing' }).eq('id', createdOrderId);
                setIsSuccess(true);
                clearCart();
              }}
              customerEmail={profile?.email}
              orderNumber={createdOrderNumber || undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F2F2E8] to-[#F2F2E8] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-[#D4AF37] transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour au panier
          </Link>
        </div>

        <PageHeader icon={ShoppingBag} title="Finaliser ma commande" description="Complétez les informations ci-dessous pour valider votre commande" />
        
        {/* BLOCK 1 : COLIS OUVERT */}
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-4 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 via-[#F2F2E8] to-white shadow-2xl relative overflow-hidden">
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-2xl bg-gradient-to-r from-[#b8933d] to-[#d4af37] bg-clip-text text-transparent">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#b8933d] to-[#d4af37] rounded-full shadow-lg"><Clock className="h-6 w-6 text-white" /></div>
                Mettre ma commande en attente
              </CardTitle>
              <CardDescription className="text-base text-gray-700 ml-15">Payez les frais de livraison maintenant, expédition dans 5 jours.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-start space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-[#D4AF37]/40 shadow-lg">
                <Checkbox id="createPendingPackage" checked={createPendingPackage} onCheckedChange={(checked) => setCreatePendingPackage(checked as boolean)} className="mt-1 border-[#D4AF37] data-[state=checked]:bg-[#D4AF37]" />
                <div className="space-y-3 flex-1">
                  <label htmlFor="createPendingPackage" className="text-base font-semibold leading-none cursor-pointer text-gray-900">Créer un colis en attente pour cette commande</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="space-y-6">
            
            {openPackage && !packageLoading && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-[#D4AF37]" /> Colis ouvert disponible</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="addToOpenPackage" checked={addToOpenPackage} onCheckedChange={(checked) => setAddToOpenPackage(checked as boolean)} />
                    <label htmlFor="addToOpenPackage" className="text-sm font-medium leading-none cursor-pointer">Ajouter au colis ouvert existant</label>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 italic uppercase font-black"><CreditCard className="h-5 w-5 text-[#D4AF37]" /> Mode de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-start space-x-3 border p-4 rounded-lg hover:border-[#D4AF37] transition-colors">
                        <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                        <label htmlFor={`payment-${method.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1 font-bold uppercase text-xs tracking-widest"><span className="text-2xl">{method.icon}</span>{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {!addToOpenPackage && !isStorePickup && (
              <>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 italic uppercase font-black"><Truck className="h-5 w-5 text-[#D4AF37]" /> Mode de livraison</CardTitle></CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedShippingMethodId} onValueChange={setSelectedShippingMethodId}>
                      <div className="space-y-3">
                        {shippingMethods.map((method) => (
                          <div key={method.id} className="flex items-start space-x-3 border p-4 rounded-lg hover:border-[#D4AF37]">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <label htmlFor={method.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between mb-1 font-bold uppercase text-xs tracking-widest"><span>{method.name}</span><span className="text-[#D4AF37]">{method.cost === 0 ? 'Gratuit' : `${method.cost.toFixed(2)} €`}</span></div>
                              <div className="text-sm text-gray-600">{method.description}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    {selectedShippingMethod?.is_relay && (
                      <div className="mt-4"><RelayPointSelector provider={selectedShippingMethod.code as any} onSelect={setRelayPointData} selectedPoint={relayPointData} /></div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 italic uppercase font-black"><MapPin className="h-5 w-5 text-[#D4AF37]" /> Adresse de livraison</CardTitle></CardHeader>
                  <CardContent>
                    {addresses.length > 0 ? (
                      <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <div key={address.id} className="flex items-start space-x-3 border p-4 rounded-lg">
                              <RadioGroupItem value={address.id} id={address.id} />
                              <label htmlFor={address.id} className="flex-1 cursor-pointer font-bold text-xs uppercase">
                                <div>{address.label}</div>
                                <div className="text-gray-500 font-medium">{address.first_name} {address.last_name}</div>
                                <div className="text-gray-500 font-medium">{address.address_line1}, {address.postal_code} {address.city}</div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    ) : (
                      <Button asChild variant="outline" className="w-full rounded-2xl"><Link href="/account/addresses">Ajouter une adresse</Link></Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 italic uppercase font-black"><AlertCircle className="h-5 w-5 text-[#D4AF37]" /> Assurance livraison</CardTitle></CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingInsurance} onValueChange={setShippingInsurance}>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 border p-4 rounded-lg hover:border-[#D4AF37] transition-colors">
                          <RadioGroupItem value="0" id="ins-0" /><label htmlFor="ins-0" className="flex-1 cursor-pointer flex justify-between font-bold text-xs uppercase"><span>Sans assurance</span><span>Gratuit</span></label>
                        </div>
                        <div className="flex items-center space-x-3 border-2 border-[#D4AF37] p-4 rounded-lg bg-amber-50">
                          <RadioGroupItem value="2.90" id="ins-2" /><label htmlFor="ins-2" className="flex-1 cursor-pointer flex justify-between font-black text-xs uppercase text-[#D4AF37]"><span>Protection Diamant</span><span>2,90 €</span></label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </>
            )}

            {/* BLOCK RÉDUCTIONS & FIDÉLITÉ (AVEC RÈGLES DE NON-CUMUL ET DE SÉCURITÉ MINIMUM) */}
            <Card className="border-[#D4AF37]/20 shadow-lg overflow-hidden rounded-[2.5rem]">
              <CardHeader className="bg-black text-white p-8">
                <CardTitle className="flex items-center gap-2 italic font-black uppercase text-2xl tracking-tighter"><Gift className="h-6 w-6 text-[#D4AF37]" /> Réductions & Fidélité</CardTitle>
                <CardDescription className="text-gray-400 font-bold">Un seul avantage exclusif par commande (hors avoirs cumulables).</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                
                {/* 1. Cagnotte Multiplicatrice (Pool de fidélité) */}
                <div className={`p-6 rounded-3xl border-2 transition-all ${useLoyalty ? "border-[#D4AF37] bg-amber-50" : "border-gray-100"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest"><PiggyBank className="h-5 w-5 text-[#D4AF37]" /> Ma Cagnotte Multipliée</div>
                    <Badge className="bg-[#D4AF37] font-black">{profile?.loyalty_euros?.toFixed(2)} € disponible</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Checkbox id="useLoyalty" checked={useLoyalty} disabled={discountAmount > 0 || referralDiscount > 0} onCheckedChange={(checked) => setUseLoyalty(checked as boolean)} className="h-6 w-6 rounded-lg data-[state=checked]:bg-[#D4AF37]" />
                    <div className="flex-1">
                      <Label htmlFor="useLoyalty" className="font-bold text-xs uppercase cursor-pointer">Dépenser mes euros de fidélité</Label>
                      {useLoyalty && (
                        <div className="mt-4 flex gap-2">
                          <Input 
                            type="number" 
                            step="0.01" 
                            max={maxLoyaltyAllowed} 
                            value={loyaltyAmountToUse} 
                            onChange={(e) => setLoyaltyAmountToUse(parseFloat(e.target.value) || 0)} 
                            className="h-12 rounded-xl" 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setLoyaltyAmountToUse(maxLoyaltyAllowed)} 
                            className="rounded-xl font-black text-[10px]"
                          >
                            MAX
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative py-4"><Separator /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">OU</span></div>

                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-widest">Code promo / Parrainage / Coupons gagnés</Label>
                  <div className="flex gap-2">
                    <Input id="coupon" disabled={useLoyalty} value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="VOTRE CODE ICI" className="rounded-xl h-12 font-bold shadow-sm" />
                    <Button type="button" disabled={useLoyalty} className="rounded-xl px-6 font-black uppercase italic tracking-widest bg-black text-white">Appliquer</Button>
                  </div>
                </div>

                <div className="relative py-4"><Separator /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">ET</span></div>

                {/* 2. Avoirs / Bonus 5€ (TOUJOURS CUMULABLE) */}
                <div className="p-6 rounded-3xl border-2 border-green-100 bg-green-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-green-700"><Wallet className="h-5 w-5" /> Avoirs & Cadeaux (Cumulable)</div>
                    <Badge variant="outline" className="text-green-700 border-green-200 font-black">{profile?.wallet_balance?.toFixed(2)} €</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <Checkbox id="useWallet" checked={useWallet} onCheckedChange={(c) => setUseWallet(c as boolean)} className="h-6 w-6 rounded-lg data-[state=checked]:bg-green-600" />
                    <Label htmlFor="useWallet" className="font-bold text-xs uppercase text-green-700 cursor-pointer">Utiliser mes avoirs / bonus de bienvenue</Label>
                    {useWallet && (
                      <Input 
                        type="number" 
                        step="0.01" 
                        max={maxWalletAllowed} 
                        value={walletAmountToUse} 
                        onChange={(e) => setWalletAmountToUse(parseFloat(e.target.value) || 0)} 
                        className="w-24 h-10 ml-auto rounded-xl border-none font-bold shadow-sm" 
                      />
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem]">
              <CardHeader><CardTitle className="italic uppercase font-black">Informations complémentaires</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instructions de livraison ou mot doux..." rows={3} className="rounded-2xl" />
                <div className="space-y-3">
                  <div className="flex items-start space-x-2"><Checkbox id="newsletter" checked={newsletterConsent} onCheckedChange={(c) => setNewsletterConsent(c as boolean)} /><label htmlFor="newsletter" className="text-[10px] font-bold uppercase cursor-pointer">S&apos;abonner à la newsletter d&apos;André</label></div>
                  <div className="flex items-start space-x-2"><Checkbox id="rgpd" checked={rgpdConsent} onCheckedChange={(c) => setRgpdConsent(c as boolean)} /><label htmlFor="rgpd" className="text-[10px] font-black uppercase cursor-pointer"><span className="text-red-500">*</span> J&apos;accepte les CGV & la politique de confidentialité</label></div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] shadow-2xl overflow-hidden border-none">
              <CardHeader className="bg-black text-white p-10">
                <CardTitle className="italic font-black text-3xl uppercase tracking-tighter">Récapitulatif de ma malle</CardTitle>
                <CardDescription className="text-gray-400 font-bold">{cart.length} pépites sélectionnées</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-6 bg-white">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{(parseFloat(item.price) * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-xs font-black uppercase tracking-widest">
                  <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
                  {!addToOpenPackage && !isStorePickup && (<div className="flex justify-between"><span>Livraison</span><span>{shippingCost.toFixed(2)} €</span></div>)}
                  {loyaltyAmountToUse > 0 && (<div className="flex justify-between text-[#D4AF37]"><span>Cagnotte</span><span>-{loyaltyAmountToUse.toFixed(2)} €</span></div>)}
                  {discountAmount > 0 && (<div className="flex justify-between text-blue-600"><span>Remise</span><span>-{discountAmount.toFixed(2)} €</span></div>)}
                  {walletAmountToUse > 0 && (<div className="flex justify-between text-green-600"><span>Avoirs</span><span>-{walletAmountToUse.toFixed(2)} €</span></div>)}
                </div>
                <Separator className="h-1 bg-black" />
                <div className="flex justify-between items-end">
                  <span className="font-black text-xs uppercase tracking-widest">Total TTC</span>
                  <span className="font-black text-5xl text-[#D4AF37] tracking-tighter">{totalAfterWallet.toFixed(2)} €</span>
                </div>

                {/* ALERTES SUR LES MINIMUMS DE COMMANDE */}
                {subtotal < MIN_ORDER_AMOUNT && (
                  <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl border border-red-100 flex gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Commande minimum de {MIN_ORDER_AMOUNT}€ requise pour valider.
                  </div>
                )}
                {subtotal >= MIN_ORDER_AMOUNT && totalAfterAdvantage < MIN_ORDER_AMOUNT && !isGiftCardPayment && (
                  <div className="p-4 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-2xl border border-amber-100 flex gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Le total après réductions (hors avoirs) ne peut descendre sous {MIN_ORDER_AMOUNT}€.
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || !rgpdConsent || subtotal < MIN_ORDER_AMOUNT || (totalAfterAdvantage < MIN_ORDER_AMOUNT && !isGiftCardPayment)} 
                  className="w-full h-16 rounded-[2rem] bg-[#D4AF37] hover:bg-black text-white font-black uppercase tracking-widest shadow-xl transition-all"
                >
                  {loading ? 'Traitement...' : `Confirmer le paiement de ${totalAfterWallet.toFixed(2)} €`}
                </Button>
                <div className="text-center text-[9px] font-black uppercase text-gray-400 mt-4"><AlertCircle className="inline h-3 w-3 mr-1"/> Paiement 100% Sécurisé via Kavern</div>
              </CardContent>
            </Card>

          </div>
        </form>
      </div>
    </div>
  );
}