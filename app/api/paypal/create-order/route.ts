import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
const { PAYPAL_CLIENT_SECRET, PAYPAL_ENVIRONMENT } = process.env;

const base = PAYPAL_ENVIRONMENT === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    // AUTH: Vérifier l'utilisateur
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { amount, orderId } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    // SECURITY: Si orderId fourni, vérifier ownership et forcer le montant server-side
    let serverAmount = amount;
    if (orderId) {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('total, user_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      }

      if (order.user_id !== user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      // Forcer le total depuis la DB
      serverAmount = order.total;

      if (Math.abs(parseFloat(amount) - parseFloat(order.total)) > 0.02) {
        console.error(`[PayPal] Montant invalide: reçu ${amount}, attendu ${order.total} pour commande ${orderId}`);
        return NextResponse.json(
          { error: 'Le montant ne correspond pas à la commande' },
          { status: 400 }
        );
      }
    }

    const accessToken = await generateAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to generate access token' },
        { status: 500 }
      );
    }

    const url = `${base}/v2/checkout/orders`;
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: parseFloat(serverAmount).toFixed(2),
          },
        },
      ],
    };

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.status !== 201) {
        console.error("PayPal Order Error:", data);
        return NextResponse.json(
            { error: 'Erreur création PayPal' },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PayPal API Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
