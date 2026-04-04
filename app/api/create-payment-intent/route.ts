import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-12-15.clover' as any,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // AUTH: Vérifier l'utilisateur via le token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    let { orderId, total, amount, metadata } = body;

    // Normalisation : si total est vide mais que amount existe, on l'utilise
    if (total === undefined && amount !== undefined) {
      total = amount;
    }

    // SECURITY: orderId requis pour forcer le total server-side
    if (orderId) {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('total, user_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      }

      // Vérifier ownership via le token, pas via le body
      if (order.user_id !== user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      // Force server-side total
      total = order.total;
    }

    // Validation stricte
    if (!total) {
      return NextResponse.json(
        { error: 'Données manquantes: total requis' },
        { status: 400 }
      );
    }

    // Conversion en centimes
    const amountInCents = Math.round(parseFloat(total) * 100);

    if (isNaN(amountInCents) || amountInCents <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Création de l'intention Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: orderId ? orderId.toString() : 'n/a',
        userId: user.id,
        ...(metadata || {}),
      },
    });

    // Mise à jour optionnelle de la commande
    if (orderId) {
      await supabaseAdmin
        .from('orders')
        .update({ stripe_payment_intent: paymentIntent.id })
        .eq('id', orderId);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });

  } catch (error: any) {
    console.error('Erreur API Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
