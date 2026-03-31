import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
const { PAYPAL_CLIENT_SECRET, PAYPAL_ENVIRONMENT } = process.env;

const base = PAYPAL_ENVIRONMENT === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com';

// Fonction pour générer un token d'accès PayPal
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
    const { amount, orderId } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    // Validation côté serveur : vérifier que le montant correspond à la commande
    if (orderId) {
      const { data: order } = await supabase
        .from('orders')
        .select('total')
        .eq('id', orderId)
        .single();

      if (order && Math.abs(parseFloat(amount) - parseFloat(order.total)) > 0.02) {
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
            value: amount.toString(), // PayPal veut une string "100.00"
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
            { error: data.message || 'Failed to create order' }, 
            { status: 500 }
        );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PayPal API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}