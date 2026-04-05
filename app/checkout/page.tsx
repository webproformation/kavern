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

// Le numéro de commande est maintenant généré automatiquement
// par le trigger Postgres generate_order_number() à l'insertion.

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
  code?: string;
  provider?: string;
  description: string;
  icon?: string;
  is_active: boolean;
  processing_fee_percentage?: number;
  processing_fee_fixed?: number;
  type?: string;
  config?: any;
}

const DEFAULT_TVA_RATE = 0.20;
const MIN_ORDER_AMOUNT = 10;
const MAX_PACKAGE_WEIGHT_KG = 10;

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
  const [useDifferentBillingAddress, setUseDifferentBillingAddress] = useState(false);
  const [billingAddressId, setBillingAddressId] = useState<string>('');

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

  // --- CARTE CADEAU ---
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(0);
  const [giftCardApplied, setGiftCardApplied] = useState(false);
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardId, setGiftCardId] = useState<string | null>(null);

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

  // ─── Exclusivité stricte : un seul mode de remise par commande ───────────────
  const clearAllDiscounts = () => {
    setUseWallet(false); setWalletAmountToUse(0);
    setUseLoyalty(false); setLoyaltyAmountToUse(0);
    setDiscountAmount(0); setCouponCode(''); setAppliedCoupon(null);
    setSelectedUserCouponId('');
    setReferralDiscount(0); setAppliedReferral(null);
    setGiftCardAmount(0); setGiftCardApplied(false); setGiftCardId(null);
  };

  const handleSetUseWallet = (val: boolean) => {
    if (val) { clearAllDiscounts(); setUseWallet(true); }
    else { setUseWallet(false); setWalletAmountToUse(0); }
  };

  const handleSetUseLoyalty = (val: boolean) => {
    if (val) { clearAllDiscounts(); setUseLoyalty(true); }
    else { setUseLoyalty(false); setLoyaltyAmountToUse(0); }
  };

  const handleSelectUserCoupon = (couponId: string, discount: number) => {
    if (couponId === selectedUserCouponId) {
      setSelectedUserCouponId('');
      setDiscountAmount(0);
    } else {
      clearAllDiscounts();
      setSelectedUserCouponId(couponId);
      setDiscountAmount(discount);
    }
  };

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
  const totalAfterWallet = Math.max(0, totalAfterDiscount - (Number(walletAmountToUse) || 0) - (Number(loyaltyAmountToUse) || 0) - (Number(giftCardAmount) || 0));
  // TVA multi-taux : calculer par produit selon son tva_rate
  const tvaBreakdown: Record<string, { ht: number; tva: number; ttc: number }> = {};
  cart.forEach(item => {
    const rate = (item as any).tva_rate ? parseFloat((item as any).tva_rate) / 100 : DEFAULT_TVA_RATE;
    const ttc = (parseFloat(String(item.price)) || 0) * (item.quantity || 1);
    const ht = ttc / (1 + rate);
    const tva = ttc - ht;
    const key = `${(rate * 100).toFixed(1)}`;
    if (!tvaBreakdown[key]) tvaBreakdown[key] = { ht: 0, tva: 0, ttc: 0 };
    tvaBreakdown[key].ht += ht;
    tvaBreakdown[key].tva += tva;
    tvaBreakdown[key].ttc += ttc;
  });
  // TVA livraison : transport = taux standard 20% en France
  if (shippingCost > 0) {
    const shippingTvaRate = 0.20;
    const shippingHT = shippingCost / (1 + shippingTvaRate);
    const shippingTva = shippingCost - shippingHT;
    const shippingKey = `${(shippingTvaRate * 100).toFixed(1)}`;
    if (!tvaBreakdown[shippingKey]) tvaBreakdown[shippingKey] = { ht: 0, tva: 0, ttc: 0 };
    tvaBreakdown[shippingKey].ht += shippingHT;
    tvaBreakdown[shippingKey].tva += shippingTva;
    tvaBreakdown[shippingKey].ttc += shippingCost;
  }
  const tvaAmount = Object.values(tvaBreakdown).reduce((sum, v) => sum + v.tva, 0);
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

    // Anti-fraude : vérifier que le parrain n'a pas la même adresse postale
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    if (selectedAddr && data.user_id) {
      const { data: referrerAddresses } = await supabase
        .from('addresses')
        .select('address_line1, postal_code')
        .eq('user_id', data.user_id);

      const sameAddress = referrerAddresses?.some(ra =>
        ra.address_line1?.toLowerCase().trim() === selectedAddr.address_line1?.toLowerCase().trim() &&
        ra.postal_code === selectedAddr.postal_code
      );

      if (sameAddress) { toast.error('Le parrain et le filleul ne peuvent pas avoir la même adresse.'); return; }
    }

    clearAllDiscounts();
    setAppliedReferral(data);
    setReferralDiscount(5);
    toast.success('Code parrainage appliqué ! -5€');
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setGiftCardLoading(true);
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('id, code, current_balance, status')
        .eq('code', giftCardCode.trim().toUpperCase())
        .eq('status', 'active')
        .gt('current_balance', 0)
        .maybeSingle();

      if (error || !data) {
        toast.error('Carte cadeau invalide, expirée ou solde épuisé');
        return;
      }

      const amountToUse = Math.min(data.current_balance, totalAfterDiscount);
      clearAllDiscounts();
      setGiftCardCode(giftCardCode);
      setGiftCardAmount(amountToUse);
      setGiftCardApplied(true);
      setGiftCardId(data.id);
      toast.success(`Carte cadeau appliquée ! -${amountToUse.toFixed(2)} €`);
    } catch (err) {
      toast.error('Erreur lors de la vérification');
    } finally {
      setGiftCardLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      // Vérifier le coupon en base
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !coupon) {
        toast.error('Code promo invalide ou expiré');
        return;
      }

      // Vérifier la date de validité
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        toast.error('Ce code promo a expiré');
        return;
      }

      // Vérifier le nombre d'utilisations max
      if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
        toast.error('Ce code promo a atteint son nombre maximal d\'utilisations');
        return;
      }

      // Vérifier le montant minimum d'achat
      if (coupon.min_purchase && subtotal < coupon.min_purchase) {
        toast.error(`Montant minimum requis : ${coupon.min_purchase}€`);
        return;
      }

      // Anti-fraude BIENVENUE : vérifier si l'utilisateur a déjà utilisé ce code
      if (coupon.code === 'BIENVENUE5' && user) {
        const { data: previousUse } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('coupon_code', 'BIENVENUE5')
          .maybeSingle();

        if (previousUse) {
          toast.error('Vous avez déjà utilisé le code BIENVENUE5');
          return;
        }

        // Anti-fraude : vérifier par adresse de livraison ou téléphone
        const selectedAddr = addresses.find(a => a.id === selectedAddressId);
        if (selectedAddr) {
          const { data: addrUse } = await supabase
            .from('orders')
            .select('id')
            .eq('coupon_code', 'BIENVENUE5')
            .or(`shipping_phone.eq.${selectedAddr.phone},shipping_street.eq.${selectedAddr.address_line1}`)
            .maybeSingle();

          if (addrUse) {
            toast.error('Ce code de bienvenue a déjà été utilisé avec cette adresse ou ce téléphone');
            return;
          }
        }
      }

      // Calculer la réduction
      let discount = 0;
      if (coupon.discount_type === 'fixed') {
        discount = Math.min(coupon.discount_value, subtotal);
      } else if (coupon.discount_type === 'percentage') {
        discount = subtotal * (coupon.discount_value / 100);
      }

      // Exclusivité : effacer les autres modes avant d'appliquer
      const savedCode = couponCode;
      clearAllDiscounts();
      setCouponCode(savedCode);
      setDiscountAmount(discount);
      setAppliedCoupon(coupon);
      toast.success(`Code promo appliqué ! -${discount.toFixed(2)}€`);
    } catch (err) {
      toast.error('Erreur lors de la vérification du code');
    }
  };

  const handlePayPalSuccess = async (paypalOrderId: string) => {
    try {
      // Creer la commande en DB (order_number auto via trigger Postgres)
      const itemsForTrigger = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity || 1,
        variation_id: item.variationId || null,
      }));

      const selectedAddress = addresses.find(a => a.id === selectedAddressId);

      const orderData = {
        user_id: user!.id,
        status: 'processing', // Directement processing pour declencher le trigger stock
        items: itemsForTrigger,
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        tax_amount: tvaAmount.toFixed(2),
        discount_amount: (Number(discountAmount) + Number(referralDiscount)).toFixed(2),
        wallet_amount_used: (Number(walletAmountToUse) + Number(loyaltyAmountToUse)).toFixed(2),
        total: totalAfterWallet.toFixed(2),
        shipping_address: selectedAddress || null,
        shipping_street: selectedAddress?.address_line1 || '',
        shipping_phone: selectedAddress?.phone || '',
        shipping_method_id: selectedShippingMethodId || null,
        payment_method_id: selectedPaymentMethodId,
        relay_point_data: relayPointData,
        coupon_code: couponCode || null,
        notes: notes || null,
        newsletter_consent: newsletterConsent,
        rgpd_consent: rgpdConsent,
        paypal_order_id: paypalOrderId,
        payment_method: 'PayPal',
      };

      const { data: newOrder, error: orderError } = await supabase.from('orders').insert([orderData]).select().single();
      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: newOrder.id,
        product_name: item.name || 'Produit',
        product_slug: item.slug || '',
        product_image: item.image?.sourceUrl || item.variationImage?.sourceUrl || '',
        price: String(item.variationPrice || item.price || 0),
        quantity: item.quantity || 1,
        tva_rate: String((item as any).tva_rate || 20),
        variation_data: item.isPack ? { isPack: true, packItems: item.packItems, attributes: item.selectedAttributes } : (item.selectedAttributes || null),
      }));

      await supabase.from('order_items').insert(orderItems);

      const orderNumber = newOrder.order_number;
      clearCart();
      toast.success('Paiement PayPal reussi !');
      router.push(`/checkout/confirmation?order_id=${newOrder.id}`);

      // Exécuter les tâches post-commande (wallet, loyalty, coupon, email...)
      runPostOrderTasks(newOrder.id, orderNumber);
    } catch (err: any) {
      console.error('[PayPal] Erreur creation commande:', err);
      toast.error('Paiement recu mais erreur de creation commande. Contactez le support.');
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    toast.error('Erreur lors du paiement PayPal');
  };

  const runPostOrderTasks = async (orderId: string, orderNumber: string) => {
    try {
      // Envoyer l'email de confirmation de commande
      if (profile?.email) {
        const orderItems = cart.map(item => ({
          image_url: item.image?.sourceUrl || null,
          product_name: item.name,
          sku: item.sku,
          variation_details: item.selectedAttributes,
          quantity: item.quantity,
          price: parseFloat(item.variationPrice || item.price) || 0
        }));

        const { data: { session: emailSession } } = await supabase.auth.getSession();
        fetch('/api/emails/order-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${emailSession?.access_token || ''}`,
          },
          body: JSON.stringify({
            orderId,
            email: profile.email,
            firstName: profile.first_name || 'Client',
            orderNumber,
            items: orderItems,
            total: totalAfterWallet,
            isOpenPackage: addToOpenPackage
          })
        }).catch(() => {});
      }

      if (addToOpenPackage && openPackage) {
        await supabase.from('open_package_orders').insert([{ open_package_id: openPackage.id, order_id: orderId }]);
      }

      if (createPendingPackage && !addToOpenPackage) {
        const openedAt = new Date();
        const closesAt = new Date(openedAt.getTime() + (7 * 24 * 60 * 60 * 1000));
        // Vérifier que l'adresse existe avant de la passer en FK
        const validAddressId = selectedAddressId && selectedAddressId.length > 10 ? selectedAddressId : null;
        const { data: newPackage, error: pkgError } = await supabase.from('open_packages').insert([{
            user_id: user!.id,
            status: 'active',
            shipping_cost_paid: shippingCost,
            shipping_method_id: selectedShippingMethodId || null,
            shipping_address_id: validAddressId,
            opened_at: openedAt.toISOString(),
            closes_at: closesAt.toISOString(),
        }]).select().single();

        if (pkgError) {
          console.error('[Colis Ouvert] Erreur création:', pkgError?.message, '| code:', pkgError?.code, '| details:', pkgError?.details, '| hint:', pkgError?.hint);
          toast.error('Erreur lors de la création du colis ouvert');
        }

        if (newPackage) {
          await supabase.from('open_package_orders').insert([{ open_package_id: newPackage.id, order_id: orderId }]);
        }
      }

      if (newsletterConsent && profile?.email) {
        await supabase.from('newsletter_subscriptions').upsert([{ email: profile.email }], { onConflict: 'email', ignoreDuplicates: true });
      }

      // RÈGLE 1 Sendcloud : commande normale avec expédition immédiate → push vers Sendcloud
      // RÈGLE 2 : Colis Ouvert → ne pas envoyer (la cliente a payé les frais mais on attend la fermeture)
      if (!addToOpenPackage && !createPendingPackage && !isStorePickup && selectedAddress) {
        try {
          const { data: { session: scSession } } = await supabase.auth.getSession();
          fetch('/api/sendcloud/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${scSession?.access_token || ''}`,
            },
            body: JSON.stringify({ orderId }),
          }).catch(e => console.warn('[sendcloud] push failed (non-blocking):', e));
        } catch { /* non-bloquant */ }
      }

      if (useWallet && walletAmountToUse > 0) {
        await supabase.from('profiles').update({ wallet_balance: Math.max(0, (profile?.wallet_balance || 0) - walletAmountToUse) }).eq('id', user!.id);
      }

      if (useLoyalty && loyaltyAmountToUse > 0) {
        await supabase.from('profiles').update({ loyalty_euros: Math.max(0, (profile?.loyalty_euros || 0) - loyaltyAmountToUse) }).eq('id', user!.id);
      }

      if (selectedUserCouponId) await markCouponAsUsed(selectedUserCouponId, orderId);

      // Incrémenter uses_count du coupon manuel (BIENVENUE5, etc.)
      if (appliedCoupon?.id) {
        await supabase.from('coupons').update({
          uses_count: (appliedCoupon.uses_count || 0) + 1
        }).eq('id', appliedCoupon.id);
      }

      if (giftCardApplied && giftCardId && giftCardAmount > 0) {
        // Débit atomique via RPC Postgres (évite race condition)
        await supabase.rpc('debit_gift_card', {
          p_gift_card_id: giftCardId,
          p_amount: giftCardAmount,
          p_order_id: orderId,
        });
      }
    } catch (err) {
      console.error('Post-order tasks error (non-blocking):', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) { toast.error('Vous devez être connecté'); router.push('/auth/login'); return; }
    if (cart.length === 0) { toast.error('Votre panier est vide'); return; }
    if (subtotal < MIN_ORDER_AMOUNT) { toast.error(`Le montant minimum de commande est de ${MIN_ORDER_AMOUNT}€.`); return; }
    if (totalAfterWallet < MIN_ORDER_AMOUNT && totalAfterWallet > 0 && !isGiftCardPayment) { toast.error(`Le montant net à payer doit être d'au moins ${MIN_ORDER_AMOUNT}€. Ajoutez un article pour atteindre ce seuil.`); return; }
    if (!selectedPaymentMethodId) { toast.error('Veuillez sélectionner un mode de paiement'); return; }
    
    if (!addToOpenPackage && !isStorePickup) {
        if (!selectedShippingMethodId) { toast.error('Veuillez sélectionner un mode de livraison'); return; }
        if (!selectedAddressId) { toast.error('Veuillez sélectionner une adresse de livraison'); return; }
    }

    if (!rgpdConsent) { toast.error('Vous devez accepter les CGV et la politique de confidentialité'); return; }

    // Vérification poids max 10kg pour le colis ouvert
    if (addToOpenPackage && openPackage) {
      const cartWeight = cart.reduce((sum, item) => sum + ((item as any).weight || 0.3) * item.quantity, 0);
      // TODO: récupérer le poids existant du colis ouvert depuis les commandes précédentes
      // Pour l'instant on vérifie juste le panier courant
      if (cartWeight > MAX_PACKAGE_WEIGHT_KG) {
        toast.error(`Votre colis dépasse les ${MAX_PACKAGE_WEIGHT_KG} kg (poids max pour un voyage sécurisé). Réduisez la quantité ou fermez votre colis ouvert actuel.`);
        return;
      }
    }

    setLoading(true);

    try {
      // order_number auto via trigger Postgres

      // Calculer le poids total du panier en grammes
      const totalVirtualWeight = Math.round(cart.reduce((sum, item) => sum + ((item as any).weight || 300) * (item.quantity || 1), 0));

      // Préparer les items pour le trigger de décrémentation stock
      const itemsForTrigger = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity || 1,
        variation_id: item.variationId || null,
      }));

      // Déterminer le payment_status selon le mode de paiement
      const isBankTransfer = selectedPaymentMethod?.code === 'bank_transfer' || selectedPaymentMethod?.code === 'virement';
      const isStorePayment = selectedPaymentMethod?.code === 'paiement_boutique' || selectedPaymentMethod?.code === 'store_payment' || selectedPaymentMethod?.type === 'store';
      const initialPaymentStatus = isBankTransfer ? 'pending_transfer' : (isStorePayment ? 'pending_store' : 'pending');

      const orderData = {
        user_id: user.id,
        status: 'pending',
        items: itemsForTrigger,
        payment_status: initialPaymentStatus,
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
        total_virtual_weight: totalVirtualWeight,
        shipping_type: addToOpenPackage ? 'open_package' : 'immediate',
      };

      const { data: newOrder, error: orderError } = await supabase.from('orders').insert([orderData]).select().single();
      if (orderError) throw orderError;

      // order_number généré par le trigger Postgres
      const orderNumber = newOrder.order_number;

      const orderItems = cart.map(item => ({
        order_id: newOrder.id,
        product_name: item.name || 'Produit',
        product_slug: item.slug || '',
        product_image: item.image?.sourceUrl || item.variationImage?.sourceUrl || '',
        price: String(item.variationPrice || item.price || 0),
        quantity: item.quantity || 1,
        tva_rate: String((item as any).tva_rate || 20),
        variation_data: item.isPack ? { isPack: true, packItems: item.packItems, attributes: item.selectedAttributes } : (item.selectedAttributes || null),
      }));

      await supabase.from('order_items').insert(orderItems);

      // --- STRIPE : afficher le formulaire de paiement ---
      // NE PAS appeler runPostOrderTasks ici — attendre le onSuccess Stripe
      if ((selectedPaymentMethod?.code === 'stripe' || selectedPaymentMethod?.provider === 'stripe') && totalAfterWallet > 0) {
        setCreatedOrderId(newOrder.id);
        setCreatedOrderNumber(orderNumber);
        setShowStripePayment(true);
        setLoading(false);
        return;
      }

      // --- TOUS LES AUTRES PAIEMENTS : rediriger immédiatement ---
      clearCart();
      toast.success(`Commande ${orderNumber} validée avec succès !`, { position: 'bottom-right' });
      router.push(`/checkout/confirmation?order_id=${newOrder.id}`);

      runPostOrderTasks(newOrder.id, orderNumber);
      
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
                <StripePaymentForm orderId={createdOrderId} userId={user.id} total={totalAfterWallet} onSuccess={() => { clearCart(); runPostOrderTasks(createdOrderId!, createdOrderNumber || ''); router.push(`/checkout/confirmation?order_id=${createdOrderId}`); }} customerEmail={profile?.email} orderNumber={createdOrderNumber || undefined} />
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

            {/* ADRESSE DE FACTURATION SÉPARÉE */}
            {!isStorePickup && selectedAddressId && (
              <Card className="border-l-4 border-gray-300">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="differentBilling"
                      checked={useDifferentBillingAddress}
                      onChange={(e) => setUseDifferentBillingAddress(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="differentBilling" className="text-sm cursor-pointer">
                      Utiliser une adresse de facturation différente (ex: cadeau)
                    </label>
                  </div>
                  {useDifferentBillingAddress && (
                    <div className="space-y-2">
                      {addresses.filter(a => a.id !== selectedAddressId).map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => setBillingAddressId(addr.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${billingAddressId === addr.id ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <p className="font-semibold text-sm">{addr.first_name} {addr.last_name}</p>
                          <p className="text-xs text-gray-600">{addr.address_line1}, {addr.postal_code} {addr.city}</p>
                        </div>
                      ))}
                      {addresses.filter(a => a.id !== selectedAddressId).length === 0 && (
                        <p className="text-sm text-gray-500">Ajoutez une autre adresse dans votre profil pour l&apos;utiliser ici.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
              setUseWallet={handleSetUseWallet}
              walletAmountToUse={walletAmountToUse}
              setWalletAmountToUse={setWalletAmountToUse}
              maxWalletAllowed={maxWalletAllowed}
              useLoyalty={useLoyalty}
              setUseLoyalty={handleSetUseLoyalty}
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
              onUserCouponSelect={handleSelectUserCoupon}
              userCoupons={userCoupons}
              couponsLoading={couponsLoading}
              subtotal={subtotal}
              referralCode={referralCode}
              setReferralCode={setReferralCode}
              appliedReferral={appliedReferral}
              handleApplyReferral={handleApplyReferral}
              totalAfterDiscount={totalAfterDiscount}
              giftCardCode={giftCardCode}
              setGiftCardCode={setGiftCardCode}
              giftCardAmount={giftCardAmount}
              giftCardApplied={giftCardApplied}
              handleApplyGiftCard={handleApplyGiftCard}
              giftCardLoading={giftCardLoading}
              handleApplyCoupon={handleApplyCoupon}
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
              tvaBreakdown={tvaBreakdown}
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