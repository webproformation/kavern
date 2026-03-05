'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShoppingBag, ArrowLeft, CreditCard, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useOpenPackage } from '@/hooks/use-open-package';
import { useUserCoupons } from '@/hooks/use-user-coupons';
import PageHeader from '@/components/PageHeader';
import { StripePaymentForm } from '@/components/StripePaymentForm';

// Import de nos composants modulaires
import { CheckoutDelivery } from './_components/CheckoutDelivery';
import { CheckoutPayment } from './_components/CheckoutPayment';
import { CheckoutRewards } from './_components/CheckoutRewards';
import { CheckoutSummary } from './_components/CheckoutSummary';

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

  // --- LOGIQUE AVANTAGES ---
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmountToUse, setWalletAmountToUse] = useState(0);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [loyaltyAmountToUse, setLoyaltyAmountToUse] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [selectedUserCouponId, setSelectedUserCouponId] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<any>(null);
  const [referralDiscount, setReferralDiscount] = useState(0);

  // --- OPTIONS ---
  const [addToOpenPackage, setAddToOpenPackage] = useState(false);
  const [notes, setNotes] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [rgpdConsent, setRgpdConsent] = useState(false);
  const [shippingInsurance, setShippingInsurance] = useState('0');
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
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

  useEffect(() => {
    if (useLoyalty && loyaltyAmountToUse > 0) {
      setDiscountAmount(0);
      setCouponCode('');
      setSelectedUserCouponId('');
      setReferralDiscount(0);
      setAppliedReferral(null);
    }
  }, [useLoyalty, loyaltyAmountToUse]);

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
    const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user?.id).order('is_default', { ascending: false });
    if (error) console.error('Error loading addresses:', error);
    else if (data && data.length > 0) {
      setAddresses(data);
      const defaultAddress = data.find((addr: Address) => addr.is_default) || data[0];
      setSelectedAddressId(defaultAddress.id);
    }
  };

  const loadShippingMethods = async () => {
    const { data, error } = await supabase.from('shipping_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (error) console.error('Error loading shipping methods:', error);
    else if (data) {
      setShippingMethods(data);
      if (data.length > 0 && !addToOpenPackage) setSelectedShippingMethodId(data[0].id);
    }
  };

  const loadPaymentMethods = async () => {
    const { data, error } = await supabase.from('payment_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (error) console.error('Error loading payment methods:', error);
    else if (data) {
      setPaymentMethods(data);
      if (data.length > 0) setSelectedPaymentMethodId(data[0].id);
    }
  };

  const selectedShippingMethod = shippingMethods.find(m => m.id === selectedShippingMethodId);
  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const isStorePickup = selectedPaymentMethod?.type === 'store';

  const subtotal = Number(cartTotal) || 0;
  const shippingCost = addToOpenPackage ? 0 : (Number(selectedShippingMethod?.cost) || 0);
  const insuranceCost = parseFloat(shippingInsurance) || 0;
  const paymentFee = selectedPaymentMethod ? (subtotal * (Number(selectedPaymentMethod.processing_fee_percentage) || 0) / 100) + (Number(selectedPaymentMethod.processing_fee_fixed) || 0) : 0;

  const totalBeforeDiscount = subtotal + shippingCost + insuranceCost + paymentFee;
  const totalAfterDiscount = Math.max(0, totalBeforeDiscount - (Number(discountAmount) || 0) - (Number(referralDiscount) || 0));
  const totalAfterWallet = Math.max(0, totalAfterDiscount - (Number(walletAmountToUse) || 0) - (Number(loyaltyAmountToUse) || 0));
  const tvaAmount = totalAfterWallet * TVA_RATE / (1 + TVA_RATE);
  const totalHT = totalAfterWallet - tvaAmount;

  const isGiftCardPayment = selectedPaymentMethod?.type === 'gift_card';
  const maxLoyaltyAllowed = isGiftCardPayment ? Math.min(profile?.loyalty_euros || 0, totalBeforeDiscount) : Math.min(profile?.loyalty_euros || 0, Math.max(0, totalBeforeDiscount - MIN_ORDER_AMOUNT));
  const maxWalletAllowed = Math.min(profile?.wallet_balance || 0, totalAfterDiscount);

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) { toast.error('Veuillez saisir un code parrainage'); return; }
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
    if (count && count > 0) { toast.error('Le parrainage est réservé aux nouveaux clients.'); return; }
    const { data, error } = await supabase.from('referral_codes').select('id, code, user_id, is_active').eq('code', referralCode.toUpperCase()).eq('is_active', true).maybeSingle();
    if (error || !data) { toast.error('Code invalide ou expiré'); return; }
    if (data.user_id === user?.id) { toast.error('Vous ne pouvez pas utiliser votre propre code'); return; }
    setAppliedReferral(data);
    setReferralDiscount(5);
    toast.success('Code parrainage appliqué ! -5€');
  };

  const handlePayPalSuccess = (orderId: string) => {
    clearCart();
    toast.success('Paiement PayPal réussi !');
    router.push(`/checkout/confirmation?paypal=${orderId}`);
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    toast.error('Erreur lors du paiement PayPal');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) { toast.error('Vous devez être connecté'); router.push('/auth/login'); return; }
    if (cart.length === 0) { toast.error('Votre panier est vide'); return; }
    if (subtotal < MIN_ORDER_AMOUNT) { toast.error(`Le montant minimum de commande est de ${MIN_ORDER_AMOUNT}€.`); return; }
    if (totalAfterDiscount < MIN_ORDER_AMOUNT && !isGiftCardPayment) { toast.error(`Le montant minimum après réductions doit être de ${MIN_ORDER_AMOUNT}€.`); return; }
    if (!selectedPaymentMethodId) { toast.error('Veuillez sélectionner un mode de paiement'); return; }
    
    if (!addToOpenPackage && !isStorePickup) {
        if (!selectedShippingMethodId) { toast.error('Veuillez sélectionner un mode de livraison'); return; }
        if (!selectedAddressId) { toast.error('Veuillez sélectionner une adresse de livraison'); return; }
    }

    if (!rgpdConsent) { toast.error('Vous devez accepter la politique de confidentialité'); return; }

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
        discount_amount: (Number(discountAmount) + Number(referralDiscount)).toFixed(2),
        wallet_amount_used: (Number(walletAmountToUse) + Number(loyaltyAmountToUse)).toFixed(2),
        total: totalAfterWallet.toFixed(2),
        shipping_address: isStorePickup ? null : selectedAddress,
        shipping_street: selectedAddress?.address_line1 || '',
        shipping_phone: selectedAddress?.phone || '',
        shipping_method_id: isStorePickup ? null : (selectedShippingMethodId || null),
        payment_method_id: selectedPaymentMethodId,
        relay_point_data: relayPointData,
        insurance_type: shippingInsurance === '0' ? 'none' : shippingInsurance === '1.00' ? 'serenity' : 'diamond',
        insurance_cost: insuranceCost,
        coupon_code: couponCode || null,
        notes: notes || null,
        newsletter_consent: newsletterConsent,
        rgpd_consent: rgpdConsent,
        is_open_package: addToOpenPackage,
      };

      const { data: newOrder, error: orderError } = await supabase.from('orders').insert([orderData]).select().single();
      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: newOrder.id,
        product_name: item.name || 'Produit',
        product_slug: item.slug || '',
        product_image: item.image?.sourceUrl || item.variationImage?.sourceUrl || '',
        price: String(item.price || 0),
        quantity: item.quantity || 1,
        variation_data: item.isPack ? { isPack: true, packItems: item.packItems, attributes: item.selectedAttributes } : (item.selectedAttributes || null),
      }));

      await supabase.from('order_items').insert(orderItems);

      if (addToOpenPackage && openPackage) {
        await supabase.from('open_package_orders').insert([{ open_package_id: openPackage.id, order_id: newOrder.id, is_paid: false }]);
      }

      if (createPendingPackage && !addToOpenPackage) {
        const openedAt = new Date();
        const closesAt = new Date(openedAt.getTime() + (5 * 24 * 60 * 60 * 1000));
        const { data: newPackage } = await supabase.from('open_packages').insert([{
            user_id: user.id,
            status: 'active',
            shipping_cost_paid: shippingCost,
            shipping_method_id: selectedShippingMethodId || null,
            shipping_address_id: selectedAddressId || null,
            opened_at: openedAt.toISOString(),
            closes_at: closesAt.toISOString(),
        }]).select().single();

        if (newPackage) {
          await supabase.from('open_package_orders').insert([{ open_package_id: newPackage.id, order_id: newOrder.id, is_paid: false }]);
          toast.success('Colis ouvert créé avec succès ! Expédition dans 5 jours.');
        }
      }

      if (newsletterConsent && profile?.email) {
        await supabase.from('newsletter_subscriptions').upsert([{ email: profile.email }], { onConflict: 'email', ignoreDuplicates: true });
      }

      if (useWallet && walletAmountToUse > 0) {
        await supabase.from('profiles').update({ wallet_balance: Math.max(0, (profile?.wallet_balance || 0) - walletAmountToUse) }).eq('id', user.id);
      }

      if (useLoyalty && loyaltyAmountToUse > 0) {
        await supabase.from('profiles').update({ loyalty_euros: Math.max(0, (profile?.loyalty_euros || 0) - loyaltyAmountToUse) }).eq('id', user.id);
      }

      if (selectedUserCouponId) await markCouponAsUsed(selectedUserCouponId, newOrder.id);

      if (selectedPaymentMethod?.code === 'stripe' && totalAfterWallet > 0) {
        setCreatedOrderId(newOrder.id);
        setCreatedOrderNumber(orderNumber);
        setShowStripePayment(true);
        setLoading(false);
        return;
      }

      clearCart();
      toast.success(`Commande ${orderNumber} validée avec succès !`, { position: 'bottom-right' });
      router.push(`/checkout/confirmation?order_id=${newOrder.id}`);
      
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Erreur lors du traitement de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto border-l-4 border-[#C6A15B]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-[#C6A15B]" />
              <CardTitle className="text-xl">Connexion requise</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Vous devez être connecté pour accéder au processus de commande.</p>
            <div className="flex gap-3">
              <Button asChild className="flex-1 bg-[#b8933d] hover:bg-[#a07c2f]"><Link href="/auth/login">Se connecter</Link></Button>
              <Button asChild variant="outline" className="flex-1"><Link href="/auth/register">Créer un compte</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showStripePayment && createdOrderId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-6">
              <button onClick={() => { setShowStripePayment(false); setCreatedOrderId(null); setCreatedOrderNumber(null); }} className="inline-flex items-center text-gray-600 hover:text-[#C6A15B] transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour au récapitulatif
              </button>
            </div>
            <PageHeader icon={CreditCard} title="Paiement sécurisé" description="Finalisez votre paiement avec Stripe" />
            <Card className="border-l-4 border-[#C6A15B]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-[#C6A15B]" />
                  <CardTitle className="text-xl">Saisie de vos coordonnées</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <StripePaymentForm orderId={createdOrderId} userId={user.id} total={totalAfterWallet} onSuccess={() => { clearCart(); router.push(`/checkout/confirmation?order_id=${createdOrderId}`); }} customerEmail={profile?.email} orderNumber={createdOrderNumber || undefined} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="mb-6">
            <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-[#C6A15B] transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour au panier
            </Link>
          </div>

          <PageHeader icon={ShoppingBag} title="Finaliser ma commande" description="Complétez les informations ci-dessous pour valider votre commande" />

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <CheckoutDelivery 
              createPendingPackage={createPendingPackage}
              setCreatePendingPackage={setCreatePendingPackage}
              openPackage={openPackage}
              packageLoading={packageLoading}
              addToOpenPackage={addToOpenPackage}
              setAddToOpenPackage={setAddToOpenPackage}
              selectedShippingMethod={selectedShippingMethod}
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              selectedAddress={selectedAddress}
              shippingMethods={shippingMethods}
              selectedShippingMethodId={selectedShippingMethodId}
              setSelectedShippingMethodId={setSelectedShippingMethodId}
              relayPointData={relayPointData}
              setRelayPointData={setRelayPointData}
              shippingInsurance={shippingInsurance}
              setShippingInsurance={setShippingInsurance}
              isStorePickup={isStorePickup}
            />

            <CheckoutPayment 
              paymentMethods={paymentMethods}
              selectedPaymentMethodId={selectedPaymentMethodId}
              setSelectedPaymentMethodId={setSelectedPaymentMethodId}
              selectedPaymentMethod={selectedPaymentMethod}
              bankDialogOpen={bankDialogOpen}
              setBankDialogOpen={setBankDialogOpen}
            />

            <CheckoutRewards 
              profile={profile}
              useWallet={useWallet}
              setUseWallet={setUseWallet}
              walletAmountToUse={walletAmountToUse}
              setWalletAmountToUse={setWalletAmountToUse}
              maxWalletAllowed={maxWalletAllowed}
              useLoyalty={useLoyalty}
              setUseLoyalty={setUseLoyalty}
              loyaltyAmountToUse={loyaltyAmountToUse}
              setLoyaltyAmountToUse={setLoyaltyAmountToUse}
              maxLoyaltyAllowed={maxLoyaltyAllowed}
              discountAmount={discountAmount}
              setDiscountAmount={setDiscountAmount}
              referralDiscount={referralDiscount}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              selectedUserCouponId={selectedUserCouponId}
              setSelectedUserCouponId={setSelectedUserCouponId}
              userCoupons={userCoupons}
              couponsLoading={couponsLoading}
              subtotal={subtotal}
              referralCode={referralCode}
              setReferralCode={setReferralCode}
              appliedReferral={appliedReferral}
              handleApplyReferral={handleApplyReferral}
              totalAfterDiscount={totalAfterDiscount}
            />

            <CheckoutSummary 
              cart={cart}
              subtotal={subtotal}
              shippingCost={shippingCost}
              addToOpenPackage={addToOpenPackage}
              insuranceCost={insuranceCost}
              paymentFee={paymentFee}
              discountAmount={discountAmount}
              couponCode={couponCode}
              referralDiscount={referralDiscount}
              walletAmountToUse={walletAmountToUse}
              loyaltyAmountToUse={loyaltyAmountToUse}
              totalAfterWallet={totalAfterWallet}
              tvaAmount={tvaAmount}
              totalHT={totalHT}
              notes={notes}
              setNotes={setNotes}
              newsletterConsent={newsletterConsent}
              setNewsletterConsent={setNewsletterConsent}
              rgpdConsent={rgpdConsent}
              setRgpdConsent={setRgpdConsent}
              selectedPaymentMethod={selectedPaymentMethod}
              loading={loading}
              MIN_ORDER_AMOUNT={MIN_ORDER_AMOUNT}
              onPayPalSuccess={handlePayPalSuccess}
              onPayPalError={handlePayPalError}
            />

          </form>
        </div>
      </div>
    </div>
  );
}