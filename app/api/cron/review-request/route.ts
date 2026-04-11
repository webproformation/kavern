import { NextRequest, NextResponse } from 'next/server';
import { sendReviewRequestEmail } from '@/lib/email-sender';
import { createClient } from '@/lib/supabase';

const CRON_SECRET = process.env.CRON_SECRET;

// Vercel Crons envoient GET
export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // 3-5 jours après livraison (statut "delivered" ou "shipped" depuis 4j)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(email, first_name)
      `)
      .in('status', ['delivered', 'shipped'])
      .in('payment_status', ['paid', 'completed', 'succeeded'])
      .gte('shipped_at', fiveDaysAgo.toISOString())
      .lt('shipped_at', threeDaysAgo.toISOString())
      .is('review_email_sent', false);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    const emailsSent = [];
    const errors = [];

    for (const order of orders || []) {
      const profile = order.profiles as any;
      const email = profile?.email;
      const firstName = profile?.first_name || 'Client';

      if (!email) continue;

      // Vérifier si la cliente a déjà posté un avis pour cette commande
      const { data: existingReview } = await supabase
        .from('customer_reviews')
        .select('id')
        .eq('user_id', order.user_id)
        .eq('order_id', order.id)
        .maybeSingle();

      if (existingReview) {
        // Marquer comme envoyé pour ne pas revérifier
        await supabase.from('orders').update({ review_email_sent: true }).eq('id', order.id);
        continue;
      }

      const result = await sendReviewRequestEmail(email, firstName);

      if (result.success) {
        await supabase
          .from('orders')
          .update({ review_email_sent: true })
          .eq('id', order.id);

        emailsSent.push({ orderId: order.id, email });
      } else {
        errors.push({ orderId: order.id, error: result.error });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      errors: errors.length,
      details: { emailsSent, errors }
    });
  } catch (error: any) {
    console.error('Error in review request cron:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
