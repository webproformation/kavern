import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // SECURITY: Vérification signature HMAC Sendcloud
    const signature = req.headers.get('sendcloud-signature');
    const rawBody = await req.text();

    if (process.env.SENDCLOUD_WEBHOOK_SECRET) {
      if (!signature) {
        console.error('[Sendcloud] Webhook sans signature');
        return NextResponse.json({ error: 'Signature manquante' }, { status: 401 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', process.env.SENDCLOUD_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        console.error('[Sendcloud] Signature HMAC invalide');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    const parcel = body.parcel;
    const status = parcel?.status?.id;
    const orderNumber = parcel?.order_number;

    if (orderNumber) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          shipping_status: status,
          tracking_number: parcel.tracking_number,
          tracking_url: parcel.tracking_url
        })
        .eq('order_number', orderNumber);

      if (error) console.error('Erreur mise à jour commande via Sendcloud:', error);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Erreur Webhook Sendcloud:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Sendcloud Webhook Endpoint is active" });
}
