import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-here';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.replace('Bearer ', '') !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Trouver les paniers live expirés (plus de 24h)
    const { data: expiredCarts, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, user_id, product_id, quantity, variation_id')
      .eq('is_live_reservation', true)
      .lt('created_at', twentyFourHoursAgo.toISOString());

    if (fetchError) throw fetchError;
    if (!expiredCarts || expiredCarts.length === 0) {
      return NextResponse.json({ success: true, expired: 0, strikes: 0 });
    }

    // 2. Remettre le stock en place
    for (const item of expiredCarts) {
      if (item.variation_id && item.variation_id !== 'default') {
        await supabase.rpc('increment_variation_stock', {
          p_variation_id: item.variation_id,
          p_quantity: item.quantity
        }).catch(() => {
          // Fallback: mise à jour directe
          supabase.from('product_variations')
            .select('stock_quantity')
            .eq('id', item.variation_id)
            .single()
            .then(({ data }) => {
              if (data) {
                supabase.from('product_variations')
                  .update({ stock_quantity: (data.stock_quantity || 0) + item.quantity })
                  .eq('id', item.variation_id);
              }
            });
        });
      } else {
        await supabase.rpc('increment_product_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        }).catch(() => {
          supabase.from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single()
            .then(({ data }) => {
              if (data) {
                supabase.from('products')
                  .update({ stock_quantity: (data.stock_quantity || 0) + item.quantity })
                  .eq('id', item.product_id);
              }
            });
        });
      }
    }

    // 3. Supprimer les items expirés
    const expiredIds = expiredCarts.map(c => c.id);
    await supabase.from('cart_items').delete().in('id', expiredIds);

    // 4. Compter les strikes par utilisateur
    const userExpiredCounts: Record<string, number> = {};
    expiredCarts.forEach(item => {
      userExpiredCounts[item.user_id] = (userExpiredCounts[item.user_id] || 0) + 1;
    });

    // 5. Incrémenter les strikes et bloquer si >= 3
    let strikesAdded = 0;
    for (const [userId, count] of Object.entries(userExpiredCounts)) {
      // Incrémenter le compteur de strikes
      const { data: profile } = await supabase
        .from('profiles')
        .select('live_cart_strikes')
        .eq('id', userId)
        .single();

      const currentStrikes = (profile?.live_cart_strikes || 0) + 1;

      await supabase.from('profiles').update({
        live_cart_strikes: currentStrikes,
        live_cart_blocked: currentStrikes >= 3,
      }).eq('id', userId);

      strikesAdded++;
    }

    return NextResponse.json({
      success: true,
      expired: expiredCarts.length,
      strikes: strikesAdded,
    });
  } catch (error: any) {
    console.error('Error in expire-live-carts cron:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
