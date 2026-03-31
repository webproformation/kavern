import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
// Email envoyé via API route interne

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Erreur de signature webhook' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error('No orderId in session metadata');
          break;
        }

        // --- CORRECTION : Récupération de l'ID du moyen de paiement "Carte Bancaire" ---
        // On cherche le moyen de paiement qui s'appelle 'Carte Bancaire', 'Stripe' ou 'CB'
        // Assurez-vous d'avoir une méthode de ce nom dans votre table payment_methods
        let paymentMethodId = null;
        
        const { data: pmData } = await supabase
          .from('payment_methods')
          .select('id')
          .or('name.ilike.stripe,name.ilike.%carte%,name.ilike.%cb%') // Cherche "Stripe" OU "Carte..." OU "CB..."
          .limit(1)
          .single();

        if (pmData) {
            paymentMethodId = pmData.id;
        }
        // -------------------------------------------------------------------------------

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing', // Déclenche le trigger tr_order_stock_reduction
            paid_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent as string,
            payment_method_id: paymentMethodId, // <--- ON AJOUTE CECI
            // On peut aussi forcer le nom en dur si le champ existe encore :
            payment_method: 'Carte Bancaire' 
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Error updating order payment status:', updateError);
        } else {
          // ... (Le reste du code reste identique : Emails, Cashback, Coupons) ...
          
          const { data: orderDetails } = await supabase
            .from('orders')
            .select(`*, order_items (*, products (name, price)), addresses (street_address, city, postal_code, country), profiles (first_name, last_name, email)`)
            .eq('id', orderId)
            .single();

          if (orderDetails) {
            // ... (Logique coupons utilisés) ...
            if (orderDetails.coupon_code && orderDetails.user_id) {
               // Marquer le coupon comme utilise directement (pas de RPC)
               await supabase.from('user_coupons')
                 .update({ is_used: true, used_at: new Date().toISOString(), order_id: orderId })
                 .eq('user_id', orderDetails.user_id)
                 .eq('is_used', false)
                 .ilike('coupon_code', orderDetails.coupon_code);
            }

            // ... (Envoi Email) ...
            // Envoi email confirmation via API route interne
            if (orderDetails.profiles?.email) {
                try {
                  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kavern.vercel.app';
                  await fetch(`${siteUrl}/api/emails/order-confirmation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                  });
                } catch (emailErr) {
                  console.error('Email sending failed (non-blocking):', emailErr);
                }
            }

            // Cashback & Coupons Croisés
            const userId = session.metadata?.userId;
            if (userId) {
                 const cashbackAmount = Number(orderDetails.total || orderDetails.subtotal) * 0.02;
                 await supabase.rpc('add_loyalty_gain', { p_user_id: userId, p_type: 'order_cashback', p_base_amount: cashbackAmount, p_description: `Cashback commande ${orderDetails.order_number}` });
            }

            // Génération facture auto (sauf colis ouvert — facture à la clôture)
            if (!orderDetails.is_open_package) {
              await supabase.from('invoices').insert({
                order_id: orderId,
                user_id: orderDetails.user_id,
                type: 'invoice',
                subtotal: orderDetails.subtotal,
                tax_amount: orderDetails.tax_amount,
                total: orderDetails.total,
                status: 'paid',
                issued_at: new Date().toISOString(),
              }).then(({ error: invErr }) => {
                if (invErr) console.error('Invoice generation error:', invErr);
                else console.info(`[STRIPE] Facture générée pour commande ${orderDetails.order_number}`);
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // ... (Logique échec inchangée) ...
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}