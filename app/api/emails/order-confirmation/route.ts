import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email-sender';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // AUTH: secret interne ou Bearer token
    const authHeader = request.headers.get('authorization');
    const internalSecret = request.headers.get('x-internal-secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET && !authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orderId } = await request.json();

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
        order_items(*),
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

    // Formater les items pour l'email
    const items = (order.order_items || []).map((item: any) => ({
      image_url: item.image_url || item.product_image || null,
      product_name: item.product_name || 'Produit',
      variation_details: item.variation_data || item.variation_details || null,
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
    }));

    if (items.length === 0) {
      console.warn('⚠️ Email confirmation - AUCUN ARTICLE dans la commande', orderId);
    }

    const result = await sendOrderConfirmationEmail(
      email,
      firstName,
      order.order_number,
      items,
      Number(order.total_amount || order.total || 0),
      order.is_open_package || false
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
    console.error('Error in order confirmation email API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
