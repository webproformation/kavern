import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Vérifier le secret du webhook (optionnel mais recommandé)
    const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get('x-vercel-signature') || request.headers.get('authorization');
      if (authHeader !== webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => ({}));

    const deploymentUrl = body.url || body.deployment?.url || 'unknown';
    const deploymentState = body.state || body.deployment?.state || body.type || 'completed';
    const gitCommit = body.deployment?.meta?.githubCommitMessage || body.meta?.githubCommitMessage || '';

    console.log(`[VERCEL-DEPLOY] Deployment ${deploymentState}: ${deploymentUrl}`);
    console.log(`[VERCEL-DEPLOY] Commit: ${gitCommit}`);

    // Enregistrer le déploiement en base
    await supabase.from('deployment_logs').insert({
      deployment_url: deploymentUrl,
      state: deploymentState,
      commit_message: gitCommit,
      payload: body,
      created_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) {
        // Table peut ne pas exister encore, on log mais on ne crash pas
        console.warn('[VERCEL-DEPLOY] Could not log to DB:', error.message);
      }
    });

    // Actions post-deploy : vider le cache, notifier, etc.
    // 1. Invalider le cache des produits / pages si besoin
    // 2. Envoyer notification admin (optionnel)
    if (deploymentState === 'ready' || deploymentState === 'completed') {
      // Notifier l'admin par email si SMTP est configuré
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kavern.vercel.app';
          await fetch(`${siteUrl}/api/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              to: process.env.ADMIN_EMAIL || 'contact@kavern-france.fr',
              subject: `[KAVERN] Déploiement réussi`,
              html: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2 style="color: #D4AF37;">Déploiement KAVERN terminé</h2>
                  <p><strong>URL:</strong> ${deploymentUrl}</p>
                  <p><strong>Commit:</strong> ${gitCommit || 'N/A'}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.warn('[VERCEL-DEPLOY] Email notification failed (non-blocking):', emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deployment webhook received: ${deploymentState}`,
      url: deploymentUrl,
    });
  } catch (error: any) {
    console.error('[VERCEL-DEPLOY] Webhook error:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

// GET pour tester que la route est accessible
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Vercel deploy webhook is active',
    timestamp: new Date().toISOString(),
  });
}
