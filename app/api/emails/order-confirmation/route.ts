import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email-sender';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Client service role pour bypasser RLS
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    // AUTH: secret interne ou Bearer token
    const authHeader = request.headers.get('authorization');
    const internalSecret = request.headers.get('x-internal-secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET && !authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orderId, email: emailFromBody, firstName: firstNameFromBody, orderNumber: orderNumberFromBody, items: itemsFromBody, total: totalFromBody, isOpenPackage: isOpenPackageFromBody } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const email = emailFromBody || order.user_email || null;
    const firstName = firstNameFromBody || order.shipping_first_name || 'Client';

    if (!email) {
      return NextResponse.json(
        { error: 'No email found for this order' },
        { status: 400 }
      );
    }

    // Formater les items pour l'email (priorité aux items du body s'ils existent)
    const items = itemsFromBody?.length > 0 ? itemsFromBody : (order.order_items || []).map((item: any) => ({
      image_url: item.image_url || item.product_image || null,
      product_name: item.product_name || 'Produit',
      variation_details: item.variation_data || item.variation_details || null,
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
    }));

    if (items.length === 0) {
      console.warn('⚠️ Email confirmation - AUCUN ARTICLE dans la commande', orderId);
    }

    const orderNumber = orderNumberFromBody || order.order_number;
    const total = totalFromBody ?? Number(order.total_amount || order.total || 0);
    const isOpenPackage = isOpenPackageFromBody ?? (order.is_open_package || false);

    const result = await sendOrderConfirmationEmail(
      email,
      firstName,
      orderNumber,
      items,
      total,
      isOpenPackage
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
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
