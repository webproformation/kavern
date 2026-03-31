import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
const { PAYPAL_CLIENT_SECRET, PAYPAL_ENVIRONMENT } = process.env;

const base = PAYPAL_ENVIRONMENT === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const generateAccessToken = async () => {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) return null;
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await response.json();
  return data.access_token;
};

export async function POST(request: Request) {
  try {
    // AUTH: Vérifier que l'utilisateur est authentifié
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orderID, dbOrderId } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: 'orderID requis' }, { status: 400 });
    }

    // Vérifier que la commande appartient à l'utilisateur
    if (dbOrderId) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', dbOrderId)
        .single();

      if (orderErr || !order) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      }

      if (order.user_id !== user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }
    }

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Capture failed' }, { status: 400 });
    }

    // Mettre à jour la commande en DB
    if (dbOrderId) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          paid_at: new Date().toISOString(),
          paypal_order_id: orderID,
          payment_method: 'PayPal',
        })
        .eq('id', dbOrderId);

      if (updateError) {
        console.error('[PayPal] Error updating order:', updateError);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PayPal Capture Error:", error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
