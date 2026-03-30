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
    const { orderID, dbOrderId } = await request.json();

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

    // Mettre a jour la commande en DB si dbOrderId est fourni
    if (dbOrderId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing', // Declenche le trigger stock
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
