import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CRON_SECRET = process.env.CRON_SECRET;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Trouver les clients dont c'est l'anniversaire aujourd'hui
    const { data: birthdayUsers, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, birth_date, loyalty_euros')
      .not('birth_date', 'is', null)
      .not('email', 'is', null);

    if (error) {
      console.error('[birthday] Error fetching profiles:', error);
      return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }

    // Filtrer par jour/mois (birth_date est au format YYYY-MM-DD)
    const todaysBirthdays = (birthdayUsers || []).filter(u => {
      if (!u.birth_date) return false;
      const bd = new Date(u.birth_date);
      return bd.getMonth() + 1 === month && bd.getDate() === day;
    });

    let credited = 0;

    for (const user of todaysBirthdays) {
      // Vérifier qu'on n'a pas déjà crédité cette année
      const year = today.getFullYear();
      const { data: existing } = await supabase
        .from('loyalty_euro_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'birthday_gift')
        .gte('created_at', `${year}-01-01`)
        .maybeSingle();

      if (existing) continue; // Déjà crédité cette année

      // Créditer 5€ sur la cagnotte
      const newBalance = (user.loyalty_euros || 0) + 5;
      await supabase
        .from('profiles')
        .update({ loyalty_euros: newBalance })
        .eq('id', user.id);

      // Enregistrer la transaction
      await supabase
        .from('loyalty_euro_transactions')
        .insert({
          user_id: user.id,
          type: 'birthday_gift',
          amount: 5.00,
          description: `Cadeau anniversaire ${year}`,
          reference_id: user.id,
        });

      // Envoyer l'email
      try {
        const { sendBirthdayEmail } = await import('@/lib/email-sender');
        await sendBirthdayEmail(
          user.email,
          user.first_name || 'Client',
          5.00
        );
      } catch (emailErr) {
        console.error('[birthday] Email error for', user.email, emailErr);
      }

      credited++;
    }

    console.info(`[birthday] ${todaysBirthdays.length} anniversaires, ${credited} credits`);

    return NextResponse.json({
      success: true,
      birthdaysFound: todaysBirthdays.length,
      credited,
    });
  } catch (error) {
    console.error('[birthday] Error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
