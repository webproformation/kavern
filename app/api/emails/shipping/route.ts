import { NextRequest, NextResponse } from 'next/server';
import { sendShippingEmail } from '@/lib/email-sender';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const internalSecret = request.headers.get('x-internal-secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET && !authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Support pour deux formats: trigger (to/data) ou manuel (orderId)
    if (body.to && body.data) {
      // Format trigger (appelé depuis la base de données)
      const result = await sendShippingEmail(
        body.to,
        body.data.firstName || 'Voisine',
        body.data.trackingNumber || 'Non disponible',
        body.data.trackingUrl
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to send email' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        messageId: result.messageId
      });
    }

    // Format manuel (avec orderId)
    const { orderId, trackingNumber, trackingUrl } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(email, first_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const profile = order.profiles as any;
    const email = profile?.email;
    const firstName = profile?.first_name || 'Client';

    if (!email) {
      return NextResponse.json(
        { error: 'No email found for this order' },
        { status: 400 }
      );
    }

    const result = await sendShippingEmail(
      email,
      firstName,
      trackingNumber || order.tracking_number || 'En attente',
      trackingUrl || order.tracking_url,
      order.shipping_method?.name
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId
    });
  } catch (error: any) {
    console.error('Error in shipping email API:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
