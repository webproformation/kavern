import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // On récupère les champs, qu'ils s'appellent 'total' ou 'amount'
    let { orderId, userId, total, amount, metadata } = body;

    // Normalisation : si total est vide mais que amount existe, on l'utilise
    if (total === undefined && amount !== undefined) {
      total = amount;
    }

    // SECURITY: If orderId provided, verify order ownership and amount
    if (orderId) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('total, user_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      }

      if (order.user_id !== userId) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      // Force server-side total
      total = order.total;
    }

    // Validation stricte
    if (!total || !userId) {
      console.error("❌ Données manquantes:", { orderId, userId, total });
      return NextResponse.json(
        { error: `Données manquantes. Reçu: total=${total}, userId=${userId}` },
        { status: 400 }
      );
    }

    // Conversion en centimes
    const amountInCents = Math.round(parseFloat(total) * 100);

    // Création de l'intention Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: orderId ? orderId.toString() : 'n/a',
        userId: userId.toString(),
        ...(metadata || {}),
      },
    });

    // Mise à jour optionnelle de la commande (si orderId est présent)
    if (orderId) {
      await supabase
        .from('orders')
        .update({ stripe_payment_intent: paymentIntent.id })
        .eq('id', orderId);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });

  } catch (error: any) {
    console.error('🚨 Erreur API Stripe:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}