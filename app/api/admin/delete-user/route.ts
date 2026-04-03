import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier que le demandeur est admin
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });

    // Supprimer les données liées (ordre important pour les FK)
    await supabaseAdmin.from('loyalty_euro_transactions').delete().eq('user_id', userId);
    await supabaseAdmin.from('wallet_transactions').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_coupons').delete().eq('user_id', userId);
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
    await supabaseAdmin.from('wishlist_items').delete().eq('user_id', userId);
    await supabaseAdmin.from('customer_reviews').delete().eq('user_id', userId);
    await supabaseAdmin.from('newsletter_subscriptions').delete().eq('email',
      (await supabaseAdmin.from('profiles').select('email').eq('id', userId).maybeSingle()).data?.email || ''
    );
    await supabaseAdmin.from('open_package_orders').delete()
      .in('open_package_id',
        (await supabaseAdmin.from('open_packages').select('id').eq('user_id', userId)).data?.map(p => p.id) || []
      );
    await supabaseAdmin.from('open_packages').delete().eq('user_id', userId);
    await supabaseAdmin.from('order_items').delete()
      .in('order_id',
        (await supabaseAdmin.from('orders').select('id').eq('user_id', userId)).data?.map(o => o.id) || []
      );
    await supabaseAdmin.from('orders').delete().eq('user_id', userId);
    await supabaseAdmin.from('addresses').delete().eq('user_id', userId);
    await supabaseAdmin.from('referral_codes').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // Supprimer le compte auth Supabase (service role requis)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('[delete-user] auth.admin.deleteUser error:', authError);
      // Ne pas bloquer — le profil est déjà supprimé
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[delete-user] Exception:', e);
    return NextResponse.json({ error: e.message || 'Erreur suppression' }, { status: 500 });
  }
}
