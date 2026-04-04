// app/api/auth/check-birthday/route.ts
// Vérifie si c'est l'anniversaire de l'utilisateur connecté et crédite 5€ si oui

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ credited: false, reason: 'not_authenticated' });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, birth_date, loyalty_euros')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.birth_date) return NextResponse.json({ credited: false, reason: 'no_birth_date' });

    const today = new Date();
    const bd = new Date(profile.birth_date);
    const isToday = bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate();
    if (!isToday) return NextResponse.json({ credited: false, reason: 'not_birthday' });

    // Vérifier qu'on n'a pas déjà crédité cette année
    const year = today.getFullYear();
    const { data: existing } = await supabaseAdmin
      .from('loyalty_euro_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'birthday_gift')
      .gte('created_at', `${year}-01-01`)
      .maybeSingle();

    if (existing) return NextResponse.json({ credited: false, reason: 'already_credited' });

    // Créditer 5€
    const newBalance = (profile.loyalty_euros || 0) + 5;
    await supabaseAdmin.from('profiles').update({ loyalty_euros: newBalance }).eq('id', user.id);

    await supabaseAdmin.from('loyalty_euro_transactions').insert({
      user_id: user.id,
      type: 'birthday_gift',
      amount: 5.00,
      description: `Cadeau anniversaire ${year}`,
      reference_id: user.id,
    });

    // Email
    try {
      const { sendBirthdayEmail } = await import('@/lib/email-sender');
      await sendBirthdayEmail(profile.email, profile.first_name || 'Client', 5.00);
    } catch (e) {
      console.error('[birthday] email error:', e);
    }

    return NextResponse.json({ credited: true, amount: 5.00 });
  } catch (e) {
    console.error('[check-birthday]', e);
    return NextResponse.json({ credited: false, reason: 'error' });
  }
}
